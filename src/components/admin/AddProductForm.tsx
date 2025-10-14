// src/components/admin/AddProductForm.tsx (Exemplo para correção)

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Category as CategoryType } from '@/types/product'; // Importamos a tipagem correta

interface AddProductFormProps {
    onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
    // ... estados do produto (title, price, url, etc.)

    // ESTADO DAS CATEGORIAS
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]); 
    const [loadingCategories, setLoadingCategories] = useState(false);

    // CRÍTICO: FUNÇÃO DE BUSCA CORRIGIDA
    const fetchCategories = async () => {
        setLoadingCategories(true);
        // CRÍTICO: Buscamos apenas o ID, nome (correto), e categoria_pai_id
        const { data, error } = await supabase
            .from('categorias')
            .select('id, nome, categoria_pai_id') 
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao carregar categorias para o produto:', error);
            toast.error('Não foi possível carregar as categorias.');
        } else if (data) {
            // Mapeamos o campo 'nome' do DB para 'name' do React
            const formattedCategories: CategoryType[] = data.map(item => ({
                id: item.id,
                name: item.nome, // Mapeamento CRÍTICO
                categoria_pai_id: item.categoria_pai_id,
            } as CategoryType));

            setCategories(formattedCategories);
        }
        setLoadingCategories(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryChange = (categoryId: number) => {
        // Lógica de checkbox
        setSelectedCategoryIds(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };
    
    // Função auxiliar para aninhar categorias para exibição (opcional, mas recomendado)
    const getNestedCategories = (cats: CategoryType[], parentId: number | null = null) => {
        return cats
            .filter(cat => cat.categoria_pai_id === parentId)
            .map(parentCat => ({
                ...parentCat,
                children: getNestedCategories(cats, parentCat.id)
            }));
    };

    const nestedCategories = getNestedCategories(categories);
    
    // ... (handleSaveProduct function - onde você insere na tabela 'produtos' e 'produtos_categorias')

    return (
        <div className="p-4 bg-black text-white">
            {/* ... Campos de Título, Preço, URL ... */}

            {/* ⭐️ SELEÇÃO DE CATEGORIAS (Corrigido para exibir nome) ⭐️ */}
            <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium">Categorias* (selecione uma ou mais)</label>
                <div className="border border-gray-700 p-3 h-48 overflow-y-auto rounded-md bg-gray-900">
                    {loadingCategories ? (
                        <p className='text-gray-500'>Carregando categorias...</p>
                    ) : nestedCategories.length === 0 ? (
                        <p className='text-gray-500'>Nenhuma categoria encontrada. Cadastre em "Categorias".</p>
                    ) : (
                        // Renderização das Categorias
                        nestedCategories.map((category) => (
                            <div key={category.id} className="mb-1">
                                <label className="flex items-center text-white">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategoryIds.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                        className="mr-2 h-4 w-4 bg-gray-800 border-gray-600 focus:ring-green-500"
                                    />
                                    {category.name}
                                </label>
                                {/* Renderiza Subcategorias Aninhadas */}
                                {category.children && category.children.map((subCat) => (
                                    <label key={subCat.id} className="flex items-center text-gray-400 ml-5">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategoryIds.includes(subCat.id)}
                                            onChange={() => handleCategoryChange(subCat.id)}
                                            className="mr-2 h-4 w-4 bg-gray-800 border-gray-600 focus:ring-green-500"
                                        />
                                        {subCat.name} (Sub)
                                    </label>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* ... Campo de Descrição e Botão de Salvar ... */}
        </div>
    );
};

export default AddProductForm;
