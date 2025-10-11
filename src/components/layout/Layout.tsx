import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* wrapper com classe explicita para garantir o max-width via CSS */}
        <div className="app-container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};
