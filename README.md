# ERP Restaurante

Sistema de gestão completo para restaurantes, desenvolvido com Next.js 15 e Supabase.

## Funcionalidades

- **PDV / Venda Balcão** — cardápio com categorias, carrinho e finalização de pedidos
- **Pedidos iFood** — acompanhamento e atualização de status de pedidos externos
- **Produtos** — cadastro, categorias e controle de estoque por produto
- **Financeiro** — contas a pagar e a receber com alertas de vencimento
- **Relatórios** — vendas por período, contas e produtos com filtros e impressão seletiva
- **Dashboard** — resumo financeiro do dia, pedidos em andamento e alertas de estoque

## Tecnologias

- [Next.js 15](https://nextjs.org) — App Router, Server Components
- [Supabase](https://supabase.com) — PostgreSQL, Auth e Realtime
- [Shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs) — estado global do PDV e sistema de abas
- [Recharts](https://recharts.org) — gráficos nos relatórios
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — formulários e validação

## Instalação

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> As credenciais de acesso ao banco de dados e autenticação são configuradas via variáveis de ambiente (não incluídas no repositório).

## Banco de dados

Os scripts SQL para criação do schema estão em `supabase/migrations/`. Execute-os em ordem no SQL Editor do Supabase.

## Estrutura de pastas

```
app/
  (auth)/          # Páginas públicas (login)
  (dashboard)/     # Páginas protegidas
  api/             # Route Handlers
components/
  erp/             # Componentes TDI (Produtos, Categorias)
  layout/          # Sidebar, TopBar, TabBar
  pdv/             # Componentes da venda balcão
  relatorios/      # Relatórios de vendas, contas e produtos
  ui/              # Shadcn/ui
hooks/             # Zustand (carrinho, abas)
lib/supabase/      # Client browser e server SSR
types/database.ts  # Tipos TypeScript do schema
supabase/
  migrations/      # Scripts SQL
```
