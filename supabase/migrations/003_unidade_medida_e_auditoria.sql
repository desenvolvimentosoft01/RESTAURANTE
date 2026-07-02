-- ============================================================
-- UNIDADE DE MEDIDA + AUDITORIA + FIX baixar_estoque_venda
-- Cole TUDO no Supabase > SQL Editor > New Query > Run
-- ============================================================

-- ===== 1. UNIDADE DE MEDIDA NOS PRODUTOS =====
-- Padrão ERP: produto pode ser vendido/controlado por UN, KG, G, L, ML, PC, CX, FT.
-- Estoque e quantidade de item de pedido passam a aceitar decimais (ex: 0,750 kg).

ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS unidade_medida TEXT NOT NULL DEFAULT 'UN'
    CHECK (unidade_medida IN ('UN','KG','G','L','ML','PC','CX','FT'));

-- As views abaixo dependem das colunas que vão mudar de tipo; o Postgres não
-- permite ALTER COLUMN TYPE com uma view/rule dependendo da coluna, então
-- elas são derrubadas aqui e recriadas mais abaixo (idênticas às de 001).
DROP VIEW IF EXISTS public.alertas_estoque;
DROP VIEW IF EXISTS public.produtos_mais_vendidos;

ALTER TABLE public.produtos
  ALTER COLUMN estoque_atual TYPE NUMERIC(10,3),
  ALTER COLUMN estoque_minimo TYPE NUMERIC(10,3);

ALTER TABLE public.itens_pedido
  ALTER COLUMN quantidade TYPE NUMERIC(10,3);

ALTER TABLE public.movimentacoes_estoque_produto
  ALTER COLUMN quantidade TYPE NUMERIC(10,3);

CREATE VIEW public.alertas_estoque
  WITH (security_invoker = true) AS
SELECT id, nome, estoque_atual AS quantidade_atual, estoque_minimo AS quantidade_minima
FROM public.produtos
WHERE controla_estoque = true
  AND estoque_atual <= estoque_minimo
  AND ativo = true;

CREATE VIEW public.produtos_mais_vendidos
  WITH (security_invoker = true) AS
SELECT
  ip.produto_id,
  ip.nome_produto,
  SUM(ip.quantidade) AS total_quantidade,
  SUM(ip.subtotal) AS total_receita
FROM public.itens_pedido ip
JOIN public.pedidos p ON p.id = ip.pedido_id
WHERE p.status NOT IN ('cancelado')
GROUP BY ip.produto_id, ip.nome_produto
ORDER BY total_quantidade DESC;

-- ===== 2. FIX: função de baixa de estoque chamada pelo app tinha nome diferente =====
-- O app chama supabase.rpc('baixar_estoque_venda', { pedido_id }), mas só existia
-- baixar_estoque_produto(p_pedido_id). Isso fazia a baixa de estoque na venda
-- balcão falhar silenciosamente (erro do rpc não era verificado no código).

CREATE OR REPLACE FUNCTION public.baixar_estoque_venda(pedido_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.baixar_estoque_produto(pedido_id);
END;
$$;

-- ===== 3. AUDITORIA =====
-- Registra usuário, data/hora, tela, ação, tabela/registro afetado e
-- valores antes/depois de qualquer alteração relevante do sistema.

CREATE TABLE IF NOT EXISTS public.auditoria (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID,
  usuario_email TEXT,
  tela          TEXT NOT NULL,
  acao          TEXT NOT NULL CHECK (acao IN ('cadastro','edicao','exclusao','inativacao','ativacao','ajuste_estoque')),
  tabela        TEXT NOT NULL,
  registro_id   TEXT,
  dados_antes   JSONB,
  dados_depois  JSONB,
  ip            TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON public.auditoria (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela ON public.auditoria (tabela);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria (usuario_id);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "autenticado_le" ON public.auditoria
    FOR SELECT TO authenticated
    USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "autenticado_insere" ON public.auditoria
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sem UPDATE/DELETE policy: log de auditoria é somente leitura/inserção,
-- ninguém (nem o próprio usuário) deve conseguir alterar ou apagar um registro já gravado.
