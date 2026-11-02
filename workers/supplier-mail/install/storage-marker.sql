-- Installation SOURCE ONLY; never executed automatically by a mail request.
-- Only apply to the intended, separate CRM environment. Do not replace an
-- existing marker or attach the live CRM database to a preview worker.
CREATE TABLE IF NOT EXISTS crm_mail_service_identity (
 id INTEGER PRIMARY KEY CHECK (id = 1),
 company_id TEXT NOT NULL CHECK (company_id = 'maatwerkkunststof'),
 environment TEXT NOT NULL CHECK (environment IN ('preview','production')),
 storage_id TEXT NOT NULL CHECK (length(storage_id) = 64)
);
-- Insert one deliberately chosen company/environment/storage marker as part
-- of installation. Its storage_id must match CRM_OUTLOOK_STORAGE_ID on CRM
-- and scheduled worker. No sample credentials or active marker are supplied.
