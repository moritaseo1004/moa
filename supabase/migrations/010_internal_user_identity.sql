-- Migration: decouple internal users from auth users and link multiple auth identities

alter table public.users
  drop constraint if exists users_id_fkey;

alter table public.users
  add column if not exists auth_user_id uuid;

update public.users
set auth_user_id = id
where auth_user_id is null;

alter table public.users
  alter column auth_user_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_auth_user_id_key'
  ) then
    alter table public.users
      add constraint users_auth_user_id_key unique (auth_user_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_auth_user_id_fkey'
  ) then
    alter table public.users
      add constraint users_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create table if not exists public.user_identities (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  auth_user_id     uuid        not null unique references auth.users(id) on delete cascade,
  provider         text        not null check (provider in ('email', 'google')),
  provider_email   text        not null,
  created_at       timestamptz not null default now(),
  last_sign_in_at  timestamptz not null default now()
);

create index if not exists idx_user_identities_user_id
  on public.user_identities(user_id);

create unique index if not exists idx_user_identities_provider_email
  on public.user_identities(provider, provider_email);

insert into public.user_identities (user_id, auth_user_id, provider, provider_email, created_at, last_sign_in_at)
select
  id,
  auth_user_id,
  coalesce(last_sign_in_provider, first_auth_provider, auth_provider, 'email'),
  lower(email),
  created_at,
  coalesce(last_sign_in_at, created_at, now())
from public.users
on conflict (auth_user_id) do update
set
  user_id = excluded.user_id,
  provider = excluded.provider,
  provider_email = excluded.provider_email,
  last_sign_in_at = excluded.last_sign_in_at;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select ui.user_id
  from public.user_identities ui
  where ui.auth_user_id = auth.uid()
  limit 1
$$;

alter table public.user_identities enable row level security;

drop policy if exists "authenticated read" on public.user_identities;
create policy "authenticated read"
  on public.user_identities for select to authenticated using (auth.uid() = auth_user_id);

drop policy if exists "own profile update" on public.users;
create policy "own profile update"
  on public.users for update to authenticated
  using (public.current_app_user_id() = id);

drop policy if exists "own notes read" on public.dashboard_notes;
drop policy if exists "own notes insert" on public.dashboard_notes;
drop policy if exists "own notes delete" on public.dashboard_notes;

create policy "own notes read"
  on public.dashboard_notes for select to authenticated
  using (public.current_app_user_id() = user_id);

create policy "own notes insert"
  on public.dashboard_notes for insert to authenticated
  with check (public.current_app_user_id() = user_id);

create policy "own notes delete"
  on public.dashboard_notes for delete to authenticated
  using (public.current_app_user_id() = user_id);
