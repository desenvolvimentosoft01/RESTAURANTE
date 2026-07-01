-- ============================================================
-- SCHEMA COMPLETO — ERP Restaurante
-- Cole TUDO no Supabase > SQL Editor > New Query > Run
-- ============================================================

-- ===== CARDÁPIO =====

CREATE TABLE IF NOT EXISTS categorias (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome   TEXT NOT NULL,
  ativo  BOOLEAN NOT NULL DEFAULT true,
  ordem  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS produtos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id      UUID REFERENCES categorias(id) ON DELETE SET NULL,
  nome              TEXT NOT NULL,
  descricao         TEXT,
  preco             NUMERIC(10,2) NOT NULL,
  imagem_url        TEXT,
  ativo             BOOLEAN NOT NULL DEFAULT true,
  disponivel_ifood  BOOLEAN NOT NULL DEFAULT false,
  controla_estoque  BOOLEAN NOT NULL DEFAULT false,
  estoque_atual     INTEGER NOT NULL DEFAULT 0,
  estoque_minimo    INTEGER NOT NULL DEFAULT 0
);

-- ===== PEDIDOS =====

CREATE TABLE IF NOT EXISTS pedidos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origem          TEXT NOT NULL DEFAULT 'balcao' CHECK (origem IN ('balcao','ifood')),
  ifood_order_id  TEXT UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente','confirmado','em_preparo','pronto','entregue','cancelado')),
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro','credito','debito','pix','ifood')),
  nome_cliente    TEXT,
  entregador      TEXT,
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id      UUID REFERENCES produtos(id) ON DELETE SET NULL,
  nome_produto    TEXT NOT NULL,
  preco_unitario  NUMERIC(10,2) NOT NULL,
  quantidade      INTEGER NOT NULL DEFAULT 1,
  observacao      TEXT,
  subtotal        NUMERIC(10,2) NOT NULL
);

-- ===== ESTOQUE POR PRODUTO =====

CREATE TABLE IF NOT EXISTS movimentacoes_estoque_produto (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id   UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL CHECK (tipo IN ('entrada','saida','ajuste')),
  quantidade   INTEGER NOT NULL,
  motivo       TEXT,
  pedido_id    UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== FINANCEIRO =====

CREATE TABLE IF NOT EXISTS transacoes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo              TEXT NOT NULL CHECK (tipo IN ('entrada','saida')),
  categoria         TEXT NOT NULL DEFAULT 'outros',
  descricao         TEXT NOT NULL,
  valor             NUMERIC(10,2) NOT NULL,
  data_competencia  DATE NOT NULL DEFAULT CURRENT_DATE,
  pedido_id         UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        TEXT NOT NULL CHECK (tipo IN ('pagar','receber')),
  descricao   TEXT NOT NULL,
  valor       NUMERIC(10,2) NOT NULL,
  vencimento  DATE NOT NULL,
  pago        BOOLEAN NOT NULL DEFAULT false,
  pago_em     DATE,
  categoria   TEXT,
  observacao  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== VIEWS =====

CREATE OR REPLACE VIEW resumo_financeiro_hoje AS
SELECT
  COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS total_entradas,
  COALESCE(SUM(CASE WHEN tipo = 'saida'   THEN valor ELSE 0 END), 0) AS total_saidas,
  COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END), 0) AS saldo
FROM transacoes
WHERE data_competencia = CURRENT_DATE;

CREATE OR REPLACE VIEW produtos_mais_vendidos AS
SELECT
  ip.produto_id,
  ip.nome_produto,
  SUM(ip.quantidade)::INTEGER AS total_quantidade,
  SUM(ip.subtotal) AS total_receita
FROM itens_pedido ip
JOIN pedidos p ON p.id = ip.pedido_id
WHERE p.status NOT IN ('cancelado')
GROUP BY ip.produto_id, ip.nome_produto
ORDER BY total_quantidade DESC;

CREATE OR REPLACE VIEW alertas_estoque AS
SELECT id, nome, estoque_atual AS quantidade_atual, estoque_minimo AS quantidade_minima
FROM produtos
WHERE controla_estoque = true
  AND estoque_atual <= estoque_minimo
  AND ativo = true;

-- ===== FUNÇÕES =====

CREATE OR REPLACE FUNCTION baixar_estoque_produto(p_pedido_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT ip.produto_id, ip.quantidade
    FROM itens_pedido ip
    JOIN produtos p ON p.id = ip.produto_id
    WHERE ip.pedido_id = p_pedido_id
      AND p.controla_estoque = true
  LOOP
    UPDATE produtos
    SET estoque_atual = GREATEST(estoque_atual - item.quantidade, 0)
    WHERE id = item.produto_id;

    INSERT INTO movimentacoes_estoque_produto (produto_id, tipo, quantidade, motivo, pedido_id)
    VALUES (item.produto_id, 'saida', item.quantidade, 'Venda balcão', p_pedido_id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON pedidos;
CREATE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- ===== RLS =====

ALTER TABLE categorias                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas                       ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "autenticado_tudo" ON categorias                    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "autenticado_tudo" ON produtos                      FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "autenticado_tudo" ON pedidos                       FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "autenticado_tudo" ON itens_pedido                  FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "autenticado_tudo" ON movimentacoes_estoque_produto  FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "autenticado_tudo" ON transacoes                    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "autenticado_tudo" ON contas                        FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== DADOS INICIAIS (opcional) =====

INSERT INTO categorias (nome, ordem) VALUES
  ('Prato Principal', 1),
  ('Entradas', 2),
  ('Bebidas', 3),
  ('Sobremesas', 4)
ON CONFLICT DO NOTHING;
