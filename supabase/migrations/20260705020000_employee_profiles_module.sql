-- Employee profiles (Phase 3, Module 3.1): profile extensions, skills,
-- performance notes, and — unlike every other table so far — real
-- DB-level restriction on salary/bank details and ID documents, since
-- those are meaningfully more sensitive than anything stored before.

alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists team text;

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_name text not null,
  proficiency text,
  created_at timestamptz not null default now()
);

create table if not exists public.performance_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.skills enable row level security;
alter table public.performance_notes enable row level security;

create policy "Authenticated users can read skills"
  on public.skills for select to authenticated using (true);
create policy "Authenticated users can insert skills"
  on public.skills for insert to authenticated with check (true);
create policy "Authenticated users can delete skills"
  on public.skills for delete to authenticated using (true);

create policy "Authenticated users can read performance notes"
  on public.performance_notes for select to authenticated using (true);
create policy "Authenticated users can insert performance notes"
  on public.performance_notes for insert to authenticated with check (true);

-- =========================================
-- Sensitive data: real DB-level restriction
-- =========================================
create or replace function public.is_hr_or_founder()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name in ('founder', 'hr')
  );
$$;

create table if not exists public.employee_financial_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  salary_basic numeric,
  salary_hra numeric,
  salary_allowances numeric,
  bank_account_number text,
  bank_ifsc text,
  bank_upi text,
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  file_path text not null,
  file_name text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.employee_financial_details enable row level security;
alter table public.employee_documents enable row level security;

create policy "Owner or HR/Founder can read financial details"
  on public.employee_financial_details for select to authenticated
  using (profile_id = auth.uid() or public.is_hr_or_founder());
create policy "Owner or HR/Founder can insert financial details"
  on public.employee_financial_details for insert to authenticated
  with check (profile_id = auth.uid() or public.is_hr_or_founder());
create policy "Owner or HR/Founder can update financial details"
  on public.employee_financial_details for update to authenticated
  using (profile_id = auth.uid() or public.is_hr_or_founder())
  with check (profile_id = auth.uid() or public.is_hr_or_founder());

create policy "Owner or HR/Founder can read documents"
  on public.employee_documents for select to authenticated
  using (profile_id = auth.uid() or public.is_hr_or_founder());
create policy "Owner or HR/Founder can insert documents"
  on public.employee_documents for insert to authenticated
  with check (profile_id = auth.uid() or public.is_hr_or_founder());
create policy "Owner or HR/Founder can delete documents"
  on public.employee_documents for delete to authenticated
  using (profile_id = auth.uid() or public.is_hr_or_founder());

-- =========================================
-- Storage buckets
-- =========================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('employee-documents', 'employee-documents', false)
on conflict (id) do nothing;

create policy "Anyone can read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');
create policy "Authenticated users can upload avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');
create policy "Authenticated users can update avatars"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars');

create policy "Owner or HR/Founder can read employee documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'employee-documents'
    and (
      ((storage.foldername(name))[1])::uuid = auth.uid()
      or public.is_hr_or_founder()
    )
  );
create policy "Owner or HR/Founder can upload employee documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'employee-documents'
    and (
      ((storage.foldername(name))[1])::uuid = auth.uid()
      or public.is_hr_or_founder()
    )
  );
create policy "Owner or HR/Founder can delete employee documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'employee-documents'
    and (
      ((storage.foldername(name))[1])::uuid = auth.uid()
      or public.is_hr_or_founder()
    )
  );
