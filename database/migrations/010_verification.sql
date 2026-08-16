CREATE TABLE verification_results (
  id TEXT PRIMARY KEY,
  candidate_workflow_id TEXT NOT NULL REFERENCES candidate_workflows (id) ON DELETE CASCADE,
  discovery_session_id TEXT NOT NULL REFERENCES discovery_sessions (id) ON DELETE CASCADE,
  passed BOOLEAN NOT NULL,
  evidence_status TEXT NOT NULL CHECK (
    evidence_status IN ('OBSERVED', 'VERIFIED', 'INFERRED', 'STALE', 'FAILED')
  ),
  checked_at TIMESTAMPTZ NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_verification_results_workflow_id ON verification_results (candidate_workflow_id);