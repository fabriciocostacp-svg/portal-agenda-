-- Data em que o anúncio deixa de aparecer no portal (além da coluna ativo).
-- O site trata: visível se ativo = true e (ativo_ate é nulo ou ativo_ate >= hoje).
-- Rode no Supabase: SQL Editor → colar → Run (uma vez).

begin;

alter table public.empresas
  add column if not exists ativo_ate date;

commit;
