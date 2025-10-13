// src/pages/Favorites.tsx

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
// ✅ IMPORTAÇÃO CORRETA: Trocamos fetchProducts por fetchFavoriteProducts
import { fetchFavoriteProducts } from '@/lib/utils';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/shop/ProductCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner'; // Adicionado para a função handleToggleFavorite

const Favorites = () => {
    // Pegamos o ID do usuário (necessário para buscar apenas OS favoritos DELE)
    const { user } = useAuth();
    const { favorites, isFavorite, toggleFavorite, addToCart } = useStore();
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // LÓGICA DE BUSCA DOS PRODUTOS FAVORITOS
    useEffect(() => {
        // Se o usuário não estiver logado ou não tivermos o ID, não tentamos buscar.
        // O caso de favorites.length === 0 será tratado pela nova função, 
        // mas é bom ter uma verificação inicial.
        if (!user || !user.id) {
             setIsLoading(false);
             // Podemos até setar um erro se o componente for renderizado em estado deslogado
             // setError("Você precisa estar logado para ver seus favoritos.");
             return; 
        }

        async function loadFavoriteProducts() {
            setIsLoading(true);
            setError(null);
            try {
                // 🛑 CORREÇÃO AQUI: Usamos a nova função que faz o filtro e a busca com JOIN no DB.
                // Esta busca APENAS os 3 produtos (28, 29, 30) e traz a categoria correta.
                const products = await fetchFavoriteProducts(user.id);
                
                // Não é mais necessário o filtro no frontend
                setFavoriteProducts(products);
            } catch (err) {
                console.error("Erro ao carregar detalhes dos favoritos:", err);
                // Mensagem mais informativa
                setError("Não foi possível carregar os detalhes dos seus produtos favoritos. (Verifique o RLS nas tabelas 'produtos' e 'categorias' ou a conexão)");
            } finally {
                setIsLoading(false);
            }
        }

        // ⭐️ Rodamos a busca quando o usuário ou a lista de IDs de favoritos mudar
        loadFavoriteProducts();
        
    }, [user?.id, favorites]); // Dependemos do ID do usuário e da lista de IDs de favoritos


    const handleToggleFavorite = (productId: string) => {
        if (!user || !user.id) {
            toast.error("Você precisa estar logado para gerenciar favoritos.");
            return;
        }
        
        // Chama o store com o ID correto (aqui já estava certo)
        toggleFavorite(productId, user.id);
    };

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
    
    // Agora 'favoriteProducts' só contém os itens favoritos do DB
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
