-- First-run guided tour (Olive). Completion lives on the profile so it follows the user across
-- devices and survives refreshes. Existing users have already learned the app: backfill them as
-- done so only new sign-ups see the tour.
alter table public.profiles add column tour_completed_at timestamptz;

update public.profiles set tour_completed_at = now() where tour_completed_at is null;
