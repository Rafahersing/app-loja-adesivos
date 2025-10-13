// src/lib/auth.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Importe o cliente Supabase

// Defina a tipagem para o usuário (pode ser mais detalhada se necessário)
interface User {
  id: string;
  email: string | undefined;
  // Outros campos do perfil Supabase, se você os carregar aqui
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Hook Customizado
export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar o estado inicial da sessão
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Mapeia o objeto de usuário do Supabase
        setUser({ id: user.id, email: user.email }); 
      }
      setLoading(false);
    };

    fetchUser();

    // Configura o listener para mudanças de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
        } else {
            setUser(null);
        }
        setLoading(false);
      }
    );

    // Limpeza
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
