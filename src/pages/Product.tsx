import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Produto não encontrado</h1>
        <Button onClick={() => navigate("/shop")}>Voltar para a loja</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    toast.success(
      isFavorite(product.id)
        ? "Removido dos favoritos"
        : "Adicionado aos favoritos!"
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/shop")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para a loja
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
          {/* Watermark */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="text-6xl font-bold text-white/10 rotate-[-45deg] select-none">
              PIXELSTORE
            </div>
          </div>
          
          <img
            src={product.imageUrlHighRes}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="secondary" className="text-sm">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold">{product.title}</h1>
            <p className="text-xl text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="border-t border-b py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                R$ {product.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Especificações:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Resolução: 1920x1920 pixels
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Formato: PNG com transparência
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Download ilimitado após a compra
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Uso comercial permitido
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="hero"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleToggleFavorite}
              className={isFavorite(product.id) ? "text-red-500 border-red-500" : ""}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite(product.id) ? "fill-current" : ""
                }`}
              />
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Download Instantâneo</p>
                <p className="text-sm text-muted-foreground">
                  Após a compra, você poderá baixar a imagem em alta resolução
                  imediatamente na sua área de pedidos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
