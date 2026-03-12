-- Migration: harden per-project issue_number assignment for concurrent inserts
-- Keeps existing (project_id, issue_number) unique constraint intact.

CREATE OR REPLACE FUNCTION assign_issue_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Serialize number allocation per project in the current transaction.
  PERFORM pg_advisory_xact_lock(hashtext('issues'), hashtext(NEW.project_id::text));

  SELECT COALESCE(MAX(issue_number), 0) + 1
  INTO NEW.issue_number
  FROM public.issues
  WHERE project_id = NEW.project_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
