import { createClient } from '@supabase/supabase-js';

interface Env {
  MERCADOPAGO_ACCESS_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as {
      action?: string;
      data?: {
        id?: string;
      };
      type?: string;
    };

    console.log('Webhook recebido:', JSON.stringify(body));

    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment' || !body.data?.id) {
      return new Response(JSON.stringify({ message: 'Notificação ignorada' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const paymentId = body.data.id;

    // Buscar informações do pagamento no Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok) {
      console.error('Erro ao buscar pagamento no Mercado Pago');
      return new Response(JSON.stringify({ error: 'Erro ao buscar pagamento' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payment = await mpResponse.json() as {
      status: string;
      external_reference?: string;
      id: string;
    };

    console.log('Pagamento encontrado:', JSON.stringify(payment));

    // Mapear status do Mercado Pago para status do pedido
    let orderStatus = 'pending';
    if (payment.status === 'approved') {
      orderStatus = 'paid';
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      orderStatus = 'cancelled';
    }

    // Criar cliente Supabase com service key
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Atualizar status do pedido no Supabase
    if (payment.external_reference) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({
          status: orderStatus,
          payment_id: payment.id.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.external_reference);

      if (updateError) {
        console.error('Erro ao atualizar pedido:', updateError);
        return new Response(JSON.stringify({ error: 'Erro ao atualizar pedido' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log(`Pedido ${payment.external_reference} atualizado para status: ${orderStatus}`);
    }

    return new Response(JSON.stringify({ message: 'Webhook processado com sucesso' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

