-- Migration: add start_date to issues

alter table public.issues
  add column if not exists start_date date;
