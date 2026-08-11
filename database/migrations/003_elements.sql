CREATE TABLE elements (
  id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL REFERENCES states (id) ON DELETE CASCADE,
  role TEXT,
  name TEXT,
  tag TEXT,
  fingerprint TEXT,
  locator_candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_elements_state_id ON elements (state_id);