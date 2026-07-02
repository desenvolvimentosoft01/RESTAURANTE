-- ============================================================
-- UNIDADE DE COMPRA x VENDA + FATOR DE CONVERSÃO
-- Cole TUDO no Supabase > SQL Editor > New Query > Run
-- ============================================================

-- A coluna unidade_medida (criada na 003) passa a ser a unidade de VENDA.
-- Adiciona unidade de COMPRA (como o produto é comprado do fornecedor) e o
-- fator de conversão: quantas unidades de venda equivalem a 1 unidade de compra.
-- Ex: compra em CX (caixa com 12 UN) → unidade_compra='CX', fator_conversao=12.
-- Estoque continua sempre controlado na unidade de venda.

ALTER TABLE public.produtos RENAME COLUMN unidade_medida TO unidade_venda;

ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS unidade_compra TEXT NOT NULL DEFAULT 'UN'
    CHECK (unidade_compra IN ('UN','KG','G','L','ML','PC','CX','FT'));

ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS fator_conversao NUMERIC(10,4) NOT NULL DEFAULT 1
    CHECK (fator_conversao > 0);
