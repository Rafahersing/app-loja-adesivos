// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';
import { Product } from "@/types/product"; // Assumindo este import

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
    
    // ⭐️ GARANTIA: Converte o ID da categoria para STRING, se for BIGINT no DB
    return data.map(cat => ({
        ...cat,
        id: String(cat.id), // Se o id da categoria for BIGINT
    })); 
}

// ⭐️ FUNÇÃO fetchProducts CORRIGIDA ⭐️
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
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }

    // Mapeamento que ALINHA DB com Interface e CONVERTE IDS para STRING
    const productsData = (data || []).map((product: any) => {
        const rawPrice = product.preco ? String(product.preco) : '0';

        return {
            // ✅ CORREÇÃO CRÍTICA: Converte o ID do produto (BIGINT) para STRING
            id: String(product.id), 
            title: product.titulo || 'Produto Sem Título',
            description: product.descricao || '',
            price: parseFloat(rawPrice) || 0, 
            
            imageUrl: product.url_imagem || '', 
            imageUrlHighRes: product.url_imagem || '',
            createdAt: product.created_at,
            // ✅ CORREÇÃO: Converte o ID da categoria (BIGINT) para STRING
            category_id: product.produtos_categorias[0]?.categoria_id ? String(product.produtos_categorias[0].categoria_id) : null, 
            category: '', 
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

// ⭐️ FUNÇÃO fetchProductById CORRIGIDA ⭐️
/**
 * Busca um único produto pelo seu ID (string) no Supabase.
 * @param id O ID do produto (deve ser a string do BIGINT).
 * @returns O objeto Product ou null se não for encontrado.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
    
    // ✅ CORREÇÃO: Converte o ID para NUMBER (BIGINT) para a QUERY no Supabase
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
            produtos_categorias!inner(categoria_id) 
        `) 
        .eq('id', dbProductId) // ⭐️ Usa o ID convertido (NUMBER)
        .single(); 

    if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar produto por ID:", error);
        return null;
    }

    if (!data) {
        return null;
    }

    // ⭐️ Mapeamento do DB para a interface Product
    const product: any = data;
    const rawPrice = product.preco ? String(product.preco) : '0';

    return {
        // ✅ CORREÇÃO: Garante que o ID final seja STRING
        id: String(product.id),
        title: product.titulo || 'Produto Sem Título',
        description: product.descricao || '',
        price: parseFloat(rawPrice) || 0, 
        imageUrl: product.url_imagem || '', 
        imageUrlHighRes: product.url_imagem || '',
        createdAt: product.created_at,
        category_id: product.produtos_categorias[0]?.categoria_id ? String(product.produtos_categorias[0].categoria_id) : null, 
        category: '', 
    } as Product;
}
