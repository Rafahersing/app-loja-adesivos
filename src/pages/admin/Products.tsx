// src/pages/admin/Products.tsx

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Trash2, Edit, Loader2, CheckSquare, Square } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase, fetchCategories as fetchCategoriesFromUtils } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

// Interface para a categoria
interface Category {
  id: string;
  nome: string;
  descricao?: string;
}

// Interface para o produto
interface Product {
  id: string;
  nome: string;
  imagem_url: string;
  category_ids: string[];
  category_names: string[];
  preco: number;
  descricao: string;
}

// Interface para o formulário
interface FormData {
  nome: string;
  category_ids: string[];
  preco: string;
  imagem_url: string;
  descricao: string;
}

const initialFormData: FormData = {
  nome: "",
  category_ids: [],
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    preco: "",
    category_ids: [] as string[],
    descricao: "",
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("list");

  // Buscar Categorias
  const fetchCategories = async () => {
    setLoadingCategories(true);
    const fetchedCategories = await fetchCategoriesFromUtils();
    setCategories(fetchedCategories);
    setLoadingCategories(false);
  };

  // Buscar Produtos com imagens da tabela arquivos
  const fetchProducts = async () => {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("produtos")
      .select(`
        id, 
        titulo, 
        preco, 
        descricao,
        arquivos(url),
        produtos_categorias(categoria_id)
      `)
      .order("titulo", { ascending: true });

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar lista de produtos.");
    } else if (data) {
      const categoryIdToName: { [key: string]: string } = categories.reduce((map, cat) => {
        map[cat.id] = cat.nome;
        return map;
      }, {} as { [key: string]: string });

      const mappedProducts = data.map((p: any) => {
        const categoryIds = p.produtos_categorias?.map((pc: any) => pc.categoria_id) || [];
        const categoryNames = categoryIds.map((id: string) => categoryIdToName[id] || "Desconhecida");
        const imageUrl = p.arquivos && p.arquivos.length > 0 ? p.arquivos[0].url : "";

        return {
          id: p.id,
          nome: p.titulo,
          preco: parseFloat(p.preco) || 0,
          imagem_url: imageUrl,
          descricao: p.descricao || "",
          category_ids: categoryIds,
          category_names: categoryNames,
        };
      });
      setProducts(mappedProducts as Product[]);
    }
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // Handlers de Formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id as keyof FormData]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const newCategoryIds = prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId];
      return { ...prev, category_ids: newCategoryIds };
    });
  };

  // Salvar Produto
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { nome, category_ids, preco, imagem_url, descricao } = formData;

    const priceValue = parseFloat(preco);
    if (isNaN(priceValue)) {
      toast.error("O preço deve ser um número válido.");
      return;
    }

    if (category_ids.length === 0) {
      toast.error("Selecione pelo menos uma categoria.");
      return;
    }

    if (!imagem_url.trim()) {
      toast.error("A URL da imagem é obrigatória.");
      return;
    }

    const productData = {
      titulo: nome,
      descricao,
      preco: priceValue
    };

    let productId = editingProduct?.id;

    if (editingProduct) {
      const { error } = await supabase
        .from("produtos")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        console.error("Erro ao atualizar produto:", error);
        toast.error(`Falha ao atualizar produto: ${error.message}`);
        return;
      }

      // Deletar categorias antigas
      await supabase
        .from("produtos_categorias")
        .delete()
        .eq("produto_id", editingProduct.id);

      // Deletar arquivos antigos
      await supabase
        .from("arquivos")
        .delete()
        .eq("produto_id", editingProduct.id);

    } else {
      const { data: insertedProduct, error: insertError } = await supabase
        .from("produtos")
        .insert(productData)
        .select("id");

      if (insertError || !insertedProduct || insertedProduct.length === 0) {
        console.error("Erro ao inserir produto:", insertError);
        toast.error(`Falha ao criar produto: ${insertError?.message}`);
        return;
      }

      productId = insertedProduct[0].id;
    }

    // Inserir novas categorias
    const categoryInserts = category_ids.map(catId => ({
      produto_id: productId,
      categoria_id: catId
    }));

    const { error: catError } = await supabase
      .from("produtos_categorias")
      .insert(categoryInserts);

    if (catError) {
      console.error("Erro ao inserir categorias:", catError);
      toast.error(`Falha ao associar categorias: ${catError.message}`);
      return;
    }

    // Inserir imagem na tabela arquivos
    const { error: fileError } = await supabase
      .from("arquivos")
      .insert({
        produto_id: productId,
        url: imagem_url,
        tipo: "imagem"
      });

    if (fileError) {
      console.error("Erro ao inserir arquivo:", fileError);
      toast.error(`Falha ao salvar imagem: ${fileError.message}`);
      return;
    }

    toast.success(editingProduct ? `Produto atualizado com sucesso!` : `Novo produto adicionado com sucesso!`);
    setEditingProduct(null);
    setFormData(initialFormData);
    setActiveTab("list");
    fetchProducts();
  };

  // Deletar Produto
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto: "${productName}"?`)) {
      return;
    }

    setLoadingProducts(true);

    // Excluir associações de categoria
    await supabase
      .from("produtos_categorias")
      .delete()
      .eq("produto_id", productId);

    // Excluir arquivos
    await supabase
      .from("arquivos")
      .delete()
      .eq("produto_id", productId);

    // Excluir produto
    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error(`Falha ao excluir: ${error.message}`);
    } else {
      toast.success(`Produto "${productName}" excluído com sucesso!`);
      fetchProducts();
    }
    setLoadingProducts(false);
  };

  // Upload em Massa
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

      const jsonProducts = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonProducts.length <= 1) {
        toast.error("O arquivo está vazio ou contém apenas cabeçalho.");
        setUploading(false);
        return;
      }

      const [headers, ...rows] = jsonProducts;

      const categoryMap: { [key: string]: string } = categories.reduce((map, cat) => {
        map[cat.nome.toLowerCase()] = cat.id;
        return map;
      }, {} as { [key: string]: string });

      const headerMap: { [key: string]: number } = {};

      headers.forEach((h: any, i: number) => {
        const normalized = String(h).toLowerCase().trim()
          .normalize("NFD").replace(/[̀-ͯ]/g, "");

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
        throw new Error("Coluna 'Título' não encontrada.");
      }

      let successCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const title = row[titleIndex] ? String(row[titleIndex]).trim() : "";
        
        if (!title) continue;

        const priceValue = (priceIndex !== undefined && row[priceIndex])
          ? parseFloat(String(row[priceIndex]).replace(",", ".").trim())
          : 0;

        const productData = {
          titulo: title,
          descricao: (descIndex !== undefined && row[descIndex]) ? String(row[descIndex]).trim() : "Sem descrição.",
          preco: priceValue,
        };

        const { data: insertedProduct, error: productError } = await supabase
          .from("produtos")
          .insert(productData)
          .select("id");

        if (productError || !insertedProduct || insertedProduct.length === 0) {
          console.error(`Erro ao inserir produto linha ${i + 2}:`, productError);
          continue;
        }

        const newProductId = insertedProduct[0].id;

        // Inserir categoria se existir
        if (categoryIndex !== undefined && row[categoryIndex]) {
          const categoryName = String(row[categoryIndex]).trim().toLowerCase();
          const categoryId = categoryMap[categoryName];

          if (categoryId) {
            await supabase
              .from("produtos_categorias")
              .insert({
                produto_id: newProductId,
                categoria_id: categoryId,
              });
          }
        }

        // Inserir imagem se existir
        if (urlIndex !== undefined && row[urlIndex]) {
          const imageUrl = String(row[urlIndex]).trim();
          await supabase
            .from("arquivos")
            .insert({
              produto_id: newProductId,
              url: imageUrl,
              tipo: "imagem"
            });
        }

        successCount++;
      }

      toast.success(`Sucesso! ${successCount} produtos importados.`);
      fetchProducts();

    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error(`Falha na importação: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setUploading(false);
      setFileName("");
    }
  };

  // Edição em Massa
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleBulkEditSave = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecione pelo menos um produto.");
      return;
    }

    const updates: any = {};
    
    if (bulkEditData.preco) {
      const priceValue = parseFloat(bulkEditData.preco);
      if (!isNaN(priceValue)) {
        updates.preco = priceValue;
      }
    }

    if (bulkEditData.descricao) {
      updates.descricao = bulkEditData.descricao;
    }

    const productIds = Array.from(selectedProducts);

    if (Object.keys(updates).length > 0) {
      for (const productId of productIds) {
        await supabase
          .from("produtos")
          .update(updates)
          .eq("id", productId);
      }
    }

    if (bulkEditData.category_ids.length > 0) {
      for (const productId of productIds) {
        await supabase
          .from("produtos_categorias")
          .delete()
          .eq("produto_id", productId);

        const categoryInserts = bulkEditData.category_ids.map(catId => ({
          produto_id: productId,
          categoria_id: catId
        }));

        await supabase
          .from("produtos_categorias")
          .insert(categoryInserts);
      }
    }

    toast.success(`${productIds.length} produtos atualizados com sucesso!`);
    setBulkEditMode(false);
    setSelectedProducts(new Set());
    setBulkEditData({ preco: "", category_ids: [], descricao: "" });
    fetchProducts();
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecione pelo menos um produto para excluir.");
      return;
    }

    const count = selectedProducts.size;
    if (!window.confirm(`Tem certeza que deseja excluir ${count} produto(s) selecionado(s)?`)) {
      return;
    }

    setLoadingProducts(true);

    const productIds = Array.from(selectedProducts);

    for (const productId of productIds) {
      // Excluir associações de categoria
      await supabase
        .from("produtos_categorias")
        .delete()
        .eq("produto_id", productId);

      // Excluir arquivos
      await supabase
        .from("arquivos")
        .delete()
        .eq("produto_id", productId);

      // Excluir produto
      await supabase
        .from("produtos")
        .delete()
        .eq("id", productId);
    }

    toast.success(`${count} produto(s) excluído(s) com sucesso!`);
    setSelectedProducts(new Set());
    setBulkEditMode(false);
    fetchProducts();
    setLoadingProducts(false);
  };

  // Funções de UI
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      category_ids: product.category_ids,
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
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.nome.toLowerCase().includes(term) ||
      p.descricao.toLowerCase().includes(term) ||
      p.category_names.some(cat => cat.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

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
                <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
                <TabsTrigger value="add">Adicionar Produto</TabsTrigger>
                <TabsTrigger value="bulk-upload">Upload em Massa</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab de Lista de Produtos */}
            <TabsContent value="list">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Produtos Cadastrados ({products.length})</h2>
                  {selectedProducts.size > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setBulkEditMode(!bulkEditMode)}
                        variant={bulkEditMode ? "default" : "outline"}
                      >
                        {bulkEditMode ? "Cancelar Edição em Massa" : `Editar ${selectedProducts.size} Selecionados`}
                      </Button>
                      <Button 
                        onClick={handleBulkDelete}
                        variant="destructive"
                        disabled={loadingProducts}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir {selectedProducts.size} Selecionados
                      </Button>
                    </div>
                  )}
                </div>

                <Input
                  placeholder="Pesquisar produtos por título, descrição ou categoria..."
                  className="mb-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {bulkEditMode && selectedProducts.size > 0 && (
                  <Card className="p-4 mb-4 bg-muted">
                    <h3 className="font-semibold mb-3">Editar em Massa ({selectedProducts.size} produtos)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bulk-preco">Novo Preço (deixe vazio para não alterar)</Label>
                        <Input
                          id="bulk-preco"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={bulkEditData.preco}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, preco: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Categorias (deixe vazio para não alterar)</Label>
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                          {categories.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2 mb-1">
                              <Checkbox
                                checked={bulkEditData.category_ids.includes(cat.id)}
                                onCheckedChange={() => {
                                  setBulkEditData(prev => ({
                                    ...prev,
                                    category_ids: prev.category_ids.includes(cat.id)
                                      ? prev.category_ids.filter(id => id !== cat.id)
                                      : [...prev.category_ids, cat.id]
                                  }));
                                }}
                              />
                              <label className="text-sm">{cat.nome}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bulk-descricao">Nova Descrição (deixe vazio para não alterar)</Label>
                        <Textarea
                          id="bulk-descricao"
                          placeholder="Descrição..."
                          value={bulkEditData.descricao}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, descricao: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button className="mt-4" onClick={handleBulkEditSave}>
                      Aplicar Alterações
                    </Button>
                  </Card>
                )}

                {loadingProducts ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Carregando produtos...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
                  </p>
                ) : (
                  <>
                    <div className="mb-4">
                      <Button variant="outline" size="sm" onClick={handleSelectAll}>
                        {selectedProducts.size === filteredProducts.length ? (
                          <><CheckSquare className="h-4 w-4 mr-2" /> Desmarcar Todos</>
                        ) : (
                          <><Square className="h-4 w-4 mr-2" /> Selecionar Todos</>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedProducts.has(product.id)}
                              onCheckedChange={() => handleSelectProduct(product.id)}
                            />
                            {product.imagem_url && (
                              <img 
                                src={product.imagem_url} 
                                alt={product.nome} 
                                className="w-24 h-24 object-cover rounded-md"
                                onError={(e) => {
                                  e.currentTarget.src = "https://via.placeholder.com/96?text=Sem+Imagem";
                                }}
                              />
                            )}
                            <div className="flex-grow">
                              <h3 className="text-lg font-semibold">{product.nome}</h3>
                              <p className="text-sm text-muted-foreground">
                                {product.category_names.join(", ") || "Sem categoria"}
                              </p>
                              <p className="text-md font-bold mt-1">R$ {product.preco.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground mt-2">{product.descricao}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                <Edit className="h-4 w-4 mr-2" /> Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id, product.nome)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </TabsContent>

            {/* Tab de Adicionar Produto */}
            <TabsContent value="add">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingProduct ? "Editar Produto" : "Adicionar Produto Individual"}
                </h2>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Título *</Label>
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
                      <Label htmlFor="preco">Preço *</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.preco}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imagem_url">URL da Imagem *</Label>
                    <Input
                      id="imagem_url"
                      type="url"
                      placeholder="https://exemplo.com/imagem.png"
                      value={formData.imagem_url}
                      onChange={handleInputChange}
                      required
                    />
                    {formData.imagem_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.imagem_url} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/128?text=Imagem+Inválida";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Categorias * (selecione uma ou mais)</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                      {loadingCategories ? (
                        <p className="text-sm text-muted-foreground">Carregando categorias...</p>
                      ) : categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma categoria disponível</p>
                      ) : (
                        categories.map(cat => (
                          <div key={cat.id} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              checked={formData.category_ids.includes(cat.id)}
                              onCheckedChange={() => handleCategoryToggle(cat.id)}
                            />
                            <label className="text-sm cursor-pointer" onClick={() => handleCategoryToggle(cat.id)}>
                              {cat.nome}
                            </label>
                          </div>
                        ))
                      )}
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
                  O arquivo deve conter as colunas: <code className="font-mono">Titulo</code>, <code className="font-mono">Descricao</code>, <code className="font-mono">Preco</code>, <code className="font-mono">URL da Imagem</code> e <code className="font-mono">Categoria</code>.
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bulk-file-upload" className="cursor-pointer">
                    <Button asChild disabled={uploading}>
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
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Products;
