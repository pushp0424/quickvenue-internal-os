-- Finance dashboard (Phase 2, Module 2.2): expenses, invoices, and a
-- general transactions ledger for misc income/expense entries.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text,
  amount numeric not null,
  city_id uuid references public.cities(id),
  expense_date date not null default current_date,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  customer_name text not null,
  customer_lead_id uuid references public.customer_leads(id),
  city_id uuid references public.cities(id),
  amount numeric not null,
  status text not null default 'draft',
  issued_date date not null default current_date,
  due_date date,
  paid_date date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  category text,
  amount numeric not null,
  city_id uuid references public.cities(id),
  transaction_date date not null default current_date,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;
alter table public.invoices enable row level security;
alter table public.transactions enable row level security;

create policy "Authenticated users can read expenses"
  on public.expenses for select to authenticated using (true);
create policy "Authenticated users can insert expenses"
  on public.expenses for insert to authenticated with check (true);
create policy "Authenticated users can update expenses"
  on public.expenses for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete expenses"
  on public.expenses for delete to authenticated using (true);

create policy "Authenticated users can read invoices"
  on public.invoices for select to authenticated using (true);
create policy "Authenticated users can insert invoices"
  on public.invoices for insert to authenticated with check (true);
create policy "Authenticated users can update invoices"
  on public.invoices for update to authenticated using (true) with check (true);

create policy "Authenticated users can read transactions"
  on public.transactions for select to authenticated using (true);
create policy "Authenticated users can insert transactions"
  on public.transactions for insert to authenticated with check (true);
