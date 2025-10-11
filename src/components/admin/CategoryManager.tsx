// src/components/admin/CategoryManager.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils'; // Use seu caminho real de importação

// 1. Corrigido: Interface para usar 'name'
interface Category {
  id: string;
  name: string; // COLUNA CORRETA NO BANCO DE DADOS
  slug: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  // Corrigido: Variável para armazenar o nome
  const [newCategoryName, setNewCategoryName] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função READ (Leitura)
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('categorias')
      // 2. Corrigido: SELECT pela coluna 'name'
      .select('id, name, slug') 
      .order('name', { ascending: true }); // ORDER BY 'name'

    if (error) {
      setError('Erro ao carregar categorias: ' + error.message);
    } else if (data) {
      // O Supabase retorna um array com as colunas certas, basta tipar.
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

    // Simplificando o SLUG: Converte nome para minúsculas e substitui espaços por traços
    const newSlug = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');

    const { error } = await supabase
      .from('categorias')
      // 3. Corrigido: INSERT na coluna 'name'
      .insert([
        { 
            name: newCategoryName.trim(), // Use 'name'
            slug: newSlug 
        }
      ]);

    if (error) {
      setError('Erro ao adicionar categoria: ' + error.message);
    } else {
      setNewCategoryName('');
      await fetchCategories(); // Recarrega a lista
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading && categories.length === 0) return <div className="p-4 text-gray-500">Carregando categorias...</div>;
  // Se houver erro aqui, é um erro de RLS ou outro erro inesperado
  if (error) return <div className="p-4 text-red-600">Erro: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gerenciar Categorias</h2>
      
      {/* Formulário de Adição */}
      <form onSubmit={addCategory} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nome da Nova Categoria"
          disabled={loading}
          className="p-2 border rounded flex-grow"
        />
        <button 
          type="submit" 
          disabled={loading || !newCategoryName.trim()}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
      
      {/* Lista de Categorias */}
      <ul className="border rounded divide-y">
        {categories.map((category) => (
          <li key={category.id} className="p-3 flex justify-between items-center">
            {/* 4. Corrigido: Renderiza category.name */}
            <span>{category.name} ({category.slug})</span> 
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;
