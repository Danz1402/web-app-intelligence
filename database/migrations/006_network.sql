CREATE TABLE network_requests (
  id TEXT PRIMARY KEY,
  discovery_session_id TEXT NOT NULL REFERENCES discovery_sessions (id) ON DELETE CASCADE,
  action_id TEXT REFERENCES actions (id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  status_code INTEGER,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_network_requests_session_id ON network_requests (discovery_session_id);
CREATE INDEX idx_network_requests_action_id ON network_requests (action_id);

CREATE TABLE api_endpoints (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  provenance JSONB NOT NULL,
  UNIQUE (application_id, method, normalized_url)
);

CREATE INDEX idx_api_endpoints_application_id ON api_endpoints (application_id);