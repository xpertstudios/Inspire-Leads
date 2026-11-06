-- Merge imported chatgpt.site ownership with the member's Supabase account.
-- Exact normalized email is the identity key; names are never used for linking.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  name text;
begin
  name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Member'
  );

  insert into public.profiles(id, display_name, initials, timezone)
  values (
    new.id,
    name,
    upper(substr(regexp_replace(name, '[^A-Za-z]', '', 'g'), 1, 2)),
    'Africa/Lagos'
  )
  on conflict (id) do nothing;

  insert into public.user_roles(user_id, role)
  values (new.id, 'member')
  on conflict (user_id, role) do nothing;

  insert into public.legacy_member_links(legacy_member_id, auth_user_id)
  select lm.id, new.id
  from public.legacy_members lm
  where new.email is not null
    and lower(trim(lm.email)) = lower(trim(new.email))
  on conflict do nothing;

  return new;
end;
$$;

-- Backfill any matching accounts created before automatic linking was enabled.
insert into public.legacy_member_links(legacy_member_id, auth_user_id)
select lm.id, u.id
from public.legacy_members lm
join auth.users u on lower(trim(u.email)) = lower(trim(lm.email))
join public.profiles p on p.id = u.id
on conflict do nothing;
