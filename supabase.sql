create extension if not exists "pgcrypto";

create table project_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_type text not null,
  industry text not null,
  has_existing_website boolean not null,
  existing_website_url text,
  primary_goal text not null,
  target_audience text not null,
  features text[] not null,
  description text,
  budget_range text not null,
  timeline text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  preferred_contact text not null,
  consent boolean not null
);

alter table project_requests enable row level security;

create policy "allow service role insert" on project_requests
  for insert with check (true);
