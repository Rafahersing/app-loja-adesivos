import { Header } from "./Header";
import { Footer } from "./Footer";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Exibe Header e Footer apenas fora do admin */}
      {!isAdmin && <Header />}

      <main
        className={`flex-1 ${
          isAdmin ? "" : "max-w-[1200px] mx-auto w-full px-4"
        }`}
      >
        {children}
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
};
