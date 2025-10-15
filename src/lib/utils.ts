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

// Função para buscar categorias
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


// Função para buscar todos os produtos ativos (Usada na página Shop)
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

// Função para buscar um produto por ID (Usada na página Product)
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
        .eq('id', productId) 
        .single(); 

    if (error) {
        console.error(`[ERRO SUPABASE - PRODUTO ID ${productId}]: ${error.message}`);
        return null;
    }

    if (!data) return null;

    const formattedProduct: Product = {
        id: String(data.id), 
        titulo: data.titulo,
        descricao: data.descricao,
        preco: data.preco,
        url_imagem: data.url_imagem,
        categories: data.produtos_categorias.map((pc: any) => ({
            id: String(pc.categorias.id),
            name: pc.categorias.nome,
        })) as Category[],
    } as Product;

    return formattedProduct;
};


// ⭐️ NOVA FUNÇÃO ADICIONADA: fetchFavoriteProducts ⭐️
// Corrige o erro de exportação para a página de favoritos.
export const fetchFavoriteProducts = async (userId: string): Promise<Product[]> => {
    // Busca a lista de favoritos do usuário e faz JOIN com a tabela de produtos
    const { data, error } = await supabase
        .from('favoritos')
        .select(`
            produtos!inner( 
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
            )
        `)
        // Filtra pelo ID do usuário e garante que o produto está ativo
        .eq('user_id', userId)
        .eq('produtos.ativo', true); 

    if (error) {
        throw new Error(`[ERRO SUPABASE - FAVORITOS]: ${error.message}`);
    }
    
    if (!data) return [];
    
    // Mapeia o resultado para extrair o objeto 'produtos' e formatar as categorias
    const formattedProducts: Product[] = data
        .map((favItem: any) => favItem.produtos) 
        .filter((p: any) => p) // Remove qualquer resultado nulo
        .map((item: any) => ({
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


// ----------------------------------------------------
// OUTRAS FUNÇÕES DE UTILIDADE
// ----------------------------------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
