-- Fiber, tracked alongside the macros (shown, not planned around). Older logs stay null:
-- fiber wasn't recorded for them, and the app treats null as unknown rather than zero.
alter table public.meal_logs add column fiber numeric;
