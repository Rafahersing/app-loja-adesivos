import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Download } from "lucide-react";

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Imagens PNG de Alta Qualidade</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Transforme Seus Projetos com{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Imagens Incríveis
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Milhares de imagens PNG profissionais prontas para download. 
              Encontre a imagem perfeita para seu projeto criativo.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild variant="hero" size="lg" className="group">
                <Link to="/shop">
                  Explorar Imagens
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">
                  Criar Conta Grátis
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Por Que Escolher a PixelStore?
            </h2>
            <p className="text-lg text-muted-foreground">
              Oferecemos a melhor experiência em compra de imagens digitais
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Alta Qualidade</h3>
              <p className="text-muted-foreground">
                Todas as imagens em resolução 1920x1920, perfeitas para qualquer projeto profissional.
              </p>
            </div>

            <div className="group rounded-xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Download Instantâneo</h3>
              <p className="text-muted-foreground">
                Acesso imediato após a compra. Baixe suas imagens quantas vezes precisar.
              </p>
            </div>

            <div className="group rounded-xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Pagamento Seguro</h3>
              <p className="text-muted-foreground">
                Transações protegidas e seus dados sempre seguros com criptografia de ponta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-card p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Pronto para Começar?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Crie sua conta gratuita e tenha acesso a milhares de imagens profissionais.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/shop">
                Explorar Catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
