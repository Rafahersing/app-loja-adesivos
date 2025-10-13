// src/lib/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase'; 
import { toast } from 'sonner';

interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string, userId: string) => Promise<void>; 
  isFavorite: (productId: string) => boolean;
  initializeFavorites: (userId: string) => Promise<void>; 
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart (mantido)
      cart: [],
      addToCart: (product) => {
          // ... (lógica)
          const cart = get().cart;
          const existingItem = cart.find((item) => item.id === product.id);
          
          if (existingItem) {
            set({
              cart: cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            });
          } else {
            set({ cart: [...cart, { ...product, quantity: 1 }] });
          }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ cart: [] }),
      
      // Favorites
      favorites: [],
      
      // FUNÇÃO DE INICIALIZAÇÃO CORRIGIDA (garante que os IDs sejam strings)
      initializeFavorites: async (userId) => {
          const { data, error } = await supabase
              .from('favoritos')
              .select('produto_id')
              .eq('usuario_id', userId);
              
          if (error) {
              console.error("Erro ao carregar favoritos (RLS SELECT?):", error);
              return;
          }
          
          // CONVERTE TODOS os IDs para STRING, pois o estado do Zustand é string[]
          const productIds = data ? data.map(item => String(item.produto_id)) : []; 
          set({ favorites: productIds });
      },

      // FUNÇÃO MODIFICADA: Alterna favorito no estado local E no Supabase
      toggleFavorite: async (productId, userId) => { 
        
        // Se o seu Product.id for um UUID string, o Number() pode falhar e retornar NaN.
        // Se for um BIGINT (número grande em string), o Number() deve funcionar.
        // Vamos assumir que productId (vindo do frontend) É UMA STRING REPRESENTANDO UM NÚMERO (BIGINT)
        const dbProductId = Number(productId); 

        if (isNaN(dbProductId) || !dbProductId) {
             console.error("Erro de tipagem: productId não é um número válido para o banco de dados (BIGINT). Recebido:", productId);
             toast.error('Erro interno: O ID do produto é inválido.');
             return;
        }

        if (!userId) {
            console.error("Erro: userId não fornecido. Não é possível favoritar.");
            toast.error('Você precisa estar logado para favoritar.'); // Este toast é disparado em Shop.tsx
            return;
        }

        const favorites = get().favorites;
        const isCurrentlyFavorite = favorites.includes(productId); // Compara strings
        
        if (isCurrentlyFavorite) {
          // 1. DELETE do Supabase
          const { error } = await supabase
              .from('favoritos')
              .delete()
              .eq('usuario_id', userId)
              // ⭐️ CONVERSÃO DE TIPO AQUI ⭐️
              .eq('produto_id', dbProductId); 

          if (error) {
              toast.error('Falha ao remover favorito do servidor.');
              console.error('Erro DELETE Supabase (RLS):', error);
              return;
          }
          
          // 2. Atualiza estado local e exibe toast
          toast.success('Removido dos favoritos.');
          set({ favorites: favorites.filter((id) => id !== productId) });
          
        } else {
          // 1. INSERT no Supabase
          const { error } = await supabase
              .from('favoritos')
              .insert({
                  usuario_id: userId,
                  // ⭐️ CONVERSÃO DE TIPO AQUI ⭐️
                  produto_id: dbProductId, 
              });

          if (error) {
              // Este é o erro de RLS/Tipagem
              toast.error('Falha ao adicionar favorito ao servidor. (Verifique o RLS ou a tipagem do ID)');
              console.error('Erro INSERT Supabase (RLS/Tipagem):', error); 
              return;
          }

          // 2. Atualiza estado local e exibe toast
          toast.success('Adicionado aos favoritos!');
          set({ favorites: [...favorites, productId] }); // Adiciona a STRING ao array de strings
        }
      },
      isFavorite: (productId) => get().favorites.includes(productId),
    }),
    {
      name: 'pixelstore-storage',
      partialize: (state) => ({ cart: state.cart }) 
    }
  )
);
