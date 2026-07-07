-- Venue management UI (Add/Edit/Delete venue) was wired up on the
-- Operations dashboard, but the `venues` table predates this repo's
-- migration history so its RLS policies were never tracked/confirmed.
-- Ensure authenticated users can insert and update venues (app-layer
-- gates who sees the buttons via the ADD_VENUES permission), matching
-- the permissive model already used for `vendors`. "Delete" is a soft
-- delete (is_active = false), so it's covered by the update policy.

drop policy if exists "Authenticated users can insert venues" on public.venues;
create policy "Authenticated users can insert venues"
  on public.venues for insert to authenticated
  with check (true);

drop policy if exists "Authenticated users can update venues" on public.venues;
create policy "Authenticated users can update venues"
  on public.venues for update to authenticated
  using (true)
  with check (true);
