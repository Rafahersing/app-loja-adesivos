import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Product, Category } from "@/types/product"; // Usando as tipagens ajustadas
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    // O ID do produto no Product é string (UUID), mas o onToggleFavorite espera um number
    // Deixamos a tipagem como number para o onToggleFavorite como você a tinha, 
    // mas tratamos o product.id como string no componente.
    onToggleFavorite: (productId: string) => void; // ⭐️ Ajustado para string (UUID)
    isFavorite: boolean;
    // Lista de categorias recebida do Shop.tsx
    categories?: Category[];
}

export const ProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite, categories = [] }: ProductCardProps) => {

    // ⭐️ Lógica ajustada para usar product.category_id (que é uma string UUID)
    // e verificar tanto 'nome' (mapeado em utils) quanto 'name' (original do DB).
    // O 'product.category_id' é uma string (UUID) vinda do Supabase.
    const categoryName = categories.find(c => c.id === product.category_id)?.name || "Geral"; // Usamos 'name' que existe no DB
    
    // O ID do produto é uma string (UUID)
    const productIdString = product.id.toString(); 

    return (
        <Card className="group overflow-hidden border transition-all hover:shadow-lg hover:border-primary/20">
            {/* Usamos productIdString na rota */}
            <Link to={`/product/${productIdString}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="text-4xl font-bold text-white/10 rotate-[-45deg] select-none">
                            PIXELSTORE
                        </div>
                    </div>
                    
                    <img
                        // Usamos 'imagem_url' em vez de 'imageUrl'
                        src={product.imagem_url} 
                        // Usamos 'nome' em vez de 'title'
                        alt={product.nome} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
            </Link>

            <div className="p-4 space-y-3">
                <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                        {/* Usamos categoryName encontrado acima */}
                        {categoryName} 
                    </Badge>
                    <Link to={`/product/${productIdString}`}>
                        {/* Usamos 'nome' em vez de 'title' */}
                        <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                            {product.nome} 
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                        {/* Usamos 'preco' em vez de 'price' */}
                        R$ {product.preco.toFixed(2)} 
                    </span>

                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                // Passamos o ID como string (UUID)
                                onToggleFavorite(product.id.toString()); 
                            }}
                            className={isFavorite ? "text-red-500 border-red-500" : ""}
                        >
                            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                onAddToCart(product);
                            }}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
