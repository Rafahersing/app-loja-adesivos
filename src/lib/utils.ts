// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ----------------------------------------------------
// VARIÁVEIS DO SUPABASE E INICIALIZAÇÃO SINGLETON
// ----------------------------------------------------

// Variável para armazenar a instância única do cliente Supabase
let supabaseInstance: SupabaseClient | null = null;

// Variáveis de ambiente (usando VITE_PUBLIC_... como nos seus anexos)
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

// Implementação do Singleton: Cria a instância apenas se ela ainda não existir
if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
        // Lançamos um erro se as chaves de ambiente estiverem faltando
        throw new Error("As variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY devem ser definidas.");
    }
    // Cria o cliente Supabase
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

// ⭐️ EXPORTAÇÃO ÚNICA: Este é o único ponto de exportação do cliente Supabase.
export const supabase = supabaseInstance as SupabaseClient;


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



// ----------------------------------------------------
// FUNÇÕES DE BUSCA DE DADOS (SUPABASE)
// ----------------------------------------------------

import { Product, Category } from "@/types/product";

export async function fetchCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categorias")
        .select("id, name, parent_id");

    if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw new Error(error.message);
    }

    // Mapeia os dados para o formato Category, garantindo parent_id como string ou null
    return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        parent_id: cat.parent_id || null, // Garante que parent_id seja null se não existir
    }));
}

export async function fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("produtos")
        .select("id, title, description, price, image_url, category_id, created_at, updated_at");

    if (error) {
        console.error("Erro ao buscar produtos:", error);
        throw new Error(error.message);
    }

    return data as Product[];
}



export async function fetchProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from("produtos")
        .select("id, title, description, price, image_url, category_id, created_at, updated_at")
        .eq("id", id)
        .single();

    if (error) {
        console.error(`Erro ao buscar produto com ID ${id}:`, error);
        // Dependendo do seu tratamento de erro, você pode querer lançar o erro ou retornar null
        return null;
    }

    return data as Product;
}



export async function fetchFavoriteProducts(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from("favoritos")
        .select("product_id")
        .eq("user_id", userId);

    if (error) {
        console.error("Erro ao buscar IDs de produtos favoritos:", error);
        throw new Error(error.message);
    }

    const favoriteProductIds = data.map((fav) => fav.product_id);

    if (favoriteProductIds.length === 0) {
        return [];
    }

    const { data: products, error: productsError } = await supabase
        .from("produtos")
        .select("id, title, description, price, image_url, category_id, created_at, updated_at")
        .in("id", favoriteProductIds);

    if (productsError) {
        console.error("Erro ao buscar produtos favoritos:", productsError);
        throw new Error(productsError.message);
    }

    return products as Product[];
}

