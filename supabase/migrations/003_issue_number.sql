-- ─── Add prefix to projects ───────────────────────────────────────────────────

ALTER TABLE public.projects
  ADD COLUMN prefix varchar(10);

-- Auto-generate prefix from existing project names (first 3 letters, uppercase, pad with X)
UPDATE public.projects
SET prefix = RPAD(
  UPPER(LEFT(REGEXP_REPLACE(name, '[^a-zA-Z]', '', 'g'), 3)),
  3, 'X'
);

ALTER TABLE public.projects
  ALTER COLUMN prefix SET NOT NULL,
  ADD CONSTRAINT projects_prefix_length CHECK (LENGTH(TRIM(prefix)) >= 1);

-- ─── Add issue_number to issues ──────────────────────────────────────────────

ALTER TABLE public.issues
  ADD COLUMN issue_number integer;

-- Backfill: assign sequential numbers per project ordered by created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) AS rn
  FROM public.issues
)
UPDATE public.issues i
SET issue_number = n.rn
FROM numbered n
WHERE i.id = n.id;

ALTER TABLE public.issues
  ALTER COLUMN issue_number SET NOT NULL,
  ADD CONSTRAINT issues_project_issue_number_unique UNIQUE (project_id, issue_number);

-- ─── Trigger: auto-assign issue_number on INSERT ─────────────────────────────

CREATE OR REPLACE FUNCTION assign_issue_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(issue_number), 0) + 1
  INTO NEW.issue_number
  FROM public.issues
  WHERE project_id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_issue_number
BEFORE INSERT ON public.issues
FOR EACH ROW EXECUTE FUNCTION assign_issue_number();
