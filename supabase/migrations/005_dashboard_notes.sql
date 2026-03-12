-- Migration: add dashboard_notes table for personal daily notes

create table if not exists public.dashboard_notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  note_date  date not null,
  title      text not null,
  content    text,
  created_at timestamptz not null default now()
);

create index if not exists idx_dashboard_notes_user_date
  on public.dashboard_notes(user_id, note_date desc, created_at desc);
