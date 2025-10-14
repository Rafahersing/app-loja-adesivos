// src/types/product.ts

export interface Product {
	id: string; 
	title: string;
	description: string;
	category: string;
    // CRÍTICO: DEVE SER STRING. Isso corrige o problema de "Categoria Desconhecida" 
    // na área admin, pois a tabela de produtos armazena o ID como string/UUID.
	category_id: string; 
	price: number;
	// Campos de imagem
	imageUrl: string;
	imageUrlHighRes: string;
	createdAt: string;
}

export type Category = {
    // MANTIDO: NUMBER. ID da tabela 'categorias' é INT8.
	id: number; 
	name: string; 
    // MANTIDO: NUMBER | NULL. Coluna 'categoria_pai_id' é INT8.
	categoria_pai_id: number | null; 
	slug: string; 
};

// ⭐️ Lista CATEGORIES removida:
// As categorias agora são carregadas dinamicamente do Supabase.
