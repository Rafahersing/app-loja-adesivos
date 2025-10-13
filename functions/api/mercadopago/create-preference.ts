import { createClient } from '@supabase/supabase-js';

interface Env {
  MERCADOPAGO_ACCESS_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SITE_URL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as {
      userId: string;
      items: Array<{
        id: string;
        title: string;
        quantity: number;
        unit_price: number;
      }>;
    };

    // Validar dados de entrada
    if (!body.userId || !body.items || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Dados inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Criar cliente Supabase com service key para escrita segura
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Calcular total
    const total = body.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // Criar pedido no Supabase
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        user_id: body.userId,
        total_amount: total,
        status: 'pending',
      })
      .select()
      .single();

    if (pedidoError || !pedido) {
      console.error('Erro ao criar pedido:', pedidoError);
      return new Response(JSON.stringify({ error: 'Erro ao criar pedido' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Criar itens do pedido
    const pedidoItens = body.items.map(item => ({
      pedido_id: pedido.id,
      product_id: item.id,
      product_name: item.title,
      quantity: item.quantity,
      price: item.unit_price,
    }));

    const { error: itensError } = await supabase
      .from('pedido_itens')
      .insert(pedidoItens);

    if (itensError) {
      console.error('Erro ao criar itens do pedido:', itensError);
      return new Response(JSON.stringify({ error: 'Erro ao criar itens do pedido' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Criar preferência no Mercado Pago
    const preference = {
      items: body.items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'BRL',
      })),
      back_urls: {
        success: `${env.SITE_URL}/checkout/success?order_id=${pedido.id}`,
        failure: `${env.SITE_URL}/checkout/failure`,
        pending: `${env.SITE_URL}/checkout/pending`,
      },
      auto_return: 'approved',
      external_reference: pedido.id,
      notification_url: `${env.SITE_URL}/api/mercadopago/webhook`,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Erro ao criar preferência no Mercado Pago:', errorText);
      return new Response(JSON.stringify({ error: 'Erro ao criar preferência de pagamento' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mpData = await mpResponse.json() as { init_point: string; id: string };

    // Atualizar pedido com payment_id
    await supabase
      .from('pedidos')
      .update({ payment_id: mpData.id })
      .eq('id', pedido.id);

    return new Response(JSON.stringify({
      orderId: pedido.id,
      initPoint: mpData.init_point,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no endpoint create-preference:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

