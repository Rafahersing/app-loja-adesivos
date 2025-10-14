// src/types/product.ts

export interface Product {
	id: string; 
	title: string;
	description: string;
	category: string;
    // CORREÇÃO: category_id deve ser string (UUID) se a tabela de produtos usa string.
	category_id: string; 
	price: number;
	// Campos de imagem
	imageUrl: string;
	imageUrlHighRes: string;
	createdAt: string;
}

export type Category = {
    // MANTIDO: number, pois a tabela 'categorias' usa INT8 (conforme a imagem que você enviou).
	id: number; 
	name: string; 
	// MANTIDO: número/null para o relacionamento.
	categoria_pai_id: number | null; 
	slug: string; 
};

// ⭐️ Lista CATEGORIES removida:
// As categorias agora são carregadas dinamicamente do Supabase pelo fetchCategories.
