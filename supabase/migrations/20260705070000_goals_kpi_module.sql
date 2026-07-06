-- Weekly Goals & KPI (Phase 4, Module 4.2): manually-tracked goals scoped to
-- personal/team/department/city, with a leaderboard computed from personal
-- goals. KPI cards (calls made, leads added, agreements signed, attendance %,
-- hiring done) are read-only and computed from existing CRM/attendance/
-- profiles tables — no new tables needed for those.

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_value numeric not null,
  unit text,
  current_value numeric not null default 0,
  scope_type text not null check (scope_type in ('personal', 'team', 'department', 'city')),
  scope_value text,
  owner_id uuid references public.profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Authenticated users can read goals"
  on public.goals for select to authenticated using (true);
create policy "Authenticated users can insert goals"
  on public.goals for insert to authenticated with check (true);
create policy "Authenticated users can update goals"
  on public.goals for update to authenticated using (true) with check (true);
