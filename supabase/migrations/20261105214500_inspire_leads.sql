create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (length(trim(name)) between 2 and 120),
  phone text not null,
  normalized_phone text not null unique,
  area text not null check (length(trim(area)) between 2 and 160),
  source text not null check (source in ('In person', 'Online', 'Flyer', 'Referral', 'Event', 'Other')),
  consent_confirmed boolean not null check (consent_confirmed),
  office_date date not null default ((now() at time zone 'Africa/Lagos')::date),
  created_at timestamptz not null default now()
);

create table if not exists public.lead_outreach (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  channel text not null default 'whatsapp' check (channel = 'whatsapp'),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.lead_outreach enable row level security;

create index if not exists leads_owner_created_idx on public.leads (owner_id, created_at desc);
create index if not exists leads_office_date_idx on public.leads (office_date desc);
create index if not exists lead_outreach_lead_idx on public.lead_outreach (lead_id, created_at desc);
create index if not exists lead_outreach_actor_idx on public.lead_outreach (actor_id, created_at desc);

create policy "Members and admins view allowed leads"
on public.leads for select to authenticated
using (
  owner_id = (select auth.uid())
  or private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);

create policy "Members add current-day leads"
on public.leads for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and office_date = (now() at time zone 'Africa/Lagos')::date
  and created_at >= (date_trunc('day', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos')
);

create policy "Members view own outreach"
on public.lead_outreach for select to authenticated
using (
  actor_id = (select auth.uid())
  or private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);

create policy "Members log allowed outreach"
on public.lead_outreach for insert to authenticated
with check (
  actor_id = (select auth.uid())
  and exists (
    select 1 from public.leads l
    where l.id = lead_id
      and (
        l.owner_id = (select auth.uid())
        or private.has_role((select auth.uid()), 'admin'::public.app_role)
        or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
      )
  )
);

-- There are deliberately no update or delete policies. Leads and outreach
-- records are immutable through the authenticated API.
