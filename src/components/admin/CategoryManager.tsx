// src/components/admin/CategoryManager.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils'; // Use seu caminho real de importação
import { Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// Importamos os componentes UI necessários
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Interface alinhada ao DB (sem slug, com descricao)
interface Category {
  id: number;
  name: string; // Mapeado de 'nome' do DB
  descricao?: string; // Coluna opcional
  categoria_pai_id: number | null; // Novo campo
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  // ESTADO DO DROPDOWN: 'null' para categoria principal
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
    
    // CRÍTICO: Removido 'slug'. Buscamos: id, nome, descricao, categoria_pai_id.
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome, descricao, categoria_pai_id') 
      .order('nome', { ascending: true });

    if (error) {
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
    const name = newCategoryName.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    
    let parentIdValue: number | null = null;
    if (selectedParentId !== "null") {
        // Converte a string do Select para número (INT8)
        parentIdValue = parseInt(selectedParentId, 10); 
    }

    const { error: insertError } = await supabase
      .from('categorias')
      .insert([
        {  
          nome: name, 
          // Não inserimos slug
          categoria_pai_id: parentIdValue
        }
      ]);

    if (insertError) {
      setError('Erro ao adicionar categoria: ' + insertError.message);
      toast.error('Falha ao adicionar categoria.');
    } else {
      setNewCategoryName('');
      setSelectedParentId("null"); 
      toast.success(`Categoria '${name}' adicionada!`);
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
      .update({ nome: editingName.trim() }) // Atualizamos apenas o 'nome'
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
  
  // -----------------------------------------------------------
  // Ciclo de Vida e Renderização
  // -----------------------------------------------------------
  
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
      <h2 className="text-2xl font-bold mb-6 text-white">Gerenciar Categorias</h2>
      
      {/* Formulário de Adição (COM SELEÇÃO DE PAI) */}
      {/* ⭐️ CORES AJUSTADAS PARA O TEMA ESCURO ⭐️ */}
      <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-900">
        <h3 className="text-lg font-semibold mb-3 text-white">Adicionar Nova Categoria</h3>
        <form onSubmit={addCategory} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da Nova Categoria"
                    disabled={loading}
                    // Input ajustado
                    className="p-3 border border-gray-700 rounded-lg flex-grow focus:ring-green-500 focus:border-green-500 bg-gray-800 text-white placeholder-gray-400"
                    required
                />
                {/* SELECT DE CATEGORIA PAI */}
                <Select
                    value={selectedParentId}
                    onValueChange={setSelectedParentId}
                    disabled={loading}
                >
                    <SelectTrigger 
                        // SelectTrigger ajustado
                        className="w-full md:w-[250px] p-3 border border-gray-700 rounded-lg focus:ring-green-500 focus:border-green-500 bg-gray-800 text-white"
                    >
                        <SelectValue placeholder="Categoria Pai (Opcional)" />
                    </SelectTrigger>
                    {/* SelectContent e SelectItem (devem herdar o tema) */}
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
      <h3 className="text-xl font-semibold mb-3 mt-8 text-white">Lista de Categorias ({categories.length})</h3>
      
      {/* Input de Busca */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Input ajustado
            className="pl-10 border border-gray-700 bg-gray-800 text-white placeholder-gray-400"
        />
      </div>
      
      {/* ⭐️ Fundo da lista ajustado ⭐️ */}
      <div className="bg-gray-900 shadow-lg rounded-lg border border-gray-700">
        <ul className="divide-y divide-gray-700">
            {filteredCategories.length === 0 && (
                <li className='p-4 text-center text-gray-500'>Nenhuma categoria encontrada.</li>
            )}
          {filteredCategories.map((category) => (
            // ⭐️ Cores dos itens ajustadas ⭐️
            <li key={category.id} className={`p-4 flex justify-between items-center transition-colors hover:bg-gray-800 ${category.categoria_pai_id !== null ? 'pl-8 bg-gray-800' : ''}`}>
              
              {editingId === category.id ? (
                // MODO EDIÇÃO 
                <div className='flex-grow flex gap-2 items-center'>
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="p-1 border border-blue-400 rounded flex-grow bg-gray-800 text-white"
                    />
                    <button onClick={() => saveEdit(category.id)} disabled={loading} className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50">Salvar</button>
                    <button onClick={() => setEditingId(null)} disabled={loading} className="bg-gray-400 text-white text-sm px-3 py-1 rounded hover:bg-gray-500 disabled:opacity-50">Cancelar</button>
                </div>
              ) : (
                // MODO VISUALIZAÇÃO
                <div className='flex-grow'>
                    <span className={`font-medium ${category.categoria_pai_id !== null ? 'text-gray-300' : 'text-white'}`}>
                        {category.name}
                    </span>
                    <span className="text-sm text-gray-500 ml-3">
                        ({category.descricao || 'Sem descrição'} - {getParentName(category.categoria_pai_id)})
                    </span>
                </div>
              )}

              {editingId !== category.id && (
                <div className="space-x-2">
                    <button onClick={() => { setEditingId(category.id); setEditingName(category.name); }} disabled={loading} className="p-2 text-blue-500 hover:text-blue-300 transition-colors disabled:opacity-50" title="Editar"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(category.id, category.name)} disabled={loading} className="p-2 text-red-500 hover:text-red-300 transition-colors disabled:opacity-50" title="Excluir"><Trash2 className="h-4 w-4" /></button>
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
