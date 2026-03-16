-- ─── Extensions ───────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type issue_status   as enum ('backlog', 'todo', 'doing', 'review', 'done');
create type issue_source   as enum ('slack', 'manual', 'system');
create type issue_priority as enum ('urgent', 'high', 'medium', 'low');

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- Users: mirrors auth.users with additional profile fields
create table public.users (
  id            uuid        primary key references auth.users(id) on delete cascade,
  name          text        not null,
  email         text        not null unique,
  slack_user_id text,
  role          text        not null default 'member' check (role in ('admin', 'member')),
  is_approved   boolean     not null default false,
  approved_at   timestamptz,
  approved_by   uuid        references public.users(id) on delete set null,
  auth_provider text        not null default 'email',
  first_auth_provider text  not null default 'email',
  last_sign_in_provider text not null default 'email',
  last_sign_in_at timestamptz,
  created_at    timestamptz not null default now()
);

-- Projects
create table public.projects (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Issues
create table public.issues (
  id          uuid         primary key default uuid_generate_v4(),
  title       text         not null,
  description text,
  project_id  uuid         not null references public.projects(id) on delete cascade,
  status      issue_status not null default 'backlog',
  priority    issue_priority not null default 'medium',
  start_date  date,
  due_date    date,
  assignee_id uuid         references public.users(id) on delete set null,
  reporter_id uuid         references public.users(id) on delete set null,
  source      issue_source not null default 'manual',
  created_at  timestamptz  not null default now()
);

-- Comments (user_id nullable — anonymous until auth is added)
create table public.comments (
  id         uuid        primary key default uuid_generate_v4(),
  issue_id   uuid        not null references public.issues(id) on delete cascade,
  user_id    uuid        references public.users(id) on delete set null,
  content    text        not null,
  created_at timestamptz not null default now()
);

-- Activity logs
create table public.activity_logs (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references public.users(id) on delete set null,
  entity_type text        not null,   -- 'issue' | 'project' | 'comment'
  entity_id   uuid        not null,
  action      text        not null,   -- 'issue_created' | 'issue_updated' | 'issue_completed' | 'assignee_changed' | 'comment_added'
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- Dashboard notes
create table public.dashboard_notes (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references public.users(id) on delete cascade,
  note_date  date        not null,
  title      text        not null,
  content    text,
  created_at timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index idx_issues_project_id   on public.issues(project_id);
create index idx_issues_assignee_id  on public.issues(assignee_id);
create index idx_issues_status       on public.issues(status);
create index idx_issues_priority     on public.issues(priority);
create index idx_comments_issue_id   on public.comments(issue_id);
create index idx_activity_entity     on public.activity_logs(entity_type, entity_id);
create index idx_activity_user_id    on public.activity_logs(user_id);
create index idx_dashboard_notes_user_date on public.dashboard_notes(user_id, note_date desc, created_at desc);

-- ─── Row Level Security ────────────────────────────────────────────────────────

alter table public.users         enable row level security;
alter table public.projects      enable row level security;
alter table public.issues        enable row level security;
alter table public.comments      enable row level security;
alter table public.activity_logs enable row level security;
alter table public.dashboard_notes enable row level security;

-- Authenticated users can read everything
create policy "authenticated read"
  on public.users for select to authenticated using (true);

create policy "authenticated read"
  on public.projects for select to authenticated using (true);

create policy "authenticated read"
  on public.issues for select to authenticated using (true);

create policy "authenticated read"
  on public.comments for select to authenticated using (true);

create policy "authenticated read"
  on public.activity_logs for select to authenticated using (true);

create policy "authenticated read"
  on public.dashboard_notes for select to authenticated using (auth.uid() = user_id);

-- Users can only modify their own profile
create policy "own profile update"
  on public.users for update to authenticated
  using (auth.uid() = id);

-- Authenticated users can create/update issues and comments
create policy "authenticated insert"
  on public.issues for insert to authenticated with check (true);

create policy "authenticated update"
  on public.issues for update to authenticated using (true);

create policy "authenticated insert"
  on public.comments for insert to authenticated with check (true);

create policy "own notes insert"
  on public.dashboard_notes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "own notes delete"
  on public.dashboard_notes for delete to authenticated
  using (auth.uid() = user_id);
