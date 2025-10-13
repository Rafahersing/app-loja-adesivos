import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase'; // ⬅️ ADICIONAR
import { toast } from 'sonner'; // ⬅️ ADICIONAR (Para feedback de erro)

interface CartItem extends Product {
  quantity: number;
}

// ADICIONAR: Nova ação para inicializar favoritos do banco
interface StoreState {
  // ... (Cart methods)
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string, userId: string) => Promise<void>; // ⬅️ ALTERAR: Recebe userId e é assíncrona
  isFavorite: (productId: string) => boolean;
  initializeFavorites: (userId: string) => Promise<void>; // ⬅️ ADICIONAR
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ... (Cart methods - Mantêm o mesmo código)
      cart: [],
      addToCart: (product) => { /* ... */ },
      removeFromCart: (productId) => { /* ... */ },
      updateQuantity: (productId, quantity) => { /* ... */ },
      clearCart: () => set({ cart: [] }),

      // Favorites
      favorites: [],
      
      // AÇÃO ADICIONADA: Busca os favoritos do Supabase e salva no estado local
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

      // AÇÃO MODIFICADA: Alterna favorito no estado local E no Supabase
      toggleFavorite: async (productId, userId) => { // userId é passado por parâmetro
        const favorites = get().favorites;
        const isCurrentlyFavorite = favorites.includes(productId);
        
        if (isCurrentlyFavorite) {
          // 1. DELETE do Supabase
          const { error } = await supabase
              .from('favoritos')
              .delete()
              .eq('usuario_id', userId)
              .eq('produto_id', productId); // Assegura que o ID do produto é int8

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
                  produto_id: productId, // O valor é passado como string/int. Supabase deve converter para int8.
              });

          if (error) {
              toast.error('Falha ao adicionar favorito ao servidor.');
              console.error('Erro INSERT Supabase:', error);
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
      partialize: (state) => ({ cart: state.cart }) // NÃO persistir `favorites` localmente; dependa do Supabase.
    }
  )
);
