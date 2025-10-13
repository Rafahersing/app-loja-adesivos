// src/types/product.ts

export interface Product {
	id: string;
	title: string;
	description: string;
	category: string;
    category_id: string; // Campo usado para o filtro de loja (UUID da categoria)
	price: number;
	// Campos de imagem
	imageUrl: string;
	imageUrlHighRes: string;
	createdAt: string;
}

export type Category = {
	id: string; // UUID da categoria
	name: string; // Mapeado de 'nome' do banco (usado para exibição do filtro)
	slug: string; // Usado para URL ou rotas, se necessário
};

// ⭐️ Lista CATEGORIES removida:
// As categorias agora são carregadas dinamicamente do Supabase pelo fetchCategories.
