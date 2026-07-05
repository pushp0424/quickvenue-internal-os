-- Task Management (Phase 4, Module 4.1): tasks with multi-assignee support,
-- comments, attachments, and a shared notifications table (also reused by
-- later Phase 4 modules, e.g. Chat's unread badges).

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_by uuid references public.profiles(id),
  team text,
  department text,
  city text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  deadline timestamptz,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (task_id, profile_id)
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Shared notifications table (recipient-scoped, not sensitive-data-gated)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.notifications enable row level security;

create policy "Authenticated users can read tasks"
  on public.tasks for select to authenticated using (true);
create policy "Authenticated users can insert tasks"
  on public.tasks for insert to authenticated with check (true);
create policy "Authenticated users can update tasks"
  on public.tasks for update to authenticated using (true) with check (true);

create policy "Authenticated users can read task assignees"
  on public.task_assignees for select to authenticated using (true);
create policy "Authenticated users can insert task assignees"
  on public.task_assignees for insert to authenticated with check (true);
create policy "Authenticated users can delete task assignees"
  on public.task_assignees for delete to authenticated using (true);

create policy "Authenticated users can read task comments"
  on public.task_comments for select to authenticated using (true);
create policy "Authenticated users can insert task comments"
  on public.task_comments for insert to authenticated with check (true);

create policy "Authenticated users can read task attachments"
  on public.task_attachments for select to authenticated using (true);
create policy "Authenticated users can insert task attachments"
  on public.task_attachments for insert to authenticated with check (true);
create policy "Authenticated users can delete task attachments"
  on public.task_attachments for delete to authenticated using (true);

create policy "Recipient can read own notifications"
  on public.notifications for select to authenticated
  using (recipient_id = auth.uid());
create policy "Authenticated users can insert notifications"
  on public.notifications for insert to authenticated with check (true);
create policy "Recipient can update own notifications"
  on public.notifications for update to authenticated
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- =========================================
-- Storage bucket for task attachments
-- =========================================
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

create policy "Task creator or assignee can read task attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'task-attachments'
    and exists (
      select 1 from public.tasks t
      where t.id::text = (storage.foldername(name))[1]
        and (
          t.assigned_by = auth.uid()
          or exists (
            select 1 from public.task_assignees ta
            where ta.task_id = t.id and ta.profile_id = auth.uid()
          )
        )
    )
  );
create policy "Task creator or assignee can upload task attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'task-attachments'
    and exists (
      select 1 from public.tasks t
      where t.id::text = (storage.foldername(name))[1]
        and (
          t.assigned_by = auth.uid()
          or exists (
            select 1 from public.task_assignees ta
            where ta.task_id = t.id and ta.profile_id = auth.uid()
          )
        )
    )
  );
create policy "Task creator or assignee can delete task attachments"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'task-attachments'
    and exists (
      select 1 from public.tasks t
      where t.id::text = (storage.foldername(name))[1]
        and (
          t.assigned_by = auth.uid()
          or exists (
            select 1 from public.task_assignees ta
            where ta.task_id = t.id and ta.profile_id = auth.uid()
          )
        )
    )
  );
