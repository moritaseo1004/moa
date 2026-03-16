-- Migration: add user admin fields

alter table public.users
  add column if not exists role text not null default 'member',
  add column if not exists is_approved boolean not null default false,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.users(id) on delete set null,
  add column if not exists auth_provider text not null default 'email',
  add column if not exists last_sign_in_at timestamptz;

alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check check (role in ('admin', 'member'));

update public.users
set
  role = 'admin',
  is_approved = true,
  approved_at = coalesce(approved_at, now())
where lower(email) = 'gwseo@mwkorea.co.kr';
