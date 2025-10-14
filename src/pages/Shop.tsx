import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { fetchCategories, fetchProducts } from "@/lib/utils";
import { Product, Category } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

/**
 * Página da Loja - Shop
 * --------------------------------------------------
 * Exibe lista de produtos (imagens PNG) filtráveis por categoria e subcategoria.
 * Integra-se ao Supabase via fetchProducts / fetchCategories.
 * Segue os padrões de arquitetura definidos no documento de Padrões de Desenvolvimento.
 */

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parâmetros de URL
  const selectedCategory = searchParams.get("category") || "all";
  const selectedSubcategory = searchParams.get("subcategory") || "all";
  const searchQuery = searchParams.get("search") || "";

  // Estados locais
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

