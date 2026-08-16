CREATE TABLE candidate_workflows (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  action_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_candidate_workflows_application_id ON candidate_workflows (application_id);