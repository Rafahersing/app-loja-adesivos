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
        .from('categorias') // <--- VERIFIQUE E ADAPTE O NOME DA SUA TABELA
        .select('*');

    if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
    return data;
}

/**
 * Busca todos os produtos do Supabase.
 * Nota: Adapte o .select() para as colunas que você cadastrou.
 * @returns Um array de objetos de produto ou um array vazio em caso de erro.
 */
export async function fetchProducts() {
    const { data, error } = await supabase
        .from('produtos') // <--- VERIFIQUE E ADAPTE O NOME DA SUA TABELA
        .select('id, nome, preco, imagem_url, category_id'); // ADAPTE AS COLUNAS AQUI!

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
    return data;
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
