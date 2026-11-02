-- Production installation only. Existing rows/booking registers are never reset.
-- First confirm crm_company_identity is maatwerkkunststof and take a bookmark.
CREATE TABLE IF NOT EXISTS crm_packs_service_identity (
 id INTEGER PRIMARY KEY CHECK(id=1),
 company_id TEXT NOT NULL CHECK(company_id='maatwerkkunststof'),
 environment TEXT NOT NULL CHECK(environment='production'),
 storage_id TEXT NOT NULL CHECK(length(storage_id)=64)
);
-- Insert one independently generated 64-hex storage identity once, then use
-- the SAME identity on CRM and Worker. Never import a preview marker here.
