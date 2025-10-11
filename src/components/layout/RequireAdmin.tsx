// src/components/layout/RequireAdmin.tsx (CÓDIGO FINAL DE PROTEÇÃO - COM ALIAS)

import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
// ⭐️ CORRIGIDO: Usando o ALIAS para consistência com o restante do projeto
import { supabase } from "@/lib/utils"; 

const RequireAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      let userIsAdmin = false;
      
      if (user) {
        userIsAdmin = user.app_metadata.is_admin === true;
      }
      
      setIsAdmin(!!user && userIsAdmin);
      // ESSENCIAL: Encerrar o estado de carregamento para evitar a tela em branco.
      setIsLoading(false);
    }
    
    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando Acesso Administrativo...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
