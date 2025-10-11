// src/components/admin/CategoryManager.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils'; // Use seu caminho real de importação
// ⭐️ NOVOS IMPORTS: Ícones e toast para feedback ⭐️
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐️ NOVO ESTADO: Para saber qual categoria está sendo editada ⭐️
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Função READ (Leitura)
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('categorias')
      .select('id, name, slug') 
      .order('name', { ascending: true });

    if (error) {
      setError('Erro ao carregar categorias: ' + error.message);
    } else if (data) {
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  // Função CREATE (Criação)
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    setError(null);

    const newSlug = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');

    const { error: insertError } = await supabase
      .from('categorias')
      .insert([
        {  
          name: newCategoryName.trim(), 
          slug: newSlug  
        }
      ]);

    if (insertError) {
      setError('Erro ao adicionar categoria: ' + insertError.message);
      toast.error('Falha ao adicionar categoria.');
    } else {
      setNewCategoryName('');
      toast.success(`Categoria '${newCategoryName.trim()}' adicionada!`);
      await fetchCategories();
    }
    setLoading(false);
  };
  
  // -----------------------------------------------------------
  // ⭐️ NOVAS FUNÇÕES: UPDATE e DELETE ⭐️
  // -----------------------------------------------------------
  
  // Inicia o modo de edição
  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  // Função UPDATE (Atualização)
  const saveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    setLoading(true);
    setError(null);
    
    const newSlug = editingName.trim().toLowerCase().replace(/\s+/g, '-');

    const { error: updateError } = await supabase
      .from('categorias')
      .update({ name: editingName.trim(), slug: newSlug })
      .eq('id', id); // Condição: onde o ID for igual

    if (updateError) {
      setError('Erro ao atualizar categoria: ' + updateError.message);
      toast.error('Falha ao atualizar categoria.');
    } else {
      toast.success('Categoria atualizada com sucesso!');
      setEditingId(null);
      setEditingName('');
      await fetchCategories();
    }
    setLoading(false);
  };

  // Função DELETE (Exclusão)
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria: ${name}?`)) {
        return;
    }

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id); // Condição: onde o ID for igual

    if (deleteError) {
      setError('Erro ao excluir categoria: ' + deleteError.message);
      toast.error('Falha ao excluir categoria.');
    } else {
      toast.warning(`Categoria '${name}' excluída.`);
      await fetchCategories(); // Recarrega a lista
    }
    setLoading(false);
  };

  // -----------------------------------------------------------
  // Ciclo de Vida e Renderização
  // -----------------------------------------------------------
  
  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading && categories.length === 0) return <div className="p-4 text-gray-500">Carregando categorias...</div>;
  if (error) return <div className="p-4 text-red-600">Erro: {error}</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gerenciar Categorias</h2>
      
      {/* Formulário de Adição */}
      <form onSubmit={addCategory} className="mb-8 flex gap-3">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nome da Nova Categoria"
          disabled={loading}
          className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-green-500 focus:border-green-500"
        />
        <button 
          type="submit" 
          disabled={loading || !newCategoryName.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
      
      {/* Lista de Categorias */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-100">
          {categories.map((category) => (
            <li key={category.id} className="p-4 flex justify-between items-center transition-colors hover:bg-gray-50">
              
              {editingId === category.id ? (
                // ⭐️ MODO EDIÇÃO ⭐️
                <div className='flex-grow flex gap-2 items-center'>
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="p-1 border border-blue-400 rounded flex-grow"
                    />
                    <button 
                        onClick={() => saveEdit(category.id)} 
                        disabled={loading}
                        className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        Salvar
                    </button>
                    <button 
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                        className="bg-gray-400 text-white text-sm px-3 py-1 rounded hover:bg-gray-500 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
              ) : (
                // ⭐️ MODO VISUALIZAÇÃO ⭐️
                <div className='flex-grow'>
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <span className="text-sm text-gray-500 ml-3">({category.slug})</span>
                </div>
              )}

              {editingId !== category.id && (
                <div className="space-x-2">
                    {/* Botão de Editar */}
                    <button 
                        onClick={() => startEdit(category)} 
                        disabled={loading}
                        className="p-2 text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
                        title="Editar"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    {/* Botão de Excluir */}
                    <button 
                        onClick={() => handleDelete(category.id, category.name)} 
                        disabled={loading}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        title="Excluir"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManager;
