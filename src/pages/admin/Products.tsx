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
import * as XLSX from "xlsx";
import { supabase, slugify, fetchCategories as fetchCategoriesFromUtils } from "@/lib/utils"; // Importar fetchCategories do utils com alias
import { toast } from "sonner";

// Interface para a categoria (usada no state `categories`)
interface Category {
  id: string;
  nome: string;
  descricao?: string;
}

// Interface para o produto (usada no state `products`)
interface Product {
  id: string;
  nome: string;
  imagem_url: string; // Corrigido para corresponder ao DB
  category_nome: string;
  preco: number; // Corrigido para corresponder ao DB
  descricao: string;
}

// Interface para o formulário
interface FormData {
  nome: string;
  category_nome: string;
  preco: string; // Mantido como string para input do formulário
  imagem_url: string; // Corrigido para corresponder ao DB
  descricao: string;
}

const initialFormData: FormData = {
  nome: "",
  category_nome: "",
  preco: "",
  imagem_url: "",
  descricao: "",
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

  // 1. Buscar Categorias (OK)
  const fetchCategories = async () => {
    setLoadingCategories(true);
    const fetchedCategories = await fetchCategoriesFromUtils(); // Usar a função do utils
    setCategories(fetchedCategories);
    setLoadingCategories(false);
  };

  // 2. Buscar Produtos (CORREÇÃO CRÍTICA 1: SELECT)
  const fetchProducts = async () => {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("produtos")
      .select(`id, nome, preco, imagem_url, descricao, produtos_categorias!inner(categoria_id)`)
      .order("nome", { ascending: false });

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar lista de produtos. Verifique as Policies de RLS (SELECT) no Supabase.");
    } else if (data) {
      const categoryIdToSlug: { [key: string]: string } = categories.reduce((map, cat) => {
        map[cat.id] = cat.nome;
        return map;
      }, {});

      const mappedProducts = data.map((p: any) => {
        const categoryId = p.produtos_categorias[0]?.categoria_id;

        return {
          id: p.id,
          nome: p.nome,
          preco: p.preco,
          imagem_url: p.imagem_url,
          descricao: p.descricao,
          category_nome: categoryIdToSlug[categoryId] || "sem-categoria"
        };
      });
      setProducts(mappedProducts as Product[]);
    }
    setLoadingProducts(false);
  };

  // Use um useEffect para buscar categorias primeiro
  useEffect(() => {
    fetchCategories();
  }, []);

  // Quando as categorias mudam, recarrega os produtos
  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  // --- Handlers de Formulário ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id as keyof FormData]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category_nome: value }));
  };

  const getCategoryName = (nome: string) => {
    return categories.find(c => c.nome === nome)?.nome || "Categoria Desconhecida";
  };

  // --- Funções CRUD ---

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { nome, category_nome, preco, imagem_url, descricao } = formData;

    const priceValue = parseFloat(preco);
    if (isNaN(priceValue)) {
      toast.error("O preço deve ser um número válido.");
      return;
    }

    const category = categories.find(c => c.nome === category_nome);
    if (!category) {
      toast.error("Categoria inválida ou não selecionada.");
      return;
    }

    const productData = {
      nome,
      imagem_url,
      descricao,
      preco: priceValue
    };

    let error = null;

    if (editingProduct) {
      ({ error } = await supabase
        .from("produtos")
        .update(productData)
        .eq("id", editingProduct.id));

      if (!error) {
        const { error: catError } = await supabase
          .from("produtos_categorias")
          .upsert(
            { produto_id: editingProduct.id, categoria_id: category.id },
            { onConflict: "produto_id", ignoreDuplicates: false }
          );

        if (catError) console.error("Erro ao atualizar relação de categoria:", catError);

        toast.success(`Produto \'${nome}\' atualizado com sucesso!`);
      }
    } else {
      const { data: insertedProduct, error: insertError } = await supabase
        .from("produtos")
        .insert(productData)
        .select("id");

      error = insertError;

      if (insertedProduct && insertedProduct.length > 0 && !insertError) {
        const { error: catError } = await supabase
          .from("produtos_categorias")
          .insert({
            produto_id: insertedProduct[0].id,
            categoria_id: category.id
          });

        if (catError) console.error("Erro ao inserir relação de categoria:", catError);

        toast.success(`Novo produto \'${nome}\' adicionado com sucesso!`);
      }
    }

    if (error) {
      console.error("Erro de Supabase (Salvar Produto):", error);
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
      .from("produtos")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error(`Falha ao excluir: ${error.message}`);
    } else {
      toast.success(`Produto "${productName}" excluído com sucesso!`);
      fetchProducts(); // Recarrega os dados
    }
    setLoadingProducts(false);
  };

  // --- Importação em Massa (Lógica Real) ---

  const processAndPrepareProducts = async (rows: string[][], headers: string[]) => {
    const categoryMap: { [key: string]: string } = categories.reduce((map, cat) => {
      map[cat.slug] = cat.id;
      return map;
    }, {});

    const finalProducts = [];
    const finalProductCategories = [];

    const headerMap: { [key: string]: number } = {};

    headers.forEach((h, i) => {
      const normalized = h.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (normalized.includes("url") || normalized.includes("imagem")) headerMap["url"] = i;
      else if (normalized.includes("categoria")) headerMap["categoria"] = i;
      else if (normalized.includes("titulo") || normalized.includes("nome")) headerMap["titulo"] = i;
      else if (normalized.includes("descricao")) headerMap["descricao"] = i;
      else if (normalized.includes("preco") || normalized.includes("valor")) headerMap["preco"] = i;
    });

    const urlIndex = headerMap["url"];
    const categoryIndex = headerMap["categoria"];
    const titleIndex = headerMap["titulo"];
    const descIndex = headerMap["descricao"];
    const priceIndex = headerMap["preco"];

    if (titleIndex === undefined) {
      throw new Error("Colunas obrigatórias (Título) não encontradas. Verifique se o cabeçalho contém \'Título\' ou \'Nome\'.");
    }

    if (urlIndex === undefined || categoryIndex === undefined || priceIndex === undefined) {
      toast.warning("Atenção: Nem todas as colunas obrigatórias (URL, Categoria, Preço) foram encontradas. A importação pode resultar em produtos incompletos.");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      const title = row[titleIndex]?.trim();
      if (!title) continue;

      const tempProductId = crypto.randomUUID();

      const priceValue = (priceIndex !== undefined && row[priceIndex])
        ? row[priceIndex].toString().replace(",", ".").trim()
        : "0";

      const product = {
        id: tempProductId,
        imagem_url: (urlIndex !== undefined && row[urlIndex]) ? row[urlIndex].trim() : null,
        nome: title,
        descricao: (descIndex !== undefined && row[descIndex]) ? row[descIndex].trim() : "Sem descrição.",
        preco: parseFloat(priceValue) || 0,
      };

      finalProducts.push(product);

      if (categoryIndex !== undefined && row[categoryIndex]) {
        const categoryName = row[categoryIndex]?.trim();
        const categorySlug = slugify(categoryName);
        const categoryId = categoryMap[categorySlug];

        if (categoryId) {
          finalProductCategories.push({
            produto_id: tempProductId,
            categoria_id: categoryId,
          });
        } else {
          toast.warning(`Linha ${rowNumber}: Categoria "${categoryName}" não encontrada. Produto será importado, mas sem categoria.`);
        }
      }
    }

    return { finalProducts, finalProductCategories };
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (e.target) e.target.value = "";

    if (!file) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonProducts = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      if (jsonProducts.length <= 1) {
        toast.error("O arquivo está vazio ou contém apenas cabeçalho.");
        return;
      }

      const [headers, ...rows] = jsonProducts;

      const { finalProducts, finalProductCategories } = await processAndPrepareProducts(rows, headers);

      if (finalProducts.length === 0) {
        toast.info("Nenhum produto válido encontrado para importação.");
        return;
      }

      const { error: productsError } = await supabase
        .from("produtos")
        .insert(finalProducts);

      if (productsError) throw new Error(`Falha ao inserir produtos: ${productsError.message}`);

      if (finalProductCategories.length > 0) {
        const { error: categoriesError } = await supabase
          .from("produtos_categorias")
          .insert(finalProductCategories);

        if (categoriesError) throw new Error(`Falha ao inserir categorias: ${categoriesError.message}`);
      }

      toast.success(`Sucesso! ${finalProducts.length} produtos importados e categorizados.`);
      fetchProducts(); // Recarrega os produtos

    } catch (error) {
      console.error("ERRO CRÍTICO NA IMPORTAÇÃO (VERIFIQUE O CONSOLE):", error);

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
      nome: product.nome,
      category_nome: product.category_nome,
      preco: product.preco.toString(),
      imagem_url: product.imagem_url,
      descricao: product.descricao,
    });
    setActiveTab("add");
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setActiveTab("list");
  };

  const filteredProducts = useMemo(() => {
    // Implementar lógica de filtro/pesquisa aqui se necessário
    return products;
  }, [products]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Gerenciar Produtos</h1>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="add">Adicionar Produto</TabsTrigger>
                <TabsTrigger value="bulk-upload">Upload em Massa</TabsTrigger>
                <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                {/* Botões de ação, se houver */}
              </div>
            </div>

            {/* Tab de Adicionar Produto Individual */}
            <TabsContent value="add">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingProduct ? "Editar Produto" : "Adicionar Produto Individual"}
                </h2>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Título</Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Nome do produto"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_nome">Categoria</Label>
                      <Select
                        value={formData.category_nome}
                        onValueChange={handleSelectChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingCategories ? (
                            <SelectItem value="loading" disabled>
                              Carregando categorias...
                            </SelectItem>
                          ) : categories.length === 0 ? (
                            <SelectItem value="no-categories" disabled>
                              Nenhuma categoria encontrada.
                            </SelectItem>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.nome}>
                                {category.nome}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço (R$)</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        placeholder="29.90"
                        value={formData.preco}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imagem_url">URL da Imagem Externa</Label>
                      <Input
                        id="imagem_url"
                        type="url"
                        placeholder="https://exemplo.com/imagem.png"
                        value={formData.imagem_url}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva o produto..."
                      value={formData.descricao}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex items-center gap-2">
                      {editingProduct ? (
                        <><Edit className="h-4 w-4" /> Salvar Alterações</>
                      ) : (
                        <><Plus className="h-4 w-4" /> Adicionar Produto</>
                      )}
                    </Button>
                    {editingProduct && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancelar Edição
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            </TabsContent>

            {/* Tab de Upload em Massa */}
            <TabsContent value="bulk-upload">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Upload de Produtos em Massa</h2>
                <p className="text-muted-foreground mb-4">
                  Faça o upload de um arquivo Excel (.xlsx) ou CSV para adicionar múltiplos produtos de uma vez.
                  O arquivo deve conter as colunas: <code className="font-mono">Título</code>, <code className="font-mono">Descrição</code>, <code className="font-mono">Preço</code>, <code className="font-mono">URL da Imagem</code> e <code className="font-mono">Categoria (slug)</code>.
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bulk-file-upload" className="cursor-pointer">
                    <Button asChild>
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Selecionar Arquivo
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="bulk-file-upload"
                    type="file"
                    accept=".xlsx, .csv"
                    onChange={handleBulkUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </Card>
            </TabsContent>

            {/* Tab de Lista de Produtos */}
            <TabsContent value="list">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Produtos Cadastrados ({products.length})</h2>
                <Input
                  placeholder="Pesquisar produtos por título, descrição ou categoria..."
                  className="mb-4"
                // Adicionar lógica de pesquisa aqui
                />
                {loadingProducts ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Carregando produtos...</span>
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-muted-foreground text-center">Nenhum produto cadastrado. Adicione um para começar.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="p-4 flex flex-col">
                        <img src={product.imagem_url} alt={product.nome} className="w-full h-48 object-cover rounded-md mb-4" />
                        <h3 className="text-lg font-semibold mb-1">{product.nome}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{getCategoryName(product.category_slug)}</p>
                        <p className="text-md font-bold mb-4">R$ {product.preco.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground flex-grow">{product.descricao}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id, product.nome)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Products;

