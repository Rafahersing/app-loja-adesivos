// src/pages/admin/categories.tsx (CÓDIGO FINAL E PROTEGIDO)

import React from 'react';
import RequireAdmin from '@/components/layout/RequireAdmin'; // Reintroduzido
import CategoryManager from '@/components/admin/CategoryManager'; 

const AdminCategoriesPage: React.FC = () => {
    return (
        // ⚠️ REINTRODUZIDO O WRAPPER REQUIREADMIN CORRIGIDO ⚠️
        <RequireAdmin>
            <div className="container mx-auto p-4">
                <CategoryManager />
            </div>
        </RequireAdmin>
    );
};

export default AdminCategoriesPage;
