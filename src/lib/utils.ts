// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';
import { Product } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

// ----------------------------------------------------------------------
// Funções de Busca de Dados (Shop)
// ----------------------------------------------------------------------

export async function fetchCategories() {
    const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .order('nome', { ascending: true }); 

    if (error) {
        throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }
    
    return data.map(cat => ({
        ...cat,
        id: String(cat.id), 
    })); 
}

/**
 * Busca todos os produtos com as informações da categoria.
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
            produtos_categorias!inner(
                categoria_id,
                categorias(nome) 
            ) 
        `) // 🛑 Query SQL limpa - Removemos os comentários inline
        .order('titulo', { ascending: false });

    if (error) {
        // O erro crítico na loja agora vai mostrar a mensagem correta.
        console.error("Erro ao buscar produtos:", error);
        throw new Error(`Erro Crítico ao carregar Dados: ${error.message}`);
    }

    // Mapeamento que ALINHA DB com Interface e CONVERTE IDS para STRING
    const productsData = (data || []).map((product: any) => {
        const rawPrice = product.preco ? String(product.preco) : '0';
        
        // Extrai dados da categoria
        const categoryData = product.produtos_categorias[0];
        const categoryId = categoryData?.categoria_id;
        const categoryName = categoryData?.categorias?.nome || ''; 

        return {
            id: String(product.id), 
            title: product.titulo || 'Produto Sem Título',
            description: product.descricao || '',
            price: parseFloat(rawPrice) || 0, 
            
            imageUrl: product.url_imagem || '', 
            imageUrlHighRes: product.url_imagem || '',
            createdAt: product.created_at,
            category_id: categoryId ? String(categoryId) : null, 
            category: categoryName, // Agora com o nome real
        };
    });

    return productsData as Product[];
}


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

/**
 * Busca um único produto pelo seu ID (string) no Supabase.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
    
    const dbProductId = Number(id);

    const { data, error } = await supabase
        .from('produtos')
        .select(`
            id, 
            titulo, 
            preco, 
            url_imagem, 
            descricao,
            created_at,
            produtos_categorias!inner(
                categoria_id,
                categorias(nome)
            ) 
        `) // 🛑 Query SQL limpa - Removemos os comentários inline
        .eq('id', dbProductId)
        .single(); 

    if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar produto por ID:", error);
        return null;
    }

    if (!data) {
        return null;
    }

    // Mapeamento do DB para a interface Product
    const product: any = data;
    const rawPrice = product.preco ? String(product.preco) : '0';
    
    // Extrai dados da categoria
    const categoryData = product.produtos_categorias[0];
    const categoryId = categoryData?.categoria_id;
    const categoryName = categoryData?.categorias?.nome || '';

    return {
        id: String(product.id),
        title: product.titulo || 'Produto Sem Título',
        description: product.descricao || '',
        price: parseFloat(rawPrice) || 0, 
        imageUrl: product.url_imagem || '', 
        imageUrlHighRes: product.url_imagem || '',
        createdAt: product.created_at,
        category_id: categoryId ? String(categoryId) : null, 
        category: categoryName, 
    } as Product;
}
