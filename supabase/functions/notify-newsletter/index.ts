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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function maskName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length === 0 || !parts[0]) return "Un voyageur";
  const lastName = parts[0];
  const firstInitial = parts[1] ? parts[1][0].toUpperCase() + "." : "";
  return firstInitial ? `${lastName} ${firstInitial}` : lastName;
}

function buildNewsletterEmail(params: {
  listing: {
    id: string;
    departure: string;
    destination: string;
    flight_date: string;
    kilos_available: number;
    price_per_kilo: number;
    description: string | null;
    traveler_name: string;
    traveler_trust_score: number;
    traveler_identity_verified: boolean;
    traveler_flight_verified: boolean;
    traveler_rating_avg: number;
    traveler_rating_count: number;
  };
  unsubscribeToken: string;
  siteUrl: string;
}): string {
  const { listing, unsubscribeToken, siteUrl } = params;

  const depLabel = CITY_LABELS[listing.departure] ?? listing.departure;
  const destLabel = CITY_LABELS[listing.destination] ?? listing.destination;
  const maskedName = maskName(listing.traveler_name);
  const listingUrl = `${siteUrl}/listing/${listing.id}`;
  const unsubUrl = `${siteUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const priceLabel =
    listing.price_per_kilo === 0
      ? "Gratuit"
      : `${listing.price_per_kilo} €/kg`;

  const verifiedBadge = listing.traveler_identity_verified
    ? `<span style="display:inline-block;background-color:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;vertical-align:middle;">Identite verifiee</span>`
    : "";

  const flightBadge = listing.traveler_flight_verified
    ? `<span style="display:inline-block;background-color:#dbeafe;color:#1e40af;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;vertical-align:middle;">Vol confirme</span>`
    : "";

  const ratingHtml =
    listing.traveler_rating_count > 0
      ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">Note : ${listing.traveler_rating_avg.toFixed(1)}/5 (${listing.traveler_rating_count} avis)</p>`
      : `<p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Nouveau sur Donnali</p>`;

  const descriptionBlock = listing.description
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Ce que dit le voyageur</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;font-style:italic;">"${listing.description}"</p>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Un voyageur correspond a votre alerte – Donnali</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f7fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="background:linear-gradient(135deg,#0077B6 0%,#005a8f 100%);border-radius:16px 16px 0 0;padding:36px 40px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;">
                    <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:1.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9992; DONNALI</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:24px 0 8px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Un voyageur voyage vers ${destLabel}&nbsp;!
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;">
                Une nouvelle annonce correspond a votre alerte newsletter
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Bonne nouvelle ! Un voyageur vient de publier une annonce sur le trajet <strong style="color:#0077B6;">${depLabel} → ${destLabel}</strong> qui correspond a votre abonnement.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#e6f3fb 0%,#cce7f7 100%);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Itineraire du voyage</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${depLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Depart</p>
                        </td>
                        <td style="text-align:center;width:20%;font-size:22px;color:#0077B6;">&#8594;</td>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${destLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Arrivee</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #99cfef;">
                      <tr>
                        <td style="padding-top:14px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="text-align:center;width:50%;padding:8px 0;">
                                <p style="margin:0;font-size:13px;font-weight:700;color:#005a8f;">${formatDate(listing.flight_date)}</p>
                                <p style="margin:2px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Date du vol</p>
                              </td>
                              <td style="text-align:center;width:50%;padding:8px 0;border-left:1px solid #99cfef;">
                                <p style="margin:0;font-size:13px;font-weight:700;color:#005a8f;">${listing.kilos_available} kg disponibles</p>
                                <p style="margin:2px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Capacite</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Le voyageur</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align:top;width:44px;">
                          <div style="width:40px;height:40px;background:linear-gradient(135deg,#0077B6,#005a8f);border-radius:50%;text-align:center;line-height:40px;">
                            <span style="color:#ffffff;font-size:16px;font-weight:700;">${maskedName[0].toUpperCase()}</span>
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:top;">
                          <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">
                            ${maskedName}
                            ${verifiedBadge}
                            ${flightBadge}
                          </p>
                          ${ratingHtml}
                        </td>
                        <td style="text-align:right;vertical-align:top;">
                          <p style="margin:0;font-size:16px;font-weight:800;color:#0077B6;">${priceLabel}</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">par kilo</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${descriptionBlock}

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8e6;border-radius:12px;border-left:4px solid #f59e0b;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                      Pour voir les coordonnees completes du voyageur et le contacter, rendez-vous sur l'annonce.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center">
                    <a href="${listingUrl}" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;letter-spacing:0.5px;">
                      Voir l'annonce complete
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f8fafc;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#0077B6;letter-spacing:1px;">DONNALI</p>
              <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;line-height:1.6;">
                La plateforme de mise en relation entre voyageurs et expediteurs.<br/>
                La Reunion &bull; Mayotte &bull; Paris
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">
                Vous recevez cet email car vous etes abonne aux alertes Donnali.<br/>
                <a href="${unsubUrl}" style="color:#94a3b8;">Se desabonner</a> &mdash; &copy; 2026 Donnali
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SITE_URL = "https://donnali.re";

    const body = await req.json().catch(() => ({}));
    const { listing_id } = body;

    if (!listing_id) {
      return new Response(
        JSON.stringify({ error: "listing_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: listing } = await supabase
      .from("listings")
      .select("id, departure, destination, flight_date, kilos_available, price_per_kilo, description, user_id")
      .eq("id", listing_id)
      .eq("is_active", true)
      .eq("is_published", true)
      .maybeSingle();

    if (!listing) {
      return new Response(
        JSON.stringify({ error: "Listing not found or not published" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: travelerProfile } = await supabase
      .from("profiles")
      .select("full_name, identity_verified, flight_verified, trust_score, rating_avg, rating_count")
      .eq("id", listing.user_id)
      .maybeSingle();

    const { data: subscribers } = await supabase
      .from("newsletter_subscriptions")
      .select("email, unsubscribe_token, departure")
      .eq("destination", listing.destination)
      .eq("confirmed", true);

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers for this route", notified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const matchingSubscribers = subscribers.filter((s) => {
      if (s.departure && s.departure !== listing.departure) return false;
      return true;
    });

    if (matchingSubscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching subscribers", notified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const enrichedListing = {
      ...listing,
      traveler_name: travelerProfile?.full_name ?? "Voyageur Donnali",
      traveler_trust_score: travelerProfile?.trust_score ?? 0,
      traveler_identity_verified: travelerProfile?.identity_verified ?? false,
      traveler_flight_verified: travelerProfile?.flight_verified ?? false,
      traveler_rating_avg: travelerProfile?.rating_avg ?? 0,
      traveler_rating_count: travelerProfile?.rating_count ?? 0,
    };

    let notified = 0;

    for (const sub of matchingSubscribers) {
      if (!RESEND_API_KEY) {
        notified++;
        continue;
      }

      const html = buildNewsletterEmail({
        listing: enrichedListing,
        unsubscribeToken: sub.unsubscribe_token,
        siteUrl: SITE_URL,
      });

      const depLabel = CITY_LABELS[listing.departure] ?? listing.departure;
      const destLabel = CITY_LABELS[listing.destination] ?? listing.destination;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Donnali <noreply@donnali.re>",
          to: [sub.email],
          subject: `Nouveau voyageur ${depLabel} → ${destLabel} – Donnali`,
          html,
        }),
      });

      if (res.ok) notified++;
    }

    return new Response(
      JSON.stringify({ message: `Notified ${notified} subscriber(s)`, notified }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
