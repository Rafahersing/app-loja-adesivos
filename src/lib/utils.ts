// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Importação necessária para tipagem correta das funções de busca
import { Product, Category } from "@/types/product"; 

// ----------------------------------------------------
// VARIÁVEIS DO SUPABASE E INICIALIZAÇÃO SINGLETON
// ----------------------------------------------------

// Variável para armazenar a instância única do cliente Supabase
let supabaseInstance: SupabaseClient | null = null;

// Variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

// Implementação do Singleton: Cria a instância apenas se ela ainda não existir
if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("As variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY devem ser definidas.");
    }
    // Cria o cliente Supabase
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

// ⭐️ EXPORTAÇÃO ÚNICA: Este é o único ponto de exportação do cliente Supabase.
export const supabase = supabaseInstance as SupabaseClient;


// ----------------------------------------------------
// FUNÇÕES DE BUSCA DE DADOS (Centralizado conforme padrões)
// ----------------------------------------------------

// Função para buscar categorias (Usada tanto no Admin quanto na Loja)
export const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categorias')
        .select('id, nome, categoria_pai_id') 
        .order('nome', { ascending: true });

    if (error) {
        throw new Error(`[ERRO SUPABASE - CATEGORIAS]: ${error.message}`);
    } 
    
    // CRÍTICO: Converte bigint IDs para string
    return data.map(item => ({
        id: String(item.id), 
        name: item.nome, 
        categoria_pai_id: item.categoria_pai_id ? String(item.categoria_pai_id) : null,
    } as Category));
};


// ⭐️ FUNÇÃO CORRIGIDA PARA BUSCA DE PRODUTOS ⭐️
// Corrige o erro "column produtos.category_id does not exist" usando JOIN.
export const fetchProducts = async (): Promise<Product[]> => {
    // A consulta usa a sintaxe de JOIN para trazer as categorias aninhadas
    const { data, error } = await supabase
        .from('produtos')
        // Seleciona colunas de 'produtos' e faz o JOIN via 'produtos_categorias'
        .select(`
            id, 
            titulo, 
            descricao, 
            preco, 
            url_imagem, 
            ativo,
            produtos_categorias!inner(
                categorias(
                    id, 
                    nome
                )
            )
        `)
        // Filtra apenas produtos ativos
        .eq('ativo', true) 
        .order('id', { ascending: true });

    if (error) {
        throw new Error(`[ERRO SUPABASE - PRODUTOS]: ${error.message}`);
    }

    if (!data) return [];

    // Formata o resultado para um objeto Product mais limpo
    const formattedProducts: Product[] = data.map((item: any) => ({
        id: String(item.id), // CRÍTICO: Converte bigint para string
        titulo: item.titulo,
        descricao: item.descricao,
        preco: item.preco,
        url_imagem: item.url_imagem,
        // EXTRAI e simplifica a lista de categorias do objeto de JOIN
        categories: item.produtos_categorias.map((pc: any) => ({
            id: String(pc.categorias.id),
            name: pc.categorias.nome,
        })) as Category[],
    } as Product));

    return formattedProducts;
};


// ----------------------------------------------------
// OUTRAS FUNÇÕES DE UTILIDADE
// ----------------------------------------------------

// Função cn (para utilitários de classe com clsx e twMerge)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função slugify (muito usada em seu ProductImportComponent)
export const slugify = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
