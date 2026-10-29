-- Tombstones prevent a retired cloud object from being reattached while its
-- physical deletion is in progress. Apply only as part of an explicit release.
CREATE TABLE IF NOT EXISTS crm_design_file_retirements (
 object_key TEXT PRIMARY KEY,
 file_ids TEXT NOT NULL,
 size INTEGER NOT NULL CHECK (size >= 0),
 retired_at TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','deleting','deleted')),
 deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS crm_design_file_retirements_status ON crm_design_file_retirements(status);
