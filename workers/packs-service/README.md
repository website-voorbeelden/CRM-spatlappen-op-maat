> Actuele aanvulling2november: gebruiker heeft een afgeleide 21-modulebron als tjworx-packs-crm-test v3 gepubliceerd. Die exacte bron/manifest staat apart bij work/packs-cloudflare-v3-20261102/received; dit oudere lokale servicepakket niet klakkeloos daaroverheen publiceren. Bestaande v3 behouden, CRMcompatibiliteit en preview-schema/Service Binding aangesloten; secrets/Origin/account/documentservice/publicatie/eigen proef open. Zie ../../docs/PACKS-WORKER-V3-CRM-AANSLUITING-20261102.md. Nieuwe verbinding gebruikt de bestaande default Worker-environment en zakelijke preview/test.

# TJ Worx — private PACKS-testdienst voor Maatwerkkunststof

Bronpakket, bijgewerkt voor batch 2 op 1 november 2026. Niet getest/gebouwd door Codex, geen Cloudflare- of PACKS-uitvoering. Standaard geen boekingsvrijgave. Alleen een separate online Maat-preview, NOOIT bestaande live-CRM-D1/R2 gebruiken. Geen Spatlappen/PACKS-liveboekingen in deze dienst.

## Wat dit pakket doet

De worker draait dezelfde CRM-PACKS-adapter en dezelfde versleutelde registratieregels als het bestaande CRM. Hij leest de huidige order uit de preview-CRM, bewaakt order-/pakket-/accountversie, boekt hoogstens de winnende bekende poging en haalt originele labels op. Hij verzendt geen mail en maakt zelf geen pakbon: dat blijft bij de bestaande CRM-document- en mailroute. Het CRM bewaart de uiteindelijke labels als bestaande documentmetadata, niet door een losse willekeurige bucketwrite.

CRM en worker delen DEZELFDE preview-CRM-D1 (orders/sessies/integraties/register) en DEZELFDE preview-R2 (bestanden/labelcache). Er is geen tweede shipments-database en geen tweede onafhankelijke boekingsmotor. Een worker zonder die preview-CRM en bijgewerkte CRM-route is geen werkende knopkoppeling.

## Eerst klaarmaken — nog niet uitgevoerd

1. Gebruik of richt een aparte online Maatwerkkunststof-testkopie van het CRM in, met eigen login, eigen D1/R2 en fictieve of bewust gekozen proefgegevens. Geen live-database als snelle vervanger. Dit ZIP bevat de PACKS-serverbron, niet een volledige CRM-website of aangemaakte cloudomgeving.
2. Installeer in DIE preview de gebruikelijke CRM-schema’s 0001–0004 en bestaande bedrijfsidentiteit volgens de CRM-installatie. De bestanden zitten ter referentie onder install/crm-schema. Er worden door het ZIP geen schema’s automatisch toegepast. Nieuwe lege tabellen bevatten nog geen bruikbare CRM, sessie of order.
3. Voer install/preview-marker.sql alleen in DIE preview-D1 uit. Maak bewust één rij zoals de commentaarregel beschrijft met eigen willekeurige 64hex storage_id. Kies deze onafhankelijk van een herstelde backup. Geen marker resetten om een onbekende boeking te omzeilen. Zorg dat crm_company_identity de waarde maatwerkkunststof heeft.
4. Maak een eigen willekeurige 64hex CRM_PACKS_SERVICE_KEY. Gebruik die als secret op preview-CRM EN worker. De key komt nergens in browsercode. Geef dezelfde CRM_PACKS_STORAGE_ID op beide servers als niet-geheime instelling; die moet exact op de preview-marker passen.

## Worker installeren

Het ZIP is een project met bronmodules, geen enkel script om blind in een bestaande Worker te plakken en geen static-website-upload. Gebruik Cloudflare’s Wrangler-projectdeploy of laat de projectmap via de gebruikelijke deploymentmethode verwerken. Er is hier geen build uitgevoerd en geen account verbonden.

- Pak de hele projectmap uit. Behoud cloudflare/, shared/ en workers/ bij elkaar.
- Installeer desgewenst Wrangler met npm install in de projectroot. Dit voert geen postinstallscript van dit pakket uit. Er staat geen automatisch test-/migratie-/deployscript in package.json.
- Kopieer workers/packs-service/wrangler.example.jsonc naar wrangler.jsonc in dezelfde map. Vul DB en CRM_FILES in met de PREVIEWresources. Laat workers_dev=false, preview_urls=false en geen publieke routes staan: deze dienst wordt via servicebinding aangeroepen.
- Vul de vars in: juiste preview-CRM-origin zonder /admin, toegestane loginmail van die test-CRM, identieke storage-ID. CRM_PACKS_EXECUTION_ENABLED blijft false; release-ID/generatie blijven aanvankelijk leeg, CRM_PACKS_FRESH_INSTALL blijft false.
- Zet op de worker de secrets CRM_PACKS_SERVICE_KEY, CRM_PASSWORD_HASH en CRM_INTEGRATIONS_KEY. De laatste twee moeten passen bij DIE preview-CRM, niet live. Geen echt wachtwoord in bron plakken. De PACKS-credentials worden later vanuit de bestaande CRM-accountinstellingen onder een onveranderlijke versleutelde accountversie bewaard; geen losse hardcoded login in dit pakket.
- Publiceer desgewenst zelf met npx wrangler deploy --config workers/packs-service/wrangler.jsonc. Deze opdracht staat alleen als installatie-instructie, is NIET uitgevoerd door Codex. Publiceer onder nieuwe naam tjworx-packs-crm-test, niet over een bestaande CRM/Worker heen.

## CRM aansluiten — aparte bronwijziging/publicatie

crm-integration/api-route.patch bevat alleen de twee bedoelde wijzigingen aan cloudflare/api.js (import en PACKS-route). cloudflare/packs-service-route.js en packs-service-contract.js horen daarbij. In de gedeelde lokale projectbron is dit al voorbereid. Pas een patch niet blind toe op een afwijkende online bron; die moet eerst worden vergeleken. Het hele lokale CRM live publiceren is hiermee niet gevraagd of uitgevoerd.

Op de PREVIEW-CRM:

- Voeg servicebinding CRM_PACKS_WORKER toe naar tjworx-packs-crm-test, voorbeeld onder crm-integration/service-binding.example.jsonc. Dit is een toevoeging aan de bestaande previewconfig, geen complete vervangconfig.
- Zet CRM_PACKS_TRANSPORT=service. Zonder de instelling en zonder binding blijft de gewone ingebedde route bestaan; een binding zonder eenduidige keuze geeft juist een fout.
- Zet CRM_PACKS_SERVICE_KEY en CRM_PACKS_STORAGE_ID identiek aan de worker; CRM_COMPANY_ID=maatwerkkunststof, CRM_RELEASE_ENV=preview, CRM_PACKS_ENVIRONMENT=test en juiste CRM_PUBLIC_URL horen bij beide.
- De worker gebruikt dezelfde DB/R2, CRM_ALLOWED_EMAIL, passwordhash, encryptiesleutel, accountprofiel en registergeneratie. Een andere database, sessie of opslagmarker wordt geweigerd. Er wordt bij een storing in service mode niet op de lokale boekingsmotor teruggevallen.

## Vóór een echte PACKS-testboeking

De ontvangen loginnamen zijn geen bewijs van testrechten. Eerst bij PACKS testaccount/DirectBooking/dienst/product-ID/limieten en maatformule/kalender/transportretour/herstel bevestigen. De provideradapter heeft vaste test/livehosts; deze service weigert in zijn buitenste grens alles behalve test. Geen live-login als testaccount gokken.

Stel in de preview-CRM het bevestigde testprofiel en de testcredentials in. Laat ontbrekende contractafspraken onbekend. Voor daadwerkelijk vrijgeven moeten de actieve profielversie CRM_PACKS_RELEASE_ID, unieke CRM_PACKS_REGISTRY_GENERATION en de bestaande bewuste registerinrichting overeenkomen. CRM_PACKS_FRESH_INSTALL uitsluitend tijdelijk en bewust bij een werkelijk nieuwe installatie gebruiken; geen reset na verloren historie. Daarna pas CRM_PACKS_EXECUTION_ENABLED=true op de worker. Dit is een latere beheer-/gebruikersactie, geen in dit ZIP gegeven autorisatie om nu te boeken.

De gebruiker opent een order, controleert pakket/adres/datum, kiest de echte boekingsactie en beoordeelt de originele labels en pakbon. Testlabel blijft alleen voor proefmail. Een providerantwoord, PDF-header/hash of werkende installatiestatus is geen bewijs van fysieke afhaling, scanbaarheid of mailaflevering. Bij timeout dezelfde poging onderzoeken; nooit opnieuw boeken omdat een label ontbreekt.

## Beperkingen van deze eerste eigen uitgave

- Geen functionele tests, syntaxchecks, build of echte Cloudflare/PACKS-proef uitgevoerd. Je test zelf; de bijgeleverde v9-testclaims zijn niet van dit pakket.
- Nog geen aangemaakte preview-CRM/resources, ingevulde accountafspraken/secrets of livepublicatie.
- Automatische of eigen datum is nu in de bronketen aangesloten. Nieuwe automatische voorbereiding verzendt beide datums niet. Oude expliciete datums worden niet gemigreerd. Door PACKS teruggegeven planning blijft apart van de wens en is geen gereed-/afleverfeit. Bijwerken van CRM en dienst moet samen; eigen controle open.
- Huidige bron ondersteunt één bevestigd dienstprofiel en maximaal20colli; labelbestanden samen4MB. Grotere/meerdere diensten en v9’s8MBperlabel/ZIP20MB zijn niet automatisch overgenomen. Gewichten/verpakking en prijzen niet raden.
- Geen trackingcron of afleverwebhook toegevoegd. Done blijft alleen boekingsstatus. Geen saldo-opvraag verzonnen; geen auto boek-/mailretry.
- Onzekere boeking kan nog handmatig herstelonderzoek bij PACKS vragen. Geen generieke reset-/annuleer-/herboekknop.
- Hun nummer op de pakbonkop is lokaal in CRM/document-generatorbron gebouwd. Werk die documentservice afzonderlijk bij; dit Workerproject bevat geen draaiende Word/PDF-service. Operationele CRM-uitrol en eigen controle blijven open.

Zie docs/PACKS-WORKER-V9-EN-EIGEN-PAKKET-20261101.md voor de herbeoordeling. Huidige publieke providerbeschrijving: https://packsonlineapp.packs.nl/swagger/v1/swagger.json . Cloudflare servicebindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/ .

Nieuwe bronbeschrijving: docs/KUNSTSTOFBAAS-BATCH2-20261101.md. Het oudere ZIP zonder batch2 in de naam bevat deze datum-/planningsuitbreiding nog niet. Gebruik alleen onderling passende CRM/worker/documentbron.
