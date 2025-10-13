// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';
import { Product } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Supondo que as variáveis de ambiente estão definidas e acessíveis.
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

// ----------------------------------------------------------------------
// Funções de Busca de Dados (Geral)
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
 * Busca TODOS os produtos (Usada na página da loja).
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
        `) 
        .order('titulo', { ascending: false });

    if (error) {
        console.error("Erro ao buscar produtos:", error);
        throw new Error(`Erro Crítico ao carregar Dados: ${error.message}`);
    }

    // Mapeamento do DB para a interface Product
    const productsData = (data || []).map((product: any) => {
        const rawPrice = product.preco ? String(product.preco) : '0';
        
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
        };
    });
    
    // Deixamos o log para fins de diagnóstico geral, se necessário.
    // console.log("Produtos Mapeados (Verificar Categoria):", productsData);

    return productsData as Product[];
}

/**
 * ⭐️ NOVA FUNÇÃO ⭐️
 * Busca APENAS os produtos favoritos do usuário logado (Usada na página de Favoritos).
 */
export async function fetchFavoriteProducts(userId: string): Promise<Product[]> {
    if (!userId) {
        // Se não houver ID do usuário (não logado), retorna array vazio
        return [];
    }

    // 1. Busca os IDs dos produtos favoritos do usuário logado
    // A RLS para SELECT na 'favoritos' deve estar correta
    const { data: favoriteData, error: favoriteError } = await supabase
        .from('favoritos')
        .select('produto_id')
        .eq('usuario_id', userId);

    if (favoriteError) {
        console.error("Erro ao buscar IDs de favoritos:", favoriteError);
        throw new Error(`Erro ao carregar favoritos: ${favoriteError.message}`);
    }

    // Se não houver favoritos, retorna array vazio
    if (!favoriteData || favoriteData.length === 0) {
        return [];
    }

    const productIds = favoriteData.map(f => f.produto_id);

    // 2. Busca os detalhes completos dos produtos favoritos com INNER JOIN para a Categoria
    // O INNER JOIN precisa de permissão de SELECT em 'produtos' e 'categorias'
    const { data: productsData, error: productsError } = await supabase
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
        `)
        .in('id', productIds) // 🎯 Filtra APENAS pelos IDs favoritados (28, 29, 30)
        .order('titulo', { ascending: false });

    if (productsError) {
        console.error("Erro ao buscar detalhes dos produtos favoritos:", productsError);
        throw new Error(`Erro Crítico ao carregar Dados: ${productsError.message}`);
    }

    // 3. Mapeamento para o formato Product
    const mappedProducts = (productsData || []).map((product: any) => {
        const rawPrice = product.preco ? String(product.preco) : '0';
        
        const categoryData = product.produtos_categorias[0];
        const categoryId = categoryData?.categoria_id;
        // O nome da categoria 26 é 'Semana | Domingo'
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
        };
    });
    
    // 🛑 LOG DE DIAGNÓSTICO: Este log deve mostrar o nome real da categoria
    console.log("Produtos Favoritos Mapeados:", mappedProducts);

    return mappedProducts as Product[];
}

export const slugify = (text: string): string => {
// ... (função slugify sem alterações) ...
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
// ... (função fetchProductById sem alterações, mas com o código limpo) ...
    
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
        `)
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
