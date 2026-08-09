-- Baseline: track which migrations have been applied.
-- The migration runner (Phase 1.7) inserts the filename into this table after success.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);