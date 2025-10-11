// src/pages/admin/categories.tsx (SEM REQUIREADMIN)

import React from 'react';
// import RequireAdmin from '@/components/layout/RequireAdmin'; // REMOVIDO!
import CategoryManager from '@/components/admin/CategoryManager'; 

const AdminCategoriesPage: React.FC = () => {
    return (
        // REMOVIDO O WRAPPER
        <div className="container mx-auto p-4">
            <CategoryManager />
        </div>
    );
};

export default AdminCategoriesPage;
