-- Fix: HR/founder could not edit other employees' profiles.
-- The employee-profiles module (20260705020000) added an is_hr_or_founder()
-- bypass for employee_financial_details/employee_documents, but never for
-- public.profiles itself, so HR edits to a colleague's Official/Personal
-- Details were silently filtered to 0 rows by RLS (auth.uid() = id only),
-- which then surfaced as a "0 rows returned" error from .select().single().

create policy "HR/Founder can update any profile"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_hr_or_founder())
  with check (id = auth.uid() or public.is_hr_or_founder());
