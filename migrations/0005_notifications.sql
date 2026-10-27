-- Additive only. Existing CRM records/files/payments are untouched.
CREATE TABLE IF NOT EXISTS crm_push_devices (
 id TEXT PRIMARY KEY, company_id TEXT NOT NULL, session_hash TEXT NOT NULL,
 endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS crm_push_session ON crm_push_devices(session_hash);
CREATE TABLE IF NOT EXISTS crm_notification_seen (payment_id TEXT PRIMARY KEY, seen_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS crm_notification_events (
 id TEXT PRIMARY KEY, payment_id TEXT NOT NULL, order_id TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS crm_notification_deliveries (
 event_id TEXT NOT NULL, device_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
 attempts INTEGER NOT NULL DEFAULT 0, next_at INTEGER NOT NULL DEFAULT 0,
 lease_until INTEGER NOT NULL DEFAULT 0, lease_token TEXT,
 PRIMARY KEY(event_id,device_id)
);
CREATE TABLE IF NOT EXISTS crm_notification_control (
 id INTEGER PRIMARY KEY CHECK(id=1), seeded INTEGER NOT NULL DEFAULT 0,
 lease_until INTEGER NOT NULL DEFAULT 0, lease_token TEXT,
 checked_at INTEGER, provider_checked_at INTEGER, provider_cursor TEXT NOT NULL DEFAULT '', last_error TEXT
);
INSERT OR IGNORE INTO crm_notification_control(id) VALUES(1);
