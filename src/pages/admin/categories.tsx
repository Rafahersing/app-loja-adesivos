// src/pages/admin/categories.tsx

import React, { useState, useEffect } from "react";
import RequireAdmin from "@/components/layout/RequireAdmin"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
// IMPORTANTE: Ajuste o caminho se o alias @/lib/utils não funcionar.
// Tente: import { supabase, slugify } from '../../lib/utils'; se precisar.
import { supabase, slugify } from '@/lib/utils'; 

interface Category {
  id: string; 
  name: string;
  slug: string;
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. FUNÇÃO PARA BUSCAR CATEGORIAS NO SUPABASE
  const fetchCategories = async () => {
    // ⭐️ TESTE DE DEBBUG: Adicione um log aqui para ver se a função é chamada
    console.log("Tentando buscar categorias..."); 
    
    setLoading(true);
    // VERIFIQUE: Se o objeto 'supabase' ou a função 'from' são inválidos, quebra aqui.
    const { data, error } = await supabase
      .from('categorias') // VERIFIQUE: O nome da sua tabela é 'categorias'
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      // ⭐️ TESTE DE DEBBUG: Adicione um log aqui se houver erro no Supabase
      console.error('ERRO SUPABASE:', error); 
      toast.error('Erro ao carregar lista de categorias.');
      setCategories([]); 
    } else if (data) {
      console.log("Categorias carregadas com sucesso:", data); // Log de sucesso
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. FUNÇÃO PARA ADICIONAR CATEGORIA NO SUPABASE
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();

    if (!name) {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    
    const slug = slugify(name);
    if (categories.some(c => c.slug === slug)) {
        toast.error(`A categoria "${name}" (slug: ${slug}) já existe.`);
        return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('categorias')
      .insert({ name: name, slug: slug });

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error(`Erro ao adicionar: ${error.message}`);
    } else {
      toast.success(`Categoria "${name}" adicionada com sucesso!`);
      setNewCategoryName("");
      fetchCategories(); 
    }
    
    setIsSubmitting(false);
  };

  // 3. FUNÇÃO PARA DELETAR CATEGORIA NO SUPABASE
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
      setCategories(prev => prev.filter(c => c.id !== id));
    }
    
    setLoading(false);
  };


  return (
    <RequireAdmin>
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>

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
                <Button 
                    type="submit" 
                    variant="hero" 
                    disabled={isSubmitting || loading}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adicionando...
                        </>
                    ) : 'Adicionar'}
                </Button>
            </form>
            {/* Pré-visualização do Slug */}
            {newCategoryName.trim() && (
                <p className="text-sm text-muted-foreground mt-2">
                    Slug Sugerido: **{slugify(newCategoryName)}**
                </p>
            )}
        </Card>

        {/* --- Lista de Categorias --- */}
        <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Lista de Categorias</h3>
            
            {/* Indicador de Carregamento */}
            {loading && categories.length === 0 && (
                <div className="flex justify-center items-center py-4 text-muted-foreground">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Carregando categorias...
                </div>
            )}

            {/* Mensagem de Vazio */}
            {!loading && categories.length === 0 && (
                <p className="text-center text-muted-foreground">Nenhuma categoria encontrada. Adicione uma acima!</p>
            )}

            {/* Renderização da Lista */}
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
