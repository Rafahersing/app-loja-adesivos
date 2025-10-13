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

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

// ----------------------------------------------------------------------
// Funções de Busca de Dados (Shop) - AGORA LANÇAM ERROS
// ----------------------------------------------------------------------

/**
 * Busca todas as categorias do Supabase.
 * @returns Um array de objetos de categoria.
 */
export async function fetchCategories() {
    const { data, error } = await supabase
        .from('categorias')
        .select('id, nome') 
        .order('nome', { ascending: true });

    if (error) {
        // ⭐️ DIAGNÓSTICO: Lança o erro para o frontend capturar
        throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }
    return data;
}

/**
 * Busca todos os produtos.
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
        // ⭐️ DIAGNÓSTICO: Lança o erro para o frontend capturar
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }

    // Mapeamento com proteção para 'price'
    const productsData = data.map((product: any) => ({
        id: product.id,
        title: product.titulo,
        description: product.descricao,
        price: parseFloat(product.preco) || 0, // Correção do erro toFixed
        imageUrl: product.url_imagem || '', 
        imageUrlHighRes: product.url_imagem || '',
        createdAt: product.created_at,
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
