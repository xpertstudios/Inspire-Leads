create table if not exists public.legacy_members (
  id uuid primary key default gen_random_uuid(),
  source_member_id text not null unique,
  email text not null unique,
  display_name text not null,
  imported_at timestamptz not null default now()
);

create table if not exists public.legacy_member_links (
  legacy_member_id uuid primary key references public.legacy_members(id) on delete cascade,
  auth_user_id uuid not null unique references public.profiles(id) on delete cascade,
  linked_at timestamptz not null default now()
);

alter table public.leads add column if not exists legacy_owner_id uuid references public.legacy_members(id) on delete restrict;
create index if not exists leads_legacy_owner_idx on public.leads (legacy_owner_id, created_at desc);
create index if not exists legacy_members_email_idx on public.legacy_members (email);

alter table public.legacy_members enable row level security;
alter table public.legacy_member_links enable row level security;

create policy "Admins and linked members view imported members"
on public.legacy_members for select to authenticated
using (
  exists (select 1 from public.legacy_member_links l where l.legacy_member_id = id and l.auth_user_id = (select auth.uid()))
  or private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);

create policy "Admins and linked members view import links"
on public.legacy_member_links for select to authenticated
using (
  auth_user_id = (select auth.uid())
  or private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);

drop policy if exists "Members and admins view allowed leads" on public.leads;
create policy "Members and admins view allowed leads"
on public.leads for select to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.legacy_member_links l
    where l.legacy_member_id = legacy_owner_id and l.auth_user_id = (select auth.uid())
  )
  or private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);

-- Imported people and leads are immutable through the authenticated API.
-- There are deliberately no insert, update, or delete policies on either
-- legacy table; migrations/service operations are required to change them.
