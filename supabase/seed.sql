-- ─── Default project: Inbox ───────────────────────────────────────────────────

insert into public.projects (id, name, description)
values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Inbox',
  'Default project for uncategorized issues'
)
on conflict (id) do nothing;
