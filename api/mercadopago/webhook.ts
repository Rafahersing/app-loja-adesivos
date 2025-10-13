
import { VercelRequest, VercelResponse } from '@vercel/node';
import mercadopago from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Inicializa o Mercado Pago SDK
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN!,
});

// Inicializa o Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'POST') {
    try {
      const { id, topic } = req.query;

      if (topic === 'payment') {
        const payment = await mercadopago.payment.findById(Number(id));
        const paymentStatus = payment.body.status;
        const externalReference = payment.body.external_reference; // userId
        const items = payment.body.additional_info.items; // Itens da compra

        // Atualiza o status do pedido no Supabase
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .update({ status: paymentStatus })
          .eq('user_id', externalReference) // Assumindo que external_reference é o user_id
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (orderError) {
          console.error('Erro ao atualizar pedido no Supabase:', orderError);
          return res.status(500).json({ error: orderError.message });
        }

        // Atualiza o estoque dos produtos
        for (const item of items) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (productError) {
            console.error('Erro ao buscar produto no Supabase:', productError);
            continue;
          }

          const newStock = productData.stock - item.quantity;
          const { error: updateStockError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.id);

          if (updateStockError) {
            console.error('Erro ao atualizar estoque no Supabase:', updateStockError);
          }
        }

        res.status(200).send('Webhook recebido e processado');
      }
    } catch (error: any) {
      console.error('Erro no webhook do Mercado Pago:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

