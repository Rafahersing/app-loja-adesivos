// src/components/layout/RequireAdmin.tsx (CÓDIGO FINAL DE PROTEÇÃO)

import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
// ⚠️ CONFIRME QUE ESTE CAMINHO ESTÁ CORRETO (../../lib/utils ou @/lib/utils)
import { supabase } from "../../lib/utils"; 

const RequireAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      // 1. Obter o usuário logado
      const { data: { user } } = await supabase.auth.getUser();

      let userIsAdmin = false;
      
      // 2. Verificar o status de administrador, se o usuário existir
      if (user) {
        // Garantindo que a app_metadata está sendo verificada corretamente
        userIsAdmin = user.app_metadata.is_admin === true;
      }
      
      // 3. Checagem Principal: O usuário está logado E ele é admin?
      // Se user for null (não logado), a checagem é false, o que nega o acesso.
      setIsAdmin(!!user && userIsAdmin);

      // 4. ESSENCIAL: Encerrar o estado de carregamento.
      // O componente NUNCA deve ficar preso aqui.
      setIsLoading(false);
    }
    
    checkAdmin();
  }, []);

  // 1. Mostrar Carregando
  if (isLoading) {
    // Retorna um indicador de carregamento (em vez de null/nada)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando Acesso Administrativo...
      </div>
    );
  }

  // 2. Acesso Bloqueado: Redireciona para a Home (se não for admin)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. Acesso Permitido: Renderiza o componente filho (AdminLayout)
  return <Outlet />;
};

export default RequireAdmin;
