// src/types/product.ts

export interface Product {
	id: string; 
	title: string;
	description: string;
	category: string;
    // CRÍTICO: DEVE SER STRING para corresponder à tabela de produtos (UUID/string).
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
    // REMOVEMOS O SLUG DA TIPAGEM (já que o DB não o tem)
    
    // MANTIDO: NUMBER | NULL. Coluna 'categoria_pai_id' é INT8.
	categoria_pai_id: number | null; 
    // AJUSTE: Adicionamos descricao, pois ela existe no DB.
    descricao?: string; 
};
