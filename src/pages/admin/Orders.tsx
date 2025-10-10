import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - será substituído por dados reais do backend
  const orders = [
    {
      id: "001",
      date: "2024-01-15",
      customer: "João Silva",
      email: "joao@email.com",
      items: 3,
      total: 89.70,
      status: "completed",
    },
    {
      id: "002",
      date: "2024-01-14",
      customer: "Maria Santos",
      email: "maria@email.com",
      items: 2,
      total: 59.80,
      status: "completed",
    },
    {
      id: "003",
      date: "2024-01-14",
      customer: "Pedro Costa",
      email: "pedro@email.com",
      items: 1,
      total: 29.90,
      status: "completed",
    },
    {
      id: "004",
      date: "2024-01-13",
      customer: "Ana Oliveira",
      email: "ana@email.com",
      items: 5,
      total: 149.50,
      status: "completed",
    },
  ];

  const filteredOrders = orders.filter(
    (order) =>
      order.id.includes(searchTerm) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pedidos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os pedidos
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por ID, cliente ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pedido</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  {new Date(order.date).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell className="text-muted-foreground">
                  {order.email}
                </TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell className="font-semibold">
                  R$ {order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Concluído</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum pedido encontrado com os critérios de busca.
          </p>
        </div>
      )}
    </div>
  );
};

export default Orders;
