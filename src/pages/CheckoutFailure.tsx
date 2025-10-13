// src/pages/CheckoutFailure.tsx
import { Link } from "react-router-dom";
export default function CheckoutFailure() {
  return (
    <div className="container p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Pagamento não aprovado</h1>
      <p className="mt-2">Ocorreu um problema no pagamento. Tente novamente.</p>
      <Link to="/cart">
        <button className="mt-4 px-6 py-2 bg-gray-200 rounded">Voltar ao Carrinho</button>
      </Link>
    </div>
  );
}
