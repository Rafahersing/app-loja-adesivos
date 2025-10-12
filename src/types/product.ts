export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  // Campos de imagem que você já usa
  imageUrl: string; 
  imageUrlHighRes: string;
  createdAt: string;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export const CATEGORIES: Category[] = [
  { id: "1", name: "Todos", slug: "all" },
  { id: "2", name: "Natureza", slug: "nature" },
  { id: "3", name: "Tecnologia", slug: "technology" },
  { id: "4", name: "Abstrato", slug: "abstract" },
  { id: "5", name: "Pessoas", slug: "people" },
  { id: "6", name: "Animais", slug: "animals" },
  { id: "7", name: "Arquitetura", slug: "architecture" },
  { id: "8", name: "Arte", slug: "art" },
];
