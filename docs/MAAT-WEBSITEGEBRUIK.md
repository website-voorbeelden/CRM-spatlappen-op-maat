# Maatwerkkunststof — Websitegebruik aansluiten

Lokale bronvoorbereiding 30 oktober 2026. Geen actieve verbinding/liveherstelclaim. Het gedeelde CRM blijft één codebasis voor beide bedrijven; de publieke Maatwebsite is een afzonderlijk bestaand project.

Websitebron: `<lokale-projectmap>`. Eigen overdracht daar: `docs-analytics-crm.md`. Vóór publiceren actuele productiebron en alle lokale wijzigingen samenbrengen; GitHubrepositorymetadata was ouder dan de gebruikte lokale websitebron. Geen branch-/Gitwijziging uitgevoerd.

Bronnen in die website:

| Bestand | Doel |
|---|---|
| lib/site-analytics.js | Zelfde CRM-v1-meetcontract, vaste Maat-site/pagina’s, begrensde publieke ingest, succesvolle-aanvraagregistratie en opruiming |
| functions/api/analytics.js | Publieke ingestroute, geen publieke data-uitlezing |
| migrations/0001_site_analytics.sql | Schema uitsluitend voor nieuwe eigen meetdatabase |
| src/assets/js/crm-usage.js | Optionele paginagebruikmeting en formdata-koppeling, vluchtig bezoeknummer |
| src/assets/js/cookie-consent.js | Expliciete nieuwe crmUsage-keuze, bestaande GA4-/Claritykeuzes behouden |
| functions/api/offerte.js | Aanvraag-ID bij werkelijk geaccepteerde interne mail, optionele exacte bezoekkoppeling |
| src/assets/js/main.js | Server-/netwerkfoutcategorie naast bestaande formulierbediening |
| src/**/*.html | Scriptverwijzingen en duidelijke meettoelichting, privacybeleid apart aangevuld |

Vereiste **website**configuratie na aparte ingebruiknameopdracht:

- Nieuwe eigen meetdatabase met de vier site_-tabellen uit het schema. Nooit op bestaande CRM-DB toepassen, geen Spatlappen-database gebruiken.
- Binding SITE_ANALYTICS_DB naar uitsluitend die database.
- WEBSITE_ANALYTICS_SITE=maatwerkkunststof.nl en ANALYTICS_ENABLED=true. Zonder deze voorwaarden blijft de ingest uit; preview-/localhostdomeinen schrijven niet naar deze productie-ingest.
- Bestaande Resendconfiguratie/ontvangers/secretwaarden behouden.

Vereiste **Maat-CRM**configuratie: dezelfde aparte meetdatabase onder SITE_ANALYTICS_DB en WEBSITE_ANALYTICS_SITE=maatwerkkunststof.nl. Eigen bestaande CRM-DB/R2/bedrijf/configuratie behouden. De CRM-rapportage is de gedeelde cloudflare/site-analytics.js met bestaande authenticatie en sitegrens. Website- en CRM-deployment zijn afzonderlijke acties en in deze ronde niet uitgevoerd.

Meting begint pas bij nieuwe expliciete toestemming en na activering. Een oude GA4-acceptatie wordt niet stil verruimd. Ontvangen formulieren kunnen ook zonder bezoektoestemming worden geteld, zonder gedragskoppeling. Aanvraag-ID staat vóór Naam in de interne mail zodat bestaande gedeelde herkenning de gegevens apart blijft lezen. Geen bestaande aanvragen terugvullen op naam/e-mail. GA4, Cloudflare Web Analytics en deze eigen meting zijn verschillende bronnen; niet optellen of zonder bewijs historische cijfers reconstrueren.

Een eventuele meetfout mag de aanvraagverzending niet blokkeren of opnieuw laten proberen nadat de interne mail al is geaccepteerd. De gewone lokale Eleventyserver voert Functions niet uit. Nieuwe SQL/lib/functions zijn geen statische publieke assets. Dit is bronwerk, geen build/publicatie/accountactivering of bewijs van echte ontvangst. Alle eigen functionele/visuele/meet-/aflevercontrole staat open; echte proeven vereisen afzonderlijke toestemming.
