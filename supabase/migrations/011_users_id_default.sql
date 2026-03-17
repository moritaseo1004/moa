-- Migration: restore users.id default for internal user identities

create extension if not exists "uuid-ossp";

alter table public.users
  alter column id set default uuid_generate_v4();
