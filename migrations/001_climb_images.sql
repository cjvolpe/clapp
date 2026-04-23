-- Adds image-upload support for climbs.
--
-- 1. Ensures the climbs.picture column exists (nullable text, stores the public URL
--    returned by Supabase Storage).
-- 2. Creates a public `climb-images` bucket that the frontend uploads into.
-- 3. Adds permissive storage policies so authenticated setters can upload and anyone
--    can read. Tighten these in production as needed.

alter table public.climbs
    add column if not exists picture text;

insert into storage.buckets (id, name, public)
values ('climb-images', 'climb-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Climb images are publicly readable" on storage.objects;
create policy "Climb images are publicly readable"
    on storage.objects for select
    using (bucket_id = 'climb-images');

drop policy if exists "Authenticated users can upload climb images" on storage.objects;
create policy "Authenticated users can upload climb images"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'climb-images');
