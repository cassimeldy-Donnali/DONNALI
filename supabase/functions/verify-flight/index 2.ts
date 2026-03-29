import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { flight_number, flight_date, departure_airport, arrival_airport } = body as {
      flight_number: string;
      flight_date: string;
      departure_airport?: string;
      arrival_airport?: string;
    };

    if (!flight_number || !flight_date) {
      return new Response(
        JSON.stringify({ error: "flight_number et flight_date sont requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const flightCode = flight_number.replace(/\s/g, "").toUpperCase();

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existingVerif } = await serviceClient
      .from("flight_verifications")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("flight_number", flightCode)
      .eq("flight_date", flight_date)
      .maybeSingle();

    if (existingVerif) {
      return new Response(
        JSON.stringify({
          status: existingVerif.status,
          verification_id: existingVerif.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: verif, error: insertError } = await serviceClient
      .from("flight_verifications")
      .insert({
        user_id: user.id,
        flight_number: flightCode,
        flight_date,
        departure_airport: departure_airport?.toUpperCase() ?? null,
        arrival_airport: arrival_airport?.toUpperCase() ?? null,
        airline_name: null,
        status: "manual_review",
        aviationstack_response: null,
        failure_reason: null,
        verified_at: null,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Database error", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: "manual_review",
        verification_id: verif.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
