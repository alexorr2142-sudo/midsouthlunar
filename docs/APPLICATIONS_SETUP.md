# Festival application setup
The site is hosted on GitHub Pages, which cannot store form submissions by itself. The new React forms submit directly to Supabase, protected by Row Level Security.

1. In Supabase Dashboard → SQL Editor, run `supabase/schema.sql`.
2. In Authentication → Users, create or invite organizer accounts. Copy their user UUIDs. In SQL Editor, insert each into `public.festival_organizers` using the example at the bottom of the schema. Only those UUIDs can read or update submissions.
3. Test the vendor, sponsor, and volunteer pages. Confirm a new row appears in `festival_applications`. Test organizer sign-in, list filtering and status updates. Verify an unapproved authenticated account cannot read applications.
4. Set up email notifications separately: create a Supabase Edge Function with an email provider (e.g. Resend), store the provider API key in Supabase Edge Function secrets, and configure a Database Webhook for INSERT on `public.festival_applications`. Verify the webhook's secret or signature in the function. Use a verified sending domain and organizer recipient address. Email delivery is **not enabled** by this frontend change.
5. Add anti-spam controls (CAPTCHA, rate limiting at an Edge Function or gateway) before public launch. Direct anonymous table inserts are vulnerable to spam even with RLS. Consider moving submission to an Edge Function before production.
6. Review privacy/retention requirements and restrict organizer access to only necessary accounts.
7. Run `npm install`, `npm run build`, and tests before merging. This branch is a review candidate; do not merge until the database, email notifications, and abuse controls are configured.

The Supabase URL and publishable key in `src/lib/supabase.js` are public by design; never put a service-role key in client code.
