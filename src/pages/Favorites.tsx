// src/pages/Favorites.tsx

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { fetchProducts } from '@/lib/utils';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/shop/ProductCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth'; // ⭐️ IMPORTADO: Para pegar o userId

const Favorites = () => {
    const { user } = useAuth(); // ⭐️ PEGA O USUÁRIO LOGADO ⭐️
    const { favorites, isFavorite, toggleFavorite, addToCart } = useStore();
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // LÓGICA DE BUSCA DOS PRODUTOS COMPLETOS
    useEffect(() => {
        if (favorites.length === 0) {
            setFavoriteProducts([]);
            setIsLoading(false);
            return;
        }

        async function loadFavoriteProducts() {
            setIsLoading(true);
            setError(null);
            try {
                // 1. Busca TODOS os produtos
                const allProducts = await fetchProducts();
                
                // 2. Filtra APENAS os produtos que estão na lista 'favorites'
                const filtered = (allProducts as Product[]).filter(product => 
                    // Compara product.id (string) com favorites (string[])
                    favorites.includes(product.id) 
                );
                
                setFavoriteProducts(filtered);
            } catch (err) {
                console.error("Erro ao carregar detalhes dos favoritos:", err);
                setError("Não foi possível carregar os detalhes dos seus produtos favoritos. (Verifique o RLS da tabela 'produtos')");
            } finally {
                setIsLoading(false);
            }
        }

        loadFavoriteProducts();
        
    }, [favorites]); 


    const handleToggleFavorite = (productId: string) => {
        if (!user || !user.id) {
            // Este caso só deve ocorrer se o usuário deslogar nesta página
            toast.error("Você precisa estar logado para gerenciar favoritos.");
            return;
        }
        
        // ⭐️ CHAMA O STORE COM O ID CORRETO ⭐️
        toggleFavorite(productId, user.id);
    };

    // ... (restante da renderização, mantida da última vez) ...
    // --------------------------------------------------
    // Renderização
    // --------------------------------------------------
    if (error) {
         return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Meus Favoritos</h1>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <Skeleton className="h-64" /><Skeleton className="h-64" />
                    <Skeleton className="h-64" /><Skeleton className="h-64" />
                </div>
            </div>
        );
    }
    
    if (favoriteProducts.length === 0) {
        return (
            <div className="text-center py-20">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Nenhum Favorito</h2>
                <p className="text-muted-foreground mb-6">
                    Você ainda não adicionou nenhum produto aos favoritos.
                </p>
                <Link to="/shop">
                    <Button>Explorar Produtos</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Meus Favoritos</h1>
            <p className="text-muted-foreground mb-6">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item salvo' : 'itens salvos'}
            </p>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {favoriteProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        onToggleFavorite={() => handleToggleFavorite(product.id)}
                        isFavorite={isFavorite(product.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Favorites;
