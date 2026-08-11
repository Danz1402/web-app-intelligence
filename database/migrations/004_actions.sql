CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  element_id TEXT REFERENCES elements (id) ON DELETE SET NULL,
  state_id TEXT NOT NULL REFERENCES states (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_actions_state_id ON actions (state_id);
CREATE INDEX idx_actions_element_id ON actions (element_id);