-- Portal: políticas RLS para a tabela public.empresas (admin cadastra via Auth).
-- Rode no Supabase: SQL Editor → colar → Run (pode rodar de novo: remove policies antigas).
--
-- Pré-requisitos:
-- 1) Tabela empresas com colunas usadas pelo portal (nome, logotipo, tel, tiposerv, ...).
-- 2) Rodar também: supabase-adicionar-ativo.sql e supabase-adicionar-proxima-cobranca.sql se ainda não rodou.
-- 3) Em Authentication → Users: criar um usuário (e-mail + senha) para quem opera o admin.

begin;

-- Descrição exibida no card (opcional; o admin envia no cadastro)
alter table public.empresas
  add column if not exists descricao text;

alter table public.empresas enable row level security;

drop policy if exists "empresas_select_anon_ativas" on public.empresas;
drop policy if exists "empresas_select_authenticated" on public.empresas;
drop policy if exists "empresas_insert_authenticated" on public.empresas;
drop policy if exists "empresas_update_authenticated" on public.empresas;

-- Visitantes do site (chave anon): só veem anúncios ativos
create policy "empresas_select_anon_ativas"
  on public.empresas
  for select
  to anon
  using (coalesce(ativo, true) = true);

-- Admin logado (Supabase Auth): vê tudo e pode inserir/alterar
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
