# Spatlappen CRM

CRM voor klanten, klantorders, inkoopbestellingen, betalingen, ontwerpen en documenten.

## Lokaal

Gebruik Node.js 24+ en Python 3. Start met `npm install` en `npm run dev`, daarna http://localhost:3000/admin/. Zonder privéconfiguratie zijn lokale Tikkie- en Word/PDF-functies niet ingesteld. Klantgegevens in de lokale browser staan los van GitHub.

## Cloudflare

`npm run build` maakt de publieke Pages-build in dist. De Functions gebruiken D1-binding DB en privé-R2-binding CRM_FILES. Schema's staan in migrations. Publiceer met Wrangler zodat de Functions meekomen. GitHub Pages is niet nodig. Configureer login- en Tikkie-secrets apart op de server; zonder wachtwoordhash blijft online toegang geblokkeerd. Alleen crm.spatlappenopmaat.nl is voor dit CRM bedoeld.

## Render

Word/PDF draait als afzonderlijke gratis Docker-service. Dockerfile: document-service/Dockerfile; context: .; healthcheck: /health. Zie document-service/README.md. Render en Cloudflare gebruiken hetzelfde geheime CRM_DOCUMENT_SERVICE_TOKEN; stel ook CRM_DOCUMENT_SERVICE_URL in Cloudflare in.

## Gegevens

Dit repositorypakket bevat uitsluitend code, bibliotheken, fonts en lege bedrijfstemplates. Klantdata, uploads, back-ups, privéconfiguratie en secrets zijn uitgesloten. Migreer echte gegevens na beveiliging via Instellingen & back-up in het CRM. Download eerst een volledige back-up.

## Controles zonder browser

`npm run test:backend` en `node tests/customer-documents.mjs` en `node tests/session-undo.mjs`. Browsercontroles in test:cloud worden alleen op verzoek gestart.
