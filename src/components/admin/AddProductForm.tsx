// src/components/admin/AddProductForm.tsx 
// ESTA VERSÃO CONTÉM UM BLOCO DE TESTE DE CONEXÃO NO LUGAR DA RENDERIZAÇÃO NORMAL DE CHECKBOXES.

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils'; // Use seu caminho de importação real
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Category as CategoryType } from '@/types/product'; // Certifique-se que o ID aqui é STRING
import { Loader2 } from 'lucide-react';

interface AddProductFormProps {
    onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
    // -----------------------------------------------------------
    // ESTADOS DO PRODUTO E CATEGORIAS
    // -----------------------------------------------------------
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    
    // IDs de Categoria tratados como STRING (para int8)
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]); 
    
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [saving, setSaving] = useState(false);


    // -----------------------------------------------------------
    // BUSCA E MAPEAMENTO DE CATEGORIAS (COM LOGS DE DEBUG)
    // -----------------------------------------------------------
    const fetchCategories = async () => {
        setLoadingCategories(true);
        
        const { data, error } = await supabase
            .from('categorias')
            // Busca apenas colunas existentes e necessárias
            .select('id, nome, categoria_pai_id') 
            .order('nome', { ascending: true });

        if (error) {
            console.error('ERRO SUPABASE - BUSCA DE CATEGORIAS:', error); // <-- LOG CRÍTICO
            toast.error('Não foi possível carregar as categorias. Verifique o RLS ou conexão.');
        } else if (data) {
            console.log('DADOS BRUTOS SUPABASE (Categorias):', data); // <-- LOG CRÍTICO
            
            const formattedCategories: CategoryType[] = data.map(item => ({
                // CRÍTICO: CONVERTE IDs INT8 para STRING
                id: String(item.id), 
                name: item.nome, 
                categoria_pai_id: item.categoria_pai_id ? String(item.categoria_pai_id) : null,
            } as CategoryType));

            console.log('DADOS FORMATADOS (Categorias):', formattedCategories); // <-- LOG CRÍTICO

            setCategories(formattedCategories);
        }
        setLoadingCategories(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // NOTE: Funções de categoria e salvamento foram mantidas, mas o foco é o bloco de teste na renderização.

    // -----------------------------------------------------------
    // LÓGICA DE SALVAMENTO DE PRODUTO
    // -----------------------------------------------------------
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || price <= 0 || !imageUrl || !description || selectedCategoryIds.length === 0) {
            toast.warning("Preencha todos os campos obrigatórios, incluindo ao menos uma categoria.");
            return;
        }

        setSaving(true);

        // 1. Inserir Produto
        const { data: productData, error: productError } = await supabase
            .from('produtos')
            .insert({ 
                title, 
                price, 
                image_url: imageUrl, 
                description
            })
            .select('id')
            .single();

        if (productError || !productData) {
            toast.error(`Falha ao salvar produto: ${productError?.message || 'Erro desconhecido.'}`);
            setSaving(false);
            return;
        }
        
        const newProductId = productData.id;

        // 2. Inserir Relações Produto-Categoria
        const relations = selectedCategoryIds.map(catId => ({
            product_id: newProductId,
            category_id: catId, 
        }));

        const { error: categoryError } = await supabase
            .from('produtos_categorias')
            .insert(relations);

        if (categoryError) {
            toast.warning(`Produto salvo, mas falha ao vincular categorias: ${categoryError.message}`);
        } else {
            toast.success(`Produto '${title}' adicionado com sucesso!`);
        }
        
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
                placeholder="URL da Imagem (https://exemplo.com/imagem.png)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
            />

            {/* ⭐️ TRECHO DE RENDERIZAÇÃO DE TESTE CRÍTICO ⭐️ */}
            <div className="space-y-2">
                <label className="block text-sm font-medium">Categorias* (TESTE DE CONEXÃO)</label>
                <div className="border border-gray-700 p-3 h-48 overflow-y-auto rounded-md bg-gray-900">
                    {loadingCategories ? (
                        <p className='text-yellow-500 flex items-center'><Loader2 className='h-4 w-4 mr-2 animate-spin'/> Carregando...</p>
                    ) : (
                        <div>
                            {/* RESULTADO DO TESTE DE DADOS */}
                            <p className='text-white font-bold'>Total de Categorias Encontradas: {categories.length}</p>
                            
                            {/* Exibe o nome e ID de cada categoria para confirmar que os dados chegaram */}
                            {categories.map((cat, index) => (
                                <p key={cat.id} className='text-green-400 text-sm'>
                                    {index + 1}. {cat.name} (ID: {cat.id})
                                </p>
                            ))}
                            
                            {categories.length === 0 && (
                                <p className='text-red-500'>FALHA: Array Vazio. Verifique o console para "ERRO SUPABASE".</p>
                            )}
                        </div>
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
                disabled={saving || loadingCategories || !title || price <= 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
                {saving ? <Loader2 className='h-4 w-4 mr-2 animate-spin'/> : 'Adicionar Produto'}
            </Button>
        </form>
    );
};

export default AddProductForm;
