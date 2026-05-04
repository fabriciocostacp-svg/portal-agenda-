-- Portal: bucket publico para logos enviados pelo admin.
-- Rode no Supabase: SQL Editor -> colar -> Run.

begin;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do update set public = true;

drop policy if exists "logos_select_public" on storage.objects;
drop policy if exists "logos_insert_authenticated" on storage.objects;
drop policy if exists "logos_update_authenticated" on storage.objects;
drop policy if exists "logos_delete_authenticated" on storage.objects;

create policy "logos_select_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'logos');

create policy "logos_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'logos');

create policy "logos_update_authenticated"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'logos')
  with check (bucket_id = 'logos');

create policy "logos_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'logos');

commit;
