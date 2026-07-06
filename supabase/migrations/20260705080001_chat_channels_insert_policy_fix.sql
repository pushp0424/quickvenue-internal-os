-- Diagnostic: list what actually exists on public.channels right now.
-- Run this first and check the output before the fix below.
select policyname, cmd, permissive, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'channels';

-- Fix: (re)create the insert policy unconditionally, in case the original
-- migration's statement for this one policy didn't take effect.
drop policy if exists "Users can create channels" on public.channels;
create policy "Users can create channels"
  on public.channels for insert to authenticated with check (true);
