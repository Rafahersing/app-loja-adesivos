// src/pages/admin/Products.tsx

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Trash2, Edit, Loader2 } from "lucide-react"; 
import * as XLSX from 'xlsx'; // Importação da biblioteca XLSX
// A MOCK_PRODUCTS foi removida, assumindo que você não a usa mais
import { supabase, slugify } from '@/lib/utils';
import { toast } from "sonner";

// Interface para a categoria
interface Category {
  id: string;
  name: string;
  slug: string;
}

// Interface para o produto (Ajustada para corresponder ao DB)
interface Product {
    id: string; 
    title: string;
    image_url: string; 
    category_slug: string; 
    price: number;
    description: string;
}

// Interface para o estado do formulário
interface FormData {
    title: string;
    category_slug: string; 
    price: string;
    image_url: string; 
    description: string;
}

// Estado inicial do formulário
const initialFormData: FormData = {
    title: '',
    category_slug: '',
    price: '',
    image_url: '',
    description: '',
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [uploading, setUploading] = useState(false); 
  const [fileName, setFileName] = useState(""); // Adicionado para exibição

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("list");

  // --- Funções de Carregamento de Dados ---

  // 1. Buscar Categorias
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
    
  // 2. Buscar Produtos Reais
  const fetchProducts = async () => {
    setLoadingProducts(true);
    
    // Consulta produtos e as categorias relacionadas (JOIN)
    const { data, error } = await supabase
        .from('produtos')
        .select(`
            id,
            title,
            price,
            image_url,
            description,
            produtos_categorias (
                categorias ( slug )
            )
        `)
        .order('id', { ascending: false });

    if (error) {
        console.error('Erro ao carregar produtos:', error);
        // Não mostrar toast se o erro for 'permission denied', mas sim se for um erro crítico de conexão
        if (!error.message.includes('permission denied')) { 
             toast.error('Erro ao carregar lista de produtos. Verifique as tabelas.');
        }
    } else if (data) {
        const mappedProducts = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            image_url: p.image_url,
            description: p.description,
            // Extrai o slug da categoria, assumindo uma categoria por produto para simplificar
            category_slug: p.produtos_categorias[0]?.categorias?.slug || 'sem-categoria'
        }));
        setProducts(mappedProducts as Product[]);
    }
    setLoadingProducts(false);
  }

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // --- Handlers de Formulário ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category_slug: value }));
  };

  const getCategoryName = (slug: string) => {
    return categories.find(c => c.slug === slug)?.name || 'Categoria Desconhecida';
  };

  // --- Funções CRUD ---

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { title, category_slug, price, image_url, description } = formData;

    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      toast.error("O preço deve ser um número válido.");
      return;
    }

    const category = categories.find(c => c.slug === category_slug);
    if (!category) {
        toast.error("Categoria inválida ou não selecionada.");
        return;
    }

    // Campos da tabela 'produtos'
    const productData = { title, image_url, description, price: priceValue };
    let error = null;

    if (editingProduct) {
        // Lógica de EDIÇÃO (UPDATE)
        ({ error } = await supabase
            .from('produtos')
            .update(productData)
            .eq('id', editingProduct.id));
            
        if (!error) {
            // Atualizar relacionamento de categoria
            // Usamos upsert para garantir que a relação exista ou seja atualizada
            const { error: catError } = await supabase
                .from('produtos_categorias')
                .upsert(
                    { product_id: editingProduct.id, category_id: category.id },
                    { onConflict: 'product_id', ignoreDuplicates: false }
                );
            
            if (catError) console.error("Erro ao atualizar relação de categoria:", catError);

            toast.success(`Produto '${title}' atualizado com sucesso!`);
        }
    } else {
        // Lógica de ADIÇÃO (INSERT)
        // O Supabase deve gerar o UUID se a coluna 'id' não for passada.
        const { data: insertedProduct, error: insertError } = await supabase
            .from('produtos')
            .insert(productData)
            .select('id'); 
            
        error = insertError;

        if (insertedProduct && insertedProduct.length > 0 && !insertError) {
             // Inserir relacionamento de categoria
             const { error: catError } = await supabase
                .from('produtos_categorias')
                .insert({ 
                    product_id: insertedProduct[0].id, 
                    category_id: category.id 
                });
             
             if (catError) console.error("Erro ao inserir relação de categoria:", catError);
            
             toast.success(`Novo produto '${title}' adicionado com sucesso!`);
        }
    }
    
    if (error) {
        console.error('Erro de Supabase (Salvar Produto):', error);
        toast.error(`Falha ao salvar produto: ${error.message}`);
    } else {
        setEditingProduct(null);
        setFormData(initialFormData);
        setActiveTab("list");
        fetchProducts(); // Recarrega os dados
    }
  };


  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto: "${productName}"?`)) {
        return;
    }
    
    setLoadingProducts(true);

    const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error(`Falha ao excluir: ${error.message}`);
    } else {
        toast.success(`Produto "${productName}" excluído com sucesso!`);
        fetchProducts(); // Recarrega os dados
    }
    setLoadingProducts(false);
  };
    
  // --- Importação em Massa (Lógica Real) ---
    
  const processAndPrepareProducts = async (rows: string[][], headers: string[]) => {
      // Mapeamento de Slug para ID
      const categoryMap: { [key: string]: string } = categories.reduce((map, cat) => {
          map[cat.slug] = cat.id;
          return map;
      }, {});
      
      const finalProducts = [];
      const finalProductCategories = [];
      
      // Mapeia o índice da coluna do cabeçalho
      const headerMap: { [key: string]: number } = {};
      
      // Mapeamento tolerante a diferentes nomes/casos
      headers.forEach((h, i) => {
          const normalized = h.toLowerCase().trim()
            .replace(/[^a-z0-9]/g, ''); // Remove todos os caracteres não alfanuméricos
            
          if (normalized.includes('url')) headerMap['url'] = i;
          else if (normalized.includes('categoria')) headerMap['categoria'] = i;
          else if (normalized.includes('titulo')) headerMap['titulo'] = i;
          else if (normalized.includes('descricao')) headerMap['descricao'] = i;
          else if (normalized.includes('preco')) headerMap['preco'] = i;
      });

      const urlIndex = headerMap['url'];
      const categoryIndex = headerMap['categoria'];
      const titleIndex = headerMap['titulo'];
      const descIndex = headerMap['descricao'];
      const priceIndex = headerMap['preco']; 
      
      // Validação básica de cabeçalho
      if (urlIndex === undefined || categoryIndex === undefined || titleIndex === undefined || priceIndex === undefined) {
           throw new Error("Colunas obrigatórias (URL, Categoria, Título, Preço) não encontradas no cabeçalho. Verifique a ortografia.");
      }

      for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNumber = i + 2; 
          
          const title = row[titleIndex]?.trim();
          if (!title) continue; 

          const tempProductId = crypto.randomUUID(); 

          // Prepara o preço (limpa vírgula e converte)
          const priceValue = row[priceIndex]?.toString().replace(',', '.').trim();

          const product = {
              id: tempProductId, 
              image_url: row[urlIndex]?.trim() || null,
              title: title,
              description: row[descIndex]?.trim() || 'Sem descrição.',
              price: parseFloat(priceValue) || 0, 
              // Removido created_at para deixar o Supabase cuidar disso (se configurado)
          };

          finalProducts.push(product);

          const categoryName = row[categoryIndex]?.trim();
          const categorySlug = slugify(categoryName);
          const categoryId = categoryMap[categorySlug];
          
          if (categoryId) {
              finalProductCategories.push({
                  product_id: tempProductId,
                  category_id: categoryId,
              });
          } else {
              toast.warning(`Linha ${rowNumber}: Categoria "${categoryName}" não encontrada. Produto será importado, mas sem categoria.`);
          }
      }
      
      return { finalProducts, finalProductCategories };
  }
    
  // ⭐️ handleBulkUpload ATUALIZADO COM LÓGICA DE TRATAMENTO DE ERROS ⭐️
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Limpa o input imediatamente
    if (e.target) e.target.value = '';

    if (!file) {
        toast.error("Nenhum arquivo selecionado.");
        return;
    }
    
    setFileName(file.name);
    setUploading(true);
    
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonProducts = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        if (jsonProducts.length <= 1) {
            toast.error("O arquivo está vazio ou contém apenas cabeçalho.");
            return;
        }

        const [headers, ...rows] = jsonProducts;

        // Processa e prepara os dados
        const { finalProducts, finalProductCategories } = await processAndPrepareProducts(rows, headers);
        
        if (finalProducts.length === 0) {
             toast.info("Nenhum produto válido encontrado para importação.");
             return;
        }

        // 1. Inserir Produtos em Lote
        const { error: productsError } = await supabase
            .from('produtos')
            .insert(finalProducts);

        if (productsError) throw new Error(`Falha ao inserir produtos: ${productsError.message}`);

        // 2. Inserir Relações Produto-Categoria em Lote
        if (finalProductCategories.length > 0) {
             const { error: categoriesError } = await supabase
                .from('produtos_categorias')
                .insert(finalProductCategories);
                
             if (categoriesError) throw new Error(`Falha ao inserir categorias: ${categoriesError.message}`);
        }

        toast.success(`Sucesso! ${finalProducts.length} produtos importados e categorizados.`);
        fetchProducts(); // Recarrega os produtos
        
    } catch (error) {
        // ⭐️ CAPTURA DE ERRO APRIMORADA ⭐️
        console.error('ERRO CRÍTICO NA IMPORTAÇÃO (VERIFIQUE O CONSOLE):', error);
        
        // Determina o erro para feedback melhor
        let errorMessage = "Ocorreu um erro desconhecido durante o processamento do arquivo.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        toast.error(`Falha na importação: ${errorMessage}`);
        
    } finally {
        setUploading(false); // Garante que o estado seja desligado
        setFileName("");
    }
  };
  // -------------------------------------------------------------

  // --- Funções de UI ---
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
        title: product.title,
        category_slug: product.category_slug,
        price: product.price.toFixed(2),
        image_url: product.image_url,
        description: product.description,
    });
    setActiveTab("add");
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setActiveTab("list");
  };
  
  // Função de pesquisa no frontend (otimização)
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const lowerCaseSearch = searchTerm.toLowerCase().trim();
    
    return products.filter(product => 
      product.title.toLowerCase().includes(lowerCaseSearch) ||
      product.description.toLowerCase().includes(lowerCaseSearch) ||
      product.category_slug.toLowerCase().includes(lowerCaseSearch)
    );
  }, [products, searchTerm]);


  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Produtos</h1>
          <p className="text-muted-foreground">
            Adicione, edite e gerencie os produtos da loja
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
                    placeholder="Nome do produto"
                    required
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="category_slug">Categoria</Label>
                  <Select 
                    required 
                    disabled={loadingCategories}
                    value={formData.category_slug}
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
                  <Label htmlFor="image_url">URL da Imagem Externa</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/imagem.png"
                    required
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
