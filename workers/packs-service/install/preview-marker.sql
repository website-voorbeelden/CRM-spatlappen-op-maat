-- Run ONLY against the separate Maat preview CRM database, never production.
-- No row is created automatically; choose an independent storage ID first.
CREATE TABLE IF NOT EXISTS crm_packs_service_identity (
 id INTEGER PRIMARY KEY CHECK(id=1),
 company_id TEXT NOT NULL CHECK(company_id='maatwerkkunststof'),
 environment TEXT NOT NULL CHECK(environment='preview'),
 storage_id TEXT NOT NULL CHECK(length(storage_id)=64)
);
-- After reviewing the target TEST database, replace the placeholder and run once:
-- INSERT INTO crm_packs_service_identity(id,company_id,environment,storage_id)
-- VALUES(1,'maatwerkkunststof','preview','REPLACE_WITH_64_HEX_STORAGE_ID');
-- Never UPDATE/reset this marker as a remedy for an unknown booking outcome.
