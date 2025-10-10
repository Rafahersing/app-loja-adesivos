import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    setSearchParams(params);
  };

  const filteredProducts = useMemo(() => {
    let filtered = MOCK_PRODUCTS;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId);
    toast.success(
      isFavorite(productId)
        ? "Removido dos favoritos"
        : "Adicionado aos favoritos!"
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Explorar Imagens</h1>
        <p className="text-muted-foreground">
          {searchQuery
            ? `Resultados para "${searchQuery}"`
            : "Encontre a imagem perfeita para seu projeto"}
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Categorias
        </h2>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">
            Nenhum produto encontrado
          </p>
          <Link
            to="/shop"
            className="text-primary hover:underline"
            onClick={() => setSearchParams({})}
          >
            Ver todos os produtos
          </Link>
        </div>
      )}
    </div>
  );
};

export default Shop;
