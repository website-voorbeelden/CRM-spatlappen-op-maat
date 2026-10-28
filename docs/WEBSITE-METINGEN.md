> Batch3 feedback28oktober lokaal: Websitegebruik heeft acht klikbare meetkaarten/dagreeksen met tabel; verzendpoging en werkelijk ontvangen formulier apart, Websiteaanvragen inclusief zonder bezoekmeting apart. Bestaande read-only dagquery uitgebreid met actieve seconden/submitted/scroll75 en expliciete beschikbare kolommen; geen nieuwe tracking/database/migratie. Ontbrekende reeks/oudere backend/dekking blijft expliciet onbekend. Zelfde periode/pagina/testfilters, fout/retry bewaart vorige getoonde rapportbasis. Zie FEEDBACK-BATCH3-20261028.md. Geen API-/meetdataonderzoek/tests/checks/build/browsercontrole of publicatie; eigen controle open. Oudere livebewijzen hieronder horen bij eerdere releases.

> Nieuw27oktober: [Vrijdagrapporten](VRIJDAGRAPPORTEN.md) als lokale bron: vorige volledige maandag–zondag tegenover vorige week, zes grafieken en aandachtspunten met volumebodem/dekkingsgrenzen. Zelfde eigen bedrijfsmeetbinding en uitsluitingen, Google/GA4 apart. Geen nieuwe tracking of credentials gelezen, geen rapport opgehaald/ingepland/verzonden. Ontvangstkeuze en eigen controle/publicatie open.

# Website & aanvragen — 17 oktober 2026

Live gepubliceerd op 17 oktober 2026 na expliciete opdracht. Spatlappen-CRM: release spatlappen-analytics-20261017, deployment <deployment-id>. Website: deployment <deployment-id>. Aparte EU-meetdatabase en beide bindings actief; bestaande bedrijfsgegevens exact behouden.

De publieke websitebron staat nu lokaal in:

`<lokale-projectmap>`

Dit is een verse Git-kopie van `website-voorbeelden/spatlappen-op-maat`, uitgangspunt `715a5d2`. De oude september-uploadmappen zijn achterhaald en ongewijzigd gebleven. De oorspronkelijke nieuwe `site.js` is bytegelijk aan de live site gecontroleerd. Lees de website-`AGENTS.md`, `AI.md` en `docs/analytics.md` voordat je daar werkt. Laat CRM-code in dit gedeelde project; maak geen tweede CRM.

## Gerealiseerde lokale onderdelen

| Bron | Verantwoordelijkheid |
|---|---|
| Website `analytics.js` | Optionele keuze, actieve tijd, formulierstappen/foutsoorten, contactklikken, vaste vrijwillige feedback |
| Website `lib/analytics.js` en `functions/api/analytics.js` | Begrensde publieke ingest zonder formulierinhoud of publieke leesroute |
| Website `functions/api/contact.js` | Bestaande Resend-route behouden; alleen na acceptatie een aanvraag-ID in mail/response en aparte meting. Meetfout mag geen verzendfout veroorzaken |
| Website `migrations/0001_analytics.sql` | Uitsluitend nieuwe aparte meetdatabase; nooit uitvoeren op CRM-`DB` |
| Website `metingen.html`, `docs/analytics.md` | Uitleg aan bezoekers en exacte ingebruikname/operationele grenzen |
| Website `scripts/build.mjs` | Alleen statische publieke assets; geen SQL, tests, serverbron of configuratie in `public/` |
| CRM `cloudflare/site-analytics.js` | Read-only SQL-rapport, bedrijfscontrole en apart databinding; bestaande loginmiddleware beschermt `/api/crm/website-analytics` |
| CRM `admin/analytics/website.js` | Rustig rapport binnen Analytics, 7/30/90 dagen, aanvullende diagnose dicht; annulering/revisieguard en foutstatus zonder verzonnen nullen |
| CRM `shared/site-conversion.js`, `shared/inquiries.js` | Exact aanvraag-ID uit herkende Spatlappen-formuliermail behouden bij gecontroleerd aanmaken van een nieuwe order. Geen mailactie of terugvulling van bestaande orders |

Het hoofdrapport toont paginabezoeken met toestemming, actieve tijd, ontvangen formulieren en gemeten bezoek→aanvraag. Apart: cohorten van ontvangen aanvragen met huidige CRM-koppeling, offerte en volledige betaling. Een WhatsApp-klik is geen aanvraag, een ontvangen aanvraag geen verkoop en een concept/offertefase geen bewijs van betaling. Afhaken heeft een onbekende reden tenzij iemand vrijwillig een vaste reden kiest.

De meetperiode is een rollend aantal etmalen, onafhankelijk van de financiële periodefilter. Paginabezoeken zijn geen unieke personen. Niet-geobserveerde bezoeken worden niet geschat. Bij weigering blijft de website werken en telt alleen een geaccepteerde formulieraanvraag zonder bezoeknummer. Gedrag bevat geen namen, mail, teksten, bestandsnamen, volledige URL’s, advertentie-ID’s, raw user-agents of IP-opslag.

## Ingebruikname uitgevoerd

De website is gepubliceerd met aparte D1-database en websitebinding `SITE_ANALYTICS_DB` plus `ANALYTICS_ENABLED=true`. Het Spatlappen-CRM leest dezelfde aparte database als `SITE_ANALYTICS_DB` met `WEBSITE_ANALYTICS_SITE=spatlappenopmaat.nl`. De bestaande `DB`, R2, geheimen, domeinen en mailkoppelingen blijven gelijk. Maatwerkkunststof krijgt nooit de Spatlappen-meetbinding.

Volledige toekomstige releasevolgorde, database-schema, behoud van secrets, uitschakelen, bewaartermijn, ontbrekende metingen en grenzen staan in de website-`docs/analytics.md`. De live-aansluiting is geverifieerd in work/site-release-20261017/verified-release.json en http-check.json. GitHub is niet gepusht: deze publicatie gebruikt gecontroleerde lokale snapshots via Pages CLI. Vóór een volgende Git-publicatie eerst de actuele bron synchroniseren en website-buildopdracht npm run build/output public instellen; oude Git-bron mag deze update niet vervangen. Er is geen nieuwe Google Analytics-login nodig voor deze route. De al aanwezige Cloudflare Web Analytics-beacon blijft afzonderlijk; historische cijfers daarvan zijn nog niet opgehaald of in dit CRM-rapport geïmporteerd.

## Werkelijk gecontroleerd

- Volledige `npm run check`, beide bedrijfsbuilds, inclusief nieuwe `tests/site-analytics.mjs` en beschermde rapportageroute in `tests/cloud-backend.mjs`: PASS. Definitieve log `work/analytics/check-delivery.log`.
- Website `npm test`: PASS met echte SQLite in geheugen en fictieve maildienst; privacyvelden, schema/ingest, retry, consent, feedback, retentie, succesvolle/mislukte mail, laat aankomend meetsnapshot, actieve/idle/achtergrondtijd, GPC, geblokkeerde browseropslag en intrekken.
- Website statische build én Pages Functions-compile: PASS. Geen deployment.
- Bronbehoud: productfoto’s, previewtool, titel, één H1, telefoonnummers/WhatsApp, formulier/upload en robots/sitemap intact. Server/tests/config niet in nieuwe public-output.
- Eigen browsertabs op afzonderlijke poorten 3024/3025/3026, alleen fictieve database/nep-provider. Weigeren→aanvraag werkt; toestaan→ongeldig e-mailadres→herstel→aanvraag werkt; vrijwillige feedback bevestigd en terug in rapport. Periodewisseling en foutdetails correct; geen consolefouten. Maat-profiel toont geen Spatlappen-cijfers. CRM op 390px zonder horizontale overflow. Mobiele override zat alleen op een eigen testtab; reset geprobeerd en die tab is na afloop gesloten.

Live gecontroleerd: beide deployments en exacte scripts, configuraties/bindings/secretnamen, beschermde rapportageroute (401 zonder login), ongeldige formulierproef zonder provider-call, toestemmingsvalidatie, één eigen browserbezoek ontvangen in de EU-meetdatabase en intrekken. De eerste gemeten bezoeker is dus onze technische controle, geen nieuwe klant. CRM-browser opent correct de login; geen ingelogde accountproef uitgevoerd. 155 CRM-recorddelen,26 bestandsverwijzingen,4 betaaljournalrijen,workspaceversie,bedrijfsidentiteit en providerinstellingen exact gelijk vóór/na. Private SQL-back-ups mode600/directory700. Onbekende websitepaden leveren de bestaande publieke HTML-terugval (200), geen servercode/SQL. Niet getest: echte mailaflevering, Gmail-acties of historische conversies. Geen echte klant- of betaalmutaties. Maat en V2 niet gepubliceerd.

## Technische bronnen

Voor het bestaande Cloudflare-beacon: [gegevensverzameling](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/). Voor de aparte database: [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [D1 prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) en [batch](https://developers.cloudflare.com/d1/worker-api/d1-database/). Voor toestemming en weigeren als zelfstandige keuzes: [Autoriteit Persoonsgegevens — heldere cookiebanners](https://autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/heldere-cookiebanners). Dit technische ontwerp is geen verklaring dat de volledige website/privacyadministratie juridisch is beoordeeld.

## Vervolg: sessies, keuzepercentages en dossierconversie — 19 oktober 2026

Gebruiker vraagt waar websitebron/GitHub staat en wil unieke gebruikers, cookieweigering en sessies tot conversie, plus een Conversie-tab bij klant/order. Actuele bron, meetbegrippen, beperkingen, bestaande attributiegaten en uitvoeringsvolgorde staan in [WEBSITE-CONVERSIEMETING.md](WEBSITE-CONVERSIEMETING.md). Alleen onderzocht/vastgelegd: geen sessie-/bezoeker-IDtracking of nieuwe tab/schema gebouwd. Website blijft aparte repo; GitHubdefaultbranch bevat bij gerichte bronread geen analytics.js, laatste publicaties via Cloudflare-snapshots. Geen broncodepush of publicatie in deze ronde.


## Maatwerkkunststof: tabtoegang — 20 oktober 2026, alleen lokaal

De bestaande UI beperkte Websitegebruik/Aanvragen/Google & SEO tot Spatlappen en stuurde Maat-routes terug naar Financiën. Beide beperkingen zijn in de bron verwijderd. De bestaande backendroutes gebruiken al het bedrijf uit de serveromgeving en de eigen database/binding; die zijn niet gewijzigd. Dit richt geen Maat-meetdatabase, website-script, Google-property of serviceaccount in. De afwezigheid van een koppeling wordt expliciet uitgelegd; alleen de bestaande eigen CRM-aanvragen worden afzonderlijk getoond. Geen productieconfig gelezen of gewijzigd, geen publicatie of tests uitgevoerd. Voor activering van websitegebruik eerst de echte Maat-websitebron en eigen meetinrichting bepalen; nooit de Spatlappen-binding hergebruiken als bron voor Maatcijfers.
