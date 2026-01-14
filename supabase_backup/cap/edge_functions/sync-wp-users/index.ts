// supabase/functions/sync-wp-user/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // =========================
        // Init Supabase client
        // =========================
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // =========================
        // Parse body (WP user JSON)
        // =========================
        const body = await req.json();
        const userId = body.id ?? body.user?.id;
        if (!userId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Missing user id",
                    received_body: body
                }),
                { status: 400 }
            );
        }


        // =========================
        // Build payload đúng schema
        // =========================
        const payload = {
            id: userId,
            username: body.username ?? body.user?.username,
            name: body.name ?? body.user?.name,
            first_name: body.first_name ?? body.user?.first_name,
            last_name: body.last_name ?? body.user?.last_name,
            nickname: body.nickname ?? body.user?.nickname,
            slug: body.slug ?? body.user?.slug,
            email: body.email ?? body.user?.email,
            url: body.url ?? "",
            description: body.description ?? "",
            link: body.link ?? "",
            locale: body.locale ?? "vi",

            roles: body.roles ?? body.user?.roles ?? [],
            capabilities: body.capabilities ?? body.user?.capabilities ?? {},
            extra_capabilities: body.extra_capabilities ?? {},
            is_super_admin: body.is_super_admin ?? false,

            registered_date: body.registered_date ?? body.user?.registered_date,

            avatar_urls: body.avatar_urls ?? {},
            meta: body.meta ?? {},
            woocommerce_meta: body.woocommerce_meta ?? {},

            elementor_introduction: body.elementor_introduction ?? "",
            links: body._links ?? {},

            updated_at: new Date().toISOString()
        };

        // =========================
        // UPSERT vào user_wp
        // =========================
        const { data, error } = await supabase
            .from("user_wp")
            .upsert(payload, { onConflict: "id" })
            .select()
            .single();

        if (error) {
            console.error(error);
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ success: false, error: String(err) }),
            { status: 500 }
        );
    }
});
