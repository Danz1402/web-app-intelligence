CREATE TABLE role_profiles (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provenance JSONB NOT NULL,
  UNIQUE (application_id, name)
);

CREATE INDEX idx_role_profiles_application_id ON role_profiles (application_id);

ALTER TABLE discovery_sessions
  ADD CONSTRAINT fk_discovery_sessions_role_profile
  FOREIGN KEY (role_profile_id) REFERENCES role_profiles (id) ON DELETE SET NULL;