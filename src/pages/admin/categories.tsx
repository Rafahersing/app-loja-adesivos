// src/pages/admin/categories.tsx

import React from "react";
// Importamos o componente gerenciador que contém toda a lógica e o formulário de subcategorias
import CategoryManager from "@/components/admin/CategoryManager"; 

const AdminCategoriesPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <CategoryManager />
        </div>
    );
};

export default AdminCategoriesPage;
