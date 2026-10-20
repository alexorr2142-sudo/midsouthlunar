-- Run in the Supabase SQL Editor. Never expose service-role credentials in the frontend.
create extension if not exists pgcrypto;
create table if not exists public.festival_applications (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 application_type text not null check (application_type in ('vendor','sponsor','volunteer')),
 applicant_name text not null check (length(applicant_name) between 1 and 200),
 email text not null check (length(email) between 3 and 200),
 phone text check (length(phone)<=200),
 organization text check (length(organization)<=200),
 category text not null check (length(category) between 1 and 200),
 details text check (length(details)<=3000),
 status text not null default 'new' check (status in ('new','reviewing','approved','declined'))
);
create table if not exists public.festival_organizers (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.festival_applications enable row level security;
alter table public.festival_organizers enable row level security;
revoke all on public.festival_applications from anon, authenticated;
grant insert (application_type,applicant_name,email,phone,organization,category,details) on public.festival_applications to anon, authenticated;
grant select, update on public.festival_applications to authenticated;
revoke all on public.festival_organizers from anon, authenticated;
create policy "Public can submit applications" on public.festival_applications for insert to anon, authenticated with check (status = 'new');
create policy "Organizers can view applications" on public.festival_applications for select to authenticated using (exists (select 1 from public.festival_organizers o where o.user_id = (select auth.uid())));
create policy "Organizers can update applications" on public.festival_applications for update to authenticated using (exists (select 1 from public.festival_organizers o where o.user_id = (select auth.uid()))) with check (exists (select 1 from public.festival_organizers o where o.user_id = (select auth.uid())));
-- In SQL editor after creating a Supabase Auth user:
-- insert into public.festival_organizers(user_id) values ('REPLACE-WITH-AUTH-USER-UUID');
-- For notifications, configure a Supabase Database Webhook for INSERT on
-- public.festival_applications to a protected Edge Function that calls your email provider.
-- Do not send email directly from the browser or expose an email API key.
