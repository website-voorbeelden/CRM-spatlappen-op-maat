-- Private encrypted provider configuration. Never part of business snapshots.
CREATE TABLE IF NOT EXISTS crm_integrations (
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (company_id, name)
);
CREATE TABLE IF NOT EXISTS crm_oauth_requests (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  config_version TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS crm_oauth_expiry ON crm_oauth_requests(expires_at);
CREATE TABLE IF NOT EXISTS crm_service_leases (
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (company_id,name)
);
