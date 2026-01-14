import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = (origin: string) => ({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-id",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
});

function calcCost(kind: "image" | "video", params: any) {
    // MVP: cost cố định
    return kind === "image" ? 1 : 20;
}

Deno.serve(async (req) => {
    const origin = req.headers.get("origin") ?? "";
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });

    const appId = req.headers.get("x-app-id") ?? "";
    if (!appId) return new Response(JSON.stringify({ error: "missing_app_id" }), { status: 400 });

    const body = await req.json().catch(() => ({}));
    const kind = (body.kind ?? "image") as "image" | "video";
    const prompt = (body.prompt ?? "").toString();
    const requestId = (body.request_id ?? crypto.randomUUID()).toString(); // idempotency

    if (!prompt) return new Response(JSON.stringify({ error: "missing_prompt" }), { status: 400, headers: corsHeaders(origin) });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // verify user from JWT
    const supaAuth = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: { user }, error: userErr } = await supaAuth.auth.getUser();
    if (userErr || !user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders(origin) });

    const supa = createClient(supabaseUrl, serviceKey);

    const { data: app, error: appErr } = await supa
        .from("apps")
        .select("allowed_origins,is_active")
        .eq("app_id", appId)
        .single();

    if (appErr || !app?.is_active) return new Response(JSON.stringify({ error: "app_not_allowed" }), { status: 403, headers: corsHeaders(origin) });
    const allowed = (app.allowed_origins ?? []) as string[];
    if (!allowed.includes(origin)) return new Response(JSON.stringify({ error: "origin_not_allowed" }), { status: 403, headers: corsHeaders(origin) });

    const cost = calcCost(kind, body);

    // atomic debit via RPC
    const { data: debitRes, error: debitErr } = await supa.rpc("debit_credit", {
        p_app_id: appId,
        p_user_id: user.id,
        p_cost: cost,
        p_request_id: requestId,
        p_reason: `generate_${kind}`,
        p_meta: { prompt_len: prompt.length },
    });

    if (debitErr) return new Response(JSON.stringify({ error: "debit_failed", detail: debitErr.message }), { status: 500, headers: corsHeaders(origin) });

    const row = Array.isArray(debitRes) ? debitRes[0] : debitRes;
    if (!row?.ok) {
        return new Response(JSON.stringify({ error: row?.message ?? "insufficient_credit", balance: row?.new_balance ?? null }), {
            status: 402,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
        });
    }

    // MVP: tạo job (sau này worker xử lý gọi AI provider)
    const { data: job, error: jobErr } = await supa
        .from("jobs")
        .insert({
            app_id: appId,
            user_id: user.id,
            kind,
            status: "queued",
            input: { prompt, ...body },
        })
        .select("id,status")
        .single();

    if (jobErr) return new Response(JSON.stringify({ error: "job_create_failed", balance: row.new_balance }), { status: 500, headers: corsHeaders(origin) });

    return new Response(JSON.stringify({
        job_id: job.id,
        status: job.status,
        cost,
        balance: row.new_balance,
        request_id: requestId,
    }), {
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
});
