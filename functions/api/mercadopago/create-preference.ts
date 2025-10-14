import { createClient } from '@supabase/supabase-js';

interface Env {
  MERCADOPAGO_ACCESS_TOKEN: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SITE_URL: string;
  VITE_PUBLIC_SUPABASE_URL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // 🔹 Log das variáveis principais (sem mostrar chaves sensíveis)
    console.log("🔹 Iniciando create-preference");
    console.log("SITE_URL:", env.SITE_URL);
    console.log("SUPABASE URL:", env.VITE_PUBLIC_SUPABASE_URL);
    console.log("🔑 MERCADOPAGO_ACCESS_TOKEN no ambiente:", !!process.env.MERCADOPAGO_ACCESS_TOKEN);


    const body = await request.json() as {
      userId?: string;
      items?: Array<{
        id: string;
        title: string;
        quantity: number;
        unit_price: number;
      }>;
    };

    if (!body.items || body.items.length === 0) {
      console.error("❌ Nenhum item recebido no body:", body);
      return new Response(JSON.stringify({ error: "Nenhum item no pedido." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Criar cliente Supabase
    const supabase = createClient(env.VITE_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const total = body.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    console.log("🧾 Total calculado:", total);

    // Criar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        user_id: body.userId ?? null,
        total_amount: total,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pedidoError || !pedido) {
      console.error("❌ Erro ao criar pedido no Supabase:", pedidoError);
      return new Response(JSON.stringify({ error: "Erro ao criar pedido no banco." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("✅ Pedido criado:", pedido.id);

    // Criar estrutura de preferência
    const preference = {
      items: body.items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: "BRL",
      })),
      back_urls: {
        success: `${env.SITE_URL}/checkout/success?order_id=${pedido.id}`,
        failure: `${env.SITE_URL}/checkout/failure`,
        pending: `${env.SITE_URL}/checkout/pending`,
      },
      auto_return: "approved",
      external_reference: pedido.id,
      notification_url: `${env.SITE_URL}/api/mercadopago/webhook`,
    };

    console.log("📦 Preference body enviada ao Mercado Pago:", JSON.stringify(preference, null, 2));

    // Criar preferência no Mercado Pago
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const text = await mpResponse.text();

    if (!mpResponse.ok) {
      console.error("❌ Erro do Mercado Pago:", text);
      return new Response(JSON.stringify({ error: "Erro ao criar preferência de pagamento", details: text }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mpData = JSON.parse(text) as { init_point: string; id: string };
    console.log("✅ Preferência criada com sucesso:", mpData.id);

    // Atualizar pedido com ID de pagamento
    const { error: updateError } = await supabase
      .from("pedidos")
      .update({ payment_id: mpData.id })
      .eq("id", pedido.id);

    if (updateError) {
      console.error("⚠️ Erro ao atualizar pedido com payment_id:", updateError);
    }

    return new Response(JSON.stringify({
      orderId: pedido.id,
      init_point: mpData.init_point,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("💥 Erro inesperado em create-preference:", error);
    return new Response(JSON.stringify({ error: "Erro interno no servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
