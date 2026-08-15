CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL REFERENCES states (id) ON DELETE CASCADE,
  name TEXT,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_forms_state_id ON forms (state_id);

CREATE TABLE fields (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms (id) ON DELETE CASCADE,
  name TEXT,
  label TEXT,
  field_type TEXT,
  required BOOLEAN,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_fields_form_id ON fields (form_id);

CREATE TABLE validation_rules (
  id TEXT PRIMARY KEY,
  field_id TEXT REFERENCES fields (id) ON DELETE CASCADE,
  form_id TEXT REFERENCES forms (id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  message TEXT,
  provenance JSONB NOT NULL
);

CREATE INDEX idx_validation_rules_field_id ON validation_rules (field_id);
CREATE INDEX idx_validation_rules_form_id ON validation_rules (form_id);