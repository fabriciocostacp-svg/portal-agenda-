-- Coluna `ativo` na tabela empresas: anuncios pausados somem do portal (guia, busca, faixa).
-- Rode no Supabase: SQL Editor -> colar -> Run (uma vez).

begin;

alter table public.empresas
  add column if not exists ativo boolean not null default true;

update public.empresas
set ativo = true
where ativo is null;

commit;
