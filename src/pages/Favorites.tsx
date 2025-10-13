// src/pages/Favorites.tsx
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
// REMOVA: import { MOCK_PRODUCTS } from "@/lib/mockData";
import { toast } from "sonner";
import { ProductCard } from "@/components/shop/ProductCard";
import { useEffect, useState } from "react"; // ADICIONAR
import { supabase } from "@/lib/supabase"; // ADICIONAR: Caminho para o seu cliente Supabase
import { useAuth } from "@/lib/auth"; // ADICIONAR: Hook para obter o usuário logado

// Defina a tipagem de produto real (assumindo que você tem uma)
interface Product {
    id: string; // ou number
    title: string;
    // Adicione outros campos necessários...
}

const Favorites = () => {
    // Estado para armazenar os produtos reais buscados do Supabase
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Obtenha o usuário logado (Assumindo que você tenha um hook de autenticação)
    const { user } = useAuth(); 

    // O useStore ainda é usado para gerenciar o estado local do favorito e ações
    const { toggleFavorite, isFavorite, addToCart } = useStore();

    useEffect(() => {
        if (!user) { // Se o usuário não estiver logado, não busca
            setLoading(false);
            return;
        }

        const fetchFavorites = async () => {
            setLoading(true);
            
            // 1. Buscar os IDs de produtos que o usuário favoritou
            const { data: favoriteLinks, error: linksError } = await supabase
                .from('favoritos')
                .select('produto_id')
                .eq('usuario_id', user.id); // Usamos o ID do usuário logado

            if (linksError) {
                console.error("Erro ao buscar links favoritos:", linksError);
                setLoading(false);
                return;
            }

            const productIds = favoriteLinks.map(link => link.produto_id);

            if (productIds.length === 0) {
                setFavoriteProducts([]);
                setLoading(false);
                return;
            }

            // 2. Buscar os dados completos dos produtos usando os IDs
            const { data: productsData, error: productsError } = await supabase
                .from('produtos')
                .select('*') // Selecione todos os campos necessários
                .in('id', productIds); 

            if (productsError) {
                console.error("Erro ao buscar produtos:", productsError);
            } else {
                setFavoriteProducts(productsData || []);
            }
            setLoading(false);
        };

        fetchFavorites();
    }, [user]); // Re-executa quando o usuário mudar (login/logout)


    const handleAddToCart = (product: any) => {
        addToCart(product);
        toast.success("Produto adicionado ao carrinho!");
    };

    const handleToggleFavorite = (productId: string) => {
        // A lógica de toggleFavorite no useStore deve agora lidar com o INSERT/DELETE no Supabase
        toggleFavorite(productId); 
        
        // Atualize a lista localmente para refletir a remoção sem recarregar a página
        setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
        
        toast.success("Removido dos favoritos");
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-xl">Carregando Favoritos...</h1>
            </div>
        )
    }

    if (favoriteProducts.length === 0) {
        // ... O seu JSX de "Nenhum Favorito" continua aqui
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
