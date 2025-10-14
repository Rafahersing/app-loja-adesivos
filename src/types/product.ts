// src/types/product.ts (CONTEÚDO FINAL)

export interface Product {
	id: string; 
	title: string;
	description: string;
	category: string;
    // O ID da categoria no produto (se for a FK) é geralmente string
	category_id: string; 
	price: number;
	imageUrl: string;
	imageUrlHighRes: string;
	createdAt: string;
}

export type Category = {
    // CRÍTICO: ID é STRING para lidar com INT8 sem perda de precisão.
	id: string; 
	name: string; // Mapeado de 'nome'
	descricao?: string; 
    // CRÍTICO: ID Pai é STRING ou NULL.
	categoria_pai_id: string | null; 
};
