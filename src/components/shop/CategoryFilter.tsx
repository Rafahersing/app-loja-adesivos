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
  
  // ⭐️ CORREÇÃO 1: Criamos a opção "Todas" usando 'name' para consistência com a interface.
  const allCategory: Category = {
    id: "all", // Usamos "all" para a URL e comparação
    name: "Todos os Adesivos", // Usamos 'name' para exibição
    slug: 'all' // Adicionamos 'slug' apenas para satisfazer a interface, se necessário
  };
  
  // Concatena a opção "Todas" com as categorias reais
  const categoriesToDisplay = [allCategory, ...categories];
  
  return (
    // 'flex-wrap' garante que as categorias quebrem a linha se houver muitas
    <div className="flex flex-wrap gap-2">
      {categoriesToDisplay.map((category) => (
        <Button
          // ⭐️ CORREÇÃO 2: Usamos category.id diretamente (UUIDs já são strings)
          key={category.id} 
          
          // ⭐️ CORREÇÃO 3: Compara selectedCategory (string) com category.id (string)
          variant={selectedCategory === category.id ? "default" : "outline"} 
          
          // ⭐️ CORREÇÃO 4: Passamos category.id (string)
          onClick={() => onCategoryChange(category.id)} 
          className="transition-all whitespace-nowrap rounded-lg"
        >
          {/* ⭐️ CORREÇÃO CRÍTICA: Usamos 'name' da interface (que recebe o 'nome' do banco mapeado) */}
          {category.name} 
        </Button>
      ))}
    </div>
  );
};
