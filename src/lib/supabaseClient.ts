/**
 * Supabase Client - Configuração centralizada
 * --------------------------------------------------
 * Este módulo inicializa o cliente do Supabase
 * conforme os padrões do projeto (singleton, tipado e seguro).
 * Utiliza variáveis de ambiente prefixadas com VITE_PUBLIC_.
 */

import { createClient } from '@supabase/supabase-js'

// Tipos de variáveis de ambiente (opcional, mas recomendado)
interface SupabaseEnv {
  VITE_PUBLIC_SUPABASE_URL: string
  VITE_PUBLIC_SUPABASE_ANON_KEY: string
}

// Garantir que as variáveis estão definidas
const env = import.meta.env as SupabaseEnv

if (!env.VITE_PUBLIC_SUPABASE_URL || !env.VITE_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    '❌ Variáveis de ambiente do Supabase não configuradas. Verifique seu arquivo .env.local ou as configurações do Cloudflare Pages.'
  )
}

// Inicialização do cliente (singleton)
export const supabase = createClient(
  env.VITE_PUBLIC_SUPABASE_URL,
  env.VITE_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)
