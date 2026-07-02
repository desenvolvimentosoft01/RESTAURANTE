# Checklist — Provisionar novo cliente

Cada cliente = 1 projeto Supabase próprio + 1 deploy Vercel próprio.

## 1. Criar projeto no Supabase
1. Acessar https://supabase.com/dashboard/new
2. Nome do projeto: `restaurante-<nome-do-cliente>` (ex: `restaurante-juan`)
3. Escolher a região mais próxima do cliente (ex: `South America (São Paulo)`)
4. Guardar a senha do banco gerada (usar gerenciador de senhas)
5. Aguardar o projeto ficar pronto (~2 min)

## 2. Rodar as migrations
No **SQL Editor** do novo projeto, nesta ordem:
1. Colar e rodar `supabase/migrations/000_schema_completo.sql`
2. Colar e rodar `supabase/migrations/001_correcoes_seguranca.sql`

> Não rodar o `002_categorias_unique.sql` em projetos novos — ele é só para
> corrigir bancos antigos (ex: Juan) que já existiam antes da correção do
> `000`. Projetos novos já nascem com a constraint correta.

## 3. Criar o primeiro usuário (login do cliente)
No Supabase: **Authentication > Users > Add user**
- Email do cliente
- Senha temporária (pedir para trocar no primeiro acesso)

## 4. Pegar as credenciais do projeto
Em **Project Settings > API**:
- `Project URL` → vira `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key` → vira `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Criar o deploy na Vercel
1. Vercel > Add New > Project
2. Importar o mesmo repositório GitHub (`desenvolvimentosoft01/RESTAURANTE`)
3. Nome do projeto: `restaurante-<nome-do-cliente>`
4. Em **Environment Variables**, adicionar:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<url do passo 4>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<key do passo 4>
   IFOOD_CLIENT_ID=<se o cliente usar iFood>
   IFOOD_CLIENT_SECRET=<se o cliente usar iFood>
   ```
5. Deploy

## 6. Configurar domínio (opcional)
Se o cliente tiver domínio próprio, adicionar em **Vercel > Domains**.

## 7. Validar
- [ ] Login funciona com o usuário criado no passo 3
- [ ] Categorias padrão aparecem em `/produtos/categorias`
- [ ] Cadastro de produto funciona
- [ ] PDV abre e finaliza uma venda de teste
- [ ] iFood configurado (se aplicável)

## 8. Registro interno
Anotar em planilha/CRM: nome do cliente, URL do projeto Supabase, URL da
Vercel, data de ativação, plano contratado.
