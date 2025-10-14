// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ----------------------------------------------------
// VARIÁVEIS DO SUPABASE E INICIALIZAÇÃO SINGLETON
// ----------------------------------------------------

// Variável para armazenar a instância única do cliente Supabase
let supabase: SupabaseClient | null = null;

// Assumindo que você está usando VITE ou similar (baseado no import.meta.env dos seus anexos)
// Certifique-se de que as variáveis de ambiente estão definidas
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

// Implementação do Singleton: Cria a instância apenas se ela ainda não existir
if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
        // Lançamos um erro se as chaves de ambiente estiverem faltando
        throw new Error("As variáveis de ambiente VITE_PUBLIC_SUPABASE_URL e VITE_PUBLIC_SUPABASE_ANON_KEY devem ser definidas.");
    }
    // Cria o cliente Supabase
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Exporta a instância única do Supabase para uso em todo o projeto
// Usamos o nome 'supabase' para compatibilidade com seus outros componentes
export const supabaseClient = supabase as SupabaseClient;


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
        .replace(/[^\w\s-]/g, '') // Remove caracteres não-palavra, espaço ou hífen
        .replace(/[\s_-]+/g, '-') // Substitui espaços e múltiplos hífens por um único hífen
        .replace(/^-+|-+$/g, ''); // Remove hífens do início ou fim
};

// Se você já usava 'supabase' como export default/named, use este:
// export const supabase = supabaseClient;
// Para simplificar, assumimos que você ajustará suas importações para usar 'supabaseClient'
export const supabase = supabaseClient;
