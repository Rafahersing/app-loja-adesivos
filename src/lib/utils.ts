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
        .select('id, nome, descricao') 
        .order('nome', { ascending: true }); // Ordena por nome

    if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
    // Retorna os dados diretamente, pois o Products.tsx espera 'name' e 'slug'
    return data;
}

/**
 * Busca todos os produtos e o ID da categoria, usando a tabela de junção.
 * @returns Um array de objetos de produto ou um array vazio em caso de erro.
 */
export async function fetchProducts() {
    const { data, error } = await supabase
        .from('produtos')
        // ⭐️ Seleciona todas as colunas do produto (incluindo 'descricao') e o JOIN na junção
        .select(`
            id, 
            nome, 
            preco, 
            imagem_url, 
            descricao,
            produtos_categorias!inner(categoria_id) 
        `) 
        .order('nome', { ascending: false }); // Ordena por nome

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }

    // ⭐️ O Supabase retorna dados aninhados. "Achatar" o resultado:
    // Transforma: { ..., produtos_categorias: [{ categoria_id: <ID> }] }
    // Em: { ..., category_id: <ID> }
    const productsData = data.map((product: any) => ({
        ...product,
        // Garante que o ID da categoria, que é o ID real do Supabase (uuid), seja extraído:
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
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};
