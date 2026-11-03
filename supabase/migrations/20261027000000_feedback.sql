-- In-app feedback from the My Palate tab. Users can send feedback but never read it back;
-- the team reads it from the dashboard.
-- TODO(email): forward new rows to the team inbox once an email provider is chosen
-- (e.g. a database webhook or edge function). Nothing sends email yet.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 1 and 4000),
  reply_email text check (reply_email is null or char_length(reply_email) <= 320),
  page text,
  created_at timestamptz not null default now()
);

create index feedback_created on public.feedback (created_at desc);

alter table public.feedback enable row level security;

create policy "Send own feedback" on public.feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);
