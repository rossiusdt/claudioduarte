import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BUCKPAY_TOKEN = Deno.env.get("BUCKPAY_TOKEN") ?? "sk_live_e2498402a1af2f57d815583f2ae52175";
const BUCKPAY_USER_AGENT = Deno.env.get("BUCKPAY_USER_AGENT") ?? "Buckpay API";
const BUCKPAY_BASE = "https://api.realtechdev.com.br";

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
    const body = await req.json();

    const res = await fetch(`${BUCKPAY_BASE}/v1/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BUCKPAY_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": BUCKPAY_USER_AGENT,
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

    console.log("BuckPay response", res.status, JSON.stringify(data).slice(0, 2000));

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
