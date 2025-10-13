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
    
    // ✅ GARANTIA: Converte o ID da categoria para STRING
    return data.map(cat => ({
        ...cat,
        id: String(cat.id), 
    })); 
}

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

    // ✅ CORREÇÃO CRÍTICA: Mapeamento que converte IDS para STRING
    const productsData = (data || []).map((product: any) => {
        const rawPrice = product.preco ? String(product.preco) : '0';

        return {
            id: String(product.id),  // Essencial para o Favorites.tsx
            title: product.titulo || 'Produto Sem Título',
            description: product.descricao || '',
            price: parseFloat(rawPrice) || 0, 
            
            imageUrl: product.url_imagem || '', 
            imageUrlHighRes: product.url_imagem || '',
            createdAt: product.created_at,
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
            produtos_categorias!inner(categoria_id) 
        `) 
        .eq('id', dbProductId) // Usa o ID como NUMBER (BIGINT) na query
        .single(); 

    if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar produto por ID:", error);
        return null;
    }

    if (!data) {
        return null;
    }

    const product: any = data;
    const rawPrice = product.preco ? String(product.preco) : '0';

    return {
        id: String(product.id), // Garante que o retorno é STRING
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
