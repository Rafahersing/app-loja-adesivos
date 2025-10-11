// src/components/layout/RequireAdmin.tsx

import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../lib/utils"; // Assumindo que RequireAdmin está em src/components/layout/

const RequireAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user }, error } = await supabase.auth.getUser();

      console.log("Usuário retornado:", user); // OBRIGATÓRIO

      if (user) {
        console.log("Metadata do App:", user.app_metadata); // OBRIGATÓRIO
        const userIsAdmin = user.app_metadata.is_admin === true;
        console.log("Resultado da verificação isAdmin:", userIsAdmin); // OBRIGATÓRIO
        
        setIsAdmin(userIsAdmin);
      }
      
      // Checagem primária: Usuário não logado
      if (!user || error) {
        setIsLoading(false);
        // O <Navigate> abaixo cuida do redirecionamento
        return; 
      }

      // Checagem secundária: Nível de permissão (a flag 'is_admin')
      const userIsAdmin = user.app_metadata.is_admin === true;
      
      setIsAdmin(userIsAdmin);
      setIsLoading(false);
    }
    
    checkAdmin();
  }, []);

  // 1. Mostrar Carregando (Loading)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando Acesso Administrativo...
      </div>
    );
  }

  // 2. Acesso Bloqueado: Redireciona para a Home
  if (!isAdmin) {
    // Se não for admin, ele redireciona instantaneamente para a home.
    return <Navigate to="/" replace />;
  }

  // 3. Acesso Permitido: Renderiza o componente filho (AdminLayout)
  return <Outlet />;
};

export default RequireAdmin;
