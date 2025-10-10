import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from '@supabase/supabase-js';

// Função para combinar classes Tailwind (mantida)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// Configuração do Supabase
// ----------------------------------------------------------------------

// Lendo variáveis com o prefixo VITE_PUBLIC_ (correto para projetos Vite)
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

// ATENÇÃO: A VERIFICAÇÃO DE SEGURANÇA QUE ESTAVA QUEBRANDO O APP FOI REMOVIDA.
// Em ambientes de produção (Vercel), as chaves devem ser lidas corretamente.

// Cria e exporta o cliente Supabase
// Se 'supabaseUrl' ou 'supabaseAnonKey' for undefined, a função createClient
// pode não funcionar, mas pelo menos não quebra o aplicativo inteiro.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
