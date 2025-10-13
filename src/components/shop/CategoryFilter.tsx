// src/components/shop/CategoryFilter.tsx

// ⭐️ NOVO: Importamos os componentes Select/Dropdown do shadcn/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/types/product"; 
// Importamos Button, mas ele é usado apenas como um fallback simples

interface CategoryFilterProps {
  // Recebe a lista completa (pais e filhos)
  categories: Category[]; 
  
  // ID da Categoria Principal selecionada ("all" ou ID do Pai)
  selectedCategory: string; 
  
  // ID da Subcategoria selecionada ("all" ou ID do Filho)
  selectedSubcategory: string; 

  // Handler para a Categoria Principal
  onCategoryChange: (categoryId: string) => void;
  
  // Handler para a Subcategoria
  onSubcategoryChange: (subcategoryId: string) => void;
}

export const CategoryFilter = ({ 
    categories, 
    selectedCategory, 
    selectedSubcategory, 
    onCategoryChange, 
    onSubcategoryChange 
}: CategoryFilterProps) => {

    // 1. Filtrar APENAS Categorias Principais (onde parent_id é null)
    const parentCategories = categories.filter(cat => cat.parent_id === null);

    // 2. Filtrar Subcategorias para o Pai selecionado
    // Verifica se selectedCategory é um ID válido (não "all")
    const subcategories = categories.filter(cat => cat.parent_id === selectedCategory);

    // Handler para redefinir a subcategoria ao mudar a categoria principal
    const handleCategoryChange = (categoryId: string) => {
        onCategoryChange(categoryId);
        // Quando a categoria principal muda, resetamos a subcategoria para "all"
        onSubcategoryChange("all");
    };

    return (
        <div className="flex flex-col gap-4 mb-6 pt-2 md:flex-row md:gap-4 w-full items-start md:items-center">

            {/* ---------------------------------------------------- */}
            {/* 1. DROP-DOWN PARA CATEGORIA PRINCIPAL (PAIS) */}
            {/* ---------------------------------------------------- */}
            <Select 
                value={selectedCategory} 
                onValueChange={handleCategoryChange}
            >
                <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Categoria Principal" />
                </SelectTrigger>
                <SelectContent>
                    {/* Opção 'Todos os Adesivos' */}
                    <SelectItem value="all">Todos os Adesivos</SelectItem> 

                    {/* Mapeamento das Categorias Principais */}
                    {parentCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* ---------------------------------------------------- */}
            {/* 2. DROP-DOWN PARA SUBCATEGORIA (FILHOS) */}
            {/* ---------------------------------------------------- */}
            {/* Exibe o segundo Select SOMENTE se:
                1. Uma Categoria Principal VÁLIDA foi selecionada (selectedCategory !== "all")
                2. E houver subcategorias para aquele Pai (subcategories.length > 0)
            */}
            {selectedCategory !== "all" && subcategories.length > 0 && (
                <Select 
                    value={selectedSubcategory} 
                    onValueChange={onSubcategoryChange}
                >
                    <SelectTrigger className="w-full md:w-[220px]">
                        {/* Se algo estiver selecionado, mostra o valor, senão mostra o placeholder */}
                        <SelectValue placeholder="Selecione a Subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Opção para ver TODAS as subcategorias dentro do Pai selecionado */}
                        <SelectItem value="all">Todas as Subcategorias</SelectItem> 

                        {subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};
