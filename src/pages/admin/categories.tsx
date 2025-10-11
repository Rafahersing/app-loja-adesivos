// src/pages/admin/categories.tsx

import React, { useState, useEffect } from "react";
import RequireAdmin from "@/components/layout/RequireAdmin"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
// IMPORTANTE: Mantenha esta linha, mas não usaremos supabase/slugify
import { supabase, slugify } from '@/lib/utils'; 


// MOCK de dados para renderização
const MOCK_CATEGORIES = [
  { id: '1', name: 'Açaí', slug: 'acai' },
  { id: '2', name: 'Salgados', slug: 'salgados' },
];

const AdminCategoriesPage: React.FC = () => {
  // Use MOCK_CATEGORIES em vez de []
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES); 
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false); // Mantido como false
  const [isSubmitting, setIsSubmitting] = useState(false); // Mantido como false

  // FUNÇÕES SUPABASE REMOVIDAS/IGNORADAS
  // ⭐️ O useEffect abaixo FOI REMOVIDO para eliminar a busca ⭐️
  /*
  useEffect(() => {
    // Nenhuma busca de dados aqui. Apenas renderizar a UI.
  }, []);
  */

  // Handlers vazios para não quebrar a UI
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Simulação de Adição:", newCategoryName);
    toast.info("Simulação: Adição desativada para debug.");
  };

  const handleDeleteCategory = (id: string, name: string) => {
    console.log(`Simulação de Exclusão: ${name}`);
    toast.info("Simulação: Exclusão desativada para debug.");
  };

  return (
    <RequireAdmin>
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-3xl font-bold">Gerenciar Categorias (DEBUG MODE)</h1>
        
        {/* --- Formulário de Adição --- */}
        <Card className="p-6 space-y-6">
            <h3 className="text-xl font-semibold mb-4">Adicionar Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="flex gap-4">
                <Input
                    type="text"
                    placeholder="Nome da Nova Categoria (Ex: Açaí, Lanches)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={isSubmitting || loading}
                    className="flex-1"
                    required
                />
                <Button type="submit" variant="hero" disabled={isSubmitting || loading}>
                    Adicionar (DEBUG)
                </Button>
            </form>
            {/* Pré-visualização do Slug (Ainda requer slugify) */}
            {newCategoryName.trim() && (
                <p className="text-sm text-muted-foreground mt-2">
                    Slug Sugerido: **{slugify(newCategoryName)}**
                </p>
            )}
        </Card>

        {/* --- Lista de Categorias --- */}
        <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Lista de Categorias (MOCK)</h3>
            
            <div className="space-y-3">
                {categories.map((category) => (
                    <div 
                        key={category.id} 
                        className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10"
                    >
                        <p className="font-medium">
                            {category.name} <span className="text-sm text-muted-foreground">({category.slug})</span>
                        </p>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </Card>

      </div>
    </RequireAdmin>
  );
};

export default AdminCategoriesPage;
