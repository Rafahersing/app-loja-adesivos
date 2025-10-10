import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Trash2, Edit } from "lucide-react";
import { CATEGORIES } from "@/types/product";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { toast } from "sonner";

const Products = () => {
  const [products] = useState(MOCK_PRODUCTS);

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implementar lógica de adicionar produto
    toast.success("Produto adicionado com sucesso!");
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implementar upload em massa via CSV/Excel
    toast.info("Funcionalidade de upload em massa será implementada");
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

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList>
          <TabsTrigger value="add">Adicionar Produto</TabsTrigger>
          <TabsTrigger value="bulk">Upload em Massa</TabsTrigger>
          <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Adicionar Produto Individual</h3>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Nome da imagem"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.slug !== 'all').map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="29.90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem Externa</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://exemplo.com/imagem.png"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva a imagem..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" variant="hero" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Produto
              </Button>
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
                  onChange={handleBulkUpload}
                />
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="font-semibold mb-2">Formato do Arquivo:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Coluna 1: URL da imagem</p>
                  <p>• Coluna 2: Categoria (nature, technology, abstract, etc)</p>
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
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
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
