-- Attendance system (Phase 3, Module 3.2): daily check-in/check-out,
-- one row per employee per day.

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  check_in_at timestamptz,
  check_out_at timestamptz,
  check_in_lat numeric,
  check_in_lng numeric,
  check_out_lat numeric,
  check_out_lng numeric,
  is_late boolean not null default false,
  work_mode text not null default 'office',
  city_id uuid references public.cities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, date)
);

alter table public.attendance enable row level security;

create policy "Authenticated users can read attendance"
  on public.attendance for select to authenticated using (true);
create policy "Authenticated users can insert attendance"
  on public.attendance for insert to authenticated with check (true);
create policy "Authenticated users can update attendance"
  on public.attendance for update to authenticated using (true) with check (true);
