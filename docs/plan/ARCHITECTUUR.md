# Architectuur & mappen

Stand: 16 oktober 2026. Dit beschrijft de bestaande situatie én de afgesproken verbeterroute. Doelmappen hieronder bestaan pas wanneer een werkelijk onderdeel is overgezet.

## Het product dat we bouwen

Eén werkplek voor twee bedrijven: klant → aanvraag/order → product en calculatie → offerte/akkoord → inkoop/uitvoering → levering → factuur/betaling. Mail, documenten en volgende acties hangen aan het betreffende dossier. Er komt geen tweede klantenlijst of losstaande takenadministratie bij.

Spatlappen en Maatwerkkunststof gebruiken gedeelde code en een eigen bedrijfsprofiel, opslag en producttool. Een lijst, kaart en actieoverzicht zijn verschillende weergaven van dezelfde orders. De gebruiker moet overal kunnen herkennen: waar ben ik, wat ontbreekt, wat is mijn volgende actie en wat verandert er als ik bevestig?

## Bevindingen bij de bestaande structuur

- De scheiding tussen `admin`, `shared` en serverdiensten is bruikbaar. Die behouden we.
- `admin/app.js` bevat ongeveer 1.450 zeer lange regels met schermen, formulieren, routes en mutatiecoördinatie. Het aantal verantwoordelijkheden is het probleem; alleen regels afbreken of bestanden hernoemen lost dat niet op.
- Er bestaan al losse, geteste modules voor documenten, mail, voorraad, verkoopfunnel en calculator. Die zijn de voorbeelden voor verdere opsplitsing, geen reden om opnieuw te beginnen.
- `OVERDRACHT.md` is een groot historisch werklog geworden. Prioriteiten en architectuur verdienen een apart startpunt.
- Broncode, gegenereerde builds en tijdelijke onderzoeksbestanden staan naast elkaar. Hun rol moet duidelijk zijn; ze mogen niet ongemerkt dezelfde bron worden.
- V1 en V2 hebben bewust verschillende opslag-/vormcontracten. Een cosmetische samenvoeging zou opgeslagen vormen kunnen verliezen.

## Huidige vindplaatsen en eigenaarschap

| Map/bestand | Verantwoordelijkheid | Afspraak |
|---|---|---|
| `admin/app.js` | Opstarten, state en routes; nog veel bestaande schermen/formulieren | Geleidelijk kleiner maken, geen nieuwe grote werkstromen eraan plakken |
| `admin/customers/` | Werkelijke klantlijst en dossierweergave; gebruikt bestaande tab-, formulier- en dossierhelpers | Geen opslag of mutaties; adresweergave en formulieren worden later gericht uitgehaald |
| `shared/customer-workspace.js` | Read-only klantprojectie van bestaande orders, betalingen en werkvoorraad | Zelfde financiële projectie voor klantlijst en dossier; geen opgeslagen totalen/taken |
| `admin/workspace/` | Gedeelde menustructuur, werkplek en leesbaar ontwikkelplan | Eerste werkelijk afgesplitste map in deze structuurverbetering |
| `admin/document-*.js`, `admin/mail-*.js`, overige UI-modules | Browserweergave en bediening | Bestaande modules blijven op hun URL tot een gecontroleerde migratie |
| `admin/inquiries/` | Nieuwe controlewerkplek voor herkenning van gewone aanvraagmails | Gebruikt bestaande transacties en aanvraag-/mailopslag; geen eigen database |
| `shared/` | Pure regels en gegevenscontracten, zoals funnel, voorraad en herkomst | Geen DOM, credentials of provideracties toevoegen aan domeinregels |
| `shared/planning/` | Publiek ontwikkelplan zonder dossiergegevens | Geen uitvoerder, runtimeconfiguratie of CRM-opslag |
| `admin/cloud-storage.js` | Browserfacade naar opslag | Behoud transacties en versiecontroles; geen tweede opslaglaag in nieuwe features |
| `assistant/` | Lokale AI-, mail-, Gmail-, feedback- en spraakdiensten | Providergeheimen blijven op de server; voorstellen en echte acties onderscheiden |
| `cloudflare/`, `functions/` | Bestaande online API-/opslagroute | Niet gelijkstellen aan lokale browseropslag; geen deployment in lokaal werk |
| `tools/costing/` | Oorspronkelijke calculator en offertewerkplek | Beschermde V1, bestaande ingangen behouden |
| `tools/costing-v2/` | Vorm/CAD-calculator en expliciete CRM-overname | Aparte V2-records; nog buiten gewone releasebuild |
| `spatlap-preview.html` en bijbehorende assets | Spatlappen-producttool | Eigen productfunctie; dossierkoppeling via bestaande contracten |
| `document-service/`, `document-generator.py` | Documenttemplates en generatie | Bronbedragen uit dossier; output blijft gekoppeld aan bron/order |
| `scripts/`, `dev-server.py` | Starten, controleren, bouwen en releasegereedschap | Bouwen is geen publiceren; `release` voert wel deployment uit |
| `tests/` | Blijvende regressiecontroles met fictieve data | Belangrijke bewezen scenario’s hier; scratchfixtures later gericht overbrengen |
| `docs/` | Gebruiks-/onderwerpdocumentatie | Begin bij `docs/README.md`; oude links behouden |
| `docs/plan/` | Architectuur, roadmap, besluiten en automationontwerp | Werk dit bij als keuzes veranderen |
| `work/` | Tijdelijke logs, bronvergelijkingen en proefbestanden | Geen productcode of gegevensbron. Bestaande inhoud behouden; niets blind verwijderen |
| `dist/` | Gegenereerde bedrijfsbuilds | Niet met de hand aanpassen; opnieuw maken via buildscript |
| `.local/` | Privéconfiguratie en lokale runtime | Niet publiceren, niet indexeren in documentatie, niet opschonen |

Rootbestanden zoals publieke configuratie, starters, producttools en build-ingangen blijven voorlopig waar bestaande URL’s/scripts ze verwachten. Eerst afhankelijkheden vaststellen, dan pas verplaatsen. De klantlijst en dossierweergave zijn als eerste bestaand onderdeel echt naar admin/customers/views.js verplaatst. Formulieren, adresweergave en transacties blijven voorlopig in app.js.

## Gewenste indeling tijdens verdere opsplitsing

```text
admin/
  app.js                 opstarten en koppelen van onderdelen
  workspace/             werkelijk aanwezig: navigatie, plan, gedeelde werkplekstijl
  orders/                later: orderlijst, dossier, formulieren, acties
  customers/             aanwezig: views.js (klantlijst en dossier); formulieren volgen later
  purchases/             later: inkoop/zending en leveranciersdocumenten
  documents/             aanwezig: revision-editor.js; overige documentmodules later gericht uithalen
  mail/                  later: bestaande mailmodules samenbrengen
shared/
  planning/              werkelijk aanwezig: canonieke roadmap
  ...                    bestaande domeinregels; pas groeperen bij echte extractie
tests/
  ...                    bestaande scenario’s behouden; nieuwe tests bij onderdeel
docs/
  README.md              vaste leesroute
  plan/                  toekomstige richting en onderbouwde besluiten
```

Geen lege doelmappen, geen nieuw framework en geen algemene ‘utils’-vergaarbak. Een featuremap ontstaat wanneer haar scherm en logica daadwerkelijk worden uitgehaald. Houd kleine presentatiemodules leesbaar; voeg alleen een domeinmodule toe als er echte regels zijn.

## Gegevens en grenzen die gelijk moeten blijven

- Record-ID’s en hash-routes zijn bestaande verwijzingen. Een nieuwe weergave verandert ze niet.
- De opslagfacade bepaalt welke bedrijfsdatabase en transactiemodus actief zijn. Een UI-module krijgt die afhankelijkheid aangeboden en opent niet zelf een willekeurige database.
- Orderbedragen worden met de bestaande financiële helpers berekend. Onbekende kostprijs is onbekend. Leveranciersfactuur, transport, toeslagen en verkoopprijs mogen niet dubbel of stil worden overschreven.
- Productmaten volgen het bestaande domeincontract (in veel CRM-velden mm; de Spatlappen-tool gebruikt expliciete conversie naar cm). Geen eenheid aannemen op basis van een veldnaam.
- Calculator V2 bewaart geometrie in een version2-record. De V1-bridge weigert die bewust; de bedrijfs-toolroute opent dan V2. Eén calculatorstuk koppelt aan één productregel. Meer stukken worden niet stil over producten verdeeld.
- Een documentbestand, documentbundel en financieel bronrecord zijn verschillende dingen. Alleen een nieuwe PDF maken verandert geen akkoord, betaling of factuurkost.
- Indelingsvoorkeuren zijn browserpresentatie per bedrijf. Ze zijn geen CRM-records en veranderen geen ordergegevens.

## Een onderdeel veilig uithalen

1. Kies één afgebakende route/feature; begin bij Klanten. Noteer alle read/write-, event-, opslag- en globale afhankelijkheden.
2. Leg bestaand gedrag vast met fictieve dossiers: lege lijst, ontbrekende gegevens, bestaande records, bedrijf A/B en conflict tijdens opslaan.
3. Verplaats de werkelijke implementatie en importeer die uit `app.js`. Eén implementatie blijft leidend; geen kopie naast de oude laten bestaan.
4. Bied state lezen, transacties, navigatie en meldingen als expliciete afhankelijkheden aan. Pure regels blijven los van DOM en diensten.
5. Behoud URL’s, record-ID’s, rekenregels, drafts en transactiecontroles. Versieer gewijzigde browser-ingangen zodat oude modules niet gemengd laden.
6. Controleer gerichte scenario’s, `npm run check` en de echte UI voor beide bedrijven. Let op mobiel en doorgaan na een fout. Gebruik geen echte klantmutaties als testfixture.
7. Werk roadmap, besluiten en overdracht bij. De volgende extractie volgt pas als deze route zonder regressie werkt.

## Wat deze ronde bewust nog moet oplossen in vervolgstappen

Het grootste appbestand, de vlakke bestaande moduleverdeling en een aantal scratch-DOM-tests zijn nog niet gemigreerd. De eerste extractie, startdocumenten, menu en planning zijn nu concreet. V2-releaseverpakking, multiuserconflicten, leveranciersrechten en boekhoudkoppeling blijven afzonderlijke stappen met hun eigen acceptatiecriteria.

## Klantwerkplek — 16 oktober 2026

admin/customers/views.js bevat de echte klantlijst en dossierweergave. De app levert bestaande document-, adres-, provenance- en formulierhelpers; de module bewaart niets. shared/customer-workspace.js projecteert klantorders/betalingen en filtert de bestaande workQueue, met dezelfde rangorde. Geen tweede takenengine. admin/dossier-search.js gebruikt dezelfde financiële projectie, zodat ontbrekende prijzen ook bij lege aanvragen zichtbaar blijven. Overzicht is de nieuwe standaardtab; details/orders/addresses/documents/mail en hun handlers blijven bestaan. Adresweergave en klantmutaties zijn nog geen onderdeel van deze extractie.


## Mailaandacht en taakweergave — 16 oktober 2026

shared/mail-attention.js projecteert richting, wachttijd en aandacht uit geladen berichtdata. Geen DOM, providers, mail-/Gmailwrites of nieuwe opslag. shared/work-queue.js gebruikt die projectie per bestaand ordergesprek, met de bestaande funnel en acties; er wordt geen tweede taak aangemaakt. admin/workspace/task-list.js bevat nu de echte read-only takenweergave; sales-funnel.js houdt actiecoördinatie en bestaande guards. Mailworkspace houdt sessiecache/filter/sortering en de bestaande antwoordconcepten. Gedeelde gewijzigde imports zijn geversioneerd om een nieuwe UI met oude taakmetadata uit browsercache te voorkomen.


## Spatlappen-publicatie — 16 oktober 2026

Spatlappen is als enige installatie bijgewerkt in het bestaande Pages-project. D1/R2 blijven dezelfde; migratie0003 registreert alleen bedrijfsidentiteit. scripts/pages-staging.mjs assembleert de publieke build en Functions-bron rond een standaard wrangler.jsonc, omdat Pages geen eigen --config-pad accepteert. De oorspronkelijke bronconfig blijft intact. tests/pages-staging.mjs bewaakt die grens. Zie [publicatie en herstel](../PUBLICEREN-SPATLAPPEN.md). Bestaande tikkie:<paymentToken>-referenties blijven metadata voor deduplicatie, onderscheiden van interne CRM-IDs (tests/payment-reference.mjs).


## Dagelijkse calculatorinvoer — 16 oktober 2026

V2 houdt dezelfde rekenkern en opslagcontracten. assets/quote-calculator.js bouwt open stuk-/leverancierskaarten met een gesloten onderdeel voor bijzondere vormen en overige variabelen; nesting volgt na leveranciers. shared/companies.js kiest V2 uitsluitend als standaard voor lokale Maatwerkkunststof-productroutes; de gewone cloudroute blijft V1. admin/order-costing.js presenteert één hoofdlink en een secundaire V1-route. crm-order-domain.js leest productgegevens met bekende aanvraagwaarden als aanvulling bij één product. Een bestaande costCalculation krijgt voorrang en blijft exact behouden. Openen verandert geen CRM-record; saveOrderCalculation behoudt de bestaande transactie, snapshot- en financiële controles.


## Zoeken, documentrevisies en vervolgcontroles — 17 oktober 2026

admin/search/workspace-search.js verzorgt het eigen zoekvenster; shared/workspace-search.js bouwt uitsluitend uit toegestane opgeslagen velden een tijdelijke index. Geen tweede database, providerzoekopdracht, querytelemetrie of toolpayload-index. App.js coördineert bestaande routes en richt de focus op het document/de betaling. De mailwerkplek heeft een savedOnly-ingang voor zoekresultaten; geen Gmail-ophaalactie bij doorklikken.

admin/documents/revision-editor.js is werkelijk afgesplitst. shared/document-revisions.js bewaakt nummer/reeks, laatste versie, bedrijfsgrens en de vastgelegde bron. Opslaan gebruikt de bestaande state+files-transactie met nieuwe PDF/Word-ID’s. Oude bestanden en verwijzingen blijven exact behouden. De bibliotheek groepeert revisies; alle dossier-/klanttellers gebruiken dezelfde projectie. Geen schema- of nummerreeksmigratie.

shared/order-readiness.js projecteert ontbrekende werkstappen uit dezelfde funnel, documenten, betalingen en inkoop. shared/work-queue.js en admin/sales-funnel.js gebruiken dezelfde volgende actie. Geen taakopslag of automatische fysieke voortgang. shared/document-mail-context.js levert veilige antwoordkandidaten; de composer beheert de bewuste keuze en ontkoppelt bij ontvanger-/onderwerpwijziging. De bestaande mailservice en aparte verzendbevestiging blijven leidend.


## Website-metingen — aparte opslaggrens

De publieke website is een eigen bestaande repository; de actuele lokale checkout staat beschreven in docs/WEBSITE-METINGEN.md. Gedragsingest en serverbevestigde aanvraagmetingen horen bij die website, nooit in crm_records of de CRM-werkruimte. Een aparte SITE_ANALYTICS_DB-binding bevat uitsluitend vaste meetvelden en willekeurige IDs. Het CRM leest via cloudflare/site-analytics.js achter de bestaande login; admin/analytics/website.js presenteert de cijfers. shared/site-conversion.js en de bestaande gecontroleerde intake houden alleen het exacte aanvraagnummer vast voor het cohort. Bestaande klant-/ordertransacties en financiële helpers blijven leidend. Publicatie en bindings zijn nog niet uitgevoerd.

## Offline werkplek — 17 oktober 2026

`admin/offline/` bevat een zelfstandig formulierwerkvlak, clientcoördinator, atomair IndexedDB/CAS-store en serviceworkertemplate. `shared/offline-state.js` projecteert alleen allowlisted klant-/basisordervelden en voegt expliciete veldwijzigingen samen op een vers volledig serverdossier. Bestaande orderproducten/status/bedragen blijven readonly. Geen mailpayloads/credentials/bestanden in de projectie; geen generieke offline CloudDatabase-shadow. De gewone opslagfacade houdt haar centrale bevestigingscontract.

`build-pages.mjs` genereert zeven exacte codehashes en een eigen cacheversie. Werkplekcode is publiek maar bevat geen gebruikersdata. Grants en zakelijke snapshots blijven achter bestaande login/bedrijfsregistratie. De beschermde `offline-grant` is een 24u lokale toegangstermijn; `commit-status` controleert onzekere bestaande commit-ID’s, zonder nieuwe DB-tabellen. Sync gebruikt bestaande CAS/idempotente commits met uitsluitend state/main; geen migratie, R2write of providerqueue. Offline IndexedDB heeft eigen schema/versie, gescheiden van de localhostdatabase. Zie OFFLINE-WERKEN.md; fysieke browseropslag en offline intrekking hebben expliciete grenzen.

## Gewenste offline route en landen — 17 oktober 2026

De beperkte afzonderlijke offline werkplek is gebouwd maar voldoet niet aan de nieuwste wens: dezelfde CRM-opmaak, bestaande dossiers en Spatlappen-preview zonder wifi. Geen aparte native desktopapp starten. Eerst een PWA-haalbaarheidsproef plannen, met versie-/conflictcontrole en gecontroleerde bestandssynchronisatie. Bestaande online transacties niet veranderen als bijeffect van planning.

Internationale uitbreiding: voorkeur voor markt/taal/leverland/factuurland/verzendroute binnen dezelfde bedrijfsadministratie. Rechtspersoon/boekhoudadministratie is een andere grens dan een taaldomein. Nieuwe voorraad-/deelleveringsmodellen pas na apart gegevensontwerp en migratieproef. Zie ADVIES-2026-10-17.md en canonieke roadmap voor alle wensen en grenzen.

## Offline bekijken met een aparte feedback-outbox — 17 oktober 2026

admin/offline/review.js coördineert expliciete voorbereiding en toegang; review-store.js bewaart één eigenaar-/bedrijfsgebonden snapshot, concept en append-only feedback-outbox in crm-offline-review-v1. Geen API-responses in Cache Storage: de serviceworker bewaart uitsluitend gehashte code-assets. De bestaande CloudTransaction kan in expliciete offline=review-modus alleen uit deze kopie lezen; writes worden vóór callbacks/netwerk geweigerd. Startupmigraties en cloudrefresh worden daar overgeslagen. Een workercontrole op de client-URL blokkeert overige API/providerrequests vanuit reviewtabs; alleen de online offline-grant-controle blijft toegestaan.

Feedback overzetten gebeurt online via de bestaande CloudDatabase/CAS, met stabiele melding-ID, actuele inhoudsvergelijking binnen dezelfde transactie en lokale verwijdering pas na bevestiging. Verloren bevestigingen worden gecontroleerd voordat opnieuw wordt geschreven. Geen algemene synchronisatie van de volledige snapshot. Beperkte oudere klantinvoer blijft in een andere database intact.


## Concrete formulierverbeteringen — 17 oktober 2026

Nieuwe UI-onderdelen staan in `admin/products/specifications.js` en `sample-order.js`; pure publieke specificatieprojectie, kalenderdatumcontrole, open-batchselectie en decimaalconversie staan in respectievelijk `shared/product-specifications.js`, `sample-order.js`, `purchase-default.js` en `decimal-input.js`. De werkvoorraad projecteert teststukopvolging uit dezelfde order. Geen aparte taken-, prijs- of klantdatabase. `admin/app.js` houdt de bestaande transactiecoördinatie; de voorgestelde batch wordt opnieuw gecontroleerd op de meest recente state.

`admin/decimal-fields.js` sluit via bestaande formulierhulp aan op decimale velden. FormData normaliseert voor bestaande verbruikers en behoudt herhaalde productveldnamen. De zichtbare invoer blijft Nederlands; ongeldige invoer blijft staan. State-validatie controleert eerst records/productregels, daarna hun aanvullende velden, zodat ongeldige records gecontroleerd als 400 worden geweigerd.

`admin/branding.js` kiest alleen een icoon uit het bestaande bedrijfsprofiel. Build en login volgen hetzelfde profiel; de offline codebundel neemt het icoon mee. Alleen de twee exacte SVG-paden zijn publiek naast de bestaande login/offlinecode. Geen bedrijfsdata, API of algemene iconenmap openbaar. De lokale volledige bron bevat ook afzonderlijk onvoltooid analyticswerk; een release moet dat expliciet uitsluiten totdat het getoetst is.

## Leverafspraken en inbound-controle — 17 oktober 2026

`shared/inbound-readiness.js` projecteert Spatlappen-leverhiaten en bewaakt de gesloten `order.fulfilmentMethod`-keuze. `orderReadiness` gebruikt deze projectie bij naderende levering, waardoor werkvoorraad, klantdossier en order dezelfde lijst/actie gebruiken. Nieuwe orderbediening staat in `admin/orders/fulfilment.js`; de afspraak wordt atomair met alleen een controle op de oorspronkelijke leverwijze bijgewerkt via de bestaande opslagfacade. Geen migratie van bestaande adressen, financiële data of fases; ontbrekende leverwijze blijft onbekend. De bestaande build neemt de nieuwe admin/shared-modules automatisch in de offline codebundel mee.


## Interactieve bouwtaken — 17 oktober 2026

De read-only planning is op gebruikersverzoek een werkroute geworden: catalogus blijft shared/planning/roadmap.js; runtime-status en bouwlog in aparte planning-records. admin/workspace/development-plan.js verzorgt de rustige lijst en formuliercoördinatie, build-task-store.js leest/mergeert via bestaande databasefacade. shared/planning/progress.js valideert bedrijf, taakversie, event-ID en status/publicatie; geen DOM of providers.

Lokaal aparte IndexedDB `<browserDb>-planning`; cloud generieke D1 crm_records/store=planning met bestaande globale CAS/idempotente commits en login/Origin-beveiliging, geen schemawijziging. Niet in customer/order/state geschreven, niet door session-undo teruggedraaid. Back-up/migratie bevatten optionele planning-records; een oude back-up zonder veld behoudt huidig bouwlog. readBrowserPackage kiest nadrukkelijk browser-planning ook wanneer migratie vanuit een cloudpagina gestart wordt. Offline-review snapshot blijft state/reports; bouwlogbewerking daar uit. Historie in de UI is aanvullend; dit is geen geverifieerd onveranderbaar auditregister. Docs/BOUWTAKEN beschrijft de bouwerwerkwijze en omgevingsgrens.

## HTML-mailhandtekening — 17 oktober 2026

`shared/mail-signature.js` normaliseert uploads naar een beperkte email-HTML-allowlist en bouwt dezelfde HTML-/tekstversie voor preview en mailengine. `shared/mail-service.js` bewaart `signatureHtml` in de bestaande privéconfig per bedrijf; oude clients die het veld niet meesturen behouden de opgeslagen waarde. Leeg is expliciet verwijderen. HTML gaat naar SMTP2GO `html_body`, tekstfallback blijft `text_body`; de bestaande payloadfingerprint bevat beide en behoudt verzenddeduplicatie. Preview geeft de verwachte HTML-instelling mee zodat tussentijdse wijzigingen blokkeren. HTML wordt opnieuw op de server genormaliseerd; scripts/actieve inhoud en onbruikbare lokale/CID-afbeeldingen komen niet in de mail. Browserpreview heeft sandbox en beperkende CSP. Cloudconfig-requestlimiet begrensd verhoogd voor het max100k HTML-veld; geen providers of accounts geactiveerd.

## Werkronde 18 oktober: samenhangende dossieruitbreidingen

Nieuwe browserbediening staat per onderdeel in `admin/purchases/`, `admin/orders/`, `admin/customers/`, `admin/products/` en `admin/documents/`. Regels staan in `shared/purchase-workflow.js`, `arrival-mail.js`, `batch-packing.js`, `batch-economics.js`, `payment-corrections.js`, `production-release.js`, `customer-number-settings.js`, `product-primary-image.js`, `named-costs.js`, `invoice-payments.js` en `financial-chart.js`. `app.js` blijft de coördinator van de bestaande transacties en renderfuncties.

Batchlinkchecks lezen verse state bij order/batchbewerking en AI-import; leveranciersregels beschermen bestaande bronkoppelingen. Batcharchief is een vlag en expliciete datum, geen verwijdering. Bestandslabels gebruiken bestaande documentopslag. Bestaande leveranciersdocument-opslag vergelijkt haar oorspronkelijke snapshot vóór schrijven.

`paymentCorrections` in de bestaande bedrijfsstate bewaart de oorspronkelijke ontvangst, correctiereden, soort en tijd. Uit saldo halen verplaatst de registratie naar dit log; herstel voegt dezelfde oorspronkelijke ID terug en markeert herstel. Tikkie-import vergelijkt ook actieve verwijdercorrecties. Geen provider-/journaalverwijdering. De volledige state/back-up bewaart dit log; het is een praktisch correctielog, geen onveranderbaar extern auditregister.

`productionDepositPercent` en `productionReleasedDate` zijn expliciete orderafspraken. De gedeelde funnel kent nu een afzonderlijke released-fase. Readiness, werkvoorraad en order volgen dezelfde voorwaarden. Een vrijgave is geen betaling of fysieke boeking. De bestaande afzonderlijke productiestart kan na een nog geldige expliciete vrijgave worden geregistreerd; de oudere volledige-betaling/factuurroute blijft intact.

`namedCosts` op order/batch bevat stabiele kostenregel-ID, label, centenbedrag of null en optioneel product-ID. De bestaande economics/purchaseInfo/allocatedCost-projecties rekenen ze éénmaal mee; er is geen tweede financiële opslag. Een product met een gekoppelde kostenregel kan niet ongemerkt uit de order verdwijnen. Scenario’s zijn alleen tijdelijke berekeningen op deze projectie. Vaste kosten blijven apart.

`primaryImageId` verwijst uitsluitend naar een eigen productafbeelding. Goedkeuring en bewerkbare ontwerpbestanden behouden hun bestaande velden. Verwijderen ruimt de pointer op; een vervangen niet-goedgekeurd ontwerpvoorbeeld krijgt een geldige nieuwe pointer. Klantnummerinstellingen gebruiken de bestaande teller, zonder interne IDs of oude documentsnapshots te veranderen.

Een nieuw factuurpayload bevat optionele selectedPayments-snapshots; alleen de bewust gekozen datum/bedrag/referentie wordt aan de klanttoelichting toegevoegd. De betaaldstempel blijft de werkelijke totale ontvangst volgen. Orderdocumentconcepten bewaren de oorspronkelijke vrije toelichting, zodat een volgende factuur de selectie niet dubbel toevoegt. Oude documenten worden niet herschreven.

De eigen financiële grafiek gebruikt een gesloten lijst dimensies/eenheden en opent een expliciete order-ID-selectie in de bestaande dossierzoeker. Nieuwe/archief/onvolledige aanvragen blijven herkenbaar. De Spatlappen-importqueue wordt bij Maatwerkkunststof niet aangeroepen: die dienst is daar niet ingericht, en er wordt geen fouttoast of cross-company import gestart.

## Eerste uitvoering — 18 oktober 2026

Lokaal gebouwd: feedback met bestaande bedrijfsopslag; 10%-formaatknoppen; kader-/groepsselectie en samen verplaatsen; rode tijdelijke snaplijnen met onafhankelijke toggles/Alt; expliciete plaatsingsreferentie en gelijke witruimte; passende nieuwe import onderaan. SVG-grenzen via gerenderde alpha tot2048pixels, conservatieve pixelmarge; geometrie blijft vector. Nieuwe SVG’s bijgesneden, bestaande alleen via expliciete actie met behoud fysieke tekening. Geen achtergrondmeting/verzameling voor leren.

Open: uitgebreide verdeelacties voor meerdere objecten, precieze cm-bediening verder vereenvoudigen, bijzondere SVG’s/masks/filters en extreem kleine details testen, plaatsingsvoorkeuren/leren. Extra imports verspringen maar er is nog geen overlapoplosser. Bestaande artwork/PDF-routes behouden; geen nieuwe druk-PDF fysiek geproduceerd.

Bron: shared/spatlap-layout.js pure geometrie (klassiek script voor preview), spatlap-preview.html DOM/bediening. admin/feedback.js optionele launcherHost/contextOverride; CRM-defaults gelijk. Nieuwe regressie tests/spatlap-layout.mjs inclusief inline-syntax; bestaande feedbacktest en volledige npmruncheck/beidebuilds geslaagd. Laatste kleine CSS/feedback-picker-/Escape-/links-rechtsaanpassingen daarna gericht gecontroleerd met syntax/geometrie/feedbacktest en beide builds.

## Kleur en zelfstandig pipet bij de selectie — 18 oktober 2026

Kleur en Pipet staan direct bij Kleiner/Groter. Kleur opent eigen dialoog met stalen/HEX/RGB, onafhankelijk van het native browserkleurvenster. Geen wijziging tot Kleur toepassen. Voor hele vectorlogo’s wordt expliciet eenkleurig herkleuren benoemd, transparantie blijft; gemengde vector-/tekstgroep één undo. Los vectoronderdeel heeft Vulling/Lijn-keuze; andere onderdelen blijven behouden. Rasterdoelen eerst vectoriseren, niet ongemerkt rastertinten aanpassen.

Pipet samplet de bestaande artworkcanvas op maximaal2048px grootste zijde, inclusief flapachtergrond. Klik op preview neemt de kleur direct over, Esc annuleert; geen schermopname/OSpipet/provider nodig. Daarom bruikbaar waar EyeDropperAPI ontbreekt. Alleen kleuren binnen het ontwerp, niet van andere apps of buiten de browser. Antialiasing/transparante overlappingen geven de samengestelde zichtbare pixelkleur. Async selectie-/volledige-ontwerpsignatuur voorkomt toepassen op intussen veranderd ontwerp. Fout/taintedcanvas meldt fallback naar HEX/RGB.

Nieuwe bediening admin/designs/selection-color.js, kleurvalidatie/mapping shared/design-colors.js. Bestaande vectorrecolour/serialize en draw-artwork als bronnen; schermoverlays nooit artwork. Bestaande native zijbalkkleuren blijven beschikbaar; zelfstandige onderbalk biedt consistente bediening.

## Bewaren en export via sneltoetsen, aantal optioneel — 18 oktober 2026

⌘⇧S activeert Bewaar, ⌘⇧E Klantpreview-PNG, ⌘⇧T Drukbestand-vector-PDF; ook Ctrl+Shift. De bestaande acties blijven leidend. Tooltips/aria-keyshortcuts en vraagtekenhulp bijgewerkt. Capturehandler voorkomt dubbele browseractie als het event de pagina bereikt; repeat/dialogen/inert/pipet geblokkeerd, actieve invoer blur vóór actie. Browsers kunnen gereserveerde combinaties afvangen; downloadknoppen blijven beschikbaar.

Ontwerpaantal mag leeg: designMeasurements geeft quantity:null, nooit0/1. Productontwerp bewaren laat dan het bestaande orderaantal staan, inclusief leveranciershoeveelheden; expliciete geldige aantallen volgen de bestaande wijzigings-/factuurguards. Artwork/PNG zonder aantal, opgeslagen ontwerp houdt lege qty; bij heropenen bestaand leeg productontwerp niet opnieuw met orderaantal vullen. Bestaande versie-/productsignature en opslagtransactie behouden.

## Directe feedback op handelingen — 18 oktober 2026

Na klikken op bewaren/exporteren/laden/importeren direct zichtbare bezigmelding met spinner en waar passend gewijzigde, tijdelijk geblokkeerde knop. Vaste melding onderaan het scherm (ook mobiel), niet alleen een statusregel onder in de pagina. Succes blijft6,5seconden, fouten blijven tot sluiten/nieuwe poging. Succes volgt echte opslag/generatie; een downloadmelding betekent download gestart/klaargezet, geen bewijs dat browser een bestand op schijf heeft geschreven.

Gedeelde actieregistratie voor init/openen, Bewaar, PNG, drukbestandPDF/kleurinfoPDF/zwartPDF/SVG, logo-import/vervangen/vectoriseren/vectorranden. Gedeeltelijk geslaagde import benoemt zowel toevoegingen als fouten; geannuleerd is geen succes. Referentietelling van gedeelde knoppen voorkomt te vroeg vrijgeven. Bij bewaren alleen werkgebied inert; statusmelding blijft erbuiten zichtbaar en toegankelijk. Sneltoetsen blokkeren ook tijdens inert werkgebied. Geen financiële/opslaginhoud verandert door deze UI-feedback.

Nieuwe gebruikersafspraak blijft leidend: geen eigen tests, builds of browser-QA uitgevoerd. Philippe controleert de werking.

## Spatlap-editor opgesplitst — 18 oktober 2026

spatlap-preview.html is nu schermstructuur (ongeveer700regels); styling, laadscherm,163functies en eventinitialisatie staan in admin/designs/editor/. Vindkaart/laadcontract in admin/designs/editor/README.md. Functiegroepen voor vectorbewerking, selectie/controls, import/vectoriseren, tekst/objecten, render/layout, export en opslag/integratie. runtime initialiseert bestaande globale status en handlers in behouden volgorde; bootstrap sluit bestaande ES-modules aan. Dit is bewust nog gedeelde state, geen claim van volledige module-isolatie. Bestaande data/URL/API blijven leidend. Geen publicatie of tests bij deze refactor.

## CRM-featureopsplitsing — 18 oktober 2026

133functies uit admin/app.js naar11featurebestanden verplaatst: documentgeneratie/bibliotheek, klantdossier, orderwerkplek/planning/adressen, productafbeeldingen, inkoop, mailcomposer, AI-import en analytics. app.js houdt samenstelling/routes/shell/centrale state/opslag en eventroutering. Omvang van333kBnaar113kB,1574naar circa932regels. Featurefactories krijgen expliciete live getters/setters; geen eigen state en geen imports terug naar app.js. Afhankelijkheden zijn nog deels breed, dus geen claim van volledige domeinontkoppeling. Contract en vindkaart in admin/workspace/ARCHITECTURE.md.

Twaalf bestaande losse implementaties naar passende submappen verplaatst, oude paden als exportdoorverwijzing behouden. Canonieke imports/dynamische imports relatief aangepast. Geen tests/build/browser-QA of publicatie uitgevoerd; beide bedrijfsprofielen delen dezelfde verandering.

## Pakbonbundel per bestelling — 19 oktober 2026

shared/batch-packing-review.js projecteert orders/klanten/leverhiaten/documentreeksen en bronbasis inclusief betalingen. De bestaande batch-packing.js voor werkvoorraad blijft behouden. admin/purchases/packing.js doet de expliciete selectiereview, sequentiële conversie via bestaande dienst en gezamenlijke state/files-transactie met verse bron-/nummercontrole. PDF+Word per nieuwe pakbon, geen omzet-/voorraad-/fasewijziging. Tijdelijke printbundel via admin/documents/merge-pdfs.js en lokaal gehoste MIT pdf-lib1.17.1, geen externe PDF-data-uitwisseling bij samenvoegen. shared/document-address.js deelt bestaande adresopsplitsing; oude generation-export behouden. Alleen lokaal, niet getest/gepubliceerd; zie PAKBONNEN-PER-BESTELLING.md.

## Instellingen/Overzicht en centrale stijl — 19 oktober 2026

workspace/overview-settings.js bevat de twee paginabouwers, section-tabs.js hun gedeelde bediening. Bestaande gegevens, mail-/Gmail-/template-/back-upfuncties en live appContext leidend. Hashwisseling binnen gemounte pagina houdt formuliernodes/handlers en status intact. Geen opslag door navigatie. Gedeelde CSS voor werkplek/search/analytics nu in admin/style.css, de enige stylesheet van de hoofd-CRM-ingang; oude feature-CSSpaden blijven als lege compatibiliteitsbestanden. Palette-/interactiestaten centraal, geen nieuwe inline presentatie. Alleen lokale bronwijziging, niet getest/gepubliceerd.

## Factuur-betaalstand — 21 oktober 2026

shared/invoice-payment-status.js leest alleen bewaarde gegenereerde factuurpayload, admin/documents/invoice-status.js presenteert deze in library-workspace. Converterstempel in document-generator.py uit dezelfde volledige ontvangst/totaal-basis; bestaande templateopmaak via gerichte XML-aanpassing van alleen stempelcel. Geen actuele orderbetalingen terugprojecteren op oude documenten. Geen nummer-/boekingsmigratie. Zie ../FACTUUR-BETAALSTAND.md. Lokaal gebouwd, geen tests/renderproef/publicatie, Philippe controleert zelf.

## Orderkaart en routeschets — 21 oktober 2026

shared/order-map.js projecteert bestaande fysieke order/batchfeiten en maakt uitsluitend Maps-links. admin/orders/map-workspace.js bezit kaartfilters/rows, map-route.js uitsluitend tabbladwerkversie en klikcontrole. Analytics houdt compatibele renderOrderMap-delegatie; geen tweede businessstate. Bestaande delivery-map.js blijft lokale kaart zonder geocoding. Leveringlink via #order-map/<id>, geen aparte database/plannerprovider. Geen status-/kosten-/voorraadmutatie of automatische optimale route. Zie ../ORDERKAART-EN-BEZORGROUTE.md; gebruikercontrole open, geen tests/publicatie.
