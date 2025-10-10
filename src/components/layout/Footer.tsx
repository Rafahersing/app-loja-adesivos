import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-xl font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold">PixelStore</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Imagens PNG de alta qualidade para seus projetos criativos.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Loja</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/shop" className="hover:text-foreground transition-colors">
                  Todas as Imagens
                </Link>
              </li>
              <li>
                <Link to="/shop?category=nature" className="hover:text-foreground transition-colors">
                  Natureza
                </Link>
              </li>
              <li>
                <Link to="/shop?category=technology" className="hover:text-foreground transition-colors">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link to="/shop?category=abstract" className="hover:text-foreground transition-colors">
                  Abstrato
                </Link>
              </li>
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Conta</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Login / Cadastro
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-foreground transition-colors">
                  Minha Conta
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-foreground transition-colors">
                  Favoritos
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-foreground transition-colors">
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contato@pixelstore.com" className="hover:text-foreground transition-colors">
                  contato@pixelstore.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <a href="https://instagram.com/pixelstore" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  @pixelstore
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PixelStore. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
