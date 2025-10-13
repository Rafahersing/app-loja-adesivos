// src/pages/CheckoutSuccess.tsx
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

export default function CheckoutSuccess() {
  const { search } = useLocation();
  useEffect(() => {
    // opcional: consultar backend para confirmar status usando external_reference
  }, [search]);

  return (
    <div className="container p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600">Pagamento Aprovado</h1>
      <p className="mt-2">Obrigado! Seu pedido foi confirmado. Você pode acessar seus produtos em Minha Conta.</p>
      <Link to="/minha-conta">
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">Ir para Minha Conta</button>
      </Link>
    </div>
  );
}
