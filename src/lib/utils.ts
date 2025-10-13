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
 * Busca todos os produtos.
 * AJUSTADO: Usa 'url_imagem' e garante que 'preco' seja um número.
 * @returns Um array de objetos de produto mapeado para a interface Product.
 */
export async function fetchProducts() {
    const { data, error } = await supabase
        .from('produtos')
        .select(`
            id, 
            titulo, 
            preco, 
            url_imagem, 
            descricao,
            created_at,
            produtos_categorias!inner(categoria_id) 
        `) 
        .order('titulo', { ascending: false });

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }

    // AJUSTE CRÍTICO DE MAPEAMENTO: Proteção contra 'null' em price e mapeamento de campos.
    const productsData = data.map((product: any) => ({
        // Mapeamento snake_case (DB) -> camelCase (Frontend Interface)
        id: product.id,
        title: product.titulo,
        description: product.descricao,
        // ⭐️ CORREÇÃO DO ERRO: Garante que 'price' seja um número.
        price: parseFloat(product.preco) || 0, 
        imageUrl: product.url_imagem || '', 
        imageUrlHighRes: product.url_imagem || '', // Usando a mesma URL
        createdAt: product.created_at,
        // Assume que só há uma categoria por produto para o filtro de loja (1:N virtual)
        category_id: product.produtos_categorias[0]?.categoria_id || null, 
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
