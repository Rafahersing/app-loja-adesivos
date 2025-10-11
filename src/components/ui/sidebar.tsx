import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react";

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Produtos", icon: Package, path: "/admin/produtos" },
    { name: "Categorias", icon: Tags, path: "/admin/categorias" },
    { name: "Pedidos", icon: ShoppingCart, path: "/admin/pedidos" },
    { name: "Usuários", icon: Users, path: "/admin/usuarios" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-background p-4">
      {/* Logo */}
      <div className="mb-6 flex items-center justify-center">
        <img
          src="https://pub-5c45cfd873454d96a8bc860a71c4c505.r2.dev/Logo%20dourado%20mais%20claro.png"
          alt="Logo Arquivo Criativo"
          className="w-40"
        />
      </div>

      {/* Menu */}
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200
                ${
                  active
                    ? "bg-muted text-foreground" // Item ativo → fundo claro + texto escuro
                    : "text-muted-foreground hover:text-foreground" // Hover → apenas texto
                }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sair */}
      <div className="mt-auto">
        <Link
          to="/logout"
          className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Link>
      </div>
    </aside>
  );
};
