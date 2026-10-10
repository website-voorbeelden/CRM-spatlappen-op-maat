CREATE TABLE IF NOT EXISTS crm_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  auth_version TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS crm_sessions_expiry ON crm_sessions(expires_at);
CREATE TABLE IF NOT EXISTS crm_login_limits (
  id TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS crm_tikkie_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  identity TEXT NOT NULL,
  status TEXT NOT NULL,
  result TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS crm_tikkie_order ON crm_tikkie_requests(order_id);
-- One uncertain external request per order, even with two simultaneous tabs.
CREATE UNIQUE INDEX IF NOT EXISTS crm_tikkie_pending ON crm_tikkie_requests(order_id) WHERE status='pending';
