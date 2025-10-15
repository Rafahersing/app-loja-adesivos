import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Componente Badge
 * Atualizado para seguir padrões de contraste e acessibilidade do e-commerce.
 * As variantes agora possuem cores com maior contraste para o tema escuro.
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Azul principal, usado em contextos neutros
        default:
          "border-transparent bg-primary/30 text-primary-foreground hover:bg-primary/40",

        // Fundo neutro claro com texto escuro — ideal para destaque sutil
        secondary:
          "border-transparent bg-neutral-200/20 text-neutral-100 hover:bg-neutral-200/30",

        // Sucesso (ex: “Concluído”) — cor esverdeada com bom contraste
        success:
          "border-transparent bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30",

        // Aviso (ex: “Pendente”) — cor amarelada suave
        warning:
          "border-transparent bg-amber-500/20 text-amber-300 hover:bg-amber-500/30",

        // Erro (ex: “Cancelado”) — vermelho visível com fundo translúcido
        destructive:
          "border-transparent bg-red-500/20 text-red-300 hover:bg-red-500/30",

        // Contorno sem fundo, apenas texto
        outline: "text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
