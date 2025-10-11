// src/pages/admin/categories.tsx (CÓDIGO FINAL DE ROTA)

import React from 'react';
import RequireAdmin from '@/components/layout/RequireAdmin';
import CategoryManager from '@/components/admin/CategoryManager'; 

const AdminCategoriesPage: React.FC = () => {
    return (
        // Reintroduzimos o RequireAdmin, que falhou antes
        <RequireAdmin>
            <div className="container mx-auto p-4">
                <CategoryManager />
            </div>
        </RequireAdmin>
    );
};

export default AdminCategoriesPage;
