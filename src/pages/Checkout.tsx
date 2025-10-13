// src/pages/Checkout.tsx
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; // se já existir; se não, criar cliente

export default function Checkout() {
  const { cart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((s, i) => s + i.price, 0);

  async function handleCheckout() {
    setLoading(true);
    try {
      // 1) criar pedido no backend - chamar função serverless
      const resp = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, total }),
      });
      const data = await resp.json();
      if (data.init_point) {
        // redirecionar pro checkout do Mercado Pago
        window.location.href = data.init_point;
      } else {
        console.error("Erro criando preferência", data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  if (!cart.length) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2>Carrinho vazio</h2>
        <Link to="/shop">
          <Button variant="outline">Voltar à loja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Resumo</h3>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between">
                <div>{item.title}</div>
                <div>R$ {item.price.toFixed(2)}</div>
              </div>
            ))}
            <Separator className="my-3"/>
            <div className="flex justify-between font-bold">
              <div>Total</div>
              <div>R$ {total.toFixed(2)}</div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-4 sticky top-20">
            <h3 className="font-semibold mb-2">Pagar</h3>
            <Button variant="hero" size="lg" onClick={handleCheckout} disabled={loading}>
              {loading ? "Redirecionando..." : "Pagar com Mercado Pago"}
            </Button>
            <Link to="/cart">
              <Button variant="outline" className="mt-3">Voltar ao carrinho</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
