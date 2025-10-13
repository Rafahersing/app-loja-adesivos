// src/components/AppInitializer.tsx

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth'; 
import { useStore } from '@/lib/store'; 

const AppInitializer = () => {
    const { user, loading } = useAuth();
    const { initializeFavorites } = useStore();
    
    useEffect(() => {
        if (!loading && user) {
            initializeFavorites(user.id);
        }
    }, [user, loading, initializeFavorites]);

    return null;
};

// ⭐️ CORREÇÃO: Altere para exportação default
export default AppInitializer;
