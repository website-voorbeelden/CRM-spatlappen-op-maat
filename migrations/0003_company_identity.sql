-- Additive: does not modify any customer/order/file/session/payment table.
CREATE TABLE IF NOT EXISTS crm_company_identity (
 id INTEGER PRIMARY KEY CHECK(id=1),
 company_id TEXT NOT NULL CHECK(company_id IN ('spatlappen','maatwerkkunststof'))
);
