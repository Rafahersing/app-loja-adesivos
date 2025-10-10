import { Button } from "@/components/ui/button";
import { CATEGORIES, Category } from "@/types/product";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          onClick={() => onCategoryChange(category.slug)}
          className="transition-all"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
