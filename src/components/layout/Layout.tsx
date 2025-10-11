import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Área principal com limite de largura */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4">
        {children}
      </main>

      <Footer />
    </div>
  );
};
