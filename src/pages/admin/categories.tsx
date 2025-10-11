// src/pages/admin/categories.tsx

import React, { useState, useEffect } from "react";
import RequireAdmin from "@/components/layout/RequireAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
// Assumindo que você tem o Supabase e o slugify importados
import { supabase, slugify } from '@/lib/utils'; // Certifique-se que slugify está em utils

interface Category {
  id: string; // UUID do Supabase
  name: string;
  slug: string;
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. FUNÇÃO PARA BUSCAR CATEGORIAS
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar lista de categorias.');
      setCategories([]); // Garante que não mostra dados antigos em caso de erro
    } else if (data) {
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. FUNÇÃO PARA ADICIONAR CATEGORIA
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();

    if (!name) {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    
    const slug = slugify(name);
    
    // Verifica se a categoria (pelo slug) já existe
    if (categories.some(c => c.slug === slug)) {
        toast.error(`A categoria "${name}" (slug: ${slug}) já existe.`);
        return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('categorias')
      .insert({ name: name, slug: slug }); // Campos 'id' e 'created_at' são gerados automaticamente

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error(`Erro ao adicionar: ${error.message}`);
    } else {
      toast.success(`Categoria "${name}" adicionada com sucesso!`);
      setNewCategoryName("");
      // Recarrega a lista para mostrar a nova categoria
      fetchCategories(); 
    }
    
    setIsSubmitting(false);
  };

  // 3. FUNÇÃO PARA DELETAR CATEGORIA
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria: "${name}"?`)) {
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error(`Erro ao excluir: ${error.message}`);
    } else {
      toast.success(`Categoria "${name}" excluída com sucesso!`);
      // Remove do state local para atualização instantânea
      setCategories(prev => prev.filter(c => c.id !== id));
    }
    
    setLoading(false);
  };


  return (
    <RequireAdmin>
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>

        <Card className="p-6 space-y-6">
            <h3 className="text-xl font-semibold mb-4">Adicionar Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="flex gap-4">
                <Input
                    type="text"
                    placeholder="Nome da Nova Categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={isSubmitting || loading}
                    className="flex-1"
                    required
                />
                <Button 
                    type="submit" 
                    variant="hero" 
                    disabled={isSubmitting || loading}
                >
                    {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                </Button>
            </form>
            {newCategoryName && (
                <p className="text-sm text-muted-foreground mt-2">
                    Slug Sugerido: **{slugify(newCategoryName)}**
                </p>
            )}
        </Card>

        <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Lista de Categorias</h3>
            
            {loading && categories.length === 0 && (
                <p className="text-center text-muted-foreground">Carregando categorias...</p>
            )}

            {!loading && categories.length === 0 && (
                <p className="text-center text-muted-foreground">Nenhuma categoria encontrada. Adicione uma acima!</p>
            )}

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
                            disabled={loading}
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
