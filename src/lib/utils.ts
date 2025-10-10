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

// 1. Variáveis de ambiente (lidas automaticamente do Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Verificação de segurança: Lança um erro se as chaves não estiverem configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'As variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY) devem ser definidas no Vercel!'
  );
}

// 3. Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
