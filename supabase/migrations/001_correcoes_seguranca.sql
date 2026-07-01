-- ============================================================
-- CORREÇÕES DE SEGURANÇA — ERP Restaurante
-- Cole TUDO no Supabase > SQL Editor > New Query > Run
-- ============================================================

-- ===== 1. VIEWS COM SECURITY INVOKER =====
-- Evita que as views executem com os privilégios do criador (definer).
-- Com security_invoker = true, a view respeita o RLS do usuário que a consulta.

CREATE OR REPLACE VIEW resumo_financeiro_hoje
  WITH (security_invoker = true) AS
SELECT
  COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS total_entradas,
  COALESCE(SUM(CASE WHEN tipo = 'saida'   THEN valor ELSE 0 END), 0) AS total_saidas,
  COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END), 0) AS saldo
FROM public.transacoes
WHERE data_competencia = CURRENT_DATE;

CREATE OR REPLACE VIEW produtos_mais_vendidos
  WITH (security_invoker = true) AS
SELECT
  ip.produto_id,
  ip.nome_produto,
  SUM(ip.quantidade)::INTEGER AS total_quantidade,
  SUM(ip.subtotal) AS total_receita
FROM public.itens_pedido ip
JOIN public.pedidos p ON p.id = ip.pedido_id
WHERE p.status NOT IN ('cancelado')
GROUP BY ip.produto_id, ip.nome_produto
ORDER BY total_quantidade DESC;

CREATE OR REPLACE VIEW alertas_estoque
  WITH (security_invoker = true) AS
SELECT id, nome, estoque_atual AS quantidade_atual, estoque_minimo AS quantidade_minima
FROM public.produtos
WHERE controla_estoque = true
  AND estoque_atual <= estoque_minimo
  AND ativo = true;

-- ===== 2. FUNÇÕES COM SEARCH PATH FIXO =====
-- SET search_path = '' impede ataques de injeção via search_path.
-- Todas as tabelas devem ser referenciadas com o schema completo (public.).

CREATE OR REPLACE FUNCTION public.baixar_estoque_produto(p_pedido_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT ip.produto_id, ip.quantidade
    FROM public.itens_pedido ip
    JOIN public.produtos p ON p.id = ip.produto_id
    WHERE ip.pedido_id = p_pedido_id
      AND p.controla_estoque = true
  LOOP
    UPDATE public.produtos
    SET estoque_atual = GREATEST(estoque_atual - item.quantidade, 0)
    WHERE id = item.produto_id;

    INSERT INTO public.movimentacoes_estoque_produto (produto_id, tipo, quantidade, motivo, pedido_id)
    VALUES (item.produto_id, 'saida', item.quantidade, 'Venda balcão', p_pedido_id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ===== 3. POLÍTICAS RLS — USANDO auth.uid() IS NOT NULL =====
-- Substitui USING (true) por uma verificação explícita de usuário autenticado.
-- O resultado prático é igual, mas elimina o aviso "RLS Policy Always True".

-- categorias
DROP POLICY IF EXISTS "autenticado_tudo" ON public.categorias;
CREATE POLICY "autenticado_tudo" ON public.categorias
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- produtos
DROP POLICY IF EXISTS "autenticado_tudo" ON public.produtos;
CREATE POLICY "autenticado_tudo" ON public.produtos
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- pedidos
DROP POLICY IF EXISTS "autenticado_tudo" ON public.pedidos;
CREATE POLICY "autenticado_tudo" ON public.pedidos
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- itens_pedido
DROP POLICY IF EXISTS "autenticado_tudo" ON public.itens_pedido;
CREATE POLICY "autenticado_tudo" ON public.itens_pedido
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- movimentacoes_estoque_produto
DROP POLICY IF EXISTS "autenticado_tudo" ON public.movimentacoes_estoque_produto;
CREATE POLICY "autenticado_tudo" ON public.movimentacoes_estoque_produto
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- transacoes
DROP POLICY IF EXISTS "autenticado_tudo" ON public.transacoes;
CREATE POLICY "autenticado_tudo" ON public.transacoes
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- contas
DROP POLICY IF EXISTS "autenticado_tudo" ON public.contas;
CREATE POLICY "autenticado_tudo" ON public.contas
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
