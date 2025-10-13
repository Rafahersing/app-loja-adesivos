// api/mercadopago/checkout.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import mercadopago from "mercadopago";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  try {
    const { cart, total } = req.body;
    // 1) cria pedido no Supabase
    const { data: pedido, error } = await supabase
      .from("pedidos")
      .insert([{ total, status: "pending" }])
      .select()
      .single();

    if (error || !pedido) {
      console.error(error);
      return res.status(500).json({ error: "Erro criando pedido" });
    }

    // 2) insere itens com service role
    const itens = cart.map((item: any) => ({
      pedido_id: pedido.id,
      product_id: item.id,
      title: item.title,
      price: item.price,
      qty: 1,
    }));
    await supabase.from("pedido_itens").insert(itens);

    // 3) cria preferência Mercado Pago
    const preference = {
      items: cart.map((item: any) => ({
        title: item.title,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(item.price),
      })),
      external_reference: String(pedido.id),
      back_urls: {
        success: `${process.env.SITE_URL}/checkout/success`,
        failure: `${process.env.SITE_URL}/checkout/failure`,
        pending: `${process.env.SITE_URL}/checkout/pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.SITE_URL}/api/mercadopago/webhook`,
    };

    const mpResp = await mercadopago.preferences.create(preference);
    return res.status(200).json({ init_point: mpResp.body.init_point, mp: mpResp.body });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
