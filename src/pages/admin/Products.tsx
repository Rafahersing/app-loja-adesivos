// src/pages/admin/Products.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Trash2, Edit } from "lucide-react";
// Importações de dados e utilitários
import { MOCK_PRODUCTS } from "@/lib/mockData"; 
import { supabase } from '@/lib/utils';
import { toast } from "sonner";

// Interface para a categoria
interface Category {
  id: string;
  name: string;
  slug: string;
}

// Interface para o produto
interface Product {
    id: number; // Supondo que o mock usa número
    title: string;
    imageUrl: string;
    category: string;
    price: number;
    description: string;
}

// Interface para o estado do formulário
interface FormData {
    title: string;
    category: string;
    price: string;
    imageUrl: string;
    description: string;
}

// Estado inicial do formulário
const initialFormData: FormData = {
    title: '',
    category: '',
    price: '',
    imageUrl: '',
    description: '',
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("list"); 


  // Função para buscar categorias no Supabase (mantida)
  const fetchCategories = async () => {
    setLoadingCategories(true);
    const { data, error } = await supabase
      .from('categorias')
      .select('id, name, slug')
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
  }, []);

  // Handler genérico para inputs de texto e área de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handler para o Select (Categoria)
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  // Lógica de Adicionar/Salvar Edição
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingProduct) {
        // Lógica de EDIÇÃO (Mock)
        toast.success(`Produto '${formData.title}' atualizado com sucesso! (Mock)`);

        // Atualizar lista local (Mock)
        setProducts(prev => prev.map(p => 
            p.id === editingProduct.id 
                ? { ...p, ...formData, price: parseFloat(formData.price) } 
                : p
        ));
        
        // TODO: Implementar lógica de UPDATE do Supabase aqui

    } else {
        // Lógica de ADIÇÃO (Mock)
        const newId = products.length > 0 ? products[0].id + 1 : 1; // ID simples
        const newProduct: Product = {
            id: newId,
            ...formData,
            price: parseFloat(formData.price),
        };
        setProducts(prev => [newProduct, ...prev]);
        toast.success("Novo produto adicionado com sucesso! (Mock)");
        
        // TODO: Implementar lógica de INSERT do Supabase aqui
    }

    // Resetar estados e voltar para a lista
    setEditingProduct(null);
    setFormData(initialFormData);
    setActiveTab("list");
  };

  // ⭐️ FUNÇÃO ATUALIZADA: Implementação simulada do Upload em Massa ⭐️
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    // ⭐️ ATUALIZAÇÃO: Resetar para um placeholder (a implementação real precisa de bibliotecas) ⭐️
const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
        toast.error("Nenhum arquivo selecionado.");
        return;
    }
    
    // Limpa o input de arquivo
    e.target.value = '';

    // TODO: Implementar lógica real de leitura de arquivo (CSV/Excel) e INSERT MANY no Supabase
    // Isso requer uma biblioteca (como papaparse, xlsx) que não podemos instalar neste ambiente.

    toast.info(`Simulação: Arquivo ${file.name} recebido. A importação real será implementada na próxima fase.`);
    
    // Mantemos a mudança de aba opcionalmente, mas não adicionamos produtos
    setActiveTab("bulk"); 
};
    
    // Calcula o próximo ID disponível
    const maxCurrentId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 100;
    
    const newProducts: Product[] = mockBulkData.map((item, index) => ({
        ...item,
        // Garante que os novos IDs são únicos (para o mock)
        id: maxCurrentId + 1 + index,
        price: item.price, // Já está como number no mock
    }));

    // Atualização do state local com os novos produtos
    setProducts(prev => [...newProducts, ...prev]);

    // Limpa o input de arquivo (para que o onChange dispare novamente se o mesmo arquivo for selecionado)
    e.target.value = ''; 
    
    toast.success(`${newProducts.length} produtos importados em massa com sucesso!`);
    setActiveTab("list"); // Move o usuário para a lista
    
    // TODO: Adicionar lógica real de INSERT MANY do Supabase aqui
  };
  // -------------------------------------------------------------

  // Função para Entrar no Modo de Edição
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
        title: product.title,
        category: product.category, // Categoria é o slug
        price: product.price.toFixed(2),
        imageUrl: product.imageUrl,
        description: product.description,
    });
    // Mudar para a aba de formulário
    setActiveTab("add");
  };

  // Função para Excluir Produto (Lógica Mock - Mantida)
  const handleDeleteProduct = (productId: number, productName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto: "${productName}"?`)) {
        return;
    }

    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    
    toast.success(`Produto "${productName}" excluído com sucesso (localmente).`);

    // TODO: Adicionar lógica real de DELETE do Supabase aqui no futuro
  };
  
  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setActiveTab("list");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Produtos</h1>
          <p className="text-muted-foreground">
            Adicione e gerencie os produtos da loja
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="add">
             {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
          </TabsTrigger>
          <TabsTrigger value="bulk">Upload em Massa</TabsTrigger>
          <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">
              {editingProduct ? `Editando: ${editingProduct.title}` : 'Adicionar Produto Individual'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="Nome da imagem"
                    required
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    required 
                    disabled={loadingCategories}
                    value={formData.category}
                    onValueChange={handleSelectChange}
                  > 
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Carregando..." : "Selecione uma categoria"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingCategories && <p className="text-sm text-muted-foreground">Carregando categorias...</p>}
                </div>

                {/* Preço */}
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="29.90"
                    required
                  />
                </div>

                {/* URL da Imagem */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem Externa</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/imagem.png"
                    required
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva a imagem..."
                  rows={4}
                  required
                />
              </div>

              {/* Botões de Ação */}
              <div className='flex gap-2'>
                <Button type="submit" variant="hero" size="lg">
                    {editingProduct ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    {editingProduct ? 'Salvar Edição' : 'Adicionar Produto'}
                </Button>
                
                {/* Botão de Cancelar Edição */}
                {editingProduct && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="lg"
                        onClick={handleCancelEdit}
                    >
                        Cancelar Edição
                    </Button>
                )}
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Upload em Massa</h3>
            <div className="space-y-6">
              <div className="rounded-lg border-2 border-dashed p-12 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Faça upload de arquivo CSV ou Excel
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  O arquivo deve conter: URL, Categoria, Título, Descrição, Preço
                </p>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="max-w-xs mx-auto"
                  onChange={handleBulkUpload} // ⭐️ AGORA CONECTADO À NOVA LÓGICA ⭐️
                />
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="font-semibold mb-2">Formato do Arquivo:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Coluna 1: URL da imagem</p>
                  <p>• Coluna 2: Categoria (slug: nature, technology, abstract, etc)</p>
                  <p>• Coluna 3: Título</p>
                  <p>• Coluna 4: Descrição</p>
                  <p>• Coluna 5: Preço (formato: 29.90)</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Produtos Cadastrados</h3>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{product.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.category} • R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id, product.title)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
