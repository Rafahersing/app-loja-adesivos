// src/pages/Shop.tsx

import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { fetchCategories, fetchProducts } from "@/lib/utils";
import { Product, Category } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    // Assume que o parâmetro é o UUID da categoria
    const selectedCategory = searchParams.get("category") || "all";
    const searchQuery = searchParams.get("search") || "";

    // Estado para armazenar dados reais do Supabase
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { addToCart, toggleFavorite, isFavorite } = useStore();

    // --------------------------------------------------
    // Lógica de Carregamento de Dados (useEffect)
    // --------------------------------------------------
    useEffect(() => {
        async function loadShopData() {
            setIsLoading(true);
            setError(null);
            try {
                // As funções de fetch agora retornam a tipagem correta
                const [fetchedCategories, fetchedProducts] = await Promise.all([
                    fetchCategories(),
                    fetchProducts()
                ]);

                // Mapeamento de categorias para garantir o campo 'slug' (se não vier do banco)
                const mappedCategories: Category[] = (fetchedCategories as any[]).map(cat => ({
                    id: cat.id,
                    name: cat.nome,
                    slug: cat.slug || cat.nome.toLowerCase().replace(/\s/g, '-'), // Use slugify se precisar
                }));


                setCategories(mappedCategories);
                setProducts(fetchedProducts as Product[]);

            } catch (err) {
                console.error("Erro ao carregar dados da loja:", err);
                // O erro agora é capturado no fetchProducts e propagado com throw
                setError('Não foi possível carregar os produtos. Verifique sua conexão ou as permissões do Supabase (RLS).');
            } finally {
                setIsLoading(false);
            }
        }

        loadShopData();
    }, []);
    // --------------------------------------------------


    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category === "all") {
            params.delete("category");
        } else {
            // O parâmetro da URL será o UUID da categoria
            params.set("category", category); 
        }
        setSearchParams(params);
    };

    // Lógica de Filtragem Corrigida: Usa category_id do produto
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Filter by category: Usa o novo campo 'category_id'
        if (selectedCategory !== "all") {
            // O selectedCategory é o UUID. Filtra o produto que tem o mesmo UUID
            filtered = filtered.filter((p) => p.category_id === selectedCategory);
        }

        // Filter by search query: Usa 'title' (da interface Product)
        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [products, selectedCategory, searchQuery]);


    const handleAddToCart = (product: Product) => {
        addToCart(product);
        toast.success(`${product.title} adicionado ao carrinho!`);
    };

    // Função de favorito ajustada para usar a string UUID diretamente
    const handleToggleFavorite = (productId: string) => {
        toggleFavorite(productId);
        toast.success(
            isFavorite(productId)
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
                <p className="mt-4 text-sm text-gray-500">
                    Verifique as **Policies de RLS** das tabelas `produtos` e `categorias` no Supabase.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8">Explorar Imagens</h1>
                <div className="flex flex-col gap-8 md:flex-row">
                    <div className="w-full md:w-1/4">
                        <Skeleton className="h-40 w-full" />
                    </div>
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
                <CategoryFilter
                    categories={categories}
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
                            categories={categories}
                            onAddToCart={() => handleAddToCart(product)}
                            // O ID do produto é uma string UUID, não precisa de .toString()
                            onToggleFavorite={() => handleToggleFavorite(product.id)}
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
