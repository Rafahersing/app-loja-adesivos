import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Product, Category } from "@/types/product";

// ----------------------------------------------------
// VARIÁVEIS DO SUPABASE E INICIALIZAÇÃO SINGLETON
// ----------------------------------------------------

// Variável para armazenar a instância única do cliente Supabase
let supabaseInstance: SupabaseClient | null = null;

// Variáveis de ambiente (usando VITE_PUBLIC_... como definido no padrão do projeto)
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

// Implementação do Singleton
if (!supabaseInstance) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "As variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY devem ser definidas."
    );
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

// ⭐️ Exportação única: este é o cliente global do Supabase
export const supabase = supabaseInstance as SupabaseClient;

// ----------------------------------------------------
// FUNÇÕES DE UTILIDADE
// ----------------------------------------------------

// Função cn (merge de classes Tailwind)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função slugify (para gerar URLs amigáveis)
export const slugify = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ----------------------------------------------------
// FUNÇÕES DE BUSCA DE DADOS (SUPABASE)
// ----------------------------------------------------

/**
 * Busca todas as categorias
 * Campos reais: id, nome, descricao, categoria_pai_id
 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, descricao, categoria_pai_id")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    throw new Error(error.message);
  }

  return (
    data?.map((cat) => ({
      id: cat.id,
      nome: cat.nome,
      descricao: cat.descricao,
      categoria_pai_id: cat.categoria_pai_id ?? null,
    })) ?? []
  );
}

/**
 * Busca todos os produtos ativos
 * Campos reais: id, titulo, descricao, preco, url_imagem, ativo, category_id, created_at
 */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("id, titulo, descricao, preco, url_imagem, ativo, category_id, created_at")
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error(error.message);
  }

  return data as Product[];
}

/**
 * Busca um produto pelo ID
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("produtos")
    .select("id, titulo, descricao, preco, url_imagem, ativo, category_id, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Erro ao buscar produto com ID ${id}:`, error);
    return null;
  }

  return data as Product;
}

/**
 * Busca produtos favoritados por um usuário
 * Utiliza tabela 'favoritos' (colunas: user_id, product_id)
 */
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
    .select("id, titulo, descricao, preco, url_imagem, ativo, category_id, created_at")
    .in("id", favoriteProductIds)
    .eq("ativo", true);

  if (productsError) {
    console.error("Erro ao buscar produtos favoritos:", productsError);
    throw new Error(productsError.message);
  }

  return products as Product[];
}
