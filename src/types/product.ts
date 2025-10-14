// src/types/product.ts

export interface Product {
	id: string; 
	title: string;
	description: string;
	category: string;
    // CRÍTICO: DEVE SER STRING (UUID)
	category_id: string; 
	price: number;
	// ... outros campos
	imageUrl: string;
	imageUrlHighRes: string;
	createdAt: string;
}

export type Category = {
    // MANTIDO: NUMBER (INT8)
	id: number; 
	name: string; 
    // MANTIDO: NUMBER | NULL (INT8)
	categoria_pai_id: number | null; 
    // Novo campo na tipagem, alinhado ao seu DB
    descricao?: string; 
};
