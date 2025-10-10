import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Ban, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - será substituído por dados reais do backend
  const users = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@email.com",
      whatsapp: "(11) 98765-4321",
      instagram: "@joaosilva",
      createdAt: "2024-01-10",
      purchases: 5,
      status: "active",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@email.com",
      whatsapp: "(11) 98765-1234",
      instagram: "@mariasantos",
      createdAt: "2024-01-12",
      purchases: 3,
      status: "active",
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@email.com",
      whatsapp: "(11) 98765-5678",
      instagram: "@pedrocosta",
      createdAt: "2024-01-13",
      purchases: 1,
      status: "active",
    },
    {
      id: "4",
      name: "Ana Oliveira",
      email: "ana@email.com",
      whatsapp: "(11) 98765-8765",
      instagram: "@anaoliveira",
      createdAt: "2024-01-14",
      purchases: 8,
      status: "active",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários cadastrados na plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Usuários Ativos</p>
          <p className="text-3xl font-bold">
            {users.filter((u) => u.status === "active").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total de Compras</p>
          <p className="text-3xl font-bold">
            {users.reduce((sum, u) => sum + u.purchases, 0)}
          </p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nome ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Compras</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>{user.whatsapp}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.instagram}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.purchases}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Ativo</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Ban className="h-4 w-4 text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum usuário encontrado com os critérios de busca.
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
