> Restpunten29oktober: bevestigde feedbackstatus direct tonen vóór lijstverversing; mobiel cursorregel/scrollvak met invoerbehoud; directe factuurrevisie van aantallen/bedragen met som en bevestiging; fontvoorbeelden op zichtbaarheid en begrensde meetcache; Kopie openen bij browser-/redrawfout; relatieve SVG-clips op één vorm. Zie docs/FEEDBACK29-RESTPUNTEN.md (projectroot). Alleen lokaal, zeven meldingen gedeeltelijk en eigen controle open. Geen tests/checks/build/browsercontrole/publicatie/migratie of zakelijke data-/bestandsmutatie.

> Batch5vervolg29oktober: gedeeld opruimplan met variant-/revisie-/bestand-/omvanglijst en behoudredenen, actuele besteldatum/klant/referentiebasis; cloudallealiassen-/recordreferentie-/revisie-/pagina-/claimbewaking. SVG éénkleurig over groepsgrenzen en vaste eenvoudige vectoruitsnedes, oorspronkelijke coördinaten/laagvolgorde/undo en begrensde bronbewaking. Zie docs/FEEDBACK29-BATCH5-VERVOLG.md (projectroot). Alleen lokaal bronwerk; meldingen24/35/41gedeeltelijk. Geen tests/checks/build/browsercontrole/publicatie/migratie of echte bestandsverwijdering; eigen controle open.

> Batch4vervolg29oktober: bewaren/newvariant met dezelfde maatbasis, invoerbehoud bij annuleren/fout en oorspronkelijke klantbewaking; voorraad-/leveranciersaantallen en oude calculatie bewaken. Zoomgebaren gebundeld, grenzen zichtbaar, maatfout bij veld behouden, verticale stappen0,1cm/Shift1cm. Fontvergelijking per frame met hergebruikte loads en apart hoofdlettervoorbeeld; Kopie openen met zichtbare bewaarde link. Zie docs/FEEDBACK29-BATCH4-VERVOLG.md (projectroot). Lokaal bronwerk, geen tests/checks/build/browsercontrole/prestatiemeting/publicatie; meldingen32/34/42gedeeltelijk en eigen controle open.

> Batch3vervolg29oktober: aanbetalingsdoel minus al ontvangen als voorstel bij ontvangst/link,50%-basis behouden, geldige volledige betaalbasis voor vrijgave. Automatische bevestiging/link alleen bruikbaar bij passende basis/status/datum. Factuurrevisie met bewuste actuele ontvangstselectie/betaalstand, losse eigen notitie,500tekengrens, PDF/Word-keuze en ontvangst-/btw-/CASbewaking. Factuur aanwezig vraagt geen verplichte mailstap; correctiedatum uiterlijk vandaag. Zie docs/FEEDBACK29-BATCH3-VERVOLG.md (projectroot). Alleen lokaal; geen tests/checks/build/browsercontrole/providerproef/publicatie. Meldingen11/62gedeeltelijk, eigen controle open.

> Batch2vervolg29oktober: gekozen ordercontact consistent tonen/bewerken onder contact-/orderbasisbewaking, factuurmail direct, planningwaarschuwingen en ontbrekende aanvraaggegevens zichtbaar, aanvraagdatum apart van akkoord. Feedback zoeken op volledige ID plus onafhankelijke bouwstatus/batch, selectie-export, stabiele filters en bewaakte statusopslag/foutweergave. Nieuwe nummerstandaard zonder voorloopnullen alleen zonder opgeslagen voorkeur. Zie docs/FEEDBACK29-BATCH2-VERVOLG.md (projectroot). Lokaal bronwerk; geen tests/checks/build/browsercontrole/publicatie. Melding3 gedeeltelijk, gebruikerscontrole open.

> Batch1vervolg29oktober: gedeelde guard voor betaalstaat/aankomstmail, zoeken/filterterugkeer, expliciet nul/overbetaling/onbekend en gemengde-orderuitleg; onbekende artikelposten zichtbaar. Nieuwe optionele importVatIncludedInSupplierPayments voorkomt dubbel getelde betaalde btw; beide AI-/save-/back-uproutes aangesloten, gedeeltelijk AI-transportvoorstel pas volledig bij opslaan valideren. Zie docs/FEEDBACK29-BATCH1-VERVOLG.md (projectroot). Alleen lokaal bronwerk; geen tests/checks/build/browsercontrole/publicatie, eigen controle/Google-activering open.

# Vijf feedbackbatches — 29 oktober 2026

De aangeleverde export bevat73meldingen. Eerst vergeleken met de huidige bron, productdocumentatie en historische publicatie; geen opdracht afgeleid uit automatisch verzamelde context of klantinhoud. Volledige Melding-IDs, bronopmerkingen en de matrix staan uitsluitend in de vaste privéfeedbackmap en de privéuitvoer voor Philippe. Broncode bevat generieke bouwstatussen, geen hardcoded klantcontext of Melding-IDs.

Import via bestaande feedback-CLI:25ontbrekende meldingen toegevoegd,78totaal inclusief5eerder aanwezige extra meldingen. Geen eerdere gebruikersafhandeling of opmerkingen overschreven. Per alle73aangeleverde IDs: batch, gebouwd/gedeeltelijk/nog-te-doen, lokaal/live/live-basis-met-lokaal-vervolg, bronbevinding en resterend werk. Nieuwe CLI-workadministratie wijzigt alleen development, nooit Open/Afgehandeld. Live is gebaseerd op de vastgelegde release crm-documenttemplates-20261028, niet opnieuw online gecontroleerd.

## Batch1 — Zending, klantbetalingen en artikelkosten

Klantbetalingen & levering-tab met bekend/ontbrekend bedrag en mailvoorbereiding; volledige artikelkostencategorieën sluiten in centen aan op ordermarge. Bestaande lokale invoer-btw, twee AI-routes en inbegrepen transport behouden. Google Routes bestond al; sleutel/activering en eigen controle open.

Bronnen: `admin/purchases/customer-payments.js`, `admin/orders/article-costs.js`, `shared/money-allocation.js`.

## Batch2 — Orderwerkplek, directe acties en feedbackvoortgang

Adaptieve drie feiten, producten/prijzen voorop, directe producteditor, ruimere korte dossierkolom met contact/bestemming/mail-/betaalouderdom. Singletonactiemenu’s direct, documentcategorieacties zichtbaar. Feedback volledige ID en aparte bouwstatus/export; busy/foutafhandeling bij Afgehandeld. Oorspronkelijke gebruikersfout niet zonder gebruikersproef bewezen opgelost.

Bronnen: `admin/orders/overview.js`, `admin/orders/key-facts.js`, `admin/orders/planning.js`, `admin/feedback.js`, `shared/feedback-development.js`.

## Batch3 — Aanbetaling, fases en facturen

Standaard50%-productievrijgave en bevestiging/linkfase bestonden. Aanbetalingsvoorstel volgt expliciete afspraak, anders50%. Ontvangstselectie op factuur zichtbaar. Nieuwste gegenereerde niet-geboekte factuur als versie bewerken met behoud van bestanden/nummer; btw-bron kiest nieuwste versie per serie en onafhankelijke conflicten blijven blokkeren. Geen fictieve versturing bij bestaande factuur.

Bronnen: `admin/orders/payment-entry.js`, `shared/payment-deposit-suggestion.js`, `shared/document-revisions.js`, `shared/vat-ledger.js`, `admin/documents/revision-editor.js`.

## Batch4 — Editorbediening en maat synchroniseren

3200%-zoom met bestaande ankers, verticale plus/min rechts naast maat, leesbare orderteruglink. Maat/aantal uit ontwerp na expliciete bevestiging in dezelfde transactie naar order; variant-/klantbasis en leveranciershoeveelheden blijven bewaakt, definitieve ontwerpkeuze vervalt. Andere ontwerpen/bestanden blijven staan.

Bronnen: `admin/product-designs.js`, `admin/designs/editor/storage-and-integration.js`, `admin/designs/editor/selection-and-controls.js`, `admin/designs/editor/editor.css`.

## Batch5 — SVG-segmenten en aantoonbare opslagopruiming

Paper.js-segmentatie bestond; globale grens512onderdelen en correcte overslaanmelding toegevoegd. Cloudopruimbron met tombstonewachtrij, CAS-guard tegen opnieuw koppelen, aparte bevestigde fysieke R2-delete en herstelbare retry. Vereist nieuwe migratie/publicatie, niet uitgevoerd. Historisch niet-geregistreerde orphanbytes en onbeperkte SVG-effecten open.

Bronnen: `admin/designs/editor/vector-islands.js`, `cloudflare/design-file-retirement.js`, `admin/products/design-storage.js`, `migrations/0006_design_file_retirements.sql`.

## Belangrijke grenzen

- Nieuwe code blijft lokaal. Bestaande invoer-btw-wijzigingen behouden. Geen klant-/order-/ontwerp-/betaalgegevens of bestanden gewijzigd, geen echte mails/providerproeven, herstarts, GitHubupload of livepublicatie.
- Geen tests, syntaxchecks, checks, builds, browser-/DOM-/conversie-/visuele QA. Alleen bron-/documentlezing en bewerking plus import/bouwadministratie. Gebruiker beoordeelt zelf; geen feedback automatisch afgehandeld of oude bouwtaken afgerond.
- Gegenereerde facturen zonder bewaarde payload blijven buiten deze editor. Een actieve btw-boeking beschermt de factuur tegen revisie. Dit is geen automatische creditnota, fiscale correctie of aanbetalingsfactuur. Vorige PDF/Word en verzending blijven ongewijzigd; gewone betaalstand blijft uit werkelijke orderontvangsten komen. Een nieuwe versie maakt de oude versie niet onwaar.
- De afgesproken aanbetaling wordt niet als ontvangst geregistreerd door een voorstel. Standaard50% voor vrijgave blijft; expliciet ingestelde andere afspraken blijven apart. Prijzen/specs/ontwerpakkoord blijven voorwaardelijk; fysieke productie/levering blijven afzonderlijke feiten.
- Artikelkostenuitsplitsing verdeelt eerst volgens de bestaande orderbasis, daarna binnen de leveranciersartikelen naar inkoopwaarde/oppervlakte/aantal stuks; bij gelijk-per-order volgt de interne artikelverdeling fysieke aantallen. Binnenlands vervoer en ongerichte orderkosten volgen alle fysieke artikelen. Benoemde artikelkosten blijven op hun artikel. Inbegrepen transport gaat één keer uit de oorspronkelijke productbasis. Geen verzonnen materiaal-/arbeidscomponenten, geen opgeslagen nieuwe stukprijs. Gehele centen en een zichtbare waarschuwing bij niet-toewijsbare kosten.
- Mobiele invoer-/prestatieklachten en de oorspronkelijke Afgehandeld-knopfout blijven onbewezen zonder gebruikersproef. De opslagbediening is verbeterd; dit is geen claim de oorspronkelijke fout gereproduceerd te hebben.
- Google-routeadapter, selectie en volgordevoorstel bestaan; eigen API-key/facturering/activering en gebruikerscontrole blijven open. Geen API-verzoek of accountactivering door bouwer.
- SVG-segmentatie behandelt gevulde vectorgebieden met gaten, krommen en beperkte kleurvereniging; geen onbeperkte segmentatie over transparante lagen, clipstructuren, lijnen en effecten. Nieuwe globale grens512onderdelen voorkomt cumulatieve explosie. Origineel blijft bij fout, één bewuste toepas-/undoactie bij succes.

## Cloudbytes vrijmaken — voorbereid, niet geactiveerd

`0006_design_file_retirements.sql` is alleen bron. Geen lokale/online migratie uitgevoerd. Zonder tabel blijft bestaande opslag werken, fysieke opruimactie meldt inrichting/publicatie nodig. De wachtrij ontstaat pas bij toekomstige aantoonbaar ongebruikte interne ontwerp-/previewbestanden waarvan manifest en metadata zijn verwijderd; geen bucketlijst, leeftijdsregel of blinde opschoonactie voor oude bestanden. Alle bestaande zakelijke records, nieuwe recordverwijzingen in dezelfde commit, definitieve/goedkeurings-/bewijsbestanden en nog bestaande manifesten blijven beschermd.

Een tombstone en het verwijderen van manifesten worden in dezelfde bestaande D1-CAS-batch bewaard. Hergebruik van een gemarkeerde objectKey wordt ook in de winnende CAS-guard geweigerd, zodat geen nieuwe verwijzing tussen controleren en fysieke R2-delete kan glippen. De expliciete Cloudbestanden vrijmaken-actie toont maximaal20objecten en hun bytes, vergelijkt de lijst opnieuw, vereist bevestiging en same-origin JSON. Bij R2-/D1-fout blijven tombstones staan voor idempotent opnieuw proberen; geen automatische heraanhechting. Geen bytesvrijgaveclaim zonder voltooide delete.

Een volledige bestandsback-up is een aparte kopie; een oude metadata-onlyherstelkopie kan fysiek verwijderde R2-bytes niet terughalen. Historische uploads die vóór de wachtrij zijn losgekoppeld zijn niet aantoonbaar te verzamelen uit deze nieuwe registratie; daarvoor blijft een afzonderlijke bewaakte audit nodig. Beide aspecten houden melding24gedeeltelijk. In dit werk zijn geen echte bestanden verwijderd of opruiminstellingen aangezet.

API-contracten uitsluitend uit primaire documentatie: [Cloudflare R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) voor delete met sleutel/lijst en [D1 Database API](https://developers.cloudflare.com/d1/worker-api/d1-database/) voor de bestaande SQL-batch. Geen serviceproef uitgevoerd.

## Eigen controle open

Beide bedrijven; lege/vroege order versus ontvangen betaling en fysieke uitvoering; product-/contact-/planningbediening en smallscreen; zending met onbekende verzending, overbetaling, afhalen en per-klant mailconcept; artikelkosten met meerdere/lokale artikelen, benoemde kosten, centen, inbegrepen transport en invoer-btw; feedbackstatus/IDs/export/afhandelen/busy/conflict;50%-grens en expliciete afspraak; ontvangstselectie en nieuwe/bewerkte factuur met/zonder Word, nieuwe btw-boeking tijdens editing, onafhankelijke factuurnummers/series; editorzoom/steppers, gewijzigde maat/aantal/inkoopregels/twee tabs, goedkeuring/andere varianten, bewaren/export; ondersteunde en geweigerde SVG; toekomstig tombstone-/cloudopruim-/retry-/restoregedrag na afzonderlijke inrichting/publicatie.
