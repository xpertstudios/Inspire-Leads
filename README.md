# Inspire Leads — WINSPIRE OFFICE

A mobile-first lead capture and outreach tracker for WINSPIRE OFFICE.

## What it does

- Members capture leads collected during the current office day.
- Lead details are immutable after saving; previous-day entries cannot be added or changed.
- Each member can only view their own leads.
- Admins can view office-wide leads and member performance.
- WhatsApp click-to-chat opens a prefilled follow-up message and records the outreach event.
- Phone numbers are normalized and deduplicated across the office.
- Consent confirmation is required before a lead can be saved.

The office timezone is `Africa/Lagos` (WAT), with a daily cutoff at 12:00 AM. These rules are enforced in Supabase Row Level Security, not only in the interface.

## Stack

- Next.js 16 and React 19
- Supabase Auth and Postgres with Row Level Security
- Vercel hosting
- Responsive Progressive Web App (installable on supported phones)

## Local setup

Create `.env.local` with:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then run:

```sh
npm ci
npm run dev
```

## Deployment

The production app is deployed from this GitHub repository to Vercel. Add the three environment variables above to Vercel and set `NEXT_PUBLIC_SITE_URL` to the production `.vercel.app` URL.
