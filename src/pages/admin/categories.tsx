// src/pages/admin/categories.tsx (VERSÃO CORRIGIDA)

import React from "react";
// Importamos o componente completo que gerencia a lógica de CRUD e o formulário de subcategorias
import CategoryManager from "@/components/admin/CategoryManager"; 
// Importamos o layout de administração (se você tiver um)
// import AdminLayout from "@/components/layout/AdminLayout"; 

// Se você usa o Next.js ou similar, esta é a estrutura ideal para a página:
const AdminCategoriesPage: React.FC = () => {
    return (
        // Se você tem um layout principal de admin, use-o aqui:
        // <AdminLayout>
            <div className="container mx-auto p-4">
                {/* ⭐️ Renderizamos o componente que contém toda a lógica, estados e o dropdown do Pai ⭐️ */}
                <CategoryManager />
            </div>
        // </AdminLayout>
    );
};

export default AdminCategoriesPage;

// OBS: Remova ou comente o código antigo de fetch, states, e formulário.
// Eles agora estão centralizados em CategoryManager.tsx.
