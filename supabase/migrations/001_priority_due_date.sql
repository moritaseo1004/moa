-- Migration: add priority enum and due_date to issues
-- Run this in Supabase SQL Editor

create type issue_priority as enum ('urgent', 'high', 'medium', 'low');

alter table public.issues
  add column priority  issue_priority not null default 'medium',
  add column due_date  date;

create index idx_issues_priority on public.issues(priority);
