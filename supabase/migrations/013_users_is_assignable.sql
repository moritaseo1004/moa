alter table public.users
  add column if not exists is_assignable boolean not null default true;
