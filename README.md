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

- [Next.js 15](https://nextjs.org) (App Router, Server Components)
- [Supabase](https://supabase.com) (PostgreSQL + Auth + Realtime)
- [Shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs) — estado global do PDV e sistema de abas
- [Recharts](https://recharts.org) — gráficos nos relatórios
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — formulários e validação

## Configuração

### 1. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto (nunca commitar este arquivo):

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

> A `ANON_KEY` é segura para o browser. Nunca adicione a `SERVICE_ROLE_KEY` com prefixo `NEXT_PUBLIC_`.

### 2. Banco de dados

Execute o script de migração no SQL Editor do Supabase:

```
supabase/migrations/000_schema_completo.sql
```

Isso criará todas as tabelas, views, funções e políticas RLS necessárias.

### 3. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura de pastas

```
app/
  (auth)/          # Páginas públicas (login)
  (dashboard)/     # Páginas protegidas
  api/             # Route Handlers (webhook iFood, estoque)
components/
  erp/             # Componentes TDI (Produtos, Categorias)
  layout/          # Sidebar, TopBar, TabBar
  pdv/             # Componentes da venda balcão
  produtos/        # Relatório de produtos
  relatorios/      # Relatórios de vendas e contas
  ui/              # Shadcn/ui (não editar manualmente)
hooks/             # Zustand (carrinho, abas)
lib/
  supabase/        # Client browser e server SSR
types/
  database.ts      # Tipos TypeScript do schema Supabase
supabase/
  migrations/      # Scripts SQL
```
