-- Profiles and meal logs, one row set per signed-in user. RLS: users only ever see their own rows.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  age smallint not null check (age between 13 and 120),
  gender text not null check (gender in ('female', 'male', 'other')),
  height_in smallint not null check (height_in between 36 and 96),
  weight_lb numeric(5, 1) not null check (weight_lb between 60 and 700),
  goal text not null check (goal in ('cut', 'maintain', 'lean-bulk')),
  high_protein boolean not null default false,
  diets text[] not null default '{}',
  allergies text[] not null default '{}',
  custom_allergies text[] not null default '{}',
  dislikes text[] not null default '{}',
  hall text not null check (hall in ('village', 'evk', 'parkside')),
  seedling jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  hall text not null check (hall in ('village', 'evk', 'parkside')),
  meal text not null check (meal in ('Breakfast', 'Lunch', 'Dinner')),
  kcal numeric(6, 1) not null check (kcal >= 0),
  protein numeric(6, 1) not null check (protein >= 0),
  carbs numeric(6, 1) not null check (carbs >= 0),
  fat numeric(6, 1) not null check (fat >= 0),
  items jsonb not null default '[]',
  source text not null default 'dining-hall' check (source in ('dining-hall', 'outside')),
  created_at timestamptz not null default now()
);

create index meal_logs_user_date on public.meal_logs (user_id, date desc);

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.meal_logs enable row level security;

create policy "Read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Create own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Delete own profile" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

create policy "Read own logs" on public.meal_logs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own logs" on public.meal_logs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Delete own logs" on public.meal_logs
  for delete to authenticated using ((select auth.uid()) = user_id);
