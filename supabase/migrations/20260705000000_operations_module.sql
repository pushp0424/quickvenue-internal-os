-- Operations dashboard (Phase 2, Module 2.1): onboarding checklist fields
-- that don't already map to an existing venues column, plus a vendors table.

alter table public.venues
  add column if not exists listed_on_platform boolean not null default false,
  add column if not exists test_booking_done boolean not null default false;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  contact_name text,
  phone text,
  email text,
  city_id uuid references public.cities(id),
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendors enable row level security;

create policy "Authenticated users can read vendors"
  on public.vendors for select
  to authenticated
  using (true);

create policy "Authenticated users can insert vendors"
  on public.vendors for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update vendors"
  on public.vendors for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete vendors"
  on public.vendors for delete
  to authenticated
  using (true);
