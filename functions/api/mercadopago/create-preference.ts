export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Lê o corpo da requisição (JSON)
    const body = await request.json();
    console.log("📥 Body recebido:", body);

    // Validação básica
    if (!body.items || !Array.isArray(body.items)) {
      throw new Error("Corpo inválido: 'items' é obrigatório e deve ser um array.");
    }

    // Endpoint sandbox do Mercado Pago
    const mpUrl = "https://api.sandbox.mercadopago.com/checkout/preferences";

    // Monta o corpo da requisição para o MP
    const preferenceBody = {
      items: body.items.map((item: any) => ({
        id: item.id || "item",
        title: item.title || "Produto",
        quantity: item.quantity || 1,
        unit_price: item.price || 1,
        currency_id: "BRL",
      })),
      back_urls: {
        success: "https://loja.rafaelahersing.com/checkout/success",
        failure: "https://loja.rafaelahersing.com/checkout/failure",
        pending: "https://loja.rafaelahersing.com/checkout/pending",
      },
      auto_return: "approved",
      notification_url: "https://loja.rafaelahersing.com/api/mercadopago/webhook",
    };

    console.log("📦 Enviando preferenceBody:", preferenceBody);

    // Faz o POST para o Mercado Pago
    const response = await fetch(mpUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    const data = await response.json();

    // Log do resultado
    console.log("✅ Resposta Mercado Pago:", data);

    // Trata erro de token ou requisição
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "Erro do Mercado Pago",
          details: data,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Retorna a preferência criada para o front-end
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erro geral no create-preference:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
