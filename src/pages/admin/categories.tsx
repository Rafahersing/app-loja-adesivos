// src/pages/admin/categories.tsx (CÓDIGO FINAL CORRETO)

import React from 'react';
// ⚠️ NÃO IMPORTAR REQUIREADMIN AQUI ⚠️
import CategoryManager from '@/components/admin/CategoryManager'; 

const AdminCategoriesPage: React.FC = () => {
    return (
        // ⭐️ REMOVA O WRAPPER REQUIREADMIN ⭐️
        // A proteção já é feita no App.tsx
        <div className="container mx-auto p-4">
            <CategoryManager />
        </div>
    );
};

export default AdminCategoriesPage;
