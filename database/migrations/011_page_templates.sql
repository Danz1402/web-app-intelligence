CREATE TABLE page_templates (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  provenance JSONB NOT NULL,
  UNIQUE (application_id, pattern)
);

CREATE INDEX idx_page_templates_application_id ON page_templates (application_id);

ALTER TABLE page_instances
  ADD CONSTRAINT fk_page_instances_template
  FOREIGN KEY (page_template_id) REFERENCES page_templates (id)
  ON DELETE SET NULL;