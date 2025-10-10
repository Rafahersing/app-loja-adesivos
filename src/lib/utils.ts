import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';

// Função para combinar classes Tailwind (mantida)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// Configuração do Supabase (Ajustado com sua URL de projeto)
// ----------------------------------------------------------------------

// 1. URL do Projeto (Hardcoded para garantir que o 'supabaseUrl' não seja undefined)
// Usar a URL diretamente aqui corrige o erro 'supabaseUrl is required'.
const supabaseUrl = 'https://jppzmvqvhivlmxwcwpng.supabase.co';

// 2. Chave de API (Lida do Vercel, usando o método correto do Vite)
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Verificação de segurança apenas para a chave que vem do ambiente
if (!supabaseAnonKey) {
  // ATENÇÃO: Se isso quebrar o app novamente, remova este bloco IF.
  throw new Error(
    'A chave VITE_PUBLIC_SUPABASE_ANON_KEY não foi encontrada. Verifique as variáveis no Vercel!'
  );
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey as string);
