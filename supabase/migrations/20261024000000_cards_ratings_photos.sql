-- Chunk 4: the monthly card pool, taste ratings and meal photos. RLS: users only ever see
-- their own rows and photos.

-- Cards spent on purpose (logging an earlier meal). Kept on the profile, not the log, so
-- removing that meal later never refunds the card. Each entry: { "spentOn": date, "forDate": date }.
alter table public.profiles
  add column card_spends jsonb not null default '[]'::jsonb
  check (jsonb_typeof(card_spends) = 'array');

-- Path of the meal's photo in the meal-photos bucket ("<user id>/<file>").
alter table public.meal_logs add column photo_path text;

-- Thumbs up or down on how an item tasted, once per item per logged meal.
create table public.taste_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  meal_log_id uuid not null references public.meal_logs (id) on delete cascade,
  item_name text not null,
  rating smallint not null check (rating in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (meal_log_id, item_name)
);

create index taste_ratings_user on public.taste_ratings (user_id);

alter table public.taste_ratings enable row level security;

create policy "Read own ratings" on public.taste_ratings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own ratings" on public.taste_ratings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own ratings" on public.taste_ratings
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own ratings" on public.taste_ratings
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Private bucket for meal photos, up to 5 MB each. Files live under "<user id>/".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meal-photos',
  'meal-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

create policy "Read own meal photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Upload own meal photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Replace own meal photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Delete own meal photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
