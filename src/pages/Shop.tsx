// src/pages/Shop.tsx

import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
// ⭐️ Removido 'slugify' daqui, pois ele já está dentro do utils.ts
import { fetchCategories, fetchProducts } from "@/lib/utils"; 
import { Product, Category } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth"; // Importado para verificar o usuário

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // ⭐️ ATUALIZADO: Usamos 2 parâmetros de URL agora
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
    // Lógica de Carregamento de Dados (useEffect)
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

                // ⭐️ ATUALIZADO: O mapeamento agora é feito DENTRO do fetchCategories
                // e já inclui parent_id. Apenas tipamos aqui.
                setCategories(fetchedCategories as Category[]); 
                setProducts(fetchedProducts as Product[]);

            } catch (err) {
                console.error("Erro ao carregar dados da loja:", err);
                setError(
                    err instanceof Error 
                        ? err.message 
                        : 'Não foi possível carregar os produtos. Verifique RLS ou a query no Supabase.'
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadShopData();
    }, []);
    // --------------------------------------------------

    // Handler para a Categoria Principal (ajusta o parâmetro 'category' e reseta 'subcategory')
    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category === "all") {
            params.delete("category");
            params.delete("subcategory"); // Garante que a subcategoria também seja resetada
        } else {
            params.set("category", category); 
            params.delete("subcategory"); // Limpa a subcategoria ao mudar o pai
        }
        setSearchParams(params);
    };

    // Handler para a Subcategoria (ajusta o parâmetro 'subcategory')
    const handleSubcategoryChange = (subcategory: string) => {
        const params = new URLSearchParams(searchParams);
        if (subcategory === "all") {
            params.delete("subcategory");
        } else {
            // A categoria principal já deve estar definida neste ponto
            params.set("subcategory", subcategory); 
        }
        setSearchParams(params);
    };

    const filteredProducts = useMemo(() => {
        let filtered = products;

        // ⭐️ NOVA LÓGICA DE FILTRO: Prioriza a Subcategoria
        
        // 1. Determina o ID de filtro prioritário: Subcategoria > Categoria Principal
        const filterId = selectedSubcategory !== "all" 
            ? selectedSubcategory 
            : selectedCategory;

        if (filterId !== "all") {
            // Filtra os produtos pelo ID da Subcategoria (se selecionada) ou pelo ID da Categoria Principal
            filtered = filtered.filter((p) => p.category_id === filterId);
        }

        // 2. Aplica filtro de busca (se houver)
        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [products, selectedCategory, selectedSubcategory, searchQuery]); // ⭐️ ATUALIZADO: Dependência de selectedSubcategory


    const handleAddToCart = (product: Product) => {
        addToCart(product);
        toast.success(`${product.title} adicionado ao carrinho!`);
    };

    // ✅ Lógica correta: chama o store e o store dispara o toast
    const handleToggleFavorite = (productId: string) => {
        if (!user || !user.id) {
            toast.error("Você precisa estar logado para favoritar.");
            return;
        }
        toggleFavorite(productId, user.id); 
    };

    // ... (restante da renderização, mantida) ...

    if (error) {
        // ... (código de erro mantido) ...
        return (
            <div className="container mx-auto px-4 py-8 text-center bg-red-50 border border-red-200 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-red-700 mb-4">Erro Crítico ao Carregar Dados</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <p className="mt-4 text-sm text-gray-700 font-semibold">
                    AÇÃO NECESSÁRIA: Verifique as **Policies de RLS** (Row Level Security) das tabelas `produtos` e `categorias` no Supabase.
                </p>
            </div>
        );
    }

    if (isLoading) {
        // ... (código de Skeleton mantido) ...
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
                    // ⭐️ NOVO: Passando e gerenciando o estado da subcategoria
                    selectedSubcategory={selectedSubcategory} 
                    onCategoryChange={handleCategoryChange}
                    onSubcategoryChange={handleSubcategoryChange} // ⭐️ NOVO: Handler para subcategoria
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
