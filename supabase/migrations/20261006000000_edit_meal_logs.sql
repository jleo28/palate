-- Logged meals can be edited (portions, items, totals) from the macro bank. Still only your own.
create policy "Update own logs" on public.meal_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
