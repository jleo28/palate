-- Lets a signed-in user delete their own account. Deleting the auth user cascades to
-- profiles and meal_logs (both reference auth.users on delete cascade). Photos, once they
-- exist, must be removed here too.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
