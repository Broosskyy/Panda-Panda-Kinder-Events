-- Öffentliche Storage-Buckets für CMS-Uploads (Galerie, Bewertungen, Site-Assets)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery', 'gallery', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('reviews', 'reviews', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Öffentlicher Lesezugriff auf alle drei Buckets
drop policy if exists "Public read gallery" on storage.objects;
create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

drop policy if exists "Public read reviews" on storage.objects;
create policy "Public read reviews"
  on storage.objects for select
  using (bucket_id = 'reviews');

drop policy if exists "Public read site-assets" on storage.objects;
create policy "Public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');
