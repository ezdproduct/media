import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = (origin: string) => ({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-id",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
});

Deno.serve(async (req) => {
    const origin = req.headers.get("origin") ?? "";
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });

    const appId = req.headers.get("x-app-id") ?? "";
    if (!appId) return new Response(JSON.stringify({ error: "missing_app_id" }), { status: 400 });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // client để verify user từ JWT (anon key)
    const supaAuth = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: { user }, error: userErr } = await supaAuth.auth.getUser();
    if (userErr || !user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders(origin) });

    // service client (bypass RLS) để đọc apps + wallets
    const supa = createClient(supabaseUrl, serviceKey);

    const { data: app, error: appErr } = await supa
        .from("apps")
        .select("allowed_origins,is_active")
        .eq("app_id", appId)
        .single();

    if (appErr || !app?.is_active) return new Response(JSON.stringify({ error: "app_not_allowed" }), { status: 403, headers: corsHeaders(origin) });
    const allowed = (app.allowed_origins ?? []) as string[];
    if (!allowed.includes(origin)) return new Response(JSON.stringify({ error: "origin_not_allowed" }), { status: 403, headers: corsHeaders(origin) });

    const { data: wallet } = await supa
        .from("wallets")
        .select("balance")
        .eq("app_id", appId)
        .eq("user_id", user.id)
        .maybeSingle();

    const balance = wallet?.balance ?? 0;

    return new Response(JSON.stringify({ balance }), {
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
});
