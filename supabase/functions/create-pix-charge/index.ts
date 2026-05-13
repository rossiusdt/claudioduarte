import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BLACKOUT_PUBLIC_KEY = Deno.env.get("BLACKOUT_PUBLIC_KEY") ?? "pk_P3mpJGyvkHAtVPRMAkWfH9TTy0XFsqSa4YiN51WeGdBlBSeE";
const BLACKOUT_SECRET_KEY = Deno.env.get("BLACKOUT_SECRET_KEY") ?? "sk_nb_1p1bIJLZ1R5wY1pqmSBUVdel0lup3C7RkU28JsDoEC1Kl";
const BLACKOUT_BASE = "https://api.blackpayments.pro/v1/transactions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function basicAuth() {
  return "Basic " + btoa(`${BLACKOUT_PUBLIC_KEY}:${BLACKOUT_SECRET_KEY}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const res = await fetch(BLACKOUT_BASE, {
      method: "POST",
      headers: {
        "Authorization": basicAuth(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let data: unknown;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log("Blackout response", res.status, JSON.stringify(data).slice(0, 2000));

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { detail: err instanceof Error ? err.message : "Internal error" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
