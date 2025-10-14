// src/types/product.ts

export interface Product {
	id: string; // O ID do produto é um UUID/string
	title: string;
	description: string;
	category: string;
    // CRÍTICO: Mantemos 'string' aqui. Se a coluna category_id na tabela de produtos
    // usa UUIDs ou IDs formatados como string (diferente de INT8), usar 'number'
    // faz com que o front-end perca a referência.
	category_id: string; 
	price: number;
	// Campos de imagem
	imageUrl: string;
	imageUrlHighRes: string;
	createdAt: string;
}

export type Category = {
    // AJUSTE: MANTIDO 'number', pois a coluna 'id' na tabela 'categorias' é INT8.
	id: number; 
	// Mapeado de 'nome' do banco (usado para exibição do filtro)
	name: string; 
    
    // AJUSTE: MANTIDO 'number | null', pois a coluna 'categoria_pai_id' é INT8.
	categoria_pai_id: number | null; 
    
	slug: string; // Usado para URL ou rotas, se necessário
};

// ⭐️ Lista CATEGORIES removida:
// As categorias agora são carregadas dinamicamente do Supabase pelo fetchCategories.
