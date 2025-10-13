// api/mercadopago/webhook.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import mercadopago from "mercadopago";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

mercadopago.configure({ access_token: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const body = req.body;
    // MP envia { action, data: { id } } for payments notifications
    const paymentId = body.data?.id;
    if (!paymentId) {
      return res.status(200).send("no id");
    }

    // buscar payment no MP
    const payment = await mercadopago.payment.findById(paymentId);
    const status = payment.body.status;
    const externalReference = payment.body.external_reference; // pedido.id

    if (externalReference) {
      // atualizar pedido no Supabase
      await supabase
        .from("pedidos")
        .update({
          status: status === "approved" ? "paid" : status,
        })
        .eq("id", externalReference);

      // opcional: marcar itens como liberados, enviar email, etc.
    }

    return res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    return res.status(500).send("error");
  }
}
