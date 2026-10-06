-- Optional snacks: saved on the profile, and loggable as their own slots.
alter table public.profiles
  add column snacks text[] not null default '{}'
  check (snacks <@ array['Afternoon snack', 'Late-night snack']);

alter table public.meal_logs drop constraint meal_logs_meal_check;
alter table public.meal_logs add constraint meal_logs_meal_check
  check (meal in ('Breakfast', 'Lunch', 'Dinner', 'Afternoon snack', 'Late-night snack'));
