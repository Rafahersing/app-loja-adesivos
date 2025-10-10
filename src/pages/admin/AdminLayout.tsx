import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AdminLayout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
            <Button variant="ghost" size="icon">
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
