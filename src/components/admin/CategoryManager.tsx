// src/components/admin/CategoryManager.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils'; // Use seu caminho real de importação
// NOVOS IMPORTS
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Importamos a tipagem correta, onde id e categoria_pai_id são 'number'
import { Category } from '@/types/product'; 

// Ajustamos o tipo Category local para usar 'number' e 'categoria_pai_id'
interface Category {
  id: number; // AJUSTADO: Se o Supabase usa INT8, o ID é number
  name: string;
  slug: string;
  categoria_pai_id: number | null; // NOVO CAMPO: Para exibir a hierarquia
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  // NOVO ESTADO: Para a seleção da Categoria Pai no formulário de adição
  const [selectedParentId, setSelectedParentId] = useState<string>("null"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null); // AJUSTADO: ID de edição é number
  const [editingName, setEditingName] = useState('');

  // -----------------------------------------------------------
  // LÓGICA DE DADOS
  // -----------------------------------------------------------

  // Função READ (Leitura)
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    // CORREÇÃO: Selecionamos o novo campo 'categoria_pai_id'
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome, slug, categoria_pai_id') // nome no DB é 'nome'
      .order('nome', { ascending: true }); // ordenamos por 'nome'

    if (error) {
      setError('Erro ao carregar categorias: ' + error.message);
    } else if (data) {
        // Mapeamos os dados do banco (nome, id, slug) para o formato 'Category'
        const formattedData = data.map(item => ({
            id: item.id,
            name: item.nome, // Mapeia 'nome' do DB para 'name' no TS
            slug: item.slug,
            categoria_pai_id: item.categoria_pai_id,
        }));
      setCategories(formattedData as Category[]);
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
    
    // Lógica para determinar o ID do Pai
    let parentIdValue: number | null = null;
    if (selectedParentId !== "null") {
        parentIdValue = parseInt(selectedParentId, 10);
    }

    const { error: insertError } = await supabase
      .from('categorias')
      .insert([
        {  
          nome: newCategoryName.trim(), // Nome da coluna no DB é 'nome'
          slug: newSlug,  
          categoria_pai_id: parentIdValue // NOVO CAMPO INSERIDO
        }
      ]);

    if (insertError) {
      setError('Erro ao adicionar categoria: ' + insertError.message);
      toast.error('Falha ao adicionar categoria.');
    } else {
      setNewCategoryName('');
      setSelectedParentId("null"); // Reseta a seleção
      toast.success(`Categoria '${newCategoryName.trim()}' adicionada!`);
      await fetchCategories();
    }
    setLoading(false);
  };
  
  // Função UPDATE (Atualização)
  const saveEdit = async (id: number) => { // AJUSTADO: id é number
    if (!editingName.trim()) return;

    setLoading(true);
    setError(null);
    
    const newSlug = editingName.trim().toLowerCase().replace(/\s+/g, '-');

    const { error: updateError } = await supabase
      .from('categorias')
      .update({ nome: editingName.trim(), slug: newSlug }) // Nome da coluna no DB é 'nome'
      .eq('id', id);

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
  const handleDelete = async (id: number, name: string) => { // AJUSTADO: id é number
    // Aviso de que excluir um Pai pode afetar os Filhos (devido ao ON DELETE SET NULL)
    if (!window.confirm(`Tem certeza que deseja excluir a categoria: ${name}? Se esta for uma categoria principal, as subcategorias se tornarão categorias principais sem pai.`)) {
        return;
    }

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError('Erro ao excluir categoria: ' + deleteError.message);
      toast.error('Falha ao excluir categoria.');
    } else {
      toast.warning(`Categoria '${name}' excluída.`);
      await fetchCategories();
    }
    setLoading(false);
  };

  // -----------------------------------------------------------
  // Ciclo de Vida e Renderização
  // -----------------------------------------------------------
  
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtra apenas categorias principais para o dropdown de seleção do Pai
  const parentCategories = categories.filter(cat => cat.categoria_pai_id === null);

  // Função auxiliar para exibir o nome do Pai
  const getParentName = (parentId: number | null): string => {
    if (parentId === null) return "Principal";
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? `Subcategoria de: ${parent.name}` : "Principal (Pai não encontrado)";
  };

  if (loading && categories.length === 0) return <div className="p-4 text-gray-500">Carregando categorias...</div>;
  if (error) return <div className="p-4 text-red-600">Erro: {error}</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gerenciar Categorias</h2>
      
      {/* Formulário de Adição (AGORA COM SELEÇÃO DE PAI) */}
      <form onSubmit={addCategory} className="mb-8 flex flex-col md:flex-row gap-3">
        <div className="flex-grow flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da Nova Categoria"
              disabled={loading}
              className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-green-500 focus:border-green-500"
            />
            {/* ⭐️ NOVO: SELECT DE CATEGORIA PAI ⭐️ */}
            <Select
                value={selectedParentId}
                onValueChange={setSelectedParentId}
                disabled={loading}
            >
                <SelectTrigger className="w-full md:w-[250px] p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Categoria Pai (Opcional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="null">
                        (Categoria Principal)
                    </SelectItem>
                    {parentCategories.map((category) => (
                        // Converte ID (number) para string para o SelectItem
                        <SelectItem key={category.id} value={category.id.toString()}> 
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !newCategoryName.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 min-w-[100px]"
        >
          Adicionar
        </button>
      </form>
      
      {/* Lista de Categorias */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-100">
          {categories.map((category) => (
            // Adicionamos classes para diferenciar subcategorias (opcional, para visualização)
            <li key={category.id} className={`p-4 flex justify-between items-center transition-colors hover:bg-gray-50 ${category.categoria_pai_id !== null ? 'pl-8 bg-gray-50' : ''}`}>
              
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
                    <span className={`font-medium ${category.categoria_pai_id !== null ? 'text-gray-700' : 'text-gray-800'}`}>
                        {category.name}
                    </span>
                    {/* Exibe o status do Pai */}
                    <span className="text-sm text-gray-500 ml-3">
                        ({category.slug} - {getParentName(category.categoria_pai_id)})
                    </span>
                </div>
              )}

              {editingId !== category.id && (
                <div className="space-x-2">
                    {/* Botão de Editar */}
                    <button 
                        onClick={() => setEditingId(category.id)} // Passamos o ID (number)
                        disabled={loading}
                        className="p-2 text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
                        title="Editar"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    {/* Botão de Excluir */}
                    <button 
                        onClick={() => handleDelete(category.id, category.name)} // Passamos o ID (number)
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
