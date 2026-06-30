# ERP Restaurante — Convenções do Projeto

## Stack
- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Shadcn/ui + Tailwind CSS
- Zustand (estado global do PDV)
- Recharts (gráficos) · date-fns pt-BR · Zod + react-hook-form

## Regras

- Server Components por padrão; `'use client'` apenas quando necessário
- Sem `any` no TypeScript — usar tipos de `types/database.ts`
- Toda UI e mensagens em **português**
- Funções de banco sempre com `try/catch`
- Variáveis com `NEXT_PUBLIC_` apenas para o que o browser acessa
- Datas sempre em pt-BR via `date-fns`
- Formulários com `react-hook-form` + `zod`
- Estado global do PDV com `Zustand` (`hooks/useCarrinho.ts`)

## Estrutura de pastas
- `app/(auth)/` — páginas públicas (login)
- `app/(dashboard)/` — páginas protegidas por autenticação
- `app/api/` — Route Handlers (webhook iFood, baixa estoque)
- `components/[modulo]/` — componentes organizados por módulo
- `components/ui/` — shadcn/ui (não editar manualmente)
- `lib/supabase/` — client.ts (browser) e server.ts (SSR)
- `lib/ifood/` — integração com API do iFood
- `hooks/` — hooks customizados (Realtime, Zustand)
- `types/database.ts` — tipos TypeScript do schema Supabase
