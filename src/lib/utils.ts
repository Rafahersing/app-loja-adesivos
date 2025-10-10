import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';

// Função para combinar classes Tailwind (mantida)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// Configuração do Supabase (Corrigido para usar Variáveis de Ambiente)
// ----------------------------------------------------------------------

// 1. URL do Projeto (Lida do Vercel/Vite, usando a nova variável)
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;

// 2. Chave de API (Lida do Vercel/Vite, usando o método correto do Vite)
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Verificação de segurança: Garante que ambas as variáveis foram carregadas
if (!supabaseUrl || !supabaseAnonKey) {
  // ATENÇÃO: Se isso quebrar o app, verifique se as variáveis existem no Vercel
  // com os prefixos corretos (VITE_PUBLIC_ ou NEXT_PUBLIC_ dependendo do seu framework).
  throw new Error(
    'As chaves do Supabase (URL e/ou ANON_KEY) não foram encontradas. Verifique as variáveis de ambiente (Vercel) e o prefixo (VITE_PUBLIC_ / NEXT_PUBLIC_).'
  );
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);
