// src/components/shop/CategoryFilter.tsx

import { Button } from "@/components/ui/button";
import { Category } from "@/types/product"; // Usamos a tipagem Category, que deve ter a propriedade 'name'

interface CategoryFilterProps {
  // Recebe a lista de categorias do Supabase. A propriedade de nome deve ser 'name'.
  categories: Category[]; 
  
  // O selectedCategory é o ID da categoria (string) ou "all"
  selectedCategory: string; 
  
  // O onCategoryChange recebe o ID da categoria (string) ou "all"
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  
  // ⭐️ AJUSTE: Criamos a opção "Todas" usando 'name' para consistência.
  const allCategory: Category = {
    id: "all", // Usamos "all" para a URL e comparação
    name: "Todos os Adesivos", // Usamos 'name' para exibição
    // Assumimos que a interface Category tem slug, se não tiver, remova esta linha:
    slug: 'all'
  };
  
  // Concatena a opção "Todas" com as categorias reais DINÂMICAS do Supabase
  const categoriesToDisplay = [allCategory, ...categories];
  
  return (
    // 'flex-wrap' garante que as categorias quebrem a linha se houver muitas
    <div className="flex flex-wrap gap-2">
      {categoriesToDisplay.map((category) => (
        <Button
          // Usa category.id diretamente (string, seja UUID ou "all")
          key={category.id} 
          
          // Compara selectedCategory (string) com category.id (string)
          variant={selectedCategory === category.id ? "default" : "outline"} 
          
          // Passa category.id (string)
          onClick={() => onCategoryChange(category.id)} 
          className="transition-all whitespace-nowrap rounded-lg"
        >
          {/* Usa 'name' da categoria dinâmica */}
          {category.name} 
        </Button>
      ))}
    </div>
  );
};
