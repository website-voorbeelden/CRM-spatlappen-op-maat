CREATE TABLE IF NOT EXISTS crm_workspace (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  commit_token TEXT NOT NULL DEFAULT '',
  updated_at TEXT
);
INSERT OR IGNORE INTO crm_workspace (id) VALUES (1);
-- Split JSON into small values, preserving every existing field and array order.
CREATE TABLE IF NOT EXISTS crm_records (
  store TEXT NOT NULL,
  record_key TEXT NOT NULL,
  part INTEGER NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (store, record_key, part)
);
CREATE TABLE IF NOT EXISTS crm_files (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  sha256 TEXT NOT NULL
);
-- Idempotent acknowledgements also recover a successful save after a lost response.
CREATE TABLE IF NOT EXISTS crm_commits (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL,
  digest TEXT NOT NULL,
  created_at TEXT NOT NULL
);
