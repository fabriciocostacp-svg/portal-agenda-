-- Coluna `proxima_cobranca` (data) para lembrete de renovação / cobrança no admin.
-- Rode no Supabase: SQL Editor -> Run (uma vez).

begin;

alter table public.empresas
  add column if not exists proxima_cobranca date;

commit;
