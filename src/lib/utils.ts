// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

// ⭐️ EXPORTAÇÃO ÚNICA: Cliente Supabase
export const supabase = supabaseInstance as SupabaseClient;


// ----------------------------------------------------
// FUNÇÕES DE BUSCA DE DADOS (AGORA COMPLETAS)
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
    
    // Converte bigint IDs para string
    return data.map(item => ({
        id: String(item.id), 
        name: item.nome, 
        categoria_pai_id: item.categoria_pai_id ? String(item.categoria_pai_id) : null,
    } as Category));
};


// Função para buscar produtos (Usada na página Shop)
export const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('produtos')
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
        .eq('ativo', true) 
        .order('id', { ascending: true });

    if (error) {
        throw new Error(`[ERRO SUPABASE - PRODUTOS]: ${error.message}`);
    }

    if (!data) return [];

    // Formata o resultado para um objeto Product mais limpo
    const formattedProducts: Product[] = data.map((item: any) => ({
        id: String(item.id), 
        titulo: item.titulo,
        descricao: item.descricao,
        preco: item.preco,
        url_imagem: item.url_imagem,
        categories: item.produtos_categorias.map((pc: any) => ({
            id: String(pc.categorias.id),
            name: pc.categorias.nome,
        })) as Category[],
    } as Product));

    return formattedProducts;
};


// ⭐️ FUNÇÃO ADICIONADA: fetchProductById ⭐️
// Corrige o erro de exportação e usa o padrão de JOIN.
export const fetchProductById = async (productId: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('produtos')
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
        .eq('id', productId) // Filtra pelo ID do produto
        .single(); // Espera apenas um produto

    if (error) {
        // Note: Se o produto não for encontrado, o erro do .single() será pego aqui.
        console.error(`[ERRO SUPABASE - PRODUTO ID ${productId}]: ${error.message}`);
        return null;
    }

    if (!data) return null;

    // Formata o resultado para um objeto Product
    const formattedProduct: Product = {
        id: String(data.id), // Converte bigint para string
        titulo: data.titulo,
        descricao: data.descricao,
        preco: data.preco,
        url_imagem: data.url_imagem,
        // Extrai as categorias
        categories: data.produtos_categorias.map((pc: any) => ({
            id: String(pc.categorias.id),
            name: pc.categorias.nome,
        })) as Category[],
    } as Product;

    return formattedProduct;
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
