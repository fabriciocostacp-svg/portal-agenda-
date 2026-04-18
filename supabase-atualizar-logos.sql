-- Alinha o campo `logotipo` na tabela `empresas` com os mesmos arquivos da pasta assets/
-- do portal. Rode no Supabase: SQL Editor → New query → colar → Run.
--
-- Ajuste o nome da tabela se for diferente (ex.: public.empresas).
-- Se der erro de permissão, verifique RLS/policies na tabela.

begin;

-- Cada UPDATE só mexe nas linhas cujo nome bate (sem diferenciar maiúsculas).

update empresas set logotipo = 'assets/conecta.jpeg' where nome ilike 'fl conecta';

update empresas set logotipo = 'assets/julia.jpeg' where nome ilike 'julia corretora';

update empresas set logotipo = 'assets/clinica.jpeg' where nome ilike 'clinica bem viver';

update empresas set logotipo = 'assets/rotisseria.jpeg' where nome ilike 'rotisseria arte do sabor';

update empresas set logotipo = 'assets/gordo.jpeg' where nome ilike 'gordo lanches';

update empresas set logotipo = 'assets/deposito.jpeg'
where nome ilike 'depósito de bebida alves' or nome ilike 'deposito de bebida alves';

update empresas set logotipo = 'assets/lolana.jpeg' where nome ilike 'lolana lavanderia';

update empresas set logotipo = 'assets/grafica.jpeg'
where nome ilike 'margem zero gráfica' or nome ilike 'margem zero grafica'
   or nome ilike 'margery zero gráfica' or nome ilike 'margery zero grafica';

-- Emílio / Emilio (acento opcional no cadastro)
update empresas set logotipo = 'assets/escavacoes.jpeg'
where nome ilike 'emílio campos%' or nome ilike 'emilio campos%';

update empresas set logotipo = 'assets/criando-sonhos.jpeg' where nome ilike 'criando sonhos';

update empresas set logotipo = 'assets/apib.jpeg' where nome ilike 'apib';

update empresas set logotipo = 'assets/vitale.jpeg' where nome ilike 'vitale crochê' or nome ilike 'vitale croche';

update empresas set logotipo = 'assets/sempre-bela.jpeg' where nome ilike 'sempre bella';

update empresas set logotipo = 'assets/samarina.jpeg' where nome ilike 'samarina gomes marino' or nome ilike 'samarina marino';
update empresas set nome = 'Samarina Marino' where nome ilike 'samarina gomes marino';

update empresas set logotipo = 'assets/cheiro-de-amor.jpeg' where nome ilike 'cheiro de amor';

update empresas set logotipo = 'assets/sorvete.jpeg' where nome ilike 'sorvete americano';

update empresas set logotipo = 'assets/limpgel.jpeg' where nome ilike 'limp gel';

update empresas set logotipo = 'assets/impulsiona.jpeg' where nome ilike 'impulsiona veículos' or nome ilike 'impulsiona veiculos';

update empresas set logotipo = 'assets/valdecir.jpeg' where nome ilike 'valdecir alves';

update empresas set logotipo = 'assets/escavacoes.jpeg'
where nome ilike 'ec escavações' or nome ilike 'ec escavacoes'
   or nome ilike 'emilio campos escavações' or nome ilike 'emilio campos escavacoes'
   or nome ilike 'emilio campos';

update empresas set logotipo = 'assets/espetaria.jpeg'
where nome ilike 'gu espetaria e choperia' or nome ilike 'gu espetaria & choperia'
   or nome ilike 'espetaria do gu' or nome ilike 'espetaria & choperia do gu'
   or nome ilike 'espetaria e choperia do gu';

update empresas set logotipo = 'assets/buffet.jpeg'
where nome ilike 'buffet em casa gourmet' or nome ilike 'buffet em casa';

update empresas set logotipo = 'assets/iara.jpeg' where nome ilike 'iara ponfilio';

update empresas set logotipo = 'assets/cantinho.jpeg' where nome ilike 'cantinho da fé' or nome ilike 'cantinho da fe';

commit;
