import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { toast } from "sonner";
import { ProductCard } from "@/components/shop/ProductCard";

const Favorites = () => {
  const { favorites, toggleFavorite, isFavorite, addToCart } = useStore();

  const favoriteProducts = MOCK_PRODUCTS.filter((product) =>
    favorites.includes(product.id)
  );

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId);
    toast.success("Removido dos favoritos");
  };

  if (favoriteProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-md text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Nenhum Favorito</h1>
          <p className="text-muted-foreground mb-6">
            Você ainda não adicionou nenhum produto aos favoritos.
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/shop">Explorar Produtos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Meus Favoritos</h1>
        <p className="text-muted-foreground">
          {favoriteProducts.length}{" "}
          {favoriteProducts.length === 1 ? "item" : "itens"} salvos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {favoriteProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
