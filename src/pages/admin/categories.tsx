// src/pages/admin/categories.tsx

import React from 'react';
import CategoryManager from '@/components/admin/CategoryManager'; 

const AdminCategoriesPage: React.FC = () => {
    return (
        // A proteção RequireAdmin é feita no App.tsx. 
        // Aqui, apenas renderizamos o conteúdo da página.
        <div className="container mx-auto p-4">
            <CategoryManager />
        </div>
    );
};

export default AdminCategoriesPage;
