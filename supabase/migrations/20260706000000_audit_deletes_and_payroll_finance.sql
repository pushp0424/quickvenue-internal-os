-- Audit follow-up (2026-07-06): add the missing DELETE policies so the new
-- delete features actually work (a code-only .delete() is silently blocked
-- when no delete policy exists), plus the Payroll -> Finance link column.
--
-- Ownership model: a row's owner can delete their own row; founder/admin can
-- delete anything. Finance ledger rows stay permissive like the rest of the
-- finance module. Cascades handle children (e.g. deleting a task removes its
-- assignees/comments/attachments via their ON DELETE CASCADE FKs).

-- Tasks: creator or founder/admin
create policy "Creator or founder/admin can delete tasks"
  on public.tasks for delete to authenticated
  using (assigned_by = auth.uid() or public.is_founder_or_admin());

-- Task comments: author or founder/admin
create policy "Author or founder/admin can delete task comments"
  on public.task_comments for delete to authenticated
  using (author_id = auth.uid() or public.is_founder_or_admin());

-- Chat messages: sender or founder/admin
create policy "Sender or founder/admin can delete messages"
  on public.messages for delete to authenticated
  using (sender_id = auth.uid() or public.is_founder_or_admin());

-- Payroll runs: HR/founder (salary_slips cascade via payroll_id ON DELETE CASCADE)
create policy "HR/Founder can delete payroll runs"
  on public.payroll for delete to authenticated
  using (public.is_hr_or_founder());

-- Finance ledger: permissive, matching the module's existing policies
create policy "Authenticated users can delete invoices"
  on public.invoices for delete to authenticated using (true);
create policy "Authenticated users can delete transactions"
  on public.transactions for delete to authenticated using (true);

-- =========================================
-- Payroll -> Finance link
-- =========================================
-- Each payroll run records one aggregate "Salaries" expense (total net pay)
-- so the finance dashboard's expenses/burn-rate reflect payroll. Linking the
-- expense to the payroll run lets generatePayroll upsert (dedupe on re-run)
-- and cascades the expense away if the run is later deleted.
alter table public.expenses
  add column if not exists payroll_id uuid references public.payroll(id) on delete cascade;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'expenses_payroll_id_key'
  ) then
    alter table public.expenses add constraint expenses_payroll_id_key unique (payroll_id);
  end if;
end $$;
