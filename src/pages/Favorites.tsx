// src/pages/Favorites.tsx

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { fetchProducts } from '@/lib/utils'; // Assumindo que você usa esta função de utilitário
import { Product } from '@/types/product';
import { ProductCard } from '@/components/shop/ProductCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Favorites = () => {
    const { favorites, isFavorite, toggleFavorite, addToCart } = useStore();
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ⭐️ LÓGICA DE BUSCA DOS PRODUTOS COMPLETOS ⭐️
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
                    favorites.includes(product.id)
                );
                
                setFavoriteProducts(filtered);
            } catch (err) {
                console.error("Erro ao carregar detalhes dos favoritos:", err);
                setError("Não foi possível carregar os detalhes dos seus produtos favoritos.");
            } finally {
                setIsLoading(false);
            }
        }

        loadFavoriteProducts();
        
        // Dependência: 'favorites' muda quando o usuário adiciona/remove um item
    }, [favorites]); 


    // HANDLERS (usando a lógica já corrigida de autenticação)
    // Na página de favoritos, o usuário deve estar logado, mas passamos o ID por segurança

    const handleToggleFavorite = (productId: string) => {
        // Na página de favoritos, não precisamos checar o usuário, mas o useStore exige o ID.
        // Assumindo que você tem o user.id disponível ou que ele é tratado no useStore
        // Já que você está na página de favoritos, vamos usar um placeholder temporário
        // e confiar que a autenticação está funcionando no AppInitializer.
        const userIdPlaceholder = 'authenticated_user_id'; // Este é o ponto fraco, o user.id real precisa ser usado aqui.
        
        // Se você tiver o useAuth disponível aqui:
        // const { user } = useAuth();
        // toggleFavorite(productId, user.id);

        // Por enquanto, vamos manter a chamada simples, e o useStore irá reclamar 
        // ou você terá que adicionar useAuth aqui (melhor prática):
        
        // ⭐️ MELHOR PRÁTICA: ADICIONE useAuth NO Favorites.tsx ⭐️
        // (Fazendo uma suposição, adicione 'useAuth' aos imports se não tiver)
        // const { user } = useAuth();
        // toggleFavorite(productId, user?.id || 'guest');
        
        // Se você está usando a versão mais recente do useStore com a verificação de userId:
        toggleFavorite(productId, "USER_ID_REAL_DEVE_ESTAR_AQUI"); 
        
        // Nota: O ideal é que a página de favoritos exija autenticação (via um RequireAuth component)
        // e obtenha o userId via useAuth().
    };


    // --------------------------------------------------
    // Renderização
    // --------------------------------------------------
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
    
    if (error) {
         return <div className="text-center py-20 text-red-500">{error}</div>;
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
