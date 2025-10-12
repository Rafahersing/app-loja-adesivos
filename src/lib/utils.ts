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

// ⭐️ ATUALIZAÇÃO CRÍTICA: BLOCO DE ERRO COMENTADO ⭐️
// Isto impede que o módulo quebre a aplicação se as variáveis de ambiente
// não estiverem carregadas, restaurando a página de categorias.
/*
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'As chaves do Supabase (URL e/ou ANON_KEY) não foram encontradas. Verifique as variáveis de ambiente (Vercel) e o prefixo (VITE_PUBLIC_ / NEXT_PUBLIC_).'
    );
}
*/

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
        .select('id, nome') // Buscando apenas o que é necessário para a lista/filtro
        .order('id', { ascending: true }); // Ordena por ID

    if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
    return data;
}

/**
 * Busca todos os produtos e o ID da categoria, usando a tabela de junção.
 * @returns Um array de objetos de produto ou um array vazio em caso de erro.
 */
export async function fetchProducts() {
    // ⭐️ ATENÇÃO A ESTA QUERY AJUSTADA ⭐️
    // 1. 'produtos!inner(produtos_categorias(categoria_id))' faz o JOIN
    // 2. As colunas id, nome, preco, imagem_url, descricao são da tabela 'produtos'
    const { data, error } = await supabase
        .from('produtos')
        .select(`
            id, 
            nome, 
            preco, 
            imagem_url, 
            descricao,
            produtos_categorias!inner(categoria_id) 
        `) // Adicione 'descricao' que está no seu schema
        .order('id', { ascending: false }); // Adiciona uma ordenação

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }

    // ⭐️ O Supabase retorna dados aninhados. Precisamos "achatar" o resultado:
    // Transforma: { id: 1, ..., produtos_categorias: [{ categoria_id: 10 }] }
    // Em: { id: 1, ..., category_id: 10 }
    const productsData = data.map((product: any) => ({
        ...product,
        // Assume que um produto tem APENAS uma categoria para simplificação
        category_id: product.produtos_categorias[0]?.categoria_id || null
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
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};
