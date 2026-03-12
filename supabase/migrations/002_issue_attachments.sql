-- Migration: add issue_attachments table
-- Run this in Supabase SQL Editor

create table public.issue_attachments (
  id            uuid        primary key default uuid_generate_v4(),
  issue_id      uuid        not null references public.issues(id) on delete cascade,
  file_name     text        not null,
  mime_type     text        not null,
  file_type     text        not null check (file_type in ('image', 'video', 'file')),
  file_size     bigint      not null,
  file_url      text        not null,
  thumbnail_url text,
  created_at    timestamptz not null default now()
);

create index idx_issue_attachments_issue_id on public.issue_attachments(issue_id);

alter table public.issue_attachments enable row level security;

create policy "authenticated read"
  on public.issue_attachments for select to authenticated using (true);

create policy "authenticated insert"
  on public.issue_attachments for insert to authenticated with check (true);

create policy "authenticated delete"
  on public.issue_attachments for delete to authenticated using (true);

-- Storage bucket (run once, or create via Supabase dashboard)
-- insert into storage.buckets (id, name, public)
-- values ('issue-attachments', 'issue-attachments', true)
-- on conflict (id) do nothing;

-- Storage RLS
-- create policy "authenticated upload"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'issue-attachments');

-- create policy "public read"
--   on storage.objects for select
--   using (bucket_id = 'issue-attachments');
