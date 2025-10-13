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
  toggleFavorite: (productId: string, userId: string) => Promise<void>; // ⬅️ ALTERADO: Recebe userId e é assíncrona
  isFavorite: (productId: string) => boolean;
  initializeFavorites: (userId: string) => Promise<void>; // ⬅️ ADICIONADO
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart
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
      
      // FUNÇÃO ADICIONADA: Busca os favoritos do Supabase e salva no estado local
      initializeFavorites: async (userId) => {
          const { data, error } = await supabase
              .from('favoritos')
              .select('produto_id')
              .eq('usuario_id', userId);
              
          if (error) {
              console.error("Erro ao carregar favoritos:", error);
              return;
          }
          
          const productIds = data ? data.map(item => item.produto_id.toString()) : [];
          set({ favorites: productIds });
      },

      // FUNÇÃO MODIFICADA: Alterna favorito no estado local E no Supabase
      toggleFavorite: async (productId, userId) => { 
        
        // ⭐️ LOG DE DEBBUG (OPCIONAL, mas útil) ⭐️
        console.log('Tentando toggleFavorite. User ID:', userId, 'Product ID:', productId);

        if (!userId) {
            console.error("Erro: userId não fornecido. Não é possível favoritar.");
            toast.error('Você precisa estar logado para favoritar.');
            return;
        }

        const favorites = get().favorites;
        const isCurrentlyFavorite = favorites.includes(productId);
        
        if (isCurrentlyFavorite) {
          // 1. DELETE do Supabase
          const { error } = await supabase
              .from('favoritos')
              .delete()
              .eq('usuario_id', userId)
              .eq('produto_id', productId);

          if (error) {
              toast.error('Falha ao remover favorito do servidor.');
              console.error('Erro DELETE Supabase:', error);
              return;
          }
          
          // 2. Atualiza estado local (Zustand)
          set({ favorites: favorites.filter((id) => id !== productId) });
          
        } else {
          // 1. INSERT no Supabase
          const { error } = await supabase
              .from('favoritos')
              .insert({
                  usuario_id: userId,
                  produto_id: productId,
              });

          if (error) {
              // ESTE É O ERRO DE RLS
              toast.error('Falha ao adicionar favorito ao servidor.');
              console.error('Erro INSERT Supabase (RLS):', error); 
              return;
          }

          // 2. Atualiza estado local (Zustand)
          set({ favorites: [...favorites, productId] });
        }
      },
      isFavorite: (productId) => get().favorites.includes(productId),
    }),
    {
      name: 'pixelstore-storage',
      // Não persista favorites, pois eles vêm do Supabase
      partialize: (state) => ({ cart: state.cart }) 
    }
  )
);
