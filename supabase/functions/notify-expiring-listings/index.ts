import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const { data: expiringListings, error } = await adminClient
      .from("listings")
      .select(`
        id, user_id, departure, destination, flight_date, expires_at,
        profiles!inner(full_name)
      `)
      .eq("is_active", true)
      .eq("is_published", true)
      .eq("expiry_notified", false)
      .gte("expires_at", now.toISOString())
      .lte("expires_at", in48h.toISOString());

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!expiringListings || expiringListings.length === 0) {
      return new Response(JSON.stringify({ message: "No expiring listings", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const notified: string[] = [];

    for (const listing of expiringListings) {
      const { data: authUser } = await adminClient.auth.admin.getUserById(listing.user_id);
      const email = authUser?.user?.email;
      if (!email) continue;

      const cityLabels: Record<string, string> = {
        reunion: "La Reunion",
        mayotte: "Mayotte",
        paris: "Paris",
      };

      const departure = cityLabels[listing.departure] ?? listing.departure;
      const destination = cityLabels[listing.destination] ?? listing.destination;
      const flightDate = new Date(listing.flight_date).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
      });
      const expiresAt = new Date(listing.expires_at).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      });

      const { error: emailError } = await adminClient.auth.admin.sendRawNotificationEmail(
        email,
        {
          subject: `Votre annonce Donnali expire bientot`,
          body: `Bonjour ${listing.profiles?.full_name || ""},\n\nVotre annonce de voyage ${departure} → ${destination} du ${flightDate} expire le ${expiresAt}.\n\nConnectez-vous a Donnali pour la renouveler avant qu'elle soit retiree automatiquement.\n\nhttps://donnali.fr\n\nL'equipe Donnali`,
        }
      );

      if (!emailError) {
        await adminClient
          .from("listings")
          .update({ expiry_notified: true })
          .eq("id", listing.id);
        notified.push(listing.id);
      }
    }

    return new Response(
      JSON.stringify({ message: `Notified ${notified.length} listings`, notified }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
