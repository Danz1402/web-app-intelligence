-- Gate 1 core tables (contract v0 subset)
-- IDs are UUID strings (TEXT) to match @wai/shared branded IDs.

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE environments (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL
);

CREATE TABLE discovery_sessions (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  environment_id TEXT NOT NULL REFERENCES environments (id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  role_profile_id TEXT,
  browser TEXT NOT NULL CHECK (browser = 'chromium'),
  start_url TEXT NOT NULL,
  error_message TEXT
);

CREATE TABLE page_instances (
  id TEXT PRIMARY KEY,
  page_template_id TEXT,
  application_id TEXT NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  provenance JSONB NOT NULL
);

CREATE TABLE states (
  id TEXT PRIMARY KEY,
  discovery_session_id TEXT NOT NULL REFERENCES discovery_sessions (id) ON DELETE CASCADE,
  page_instance_id TEXT REFERENCES page_instances (id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  pathname TEXT NOT NULL,
  title TEXT NOT NULL,
  fingerprint TEXT,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance JSONB NOT NULL
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  discovery_session_id TEXT NOT NULL REFERENCES discovery_sessions (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('screenshot', 'trace', 'dom_snapshot', 'other')),
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  evidence_status TEXT NOT NULL CHECK (
    evidence_status IN ('OBSERVED', 'VERIFIED', 'INFERRED', 'STALE', 'FAILED')
  )
);

CREATE INDEX idx_environments_application_id ON environments (application_id);
CREATE INDEX idx_discovery_sessions_application_id ON discovery_sessions (application_id);
CREATE INDEX idx_discovery_sessions_environment_id ON discovery_sessions (environment_id);
CREATE INDEX idx_page_instances_application_id ON page_instances (application_id);
CREATE INDEX idx_states_discovery_session_id ON states (discovery_session_id);
CREATE INDEX idx_artifacts_discovery_session_id ON artifacts (discovery_session_id);