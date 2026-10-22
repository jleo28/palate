-- Activity level for the calorie maths (see ACTIVITY in @palate/core macros.ts).
-- Existing profiles become Moderate, closest to the old flat 1.5 multiplier.
alter table public.profiles
  add column activity text not null default 'moderate'
  check (activity in ('sitting', 'light', 'moderate', 'very'));
