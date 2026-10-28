> Documenttemplatebeheer28oktober: documents/templates.js composeert via live appContext, state.documentTemplates in bestaande opslag/CAS/back-up. Generator valideert per authenticeerd bedrijf; stateless tijdelijke renderoverride. UI/handler/converter samen opleveren; geen tests/publicatie, eigen controle open. Zie docs/DOCUMENTTEMPLATES.md.

> Tikkiepushdetails28oktober: shared/payment-notifications.paymentPushSummary projecteert uitsluitend bewezen ontvangstbedrag en gekoppelde CRM-klant. Server voegt optionele v1-details toe aan bestaand encrypted transport; worker-template valideert/formatteert defensief met generieke compatibiliteitsfallback. Geen extra store/query/migratie/opt-in of transport. Client alleen zichtbaarheidstekst. Oude worker generiek, publicatie/appupdate/eigen controle open. Zie docs/MOBIELE-MELDINGEN.md; geen tests/build/browser-/pushproef/publicatie.

> Ordercelnavigatie28oktober: orders/list-navigation.js is eenmalige gedelegeerde handler via app.js-compositie, actuele bestaande dossierlink gevolgd; interactieve controls/details/selectie/modifiers blijven eigen gedrag. Geen businessstate/recordwrites, list.js blijft presentatie en table-guides alleen aanwijzen. CSS centraal. Zie docs/TABEL-BEDIENING.md; bronreview/local, geen tests/browsercontrole/publicatie.

> Batch3 feedback28oktober: analytics/website-metrics.js is pure rapportprojectie/kaart-/grafiekpresentatie zonder opslag/fetch. website.js houdt alleen metriekkeuze en referentie naar getoond rapport in schermgeheugen; dezelfde load-/AbortController-/revisie-/filter-/uitsluitingsroute. site-analytics.js breidt bestaande dagaggregatie uit op bestaande velden, geen tracking/migratie. CRM-CSS centraal; zelfstandige editor-CSS geconsolideerd, geen JS/state/APIvolgorde gewijzigd. Zie docs/FEEDBACK-BATCH3-20261028.md; bronreview/local, eigen controle open, geen tests/build/browsercontrole/publicatie.

> Batch2 feedback28oktober: purchases/supplier-document-form.js beheert de bestaande leveranciereditor, document-ai.js de handmatige prompt/JSON/voorinvulstap; batch-workspace composeert. purchases/vat.js presenteert hetzelfde state.vatLedger via bestaande analytics/vat-entry.js, geen tweede register. Optionele purchaseId/paidVat in gedeelde validator, supplierInvoiceBasis bij document/betaalformulier/oudere AI-route, oorspronkelijke state/files-CAS behouden. Source/aliasprojectie zonder historische migratie; bronmetadata/regel-IDs behouden. CSS centraal/ongewijzigd. Zie docs/FEEDBACK-BATCH2-20261028.md; review/local en eigen controle open, geen tests/build/browsercontrole/publicatie.

> Batch1 feedback28oktober: shared/inquiry-product-proposal.js is een pure formuliervoorstelhelper zonder IDs/writes. inquiry-ui geeft actuele invoer/herkomst en aanvraagbasis mee; orders/workspace bewaart voorgestelde rij alleen via WeakMap, gebruikt dezelfde editor en order-CAS. Gedeeltelijke maten blijven bewaard bij later bewerken. shared/order-progress projecteert Offerte / bevestiging uit bestaande verzendfeiten; geen nieuwe state/fase-/betaalregels. Zie docs/FEEDBACK-BATCH1-20261028.md. Review/local; geen tests/checks/build/browsercontrole/publicatie.

> Correctie28oktober: desktop inklappen had CSSconflict: de latere .shell>aside>nav-displayregel overschreef de eerdere verborgen navigatie. Eén geconsolideerde .shell.sidebar-collapsed-eigenaar, directe nav/kop/voet expliciet verborgen, intrinsieke eerste gridrij en begrensde compacte balk. Geen mail-/formulierherbouw, nieuwe JS of voorkeurswijziging. Mobiele menucontroller/breakpoint behouden. Alleen lokaal, geen tests/checks/build/browsercontrole/GitHubpush/publicatie; eigen controle open.

> Nieuw28oktober: beter zichtbare zebra en hele-rijhover/focus; gedeelde tijdelijke rij-/kolom-/celmarkering voor CRM-tabellen, native keuzelijsten/menu-/zoekkeuzes duidelijker. CSS uitsluitend centraal, bestaand blauw/neutraal en bronpaars behouden. Geen algemene Excelterugkeer of documentinhoud wijzigen. Voorlopig geen GitHubpush; gebruiker levert later zelf nieuwe Word-pakbontemplate, huidige pakbon behouden. Zie docs/TABEL-BEDIENING.md. Bron lokaal, geen tests/build/browsercontrole/publicatie; eigen controle open.

> Nieuw28oktober: bedrijfslogo/naam naar Start (#dashboard), grote zoekbalk via bestaande globale zoekdialoog, bestaande laatst-geopendvoorkeuren en recente ontvangsten, alle sidebaronderdelen als grote tegels. Te doen & overzicht blijft #dashboard/tasks met bestaande tabs. Geen nieuwe businessstore/poll; query alleen vluchtig, code/CSS gedeeld, logo bewaakt open/busy/onbewaarde dossierinvoer. Zie docs/STARTPAGINA.md. Lokaal bronwerk, geen tests/checks/build/browsercontrole/upload/livepublicatie; eigen controle beide bedrijven/mobiel open.

> Correctie28oktober: de prominente teller gebruikt uitsluitend de eerste huidige positieve ontvangst (betaling of aanbetaling), zonder aanvraagfallback en zonder reset bij een restbetaling. Geen betalingsdrempel of volledige prijs nodig om een feitelijke ontvangst te dateren; betaaldstatus blijft apart. Geen ontvangst → Nog geen betaling, onbruikbare gegevens → controleren. Teller stopt op werkelijke leverdatum; afgerond zonder datum geen doorlopende teller. Gedeeld via shared/order-payment-wait.js bij dossierkop, orderlijst, werkvoorraad/klantdossier en kaart. Aanvraagdatum/-ouderdom bij details en bestaande taakprioriteit; afgesproken levertermijn ongewijzigd. Alleen bron, geen tests/build/browsercontrole/publicatie; eigen controle open.

> Algemene ronde27oktober: workspace/key-facts.js is de gedeelde read-only markup voor doorgegeven projecties; tab-visibility.js onthult uitsluitend horizontale selectie. Dossierkoppen en centrale CSS hergebruikt. orders/payment-view.js uit bestaande factory gehaald, dezelfde context/handlers/records. Dashboard/klant/inkoop/ontvangsten/Analytics gebruiken bestaande projecties; mail/documenten alleen indeling/bediening verplaatst, alle hooks behouden. Geen nieuwe businessstate, financiële engine, providerroute of opslag. Zie docs/RUSTIGE-WERKPLEK.md. Bron lokaal, alleen bestaand Maatbetaalvoorbeeld bekeken; overige controle open.

> Nieuwste dossierkop27oktober: orders/key-facts.js presenteert bestaande ontvangsten/totalen, bestaande betaal-/aanbetalingsdatum en uitvoering/leverafspraak uit dezelfde actuele context. Geen nieuwe prijsengine, statekopie of writes. orders/header.js maakt identity/facts/tabs en installOrderHeader beheert alleen tijdelijke native disclosure plus tabonthulling. progress.js deelt uitgebreide markup; workspace.js composeert. Centrale CSS-eigenaar herwerkt, oude geld-/faseregel weg. Zie docs/ORDER-IN-EEN-OOGOPSLAG.md. Expliciete beperkte Maatpreviewbeoordeling, geen automatische tests/builds/brede QA; eigen controle open, bron lokaal.

> Batch4vervolg27oktober: openForm gebruikt één formBusy-guard voor interne submitbusy én feature-inert/aria-busy (close/cancel/submit/aanvulactie). Geen extra cancelsystemen. Composer start op huidig open formulier, vroege per-file/aggregategrens, foutfocus na vrijgeven. shared/mail-attachments private naam/typeallowlisthelper, pre-readsizeguard plus bestaande post-readvalidatie. Geen nieuwe state/store/providerroute/CSSlaag. Zie docs/BATCHES2-4-OPMAAK-20261027.md; bronreview/local, eigen controle open.

> Batch3vervolg27oktober: list-filters.js pure zichtbaarheid van actieve criteria, geen filterengine/statekopie. shared/order-payment-status.js labelt bestaande totalen voor screen en dossier-search op dezelfde unknownregel; geen tweede bedragengine of workflowwijziging. payments/list-focus.js bewaart alleen tijdelijke rijfocus tijdens synchronous repaint; geen listener/store/timer/provideractie. Sortkeys blijven. Zie docs/BATCHES2-4-OPMAAK-20261027.md; bronreview/local, eigen controle open.

> Batch2vervolg27oktober: shared/inquiry-edit.js heeft pure product-/aanvraagbasis en changedInquiryValues. inquiry-ui bewaart alleen eigen velddelta in tabgeheugen tijdens producteditor, herleest productbasis bij terugkeer en bewaakt oorspronkelijke aanvraag-/klantbasis in bestaande merge. Geen extra store/draftstorage of automatische specs-/productmigratie. Zie docs/BATCHES2-4-OPMAAK-20261027.md; bronreview/local, geen tests/browsercontrole/publicatie.

> Vervolg27oktober: orders/list.js pure tabelpresentatie met actuele coordinatorprojecties, geen tweede state/sortering. products/design-variants.js composeert bestaande variant-/approvalprojecties; inquiryUI ook op ordertabs geïnstalleerd. documents/order-terms.js via luie context, vaste shared/company-documents allowlist alleen Maat; bestaande state/files-transactie en optionele companyAssetvalidatie, geen nieuwe store. Mail drop/paste gebruikt bestaande bijlage-/previewroute; inline→composer leest actuele gemounte seed na afzenderawait. CSS centraal, oude mailfocus-/hover-/filemenueigenaarsregels verwijderd. Zie docs/BATCHES2-4-OPMAAK-20261027.md en ALGEMENE-VOORWAARDEN-BIJ-ORDER.md; bronreview/local, geen tests/publicatie.

> Opmaakbatch1,27oktober: workspace/action-menus.js is de enige generieke controller voor native quiet-menu/order-more; preferences.installSidebar beheert installatie/cleanup en houdt dezelfde voorkeurskey. Geen tweede state/API/timers of app.js-featurecode. Navigationcontext blijft pure markup. Centrale type/spacing/control/nav/menu-eigenaarsregels in admin/style.css; mobiele geometrieregels behouden. Zie docs/VIER-OPMAAKBATCHES-20261027.md; alleen bron, gebruikerscontrole/publicatie open.

> Vervolg27oktober: orders/header.js bevat pure gedeelde dossierkop en beperkte horizontale tabstriponthulling; orders/workspace.js composeert dezelfde context/projecties, geen tweede state/opslag. orders/overview.js groepeert primaire actie/producten en aanvullend dossiergedeelte; sales-funnel behoudt dezelfde readiness/handlers. Centrale CSS heeft één actuele producteigenaar en begrensde .shell>aside-geometrie. Bron lokaal; geen browser-/functionele validatie. Zie docs/DOSSIER-INDELING-20261027.md.

> Nieuw27oktober: admin/payments/notifications.js observeert gecommitte state/externe refresh met sessie-IDset; bestaande workspacequeue/controls, geen nieuwe poll/storage/provideractie. shared/payment-notifications.js deelt bestaande server/clientreceiptregels. cloudflare/payment-delivery-status.js leest alleen eigen huidige device/eventbezorgstatus via bestaande beveiligde statusroute, geen transportwijziging. Beginhistorie/import stil, telefoonoorzaak niet bewezen. Alleen bron lokaal; zie MOBIELE-MELDINGEN.md en OVERDRACHT.

> Nieuw27oktober: payments/workspace.js beheert de nieuwe menuwerkplek #payments via context.state en bestaande refreshExternalState. Pure join/filter/som in shared/payment-overview.js, DOM/filters/paginering in feature, geen businesswrites of eigen kopie. Bestaande zoekvelden/details behouden bij refresh; foutstatus expliciet. appContext nieuw luie refreshgetter, geen constructor-TDZ of importcirkel. Navigatie en centrale CSS gedeeld; bron lokaal, eigen controle/publicatie open.

> Vervolg27oktober: analyticsworkspace geeft route[2] als reportId aan reportfeature. URL/knop opent exacte bewaarde editie, onbekend blijft expliciet; geen stille latestfallback. Meldingenstatus toont alleen aantallen/capability en acceptatie, geen devicegeheimen. Nieuwe bron gebruikt bestaande knop-/editbescherming, geen nieuwe CSS of appContextstatus. report-device.js handshake alleen tijdens expliciete telefoon-koppelactie, geen providerproef/permissionprompt op lezen. Zie VRIJDAGRAPPORTEN.md; bron lokaal, eigen controle en publicatie open.

> Nieuw27oktober: analytics/workspace.js delegeert tab reports naar analytics/weekly-report.js. Geen nieuwe appContextglobale status of app.js-featurecode; tijdelijke schermstatus, DOMinvoer behouden bij fout en settings-CAS, bronrapporten via beveiligde eigen serverroute. Eigen rapportrecord in bestaande versleutelde integrationsopslag, geen klant-/orderstate. Centrale CSS hergebruikt analyticsgrafiek/table-controls. Zie docs/VRIJDAGRAPPORTEN.md; ontvangstkeuze/bezorging, eigen controle en publicatie open.

> Laatste27oktober: workspace/notifications.js is één gedeelde sessiemanager per bedrijf voor inkomende mail/aanvragen en fasewijziging. mail-notifications.js compatibiliteitsexport; één centraal CSSblok. notifyMailPhase toont Bekijken/Terugdraaien; shared/funnel-phase-undo.js gebruikt tijdelijk smal token en actuele-basisguard binnen bestaande merge, wijzigt uitsluitend salesFunnel.selection + activiteit. Geen algemene sessionUndo, false verzenddatum, data-/bestands-/providersnapshot of extra store. Open/onbewaarde invoer blokkeert alleen meldingacties, niet de bekende faseafleiding. Geen tests/checks/build/browsercontrole/publicatie. Zie COMPACT-ORDEROVERZICHT.md.

> Nieuwste27oktober: centrale CRM-opmaak inclusief mail in admin/style.css, één :root, gemeenschappelijke tokens/controls, oude CSSpaden lege compatibiliteit. Zie docs/CRM-CSS.md (vanuit admin ../../docs/CRM-CSS.md). orderOverviewMarkup in admin/orders/overview.js is presentatie via live context; checklist/planning hebben optionele compactweergave. Pure salesFunnel projecteert onbesliste complete aanvraag naar pricing zonder historische basis-/gegevensmigratie. workspace/phase-notice-preference.js bewaart uitsluitend per bedrijf/browser de popupweergave, geen actieautorisatie. Nieuwe bekende mailfasen worden confirmed binnen dezelfde acceptatietransactie; prefs/popup blokkeren afleiding niet. automaticFunnelMailPhase deelt type-/doelherkenning, notifyMailPhase is alleen uitleg, oude pending/dismissed/herstel behouden eerdere guarded review. Meer → Fase-meldingen beheert uitsluitend weergave. docs/COMPACT-ORDEROVERZICHT.md bevat grenzen. Alleen bronwerk, geen tests/checks/build/browsercontrole/publicatie.

# CRM-samenstelling en featuregrenzen

26 oktober 2026: orders/route-costs.js hangt onder de bestaande map-route-factory. Alleen vluchtige tabbladwaarden en een basisvergelijking via de actuele routegetter; geen eigen businessstate of opslag. Bestaande shared/batch-economics.deliveryScenario rekent de kosten. Routebasiswijziging vereist expliciete herbevestiging met invoerbehoud. Geen tests/checks/build/browser-QA/publicatie uitgevoerd.

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

## Websitegegevens en ontvangen contact — 21 oktober 2026

analytics/dossier.js factory via live appContext, pas bij mount getters gebruiken. orders/workspace en customers/views leveren slots; dossiercontrollers mounten na shell. Handmatig contact en exacte leadrelatie via bestaande mergeStoredState met veld-CAS; geen tweede zakelijke store, geen automatische anonieme matching. cloudflare/website-journey route leest eigen orderstate/binding, weigert vrije lead/visitzoekvragen; oude v1-bezoekdetails blijven aggregate-only. Pure validatie/projectie in shared/website-dossier. Website blijft apart project; eigen optionele migratie/flags niet uitgevoerd. Zie docs/WEBSITE-DOSSIER.md; geen tests of publicatie.

## 23 oktober — formuliermetadata buiten de body

shared/inquiry-mail-metadata is een pure beperkte decoder/validator voor hetzelfde headercontract in de aparte websitebron. gmailMessage projecteert de toegestane velden, beide bestaande Gmail-diensten vragen die mee in dezelfde metadata-call. inquiries consumeert pas binnen bestaande formulier-/afzendergrenzen en bewaart de compacte bron bij de bestaande order; bodyfallback en dedup/CAS blijven. analytics/dossier toont alleen bewaarde bron, geen nieuwe providerstate. Appwijziging beperkt tot cacheketen en wissen bron bij orderduplicatie. Geen nieuwe AI-acties, scopes of providerstatusstore. Zie docs/FORMULIERMAIL-EN-SPAM.md; lokaal, geen tests/publicatie.

## Persoonlijke dossierlijsten — 23 oktober 2026

workspace/dossier-preferences.js houdt alleen bedrijfsspecifieke browservoorkeuren en begrensde ID/tijdstiprecents bij, buiten zakelijke state. app.shell registreert een geldig getoond dossier; dezelfde actieve entiteit wordt bij tabwissel/save/refresh niet opnieuw geraakt. App behoudt bestaande centrale orderkolomsortering en composeert zichtbare dropdown; customers/views leest dezelfde helper en geeft alleen openedAt aan de pure zoekprojectie. Geen provideractie/nieuwe recordvelden/migratie; prijsvergelijkingsregels blijven intact. Opslagfouten behouden de tabkeuze in geheugen met melding. Zie docs/DOSSIER-SORTERING.md. Lokaal, geen tests of publicatie.

## Mobiele meldingen — 23 oktober 2026

notifications/client.js via luie appContext in instellingen; alleen apparaatabonnement/UI, geen businessstate. Manifest canoniek shared/mobile-app.js; scripts/build-pages levert bedrijfsicons/manifest en breidt bestaande offlineworker-template uit. Geen tweede SW, APIcache of offline-writeomweg.

cloudflare/notifications.js houdt private sessiegebonden subscriptions, dedup/outbox/lease/retentie in additive migratie0005, met uitsluitend specifieke jobauth in middleware en bestaande auth voor browserroutes. Canonieke snapshot/commitcallbacks vanuit api.js; geen aparte statepersistenceroute. Background ontvangt providerbewijs via bestaande Tikkieadapter en gebruikt gedeelde pure shared/tikkie-payments.js; admin/orders/payment-workflow re-export blijft compatibel. Geen automatische factuur/mail/Gmailexecutor. workers/notifications is afzonderlijke Cron-Worker zonder DB/providercredentials, alleen een eigen Pages-jobkey. web-push.js gebruikt native WebCrypto/RFCs, vaste pushhostallowlist en redirectverbod. Secrets alleen runtime; niets gegenereerd/geopend/geactiveerd. Activering/checks open, zie docs/MOBIELE-MELDINGEN.md.

## Vier feedbackbatches — 23 oktober 2026

workspace/viewport.js is de gedeelde eenmalige schermtoetsenbord-/focushelper voor mobile-ui en standalone feedback; DOM pas bij install. orders/addresses houdt nieuw contactvenster met veldsignature en actuele merge, behoudt leverdrafts. orders/workspace registreert nieuwe ontvangst transactioneel met stabiele ID en paars percentagevoorstel; geen globale premutatie.

documents/manual-delivery is luie featurefactory naast library-workspace; concrete PDFmetadata {kind,sentOn,recordedAt,source:user} gevalideerd in shared/state-validation. Alleen nieuwste documentsoort vult dossierdatum aan; metadata blijft bij verplaatsen geldig en bundelstatus leest PDF. Aanmaken document is geen verzending. generated-forms composeert bestaande prijs-/fulfilmenthelpers binnen dezelfde merge met aparte signatures; voorstel wordt pas na save afspraak. preview bezit resizeobserver/fitmode en ruimt die met bestaande abort/dispose op.

Pushregistratie seedt baseline onder de controllease vóór het toestel wordt opgeslagen. Drain beperkt selectie tot actueel geldige sessieapparaten, status geeft algemene leverissues. Geen nieuwe providerscopes of businessmutaties door status. Bron niet getest/geactiveerd; zie vier-batchdoc.

## Batch1 vervolg — 23 oktober 2026

notifications/client houdt alleen vluchtige status/browserabonnement, geen endpoints in eigen opslag. Statusfetchvolgorde voorkomt overschrijven door oude requests; voortgang blijft lokaal in het paneel. Browserrevocatie pas na bevestigde serverrevocatie; bij fout endpoint behouden om opnieuw te proberen. Serverstatus geeft uitsluitend booleans voor reconnect/heartbeat, geen deviceenumeratie. notifications.js staat unsubscribe ook bij feature-uit toe, onder bestaande echte bedrijfsaccountauth en Origin. Huidige single-allowed-accountarchitectuur expliciet gedocumenteerd, multiuser-eigenaarschap later apart. Herlees actuele sessie/device/key direct vóór transport, niet alleen aan begin job. Geen nieuwe store/migratie/scopes. Standalone editorfeedback volgt dezelfde viewportvariabelen met eigen afgebakende CSS. Geen tests/publicatie.

## Batch2 — 23 oktober 2026

orders/payment-entry factory uit workspace gehaald, uitsluitend luie context. shared/manual-receipt bevat veldbasis/kalenderdag/zelfde-ID-/mogelijke-dubbelcontrole en append binnen bestaande merge. UI gebruikt bestaande totals, geen tweede saldoengine. Expliciet Actueel saldo ophalen leest centrale opslag en vervangt alleen appstatus/basis, behoudt formulierinvoer; save blijft basis-CAS. payment-corrections hergebruikt kalenderdagcheck.

documents/payment-selection bezit optionele DOMinstaller voor telling/totaal/alles/niets, na resume toegepast; formchange wist bestaande preview. documents/preview houdt eigen retrytask bij lees- en paginafouten. orders/cost-composition leest alleen bestaande economics/allocatedAmount/itemCost/namedCosts; directe perproductregels zijn geen alternatieve volledige kostprijs. app.js alleen noodzakelijke klikrouterfix invoice-mail-start, compacter bestaand betaallinkpanel en importcache; startInvoiceMail gebruikt bestaande generator bij beide bedrijven. Geen providerexecutor, nieuwe opslag, fiscale bronmutatie of publicatie. Details docs/BETALINGEN-EN-DOCUMENTEN.md.

## Batch3 — 23 oktober 2026

customers/contact-editor composeert dezelfde begrensde primaire contactvelden voor ordermodal en inline mailherstel. shared/customer-contact past alleen gewijzigde velden toe met individuele basisvergelijking en optionele order-klantrelatiecontrole; contactenlijst/ordercontactkeuze blijven apart. Mail past ontvanger uitsluitend na expliciete Gebruik adres aan.

mail/templates kiest inline-task wanneer een terugkeercallback bestaat; volledige composer refresh alleen templatekeuze/variabelen, geen nieuw parentformulier/resume/route-/conceptopslag. Inline save returnfalse houdt het kindvenster open (bijvoorbeeld naamconflict), met bestaande dirty/busy/confirmafhandeling. Bestaande gewone instellingeneditor blijft.

mail/composer houdt replylabel/hulp en Nieuw bericht-knop als vaste DOM, herbouwt alleen keuzelijst op ontvanger. Huidig antwoordanker niet uitwissen bij alleen body-/templatebeheer of latere bewaarde mail; directe ontvanger-/semantische onderwerpwijziging wist alle antwoordmetadata. Geen nieuwe providerrequest/scopes. Manual-delivery checkt ordercustomer opnieuw en gebruikt invoegvolgorde bij gelijke documentdatum. Details docs/KLANT-EN-MAILWERKPROCES.md; bron niet getest/gepubliceerd.

Batch3 template-subjectcontract: installComposer krijgt luie keepReplySubject-callback. In antwoordmodus bevestigt/vervangt apply alleen body, behoudt onderwerp/anker. Nieuwe berichten mogen templateonderwerp overnemen. Expliciete ontvanger-/onderwerpwijzigingen blijven metadata wissen.

## Vervolg 24 oktober 2026

shared/request-products is een pure begrensde bloksplitsing; request-recognition hergebruikt dezelfde herkenner per blok zonder recursief splitsen. Handmatige productsave via bestaande createInquiry in één transactie, geen extra bronstore. request-intake bezit de herhaalde DOMvelden, dirty/busy/confirm via bestaande openForm. inquiry-mail bewaart productID-gebonden selecties en controleert dezelfde actuele productbasis.

site-analytics scheidt all_visits, pagina-gefilterde visits en aantoonbaar gekoppelde leads binnen dezelfde uitsluitings-CTE; geen nieuwe meettabellen. laptop-origins is een gedeelde exacte allowlist voor server en browser, geen configureerbare wildcard. V2 hergebruikt cloud-storage-facade en bestaande berekeningsguards; runtimecapability volgt expliciete publicatieassetkeuze. Operatoractivering is een los expliciet script, nooit startup/CI, zie VERVOLGWERK-2026-10-24.md. Geen tests uitgevoerd.

## Analytics-overzicht — 24 oktober 2026

analytics/workspace routeert default naar overview; analytics/website projecteert bestaande eigen rapportresponse en inquirySummary zonder nieuwe store. Loadingstatus staat buiten het rapport en bewaart laatste context bij fouten; uitsluitingen wissen eerst de oude weergave. financial-chart gebruikt dezelfde financialGroups met meterweergave en bestaande dossierdrilldown; dubbele statische chart niet meer in hoofdscherm. websiteCohort erkent orderId én ownerId voor quote-documentbewijs. CSS centraal, cijfers/bedrijfsgrenzen ongewijzigd. Zie docs/ANALYTICS-WERKPLEK.md; geen functionele tests uitgevoerd.

## Automatische Tikkiecontrole — 24 oktober

notifications.pollProvider gebruikt vijfminutenvensters in bestaande job/cursor, bekende receipt/correction-ID’s uitsluitend als filter voor herverificatie van gesloten journal-links na onderbroken commit. Cached bedragen worden nooit als nieuw bewijs direct geïmporteerd: bestaande provider-GET/validatie en centrale CAS blijven leidend. Status-API voegt expliciete pollingflag/interval/laatste afgeronde ronde toe, browser toont toestand zonder extra mutatieknop of globale loader. Operatorconfigure-payment-polling behoudt verse productievars/bindingen/secrets, geen providerproef. Zie docs/AUTOMATISCHE-TIKKIECONTROLE.md; geen functionele tests uitgevoerd.

## Achtergrondinterval en kosten — 24 oktober

shared/notification-schedule is de gedeelde bron van kwartierinterval, cron en heartbeatmarge. Backend bewaakt dezelfde vensters, browser leest statusinterval met gedeelde fallback. Bestaande operator configure-payment-polling publiceert Pages en eigen Worker zonder secrets te vervangen; source/cron samen zodat een codepublicatie niet alleen de uitlegteks verandert. Geen nieuw periodiek rapport, usagecollector of provideractie toegevoegd. Zie docs/CLOUDFLARE-KOSTEN.md.

## Cloudflare-providertransport — 24 oktober

Workers ondersteunt geen redirect:error. Marketingprovider, web-push en cronworker gebruiken manual, behandelen3xx als fout en volgen geen Location met auth. Marketingcacheversie2 is een readerreleasegrens, geen credentialmigratie. Geen token of providerpayload loggen. Zie docs/GOOGLE-VERBINDING-HERSTEL.md; geen functionele tests/providerproef.

## Formulier-MIME en klantvelden — 26 oktober

mail-content.decodeMailHeader is passieve RFC2047B/Qdecodering met charset/foutfallback en CR/LF/NULsanering, gebruikt voor subjects in gmailMessage en formulierkandidaten. inquiryText normaliseert gemengde literal-newlines alleen bij meerdere veldgrenzen. recognizeRequest hergebruikt parseFormInquiry voor bekende formulierkandidaat, zonder ontvangerbeleid te verruimen; websiteafzender nooit als klantfallback. Mailworkspace kiest oorspronkelijke kandidaat naast huidige reactie. Publicatieoperator heeft afzonderlijke websitebasisguard; geen providerread/echte dossiermutatie als QA. Zie docs/FORMULIERHERKENNING-20261026.md.

## Productvarianten en feedback26oktober

Shared product-design-variants bevat uitsluitend metadataprojectie, finalebasis en validatie; artwork blijft bestaande files. Productsave één state/files-transactie, append-only versies en klant-/productsignature, geen nieuwe store/migratie. Finalekeuze via bestaande merge en confirm; readiness/progress/production-release lezen dezelfde projectie. PDFdefault vraagt actuele finale; voorstelvariant expliciet in query. Editorvoorbeelden zijn alleen vluchtige renderprojecties, niet in opgeslagen state. Fontbytes bounded in ui.customFonts met dezelfde bytes voor FontFace en OpenType, portable allowlist/dedup en gedeelde historystrings. Nieuwe helpers behouden klassieke laadvolgorde; mailwijzigingen alleen bestaande afgebakende stylesheet/UI. Cacheimportketen tekstueel bijgewerkt. Geen automatische tests/checks/builds/browserQA of publicatie.

## Batch1 ontwerpvarianten — 26 oktober

Variantmetadata heeft optionele sourceBasis uit de feitelijke JSON; nieuwe saves geven die altijd mee. currentFinalVariant vereist passende bronmaat/aantal naast de exacte versie/productbasis. UI leest immutable JSON/PNG via de bestaande bedrijfsopslag buiten de mutatietransactie; selectFinalVariant vergelijkt daarna opnieuw de volledige actuele keuzehandtekening en metadata. Geen async callback in mergeStoredState. Legacybronbasis wordt vóór de save opgehaald, met herhaalde guard binnen de gezamenlijke state/files-transactie. Alleen expliciete legacyversies mogen ontbrekend historisch PNG/tijdstip behouden; geen ontbrekende originele JSON verzinnen. Oude imageapproval gebruikt ook mergeStoredState en weigert managedvarianten, orderstatus vervangt geen finale keuze. Geen nieuwe datastore, provideractie of test/build/browserQA; docs/BATCH1-ONTWERPVARIANTEN-20261026.md.

## Batch4 mail en labels — 26 oktober

mail/thread-labels houdt uitsluitend een vluchtige weergave-/vergelijkingsbasis per gemounte strook. shared/mail-thread-labels levert bij afgewezen CAS actuele labels op het Errorobject; geen statewijziging bij conflict. Opnieuw kiezen vergelijkt de nieuwe basis in dezelfde centrale transactie. Eigen controls blijven onafhankelijk van Gmailreviewbusy; late oude mounts niet schilderen. Mailrefresh leest na await de actuele formseed en bewaakt DOM/selectie/dialog/busy; seed herbeoordeelt replyvoorwaarden, bewaard anker blijft bij heropbouw. Bestaande composer/provider-/opslagroutes behouden, geen tweede zakelijke store of nieuwe rechten. Opmaak alleen in bestaande afgebakende mail.css. Geen tests/build/browserQA/publicatie; docs/BATCH4-MAIL-EN-CRM-20261026.md.

## Open feedbackpunten — 27 oktober

Automatische Spatlappen-vrijgave is een read-only projectie via productionReleaseInfo/salesFunnel, gedeeld door readiness/werkvoorraad/voortgang. Geen nieuwe datums op render. Workflowbasis uitsluitend toevoegen wanneer nieuwe automatische voorwaarden actief zijn; gewone bestaande Maat-/Gmailbasissen behouden. Percentage apart transactioneel aanpassen. Voorbereid document/link anders dan verzending. Google Routes-serverengine in cloudflare/google-routes-provider.js wordt zowel door cloudflarehandler/integrationStore als lokale assistantadapter gebruikt; fixed host, eigen bedrijf/secretopslag en CAS, nooit browserimport. Browserroute houdt alleen een tabbladraming/signatuur/voorstel bij; bestaande kostenprojectie en actuele mapcontext blijven leidend. Bij heropbouw blijft onbewaard configformulier als DOM behouden, geen secretbrowserdraft. Nieuwe lokale servercode moet nog worden geladen, onlinepublicatie apart. Geen tests/providerproef.

## Algemene codelezing — 27 oktober 2026

workspace/transactions.js bewaakt synchrone callbacks en breekt af bij opbouwfouten; store() gebruikt dezelfde hulp en mergeStoredState weigert thenables. Centrale state verandert bij de overgezette klant-/order-/adres-/categorie-/archiefacties pas na commit. Oude generieke save() en contextgetter verwijderd. workspace/dossier-actions factory via actuele context; shared/order-copy pure kopieregels, bedrijfsbeginfase via caller. Geen variant-/definitief-/fileverwijzing of afgeleide inkooptoerekening in nieuwe order. Nummer uit actuele merge, oorspronkelijke order ongewijzigd. Adresdraft bewaart eigen beginbasis in tabgeheugen/DOM, geen nieuwe businessstore.

CloudTransaction scheidt requestcallbacks voor wachtrijopbouw van tx.oncomplete na commit. Callbackfout na commit mag geen transactieabort simuleren; aparte browserfoutmelding. Abort bewaakt uploadgrenzen; na start commit geen terugdraaiing beloven. Stale delete controleert waargenomen beginbasis; eigen writes/clear zijn geen externe wijzigingen. Volledige vervanging en globale observed-map blijven een bredere conflictgrens, geen nieuwe per-recordversies. Refreshdisposer verwijdert listeners en negeert late antwoorden; browserDB ruimt verlaten late opens op en sluit bij versie-upgrade. Geen data-opruiming.

Open: lokale back-upherstelcoördinatie over losse databases/diensten, login naast actieve invoer bij401, bredere feature-/offlineconflicten en context-/geldhulpen. Zie docs/ALGEMENE-CODELEZING-20261027.md. Geen tests/checks/build/browserQA/publicatie.

## Werkbladen in Excel-stijl — 27 oktober 2026

Centrale stijlblok in admin/style.css voor neutralere tokens, lichte zijbalk, vaste rasterlijnen/rijen, compacte tabs/forms en vlakke vlakken. Mail volgt de expliciet toegestane mail/mail.css met breed register boven detail; bestaande order-/mobiele picker-visibility blijft leidend. Alleen presentatiemarkup in mail-workspace, customers/views en workspace/task-list: vaste kolomkoppen, native rijbuttons en berichtmetadata. Geen ARIA-grid/bewerkbare cellen, extra appstatus of opslagcontract. MailSeed/handlerattributen en gegevens/reply/export gescheiden van de visuele schil. Losse tools en geproduceerde documenten behouden hun eigen opmaak. CSS/importcache excel-style-20261027. Geen tests/browseruitlezing/build/publicatie; EXCEL-STIJL-20261027.md.

## Opmaakreferentie en navigatiepresentatie — 27 oktober 2026

Exact Online vervangt de te breed toegepaste Excelrichting. De laatste centrale stijlsectie is vervangen, niet nog een centrale override toegevoegd. Thema in admin/style.css, toegestane mailuitzondering mail/mail.css. navigation-icons.js levert statische eigen SVG-lijniconen, navigation.js behoudt bestaande groepen/routeIDs/labels en levert tekstuele bedrijf-/modulecontext. app.js injecteert alleen die presentatie bij de bestaande zoek-/exporttoolbar; geen nieuwe opslag/bediening/module-/bedrijfsswitch of globale state. Bestaande sidebar/mobile slots, inklapvoorkeur en formulier-/mailSeed-/CASbescherming behouden. Losse canvas/calculator/PDF/mailinhoud ongemoeid. Openbare Exactreferentie is brononderzoek, geen eigen CRM-QA. Zie docs/EXACT-REFERENTIE-20261027.md; lokaal, eigen controle open.

## Compacte dossierpresentatie — 27 oktober 2026

orders/progress rendert dezelfde pure orderProgress-projectie met native details rond de volledige bediening; huidige fase/actuele uitvoering blijft compact. money-summary voegt alleen een gesloten detailsshell en korte tekst over bestaande t.net/t.balance toe; geen herberekening of opgeslagen UIstate. orders/workspace vraagt compact:true bij sales-funnel.panel. Die optionele presentatieroute gebruikt dezelfde readiness-/nextprojectie en bestaande handlers, bewaart waarschuwinghook/review; algemene panelroute blijft. CSS centraal, hoverkleuren gekoppeld aan lichte sidebarvariabelen corrigeren. Geen nieuwe formulieren/storage/eventhandlers/regels, geen browser-QA/tests/publicatie.
