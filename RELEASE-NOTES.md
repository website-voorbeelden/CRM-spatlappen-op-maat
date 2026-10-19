# CRM update — 19 October 2026

Mail workspace reform: explicit reply/new conversation and sender selection, attachment upload/read/save, single HTML signature with inline images, clearer sorting and filters. Invoice generation defaults to PDF; Word is optional. Website applicants with differing contact data can be reviewed against the existing customer or added as an extra contact.

Includes the pending shared workspace refactor, settings tabs, packing-slip batch review, VAT preparation and analytics controls. Existing customer records and runtime configuration are not included or migrated. Costing V2 remains optional source code; the standard published build still uses V1.

No automated tests, builds or browser QA were run, at the owner's request. Functional review remains open. This commit does not itself deploy Cloudflare, run database migrations or change Gmail permissions. Gmail remains read-only; mail sending retains the separate preview and user confirmation.
