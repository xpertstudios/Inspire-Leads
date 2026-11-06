drop policy if exists "Members add followups to authorized leads" on public.lead_followups;
create policy "Members add followups to authorized leads" on public.lead_followups
for insert to authenticated with check (
  member_id = (select auth.uid())
  and exists (
    select 1 from public.leads l
    where l.id = lead_id
      and l.consent_confirmed
      and (
        l.owner_id = (select auth.uid())
        or exists (
          select 1 from public.legacy_member_links link
          where link.legacy_member_id = l.legacy_owner_id
            and link.auth_user_id = (select auth.uid())
        )
      )
  )
);
