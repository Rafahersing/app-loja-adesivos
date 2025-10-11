// src/pages/admin/categories.tsx (Código Final de Rota)

import React from 'react';
import RequireAdmin from '@/components/layout/RequireAdmin';
import CategoryManager from '@/components/admin/CategoryManager'; 
// OBS: Você precisa garantir que o caminho de importação (ex: '@/components/layout/RequireAdmin') esteja correto.

const AdminCategoriesPage: React.FC = () => {
    return (
        // O RequireAdmin protege o acesso
        <RequireAdmin>
            <div className="container mx-auto p-4">
                {/* O componente principal de gerenciamento */}
                <CategoryManager />
            </div>
        </RequireAdmin>
    );
};

export default AdminCategoriesPage;
