// src/pages/Checkout.tsx
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/utils"; // conexão com Supabase

export default function Checkout() {
  const { cart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  async function handleCheckout() {
    setLoading(true);

    try {
      // Verifica se o usuário está logado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Você precisa estar logado para finalizar a compra.");
        navigate("/login");
        return;
      }

      // Monta os itens no formato esperado pelo backend
      const items = cart.map((item) => ({
        id: item.id.toString(),
        title: item.title,
        quantity: item.quantity || 1,
        unit_price: item.price,
      }));

      // Chama a função serverless hospedada no Cloudflare
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro ao criar preferência:", data);
        alert("Erro ao criar preferência de pagamento. Tente novamente.");
        setLoading(false);
        return;
      }

      if (data.initPoint) {
        // Redireciona para o checkout do Mercado Pago
        window.location.href = data.initPoint;
      } else {
        console.error("Resposta inesperada:", data);
        alert("Erro ao iniciar o pagamento. Tente novamente.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  if (!cart.length) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Carrinho vazio</h2>
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
        {/* Resumo */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Resumo</h3>

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between py-1">
                <div>
                  {item.title} {item.quantity > 1 ? `x${item.quantity}` : ""}
                </div>
                <div>R$ {(item.price * (item.quantity || 1)).toFixed(2)}</div>
              </div>
            ))}

            <Separator className="my-3" />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </Card>
        </div>

        {/* Pagamento */}
        <div>
          <Card className="p-4 sticky top-20 space-y-3">
            <h3 className="font-semibold">Pagar</h3>

            <Button
              variant="hero"
              size="lg"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Redirecionando..." : "Pagar com Mercado Pago"}
            </Button>

            <Link to="/cart">
              <Button variant="outline" className="w-full">
                Voltar ao carrinho
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
