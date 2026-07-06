-- Calendar (Phase 4, Module 4.4 — last module in Phase 4): real events plus
-- virtual/computed entries (CRM follow-ups, task deadlines, birthdays) that
-- are queried live from existing tables rather than duplicated here.
-- Not sensitive data, so RLS is permissive like Tasks/Goals.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null check (event_type in ('meeting', 'interview', 'venue_visit', 'follow_up', 'deadline', 'birthday', 'holiday')),
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (event_id, profile_id)
);

alter table public.events enable row level security;
alter table public.event_attendees enable row level security;

create policy "Authenticated users can read events"
  on public.events for select to authenticated using (true);
create policy "Authenticated users can insert events"
  on public.events for insert to authenticated with check (true);
create policy "Authenticated users can update events"
  on public.events for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete events"
  on public.events for delete to authenticated using (true);

create policy "Authenticated users can read event attendees"
  on public.event_attendees for select to authenticated using (true);
create policy "Authenticated users can insert event attendees"
  on public.event_attendees for insert to authenticated with check (true);
create policy "Authenticated users can delete event attendees"
  on public.event_attendees for delete to authenticated using (true);
