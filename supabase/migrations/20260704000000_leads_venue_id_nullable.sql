-- B2B leads now denormalize venue info directly onto the lead row
-- (venue_name, venue_area, venue_category, etc.) since a prospect
-- venue may not have a corresponding onboarded `venues` row yet.
alter table public.leads alter column venue_id drop not null;
