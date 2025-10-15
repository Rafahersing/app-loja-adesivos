// src/pages/Shop.tsx (ou onde sua página Shop está localizada)

import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { fetchCategories, fetchProducts } from "@/lib/utils"; // Importa as funções corrigidas
import { Product, Category } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedCategory = searchParams.get("category") || "all";
    const selectedSubcategory = searchParams.get("subcategory") || "all";
    const searchQuery = searchParams.get("search") || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const { addToCart, toggleFavorite, isFavorite } = useStore();

    // --------------------------------------------------
    // Carregamento de dados
    // --------------------------------------------------
    useEffect(() => {
        async function loadShopData() {
            setIsLoading(true);
            setError(null);
            try {
                // Busca categorias e produtos em paralelo
                const [fetchedCategories, fetchedProducts] = await Promise.all([
                    fetchCategories(),
                    fetchProducts(),
                ]);

                setCategories(fetchedCategories as Category[]);
                setProducts(fetchedProducts as Product[]);
            } catch (err) {
                console.error("Erro ao carregar dados da loja:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar os produtos. Verifique RLS ou a query no Supabase."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadShopData();
    }, []);

    // --------------------------------------------------
    // Handlers de categoria e subcategoria (Não alterado)
    // --------------------------------------------------
    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category === "all") {
            params.delete("category");
            params.delete("subcategory");
        } else {
            params.set("category", category);
            params.delete("subcategory");
        }
        setSearchParams(params);
    };

    const handleSubcategoryChange = (subcategory: string) => {
        const params = new URLSearchParams(searchParams);
        if (subcategory === "all") {
            params.delete("subcategory");
        } else {
            params.set("subcategory", subcategory);
        }
        setSearchParams(params);
    };

    // --------------------------------------------------
    // ⭐️ FILTROS CORRIGIDOS ⭐️
    // --------------------------------------------------
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // O ID do filtro pode ser a subcategoria ou a categoria principal
        const filterId =
            selectedSubcategory !== "all" ? selectedSubcategory : selectedCategory;

        if (filterId !== "all") {
            filtered = filtered.filter((p) => {
                // ⭐️ CORREÇÃO: Filtra verificando a propriedade 'categories' aninhada
                // que é preenchida pela nova função fetchProducts
                return p.categories.some(
                    (category) => category.id === filterId
                );
            });
        }

        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.titulo.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [products, selectedCategory, selectedSubcategory, searchQuery]);

    // --------------------------------------------------
    // Carrinho e favoritos (Não alterado)
    // --------------------------------------------------
    const handleAddToCart = (product: Product) => {
        addToCart(product);
        toast.success(`${product.titulo} adicionado ao carrinho!`);
    };

    const handleToggleFavorite = (productId: string) => {
        if (!user || !user.id) {
            toast.error("Você precisa estar logado para favoritar.");
            return;
        }
        toggleFavorite(productId, user.id);
    };

    // --------------------------------------------------
    // Renderização (Não alterado)
    // --------------------------------------------------
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center bg-red-50 border border-red-200 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-red-700 mb-4">
                    Erro Crítico ao Carregar Dados
                </h2>
                <p className="text-red-600 mb-4">{error}</p>
                <p className="mt-4 text-sm text-gray-700 font-semibold">
                    AÇÃO NECESSÁRIA: Verifique as <strong>Policies de RLS</strong> das
                    tabelas <code>produtos</code> e <code>categorias</code> no Supabase.
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

            <div className="mb-8">
                <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                    Categorias
                </h2>
                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    onCategoryChange={handleCategoryChange}
                    onSubcategoryChange={handleSubcategoryChange}
                />
            </div>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            categories={categories}
                            onAddToCart={() => handleAddToCart(product)}
                            onToggleFavorite={() => handleToggleFavorite(product.id)}
                            isFavorite={isFavorite(product.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-muted-foreground mb-4">
                        Nenhum produto encontrado.
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
