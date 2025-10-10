import { useState, useEffect } from "react"; // Adicionado useEffect
import { Link, useNavigate } from "react-router-dom"; // Adicionado useNavigate
import { User, Package, Download, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; // Para exibir mensagens
import { supabase } from "../lib/utils"; // Importa sua conexão Supabase

// Define a estrutura para os dados do usuário
interface UserProfile {
  name: string;
  email: string;
  whatsapp: string;
  instagram: string;
}

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>({
    name: "Carregando...",
    email: "",
    whatsapp: "",
    instagram: "",
  });

  // Dados de pedidos (Mantido como mock por enquanto)
  const [orders] = useState([
    {
      id: "1",
      date: "2024-01-15",
      total: 89.70,
      items: 3,
      products: [
        {
          id: "1",
          title: "Paisagem de Montanha",
          imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
          downloadUrl: "#",
        },
        {
          id: "2",
          title: "Computador Moderno",
          imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop",
          downloadUrl: "#",
        },
      ],
    },
  ]);

  // -----------------------------------------------------------
  // Lógica de Carregamento de Dados (useEffect)
  // -----------------------------------------------------------
  useEffect(() => {
    async function loadUserData() {
      // 1. Pega a sessão do usuário logado
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Se não estiver logado, redireciona para a página de autenticação
        toast.info("Você precisa estar logado para acessar esta página.");
        navigate("/auth");
        return;
      }

      // 2. Extrai os dados, priorizando os metadados do cadastro
      const metadata = user.user_metadata || {};
      
      setUser({
        name: metadata.full_name || user.email.split('@')[0], // Usa nome completo ou parte do email
        email: user.email || '',
        whatsapp: metadata.whatsapp || 'N/A',
        instagram: metadata.instagram || 'N/A',
      });
    }

    loadUserData();
  }, [navigate]); // Adicionamos navigate como dependência

  // -----------------------------------------------------------
  // Lógica de Logout
  // -----------------------------------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(`Erro ao sair: ${error.message}`);
    } else {
      toast.success("Você foi desconectado com sucesso!");
      // Redireciona para a página inicial ou de login
      navigate("/"); 
    }
  };


  // -----------------------------------------------------------
  // Renderização
  // -----------------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Minha Conta</h1>
        <p className="text-muted-foreground">Gerencie suas informações e pedidos</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <Card className="lg:col-span-1 p-6 h-fit">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <Separator className="mb-4" />

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Package className="h-4 w-4 mr-2" />
              Pedidos
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Separator className="my-2" />
            
            {/* Botão de Sair (Logout) */}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive"
              onClick={handleLogout} // Adicionado o handler de logout
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </nav>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Dados Pessoais</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nome Completo
                    </label>
                    {/* Exibe o dado real do estado */}
                    <p className="text-lg">{user.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    {/* Exibe o dado real do estado */}
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      WhatsApp
                    </label>
                    {/* Exibe o dado real do estado */}
                    <p className="text-lg">{user.whatsapp}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Instagram
                    </label>
                    {/* Exibe o dado real do estado */}
                    <p className="text-lg">{user.instagram}</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-6">
                  Editar Informações
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Histórico de Pedidos</h2>

                {orders.length > 0 ? (
                  orders.map((order) => (
                    <Card key={order.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            R$ {order.total.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items} {order.items === 1 ? "item" : "itens"}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <h4 className="font-semibold">Produtos Comprados:</h4>
                        {order.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <span className="text-sm">{product.title}</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Você ainda não fez nenhuma compra.
                    </p>
                    <Button asChild variant="hero">
                      <Link to="/shop">Explorar Produtos</Link>
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Account;
