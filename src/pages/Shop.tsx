import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react"; // Adicionamos 'useEffect'
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { fetchCategories, fetchProducts } from "@/lib/utils"; // ⭐️ Importação das novas funções
import { Product, Category } from "@/types/product"; // ⭐️ Importação das tipagens (Próximo passo)
import { Skeleton } from "@/components/ui/skeleton"; // Se você tiver o componente Skeleton

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  // ⭐️ Novo estado para armazenar dados reais do Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, toggleFavorite, isFavorite } = useStore();

  // --------------------------------------------------
  // ⭐️ Lógica de Carregamento de Dados (useEffect)
  // --------------------------------------------------
  useEffect(() => {
    async function loadShopData() {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedCategories, fetchedProducts] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);

        // Assumindo que o Supabase retorna um array com a estrutura Product[] e Category[]
        setCategories(fetchedCategories as Category[]);
        setProducts(fetchedProducts as Product[]);

      } catch (err) {
        console.error("Erro ao carregar dados da loja:", err);
        setError('Não foi possível carregar os produtos. Verifique sua conexão ou as permissões do Supabase (RLS).');
      } finally {
        setIsLoading(false);
      }
    }

    loadShopData();
  }, []); // Executa apenas na montagem inicial do componente
  // --------------------------------------------------


  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    setSearchParams(params);
  };

  // ⭐️ Atualiza o useMemo para usar 'products' em vez de MOCK_PRODUCTS
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      // Filtrar por ID da categoria. O "category" em useSearchParams é o ID da categoria
      filtered = filtered.filter((p) => p.category_id.toString() === selectedCategory); 
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.nome.toLowerCase().includes(searchQuery.toLowerCase()) // ⭐️ Usa 'nome' em vez de 'title'
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]); // Depende do estado 'products'

  const handleAddToCart = (product: Product) => { // ⭐️ Tipagem ajustada para Product
    addToCart(product);
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleToggleFavorite = (productId: number) => { // ⭐️ Tipagem ajustada para number (assumindo id é number)
    toggleFavorite(productId.toString()); // Mantém a função de store, mas converte para string se o store usar string
    toast.success(
      isFavorite(productId.toString())
        ? "Removido dos favoritos"
        : "Adicionado aos favoritos!"
    );
  };

  // --------------------------------------------------
  // Condições de exibição
  // --------------------------------------------------
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h2>Erro ao carregar dados</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Use um loading mais sofisticado se o componente Skeleton estiver disponível
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Explorar Imagens</h1>
        <div className="flex gap-8">
          {/* Skeleton para o filtro de categoria */}
          <div className="w-full md:w-1/4">
            <Skeleton className="h-40 w-full" />
          </div>
          {/* Skeleton para os cards de produto */}
          <div className="w-full md:w-3/4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }
  // --------------------------------------------------


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
        {/* ⭐️ Passamos a lista de categorias e o handler para o CategoryFilter */}
        <CategoryFilter
          categories={categories} // ⭐️ Novo prop
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
              onAddToCart={() => handleAddToCart(product)}
              onToggleFavorite={() => handleToggleFavorite(product.id)}
              isFavorite={isFavorite(product.id.toString())} // ⭐️ Converte id para string
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
