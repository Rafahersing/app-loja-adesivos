// src/components/admin/CategoryManager.tsx (CÓDIGO FINAL DE LÓGICA)

import React, { useState, useEffect } from 'react';
// ⚠️ VERIFIQUE ESTE CAMINHO ⚠️
import { supabase } from '@/lib/utils'; 

interface Category {
  id: string;
  nome: string;
  slug: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função READ (Leitura)
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome, slug')
      .order('nome', { ascending: true });

    if (error) {
      // Se houver erro, a RLS do Supabase é o principal suspeito (já corrigido)
      setError('Erro ao carregar categorias: ' + error.message);
    } else if (data) {
      setCategories(data);
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

    const { error } = await supabase
      .from('categorias')
      .insert([{ nome: newCategoryName.trim(), slug: newSlug }]);

    if (error) {
      setError('Erro ao adicionar categoria: ' + error.message);
    } else {
      setNewCategoryName('');
      await fetchCategories(); 
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Mensagens de Estado
  if (loading && categories.length === 0) return <div className="p-4 text-gray-500">Carregando categorias...</div>;
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
            <span>{category.nome} ({category.slug})</span>
            {/* Aqui entrariam os botões de Editar e Deletar */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;
