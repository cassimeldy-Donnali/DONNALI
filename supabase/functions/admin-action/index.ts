import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ActionType =
  | "toggle_listing_published"
  | "delete_listing"
  | "toggle_admin"
  | "suspend_user"
  | "get_stats"
  | "get_listings"
  | "get_users";

interface RequestBody {
  action: ActionType;
  listing_id?: string;
  user_id?: string;
  is_published?: boolean;
  is_admin?: boolean;
  permanent?: boolean;
  reason?: string;
  duration_days?: number | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json();
    const { action } = body;

    if (action === "get_stats") {
      const [listingsRes, usersRes, unlocksRes] = await Promise.all([
        serviceClient.from("listings").select("id, is_active"),
        serviceClient.from("profiles").select("id", { count: "exact", head: true }),
        serviceClient.from("unlocked_contacts").select("id", { count: "exact", head: true }),
      ]);

      const activeCount = listingsRes.data?.filter((l) => l.is_active).length ?? 0;
      return new Response(JSON.stringify({
        totalListings: listingsRes.data?.length ?? 0,
        activeListings: activeCount,
        totalUsers: usersRes.count ?? 0,
        totalUnlocks: unlocksRes.count ?? 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_listings") {
      const { data, error } = await serviceClient
        .from("listings")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return new Response(JSON.stringify({ listings: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_users") {
      const { data, error } = await serviceClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return new Response(JSON.stringify({ users: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "toggle_listing_published") {
      const { listing_id, is_published } = body;
      if (!listing_id || is_published === undefined) {
        return new Response(JSON.stringify({ error: "listing_id and is_published required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await serviceClient
        .from("listings")
        .update({ is_published })
        .eq("id", listing_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_listing") {
      const { listing_id } = body;
      if (!listing_id) {
        return new Response(JSON.stringify({ error: "listing_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await serviceClient
        .from("listings")
        .delete()
        .eq("id", listing_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "suspend_user") {
      const { user_id, permanent, reason, duration_days } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot suspend your own account" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const suspendedUntil = permanent
        ? null
        : duration_days
          ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const { error } = await serviceClient
        .from("profiles")
        .update({
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_until: suspendedUntil,
          suspension_reason: reason || "other",
        })
        .eq("id", user_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "toggle_admin") {
      const { user_id, is_admin } = body;
      if (!user_id || is_admin === undefined) {
        return new Response(JSON.stringify({ error: "user_id and is_admin required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot modify your own admin status" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await serviceClient
        .from("profiles")
        .update({ is_admin })
        .eq("id", user_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
