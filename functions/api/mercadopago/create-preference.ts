import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  MERCADOPAGO_ACCESS_TOKEN: string;
  SITE_URL: string;
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      const url = new URL(request.url);

      // ✅ só aceitar POST
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      // ✅ tentar ler o body corretamente
      let body;
      try {
        body = await request.json();
      } catch (err) {
        console.error("❌ Body inválido:", err);
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
      }

      console.log("📥 Body recebido:", JSON.stringify(body, null, 2));

      const { cart, total } = body || {};

      if (!Array.isArray(cart)) {
        console.error("❌ 'cart' ausente ou não é array:", cart);
        return new Response(JSON.stringify({ error: "'cart' ausente ou inválido" }), { status: 400 });
      }

      // ✅ Criar cliente Supabase
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

      // ✅ Criar pedido
      const order_id = uuidv4();
      await supabase.from("orders").insert({
        id: order_id,
        total,
        status: "pending",
        created_at: new Date().toISOString(),
        items: cart,
      });

      console.log("✅ Pedido criado:", order_id);

      // ✅ Criar body para Mercado Pago
      const preferenceBody = {
        items: cart.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          quantity: 1,
          unit_price: item.price,
          currency_id: "BRL",
        })),
        back_urls: {
          success: `${env.SITE_URL}/checkout/success?order_id=${order_id}`,
          failure: `${env.SITE_URL}/checkout/failure`,
          pending: `${env.SITE_URL}/checkout/pending`,
        },
        auto_return: "approved",
        external_reference: order_id,
        notification_url: `${env.SITE_URL}/api/mercadopago/webhook`,
      };

      console.log("📦 Preference body enviada ao Mercado Pago:", JSON.stringify(preferenceBody, null, 2));
      console.log("🔑 Token lido pelo Cloudflare:", env.MERCADOPAGO_ACCESS_TOKEN ? env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 20) + "..." : "⚠️ undefined");

      // ✅ Enviar para Mercado Pago
      const mpUrl = "https://api.sandbox.mercadopago.com/checkout/preferences";
      const resp = await fetch(mpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferenceBody),
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("❌ Erro do Mercado Pago:", JSON.stringify(data));
        return new Response(JSON.stringify(data), { status: resp.status });
      }

      console.log("✅ Preferência criada com sucesso:", data.init_point);

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("❌ Erro geral no create-preference:", err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  },
};
