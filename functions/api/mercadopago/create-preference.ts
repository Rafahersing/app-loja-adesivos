import { v4 as uuidv4 } from "uuid";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    console.log("🧾 Requisição recebida em create-preference:", body);

    const orderId = uuidv4();

    console.log("✅ Pedido criado:", orderId);

    const preferenceBody = {
      items: body.cart.map(item => ({
        id: item.id.toString(),
        title: item.title,
        quantity: 1,
        unit_price: item.price,
        currency_id: "BRL",
      })),
      back_urls: {
        success: `${env.SITE_URL}/checkout/success?order_id=${orderId}`,
        failure: `${env.SITE_URL}/checkout/failure`,
        pending: `${env.SITE_URL}/checkout/pending`,
      },
      auto_return: "approved",
      external_reference: orderId,
      notification_url: `${env.SITE_URL}/api/mercadopago/webhook`,
    };

   console.log("📦 Preference body enviada ao Mercado Pago:", JSON.stringify(preferenceBody, null, 2));
console.log("🔑 Token lido pelo Cloudflare:", env.MERCADOPAGO_ACCESS_TOKEN ? env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 20) + "..." : "⚠️ undefined");

    const mpUrl = "https://api.sandbox.mercadopago.com/checkout/preferences"; // 👈 sandbox endpoint

    const mpResp = await fetch(mpUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    const data = await mpResp.json();

    if (!mpResp.ok) {
      console.error("❌ Erro do Mercado Pago:", data);
      return new Response(JSON.stringify({ error: data }), { status: 400 });
    }

    console.log("✅ Preferência criada com sucesso:", data.init_point);

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Erro geral no create-preference:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
