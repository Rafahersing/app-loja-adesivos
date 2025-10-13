// src/components/shop/ProductCard.tsx

import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Product, Category } from "@/types/product"; // Usando as tipagens ajustadas
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    // O ID do produto é string (UUID), mantemos a tipagem de onToggleFavorite como string
    onToggleFavorite: (productId: string) => void; 
    isFavorite: boolean;
    // Lista de categorias recebida do Shop.tsx
    categories?: Category[];
}

export const ProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite, categories = [] }: ProductCardProps) => {

    // ⭐️ AJUSTE CRÍTICO: Se o produto for nulo/indefinido (o que causa o erro), não renderiza.
    if (!product || !product.id) {
        return null;
    }
    
    // Lógica para encontrar o nome da categoria usando o category_id (UUID)
    const categoryName = categories.find(c => c.id === product.category_id)?.name || "Geral";
    
    // O ID do produto já é uma string (UUID)
    const productIdString = product.id; 

    return (
        <Card className="group overflow-hidden border transition-all hover:shadow-lg hover:border-primary/20">
            <Link to={`/product/${productIdString}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    {/* Watermark overlay (mantido) */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="text-4xl font-bold text-white/10 rotate-[-45deg] select-none">
                            PIXELSTORE
                        </div>
                    </div>
                    
                    <img
                        // ⭐️ CORREÇÃO: Usamos 'imageUrl' da interface (mapeado em utils.ts)
                        src={product.imageUrl} 
                        // ⭐️ CORREÇÃO: Usamos 'title' da interface
                        alt={product.title} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Gradient overlay on hover (mantido) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
            </Link>

            <div className="p-4 space-y-3">
                <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                        {categoryName}
                    </Badge>
                    <Link to={`/product/${productIdString}`}>
                        {/* ⭐️ CORREÇÃO: Usamos 'title' da interface */}
                        <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                            {product.title} 
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                        {/* ⭐️ CORREÇÃO CRÍTICA: Usamos 'price' da interface e a proteção */}
                        R$ {
                            typeof product.price === 'number' && !isNaN(product.price)
                                ? product.price.toFixed(2)
                                : '0.00'
                        }
                    </span>

                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                // Passamos o ID como string (UUID)
                                onToggleFavorite(product.id); 
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
