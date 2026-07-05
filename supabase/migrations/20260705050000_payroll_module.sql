-- Payroll Basics (Phase 3, Module 3.4): monthly payroll runs and
-- per-employee salary slips. Salary amounts are at least as sensitive
-- as Module 3.1's financial details, so salary_slips gets the same
-- is_hr_or_founder()-gated RLS.

alter table public.employee_financial_details
  add column if not exists salary_da numeric;

create table if not exists public.payroll (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  status text not null default 'draft',
  generated_by uuid references public.profiles(id),
  generated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.salary_slips (
  id uuid primary key default gen_random_uuid(),
  payroll_id uuid not null references public.payroll(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  basic numeric not null default 0,
  hra numeric not null default 0,
  da numeric not null default 0,
  allowances numeric not null default 0,
  commission numeric not null default 0,
  lop_days numeric not null default 0,
  lop_amount numeric not null default 0,
  deductions numeric not null default 0,
  gross_pay numeric not null default 0,
  net_pay numeric not null default 0,
  payment_status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (payroll_id, profile_id)
);

alter table public.payroll enable row level security;
alter table public.salary_slips enable row level security;

create policy "Authenticated users can read payroll runs"
  on public.payroll for select to authenticated using (true);
create policy "HR/Founder can insert payroll runs"
  on public.payroll for insert to authenticated with check (public.is_hr_or_founder());
create policy "HR/Founder can update payroll runs"
  on public.payroll for update to authenticated
  using (public.is_hr_or_founder()) with check (public.is_hr_or_founder());

create policy "Owner or HR/Founder can read salary slips"
  on public.salary_slips for select to authenticated
  using (profile_id = auth.uid() or public.is_hr_or_founder());
create policy "HR/Founder can insert salary slips"
  on public.salary_slips for insert to authenticated with check (public.is_hr_or_founder());
create policy "HR/Founder can update salary slips"
  on public.salary_slips for update to authenticated
  using (public.is_hr_or_founder()) with check (public.is_hr_or_founder());
