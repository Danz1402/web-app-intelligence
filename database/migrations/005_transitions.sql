CREATE TABLE transitions (
  id TEXT PRIMARY KEY,
  from_state_id TEXT NOT NULL REFERENCES states (id) ON DELETE CASCADE,
  action_id TEXT NOT NULL REFERENCES actions (id) ON DELETE CASCADE,
  to_state_id TEXT REFERENCES states (id) ON DELETE SET NULL,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_transitions_from_state_id ON transitions (from_state_id);
CREATE INDEX idx_transitions_action_id ON transitions (action_id);
CREATE INDEX idx_transitions_to_state_id ON transitions (to_state_id);