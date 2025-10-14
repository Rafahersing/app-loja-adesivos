/**
 * Tipos principais do e-commerce de imagens PNG
 * --------------------------------------------------
 * Compatível com o schema real do Supabase:
 *  - Tabela produtos
 *  - Tabela categorias
 * 
 * Mantém consistência com fetchProducts() e fetchCategories()
 */

export interface Product {
  /** ID do produto (tipo string por segurança com INT8) */
  id: string;

  /** Título do produto — coluna real: 'titulo' */
  titulo: string;

  /** Descrição do produto — coluna real: 'descricao' */
  descricao: string | null;

  /** Preço — coluna real: 'preco' */
  preco: number;

  /** URL da imagem principal — coluna real: 'url_imagem' */
  url_imagem: string | null;

  /** Status de visibilidade (ativo/inativo) — coluna real: 'ativo' */
  ativo: boolean;

  /** Data de criação — coluna real: 'created_at' */
  created_at?: string;

  /** ID da categoria associada — coluna real: 'category_id' */
  category_id?: string | null;
}

export interface Category {
  /** ID da categoria (string, pois INT8 do Supabase pode causar overflow) */
  id: string;

  /** Nome da categoria — coluna real: 'nome' */
  nome: string;

  /** Descrição da categoria — coluna real: 'descricao' */
  descricao?: string | null;

  /** ID da categoria pai — coluna real: 'categoria_pai_id' */
  categoria_pai_id: string | null;

  /** Data de criação — coluna real: 'created_at' */
  created_at?: string;
}
