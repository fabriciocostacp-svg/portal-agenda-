-- Portal: corrige "permission denied for table empresas" no admin.
-- Rode no Supabase: SQL Editor -> colar -> Run.

begin;

alter table public.empresas
  add column if not exists ativo boolean not null default true;

alter table public.empresas
  add column if not exists descricao text;

alter table public.empresas enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.empresas to anon, authenticated;
grant insert, update on table public.empresas to authenticated;

drop policy if exists "empresas_select_anon_ativas" on public.empresas;
drop policy if exists "empresas_select_authenticated" on public.empresas;
drop policy if exists "empresas_insert_authenticated" on public.empresas;
drop policy if exists "empresas_update_authenticated" on public.empresas;

create policy "empresas_select_anon_ativas"
  on public.empresas
  for select
  to anon
  using (coalesce(ativo, true) = true);

create policy "empresas_select_authenticated"
  on public.empresas
  for select
  to authenticated
  using (true);

create policy "empresas_insert_authenticated"
  on public.empresas
  for insert
  to authenticated
  with check (true);

create policy "empresas_update_authenticated"
  on public.empresas
  for update
  to authenticated
  using (true)
  with check (true);

commit;
