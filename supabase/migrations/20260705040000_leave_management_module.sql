-- Leave Management (Phase 3, Module 3.3): leave types + a two-stage
-- approval workflow (reporting manager, then HR).

create table if not exists public.leave_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  annual_days numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.leave_types (name, annual_days) values
  ('Casual Leave', 12),
  ('Sick Leave', 12),
  ('Paid Leave', null),
  ('Unpaid Leave', null),
  ('Work From Home', null)
on conflict (name) do nothing;

create table if not exists public.leaves (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id),
  start_date date not null,
  end_date date not null,
  days numeric not null,
  reason text,
  status text not null default 'pending_team_lead',
  team_lead_decided_by uuid references public.profiles(id),
  team_lead_decided_at timestamptz,
  hr_decided_by uuid references public.profiles(id),
  hr_decided_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leave_types enable row level security;
alter table public.leaves enable row level security;

create policy "Authenticated users can read leave types"
  on public.leave_types for select to authenticated using (true);

create policy "Authenticated users can read leaves"
  on public.leaves for select to authenticated using (true);
create policy "Authenticated users can insert leaves"
  on public.leaves for insert to authenticated with check (true);
create policy "Authenticated users can update leaves"
  on public.leaves for update to authenticated using (true) with check (true);
