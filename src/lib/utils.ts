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
    
    // ✅ CORREÇÃO DE TIPAGEM: Garante que o ID da categoria seja STRING
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
            // ⭐️ ATUALIZAÇÃO CRÍTICA: Faz JOIN para buscar o NOME da categoria ⭐️
            produtos_categorias!inner(
                categoria_id,
                categorias(nome) 
            ) 
        `) 
        .order('titulo', { ascending: false });

    if (error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }

    // Mapeamento que ALINHA DB com Interface e CONVERTE IDS para STRING
    const productsData = (data || []).map((product: any) => {
        const rawPrice = product.preco ? String(product.preco) : '0';
        
        // Extrai dados da categoria
        const categoryData = product.produtos_categorias[0];
        const categoryId = categoryData?.categoria_id;
        const categoryName = categoryData?.categorias?.nome || ''; // Retorna '' se não encontrar

        return {
            // ✅ CORREÇÃO DE TIPAGEM: ID do produto para STRING
            id: String(product.id), 
            title: product.titulo || 'Produto Sem Título',
            description: product.descricao || '',
            price: parseFloat(rawPrice) || 0, 
            
            imageUrl: product.url_imagem || '', 
            imageUrlHighRes: product.url_imagem || '',
            createdAt: product.created_at,
            // ✅ CORREÇÃO DE TIPAGEM: ID da categoria para STRING
            category_id: categoryId ? String(categoryId) : null, 
            // ⭐️ NOVO: Usa o nome da categoria buscado no JOIN ⭐️
            category: categoryName, 
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
 * @param id O ID do produto (deve ser a string do BIGINT).
 * @returns O objeto Product ou null se não for encontrado.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
    
    // ✅ CORREÇÃO DE TIPAGEM: Converte para NUMBER para a QUERY no Supabase
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
            // ⭐️ ATUALIZAÇÃO: Inclui JOIN para categorias também aqui ⭐️
            produtos_categorias!inner(
                categoria_id,
                categorias(nome)
            ) 
        `) 
        .eq('id', dbProductId) // Usa o ID convertido (NUMBER)
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
        // ✅ CORREÇÃO DE TIPAGEM: Garante que o ID final seja STRING
        id: String(product.id),
        title: product.titulo || 'Produto Sem Título',
        description: product.descricao || '',
        price: parseFloat(rawPrice) || 0, 
        imageUrl: product.url_imagem || '', 
        imageUrlHighRes: product.url_imagem || '',
        createdAt: product.created_at,
        category_id: categoryId ? String(categoryId) : null, 
        // ⭐️ NOVO: Usa o nome da categoria buscado no JOIN ⭐️
        category: categoryName, 
    } as Product;
}
