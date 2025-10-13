// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';

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
    return data;
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

    // Mapeamento que ALINHA DB (preco) com Interface (price)
    const productsData = data.map((product: any) => {
        const rawPrice = product.preco ? String(product.preco) : '0';

        return {
            id: product.id,
            title: product.titulo || 'Produto Sem Título',
            description: product.descricao || '',
            // Mapeamento e proteção
            price: parseFloat(rawPrice) || 0, 
            
            imageUrl: product.url_imagem || '', 
            imageUrlHighRes: product.url_imagem || '',
            createdAt: product.created_at,
            category_id: product.produtos_categorias[0]?.categoria_id || null, 
            category: '', 
        };
    });

    return productsData;
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
