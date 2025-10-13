// src/components/AppInitializer.tsx (Exemplo)

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';

const AppInitializer = () => {
    const { user, loading } = useAuth();
    const { initializeFavorites } = useStore();
    
    useEffect(() => {
        if (!loading && user) {
            // Carrega os favoritos do Supabase APENAS se o usuário estiver logado
            initializeFavorites(user.id);
        }
    }, [user, loading, initializeFavorites]);

    return null; // Este componente não renderiza nada
};
