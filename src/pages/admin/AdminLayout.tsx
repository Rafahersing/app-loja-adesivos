import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"; // Adicionado useNavigate
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react"; // Adicionado useEffect
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "../../lib/utils"; // Assumindo que AdminLayout está em src/pages/admin/

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook para redirecionamento
  const [isLoading, setIsLoading] = useState(true); // Novo estado para controle de loading
  const [isAdmin, setIsAdmin] = useState(false); // Novo estado para o status de admin
  const [isOpen, setIsOpen] = useState(false);

  // -------------------------------------------------------------------
  // 🚨 LÓGICA DE VERIFICAÇÃO DE ADMINISTRAÇÃO (CORREÇÃO AQUI)
  // -------------------------------------------------------------------
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Usuário não logado ou erro: redireciona para a autenticação
        navigate('/auth'); 
        return;
      }

      // Verifica a flag 'is_admin' nos metadados do aplicativo
      const userIsAdmin = user.app_metadata.is_admin === true;
      setIsAdmin(userIsAdmin);
      setIsLoading(false);

      if (!userIsAdmin) {
        // Usuário logado, mas NÃO é administrador: redireciona para a Home
        navigate('/');
      }
    }
    checkAdmin();
  }, [navigate]); // Roda apenas uma vez ao carregar

  // -------------------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth'); // Redireciona para a tela de login
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Produtos", href: "/admin/products", icon: Package },
    { name: "Pedidos", href: "/admin/orders", icon: ShoppingBag },
    { name: "Usuários", href: "/admin/users", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const NavLinks = () => (
    <nav className="space-y-2">
      {navigation.map((item) => (
        <Link key={item.name} to={item.href}>
          <Button
            variant={isActive(item.href) ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setIsOpen(false)}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </Button>
        </Link>
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-600"
        onClick={handleLogout} // Adicionado o handleLogout aqui também
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sair
      </Button>
    </nav>
  );

  // -------------------------------------------------------------------
  // Renderização
  // -------------------------------------------------------------------
  // Se estiver carregando, mostra um loader simples ou tela em branco
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Verificando Permissões...</div>;
  }

  // Se não for admin, o useEffect já redirecionou. Não deve chegar aqui, 
  // mas é uma checagem de segurança extra.
  if (!isAdmin) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            {/* ... Seu código SheetTrigger e SheetContent ... */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-6">
              <div className="mb-8">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                    <span className="text-xl font-bold text-primary-foreground">
                      P
                    </span>
                  </div>
                  <span className="text-xl font-bold">PixelStore</span>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  Painel Administrativo
                </p>
              </div>
              <NavLinks />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <span className="text-xl font-bold text-primary-foreground">P</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold">PixelStore</span>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/">
                Ver Loja
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}> 
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r bg-background">
          <div className="sticky top-16 p-6">
            <NavLinks />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
