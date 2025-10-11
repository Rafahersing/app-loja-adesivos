// src/pages/admin/categories.tsx (Versão Mínima para Teste de Rota)

import React from 'react';
// import RequireAdmin from '@/components/layout/RequireAdmin'; // Comentar
// import CategoryManager from '@/components/admin/CategoryManager'; // Comentar

const AdminCategoriesPage: React.FC = () => {
    return (
        // Comentar a proteção de rota
        // <RequireAdmin> 
            <div className="container mx-auto p-4">
                <h1>Teste de Rota: Categorias</h1>
            </div>
        // </RequireAdmin>
    );
};

export default AdminCategoriesPage;
