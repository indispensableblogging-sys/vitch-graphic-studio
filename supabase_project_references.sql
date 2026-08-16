-- VGS client project references / source-material uploads
-- Run once in the Supabase SQL Editor.
-- Creates a private Storage bucket and a metadata table for client uploads.

create table if not exists public.project_references (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  file_size bigint,
  reference_type text not null default 'reference',
  created_at timestamptz not null default now(),
  constraint project_references_target_check check (booking_id is not null or project_id is not null)
);

create index if not exists project_references_client_id_idx on public.project_references(client_id);
create index if not exists project_references_booking_id_idx on public.project_references(booking_id);
create index if not exists project_references_project_id_idx on public.project_references(project_id);

alter table public.project_references enable row level security;

drop policy if exists "Project references: client reads own" on public.project_references;
create policy "Project references: client reads own"
on public.project_references for select to authenticated
using ((select auth.uid()) = client_id or (select public.is_admin()));

drop policy if exists "Project references: client uploads own" on public.project_references;
create policy "Project references: client uploads own"
on public.project_references for insert to authenticated
with check ((select auth.uid()) = client_id or (select public.is_admin()));

drop policy if exists "Project references: client deletes own" on public.project_references;
create policy "Project references: client deletes own"
on public.project_references for delete to authenticated
using ((select auth.uid()) = client_id or (select public.is_admin()));

-- Private Storage bucket. Files are accessed through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('project-references', 'project-references', false)
on conflict (id) do update set public = false;

drop policy if exists "Project references storage: client uploads" on storage.objects;
create policy "Project references storage: client uploads"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'project-references'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Project references storage: client reads" on storage.objects;
create policy "Project references storage: client reads"
on storage.objects for select to authenticated
using (
  bucket_id = 'project-references'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
);

drop policy if exists "Project references storage: client deletes" on storage.objects;
create policy "Project references storage: client deletes"
on storage.objects for delete to authenticated
using (
  bucket_id = 'project-references'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
);
