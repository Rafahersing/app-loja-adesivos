import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import NotFound from "./pages/NotFound";
import RequireAdmin from "@/components/layout/RequireAdmin";

import Categories from "./pages/admin/categories"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/account" element={<Account />} />
            <Route path="/auth" element={<Auth />} />
          </Route>

          {/* ROTAS ADMIN PROTEGIDAS (Parent) */}
          <Route element={<RequireAdmin />}>

            {/* ⭐️ ROTA DE CATEGORIAS DESANINHADA E COMPLETA ⭐️ */}
            {/* O Categories.tsx já usa o AdminLayout internamente se necessário, 
               ou, no nosso caso, ele já usa o RequireAdmin diretamente. */}
            <Route path="/admin/categories" element={<AdminLayout><Categories /></AdminLayout>} />

            {/* ROTAS ANINHADAS DE ADMIN (Dashboard, Produtos, etc.) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
            </Route>
            
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
