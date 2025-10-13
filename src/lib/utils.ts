// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';

// Função para combinar classes Tailwind (mantida)
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// Configuração do Supabase
// ----------------------------------------------------------------------

// 1. URL do Projeto
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;

// 2. Chave de API
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Bloco de erro removido (conforme sua solicitação)

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

// ----------------------------------------------------------------------
// Funções de Busca de Dados (Shop)
// ----------------------------------------------------------------------

/**
 * Busca todas as categorias do Supabase.
 * @returns Um array de objetos de categoria ou um array vazio em caso de erro.
 */
export async function fetchCategories() {
    const { data, error } = await supabase
        .from('categorias') // Tabela de categorias
        .select('id, nome') // 'slug' será calculado no front ou você deve adicioná-lo ao select se existir no banco
        .order('nome', { ascending: true }); // Ordena por nome

    if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
    // Retorna os dados, a tipagem no front fará o mapeamento
    return data;
}

/**
 * Busca todos os produtos e o ID da categoria.
 * AJUSTADO: Usa 'url_imagem' e assume que a tabela de junção ainda existe (produtos_categorias).
 * @returns Um array de objetos de produto ou um array vazio em caso de erro.
 */
export async function fetchProducts() {
    const { data, error } = await supabase
        .from('produtos')
        // ⭐️ AJUSTADO: Seleciona 'url_imagem' em vez de 'imagem_url' (usando o nome do banco).
        // Manter o JOIN se a relação N:N foi mantida
        .select(`
            id, 
            titulo, 
            preco, 
            url_imagem, 
            descricao,
            created_at,
            produtos_categorias!inner(categoria_id) 
        `) 
        .order('titulo', { ascending: false }); // Usando 'titulo' do banco

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }

    // ⭐️ AJUSTE DE MAPEAMENTO: Transforma o resultado do Supabase para o formato da interface Product.
    const productsData = data.map((product: any) => ({
        // Mapeamento snake_case (DB) -> camelCase (Frontend Interface)
        id: product.id,
        title: product.titulo, // DB: titulo -> Front: title
        description: product.descricao,
        price: parseFloat(product.preco) || 0,
        imageUrl: product.url_imagem || '', // DB: url_imagem -> Front: imageUrl
        imageUrlHighRes: product.url_imagem || '', // Usando a mesma URL
        createdAt: product.created_at,
        // Assume que só há uma categoria por produto para o filtro de loja (1:N virtual)
        category_id: product.produtos_categorias[0]?.categoria_id || null, 
        // category será o nome/slug da categoria, mas o card e o filtro usam 'category_id'
        category: '', 
    }));

    return productsData;
}


/**
 * Converte uma string em um formato URL-friendly (slug).
 */
export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};
