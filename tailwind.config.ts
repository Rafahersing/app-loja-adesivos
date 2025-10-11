import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#000000", // Preto principal
        foreground: "#ffffff", // Texto principal branco
        muted: "#1A1A1A", // Cinza escuro para áreas secundárias
        "muted-foreground": "#B3B3B3", // Texto secundário
        primary: "#E7D1B0", // Dourado suave
        "primary-foreground": "#000000", // Texto sobre o dourado
        secondary: "#F6EBD7", // Dourado mais claro
        accent: "#F6EBD7", // Detalhes sutis
        border: "#2A2A2A", // Linhas e bordas discretas
        card: "#111111", // Fundo de cartões/painéis
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #E7D1B0, #F6EBD7)",
        "gradient-hero": "linear-gradient(135deg, #111111, #1A1A1A)",
        "gradient-card": "linear-gradient(135deg, #1A1A1A, #0A0A0A)",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.15)",
        glow: "0 0 20px rgba(231, 209, 176, 0.3)",
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(231, 209, 176, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(231, 209, 176, 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
