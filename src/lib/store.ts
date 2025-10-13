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
  // Cart (mantido)
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
      // Cart (lógica mantida)
      cart: [],
      addToCart: (product) => {
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
      
      // ⭐️ CORREÇÃO 1/2: Inicialização (BIGINT -> String)
      initializeFavorites: async (userId) => {
          const { data, error } = await supabase
              .from('favoritos')
              .select('produto_id')
              .eq('usuario_id', userId);
              
          if (error) {
              console.error("Erro ao carregar favoritos (RLS SELECT?):", error);
              return;
          }
          
          // ✅ Converte o ID numérico (BIGINT) do DB para STRING para o Zustand
          const productIds = data ? data.map(item => String(item.produto_id)) : []; 
          set({ favorites: productIds });
          console.log("IDs de Favoritos carregados (Store):", productIds);
      },

      // ⭐️ CORREÇÃO 2/2: toggleFavorite (String -> BIGINT)
      toggleFavorite: async (productId, userId) => { 
        
        if (!userId) {
            // Este caso já é tratado no Shop.tsx, mas por segurança
            toast.error('Você precisa estar logado para favoritar.'); 
            return;
        }

        // Tenta converter a STRING do frontend para BIGINT (Number)
        // ESSENCIAL: O Supabase espera um NUMBER (BIGINT) para produto_id
        const dbProductId = Number(productId); 

        if (isNaN(dbProductId) || !dbProductId) {
             console.error(`Erro de tipagem: O ID do produto (${productId}) não é um número válido para o banco de dados (BIGINT).`);
             toast.error('Erro interno: O ID do produto é inválido (tipagem incorreta).');
             return;
        }

        const favorites = get().favorites;
        const isCurrentlyFavorite = favorites.includes(productId);
        
        if (isCurrentlyFavorite) {
          // DELETE do Supabase
          const { error } = await supabase
              .from('favoritos')
              .delete()
              .eq('usuario_id', userId)
              // ✅ Passa o NUMBER (BIGINT)
              .eq('produto_id', dbProductId); 

          if (error) {
              toast.error('Falha ao remover favorito do servidor.');
              console.error('Erro DELETE Supabase (RLS/Tipagem):', error);
              return;
          }
          
          // Sucesso
          toast.success('Removido dos favoritos.');
          set({ favorites: favorites.filter((id) => id !== productId) });
          
        } else {
          // INSERT no Supabase
          const { error } = await supabase
              .from('favoritos')
              .insert({
                  usuario_id: userId,
                  // ✅ Passa o NUMBER (BIGINT)
                  produto_id: dbProductId, 
              });

          if (error) {
              // Esta é a mensagem de falha que você estava vendo
              toast.error('Falha ao adicionar favorito ao servidor. (Verifique o RLS ou a tipagem do ID)');
              console.error('Erro INSERT Supabase (RLS/Tipagem):', error); 
              return;
          }

          // Sucesso
          toast.success('Adicionado aos favoritos!');
          // Adiciona a STRING ao array de strings do Zustand
          set({ favorites: [...favorites, productId] }); 
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
