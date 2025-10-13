// src/lib/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { supabase } from '@/lib/utils'; // Nota: usando 'utils' para o supabase, se estiver em 'lib/supabase', ajuste.
import { toast } from 'sonner';

interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  favorites: string[];
  toggleFavorite: (productId: string, userId: string) => Promise<void>; 
  isFavorite: (productId: string) => boolean;
  initializeFavorites: (userId: string) => Promise<void>; 
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
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
      
      favorites: [],
      
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
      },

      toggleFavorite: async (productId, userId) => { 
        
        if (!userId) {
            toast.error('Você precisa estar logado para favoritar.'); 
            return;
        }

        // ✅ Converte a string do frontend para Number (BIGINT) para o Supabase
        const dbProductId = Number(productId); 

        if (isNaN(dbProductId) || !dbProductId) {
             console.error(`Erro de tipagem: O ID do produto (${productId}) não é um número válido para o banco de dados (BIGINT).`);
             toast.error('Erro interno: O ID do produto é inválido (tipagem incorreta).');
             return;
        }

        const favorites = get().favorites;
        const isCurrentlyFavorite = favorites.includes(productId);
        
        if (isCurrentlyFavorite) {
          // DELETE: Passa o NUMBER (BIGINT)
          const { error } = await supabase
              .from('favoritos')
              .delete()
              .eq('usuario_id', userId)
              .eq('produto_id', dbProductId); 

          if (error) {
              toast.error('Falha ao remover favorito do servidor.');
              console.error('Erro DELETE Supabase (RLS):', error);
              return;
          }
          
          toast.success('Removido dos favoritos.');
          set({ favorites: favorites.filter((id) => id !== productId) });
          
        } else {
          // INSERT: Passa o NUMBER (BIGINT)
          const { error } = await supabase
              .from('favoritos')
              .insert({
                  usuario_id: userId,
                  produto_id: dbProductId, 
              });

          if (error) {
              toast.error('Falha ao adicionar favorito ao servidor. (Verifique o RLS)');
              console.error('Erro INSERT Supabase (RLS):', error); 
              return;
          }

          toast.success('Adicionado aos favoritos!');
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
