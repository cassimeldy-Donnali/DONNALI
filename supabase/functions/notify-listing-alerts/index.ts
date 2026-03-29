import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CITY_LABELS: Record<string, string> = {
  reunion: "La Réunion",
  mayotte: "Mayotte",
  paris: "Paris",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: newListings } = await supabase
      .from("listings")
      .select("id, departure, destination, flight_date, kilos_available, price_per_kilo")
      .eq("is_active", true)
      .eq("is_published", true)
      .gte("created_at", since);

    if (!newListings || newListings.length === 0) {
      return new Response(JSON.stringify({ message: "No new listings" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: alerts } = await supabase
      .from("listing_alerts")
      .select("*, profiles:user_id(email:auth.users!inner(email))")
      .eq("is_active", true);

    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ message: "No active alerts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: users } = await supabase.auth.admin.listUsers();
    const userEmailMap: Record<string, string> = {};
    if (users?.users) {
      for (const u of users.users) {
        userEmailMap[u.id] = u.email ?? "";
      }
    }

    let notifiedCount = 0;

    for (const alert of alerts) {
      const matching = newListings.filter((l) => {
        if (alert.departure && l.departure !== alert.departure) return false;
        if (alert.destination && l.destination !== alert.destination) return false;
        if (alert.min_kilos > 0 && l.kilos_available < alert.min_kilos) return false;
        if (alert.max_price < 999 && l.price_per_kilo > alert.max_price) return false;
        if (alert.free_only && l.price_per_kilo !== 0) return false;
        return true;
      });

      if (matching.length === 0) continue;

      const email = userEmailMap[alert.user_id];
      if (!email) continue;

      const listHtml = matching
        .map(
          (l) =>
            `<li style="margin-bottom:8px;">✈️ <strong>${CITY_LABELS[l.departure] ?? l.departure} → ${CITY_LABELS[l.destination] ?? l.destination}</strong> — ${new Date(l.flight_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · ${l.kilos_available} kg · ${l.price_per_kilo === 0 ? "Gratuit" : `${l.price_per_kilo}€/kg`}</li>`
        )
        .join("");

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DONNALI <no-reply@donnali.fr>",
          to: [email],
          subject: `${matching.length} nouvelle${matching.length > 1 ? "s" : ""} annonce${matching.length > 1 ? "s" : ""} correspondent à votre alerte`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#0284c7;margin-bottom:8px;">Nouvelles annonces pour vous</h2>
              <p style="color:#64748b;margin-bottom:20px;">
                ${matching.length} annonce${matching.length > 1 ? "s correspondent" : " correspond"} à votre alerte ${alert.departure ? `${CITY_LABELS[alert.departure]} → ${CITY_LABELS[alert.destination] ?? "toutes destinations"}` : ""}.
              </p>
              <ul style="list-style:none;padding:0;margin:0;">
                ${listHtml}
              </ul>
              <div style="margin-top:24px;">
                <a href="https://donnali.fr/listings" style="background:#0284c7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                  Voir les annonces
                </a>
              </div>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
                Gérez vos alertes depuis votre tableau de bord DONNALI.
              </p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) {
        await supabase
          .from("listing_alerts")
          .update({ last_notified_at: new Date().toISOString() })
          .eq("id", alert.id);
        notifiedCount++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Notified ${notifiedCount} alert(s)` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
