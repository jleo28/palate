-- Feedback from the in-app form. Already exists on the hosted project; this records it.
-- Signed-in users can send their own feedback and can't read anyone's, including their own.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  message text not null,
  reply_email text,
  page text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "Send own feedback" on public.feedback;
create policy "Send own feedback" on public.feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- The email webhook (public.feedback INSERT → feedback-email Edge Function) is set up in the
-- dashboard, so the shared secret never lands in git. See README → Feedback emails.
