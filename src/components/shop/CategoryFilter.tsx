import { Button } from "@/components/ui/button";
import { Category } from "@/types/product"; // Usaremos apenas a tipagem Category

interface CategoryFilterProps {
  // ⭐️ Novo: Agora recebe a lista de categorias do Supabase
  categories: Category[]; 
  
  // O selectedCategory será o ID da categoria (como string), ou "all"
  selectedCategory: string; 
  
  // O onCategoryChange recebe o ID da categoria (string) ou "all"
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  
  // ⭐️ Criamos a opção "Todas" manualmente, já que ela não vem do banco de dados
  const allCategory = {
    id: "all", // Usamos "all" para a URL
    nome: "Todas as Imagens" // Usamos "nome" para alinhar com a tipagem
  } as unknown as Category; // Faz um cast para alinhar com a tipagem, se necessário
  
  // Concatena a opção "Todas" com as categorias reais
  const categoriesToDisplay = [allCategory, ...categories];
  
  return (
    <div className="flex flex-wrap gap-2">
      {categoriesToDisplay.map((category) => (
        <Button
          // ⭐️ Usamos o ID da categoria (convertido para string se for número)
          key={category.id} 
          
          // ⭐️ Compara com o ID da categoria. Se category.id for número, converta para string: category.id.toString()
          variant={selectedCategory === category.id.toString() ? "default" : "outline"} 
          
          // ⭐️ Passamos o ID (string) ou "all" para a função de mudança
          onClick={() => onCategoryChange(category.id.toString())} 
          className="transition-all"
        >
          {category.nome} {/* ⭐️ Usamos 'nome' em vez de 'name' */}
        </Button>
      ))}
    </div>
  );
};
