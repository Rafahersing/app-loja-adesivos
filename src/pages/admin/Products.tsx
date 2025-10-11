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
import * as XLSX from 'xlsx';
import { supabase, slugify } from '@/lib/utils';
import { toast } from "sonner";

// Interface para a categoria
interface Category {
  id: string;
  name: string;
  slug: string;
}

// ⭐️ AJUSTE: Mudar de 'title' para 'nome' e de 'description' para 'descricao' (para corresponder ao Supabase)
interface Product {
    id: string; 
    nome: string; // Coluna 'nome' no DB
    image_url: string; // Coluna 'imagem_url' no DB (mantemos a chave na interface)
    category_slug: string; 
    price: number; // Coluna 'preço' no DB
    descricao: string; // Coluna 'descricao' no DB
}

// ⭐️ AJUSTE: Mudar de 'title' para 'nome' e de 'description' para 'descricao'
interface FormData {
    nome: string;
    category_slug: string; 
    price: string;
    image_url: string; 
    descricao: string;
}

// ⭐️ AJUSTE: Mudar de 'title' para 'nome' e de 'description' para 'descricao'
const initialFormData: FormData = {
    nome: '',
    category_slug: '',
    price: '',
    image_url: '',
    descricao: '',
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [uploading, setUploading] = useState(false); 
  const [fileName, setFileName] = useState("");

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
    
    // ⭐️ CORREÇÃO CRÍTICA: Remover comentários e espaços desnecessários
    // O SELECT deve ser uma string limpa
    const { data, error } = await supabase
        .from('produtos')
        .select(`id, nome, preço, imagem_url, descricao, produtos_categorias!inner(category_id)`)
        .order('id', { ascending: false });

    if (error) {
        console.error('Erro ao carregar produtos:', error);
        // Exibe erro do Supabase se Policies estiverem incorretas
        toast.error('Erro ao carregar lista de produtos. Verifique as Policies de RLS (SELECT) no Supabase.'); 
    } else if (data) {
        // Mapeia a ID da Categoria para o SLUG da Categoria
        const categoryIdToSlug: { [key: string]: string } = categories.reduce((map, cat) => {
            map[cat.id] = cat.slug;
            return map;
        }, {});
        
        const mappedProducts = data.map((p: any) => {
            // Pega o ID da categoria da primeira relação
            const categoryId = p.produtos_categorias[0]?.category_id;
            
            return {
                id: p.id,
                // Mapeia as chaves do DB para a interface Product
                nome: p.nome,
                price: p.preço,
                image_url: p.imagem_url,
                descricao: p.descricao,
                // Converte o ID para o SLUG
                category_slug: categoryIdToSlug[categoryId] || 'sem-categoria'
            };
        });
        setProducts(mappedProducts as Product[]);
    }
    setLoadingProducts(false);
}
  // Use um useEffect para buscar categorias primeiro e, em seguida, produtos
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Quando as categorias mudam, recarrega os produtos
  useEffect(() => {
      if(categories.length > 0) {
          fetchProducts();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  // --- Handlers de Formulário ---
  
  // ⭐️ AJUSTE: Função para tratar a mudança de input mapeando os IDs do JSX para as chaves do FormData
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id as keyof FormData]: value }));
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
    
    // ⭐️ AJUSTE: Usar nome e descricao (chaves do FormData)
    const { nome, category_slug, price, image_url, descricao } = formData;

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

    // ⭐️ AJUSTE: Usar nomes de colunas do Supabase (nome, descricao, preço, imagem_url)
    const productData = { nome, imagem_url: image_url, descricao, preço: priceValue };
    let error = null;

    if (editingProduct) {
        // Lógica de EDIÇÃO (UPDATE)
        ({ error } = await supabase
            .from('produtos')
            .update(productData)
            .eq('id', editingProduct.id));
            
        if (!error) {
            // Atualizar relacionamento de categoria
            const { error: catError } = await supabase
                .from('produtos_categorias')
                .upsert(
                    { product_id: editingProduct.id, category_id: category.id },
                    { onConflict: 'product_id', ignoreDuplicates: false }
                );
            
            if (catError) console.error("Erro ao atualizar relação de categoria:", catError);

            // ⭐️ AJUSTE: Usar 'nome' na mensagem
            toast.success(`Produto '${nome}' atualizado com sucesso!`);
        }
    } else {
        // Lógica de ADIÇÃO (INSERT)
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
            
             // ⭐️ AJUSTE: Usar 'nome' na mensagem
             toast.success(`Novo produto '${nome}' adicionado com sucesso!`);
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
          // Normalize (remove acentos e caracteres, mantém espaços para checagem)
          const normalized = h.toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, ''); 
            
          // ⭐️ CORREÇÃO: Mapeamento de cabeçalho
          if (normalized.includes('url') || normalized.includes('imagem')) headerMap['url'] = i;
          else if (normalized.includes('categoria')) headerMap['categoria'] = i;
          else if (normalized.includes('titulo') || normalized.includes('nome')) headerMap['titulo'] = i;
          else if (normalized.includes('descricao')) headerMap['descricao'] = i;
          else if (normalized.includes('preco') || normalized.includes('valor')) headerMap['preco'] = i;
      });

      const urlIndex = headerMap['url'];
      const categoryIndex = headerMap['categoria'];
      const titleIndex = headerMap['titulo'];
      const descIndex = headerMap['descricao'];
      const priceIndex = headerMap['preco']; 
      
      // Verificação Mínima
      if (titleIndex === undefined) {
           throw new Error("Colunas obrigatórias (Título) não encontradas. Verifique se o cabeçalho contém 'Título' ou 'Nome'.");
      }
      
      // Aviso se faltar algo crítico (além do Título)
      if (urlIndex === undefined || categoryIndex === undefined || priceIndex === undefined) {
           toast.warning("Atenção: Nem todas as colunas obrigatórias (URL, Categoria, Preço) foram encontradas. A importação pode resultar em produtos incompletos.");
      }
      
      for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNumber = i + 2; 
          
          const title = row[titleIndex]?.trim();
          if (!title) continue; 

          const tempProductId = crypto.randomUUID(); 

          // Prepara o preço
          const priceValue = (priceIndex !== undefined && row[priceIndex]) 
                             ? row[priceIndex].toString().replace(',', '.').trim() 
                             : '0';

          const product = {
              id: tempProductId, 
              // ⭐️ AJUSTE: Usar nomes de colunas do Supabase
              imagem_url: (urlIndex !== undefined && row[urlIndex]) ? row[urlIndex].trim() : null,
              nome: title,
              descricao: (descIndex !== undefined && row[descIndex]) ? row[descIndex].trim() : 'Sem descrição.',
              preço: parseFloat(priceValue) || 0, 
          };

          finalProducts.push(product);

          // Lógica de categoria
          if (categoryIndex !== undefined && row[categoryIndex]) {
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
      }
      
      return { finalProducts, finalProductCategories };
  }
    
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
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
            // finalProducts já está formatado com nomes de coluna do Supabase (nome, descricao, preço, imagem_url)
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
        console.error('ERRO CRÍTICO NA IMPORTAÇÃO (VERIFIQUE O CONSOLE):', error);
        
        let errorMessage = "Ocorreu um erro desconhecido durante o processamento do arquivo.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        toast.error(`Falha na importação: ${errorMessage}`);
        
    } finally {
        setUploading(false);
        setFileName("");
    }
  };
  // -------------------------------------------------------------

  // --- Funções de UI ---
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
        // ⭐️ AJUSTE: Mapear as chaves de Product (nome, descricao) para FormData
        nome: product.nome, 
        category_slug: product.category_slug,
        price: product.price.toFixed(2),
        image_url: product.image_url,
        descricao: product.descricao, 
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
      // ⭐️ AJUSTE: Usar 'nome' e 'descricao' na pesquisa
      product.nome.toLowerCase().includes(lowerCaseSearch) ||
      product.descricao.toLowerCase().includes(lowerCaseSearch) ||
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
              {/* ⭐️ AJUSTE: Usar 'nome' na exibição */}
              {editingProduct ? `Editando: ${editingProduct.nome}` : 'Adicionar Produto Individual'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Título */}
                <div className="space-y-2">
                  {/* ⭐️ AJUSTE: Usar id="nome" */}
                  <Label htmlFor="nome">Título</Label>
                  <Input
                    id="nome"
                    // ⭐️ AJUSTE: Usar formData.nome
                    value={formData.nome} 
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
                {/* ⭐️ AJUSTE: Usar id="descricao" */}
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  // ⭐️ AJUSTE: Usar formData.descricao
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descreva o produto..."
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
                {uploading ? (
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
                        <p className="text-lg font-medium">Processando {fileName || 'arquivo'}...</p>
                        <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos dependendo do tamanho do arquivo.</p>
                    </div>
                ) : (
                    <>
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">
                            Faça upload de arquivo CSV ou Excel
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            O arquivo deve conter: URL, Categoria, Título, Descrição, Preço
                        </p>
                        <Input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            className="max-w-xs mx-auto"
                            onChange={handleBulkUpload}
                        />
                    </>
                )}
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="font-semibold mb-2">Formato do Arquivo:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Coluna 1: **URL da imagem**</p>
                  <p>• Coluna 2: **Categoria** (use o **SLUG** da categoria, ex: `acai`, `salgados`)</p>
                  <p>• Coluna 3: **Título**</p>
                  <p>• Coluna 4: **Descrição**</p>
                  <p>• Coluna 5: **Preço** (formato: `29.90` ou `29,90`)</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Produtos Cadastrados ({products.length})</h3>
            
            {/* Campo de Pesquisa */}
            <Input 
                type="text"
                placeholder="Pesquisar produtos por título, descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6"
            />
            
            {/* Loading e Vazio */}
            {loadingProducts && (
                 <div className="flex justify-center items-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Carregando produtos...
                </div>
            )}
            {!loadingProducts && products.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado. Adicione um para começar.</p>
            )}
            {!loadingProducts && products.length > 0 && filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum produto corresponde à sua pesquisa.</p>
            )}

            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                >
                  <img
                    src={product.image_url} 
                    // ⭐️ AJUSTE: Usar 'nome' para o alt da imagem
                    alt={product.nome}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    {/* ⭐️ AJUSTE: Usar 'nome' para o título */}
                    <h4 className="font-semibold">{product.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(product.category_slug)} • R$ {product.price.toFixed(2)}
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
                        // ⭐️ AJUSTE: Usar 'nome' na exclusão
                        onClick={() => handleDeleteProduct(product.id, product.nome)}
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
