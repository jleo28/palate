-- Wellbeing settings: Hide Numbers, skipped days and tracking pauses (see @palate/core wellbeing.ts).
alter table public.profiles
  add column wellbeing jsonb not null default '{}'::jsonb
  check (jsonb_typeof(wellbeing) = 'object');
