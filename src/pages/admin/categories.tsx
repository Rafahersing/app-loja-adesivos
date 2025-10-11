// src/pages/admin/categories.tsx (Teste Final Sem Proteção)

import React from 'react';
// import RequireAdmin from '@/components/layout/RequireAdmin'; // COMENTAR ESTE IMPORT
import CategoryManager from '@/components/admin/CategoryManager'; 

const AdminCategoriesPage: React.FC = () => {
    return (
        // ⚠️ REMOVER O WRAPPER RequireAdmin ⚠️
        // <RequireAdmin> 
            <div className="container mx-auto p-4">
                {/* Usamos o CategoryManager no modo de teste estático */}
                <CategoryManager /> 
            </div>
        // </RequireAdmin>
    );
};

export default AdminCategoriesPage;
