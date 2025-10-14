// src/types/product.ts (CONTEÚDO COMPLETO E ATUALIZADO)

export interface Product {
	id: string; // O ID do produto pode ser um UUID/string
	title: string;
	description: string;
	category: string;
    // AJUSTE: Mudar para 'number', pois a tabela usa INT8 para IDs de categoria.
    // O nome da coluna no produto deve ser o ID da categoria final (pai ou filho).
	category_id: number; 
	price: number;
	// Campos de imagem
	imageUrl: string;
	imageUrlHighRes: string;
	createdAt: string;
}

export type Category = {
    // AJUSTE: Mudar para 'number', pois a tabela usa INT8.
	id: number; 
	name: string; // Mapeado de 'nome' do banco (usado para exibição do filtro)
    
    // AJUSTE: O nome da propriedade deve refletir a coluna do DB ('categoria_pai_id')
    // e o tipo deve ser 'number | null'.
	categoria_pai_id: number | null; 
    
	slug: string; // Usado para URL ou rotas, se necessário
};

// ⭐️ Lista CATEGORIES removida:
// As categorias agora são carregadas dinamicamente do Supabase pelo fetchCategories.
