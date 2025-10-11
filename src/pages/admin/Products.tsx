// src/pages/admin/Products.tsx (AJUSTADO PARA USAR O SUPABASE)

import { useState, useEffect } from "react"; // ⭐️ Importar useEffect
import { Button } from "@/components/ui/button";
// ... (outros imports)
import { Plus, Upload, Trash2, Edit } from "lucide-react";

// ⚠️ REMOVA ESTA LINHA: import { CATEGORIES } from "@/types/product"; 
// Iremos buscar as categorias do Supabase.

// ⭐️ NOVO: Importar o Supabase
import { supabase } from '@/lib/utils';
import { toast } from "sonner";

// NOVO: Interface para a categoria (igual à do CategoryManager.tsx)
interface Category {
  id: string;
  name: string;
  slug: string;
}

const Products = () => {
  const [products] = useState(MOCK_PRODUCTS);
  // ⭐️ NOVO: Estado para armazenar as categorias reais
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ⭐️ NOVO: Função para buscar categorias no Supabase
  const fetchCategories = async () => {
    setLoadingCategories(true);
    const { data, error } = await supabase
      .from('categorias')
      .select('id, name, slug') // Busca as colunas corretas
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao carregar categorias para produtos:', error);
      toast.error('Erro ao carregar lista de categorias.');
    } else if (data) {
      setCategories(data as Category[]);
    }
    setLoadingCategories(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Executa apenas na montagem do componente

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implementar lógica de adicionar produto
    toast.success("Produto adicionado com sucesso!");
  };

  // ... (handleBulkUpload)

  return (
    <div className="space-y-8">
      {/* ... (cabeçalho) ... */}

      <Tabs defaultValue="add" className="space-y-6">
        {/* ... (TabsList) ... */}

        <TabsContent value="add">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Adicionar Produto Individual</h3>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* ... (Título) ... */}

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select required disabled={loadingCategories}> {/* Desabilita durante o carregamento */}
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Carregando..." : "Selecione uma categoria"} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* ⭐️ ALTERADO: Mapeando o estado 'categories' do Supabase ⭐️ */}
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingCategories && <p className="text-sm text-muted-foreground">Carregando categorias...</p>}
                </div>

                {/* ... (Preço e URL da Imagem) ... */}
                
              </div>
              {/* ... (Descrição e Botão) ... */}
            </form>
          </Card>
        </TabsContent>

        {/* ... (TabsContent bulk e list) ... */}
      </Tabs>
    </div>
  );
};

export default Products;
