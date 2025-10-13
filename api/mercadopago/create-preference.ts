
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
      const { items, payerEmail, userId } = req.body;

      // Cria um array de itens para a preferência do Mercado Pago
      const preferenceItems = items.map((item: any) => ({
        title: item.name,
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
        currency_id: 'BRL',
      }));

      const preference = {
        items: preferenceItems,
        payer: {
          email: payerEmail,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`,
        },
        auto_return: 'approved',
        external_reference: userId, // Pode ser usado para identificar o usuário ou pedido
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
      };

      const response = await mercadopago.preferences.create(preference);
      res.status(200).json({ preferenceId: response.body.id });
    } catch (error: any) {
      console.error('Erro ao criar preferência do Mercado Pago:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

