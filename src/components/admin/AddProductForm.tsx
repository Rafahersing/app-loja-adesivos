// src/components/admin/AddProductForm.tsx (Conteúdo Completo e Corrigido)

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils'; // Use seu caminho de importação real
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Category as CategoryType } from '@/types/product'; 
import { Loader2 } from 'lucide-react';

interface AddProductFormProps {
    onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
    // -----------------------------------------------------------
    // ESTADOS DO PRODUTO
    // -----------------------------------------------------------
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    
    // -----------------------------------------------------------
    // ESTADOS DA CATEGORIA (CRÍTICO: USANDO STRING)
    // -----------------------------------------------------------
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]); // MUDANÇA: string[]
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [saving, setSaving] = useState(false);


    // CRÍTICO: FUNÇÃO DE BUSCA CORRIGIDA COM CONVERSÃO DE TIPAGEM
    const fetchCategories = async () => {
        setLoadingCategories(true);
        
        const { data, error } = await supabase
            .from('categorias')
            .select('id, nome, categoria_pai_id') 
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao carregar categorias para o produto:', error);
            toast.error('Não foi possível carregar as categorias.');
        } else if (data) {
            const formattedCategories: CategoryType[] = data.map(item => ({
                // CRÍTICO: CONVERTE IDs INT8 para STRING
                id: String(item.id), 
                name: item.nome, 
                categoria_pai_id: item.categoria_pai_id ? String(item.categoria_pai_id) : null,
            } as CategoryType));

            setCategories(formattedCategories);
        }
        setLoadingCategories(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryChange = (categoryId: string) => { // MUDANÇA: categoryId é string
        setSelectedCategoryIds(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };
    
    // Função auxiliar para aninhar categorias para exibição
    const getNestedCategories = (cats: CategoryType[], parentId: string | null = null) => { // MUDANÇA: parentId é string | null
        return cats
            .filter(cat => cat.categoria_pai_id === parentId)
            .map(parentCat => ({
                ...parentCat,
                children: getNestedCategories(cats, parentCat.id)
            }));
    };

    const nestedCategories = getNestedCategories(categories);
    
    // -----------------------------------------------------------
    // LÓGICA DE SALVAMENTO DE PRODUTO
    // -----------------------------------------------------------
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // 1. Inserir Produto
        const { data: productData, error: productError } = await supabase
            .from('produtos')
            // Assumimos que o ID do produto é UUID (string) e gerado no backend ou pelo cliente
            .insert({ 
                title, 
                price, 
                image_url: imageUrl, 
                description
                // Você pode precisar adicionar o 'user_id' se sua RLS exigir
            })
            // Retorna o ID do produto inserido para usar na tabela de categorias
            .select('id')
            .single();

        if (productError) {
            toast.error(`Falha ao salvar produto: ${productError.message}`);
            setSaving(false);
            return;
        }

        // 2. Inserir Relações Produto-Categoria
        if (selectedCategoryIds.length > 0) {
            const relations = selectedCategoryIds.map(catId => ({
                product_id: productData.id,
                category_id: catId, // catId é STRING, alinhado à correção de tipagem
            }));

            const { error: categoryError } = await supabase
                .from('produtos_categorias')
                .insert(relations);

            if (categoryError) {
                // Se falhar, o produto é salvo, mas sem categoria. Avisamos o usuário.
                toast.warning(`Produto salvo, mas falha ao vincular categorias: ${categoryError.message}`);
            }
        }
        
        toast.success(`Produto '${title}' adicionado com sucesso!`);
        onProductAdded();
        
        // Limpa o formulário
        setTitle('');
        setPrice(0);
        setImageUrl('');
        setDescription('');
        setSelectedCategoryIds([]);

        setSaving(false);
    };

    return (
        <form onSubmit={handleSaveProduct} className="p-4 bg-black text-white space-y-6">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                    type="text"
                    placeholder="Nome do produto"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                />
                <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                    step="0.01"
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                />
            </div>
            
            <Input
                type="url"
                placeholder="https://exemplo.com/imagem.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
            />

            {/* ⭐️ SELEÇÃO DE CATEGORIAS (Corrigido para usar strings) ⭐️ */}
            <div className="space-y-2">
                <label className="block text-sm font-medium">Categorias* (selecione uma ou mais)</label>
                <div className="border border-gray-700 p-3 h-48 overflow-y-auto rounded-md bg-gray-900">
                    {loadingCategories ? (
                        <p className='text-gray-500 flex items-center'><Loader2 className='h-4 w-4 mr-2 animate-spin'/> Carregando categorias...</p>
                    ) : nestedCategories.length === 0 ? (
                        <p className='text-gray-500'>Nenhuma categoria encontrada. Cadastre em "Categorias".</p>
                    ) : (
                        // Renderização das Categorias
                        nestedCategories.map((category) => (
                            <div key={category.id} className="mb-1">
                                <label className="flex items-center text-white">
                                    <input
                                        type="checkbox"
                                        // key e checked usam o ID como STRING
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

            <Textarea
                placeholder="Descreva o produto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
            />
            
            <Button 
                type="submit" 
                disabled={saving || loadingCategories || !title || price <= 0 || selectedCategoryIds.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
                {saving ? <Loader2 className='h-4 w-4 mr-2 animate-spin'/> : 'Adicionar Produto'}
            </Button>
        </form>
    );
};

export default AddProductForm;
