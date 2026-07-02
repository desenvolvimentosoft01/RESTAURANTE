-- ============================================================
-- FIX — categorias.nome UNIQUE (necessário para ON CONFLICT funcionar)
-- Rodar apenas em bancos já criados antes desta correção (ex: Juan).
-- Bancos novos já nascem com essa constraint via 000_schema_completo.sql.
-- Cole TUDO no Supabase > SQL Editor > New Query > Run
-- ============================================================

DO $$ BEGIN
  ALTER TABLE public.categorias ADD CONSTRAINT categorias_nome_key UNIQUE (nome);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
