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
