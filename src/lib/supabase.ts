// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Certifique-se de que estas variáveis de ambiente estão definidas no Vercel (ou no seu .env local)
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL; 
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente VITE_PUBLIC_SUPABASE_URL e VITE_PUBLIC_SUPABASE_ANON_KEY devem ser definidas.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
