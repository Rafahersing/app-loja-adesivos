// src/pages/admin/Dashboard.tsx (Versão para Teste de Renderização)
// APAGAR DEPOIS DO TESTE
import React from "react";
import { Card } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import { DollarSign, Package, Users, TrendingUp } from "lucide-react";
// Removidos: RequireAdmin, supabase, Link, useEffect

const AdminDashboardPage: React.FC = () => {
    // Mock data - restaurado e completo
    const salesData = [
        { month: "Jan", vendas: 45 },
        { month: "Fev", vendas: 52 },
        { month: "Mar", vendas: 48 },
        { month: "Abr", vendas: 61 },
        { month: "Mai", vendas: 55 },
        { month: "Jun", vendas: 67 },
    ];

    const categoryData = [
        { name: "Natureza", value: 30 },
        { name: "Tecnologia", value: 25 },
        { name: "Abstrato", value: 20 },
        { name: "Pessoas", value: 15 },
        { name: "Outros", value: 10 },
    ];

    const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981"];

    // LISTA COMPLETA RESTAURADA
    const stats = [
        {
            title: "Vendas Totais",
            value: "R$ 12.543,00",
            change: "+12.5%",
            icon: DollarSign,
            color: "text-green-500",
        },
        {
            title: "Produtos Vendidos",
            value: "328",
            change: "+8.2%",
            icon: Package,
            color: "text-blue-500",
        },
        {
            title: "Usuários Ativos",
            value: "1.234",
            change: "+23.1%",
            icon: Users,
            color: "text-purple-500",
        },
        {
            title: "Taxa de Conversão",
            value: "3.2%",
            change: "+2.4%",
            icon: TrendingUp,
            color: "text-orange-500",
        },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard (Teste de Renderização)</h1>
                <p className="text-muted-foreground">
                    Visão geral do desempenho da loja
                </p>
            </div>

            {/* Stats Cards - AGORA DEVE RENDERIZAR 4 CARDS */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            {/* Mudança de cor no change para testar */}
                            <span className="text-sm font-medium text-green-500">
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts - Manter o seu código original */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="text-xl font-bold mb-6">Vendas Mensais</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="vendas" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                    <h3 className="text-xl font-bold mb-6">Vendas por Categoria</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name }) => name}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
