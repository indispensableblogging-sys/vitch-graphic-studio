-- VGS Dashboard backend foundation
-- Run this in the Supabase SQL Editor.
-- IMPORTANT: Never put a Supabase service_role/secret key in the website.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  service text not null,
  project_title text not null,
  description text not null,
  budget numeric(12,2),
  currency text not null default 'NGN',
  deadline date,
  status text not null default 'pending' check (status in ('pending','reviewing','approved','in_progress','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  service text not null,
  description text,
  status text not null default 'pending' check (status in ('pending','in_progress','reviewing','completed','cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  budget numeric(12,2),
  currency text not null default 'NGN',
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending','paid','overdue','cancelled')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  sender_role text not null check (sender_role in ('client','admin')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists bookings_client_id_idx on public.bookings(client_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists messages_client_id_idx on public.messages(client_id);

-- Automatically create a client profile after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Admin authorization is based on app_metadata, not user-editable user_metadata.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Enable RLS on every exposed application table.
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.projects enable row level security;
alter table public.invoices enable row level security;
alter table public.messages enable row level security;
alter table public.announcements enable row level security;

-- Profiles
create policy "Profiles: own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

create policy "Profiles: client creates own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id and role = 'client');

create policy "Profiles: own profile update"
on public.profiles for update to authenticated
using ((select auth.uid()) = id or (select public.is_admin()))
with check ((select auth.uid()) = id or (select public.is_admin()));

-- Bookings
create policy "Bookings: client reads own"
on public.bookings for select to authenticated
using ((select auth.uid()) = client_id or (select public.is_admin()));

create policy "Bookings: client creates own"
on public.bookings for insert to authenticated
with check ((select auth.uid()) = client_id);

create policy "Bookings: client updates own"
on public.bookings for update to authenticated
using ((select auth.uid()) = client_id or (select public.is_admin()))
with check ((select auth.uid()) = client_id or (select public.is_admin()));

create policy "Bookings: admin deletes"
on public.bookings for delete to authenticated
using ((select public.is_admin()));

-- Projects
create policy "Projects: client reads own"
on public.projects for select to authenticated
using ((select auth.uid()) = client_id or (select public.is_admin()));

create policy "Projects: admin manages"
on public.projects for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Invoices
create policy "Invoices: client reads own"
on public.invoices for select to authenticated
using ((select auth.uid()) = client_id or (select public.is_admin()));

create policy "Invoices: admin manages"
on public.invoices for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Messages
create policy "Messages: participant reads"
on public.messages for select to authenticated
using ((select auth.uid()) = client_id or (select public.is_admin()));

create policy "Messages: client sends"
on public.messages for insert to authenticated
with check ((select auth.uid()) = client_id and sender_role = 'client');

create policy "Messages: admin sends"
on public.messages for insert to authenticated
with check ((select public.is_admin()) and sender_role = 'admin');

-- Announcements
create policy "Announcements: authenticated reads"
on public.announcements for select to authenticated
using (true);

create policy "Announcements: admin manages"
on public.announcements for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
