// src/pages/admin/Dashboard.tsx

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card"; // Presume-se que 'Card' existe
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, Package, Users, TrendingUp } from "lucide-react";
import RequireAdmin from "@/components/layout/RequireAdmin"; // Importe o componente de proteção de rota
import { supabase } from "@/lib/utils"; // Importe o cliente Supabase
import { Link } from "react-router-dom"; // Assumindo que você usa React Router para navegação

// ----------------------------------------------------------------------
// Tipagem para as Estatísticas do Banco de Dados
// ----------------------------------------------------------------------
interface CountStat {
  title: string;
  value: string;
  change: string; // Mantendo para o mock visual
  icon: React.ElementType;
  color: string;
  link: string; // Link para a tela de gerenciamento
}

// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CountStat[]>([]);

  // Dados Mock (Mantidos para renderização visual inicial dos gráficos)
  const salesData = [
    { month: "Jan", vendas: 45 },
    { month: "Fev", vendas: 52 },
    { month: "Mar", vendas: 48 },
    { month: "Abr", vendas: 61 },
    { month: "Mai", vendas: 55 },
    { month: "Jun", vendas: 67 },
  ];
  const categoryData = [
    { name: "Ícones", value: 30 },
    { name: "Texturas", value: 25 },
    { name: "Brushes", value: 20 },
    { name: "Outros", value: 15 },
  ];
  const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4"];

  // Função para buscar contagens reais do Supabase
  const fetchRealStats = async () => {
    // 1. Contagem de Pedidos Concluídos (para Vendas Totais)
    const { count: totalOrders } = await supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed");
    
    // 2. Contagem de Produtos Ativos
    const { count: totalProducts } = await supabase
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("ativo", true); // Assumindo que você tem uma coluna 'ativo'
    
    // 3. Contagem de Usuários (Perfís)
    const { count: totalUsers } = await supabase
      .from("perfis")
      .select("id", { count: "exact", head: true });
      
    // 4. Contagem de Pedidos Pendentes
    const { count: pendingOrders } = await supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    // 5. Total de Vendas (Soma do campo 'total' - Exemplo complexo, mantido simples aqui)
    // Para simplificar, o 'R$ 12.543,00' ficará no mock por enquanto.

    const newStats: CountStat[] = [
      {
        title: "Pedidos Concluídos",
        value: totalOrders?.toLocaleString() || "0",
        change: "+12.5%",
        icon: DollarSign,
        color: "text-green-500",
        link: "/admin/orders",
      },
      {
        title: "Produtos Ativos",
        value: totalProducts?.toLocaleString() || "0",
        change: "+8.2%",
        icon: Package,
        color: "text-blue-500",
        link: "/admin/products",
      },
      {
        title: "Usuários Registrados",
        value: totalUsers?.toLocaleString() || "0",
        change: "+23.1%",
        icon: Users,
        color: "text-purple-500",
        link: "/admin/users",
      },
      {
        title: "Pendentes de Envio",
        value: pendingOrders?.toLocaleString() || "0",
        change: "+2.4%",
        icon: TrendingUp,
        color: "text-orange-500",
        link: "/admin/orders",
      },
    ];

    setStats(newStats);
    setLoading(false);
  };

  useEffect(() => {
    fetchRealStats();
  }, []);

  return (
    <RequireAdmin>
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho da loja
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <Link to={stat.link}> {/* Adicionando o link ao Card */}
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <span className="text-sm font-medium text-green-500">
                    {loading ? '...' : stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">
                    {loading ? 'Carregando...' : stat.value}
                  </p>
                </div>
              </Link>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico de Barras */}
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

          {/* Gráfico de Pizza */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Vendas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name }) => `${name}`}
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
    </RequireAdmin>
  );
};

export default AdminDashboardPage;
