// src/types/product.ts (CONTEÚDO FINAL)

export interface Product {
	id: string; 
	title: string;
	description: string;
	category: string;
    // CRÍTICO: MANTIDO COMO STRING. Isto é vital se o ID do PRODUTO é UUID e a tabela de produto-categoria
    // usa esse ID como string, ou se o mapeamento final dos produtos espera uma string.
	category_id: string; 
	price: number;
	// ...
}

export type Category = {
    // CRÍTICO: MANTIDO COMO NUMBER. O ID da tabela 'categorias' no Supabase é INT8.
	id: number; 
	name: string; // Mapeado de 'nome'
	descricao?: string; 
	categoria_pai_id: number | null; 
};
