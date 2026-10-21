# CRM-samenstelling en featuregrenzen

admin/app.js blijft de ingang voor beide bedrijven. Het houdt opstart, centrale status, routes, transacties, shell, opslagverversing, algemene dialoogbediening en gebeurtenisroutering bij elkaar. De grote schermen en formulieren staan onder hun eigen featuremap.

| Implementatie | Verantwoordelijkheid |
|---|---|
| workspace/overview-settings.js | Overzicht en Instellingen met bestaande actuele gegevens en formulieren |
| workspace/section-tabs.js | Gedeelde tabstructuur, URL/zichtbaarheid en toetsenbordbediening zonder formuliervervanging |
| documents/generated-forms.js | Offerte/factuur/orderbevestiging/pakbon, revisies en prijs-aanvulroute |
| documents/library-workspace.js | Bibliotheek, documentacties, uploads/downloads |
| customers/dossier.js | Klantoverzicht, dossier, adresweergave en klantformulier |
| orders/workspace.js | Orderweergave, order/productvelden, kosten/betaling en voortgang |
| orders/planning.js | Levertermijnen, planning en voortgangsweergave |
| orders/addresses.js | Factuur-/afleveradres en adresformulieren |
| products/images.js | Productafbeeldingen, goedkeuring en uploadbediening |
| purchases/batch-workspace.js | Inkoopbatches, kostentoerekening, leverancierfacturen en betalingen |
| mail/composer.js | Mailvoorbereiding, composer en preview |
| inquiries/ai-import-flow.js | Gecontroleerde AI-importvoorstellen voor klanten/orders/inkoop |
| analytics/workspace.js | Financiële analyse, compatibele kaartdelegatie |
| orders/map-workspace.js, orders/map-route.js | Uitvoeringskaart/filterbediening en tabblad-routeschets, geen businesswrites |

## Live context, geen tweede status

Iedere feature wordt als factory aangemaakt met appContext. De context heeft expliciete getters naar bestaande functies, imports en actuele appstatus. Voor mutabele bindings die bestaande code vervangt, zoals state/orderView, bestaan setters die dezelfde centrale binding aanpassen. Hierdoor blijven transacties, refresh en asynchrone acties de huidige data lezen. Geen kopieën per scherm, geen lokale database of nieuw opslagschema.

Factoryinitialisatie staat na imports vóór opstart. De factories declareren functies en geven die terug; ze renderen of bewaren niets tijdens constructie. Onderlinge featureaanroepen gaan via context; binnen een feature blijven interne helpers gewoon lokale functies. app.js importeert geen feature die op zijn beurt app.js importeert. Nieuwe code hoort in het passende onderdeel en gebruikt dezelfde centrale opslagcoördinatie.

Dit is een tussenstap: sommige features hebben nog veel afhankelijkheden en businessregels. De context maakt die zichtbaar maar is geen volledige domeinontkoppeling. Verplaats pure regels later gericht naar shared/ met een concreet contract. Maak geen proxy, globale app-service of tweede state om een importcirkel te verbergen.

## Verplaatste bestaande implementaties

Documentgeneration/layout/library/preview staan in documents/. Klantnummers in customers/numbers.js, leverancierskosten in purchases/costs.js, ordercalculatie/betaalworkflow/kaart in orders/, algemene dossierzoekregels en voorkeuren in workspace/, mailtemplates in mail/.

De oude top-level bestandsnamen bestaan nog als kleine exportdoorverwijzingen. Oude imports en queryversies blijven daardoor geldig. Nieuwe interne imports wijzen naar de canonieke submappaden. Verwijder deze compatibiliteitsbestanden pas in een afzonderlijke gecontroleerde wijziging.

Alleen lokaal gewijzigd op18oktober2026. Geen tests, build, browser-QA, publicatie of gegevensmutaties uitgevoerd voor deze opsplitsing. Bronparser gebruikt als bewerkingsinstrument, niet als claim van functionele validatie.

## Centrale CRM-opmaak en paginatabs — 19 oktober 2026

admin/style.css is de enige actieve stylesheet van admin/index.html. Workspace-, search- en analytics-CSS in oorspronkelijke laadvolgorde daarin ondergebracht; oude paden blijven lege compatibiliteitsURLs. Variabelen voor tekst, gedempte tekst, primaire/donkere vlakken en statuskleuren; dezelfde stateparen voor tabs/knoppen. Nieuwe gewone CRM-opmaak alleen hier, geen extra feature-CSS of inline kleuren. Tool-/calculatoropmaak en mailinhoud zijn aparte oppervlakken.

overview-settings.js gebruikt dezelfde live context en bestaande UI-builders/installers. section-tabs.js houdt alle panelen gemount en wisselt alleen hidden/aria/tabindex/hash. De hashhandler hergebruikt aanwezige instellingen-/overzichtspanelen; geen nieuwe instellingenfetch of reset van formulierinvoer per tabkeuze. Actieve verborgen formulieren blijven door bestaande hasActiveFormEdits beschermd tegen achtergrondverversing. Een expliciete render vanuit een template-/archiefactie vervangt bij onopgeslagen/busy mailforms alleen de betreffende lijsten. Geen credential-/formulierdraft in localStorage of tweede state. Alleen lokaal, niet getest/gepubliceerd.

## Btw-controle — 19 oktober 2026

analytics/vat.js heeft een eigen factory via de bestaande analytics-workspace/live context. orders/vat-reason.js levert gedeelde formuliervelden voor orderbewerking, AI-import en directe redenreview; pure classificatie/projectie in shared/vat-review.js. vatReason op order en vatReasonPresets in bestaande bedrijfsstate, zonder extra store/migratie. Bestaande orders zonder reden blijven geldig; presentaties markeren ontbreken. Reden/preset samen in bestaande transactie, oude documenten ongewijzigd. Toekomstige generated.vatReason is interne metadata, buiten de renderpayload. Geen aangifte-/providerdienst of fiscale rubrieken. Alleen lokaal, niet getest/gepubliceerd.

## Kwartaalregister — 19 oktober 2026

shared/vat-ledger.js houdt de pure bronprojectie, datum-/boekings-/snapshotvalidatie en één optelroute. state.vatLedger (inrichting/entries/preparations) zit in bestaande bedrijfsstaat, geen aparte opslagfacade. supplierInvoices is brongetrouw uit admin/purchases/costs.js naar shared/supplier-invoices.js verplaatst; bestaande export blijft geldig. state-validation valideert het register.

analytics/vat-quarter.js levert kwartaal-, bron- en inrichtingsschermen; vat-entry.js de formulierbediening en state/files-transactie; vat-layout.js de gedeelde tabs. analytics/workspace.js kiest kwartaal versus bestaande orderafwijkingencontrole. app.js alleen import/compositie en fiscale referentiecheck bij definitieve orderverwijdering. document-removal beschermt gekoppeld bewijs. Session-undo wist sessiegeschiedenis bij btw-registerwijziging; correcties via btw-revisies houden historie intact. Geen cryptografisch onveranderlijk archief of Belastingdienstexecutor. Nieuwe code lokaal en niet getest/gepubliceerd.

## Mailherziening — 19 oktober 2026

mail/composer.js beheert context/preview; mail/attachments.js veilige downloadpreview en transactionele dossieropslag via live context. Gedeelde mail-reply.js, mail-attachments.js en gmail-attachment.js valideren transport/readonlybron. Gmailserver cloud en lokaal lezen exact dezelfde parts; SMTP-engine valideert bijlagen en signeert één tekst/HTML-alternatief, geen Gmailmutaties. mail/mail.css is expliciet door gebruiker toegestane uitzondering op één hoofdstylesheet, alleen mail/attachment-dialog. docs/MAIL-HERZIENING.md bevat contracten, grenzen en ontbrekende publicatie/gebruikerscontrole.

## Factoryinitialisatie — correctie 19 oktober 2026

Featurefactories worden opgebouwd vóór enkele apphelpers zoals today/esc. Lees contextgetters tijdens schermgebruik, niet tijdens constructie. Btw-kwartaal bepaalt zijn standaard pas bij render; entry-UI gebruikt esc via luie wrapper. Dit voorkomt een ReferenceError die alle routes op CRM laden liet hangen. Alleen gerichte opstartreparatie, geen functionele tests.


## Aanvraagidentiteit en klantkoppeling — 19 oktober 2026

shared/inquiry-customer.js bevat pure identiteit/matching/projectie en expliciete beslisregels. inquiries.js bewaart snapshot bij intake; bestaande klantvelden blijven intact. admin/inquiries/customer-review.js levert compare-/keuzeformulier via bestaande live state en mergeStoredState. inquiry-ui composeert; orderworkspace zet dezelfde melding op iedere tab. Nieuwe klant wijzigt alleen order en diens bewaarde mail, met conflictdetectie; geen documentregeneratie. customer.contacts[] en order.contactId verbinden extra personen met het bedrijf zonder primaire velden te vervangen; state-validation begrenst en valideert optionele velden. Geen nieuwe database/provider of migratie bij lezen. Lokaal, niet getest/gepubliceerd.


## Agent-ingang cloud — 19 oktober 2026

assistant.js kiest vóór lokale initialisatie een aparte browserfactory assistant/online-entry.js voor niet-lokale runtime. Dezelfde shellslots/portal ondersteunen zichtbare ingang, mobiele inert/focus/Escape en Cmd/Ctrl+O; geen providerrequest of eigen CRM-state. openAiExport is een luie callback naar bestaande aiExportUI. Cloudingang meldt ontbrekende agentdienst en kopieert/exporteert alleen na gebruikersactie; geen schijnverbinding of lokale data aan centrale dossiers koppelen. Lokale ChatGPTdienst, tokenopslag en savePlan-localguard blijven intact.

## Gespreksgebonden antwoordhulp — 20 oktober 2026

mail-workspace composeert mail/reply-assistant zonder app.js-uitbreiding. De bestaande quickreply houdt mailSeed, concepten en transport leidend. Nieuwe browsercomponent houdt denksessies in geheugen, per bedrijf/gesprek/dossier. Alleen expliciet opgeslagen werkinstructies komen via mergeStoredState in bestaande bedrijfsstate; optionele validatie mailReplyGuidance. Pure contextallowlist/parser in shared/mail-reply-assistant.js; toolvrije generatie in shared/mail-reply-engine.js. assistant-engine kiest task mail-reply vóór algemene state-/toolinitialisatie; assistant/server geeft alleen die expliciete velden door via bestaande auth-/stop-/companyroute. Geen cloudagentdienst, nieuwe opslagfacade, modelcredentials of provider-mailactie. Details in docs/ANTWOORDHULP.md. Alleen lokaal, geen tests.


## Persoonlijke online AI — 20 oktober 2026

Cloud gebruikt dezelfde assistant.js-bediening en reply-assistant als lokaal, via /api/crm/assistant/. Offline/andere modi behouden handmatige entry. cloudflare/assistant.js laadt eigen centrale state, bewaart versleuteld sessievoorstel en doet uitsluitend na expliciete review/confirm een bestaande CAS-commit; geen provideractie-executor. app.js composeert alleen de online-plan-dialog en centrale refresh. assistant/host is aparte persoonlijke Node-runtime met eigen beschermd persistent accountvolume en afzonderlijke bedrijfssleutels; geen lokale alles-in-één server in de cloud. Zie docs/ONLINE-AI.md. Lokaal bronwerk, niet getest/gepubliceerd/geactiveerd; eigen server ontbreekt.


## Maat-fases en Gmail-labelreview — 20 oktober 2026

Bedrijfsfasepresentatie staat in companyprofiel + sales-funnel pureprojectie; operationelestatus blijft compatibel. admin/sales-funnel composeert optionele labelreviewcallback, app.js injecteert lazyfactory/getState + bestaande Gmailrequest/openForm. admin/mail/thread-labels bewaart alleen expliciete CRM-tags via mergeStoredState; mailconcept blijft gemount. Gmaillabels en corephase-sync hebben purecontracten onder shared/, vasteadapters in bestaandeGmailservers. Alleenspecifiekephase-applyroutekanthreads.modifyuitvoeren, naexactreview/consent; algemeneAI/Gmailexecutorblijftuit. Zie docs/MAAT-FASES-EN-LABELS.md, niet getest/geactiveerd.


## Eigendom feedbacklauncher — 20 oktober 2026

feedback.js bezit de eigen DOM-referentie en beforeRender/mount. app.shell parkeert deze buiten de vervangbare shell en monteert na de assistent. Een direct-child observer herstelt plaatsing bij rootvervanging; geen observatie van mailinhoud of formulier-subtrees. Beide assistentfactories emitten crm-assistant-visibility en bieden een mobiele feedbackslot, maar zoeken/verplaatsen de feedbacklauncher niet. Expliciete launcherHost van standalone tools blijft buiten shellbeheer. Geen dubbele knoppen, timers, dataopslag of provideractie; alleen bron, niet getest.


## Laptopbrug voor online AI — 21 oktober 2026

assistant/laptop-transport.js is één browserinstantie per bedrijfsruntime, gedeeld door hoofdassistent en replyhulp. Lokaal bestaande serverroutes; cloud een op gebruikersklik geopende lokale popup met exacte postMessage-origin/sourcechecks. Geen masterkey, CORS-wildcard of publieke tunnel. assistant/browser-bridge.mjs heeft eigen consentcookie/granthashes en tijdelijke sessies; deelt uitsluitend bestaande ChatGPTConnection/engine en generatiegrens met de helper. Mail/Gmail/betaling/routes blijven buiten de bridge.

shared/assistant-laptop-context projecteert standaard één gekozen dossier, bedrijfsbreed uitsluitend na expliciete keuze. cloudflare/assistant levert laptop-context uit eigen state en stage-local-plan met actuele revisie/baseline/allowlist; daarna bestaande menselijke review/approve/CAS. Geen hostedserversecret nodig voor deze niet-inferentieroutes. app.js blijft bestaande savePlan-compositie gebruiken. Zie docs/LAPTOP-AI.md. Bron gebouwd, niet getest/gepubliceerd.


## Automatische Gmail-fases — 21 oktober 2026

mail/automatic-phase-sync factory krijgt live state/load/merge/editing uit app.js, geen eigen dossierstore. Eén browserronde per herkomst via Web Locks, gedeelde serverexecutor per bedrijf, private mappingtoestemming/voortgang. sales-phase-signal bevat relevante factbasis; sales-funnel projecteert een daaraan gebonden Gmail-fase of bewuste CRM-selectie, echte financiën/productie blijven apart. Backend cloud controleert eigen D1-gespreksbinding/signaal, lokaal levert browser de beperkte IndexedDB-context. gmail-phase-auto kan uitsluitend de expliciet toegestane fase-labels bewerken; geen AI-executor. Bestaande individuele phase-review/apply blijft naast deze opt-in route. Zie docs/GMAIL-FASESYNCHRONISATIE.md, lokaal bronwerk zonder tests/activering/publicatie.


## Aanbetaling als leverbasis en bedrijfseigen drukwerkbediening — 21 oktober 2026

shared/lead-time.js berekent zuiver een aanbetalingsdatum uit actuele orderbetalingen en bekende totale orderwaarde. orders/planning beheert velden/uitleg; installer wordt ook door orderbewerking en AI-review gebruikt via live appContext. Nieuwe documentdefaults gebruiken dezelfde deliveryWindow-getter; geen documentwijziging bij alleen renderen. Planning opslaan via bestaande actuele merge met conflictcontrole.

shared/companies.js bevat orderStagesFor/displayOrderStage naast de verkoopfaseconfig. Browserformulieren, formulierintake en assistant-domain gebruiken dezelfde bedrijfsstatuskeuze; legacy data blijven intact. Afbeeldings-/document-/mailtemplatebediening controleert eigen bedrijfsprofiel. Geen CSSverbergen als vervanging van veldkeuze: Maat rendert de drukwerkcontrols niet. Technische productbestanden blijven generiek. Geen tests of publicatie.

## Handtekeningen per afzender — 21 oktober 2026

admin/mail/signature-editor.js beheert alleen onopgeslagen formuliervarianten, batchbestand→vakkeuze en afzenderbindingen. Geen CRM-state/store naast de bestaande mailconfiguratie. shared/mail-signature-profiles.js selecteert en rendert identiek voor preview/backend; global legacyvelden blijven virtuele standaard, signatureProfiles/signatureBySender/version optioneel. Backend vergelijkt preview-ID/inhoud/adresselectie en configuratieversie; bestaande mailjournal/dedup en toestemming blijven. Hele set begrensd800kB, geselecteerdeHTML500ktekens, maximaal12afbeeldingen, bestaande sanitizer/CIDverwerking behouden.

workspace/ai-help.js is een gedeeld kopieervenster met optionele inhoud, geen AI-providerverbinding. Contract in shared/signature-ai-help.js, toegepast bij handtekeningen. Een getekende verzameling is geen nieuwe Gmail-accountinstelling. Zie docs/MAIL-HANDTEKENINGEN.md. Geen tests/build/browserQA/providerproef/publicatie.

## Bouwtaken-triage — 21 oktober 2026

shared/planning/progress.js kent review naast open/doing/blocked/done, plus één gedeeld filtercontract. Catalogusstage review is alleen fallback bij ontbrekende opgeslagen voortgang. development-plan.js gebruikt dezelfde statusselectie voor lijst en tellers; open excludes review/done, standaard blijft open. Bestaande transactie/CAS/eventdedup en bedrijfsscope blijven ongewijzigd. Geen catalogustaak verwijderen om de lijst op te ruimen; oude records en gebruikersheropening behouden. Bouwlog via normale UI aangevuld, geen directe IndexedDB-/JSONpatch. Alleen lokale UI-administratie; geen functionele browser-QA/tests/builds.

shared/costing-inline-context.js is de gedeelde beperkte productoverdracht op beide same-origin/nonce-berichtgrenzen. Nieuwe inlineberekening neemt bekende hoeveelheid/maten/materiaal/dikte mee; decimale mm-waarden blijven. Purchase pair wordt aantal stuks; geen klant-, prijs- of leveranciersvelden. Bestaande quote wordt niet automatisch opnieuw gevuld, bewuste synchronisatie blijft. Originele calculatorassets/rekenkern en V2 niet gewijzigd.

## Ordervoortgang — 21 oktober 2026

shared/order-progress.js is een read-only projectie van salesFunnel + eigen betaal/document-/uitvoeringsfeiten; geen dubbele statusopslag of migratie. admin/orders/progress.js rendert gezamenlijke orderheader/uitvoeringkaart. workspace.js houdt open/slaan/route en gebruikt centrale merge met verwachte orderinhoud voor expliciete voortgang. planning.compactWorkflow is een compatibele wrapper naar dezelfde markup. Geen indexgebaseerde passieve balk meer. Maat heeft geen designopties; Spat behoudt zijn eigen ontwerpkeuzes. sales-funnel.panel kan faseheader onderdrukken op orderoverzicht. orderReadiness erkent eigen leveranciersbesteldatum zonder batch. Bron/UIcode lokaal, gebruiker controleert; geen tests/build/browserQA. Zie docs/ORDERVOORTGANG.md.


## Formuliertabel en productspecificaties — 21 oktober 2026

shared/inquiry-quantity.js deelt conservatieve aantal-/kleurherkenning tussen inquiries en request-recognition. mail-content decodeert entiteiten passief; HTML eerst strippen. inquiries houdt bedrijfsspecifieke sender/recipient/subject/verified/opt-in-grenzen en centrale createInquiry-transactie. Pagina is een gevalideerde bronpadstring in bestaande orderdata; readonly fallback vanuit bewaarde bron, geen nieuwe store, migratie of provideractie. inquiry-ui toont broncompactdetails en intakecontext; app wijzigt alleen import/cacheversie. Zie docs/AANVRAAGHERKENNING.md. Geen tests of functionele QA/publicatie.


## Bouwvoortgang vanuit code — 21 oktober 2026

scripts/build-task.mjs beheert append-only shared/planning/source-updates.js. taskBaseline gebruikt nieuwste bedrijfseigen bronstatus alleen als er geen opgeslagen record is; development-plan projecteert sourceEvents apart naast de onveranderde events/version. Bestaande gebruikersstatus leidend, geen muterende synchronisatie of nieuwe store. Zoek-/handoffweergave bevat beide bronnen; normale CAS-/backupvalidatie blijft op originele planningrecords. UI blijft voor de gebruiker beschikbaar, AI voert voortaan geen handmatige formulieradministratie uit. Nieuwe lokale code niet functioneel getest/gepubliceerd; zie docs/BOUWTAKEN.md.


## Eenvoudige Maat-inkoop — 21 oktober 2026

orders/direct-purchase.js composeert binnen bestaande orderworkspace/live context; shared/direct-purchase.js bewaakt bedragen, metadata en kostbronbehoud. Geen nieuwe store of tweede kopie van inkoop. Nieuwe losse route gebruikt order.supplier en bestaande product-/orderkosten; exclusieve oude inkoop houdt eigen kosten. Eén actuele state/files-transactie bewaart metadata/blobs samen met order/optionele exclusieve purchase-CAS en relatiecontrole. Documenten met supplierDocument blijven other/interne inkoopbron, vat-ledger geeft ongeclassificeerde file-bron zonder seed. app.js voegt alleen luie documentFile-getter/importversies toe en wist nieuwe bestelreferentie bij dupliceren. Spat blijft eigen route. Zie docs/INKOOP-BIJ-ORDER.md. Geen tests, builds of browserQA/publicatie.


## Bedragbasis in presentatie — 21 oktober 2026

workspace/money.js bevat vaste presentatiebetekenissen, orders/money-summary.js projecteert alleen bestaande totals/economics voor header. Orderworkspace, overzicht, analytics en betaalformulieren geven net/gross-basis zichtbaar aan; bronbedragen/tarieven/afronding ongewijzigd. Orderlijst kiest bestaande net-sorteerkey in plaats van gross total als hoofdkolom. Geregistreerde supplier document.total heeft geen apart taxbasisveld: expliciet documentbedrag, geen conversie of nieuw datamodel. Centrale CSS money-groups stapelt op mobiel. Geen tests/build/browser-QA/publicatie; docs/BEDRAGEN-EN-BTW.md.


## Maat-productdikte door de documentketen — 21 oktober 2026

shared/product-specifications levert publieke allowlist material/thickness en vaste details; geen interne vrije specs/leveranciersdata. generation.js accepteert companyId en bewaart numerieke snapshot plus leesbare details; bestaande Pythonconverter/template-rijen blijven werken. Generated forms bieden verplichte Maat-diktecontrole en order-returnhulp; pakbon bewaart gewijzigde invoer bij terugkeer. Revisie behoudt historische payload en technische metadata, expliciet currentProducts voor actuele gegevens. Geen automatische oude-filemigratie. Pure thicknessUsage telt huidige productregels, geen financiële allocatie; analytics/product-metrics wordt via bestaande factory/context in Maat-Financiën gemonteerd. Dossierfilters werken per item. Zie docs/DIKTE-EN-PRODUCTDATA.md; geen tests/build/browserQA/publicatie.
