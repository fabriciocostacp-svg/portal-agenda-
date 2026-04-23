-- Portal: Dona Lena no Supabase + VIP (Dona Lena e Pão de Queijo do Beto) + ativo.
-- Supabase → SQL Editor → colar → Run.
--
-- Ajuste o schema se a tabela não for public.empresas ou se faltar coluna
-- (compare com Table Editor). Erro comum: coluna com outro nome (ex.: categoria em vez de tiposerv).

begin;

-- 1) Inserir Dona Lena só se ainda não existir (nome parecido)
insert into public.empresas (
  nome,
  logotipo,
  tel,
  tiposerv,
  endereco,
  plano,
  patrocinado,
  ativo,
  descricao
)
select
  'Dona Lena',
  'assets/dona-lena.png',
  '5519986003501',
  'Limpeza / Casa',
  'Rua Jurupari, 105 - Jardim Nova Itirapina, Itirapina - SP',
  'vip',
  true,
  true,
  'Sabão artesanal multiuso para louça, roupas e limpeza geral — receita tradicional desde 1992, alto rendimento, econômico e durável.'
where not exists (
  select 1 from public.empresas e where e.nome ilike 'dona lena'
);

-- 2) Alinhar Dona Lena (já existindo ou recém-inserida)
update public.empresas
set
  logotipo = 'assets/dona-lena.png',
  tel = '5519986003501',
  tiposerv = 'Limpeza / Casa',
  endereco = 'Rua Jurupari, 105 - Jardim Nova Itirapina, Itirapina - SP',
  plano = 'vip',
  patrocinado = true,
  ativo = true,
  descricao =
    'Sabão artesanal multiuso para louça, roupas e limpeza geral — receita tradicional desde 1992, alto rendimento, econômico e durável.'
where nome ilike 'dona lena';

-- 3) Pão de Queijo do Beto: VIP + ativo (ajuste tel se no banco for outro)
update public.empresas
set
  plano = 'vip',
  patrocinado = true,
  ativo = true,
  logotipo = 'assets/beto.png',
  instagram = 'https://www.instagram.com/paodequeijodobeto/'
where nome ilike 'pão de queijo do beto'
   or nome ilike 'pao de queijo do beto';

commit;
