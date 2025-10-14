// src/components/admin/CategoryManager.tsx (CORREÇÃO DE SLUG)

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils'; // Use seu caminho real de importação
import { Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Interface alinhada ao DB (sem slug, com descricao)
interface Category {
  id: number;
  name: string; // Mapeado de 'nome' do DB
  descricao?: string; // Coluna opcional
  categoria_pai_id: number | null;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>("null"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // -----------------------------------------------------------
  // LÓGICA DE DADOS
  // -----------------------------------------------------------

  // Função READ (Leitura)
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    // CRÍTICO: Removido 'slug'. Buscamos o nome REAL das colunas: id, nome, descricao, categoria_pai_id.
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome, descricao, categoria_pai_id') 
      .order('nome', { ascending: true });

    if (error) {
      // Exibe o erro se a coluna realmente não existir
      setError('Erro ao carregar categorias: ' + error.message);
    } else if (data) {
        // Mapeamos 'nome' do DB para 'name' do React
        const formattedData = data.map(item => ({
            id: item.id,
            name: item.nome, 
            descricao: item.descricao,
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
    
    let parentIdValue: number | null = null;
    if (selectedParentId !== "null") {
        parentIdValue = parseInt(selectedParentId, 10); 
    }

    const { error: insertError } = await supabase
      .from('categorias')
      .insert([
        {  
          nome: newCategoryName.trim(), 
          // REMOVIDO: Não tentamos mais inserir 'slug'
          categoria_pai_id: parentIdValue
        }
      ]);

    if (insertError) {
      setError('Erro ao adicionar categoria: ' + insertError.message);
      toast.error('Falha ao adicionar categoria.');
    } else {
      setNewCategoryName('');
      setSelectedParentId("null"); 
      toast.success(`Categoria '${newCategoryName.trim()}' adicionada!`);
      await fetchCategories();
    }
    setLoading(false);
  };
  
  // Função UPDATE (Atualização)
  const saveEdit = async (id: number) => { 
    if (!editingName.trim()) return;

    setLoading(true);
    setError(null);
    
    const { error: updateError } = await supabase
      .from('categorias')
      // Atualizamos apenas o 'nome'
      .update({ nome: editingName.trim() }) 
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

  const handleDelete = async (id: number, name: string) => { 
    if (!window.confirm(`Tem certeza que deseja excluir a categoria: ${name}?`)) {
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
  
  // [Restante do código de renderização, que já tem o Select de Categoria Pai e a lógica de exibição...]
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const parentCategories = categories.filter(cat => cat.categoria_pai_id === null);

  const getParentName = (parentId: number | null): string => {
    if (parentId === null) return "Principal";
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? `Subcategoria de: ${parent.name}` : "Principal (Pai não encontrado)";
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.descricao && category.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && categories.length === 0) return <div className="p-4 text-gray-500">Carregando categorias...</div>;
  if (error) return <div className="p-4 text-red-600">Erro: {error}</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gerenciar Categorias</h2>
      
      {/* Formulário de Adição (AGORA COM SELEÇÃO DE PAI) */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Adicionar Nova Categoria</h3>
        <form onSubmit={addCategory} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da Nova Categoria"
                    disabled={loading}
                    className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-green-500 focus:border-green-500"
                    required
                />
                {/* ⭐️ SELECT DE CATEGORIA PAI ⭐️ */}
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                Adicionar Categoria
            </button>
        </form>
      </div>
      
      {/* Lista de Categorias */}
      <h3 className="text-xl font-semibold mb-3 mt-8">Lista de Categorias ({categories.length})</h3>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
        />
      </div>
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-100">
            {filteredCategories.length === 0 && (
                <li className='p-4 text-center text-gray-500'>Nenhuma categoria encontrada.</li>
            )}
          {filteredCategories.map((category) => (
            <li key={category.id} className={`p-4 flex justify-between items-center transition-colors hover:bg-gray-50 ${category.categoria_pai_id !== null ? 'pl-8 bg-gray-50' : ''}`}>
              
              {editingId === category.id ? (
                // MODO EDIÇÃO 
                <div className='flex-grow flex gap-2 items-center'>
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="p-1 border border-blue-400 rounded flex-grow"
                    />
                    <button onClick={() => saveEdit(category.id)} disabled={loading} className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50">Salvar</button>
                    <button onClick={() => setEditingId(null)} disabled={loading} className="bg-gray-400 text-white text-sm px-3 py-1 rounded hover:bg-gray-500 disabled:opacity-50">Cancelar</button>
                </div>
              ) : (
                // MODO VISUALIZAÇÃO
                <div className='flex-grow'>
                    <span className={`font-medium ${category.categoria_pai_id !== null ? 'text-gray-700' : 'text-gray-800'}`}>
                        {category.name}
                    </span>
                    <span className="text-sm text-gray-500 ml-3">
                        ({category.descricao || 'Sem descrição'} - {getParentName(category.categoria_pai_id)})
                    </span>
                </div>
              )}

              {editingId !== category.id && (
                <div className="space-x-2">
                    <button onClick={() => { setEditingId(category.id); setEditingName(category.name); }} disabled={loading} className="p-2 text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50" title="Editar"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(category.id, category.name)} disabled={loading} className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50" title="Excluir"><Trash2 className="h-4 w-4" /></button>
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
