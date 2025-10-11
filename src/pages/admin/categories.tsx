// src/pages/admin/categories.tsx

import React, { useState, useEffect, useMemo } from "react";
// O RequireAdmin continua comentado
// import RequireAdmin from "@/components/layout/RequireAdmin"; 

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Loader2, Edit, Plus, Search } from "lucide-react"; // Importar 'Search'
import { toast } from "sonner";
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // ⭐️ NOVO ESTADO: Termo de pesquisa ⭐️
  const [searchTerm, setSearchTerm] = useState("");


  // Função para buscar (mantida)
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('ERRO SUPABASE:', error);
      toast.error('Erro ao carregar lista de categorias. Verifique a RLS e as Variáveis de Ambiente.');
      setCategories([]); 
    } else if (data) {
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  
  // ⭐️ NOVO: Lógica de Filtragem (Pesquisa no Frontend) ⭐️
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase().trim();
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(lowerCaseSearch) ||
      category.slug.toLowerCase().includes(lowerCaseSearch)
    );
  }, [categories, searchTerm]); // Recalcula sempre que a lista ou o termo mudar


  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    // ... (handleSaveCategory permanece o mesmo) ...
    e.preventDefault();
    const name = newCategoryName.trim();

    if (!name) {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    
    const slug = slugify(name);
    
    const isSlugDuplicate = categories.some(
        c => c.slug === slug && c.id !== editingCategory?.id
    );
    if (isSlugDuplicate) {
        toast.error(`O slug "${slug}" já existe em outra categoria.`);
        return;
    }

    setIsSubmitting(true);
    let error = null;

    if (editingCategory) {
        // Lógica de EDIÇÃO (UPDATE)
        ({ error } = await supabase
            .from('categorias')
            .update({ name: name, slug: slug })
            .eq('id', editingCategory.id));
        
        if (!error) {
            toast.success(`Categoria "${name}" atualizada com sucesso!`);
            setEditingCategory(null);
        }
    } else {
        // Lógica de ADIÇÃO (INSERT)
        ({ error } = await supabase
            .from('categorias')
            .insert({ name: name, slug: slug }));

        if (!error) {
            toast.success(`Categoria "${name}" adicionada com sucesso!`);
        }
    }

    if (error) {
      console.error('Erro de Supabase:', error);
      toast.error(`Erro: ${error.message}`);
    } else {
      setNewCategoryName("");
      fetchCategories(); 
    }
    
    setIsSubmitting(false);
  };
  
  const handleCancelEdit = () => {
      setEditingCategory(null);
      setNewCategoryName("");
  }


  const handleDeleteCategory = async (id: string, name: string) => {
    // ... (handleDeleteCategory permanece o mesmo) ...
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
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>

      {/* --- Formulário de Adição/Edição --- */}
      <Card className="p-6 space-y-6">
          <h3 className="text-xl font-semibold mb-4">
              {editingCategory ? `Editando: ${editingCategory.name}` : 'Adicionar Nova Categoria'}
          </h3>
          <form onSubmit={handleSaveCategory} className="flex gap-4">
              <Input
                  type="text"
                  placeholder="Nome da Categoria (Ex: Açaí, Lanches)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={isSubmitting || loading}
                  className="flex-1"
                  required
              />
              <div className="flex gap-2">
                  <Button 
                      type="submit" 
                      variant="hero" 
                      disabled={isSubmitting || loading}
                  >
                      {isSubmitting ? (
                          <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {editingCategory ? 'Salvando...' : 'Adicionando...'}
                          </>
                      ) : (
                        <>
                          {editingCategory ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          {editingCategory ? 'Salvar Edição' : 'Adicionar'}
                        </>
                      )}
                  </Button>
                  
                  {/* Botão de Cancelar Edição */}
                  {editingCategory && (
                      <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          disabled={isSubmitting || loading}
                      >
                          Cancelar
                      </Button>
                  )}
              </div>
          </form>
          {/* Pré-visualização do Slug */}
          {newCategoryName.trim() && (
              <p className="text-sm text-muted-foreground mt-2">
                  Slug: **{slugify(newCategoryName)}**
              </p>
          )}
      </Card>

      {/* --- Lista de Categorias --- */}
      <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Lista de Categorias</h3>
          
          {/* ⭐️ NOVO: Input de Pesquisa ⭐️ */}
          <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="Pesquisar por nome ou slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={loading}
              />
          </div>

          {/* Indicador de Carregamento */}
          {loading && categories.length === 0 && (
              <div className="flex justify-center items-center py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Carregando categorias...
              </div>
          )}

          {/* Mensagem de Vazio Pós-Filtro */}
          {!loading && categories.length > 0 && filteredCategories.length === 0 && (
              <p className="text-center text-muted-foreground">Nenhuma categoria encontrada para o termo "{searchTerm}".</p>
          )}
          
          {/* Mensagem de Vazio Inicial */}
          {!loading && categories.length === 0 && (
              <p className="text-center text-muted-foreground">Nenhuma categoria encontrada. Adicione uma acima!</p>
          )}


          {/* Renderização da Lista (usa filteredCategories) */}
          <div className="space-y-3">
              {filteredCategories.map((category) => (
                  <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10"
                  >
                      <p className="font-medium">
                          {category.name} <span className="text-sm text-muted-foreground">({category.slug})</span>
                      </p>
                      <div className="flex gap-2">
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                              disabled={loading || isSubmitting}
                          >
                              <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              disabled={loading || isSubmitting}
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  </div>
              ))}
          </div>
      </Card>

    </div>
  );
};

export default AdminCategoriesPage;
