-- Migration: track first and latest sign-in providers separately

alter table public.users
  add column if not exists first_auth_provider text,
  add column if not exists last_sign_in_provider text;

update public.users
set
  first_auth_provider = coalesce(first_auth_provider, auth_provider, 'email'),
  last_sign_in_provider = coalesce(last_sign_in_provider, auth_provider, 'email');

alter table public.users
  alter column first_auth_provider set default 'email',
  alter column last_sign_in_provider set default 'email',
  alter column first_auth_provider set not null,
  alter column last_sign_in_provider set not null;
