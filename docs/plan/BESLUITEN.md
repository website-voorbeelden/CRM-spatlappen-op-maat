## 27 oktober 2026 — dossierkop op belangrijke informatie richten

Gebruiker verwerpt de dichte fase-/geldregel: te veel nevenschikkende informatie en onbekende bedragen. Klant/order/acties, drie grotere kerngegevens (betaling, wachttijd met startbasis, uitvoering/levering) en afzonderlijke tabs. Fases & voortgang via Meer, bestaande financiële onderdelen behouden. Geen nieuwe financiële regels of workflowwrites. Gedeelde bron, centrale CSS-eigenaar; beperkte lokale Maatweergave met expliciete toestemming bekeken. Geen automatische tests/builds/brede QA/publicatie; overige gevallen/mobiel/gebruikercontrole open. Zie ../ORDER-IN-EEN-OOGOPSLAG.md. Oudere kopbesluiten zijn vervangen.

## 27 oktober 2026 — Opmaakbatches2–4 en voorwaardenbijlage

Philippe vraagt alle drie vervolgbatches en levert de voorwaarden-PDF. Expliciet alleen Maatwerkkunststof. Eén vaste bedrijfsdocumentallowlist, originele PDF, uitsluitend op gekozen toevoeging een gewone orderbijlage. Geen algemene automatische mailbijlage, geen upload op naam gelijkstellen, geen schijnbestand in clipboard. Browserafhankelijke kopie/drag met downloadterugval; daadwerkelijke mail via gewone preview/bevestiging. Exact één PDFpad uitzonderen bij toekomstige Maatbuild, niet alle PDFs toelaten; Spatasset vóór oplevering verwijderen. Presentatie blijft in featuremodules/centrale CSS, actuele state/CAS/versies blijven leidend. Bron lokaal/review; gebruiker test zelf en publicatie apart. Zie ../BATCHES2-4-OPMAAK-20261027.md en ../ALGEMENE-VOORWAARDEN-BIJ-ORDER.md.

# Besluitenlog

Noteer hier keuzes die een volgende bouwer anders opnieuw zou maken. Vermeld aanleiding, keuze, gevolg en wanneer herziening zinvol is. Tests en de laatste wijziging horen in `OVERDRACHT.md`; geplande functies in de roadmap.

## 2026-10-16 — Eén gedeeld product, stapsgewijs ordenen

**Aanleiding:** losse uitbreidingen en een groot appbestand maken de samenhang moeilijk te zien.

**Keuze:** behoud bedrijfsprofielen en opslaggrenzen. Haal echte onderdelen geleidelijk uit `admin/app.js`. Start met `admin/workspace/` voor menu en ontwikkelplan. Maak geen nieuwe CRM-kopie en verplaats geen bestaande bestanden alleen om de boom netjes te laten lijken.

**Gevolg:** bestaande routes en producttools werken door; het appbestand blijft voorlopig deels groot. Klanten is het eerste geplande dossieronderdeel voor extractie. Herzien zodra die migratie aantoonbaar werkt.

## 2026-10-16 — Documenten als UX-voorbeeld

**Aanleiding:** de gebruiker vindt de documentenpagina helder en wil ‘less is more’.

**Keuze:** lichte werkvlakken, overzichtelijke vakken, hoofdactie dichtbij de taak, extra beheer bij Meer, zichtbare prijs/marge waar relevant. Groepeer het menu op Werkdag, Verkoop & relaties, Uitvoering en Beheer. Behoud bestaande routenamen.

**Gevolg:** geen volledig nieuw thema of overdadige startpagina. Schermen worden per werkstap verbeterd en met de huidige functionaliteit vergeleken. De precieze afspraken staan in `docs/UX-WERKPLEK.md`.

## 2026-10-16 — Eén planning, meerdere leesvormen

**Aanleiding:** toekomstige ideeën verdwijnen in lange overdrachten.

**Keuze:** `shared/planning/roadmap.js` is de bron voor het CRM-plan en het gegenereerde `docs/plan/ROADMAP.md`. Stabiele IDs, volgorde, bedrijven, doel, volgende stap, afhankelijkheden en klaarcriteria horen bij elk item. Geen deadlines of voortgangspercentages verzinnen.

**Gevolg:** wijzig de bron, voer `npm run plan` uit en laat `npm run check` verouderde documentatie detecteren. Feedback komt eerst ter beoordeling binnen; het is geen automatische bouwopdracht.

## 2026-10-16 — Automatisering begint bij een voorstel

**Aanleiding:** minder dubbel invoeren en handmatig onthouden, zonder ongecontroleerde opvolging.

**Keuze:** begin met bestaande taken/funnel en één voorstelroute. Beschrijf aanleiding, voorwaarden, gevolg, bevestiging, herhaling en herstel vóór een uitvoerder wordt gebouwd. Gebruik ClickUp/Exact als procesinspiratie, niet als extra gekoppelde accounts.

**Gevolg:** geen nieuwe echte mails, providerwrites of automatische facturen in deze ronde. De benodigde controles en eerste recepten staan in `AUTOMATISERINGEN.md`.

## 2026-10-16 — Gewone aanvraagmails eerst lokaal herkennen

**Aanleiding:** AI-bediening voelt traag en de gebruiker wil nuttige voorinvulling uit terugkerende aanvraagstructuren.

**Keuze:** chatstart los van spraakstatus, status kort hergebruiken en de calculator-AI als één venster openen. Nieuwe pure herkenningsregels staan in shared/request-recognition.js, de controlewerkplek in admin/inquiries/. Expliciete eenheden en eenduidige bronwaarden vullen velden alvast in; conflicten en meervoudige producten blijven ter controle. Bestaande geverifieerde formulierautomatisering wordt niet verruimd.

**Gevolg:** gewone mailherkenning vraagt geen AI-aanroep en leert niet automatisch van klantmail. Bevestiging maakt via de bestaande atomaire route een aanvraagconcept en mailkopie. Nieuwe patronen vereisen geanonimiseerde fixtures en controles op onbekenden, conflicten en bronherkomst. Meerdere productregels, bijlagen lezen en zelflerende regels blijven vervolgwerk.

## 2026-10-16 — Terug naar drie vormfamilies en gesloten werkdelen

**Aanleiding:** gebruiker vindt de zes tegels, hoekgaten en X/Y bij ieder gat te druk. De eerdere interpretatie van X/Y was te breed.

**Keuze:** vormfamilies Vierkant/Rond/Mangat, dan een passende uitvoering. Ronde boutgaten krijgen één aantal/diameter/steekmaat, losse X/Y-bediening is een extra. Stukken/nesting/leverancierstarieven starten dicht; DXF onder de preview. Interne coördinaten en veiligheidsregels blijven behouden.

**Gevolg:** geen nieuwe functies nodig om deze UX te verbeteren. Bestaande geavanceerde functies blijven via uitklappers beschikbaar. Deze voorkeur geldt ook voor de rest van de tool; meer functionaliteit mag niet vanzelf meer permanent zichtbare knoppen opleveren.


## 16 oktober 2026 — Eén klantwerkplek, bestaande vervolgstappen

Klantdossiers openen met lopende dossiers, contact en betalingen. De bestaande workQueue bepaalt de prioriteit en actie; er is geen tweede takenregistratie. Maximaal drie direct zichtbare dossiers beperken drukte. Documenten en mail blijven de bestaande dossierweergaven. Klantlijst en dossierweergave zijn werkelijk afgesplitst naar admin/customers/views.js; mutaties en adresformulieren volgen later. Oude routes blijven geldig. Onbekende prijzen worden geen voldaan/nul-signaal; dezelfde read-only financiële projectie geldt in lijst en dossier. Deze wijziging activeert geen externe koppeling, opvolging of verzending.


## 16 oktober 2026 — Aandacht volgt echte berichten

Wachttijd begint bij het oudste onbeantwoorde bericht binnen hetzelfde gesprek. Conceptbewerkingen en leesstatus stoppen geen teller. Geaccepteerde CRM-verzending of Gmail-verzending kan dat wel; onzekere resultaten blijven controle vragen. De mailbox en bestaande ordertaken delen één pure projectie; filtering/sortering blijven presentatie. Geen nieuw extern taakplatform, automatische opvolgmail, handmatige prioriteitsdatabase of Gmail-statusmutatie toegevoegd. Extra bediening staat bij Meer; ontbrekende datums worden zichtbaar onbekend.


## 16 oktober 2026 — Alleen bestaande Spatlappen-installatie bijwerken

Gebruiker autoriseert alleen Spatlappen live. Bestaande DB/bucket/login blijven leidend, zonder lokale testgegevens te importeren. Voor/na exacte vergelijking, database-export/herstelpunt en alle privébestanden met checksums. Opgeslagen providerreferenties worden niet aangepast om nieuwe validatie te laten passen; validator accepteert het bestaande specifieke Tikkie-formaat, met behoud van interne ID-controles. Pages-staging gebruikt standaardconfig in een aparte werkmap. Maatwerkkunststof en de lokale AI/Gmail-hulpdienst krijgen later hun eigen online inrichting.


## 16 oktober 2026 — Basisinvoer zichtbaar, bijzondere vormen optioneel

De eerdere interpretatie van less is more verborg dagelijkse invoer. Stukken en leverancierstarieven staan daarom open. Nieuw: massieve rechthoek zonder gaten; aantal, materiaal, dikte en buitenmaten direct invulbaar. Vormfamilies en gaten blijven achter één extra onderdeel. Plaatprijs en plaatmaten blijven direct zichtbaar; SVG heeft geen eigen Meer-menu. Nesting staat onderaan na de leveranciers. Lokale Maatwerkkunststof-productlinks openen V2 en lezen de bestaande order; bekende aanvraaggegevens vullen lege productvelden aan, uitsluitend bij één product. Bestaande V1/V2-berekeningen behouden hun exacte invoer en tarieven. V1 blijft ongewijzigd bereikbaar en leidend in de gewone cloudbuild; deze lokale UX-correctie publiceert niets.


## 16 oktober 2026 — online mail gebruikt dezelfde bedrijfsregels

Gmail en SMTP2GO kunnen voor Spatlappen op de bestaande beschermde Pages Functions draaien. Cloudflare/integration-store.js scheidt versleutelde dienstinstellingen van zakelijke CRM-snapshots. De serversecret staat buiten D1, met bedrijfs-/naamgebonden AES-GCM. shared/gmail-message.js en shared/mail-service.js bevatten dezelfde formatter/verzendregels voor lokale en online adapters. Local filesystem-credentials worden niet naar de cloud gekopieerd. D1-versiecontrole en een tijdelijke lease voorkomen gelijktijdige instellingen/verzendingen. OAuth is alleen lezen en gebonden aan de bestaande sessie, clientconfig en verwachte mailbox. De bestaande /__local/assistant/... URL’s blijven voor compatibiliteit bestaan, ook bij online uitvoering. Geen lokale bypass in productie.

De geïntegreerde AI blijft lokaal. Pure assistant-engine staat nu in shared/assistant-engine.js met een compatibele export in assistant/engine.mjs, maar dit maakt nog geen online AI-dienst. OpenAI documenteert de openbare eigen-client-ChatGPT-route met verplichte loopbackcallback; commerciële website-integratie heeft afzonderlijke toelating. Geen private ChatGPT-token naar Pages kopiëren en geen API-kosten activeren zonder gebruikerskeuze. Bestaande handmatige AI-prompts/export blijven online bruikbaar.

Gebruikersfeedback is een bewaarde bron, geen automatisch bouwplan of afgeronde taak. De 15 online meldingen zijn gelezen; status en inhoud blijven intact. docs/plan/FEEDBACK-SPATLAPPEN.md is een technische samenvatting zonder klantgegevens, geen tweede takenadministratie.


## 16 oktober 2026 — gebruiker kiest ChatGPT-abonnement

De expliciete gebruikerskeuze is ChatGPT-abonnement blijven gebruiken. Geen automatische API-fallback of apart API-verbruik. Online inrichting is nog niet gereed. Website-identiteit en planinference zijn verschillende rechten/routes. De officiële self-hosted-VMroute voor geschikte open-source apps bestaat wel; loopback is daarom geen algemeen verbod op servergebruik. Eerst geschiktheid van deze app en passende hosting/credentialbeheer vaststellen; niet zonder meer de lokale token naar Pages kopiëren of commerciële websiteclient gelijkstellen aan modeltoegang. Zie officiële documentatie: https://developers.openai.com/siwc/token-sharing-open-source/self-hosted-vms en https://developers.openai.com/siwc/website .


## 17 oktober 2026 — zoeken en wijzigingen vanuit dezelfde bron

Documenten worden gereviseerd, niet overschreven. Heropen de bewaarde payload; actuele orderwaarden alleen bewust herladen. Reeksidentiteit bevat eigenaar/type/nummer/rootgeneratie; laatste revisie en bronsignatuur worden in dezelfde opslagtransactie opnieuw gecontroleerd. Factuurcorrecties blijven een afzonderlijke financiële werkroute; geen stille wijziging van een bestaande factuur. Zoekresultaten en tellers gebruiken dezelfde revisiegroepering.

Algemene zoekfunctie leest een veld-allowlist uit de huidige bedrijfsstate. Exacte nummers vóór deelmatches; typefoutsuggesties alleen voor woorden. Geen externe zoekindex of AI-aanroep, geen credential-/bestandsinhoudindex. Resultaatbestemmingen zijn vaste bestaande routes. Klikken controleert opnieuw of het record nog bestaat; onbewaarde invoer blokkeert navigatie.

Betalingen bereiden vervolgstappen voor via één read-only gereedheidsprojectie. Niet automatisch ontwerp goedkeuren, leverancierbestelling verzinnen of een mail versturen. De 70%-wens is vastgelegd als vervolgstap voor een expliciete aanbetalings-/vrijgaveregel per order; bestaande orders blijven beschermd. Mailthreads kiezen betekent nu antwoordcontext met onderwerp en RFC-headers, geen belofte dat SMTP bestaande Gmail-threads geforceerd kan samenvoegen. Officiële Gmail API-documentatie: https://developers.google.com/workspace/gmail/api/guides/threads .


## 17 oktober 2026 — website-metingen zonder bedrijfsopslag te vermengen

Eerst de actuele publieke websitebron opgehaald; oude uploadmappen niet overschrijven. Bestaand Cloudflare-beacon behouden, aanvullende first-party metingen op afzonderlijke D1, optioneel gedrag zonder formulierinhoud. Gelijkwaardige weigeren/toestaan, intrekken en GPC; aanvragen blijven werken. Alleen succesvolle provideracceptatie telt als ontvangen formulier, onafhankelijk van gedragstoestemming en zonder bezoek-ID bij weigering. Statistiek is best effort en geen financiële waarheid.

Exacte aanvraag-ID uit de ontvangen bronmail kan bij gecontroleerde nieuwe CRM-intake worden bewaard. Geen bestaande orders raden op e-mailadres; dupliceren neemt die ID niet mee. Cohort bevat huidige offerte-/betaalstatus en benoemt niet-gekoppelde aanvragen. Geen automatische mails, Google/Gmailrechten of statusovergangen. De aparte meetdatabase, beide bindings en publicatie zijn nog nodig; dit lokale werk is geen live meting.

## 17 oktober 2026 — Kleine offline werkplek op live oorsprong

Gebruiker wil gewone browser/live URL met echte gegevens, ook zonder verbinding. We kiezen een vooraf klaargemaakte beperkte klant-/orderwerkplek, geen volledige cloudopslag-emulatie. Centrale data blijft leidend; veldvergelijking, CAS, unieke ID’s, centrale nummertoewijzing en controle van verloren commitbevestiging beschermen gelijktijdig werk. Sync is expliciet. Een online 401/403 wordt nooit een cachefallback. Zeven gecontroleerde code-assets mogen in Cache Storage; snapshots/auth/providerresponses niet. Codepubliekheid geeft geen toegang tot centrale gegevens. Lokale kopie vraagt eigen apparaat en heeft 24u offline toegang; invoer blijft na expiry bewaard tot opnieuw aanmelden.

Serviceworker volgt netwerkfoutfallback, niet willekeurige HTTP-fouten; primaire referentie: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers . API/mail/betaling/upload zijn altijd network-only en worden niet later automatisch uitgevoerd. Dit vervangt de eerdere conclusie dat alleen localhost offline kon; die oude beschrijving blijft historisch in OVERDRACHT.

## 17 oktober 2026 — Eerst de takenlijst, daarna klein beginnen

Gebruiker stuurt lange wensenlijst en vraagt uitdrukkelijk eerst ordening en antwoord over online/offline, daarna taak voor taak beginnen met wat eenvoudig is.26nieuwe gerichte items toegevoegd aan bestaande canonieke roadmap; geen roadmap als uitvoerautorisatie voor alle provider-/financiële acties behandelen. Felpaars favicon en Gmailinstelhulp eerst; volledige offline, adsattributie, btwvoorbereiding en internationale fulfilment apart.

Analyticscode die al in bewerking was blijft lokaal bewaard en ongepubliceerd, met ontbrekende Googlecredentials en onvolledige specifieke testdekking expliciet. Gebruiker heeft alleen Search Console, geen GA4. Geen Googlekoppeling/trackercode/DNS/mailactie uitgevoerd. Advies en actuele primaire bronnen staan in ADVIES-2026-10-17.md. GmailWeb-client is los van lokaalDesktopclient; januari2027wijziging gaat over POP/Gmailify, geen bewijs dat SMTP2GOAPI of forwarding uitvalt.

## 17 oktober 2026 — Ontwerpkeuzes horen bij dezelfde productregel

Aanvullende gebruikerswens vastgelegd als taak 27, product-design-alternatives: meerdere bewerkbare ontwerpen bij één product/maat bewaren tot de klant kiest. Productaantallen en prijzen niet dupliceren; alternatieven onderscheiden van revisies en één definitieve keuze expliciet vastleggen. Huidige admin/product-designs.js vervangt het bewerkbare ontwerpbestand bij opslaan; bestaand ontwerp/voorbeeld en goedgekeurde beelden moeten bij de latere uitbreiding behouden blijven. Nu alleen planning bijgewerkt, geen opslagcontract, productdata of liveversie gewijzigd.

## 17 oktober 2026 — Reisgebruik eerst beperken tot bekijken en feedback

Gebruiker wil nu vooral de vertrouwde CRM-opmaak op het vliegveld gebruiken en feedback behouden. Daarom een expliciete Offline-modus met een alleen-lezen dossierkopie en aparte feedback-outbox, niet wachten op volledige offline bedrijfsadministratie. Online voorbereiding, 24u toegang, eigenaar/bedrijf, geen providerqueue, append-only overzetten en conceptbehoud zijn leidend. De onafgemaakte analyticsuitbreiding blijft buiten deze kleine Spatlappen-release.

Voor publicatie 26 echte feedbackmeldingen gelezen (eerder 24). Twee nieuwe wensen vastgelegd, niet uitgevoerd: vroege WhatsApp-aanvraag zonder prijs/akkoord (taak 28) en productievrijgave vanaf 50% aanbetaling (vervangt eerdere 70%-wens in taak 14). Geen betaling of orderstatus aangepast.


## 2026-10-17 — Kleine invoerverbeteringen zonder financiële aannames

**Aanleiding:** de gebruiker vraagt concrete taken af te werken, met eenvoudige bediening, onbekende prijzen bij vroege aanvragen en geldinvoer met komma of punt.

**Keuze:** leg alleen bevestigde gaten/oppervlakkeuzes vast; gebruik die als bewerkbaar voorstel voor nieuwe documenten. Teststuk is een ordermarkering met opvolging en bestaande kostprojectie. Een nieuwe aanvraag krijgt geen stil afgesproken levertijd. Voorkeursbatch is een zichtbaar voorstel dat opnieuw gevalideerd wordt bij opslaan. Decimalen worden aan de formuliergrens genormaliseerd, zonder nieuw geldmodel of wijziging van historische waarden.

**Gevolg:** bestaande orders, PDF's, prijzen, betaalregistraties en batchkoppelingen worden niet gemigreerd. Fictieve formulier-/werkvoorraadtests en beide bedrijfsbuilds controleren het gedrag. Productievoorwaarden van 50%, betalingsverwijdering, nieuwe analytics en meerdere ontwerpvarianten blijven aparte concrete taken; deze ronde verandert die niet. Publicatiestatus staat per taak en bovenaan de overdracht.


## 2026-10-17 — Wensen duurzaam overdragen zonder tweede backlog

**Aanleiding:** Philippe wil de Spatlap-preview in een andere chat bewerken en niet steeds de hele productbedoeling opnieuw uitleggen.

**Keuze:** docs/PROJECTCONTEXT.md bundelt de werkprocessen, leidende UX-correcties, preview-ingangen en een vindkaart naar canonieke roadmap-IDs. AGENTS.md maakt dit een vaste leesstap. Ontbrekende concrete feedback is als taken29–34 toegevoegd met oude nummers intact; online ChatGPT-aanmelding en verdere mailherkenning blijven afzonderlijk benoemd. De gebruikerslijst wordt uit dezelfde bron gegenereerd.

**Gevolg:** dit is projectgeheugen, geen automatische toegang tot nieuwe feedback of toekomstige chats. De roadmap houdt uitvoerstatus bij, nieuwste OVERDRACHT publicatie/testbewijs; context mag niet als tweede afwijkende statuslijst gaan leven. Geen previewcode, account of businessdata gewijzigd door deze overdracht.

## 17 oktober 2026 — lokaal blijven en Analytics bruikbaar zonder meetdienst

Philippe test de bediening zelf; we blijven lokaal totdat hij tevreden is en expliciet publicatie vraagt. Geen uitgebreide nieuwe browser-QA in deze ronde; gerichte regressie en verplichte projectcontrole blijven. Maat toont voorlopig uitsluitend financiële Analytics. Spatlappen Aanvragen toont afzonderlijk herkenbare lokale dossiers bij een ontbrekende website-meetdienst, zonder bezoekcijfers te schatten. Volledige analyticsacceptatie en offlinepreview blijven open.

## 17 oktober 2026 — leverwijze expliciet, gerichte hiaten bij aankomst

Voor taak7 geen leverwijze raden uit prijs, leveranciersstatus of losse tekst op historische documenten. Een optionele nieuwe orderkeuze legt de afspraak vast zonder productie/verzending af te tekenen. Bij naderende levering vervangt één gerichte lijst de algemene voorbereidingshiaten; optionele factuurmail blokkeert daar niet. Een werkelijk bekend betalingsrestant blijft zichtbaar. Onbekende productkostprijs is een hiaat, expliciet nul niet. Bestaande fases, betalingen, IDs en adressen blijven ongewijzigd; gebruiker doet de lokale bedieningstest.


## 2026-10-17 — Afvinken en commentaar horen in het CRM

**Aanleiding:** gebruiker vraagt de takenlijst letterlijk in het CRM te beheren, ook door volgende AI-bouwers.

**Keuze:** hergebruik route development en noem die Bouwtaken. Houd codecatalogus en runtime-log apart. Bouwers leggen status, publicatie, auteur, nieuwe notitie en controlebewijs vast; eerdere UI-logregels blijven staan. Geen automatisch afvinken door alleen een groene build of nieuwe release. Een logregel is geen nieuwe gebruikersopdracht of accounttoestemming.

**Gevolg:** het eerdere uitsluitend-read-only planbesluit is voor voortgang/commentaar ingehaald. Status kan in het CRM afwijken van de fallback uit de bron. Lees in volgende chats de juiste CRM-omgeving of actuele export; geen claim dat een lokale notitie automatisch in live staat. Voor takeninhoud blijven broncatalogus en npmrunplan leidend. Geen businessdatawijzigingen of nieuwe database/schema-migratie nodig.

## 17 oktober 2026 — eigen HTML-handtekening in gewone CRM-mail

Gebruiker wil HTML kunnen uploaden en echte HTML-mail verzenden. Daarom HTML naast de bestaande gewone tekstconfig, geen HTML-code in het berichttekstvak plakken. Een allowlist behoudt normale inline mailopmaak; preview en provider gebruiken dezelfde bouwer. Afbeeldingen moeten met de HTML meekomen als ondersteunde data-afbeelding of via HTTPS bereikbaar zijn; lokale/CID-verwijzingen worden niet als bijlage geïmporteerd. Geen echte mailproef of Gmailmutatie uitgevoerd. Beide CRM-diensten lokaal herstart om de bijgewerkte engine beschikbaar te maken, gegevens en browsertabs behouden.

## 18 oktober 2026 — twaalf concrete lokale bouwtaken voortgezet

Taken9–14,16,29–33 lokaal gebouwd. Werkplekbediening en bedrijfsregels blijven gedeeld; nieuwe code per onderdeel, geen tweede CRM. Alleen gebruikershandelingen registreren leverwijze, vrijgave, betaalcorrectie, extra kosten of documenten. Scenariokosten en routevolgorde blijven tijdelijk. Geen verzonnen transporttarief, prijsstaffel, verzenddag of automatische fysieke voortgang.

Betaalcorrecties bewaren originele ontvangsten en importbescherming; echte providerbedragen en definitieve facturen veranderen niet. De nieuwste 50%-wens vervangt een voorstel van70%, maar wordt per order expliciet gecontroleerd en bevestigd. Klantnummer/hoofdafbeelding blijven los van interne identiteit/ontwerpgoedkeuring. Factuurontvangstselectie verandert uitsluitend de expliciete vermelding op een nieuw document.

Bouwstatus en publicatie afzonderlijk in beide CRM-bouwlogs geregistreerd onder Codex CRM en teruggelezen. Taak6 blijft Mee bezig; Google/website-integratie, volledig offline, ontwerpvarianten, uitgebreid maatwerkvoorraadbeheer, server-betaalscheduler en verdere werkplek-/calculator-/documentroutes zijn hiermee niet afgevinkt. Geen publicatie of echte mail/Gmail/bank/Tikkieactie.

## Tijdelijke prijsindicatie Spatlappen — correctie 18 oktober 2026

Taak 15 is nog niet gebouwd. De geschatte inkoop dient uitsluitend als tijdelijke persoonlijke hulp om een verkoopprijs te bepalen. Zodra Philippe de verkoopprijs vastlegt, verdwijnt de indicatie. Bewaar haar niet in klant/order/product/batch, calculatorhistorie, logs, documenten, exports of back-ups; neem haar niet op in werkelijke kostprijs, marge of analytics. Alleen de gekozen verkoopprijs wordt via de gewone prijsroute opgeslagen. Werkelijk ontvangen leveranciersprijzen en bestaande Maatwerkkunststof-berekeningen blijven afzonderlijke gegevens met hun bestaande betekenis. Geen bestaande echte kosten verwijderen.

## Ontwerptoolwensen 18 oktober 2026

Bouwtaken35–41 leggen feedback, formaatknoppen, kader-/groepsselectie, rode hulplijnen/snappen, zichtbare vectorgrenzen, gelijke witruimte en slimme import/plaatsingsvoorkeuren vast. Zie SPATLAP-ONTWERP-UX.md voor samenhangende bediening, referenties en grenzen. Alles eerst lokaal; plaatsingsleren is nog geen actieve gegevensverzameling.

## Eerste uitvoering — 18 oktober 2026

Lokaal gebouwd: feedback met bestaande bedrijfsopslag; 10%-formaatknoppen; kader-/groepsselectie en samen verplaatsen; rode tijdelijke snaplijnen met onafhankelijke toggles/Alt; expliciete plaatsingsreferentie en gelijke witruimte; passende nieuwe import onderaan. SVG-grenzen via gerenderde alpha tot2048pixels, conservatieve pixelmarge; geometrie blijft vector. Nieuwe SVG’s bijgesneden, bestaande alleen via expliciete actie met behoud fysieke tekening. Geen achtergrondmeting/verzameling voor leren.

Open: uitgebreide verdeelacties voor meerdere objecten, precieze cm-bediening verder vereenvoudigen, bijzondere SVG’s/masks/filters en extreem kleine details testen, plaatsingsvoorkeuren/leren. Extra imports verspringen maar er is nog geen overlapoplosser. Bestaande artwork/PDF-routes behouden; geen nieuwe druk-PDF fysiek geproduceerd.

Bron: shared/spatlap-layout.js pure geometrie (klassiek script voor preview), spatlap-preview.html DOM/bediening. admin/feedback.js optionele launcherHost/contextOverride; CRM-defaults gelijk. Nieuwe regressie tests/spatlap-layout.mjs inclusief inline-syntax; bestaande feedbacktest en volledige npmruncheck/beidebuilds geslaagd. Laatste kleine CSS/feedback-picker-/Escape-/links-rechtsaanpassingen daarna gericht gecontroleerd met syntax/geometrie/feedbacktest en beide builds.

## Selectiebalk en startinstellingen — 18 oktober 2026

Alleen Kopiëren en Dupliceren uit de selectiebalk verwijderd. Groter/Kleiner, Dupliceren naar andere zijde, Plaatsen, Vectorrand aansnijden en Verwijderen behouden. Toetsenbordkopiëren/dupliceren en lijstacties blijven beschikbaar. Desktoppreview bij selectie compacter zodat de balk bereikbaar blijft.

Nieuwe ontwerpen/reset: gaten uit, afgeronde onderkant. Automatische radius20% kortste zijde op0,1cm; handmatige radius stopt auto, checkbox zet auto opnieuw aan. radiusAuto in flapmetadata/history; oudere ontwerpen zonder vlag blijven handmatig en behouden hun instellingen. Expliciete URLradius handmatig; productmaten bepalen alleen bij auto opnieuw de radius. Nieuwe helperversie in scriptURL voorkomt oude gecachte helper.

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

## 18 oktober 2026 — editorbestanden in plaats van grote inline code

Gebruiker vraagt opsplitsing en oude workkopieën opruimen. Kies mechanische verplaatsing van functiedeclaraties met behoud van gedeelde bindings/initialisatievolgorde, om structuurverbetering niet te vermengen met herschrijven van opslag/bediening. CSS en boot/bootstrap apart. Bronparser alleen gebruikt om declaratiegrenzen te bepalen voor verplaatsing, geen check/test/build/browser-QA uitgevoerd. Uitgebreide onafhankelijke ES-modules zijn een latere expliciete stap.

Dertien oude gegenereerde Pages-/Functions-pakketten en npm-cache verwijderd (124,9MiB). Actuele release, actuele GitHubcheckout, oudere Gitcheckouts met mogelijk unieke historie en privéback-ups behouden. Verwijderlijst in work/refactor-spatlap-20261018/cleanup.json; actuele bron vóór splitsing tijdelijk behouden als before.html. Geen .local-/klantgegevens opgeschoond.

## 18 oktober 2026 — featurefactories rond bestaande CRM-status

Gebruiker autoriseert app.js opsplitsen en losse bestanden logisch plaatsen. Bestaande functies brongetrouw verplaatsen naar featurefactories; vrije verwijzingen naar modulebindings omzetten naar expliciete contextgetters/setters. Scopebewuste bronbewerking behoudt lokale variabelen en objectshorthand. Constructie declareert functies zonder scherm-/opslagacties; centrale state en transacties blijven in app.js. Geen circulaire import terug naar app.js. Niet tegelijk bedrijfsregels of provideracties herschrijven.

Compatibele oude module-ingangen behouden als re-export, nieuwe imports canoniek. Deze structuurwijziging blijft lokaal, niet stilzwijgend meenemen in productie. Gebruiker test zelf; geen tests/checks/build/browser-QA uitgevoerd.


## 18 oktober 2026 — tijdelijke Spatlappen-prijshulp

Handmatige indicatie + opslag in het prijsformulier, zonder schattingsopslag of wijzigingen aan werkelijke kosten. Geen automatische leveranciersprijzen zonder bevestigde tarieven. Alleen gekozen verkoopprijs via bestaande orderroute. Lokaal toegevoegd; gebruiker test zelf. Zie ../TIJDELIJKE-PRIJSHULP.md.


## 18 oktober 2026 — historische Erturk-prijzen als tijdelijke bron

Gebruiker vraagt automatische vergelijking op eigen opgeslagen positieve Erturk-inkoop. Lokale alleen-lezen vergelijkingsregel met expliciete bronfilters, maat-/aantalsgrenzen, drukkleuren en zichtbare bandbreedte. Nieuwe kosten doen bij volgende berekening mee; geen apart getraind model of schattingsopslag. Vervangt de eerdere beperking tot handmatige indicatie. Geen garantie dat meer data altijd nauwkeuriger is. Geen tests/publicatie. Zie ../TIJDELIJKE-PRIJSHULP.md.

## 2026-10-19 — Eerst pakbonnenreview, daarna één print-PDF

Gebruiker vraagt alle toepasselijke pakbonnen van een ontvangen Turkije-bestelling in één handeling printbaar, met vooraf waarschuwingen en bewuste override. Daarom eigen inkooptab met controlelijst, selectie en twee toepasselijke bevestigingen (hiaten / volledige nieuwe levering). Bestaande documentreeksen/revisies behouden; geen automatische regeneratie. Nieuwe documenten samen voorbereiden en in één bestaande transactie bewaren met bron-/nummercontrole, daarna één tijdelijke samengevoegde PDF. Geen leverstatus of voorraad boeken door downloaden. Onbekende adresvelden zichtbaar NIET INGEVULD bij expliciete override; ongeldige aantallen of ontbrekende klant eerst herstellen. Geen deelleveringsaantallen raden. Alleen lokaal gebouwd zonder tests/publicatie.

## 2026-10-19 — Lange pagina’s per taak, stijl centraal

Gebruiker noemt Instellingen onoverzichtelijk en vraagt tabs zoals de overige schermen, ook Overzicht, plus leesbare tekst/hover en zo veel mogelijk één stylesheet. Keuze: Instellingen6taken en Overzicht3taken; bestaande Analytics-tabs behouden. Formulieren blijven gemount bij interne navigatie om invoer en asyncstatus te behouden. Bestaande instellingenacties blijven leidend, geen saves/koppelingen door tabs. De vier hoofd-CRM-stijlbladen samengevoegd in admin/style.css, oude paden blijven lege compatibiliteit. Centrale tekst-/achtergrondparen, donkerdere hulptekst en expliciete hover/focus/selected-regels. Tool/calculator/mailinhoud apart houden. Geen tests of publicatie bij deze lokale wijziging.

## 19 oktober 2026 — Btw-redenen eerst, aangiftevoorbereiding apart

Gebruiker wil afwijkingen van21% terugvinden, bewust verklaren en eigen reden hergebruiken. Lokaal Btw-controle en gedeelde redenvelden gebouwd voor beide bedrijven. Bestaande bedrijfsstate/transactionele bewaarroute leidend; geen automatische fiscale classificatie uit land of percentage. Geen aangiftebedrag uit ordertotalen, aanvraagdatum of geschatte importkosten. Taak23 blijft research voor bronfacturen, stelsel, correcties, ICP/invoer en boekhoudaansluiting. Catalogus vat-exception-review benoemt lokale implementatie zonder test- of publicatieclaim. Zie BTW-CONTROLE.md.

## 19 oktober 2026 — Bronregister voor kwartaalvoorbereiding

Na vervolgopdracht kwartaalhulp lokaal gebouwd. Gebruiker bevestigt aparte btw-administraties en onbekend stelsel: default administratie apart, regime onbekend laten. Bestaande factuurpayload/bronreferenties leidend, geen orderbedragen of geschatte inkoop als aangifte. Inkoop/invoer, credits en bewijs expliciet invoeren; rubriekkeuze/controlestatus persoonlijk bevestigen. Voorbereiding bewaart bronboekingen en één gedeelde rekensamenvatting; latere wijzigingen signaleren nieuwe controlebehoefte. Geen indienen/suppletie/ICP/OSS/API-sends of combineren bedrijfsstaten.

Gebruiker weigert voor dit onderdeel opnieuw automatische tests. tests/vat-ledger.mjs alleen klaargezet, niet uitgevoerd. Geen syntaxchecks/build/browser-QA. Taak23 is lokale implementatie met resterende fiscale inrichting/gebruikercontrole, niet als voltooid/gepubliceerd afgevinkt. Zie BTW-VOORBEREIDING.md.

## 19 oktober 2026 — mailherziening eerst

Gebruiker meldt verkeerde afzender, ontbrekende bijlagenbediening, onduidelijke threads en dubbele/ontbrekende HTML-handtekening. Mail lokaal herzien vóór AI-vindbaarheid; die staat apart in roadmap. PDF-default voor facturen, Word-vink optioneel; tijdelijke Word-template als PDF-bron behouden. SMTP behouden met correcte headers/inlineimages, Gmail readonly en geen nieuwe scope/config namens gebruiker. Formuliermelding aan beheerder geeft geen garantie dat origineel bij klant bestaat. Ontvangen bijlagen alleen expliciet bekijken/bewaren, geen massale import van signaturelogo’s. Nieuwe bestanden/concept-ID’s met bestaande bedrijfsstate/filestransacties. Gebruiker staat mail/mail.css expliciet toe, afgebakend naast centrale CRMstijl. Niet getest/gepubliceerd; geen proefmails of Gmailwijzigingen. Volledig werkcontract MAIL-HERZIENING.md.


## 19 oktober 2026 — Gedeeld e-mailadres vraagt zichtbare klantcontrole

Een aanvraag met afwijkende persoonsgegevens kan voorlopig aan het ene bestaande e-mailmatchdossier gekoppeld blijven. Controleer expliciet bij openen order: bestaande klant houden, aparte klant voor deze order, of contactpersoon bij bedrijf. Bewaar inzending/keuzehistorie; overschrijf nooit bestaande primaire velden. Meerdere dossiers met hetzelfde adres vragen expliciete koppeling. Alleen lokale implementatie, gebruikerscontrole open.


## 21 oktober 2026 — Online CRM met persoonlijke laptop-AI als hoofdroute

Gebruiker kiest expliciet eigen laptop/browser in plaats van aparte gehuurde AI-server. Bestaande lokale ChatGPTConnection hergebruiken via afgebakende popupbridge, geen accounttokens aan de online site geven of publieke tunnel openen. Standaard dossierscope beperkt; bedrijfsbreed opt-in. Centrale CRM-data en menselijke backendgoedkeuring behouden. Aan/uit staat los van gewone CRM-beschikbaarheid. Eigen popup-/cookie-/openercontrole en gerichte publicatie blijven open; geen extra hosting besteld. VM-bron blijft optioneel, geen automatische fallback of API-billing.


## 21 oktober 2026 — vaste toestemming voor verkoopfaselabels

Nieuwe expliciete gebruikersopdracht: gekoppelde gesprekken volgen CRM en andersom, ook zonder verstuurde mail en na ontvangen betaling. Na bewuste perbedrijf-mapping/activering uitsluitend deze fase-labels automatisch toestaan. Gmailwijziging behouden tot relevante nieuwe CRM-handeling; gewone edits tellen niet mee. Botsende wijzigingen expliciet oplossen. Fase geen financieel/leverfeit. Eén gedeelde browsercoördinator/executor, servergebonden toestemming, geen AI nodig. Geen provideractie tijdens bouwen; 24/7-worker, gebruikerscontrole en gerichte publicatie blijven apart. Zie docs/GMAIL-FASESYNCHRONISATIE.md.


## 21 oktober 2026 — levertijd vanaf aanbetaling en Maat zonder drukwerk

Levertijd krijgt een eigen instelbaar aanbetalingspercentage (zichtbaar voorstel bestaande orderafspraak, anders50), cumulatieve werkelijke betaalontvangst bepaalt start; geen productieautomatisme. Bestaande leverafspraken niet omzetten. Vaste data behouden voorrang.

Nieuwe gebruikersopdracht om Spatlappen-ontwerp-/drukwerkresten uit Maat te verwijderen: render geen drukkleur/ontwerpgoedkeuringscontrols en geen printstatuskeuzes, maar behoud historische records/bestanden. Technische tekeningen/productbeelden blijven beschikbaar; nieuwe Maat-orders beginnen bij Nieuwe aanvraag. Eén shared bedrijfsprofiel, Spatroute behouden. Beide onderdelen alleen lokaal gebouwd, gebruiker test zelf, niet publiceren zonder opdracht.

## 2026-10-21 — Eén handtekeningcatalogus, keuze per afzender

Gebruiker wil zes afbeeldingen kunnen plaatsen, een contract voor zijn andere AI en eigen handtekening per e-mailadres. Behoud bestaande standaardvelden als compatibele fallback, voeg benoemde varianten/adresbindingen toe in de bestaande privéconfiguratie. Batchupload met expliciete vaktoewijzing, geen blinde volgorde. Automatische adreskeuze plus expliciete mailoverride; dezelfde selectieregels op server en in preview, met inhoud-/IDcontrole en instellingenversie. Totale catalogus begrensd800kB vanwege ook versleutelde opslag; kleine assets/hergebruik boven kopieën. Geen nieuwe provider, Gmailhandtekeningwijziging of automatische verzending. AI-knop kopieert alleen een veilig begrensd contract; huidige inhoud optioneel, base64 vervangen door vakken. Bronwerk lokaal; Philippe test zelf, release apart. Zie docs/MAIL-HANDTEKENINGEN.md.

## 2026-10-21 — Afgerond uit Te bouwen, controle apart

Gebruiker vraagt eerst open bouwtaken af te werken en afgeronde taken te verwijderen uit zijn werkoverzicht. Afgerond uit de werkvoorraad houden met behoud van historie/IDs; gebouwd maar ongecontroleerd krijgt review/Jouw controle. Geen schijnbaar afronden van gedeeltelijk werk of automatische wijziging van bestaande opgeslagen status. Catalogus en runtime-log apart bijwerken. Negen Maat-/zeven Spat-bronopdrachten zijn aanwezig voor eigen gebruikerscontrole; volledige Gmail/online-AI/V2 en overige echte vervolgscope blijven open. Gerichte deelstap: materiaal/dikte/decimale maten via beperkte inline-productcontext, zonder klantdata of prijzen; bestaande berekeningen bewust synchroniseren. Geen functionele tests/provideracties/publicatie.

## 2026-10-21 — Stappen openen orderonderdelen; feiten bevestig je apart

Gebruiker ziet ruwe Spatlappenstatussen en vijf onduidelijke bolletjes bij Maat, en mist samenhang voor losse orders. Oude balk afgeleid van lijstindex; verkoopfase onafhankelijk. Eén component met actuele verkoopfase, expliciete eigen uitvoering en klikbare stappen naar bestaande tabs. Vinkjes alleen voor bekende feiten, geen eerdere stappen compleet maken uit een latere status. Losse voortgang kan zonder batch via centrale merge/verwachte orderinhoud en datum/confirm; Afgerond archiveert conform formulier. Gekoppelde batch blijft context, geen hele-orderlevering uit batch afleiden. Geen businessdata migreren of echte records aanpassen tijdens bouwen. Volledige werkplektaak blijft open, Philippe controleert zelf.


## 2026-10-21 — Formulierafzenders apart, product en bronpagina behouden

Maat-formulier gebruikt aanvragen@tjworx.nl, Spat houdt de bestaande eigen afzenderregel. De nieuwe rij Aantal begrenst Product; Pagina is passieve bronmetadata van de eigen website. Expliciete eenheden en telwoorden herkennen in gedeelde pure helpers, ‘niet ingevuld’ niet als nul. Schroefafstand blijft instructietekst, geen gatdiameter. Meerdere mogelijke producten niet mengen; controle vóór overname waar onzeker. Bestaande automatische opt-in niet activeren, oude dossiers niet migreren of opnieuw verwerken. Alleen lokaal, Philippe test zelf; volledige meervoudige-productintake blijft open.


## 2026-10-21 — Bouwer registreert via code, gebruikerlog behouden

Expliciete correctie Philippe: geen handmatig invullen van Bouwtaken door AI. Append-only bronupdates met gevalideerde taak/bedrijf/ID/status en zichtbare herkomst, lokale CLI zonder browser of DB-mutatie. Bestaande opgeslagen gebruikersstatus en opmerkingen blijven leidend; bronstatus alleen fallback. Twee bronnen readonly samen tonen/exporteren, niet aan events/version sleutelen of oude logs wissen. Deze keuze vervangt de eerdere verplichte UI-route voor bouwers. Alleen lokaal; gebruiker test zelf.


## 2026-10-21 — Maat hoeft geen batch voor één leveranciersorder

Kies de order als werkplek: leverancier/kosten/factuurfiles bij Inkoop & marge, gezamenlijke batch optioneel. Bestaande exclusieve inkoop kan compact worden bewerkt, zonder recordconversie of wijziging van andermans kosten; nieuwe gedeelde koppeling tijdens bewerken blokkeert opslag. Kostenbron uit echte factuur beschermd, calculatorbron behouden bij ongewijzigde prijs. Upload is intern bewijs en geen klantfactuur, kosten-/betaal-/btw- of bestelgebeurtenis. Geen OCR of aannames over bedragen/btw. Bronlog via code, gebruiker test zelf, uitsluitend lokaal.


## 2026-10-21 — Netto zakelijk resultaat, bruto betalen apart

Gebruiker wil incl./excl. duidelijk scheiden en vooral excl. tonen. Eén presentatieafspraak voor beide bedrijven: orderomzet/prijzen/kosten/marge excl., werkelijke klantontvangst/betaalverzoek/restant incl. Bestaande rekenroutes/data blijven leidend, geen bedragen uit een ontvangst teruggerekend en geen historische leverancierstotalen van een verzonnen btw-label voorzien. Daar documentbasis onbekend vermelden. Lokale bron gebouwd, geen functionele tests/publicatie; gebruiker controleert zelf.


## 2026-10-21 — Dikte als vaste bron in offerte en analyse

Gebruiker benoemt ontbrekende dikte op Maat-offertes en belang voor toekomstige statistiek. Productveld thickness in mm bestond maar publieke detailhelper gaf Maat niets terug. Gebruik expliciete publieke materiaal/dikte per product, bewaar gestructureerde document-snapshot en bestaande detailregels voor afdruk. Niet alleen toevoegen aan vrije tekst; nieuwe documenten vragen ontbrekende dikte met terugkeerhulp. Oude documenten niet herschrijven, oude tekst niet als numerieke data gokken. Analyses tellen actuele geregistreerde productregels/stuks/dossiers, geen factuuraantallen of afgeleide omzet over diktes. Spat behoudt eigen route. Lokaal, Philippe test zelf.

## 21 oktober 2026 — Betaalstand hoort bij het bewaarde factuurmoment

Toon geen latere betaling als eigenschap van een oude PDF. Gebruik per gegenereerde factuur de eigen saved payload en eigen brutototaal; onbekend blijft onbekend. Bij deelbetaling de gevraagde tweeregelstempel Aanbetaling voldaan; dit verandert productie- of betaalregels niet. Herhaald aanmaken is momenteel een nieuw volledig factuurnummer en wordt als zodanig toegelicht, geen impliciete deel-/restfacturering of heruitgifte. Zie ../FACTUUR-BETAALSTAND.md. Alleen lokaal bronwerk, gebruikercontrole open.

## 21 oktober 2026 — Kaart volgt uitvoering, route blijft bewuste voorbereiding

Standaard fysieke productie in beide profielen; geen verkoop-/ontwerpstatus als geografisch hoofdmodel. Gekoppelde batch als expliciete context, niet als bewijs complete klantorder. Bewuste stopselectie/volgorde met Maps-URLs pas na klik, zonder geocoding/API-rechten of nieuwe businessrecords. Geen optimale route/wegafstand/tijd claimen; aparte kostenvergelijking behouden. Bestaande adressen/leverafspraken blijven leidend en bij klik actueel controleren. Zie ../ORDERKAART-EN-BEZORGROUTE.md. Alleen lokaal, gebruikercontrole open.

## 21 oktober 2026 — Snelle exports gebruiken dezelfde renderer

Geen tweede vector-/PNGimplementatie en geen tijdelijk overschrijven van een actief ontwerp voor een download. Een aparte downloadtab hergebruikt de bestaande layout/export, leest alleen de gekozen opgeslagen bron en controleert opnieuw vóór aanbieden. Huidige framebeveiliging blijft staan. PDF blijft vector/waregrootte/fontcontrole; onleesbare PNGlogos blokkeren i.p.v. stil weglaten. Zie ../ONTWERP-DOWNLOADS.md; gebruikercontrole open, niet gepubliceerd.

## 21 oktober — dossierconversie en meetdekking

Exacte aanvraagkoppeling en bewust ontvangen contact delen geen anoniem browserprofiel via e-mail/telefoon. Persoonlijke bezoekdetails pas bij nieuwe, uitgelegde v2-meetkeuze; bestaande v1-rijen blijven algemene tellingen. Eerst eerste stappenmomenten en pagina→aanvraag; browser-/sessieaantallen onbekend laten tot echt sessiecontract. Geen onafgemaakte contactvelden opslaan. Eigen apparaat = per website/browser, teruggelezen status op website; onafhankelijke provideranalytics niet als uitgesloten presenteren. Websitecode/eigen meetdatabase apart van CRM en eigen binding per bedrijf. Lokaal bronwerk, release/gebruikerscontrole/open scope in WEBSITE-DOSSIER.md.

## 23 oktober — formuliermetadata in headers

Visuele ID-/herkomstfooter kan met een Gmail-citaat bij een klant belanden. Gebruik beperkt, gevalideerd headertransport naar de bestaande bedrijfseigen intake; geen onzichtbare HTML of nieuwe ontvanger. Bestaande bodyfallback behouden; metadata alleen geeft geen autorisatie, conflicten vragen review. Gedeelde CRM-lezer eerst leveren, aparte Spat-websitewriter daarna. Mogelijke spam van Gmail-antwoorden blijft afzonderlijke diagnose: SMTP2GO Delivered is geen inboxbewijs en klacht-events meten geen volledige automatische spamplaatsing. Geen echte mail/provider-/DNSwijziging of functionele controle deze ronde.

## 23 oktober 2026 — Laatst geopend is een persoonlijke lijstvoorkeur

Gebruiker wil aanvragen/orders/klanten standaard recent en zelf anders kunnen sorteren. Gekozen voor echte dossieropeningen per browser en bedrijf, geen zakelijke updatedAt-migratie of databasewrite bij bekijken. Bestaande naam/datum/bedrag/kolomkeuzes en zoekfilters behouden, sortering zichtbaar naast filters. Geen historische openmomenten of editdatum verzinnen; onbekende dossiers vallen terug op bestaande zakelijke datums/naam. Geen account-/apparaatsynchronisatie. Alleen lokale bron, gebruikercontrole open. Zie DOSSIER-SORTERING.md.

## 23 oktober 2026 — Telefoon via gedeelde webapp en serveroutbox

Gebruiker geeft opdracht mobiele betalingspush en open feedback verder te bouwen; export35meldingen aangeleverd. Eén bedrijfsgebonden webapp behouden. Push deelt bestaande rootserviceworker; beperkte aparte Cron-Worker roept beveiligde eigen Pages-taak aan. Geen centrale klantdata op een persoonlijke laptop nodig voor notificaties. Eerste ontvangstbaseline stil, positieve nieuwe ontvangst naar outbox, sessiegebonden toestelopt-in, geen klantdetails op lockscreen. Tikkiecontrole optioneel en begrensd, gewone bankbetalingen blijven handmatig. Geen automatische factuur/mail/productieactie. Bron volledig gescheiden van liveactivering; nog geen migratie/secretgeneratie/provideractie/publicatie/test uitgevoerd. Open werkzaamheden en activering in MOBIELE-MELDINGEN.md.

Export via bestaande private feedbackdienst geïmporteerd:29nieuwe IDs,38totaal, bestaande statussen behouden. Geen onlinefeedbackstatus of klantrecord gewijzigd. Geen gedeeltelijk punt afgehandeld; private uitvoerplan houdt nieuwe ontwerptoolwensen en onzekere oudere punten open. Kleine aanvullende lokale reparaties: factuurontvangsten standaard aan, mobiele toetsenbordpositionering en Maat-contactprefix/Bedrijfalias.

## 23 oktober — Vier lokale feedbackbatches, aparte activering

Werk opgesplitst in mobiel/push, betaling/document, contact/mailwerkproces en editor. Details VIER-BATCHES-2026-10-23.md. Bestaande feedbackIDs/status/historie behouden en geen resolve op alleen bronwerk; Philippe test zelf. Geen provideractie of publicatie als verborgen onderdeel van bouwen.

Een prijs is geen leverafspraak: in herstelvenster expliciet bevestigbaar paars voorstel, niet stil uit prijs afgeleid. Een PDF is geen verzonden mail: externe verzending alleen via expliciete registratie op concreet bestand. Geld is geen ontwerpgoedkeuring of fysieke productie: aparte vrijgavevoorwaarden/bevestiging behouden. Eigen font alleen met werkelijk font naar SVGcontouren; geen verzonnen fontJSON of raster-PDFfallback.

## 27 oktober 2026 — resterende feedback verder bouwen

Nieuwe expliciete vervolgopdracht laat gewone Spatlappen-productievrijgave automatisch volgen op de afgesproken aanbetaling plus actuele prijs/specificaties/ontwerpgoedkeuring. Read-only faseprojectie, geen fysieke uitvoering of historische datum afleiden. Gratis teststuk blijft bewust. Bestaande factuur-PDF voldoet aan de factuurwerkstap zonder verzendclaim. Opt-in leren uitsluitend na geslaagde save en alleen geometrie. Voor kleursegmenten lokale Paper.js-booleans met behoud van laagvolgorde/alpha en duidelijke invoergrenzen. Gebruiker kiest Google Maps voor routeafstand/rijtijd; eigen sleutel bij de bestaande beveiligde serveropslag, geen betaalde activering of providerproef gedaan. Geen tests of publicatie; OPEN-PUNTEN-VERVOLG-20261027.md.

## 27 oktober 2026 — bronreview eerst concrete opslagfouten herstellen

Dagelijkse dossieracties gebruiken actuele merge en beginbasis; geen zichtbare state muteren vóór geslaagde commit. Algemene save-route verwijderd, geen tweede gegevenslaag. Orderkopie krijgt geen ontwerpvarianten/goedkeuring/bestanden van het oorspronkelijke dossier. UI-callbackfouten na commit blijven apart van opslagfalen. Invoer tijdens bewaren blokkeren en bij fout behouden, ontbrekend foutvak lokaal aanvullen. Lokale back-upatomiciteit, loginherstel en bredere gelijktijdigheid expliciet openhouden; geen massale financiële refactor of volledige auditclaim. ALGEMENE-CODELEZING-20261027.md; geen tests of publicatie.

## 27 oktober — klikmelding aanvragen/orders

Gerichte correctie van niet-bestaande f naar bestaande funnel in order-progress; geen brede terugdraaiing van variant-/opslag-/vrijgavewerk of klantdata. Geen globale noodvariabele. De gebruiker weigert ook browseruitlezing; bronroute verklaren en eigen gebruikerscontrole openhouden in plaats van runtimebewijs claimen. Geen tests/publicatie.

## 27 oktober — vlakke tabellen/grijze vlakken als nieuwe CRM-stijl

Op expliciete feedback vervangt Excel-stijl de oudere ronde kaders. Niet alleen de hoeken veranderen: brede mailkolommen boven berichtdetail, vaste metadataregels en klant-/takenkoppen. Gedeelde centrale grijs/wit/rijstijl met groen hoofdactieaccent, afgebakende mail-CSS. Geen spreadsheetfuncties, extra hoofdknoppen, wijziging aan CRM-data of geproduceerde mail/PDF. Lokale bron, eigen gebruikerscontrole; geen tests/browseruitlezing/publicatie. Zie EXCEL-STIJL-20261027.md.

## 2026-10-27 — Betaalde factuurtekst en herkenbare bevestigingsvarianten

Philippe bevestigt dat zijn betalingsontvangstzin alleen bij volledig betaald hoort. Gebruik de bestaande betaalstatusregel; onbekend/open krijgt dezelfde factuurtekst zonder ontvangstclaim. Twee gevraagde bevestigingsteksten70%/volledig gebruiken bestaande variabelen en aangeleverde banktekst. Automatisch alleen bij passende vastgelegde linkbasis, anders neutraal; geen financiële afspraken aanpassen door een tekstkeuze. Eigen template-overrides en oude concepten niet migreren/overschrijven, label eigen aanpassing verduidelijkt bestaande reset. Zie MAIL-HERZIENING. Lokaal en eigen controle open, geen tests of publicatie.

## 2026-10-27 — Bijlagen onderscheiden van ingebedde mailafbeeldingen

Een filename alleen maakt een Gmail MIMEdeel geen losse dossierbijlage. Classificeer gedeeld bij lezen én download: image inline of zonder disposition met werkelijke CIDafbeeldingsverwijzing uitsluiten; explicit attachment en onzekerheid behouden. Niet op bestandsnaam/logoheuristiek wissen. Origineel/snapshots/dossierfiles behouden, geen automatische cloudopruiming. Bestaande SMTP2GO inlineverzending laten staan; Gmailnativepresentatie vraagt echte mailheaders en is niet bewezen. Alleen lokaal, bronfix en gebruikerscontrole apart. Zie MAIL-HERZIENING.

## 2026-10-27 — Exactreferentie vervangt te brede Exceltoepassing

Philippe corrigeert Codex: Excel niet op heel CRM bedoeld, wil Exact Online vrijwel1op1 als opmaakrichting. Kies openbare nieuwe-interfacevoorbeelden (geen Exactaccount/merkimitatie) en vervang de eigen Excel-laag: blauw hoofdactie/paars actief/witte inhoud, dunne lijstlijnen/kleine hoeken en duidelijke formulieren. Functionele maatwerkdossiers en eigen labels/routes behouden. Functievergelijking geeft advies, geen automatische bouwopdracht: vaste versie bij klantakkoord en begroting/werkelijkheid kansrijk, zwaar MRP-/magazijn-/boekhoudpakket geen uitgangspunt. Leverafspraken/offerteversies bestaan al. Historisch stijltaak-ID/historie behouden; nieuwste tekst is leidend. Geen tests/CRM-QA/publicatie.

## 2026-10-27 — Kleine dossierbovenkant en expliciete kleurparen

Gebruiker vindt faseblok te groot en meldt licht-op-licht. Huidige fase/bedrag blijven kort zichtbaar, volledige stappen en cijferkolommen standaard gesloten, volgende hoofdactie met reden zichtbaar. Review/conflictwaarschuwing niet achter historie verstoppen. Oude witte hovertekst bij nu lichte zijbalkkleuren aan de bron herstellen. Exactvoorbeeld toont plaatselijk paarse selectie, geen grond voor alle tabs/navigatie paars: daar donkerblauw. Inhoud/financiële/faseregels intact, geen contrastmeting of CRM-QA uitgevoerd.

## 2026-10-27 — Eén CRM-stijlbasis en detail op verzoek

Aanleiding: stapsgewijze UXbouw heeft thema-/onderdeelregels opgestapeld en orderoverzichten te groot gemaakt. Keuze: één actieve admin/style.css inclusief mail, één :root en gedeelde control-/surface-/detailpatronen. Specifieke indeling en responsivevoorwaarden blijven bestaan; geen blinde herschikking of nieuwe themalaag. Producten en volgende actie direct; aanvraag/planning/klant-/prijsdetails standaard dicht, echte tekorten/waarschuwingen zichtbaar. Complete onbesliste aanvraag mag afgeleid naar Prijs berekenen; bewuste handmatige/Gmailkeuze niet terugzetten. Direct rekenen zonder faseformulier. Niet meer tonen bij mailfasepopup is voorlopig lokale weergave, geen automatische bevestiging; optionele verduidelijking gebruiker blijft open. Alleen bron/docs, eigen controle open; geen tests/browsercontrole/publicatie. Zie CRM-CSS en COMPACT-ORDEROVERZICHT.

## 2026-10-27 — Fasemelding verbergen zonder automatische fase te blokkeren

Philippe beantwoordt de optionele vraag: alleen melding verbergen, fase blijft automatisch bekende gegevens volgen. Nieuwe bekende specs/indication/quote/confirmation-mails krijgen confirmed bij daadwerkelijke acceptatie-opslag, waarna bestaande pure afleiding werkt. Popup alleen uitleg, weer aan via Meer. Geen nieuwe factuur-/betaal-/fysieke feiten, geen migratie van oude pending/dismissed of acceptatieherstel en geen extra mail/Gmailactie. Dit vervangt de eerdere voorlopige popupinterpretatie. Gebruikerscontrole open; alleen bron, geen tests/publicatie.

## 2026-10-27 — Gedeelde kleine melding met gerichte fase-undo

Philippe vervangt de fasepopup door hetzelfde soort melding als een nieuwe aanvraag/betaling, met Bekijken/Terugdraaien. Hergebruik het inkomende-meldingsvak via één sessiemanager per bedrijf; geen modal of tweede zwevend vak. Alleen vorige fase selecteren op actuele workflowbasis, met guard op bron/fase/klantkoppeling en voorvertoning van de bedoelde afleiding. Mailacceptatie/betaling/documenten/fysieke feiten en andere gegevens behouden; geen algemene snapshot-undo. Voorkeur alleen weergave. Nieuwe bron lokaal, eigen gebruikerscontrole open; geen tests/publicatie.

## 2026-10-27 — Eigen betaalinvoer blijft stil op de telefoon

Philippe wil geen telefoonmelding over een betaling die hij zelf invoert. Eén herkomstregel op de server: alleen providerontvangsten uit de bestaande Tikkie-import (source en externe ontvangst-ID samen). Bij eventopbouw én vóór bezorging toepassen, zodat oude pending handmatige events ook stil blijven zonder historie te wissen. Tikkie controleren blijft providerimport; handmatig omschrijving invullen is geen betaalbewijs van de provider. Geen extra UIkeuze, poll, schema of toestelreset. Lokaal, gebruikerscontrole en publicatie apart; geen tests of pushproef.

## 2026-10-27 — Vrijdagrapporten met bron-/meetgrenzen

Philippe wil wekelijks interessante Search Console-/website-/conversiegrafieken en positieve/negatieve verschuivingen. Vorige volledige ma–zo naast week ervoor, voorstel vrijdag09.00 Europe/Amsterdam. Bronnen apart, bij voldoende volume en geschiedenis aandachtspunten; geen statistische significantie, oorzaken, unieke personen/sessies of betaalconversie verzinnen uit ontbrekende metingen. Deterministische grenzen, geen AI-/trackinguitbreiding. Bestaande job en readonlykoppelingen hergebruiken, eigen versleutelde bedrijfssnapshots laatste12, bounded retries met checkpoint/lease/CAS; geen businessstate of providerwrites. Lokale rapport-/CRM-klaarzetbasis, geen liveplanning. Ontvangstkeuze vroeg gevraagd en onbeantwoord; telefoon-/mailbezorging, gebruikerscontrole en expliciete publicatie blijven als restscope open. Zie VRIJDAGRAPPORTEN.md.

## 2026-10-27 — Vrijdagrapporten bezorgen via bestaande telefoonapp

Philippe kiest CRM met telefoonmelding en Rapport bekijken. Rapport eerst bewaren, daarna aparte bewaarde pushoutbox onder dezelfde bedrijfsgrens; geen fakebetaling/nieuwe mailroute/extra Worker. Eén editie-event, boundedretry en resterendeTTL, huidige sessie/key/apparaatversie/config/uitsluitingen vlak voor aanbieding. Native actieknop waar ondersteund, aantikken altijd dezelfde veilige editie-link met gewone login. Oude worker kan een nieuw bericht als betaling misclassificeren: eerst expliciete active-workerhandshake en capability bij de bestaande device vastleggen. Geen rapportcijfers op lockscreen, geen stil bestaande CRM-onlyconfig naar push migreren. Bron review/local, geen liveactivering, providerproef of publicatie; appupdate en gebruikerscontrole open.

## 2026-10-27 — Betaling als eigen ingang naar klant/order

Philippe kan een zojuist ontvangen Tikkie niet bij een klant plaatsen. Eén gedeeld readonly overzicht uit bestaande payments/order/customer, in menu Betalingen. Geen nieuwe ledger, automatische matching op bedrag, banktoegang of rekeninghouderclaim: de bron heeft alleen de gekoppelde CRM-klant. Actuele correcties niet dubbel optellen, archief/orphan zichtbaar, exacte bestaande orderlink. Filters/DOM bij refresh behouden en fouten tonen, geen providercontrole door Bijwerken. Bron review/local; gebruikerscontrole en publicatie apart. Zie BETALINGENOVERZICHT.md.

## 27 oktober 2026 — betaalopslag, CRM-melding en telefoonbezorging onderscheiden

Een opgeslagen Tikkie is geen bewijs dat een melding is getoond. Lokale sessieobserver voegt nieuwe providerontvangsten toe aan bestaande CRM-meldingsqueue; correctie/herstel/eigen invoer/initiale historie/expliciete import stil. Geen terugwerkend notificatiecentrum. Telefoonstatus leest alleen eigen apparaatbezorguitkomst binnen bestaand7dagenvenster; pushaccepted blijft afzonderlijk van telefoonweergave. Shared receiptpredicate voorkomt afwijkend handmatigbeleid. Geen nieuwe poll, schema, providerproef of publicatie; concrete gemiste telefoonoorzaak en gebruikerscontrole open.

## 27 oktober 2026 — dossierstructuur boven verdere themalagen

Na kritiek op de Exact-geïnspireerde preview de dossiersamenstelling aangepakt: één kop met compacte context/tabstrip, volgende actie bij producten, productregels in plaats van binnenkaders, aanvullend dossiergedeelte. Bestaande acties/projecties/data-/bewaarregels behouden. Algemene navigatiegeometrie beperkt tot het echte hoofdmenu, vervallen productregels opgeruimd. Opmaak in één centraal bestand bij bestaande eigenaren. Geen previewwaarneming of visuele gelijkheid claimen zonder gebruikersbeoordeling; bron lokaal/review, brede werkplek en eigen controle open.

## 27 oktober 2026 — opmaakbatch1: gedeelde owners vóór schermwerk

Eerst centrale type/spacing/control-/menu-/navigatiebasis uitwerken; dossiers/lijsten/mail volgen in eigen batches. Eén native controller voor quiet-menu en order-more, gewone details/filters niet als actiemenu behandelen. Native toetsenbord-/dialogbediening, bestaande routes/inklapvoorkeur en invoer behouden. Bovenbalk module/bedrijf groeperen, zoekbreedte laten meeschalen. CSS-eigenaars aanpassen en oude conflictlagen weghalen, geen nieuwe themeoverride of private data. Bron lokaal/review, eigen visuele/bedieningscontrole en publicatie apart.
