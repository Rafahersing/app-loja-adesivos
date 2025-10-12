# 🛍️ Projeto E-commerce de PNGs

## 📌 Visão geral
Este é um e-commerce para venda de imagens PNG com entregas digitais.  
O usuário pode navegar no shop sem login, mas para comprar precisa preencher o cadastro completo.  
O app inclui painel admin para gerenciar produtos, categorias e pedidos.

- 🖥️ **Frontend:** React + Vite + Tailwind  
- 🗃️ **Backend:** Supabase (autenticação, banco de dados e storage)  
- ☁️ **Hospedagem:** Vercel  
- 🧭 **Gerenciamento de estado:** Zustand  
- 🧩 **UI:** Shadcn UI + Tailwind Components  
- 🧑‍💼 **Admin:** painel separado para gerenciar produtos e pedidos.

---

## 🧭 Fluxos principais

- ✅ **Público:** Visualiza produtos e categorias (sem login)  
- 👤 **Usuário autenticado:** pode adicionar produtos ao carrinho, comprar e baixar imagens.  
- 🧑‍💼 **Admin:** gerencia produtos, categorias e usuários.

---

## 📂 Estrutura de Pastas

src/
├── components/ # Componentes reutilizáveis
│ ├── admin/ # Componentes do painel admin
│ ├── layout/ # Header, Footer, Layout base
│ ├── shop/ # Loja (filtros, cards etc.)
│ └── ui/ # Shadcn UI components
├── hooks/ # Hooks personalizados (ex: use-toast, use-mobile)
├── lib/ # Conexão Supabase, mockData, utils
├── pages/ # Páginas do app
│ ├── admin/ # Dashboard e páginas administrativas
│ ├── Account.tsx
│ ├── Auth.tsx
│ ├── Cart.tsx
│ ├── Favorites.tsx
│ ├── Home.tsx
│ ├── NotFound.tsx
│ ├── Product.tsx
│ └── Shop.tsx
├── types/ # Tipagem TypeScript (ex: product.ts)
├── App.tsx
├── main.tsx
└── index.css


---

## 🧰 Dependências principais

- `@supabase/supabase-js` — comunicação com o Supabase  
- `zustand` — gerenciamento de estado global  
- `tailwindcss` + `shadcn/ui` — UI  
- `react-router-dom` — rotas  
- `vite` — bundler

---

## 🧠 Instruções para IA 

> ⚡ Objetivo: Refatorar, estabilizar e conectar UI ao backend (Supabase)

- Centralizar chamadas ao Supabase em `src/lib/supabaseClient.ts`.
- Garantir que botões de ações (`adicionar ao carrinho`, `favoritar`, `finalizar pedido`) estão conectados ao Supabase.
- Padronizar componentes com TypeScript.
- Melhorar estrutura de pastas caso necessário.
- Corrigir hooks quebrados (ex: use-toast duplicado).
- Garantir que rotas e navegação funcionam corretamente (admin e público).
- Ajustar UI desalinhada usando Tailwind + componentes Shadcn.
- Garantir que `is_admin` controla acesso ao painel admin.

---

## 🧪 Fluxos a testar após refatoração

- [ ] Login e criação de perfil no Supabase
- [ ] Adicionar/remover itens do carrinho
- [ ] Finalizar pedido com perfil completo
- [ ] Fazer download do produto comprado
- [ ] Painel admin funcionando
- [ ] UI responsiva em mobile e desktop

---

## 🧑‍💼 Perfis de usuário

- Visitante: navega pela loja
- Usuário autenticado: compra e baixa produtos
- Admin: gerencia produtos, categorias e pedidos (`is_admin = true` no Supabase)

---
