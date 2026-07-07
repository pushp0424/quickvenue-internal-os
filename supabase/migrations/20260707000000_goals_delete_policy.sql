-- Goals delete (2026-07-07 audit follow-up): goals had select/insert/update
-- policies but no delete policy, so a code-only .delete() was silently
-- blocked. Owner can delete their own goal; founder/admin can delete any.

create policy "Owner or founder/admin can delete goals"
  on public.goals for delete to authenticated
  using (owner_id = auth.uid() or public.is_founder_or_admin());
