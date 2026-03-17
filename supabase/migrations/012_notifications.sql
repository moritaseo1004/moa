alter table public.users
  add column if not exists last_seen_notification_at timestamptz;

create table if not exists public.notifications (
  id                uuid        primary key default uuid_generate_v4(),
  recipient_user_id uuid        not null references public.users(id) on delete cascade,
  actor_user_id     uuid        references public.users(id) on delete set null,
  issue_id          uuid        references public.issues(id) on delete cascade,
  comment_id        uuid        references public.comments(id) on delete cascade,
  type              text        not null check (type in ('mention', 'assigned')),
  title             text        not null,
  body              text,
  link_url          text        not null,
  created_at        timestamptz not null default now()
);

create index if not exists idx_notifications_recipient_created
  on public.notifications(recipient_user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "own notifications read"
  on public.notifications for select to authenticated
  using (public.current_app_user_id() = recipient_user_id);
