// src/components/admin/ProductImportComponent.tsx
// (Componente de Importação em Massa)

import React, { useState } from 'react';
import * as XLSX from 'xlsx'; 
import { supabase, slugify } from '@/lib/utils'; // Assumimos que 'slugify' está em utils
import { toast } from 'sonner';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from 'lucide-react';

interface ProductImportComponentProps {
    // Função para recarregar a lista de produtos após o sucesso
    onImportSuccess: () => void; 
}

const ProductImportComponent: React.FC<ProductImportComponentProps> = ({ onImportSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState("Nenhum arquivo escolhido");

    // ⭐️ Lógica Central de Processamento e Inserção ⭐️
    const processAndPrepareProducts = async (rows: string[][], headers: string[]) => {
        // 1. Buscar todas as categorias existentes (id e nome)
        const { data: categoryData, error: catError } = await supabase
            .from('categorias')
            // 🟢 CORREÇÃO CRÍTICA: Usamos 'nome' em vez de 'slug'
            .select('id, nome'); 

        if (catError) throw new Error(`Falha ao buscar categorias: ${catError.message}`);

        // Mapeamento de Slug (gerado a partir do nome do DB) para ID
        const categoryMap: { [key: string]: string } = categoryData.reduce((map, cat) => {
            // Aplicamos o slugify no nome do DB para criar a chave de mapeamento
            const slugFromNome = slugify(cat.nome); 
            // O ID é int8, mas é tratado como string/number pelo JS
            map[slugFromNome] = cat.id; 
            return map;
        }, {});
        
        const finalProducts = [];
        const finalProductCategories = [];
        
        // Mapeia o índice da coluna do cabeçalho
        const headerMap: { [key: string]: number } = {};
        headers.forEach((h, i) => {
            // Normaliza o nome da coluna
            const normalizedHeader = h.toLowerCase().trim().replace(/ da imagem| de arquivo| preço|url/g, '').replace(/título/g, 'title');
            headerMap[normalizedHeader] = i;
        });

        const urlIndex = headerMap['url'];
        const categoryIndex = headerMap['categoria'];
        const titleIndex = headerMap['title'];
        const descIndex = headerMap['descrição'];
        const priceIndex = headerMap['preço'];

        if (urlIndex === undefined || categoryIndex === undefined || titleIndex === undefined || priceIndex === undefined) {
             throw new Error("Colunas obrigatórias (URL, Categoria, Título, Preço) não encontradas no cabeçalho.");
        }


        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // +1 para cabeçalho, +1 para índice 0
            
            const title = row[titleIndex]?.trim();
            if (!title) {
                 console.warn(`Linha ${rowNumber} ignorada: Título vazio.`);
                 continue; // Ignora linhas sem título
            }

            // Gera um UUID temporário (ou use o 'id' se sua planilha tiver um)
            // Usamos crypto.randomUUID() para garantir que temos um ID de produto único
            const tempProductId = crypto.randomUUID(); 

            // 1. Preparar o Produto
            const priceValue = row[priceIndex]?.toString().replace(',', '.').trim();
            const product = {
                id: tempProductId, 
                image_url: row[urlIndex]?.trim() || null,
                title: title,
                description: row[descIndex]?.trim() || 'Sem descrição.',
                // Converte para número, usa 0 se falhar
                price: parseFloat(priceValue) || 0, 
                created_at: new Date().toISOString(),
                // Adicione outros campos necessários da tabela 'produtos' (ex: user_id, active, etc.)
            };

            finalProducts.push(product);

            // 2. Preparar a Relação Categoria
            const categoryName = row[categoryIndex]?.trim();
            // Aplicamos slugify no nome da CATEGORIA da planilha para buscar no mapa
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


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setUploading(true);
        
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Converte a planilha para um array de arrays (header: 1 usa a primeira linha)
            const jsonProducts = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

            if (jsonProducts.length <= 1) {
                toast.error("O arquivo está vazio ou contém apenas cabeçalho.");
                return;
            }

            const [headers, ...rows] = jsonProducts;

            // ⭐️ Processa os dados e prepara para o Supabase ⭐️
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

            toast.success(`Sucesso! ${finalProducts.length} produtos importados.`);
            onImportSuccess(); // Chama a função para recarregar a lista
            
        } catch (error) {
            console.error('Erro na importação:', error);
            // Verifica se o erro é um objeto antes de tentar acessar .message
            const errorMessage = (error as Error).message || "Erro desconhecido durante a importação.";
            toast.error(`Falha na importação: ${errorMessage}`);
        } finally {
            setUploading(false);
            setFileName("Nenhum arquivo escolhido");
            if (event.target) {
                event.target.value = ''; // Limpa o input file
            }
        }
    };


    return (
        <Card className="p-6 space-y-4 border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-center space-y-2">
                <UploadCloud className="h-10 w-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">Faça upload de arquivo CSV ou Excel</h3>
                <p className="text-sm text-gray-400">O arquivo deve conter: URL da imagem, Categoria, Título, Descrição, Preço.</p>
            </div>
            
            <div className="flex items-center justify-center gap-4">
                {/* O input file é escondido e disparado pelo botão */}
                <input
                    id="file-upload"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                />
                <label htmlFor="file-upload">
                    <Button 
                        asChild
                        disabled={uploading}
                        className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                    >
                        <span>Escolher arquivo</span>
                    </Button>
                </label>
                
                <span className={`text-sm ${uploading ? 'text-blue-400' : 'text-gray-400'}`}>
                    {uploading ? (
                        <span className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                        </span>
                    ) : (
                        fileName
                    )}
                </span>
            </div>
        </Card>
    );
};

export default ProductImportComponent;
