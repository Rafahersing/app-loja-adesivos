// src/pages/admin/categories.tsx

import React from 'react';
import RequireAdmin from '@/components/layout/RequireAdmin'; // Se você estiver usando um layout/wrapper
import CategoryManager from '@/components/admin/CategoryManager'; // Seu novo componente

const AdminCategoriesPage: React.FC = () => {
  // A rota /admin já é protegida, mas vale a pena garantir o layout
  return (
    <RequireAdmin> 
      <div className="container mx-auto p-4">
        {/* Renderiza o componente de gerenciamento */}
        <CategoryManager />
      </div>
    </RequireAdmin>
  );
};

export default AdminCategoriesPage;
