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

// MUDANÇA AQUI: Lendo variáveis com o prefixo VITE_PUBLIC_
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Verificação de segurança
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'As variáveis de ambiente do Supabase devem ser definidas no Vercel!'
  );
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
