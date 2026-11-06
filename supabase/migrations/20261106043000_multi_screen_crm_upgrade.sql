-- Staged INSPIRE Leads CRM upgrade. Apply only after preview approval.
alter table public.leads add column if not exists notes text;
alter table public.leads add column if not exists status text not null default 'New'
  check (status in ('New','Contacted','Interested','Follow-up Needed','Not Interested','Converted','Do Not Contact'));

create table if not exists public.lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  member_id uuid not null references public.profiles(id) on delete restrict,
  followup_date date not null default ((now() at time zone 'Africa/Lagos')::date),
  contact_method text not null check (contact_method in ('WhatsApp','Phone','SMS','In person','Email','Other')),
  outcome text not null check (outcome in ('No response','Contacted','Interested','Follow-up Needed','Not Interested','Converted','Do Not Contact')),
  notes text,
  next_followup_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.member_preferences (
  member_id uuid primary key references public.profiles(id) on delete cascade,
  phone text,
  profile_picture_url text,
  assigned_team text,
  whatsapp_message text not null default 'Hello, it was great meeting you. I am following up from WINSPIRE OFFICE about the opportunity we discussed.',
  notifications_enabled boolean not null default true,
  display_density text not null default 'comfortable' check (display_density in ('comfortable','compact')),
  updated_at timestamptz not null default now()
);

create table if not exists public.office_settings (
  id boolean primary key default true check (id),
  office_name text not null default 'WINSPIRE OFFICE',
  timezone text not null default 'Africa/Lagos',
  daily_cutoff time not null default '00:00',
  daily_target integer not null default 10 check (daily_target > 0),
  updated_by uuid references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists followups_member_date_idx on public.lead_followups(member_id, followup_date desc);
create index if not exists followups_lead_created_idx on public.lead_followups(lead_id, created_at desc);
create index if not exists followups_next_date_idx on public.lead_followups(next_followup_date) where next_followup_date is not null;
create index if not exists leads_status_date_idx on public.leads(status, office_date desc);
create index if not exists audit_actor_created_idx on public.admin_audit_events(actor_id, created_at desc);

alter table public.lead_followups enable row level security;
alter table public.member_preferences enable row level security;
alter table public.office_settings enable row level security;
alter table public.admin_audit_events enable row level security;

create policy "Members and admins view authorized followups" on public.lead_followups
for select to authenticated using (
  member_id = (select auth.uid())
  or private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);
create policy "Members add followups to authorized leads" on public.lead_followups
for insert to authenticated with check (
  member_id = (select auth.uid())
  and exists (select 1 from public.leads l where l.id = lead_id and l.consent_confirmed and l.owner_id = (select auth.uid()))
);

create policy "Members view own preferences" on public.member_preferences
for select to authenticated using (
  member_id = (select auth.uid())
  or private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);
create policy "Members create own preferences" on public.member_preferences
for insert to authenticated with check (member_id = (select auth.uid()));
create policy "Members update own preferences" on public.member_preferences
for update to authenticated using (member_id = (select auth.uid())) with check (member_id = (select auth.uid()));

create policy "Authenticated users view office settings" on public.office_settings
for select to authenticated using (true);
create policy "Admins update office settings" on public.office_settings
for update to authenticated
using (private.has_role((select auth.uid()), 'admin'::public.app_role) or private.has_role((select auth.uid()), 'super_admin'::public.app_role))
with check (private.has_role((select auth.uid()), 'admin'::public.app_role) or private.has_role((select auth.uid()), 'super_admin'::public.app_role));

create policy "Admins view audit events" on public.admin_audit_events
for select to authenticated using (
  private.has_role((select auth.uid()), 'admin'::public.app_role)
  or private.has_role((select auth.uid()), 'super_admin'::public.app_role)
);

grant select, insert on public.lead_followups to authenticated;
grant select, insert, update on public.member_preferences to authenticated;
grant select, update on public.office_settings to authenticated;
grant select on public.admin_audit_events to authenticated;

insert into public.office_settings(id) values (true) on conflict (id) do nothing;

-- No member UPDATE or DELETE policies exist on leads or follow-ups. Original
-- submissions and follow-up history therefore remain immutable through the API.
