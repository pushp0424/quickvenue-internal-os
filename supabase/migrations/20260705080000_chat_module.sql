-- Internal Communication (Phase 4, Module 4.3): direct messages, team/
-- department/city group channels, and a founder/admin-only announcements
-- channel. First module to use Supabase Realtime for live messaging.
--
-- Unlike Tasks/Goals (permissive "any authenticated user" RLS), chat holds
-- DMs, so access is scoped through can_access_channel(): a user can see a
-- channel if they're already a member, or if it's a team/department/city
-- channel matching their own profile, or if it's the announcement channel.

create or replace function public.is_founder_or_admin()
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
      and r.name in ('founder', 'admin')
  );
$$;

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'team', 'department', 'city', 'announcement')),
  name text not null,
  scope_value text,
  created_at timestamptz not null default now()
);

create table if not exists public.channel_members (
  channel_id uuid not null references public.channels(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (channel_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  body text,
  file_path text,
  file_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id, emoji)
);

create or replace function public.can_access_channel(p_channel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.channel_members cm
    where cm.channel_id = p_channel_id and cm.profile_id = auth.uid()
  )
  or exists (
    select 1 from public.channels c
    join public.profiles p on p.id = auth.uid()
    where c.id = p_channel_id
      and (
        c.type = 'announcement'
        or (c.type = 'team' and c.scope_value = p.team)
        or (c.type = 'department' and c.scope_value = p.department_id::text)
        or (c.type = 'city' and c.scope_value = p.city_id::text)
      )
  );
$$;

alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;

create policy "Users can read accessible channels"
  on public.channels for select to authenticated
  using (public.can_access_channel(id));
create policy "Users can create channels"
  on public.channels for insert to authenticated with check (true);

create policy "Users can read members of accessible channels"
  on public.channel_members for select to authenticated
  using (public.can_access_channel(channel_id));
create policy "Users can add channel members"
  on public.channel_members for insert to authenticated
  with check (
    profile_id = auth.uid()
    or exists (
      select 1 from public.channel_members cm
      where cm.channel_id = channel_members.channel_id and cm.profile_id = auth.uid()
    )
  );
create policy "Users can update their own membership"
  on public.channel_members for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "Users can read messages in accessible channels"
  on public.messages for select to authenticated
  using (public.can_access_channel(channel_id));
create policy "Users can send messages to accessible channels"
  on public.messages for insert to authenticated
  with check (
    public.can_access_channel(channel_id)
    and sender_id = auth.uid()
    and (
      (select type from public.channels where id = channel_id) <> 'announcement'
      or public.is_founder_or_admin()
    )
  );

create policy "Users can read reactions in accessible channels"
  on public.message_reactions for select to authenticated
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_reactions.message_id and public.can_access_channel(m.channel_id)
    )
  );
create policy "Users can add their own reactions"
  on public.message_reactions for insert to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.messages m
      where m.id = message_reactions.message_id and public.can_access_channel(m.channel_id)
    )
  );
create policy "Users can remove their own reactions"
  on public.message_reactions for delete to authenticated
  using (profile_id = auth.uid());

-- =========================================
-- Storage bucket for chat attachments
-- =========================================
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', false)
on conflict (id) do nothing;

create policy "Channel members can read chat attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-attachments'
    and public.can_access_channel(((storage.foldername(name))[1])::uuid)
  );
create policy "Channel members can upload chat attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and public.can_access_channel(((storage.foldername(name))[1])::uuid)
  );

-- =========================================
-- Enable Realtime on messages (live message delivery)
-- =========================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
