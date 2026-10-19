# Ontwikkelplan — beide CRM’s

Bijgewerkt: 2026-10-19. Automatisch gemaakt uit `shared/planning/roadmap.js` met `npm run plan`. Bewerk de bron, niet dit bestand.

Dit is een geordende planning, geen opdracht om alles tegelijk uit te voeren. De volgorde binnen Eerstvolgend is het vertrekpunt; de gebruiker kan die bijstellen. Dezelfde taakcatalogus staat in beide CRM’s onder **Beheer → Bouwtaken**, gefilterd op bedrijf. Actuele afvinkstatus, publicatie en opmerkingen staan in de aparte CRM-planningopslag; deze gegenereerde catalogus is daarvan geen live export.

## Eerstvolgend

Eerst deze basis afmaken voordat we meer functies toevoegen.

### Aanvrager en klantbedrijf bewust koppelen

- **ID:** `inquiry-customer-review-20261019`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Gedeeld e-mailadres met afwijkende namen of telefoon zichtbaar controleren bij de order.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Philippe controleert zelf: bestaande klant houden, aparte klant met deze order/mail of extra contactpersoon bij het bedrijf. Oude aanvragen lezen de bewaarde bron; geen stille overschrijving. Geen tests of publicatie uitgevoerd.
- **Klaar wanneer:** Controle op alle ordertabs, bron naast bestaande gegevens, expliciete keuze en historie, contactpersonen in klantdossier, geen andere orders verplaatsen of oude documenten herschrijven; dubbel mailadres niet automatisch gokken.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/inquiry-customer.js`, `shared/inquiries.js`, `admin/inquiries/customer-review.js`, `admin/customers/views.js`, `admin/orders/workspace.js`

### Mail grondig herstellen en overzichtelijk maken

- **ID:** `mail-workspace-reform-20261019`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Duidelijke gesprekken en afzenders, werkende replies, eigen bijlagen en één goede HTML-handtekening.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Lokale herziening en grenzen vastgelegd in docs/MAIL-HERZIENING.md: PDF-default, context/afzenders, References/Message-ID, bijlagen, één HTML-handtekening en aparte mailstijl. Geen tests/proefzending of publicatie; Philippe controleert zelf. Maillijst: zichtbare sortering aandacht/nieuwste/oudste en filters status/datum/koppeling/bekende bijlagen, alleen geladen mail; gebruikercontrole open. AI-vindbaarheid daarna.
- **Klaar wanneer:** Replyheaders oorspronkelijke klantmail inclusief websiteformulier; nieuw/reply expliciet; info standaard/facturen alleen factuur en instelbare mailsoorten; PDF standaard Word optioneel; veilige bijlagen uploaden/lezen/bewaren; afbeelding in HTML-handtekening en geen dubbele afsluiting; overzichtelijke Gmailachtige composer en gesprekshiërarchie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/mail/`, `admin/mail-workspace.js`, `shared/mail-service.js`, `shared/mail-signature.js`, `shared/document-mail-context.js`, `admin/documents/generated-forms.js`, `docs/MAIL-HERZIENING.md`

### AI-assistent weer vindbaar maken

- **ID:** `assistant-discoverability-20261019`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Philippe kan de agent vinden en ziet eerlijk welke verbinding beschikbaar is.
- **Omvang / status:** Ingang gebouwd · online dienst nog niet gekoppeld
- **Volgende stap:** Cloudknop was hard uitgeschakeld door runtime.mode===local. Nu vaste Agent-ingang op desktop/mobiel en sneltoets; cloudstatus met bestaande AI-export en handmatig kopieerbare vraag. Geen actieve online agentdienst of ChatGPT-login nagebootst. Echte online agentkoppeling blijft vervolgwerk; lokale agent blijft intact.
- **Klaar wanneer:** Zichtbare vaste ingang, duidelijke status als dienst niet beschikbaar is, geen onopgeslagen invoerverlies of automatische provideracties.
- **Eerst nodig:** Mail grondig herstellen en overzichtelijk maken
- **Vindplaatsen:** `admin/app.js`, `admin/assistant.js`, `docs/MAIL-HERZIENING.md`

### 6. Analytics-tabbladen afronden en controleren

- **ID:** `analytics-tabs-expanded`
- **Voor:** Spatlappen
- **Doel:** Financiën, websitegebruik, aanvragen en Google/SEO hebben eigen rustige schermen.
- **Omvang / status:** In bewerking; middel
- **Volgende stap:** Financiële grafiek/drilldown en onbekende bedragen lokaal verder verbeterd op18oktober. Website/Google-SEO-integratie en volledige analyticsacceptatie blijven open; geen account of echte koppeling geactiveerd. Zie nieuwste OVERDRACHT voor werkelijk uitgevoerde controles.
- **Klaar wanneer:** Behoud financiële rekenregels; correcte cohorten, dagelijkse grafieken, bronafscheiding en complete vergelijkingsperiodes. Google alleen lezen, geen nulcijfers bij fouten.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/analytics/`, `cloudflare/site-analytics.js`, `cloudflare/marketing.js`, `shared/analytics-insights.js`, `tests/site-analytics.mjs`

### 17. Website-sessies en Conversie-tab bij klant/order

- **ID:** `order-attribution`
- **Voor:** Spatlappen
- **Doel:** Toestemmende browsers en sessies tellen, sessies tot aanvraag/betaalde order onderscheiden en aantoonbare herkomst bij het juiste dossier tonen.
- **Omvang / status:** Ontwerp vastgelegd · nog niet gebouwd
- **Volgende stap:** Eerst websitebron met aparte website-repo synchroniseerbaar maken; nieuwe metingen/cookiebar nog niet op GitHub. Bestaand consentpad voor actuele herkomstvelden/teller1 consistent maken. Dan versie2 browser-/30minutensessies, bevroren aanvraagsnapshot, geaggregeerde cookiekeuzes en beveiligde Conversie-tabs. Zie WEBSITE-CONVERSIEMETING.md. Deze ronde alleen brononderzoek/ontwerp, geen nieuwe tracking of schemawijziging.
- **Klaar wanneer:** Geen bezoekers volgen na weigeren, geen fingerprint/IP-hash/emailmatching, geen oude historie verzinnen. Unieke browsers niet mensen; onvolledige dekking/minstensN herkenbaar. Aanvraag/offerte/betaald apart, werkelijk betaalbewijs en correcties. Sessies tot aanvraag bevroren, later betaaldconversie afzonderlijk. Gedrag in aparte meetdatabase; exact aanvraag-ID naar CRM. Geen tests/publicatie zonder opdracht.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `docs/WEBSITE-CONVERSIEMETING.md`, `docs/WEBSITE-METINGEN.md`, `shared/site-conversion.js`, `cloudflare/site-analytics.js`, `admin/analytics/website.js`, `admin/orders/`, `admin/customers/`

### 23. Btw-aangifte voorbereiden per kwartaal

- **ID:** `vat-quarterly-assistance`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Controleerbaar kwartaaloverzicht met bronfacturen, omzetsoorten en importdocumenten.
- **Omvang / status:** Kwartaalwerkplek lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Lokaal bronregister met kwartaaloverzicht, bronvoorstellen, inkoop/invoer, credits, bewijs, revisies en CSV/JSON gebouwd. Aparte btw-administraties bevestigd; stelsel nog onbekend laten. Geen tests uitgevoerd (opnieuw expliciet geweigerd), geen publicatie. Vóór echt gebruik stelsel/inrichting vaststellen en gebruikercontrole/boekhoudaansluiting uitvoeren.
- **Klaar wanneer:** Bewaarde factuurinhoud leidend, geen geschatte inkoop of orderomzet als aangifte. Bron/btw-moment/bedragen/rubrieken/aftrek en toepasselijk bewijs expliciet gecontroleerd. Concepten, dubbele/gewijzigde bronnen en onbekende data herkenbaar; voorbereidingssnapshot met historie en hernieuwde controle bij wijziging. Geen automatische aangifte/ICP/OSS/suppletie of bedrijfsvermenging. Eigen gebruikstest en fiscale inrichting blijven nodig.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/vat-ledger.js`, `admin/analytics/vat-quarter.js`, `admin/analytics/vat-entry.js`, `shared/state-validation.js`, `docs/BTW-VOORBEREIDING.md`, `tests/vat-ledger.mjs`

### De rust van Documenten op meer pagina’s

- **ID:** `consistent-workspace`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Dezelfde herkenbare opbouw bij orders, inkoop en klanten: hoofdactie bovenaan, duidelijke vakken en overige acties bij Meer.
- **Volgende stap:** Het klantdossier heeft nu een rustig overzicht met bestaande vervolgstappen. Trek dit door naar het orderoverzicht en Inkoop; behoud zoeken, filters en dossierlinks.
- **Klaar wanneer:** Op desktop en mobiel is de volgende actie duidelijk. Filters, invoer, documentindeling en oude links blijven werken.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/app.js`, `admin/document-library.js`, `docs/UX-WERKPLEK.md`

### Code per werkonderdeel bij elkaar

- **ID:** `feature-boundaries`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Een wijziging aan Klanten of Inkoop moet op één herkenbare plek beginnen, zonder de andere onderdelen mee te veranderen.
- **Volgende stap:** Klantlijst en dossierweergave staan nu in admin/customers/views.js. Haal hierna adresweergave en klantformulieren gericht uit app.js; behoud de bestaande transacties.
- **Klaar wanneer:** Dezelfde routes en opslagcontracten blijven geldig; tests bewijzen dossier- en bedrijfsafscheiding. Geen massale verplaatsing.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/app.js`, `admin/customers/`, `admin/workspace/`, `shared/`, `docs/plan/ARCHITECTUUR.md`

### Calculator V2 als complete werkroute

- **ID:** `costing-v2-complete`
- **Voor:** Maatwerkkunststof
- **Doel:** Van materiaal en vorm naar kostprijs, marge en een bewuste overname in het juiste CRM-product.
- **Volgende stap:** Werk materiaalkeuze uit op basis van eigen CRM- of leveranciersgegevens; leg ontbrekende tarieven uit zonder prijzen te verzinnen.
- **Klaar wanneer:** Vorm, gaten en import blijven exact bewaard; één stuk hoort bij één product. Meerregelige offertes en releaseverpakking worden apart gecontroleerd. V1 blijft bruikbaar.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `tools/costing-v2/`, `admin/order-costing.js`, `shared/cost-quote-domain.js`

### Eigen complete documentenset

- **ID:** `company-documents`
- **Voor:** Maatwerkkunststof
- **Doel:** Offerte, orderbevestiging en factuur laten aansluiten op de Maatwerkkunststof-order en huisstijl.
- **Omvang / status:** Gebouwd · online activering in uitvoering · gebruiker test zelf
- **Volgende stap:** Op verzoek dezelfde Spatlappen-templates/opmaak en registratie-/bankgegevens met Maatwerkkunststof-naam/website. Offerte, bevestiging, proforma, factuur en pakbon beschikbaar; gedeelde converter met eigen bedrijfstoken en gescheiden tijdelijke downloads. Render/Cloudflare-activering afronden; geen tests of proefdocumenten uitgevoerd.
- **Klaar wanneer:** PDF/Word-preview en bedragen kloppen; het document blijft in het bestaande dossier. Aanmaken verstuurt geen mail.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `document-service/`, `document-generator.py`, `admin/document-library.js`

## Daarna

Voortbouwen op dezelfde dossiers, bediening en controles.

### 38. Vectorselectie rond de echte zichtbare tekening

- **ID:** `preview-tight-vector-bounds`
- **Voor:** Spatlappen
- **Doel:** Geen overtollige SVG-witruimte in selectie, afmetingen of uitlijnen.
- **Omvang / status:** Vervolgwerk open · alleen lokaal
- **Volgende stap:** Mee bezig, lokaal. Nieuwe SVG-import meet gerenderde alpha (max2048px) inclusief stroke/transform/clip; blijft vector. Bestaande vector: Vectorrand aansnijden bewaart zichtbare fysieke plaatsing, expliciet en ongedaan. Eén SVG-fixture gecontroleerd; meer complexe SVG-/filter-/maskerbestanden en zeer kleine details nog controleren. Geen claim van analytisch exacte grenzen.
- **Klaar wanneer:** Tight bounds inclusief transforms/strokes met betrouwbare fallback voor lastige SVG. Nieuwe import logisch bijsnijden; bestaande ontwerpen niet ongevraagd laten verspringen. Onderdelenbewerking en export behouden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`

### 39. Gelijke witruimte en uitlijnen op een ander logo

- **ID:** `preview-spacing-layout`
- **Voor:** Spatlappen
- **Doel:** Rustige plaatsingshulp voor brede spatlappen: tussen buitenrand en middenlogo, gelijke onder-/zijafstand.
- **Omvang / status:** Vervolgwerk open · alleen lokaal
- **Volgende stap:** Mee bezig, lokaal. Plaatsen & witruimte biedt expliciete referentie (spatlap/ander logo of tekst), links/rechts/centrum/boven/onder en gelijke vrije zijruimte, onderruimte=zijruimte. Rand versus midden referentie expliciet; test gaf14,63cm gelijk. Vrije verdeling van drie of meer objecten en uitgebreide cm-bediening blijven open.
- **Klaar wanneer:** Duidelijke referentie kiezen en benodigde ruimte tonen; links/rechts/midden/boven/onder uitlijnen, gelijk verdelen en exact cm. Geen onduidelijke automatische keuze tussen meerdere middenlogo’s; geometrie als basis, optische correctie handmatig.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`

### 41. Eigen plaatsingsvoorkeuren hergebruiken

- **ID:** `preview-placement-learning`
- **Voor:** Spatlappen
- **Doel:** Op termijn minder handwerk door eigen goedgekeurde plaatsingen bij vergelijkbare maten te hergebruiken.
- **Omvang / status:** Vervolgwerk open · alleen lokaal
- **Volgende stap:** Nog open. Geen plaatsingsgegevens verzameld. Eerst expliciete lokale voorkeur met toepassen/uitzetten/wissen ontwerpen en daarna gecontroleerd leren uit bewust bevestigde plaatsingen; geen klantlogo’s of klantdata als trainingsdata.
- **Klaar wanneer:** Eerst expliciet Bewaar als plaatsingsvoorkeur, lokaal per maat/verhouding/type en aantal objecten. Geen klantlogo of klantdata verzamelen; transparant toepassen/resetten, uitzetten en wissen. Automatisch leren pas na gecontroleerde bevestiging, nooit elke toevallige sleepbeweging als waarheid.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`

### 18. Orderwaarde en conversiecorrecties naar Google Ads

- **ID:** `ads-value-exports`
- **Voor:** Spatlappen
- **Doel:** Betaalde orders en terugbetalingen gecontroleerd koppelen aan toegestane advertentieherkomst.
- **Omvang / status:** Groot; begint met proef/export
- **Volgende stap:** Kies eerst conversieactie/waarde/currency/btwbeleid; preview/export voordat APIautomatisering start. Aanbetaling en eindbetaling niet dubbel als volledige verkoop tellen.
- **Klaar wanneer:** Consent/bronbewijs, stabieleorderID, dedup, retraction/restatement en audit nodig. Geen echte upload of campagne zonder expliciete opdracht.
- **Eerst nodig:** 17. Website-sessies en Conversie-tab bij klant/order
- **Vindplaatsen:** `shared/provenance.js`, `docs/WEBSITE-METINGEN.md`, `docs/plan/AUTOMATISERINGEN.md`

### 19. Nog te leveren maatwerk per product volgen

- **ID:** `custom-order-inventory`
- **Voor:** Spatlappen
- **Doel:** Per productregel zien: besteld, in productie, onderweg, ontvangen, gereserveerd, verzonden en resterend.
- **Omvang / status:** Groot; gegevensmodel
- **Volgende stap:** Scheid klantgebonden maatwerk van vrij beschikbare standaardvoorraad; ontwerp splitsing over batches en deelleveringen.
- **Klaar wanneer:** Aantallen tellen exact op zonder dubbel voorraadboeken; bestaande order/inkoopIDs behouden en migratie vooraf testen.
- **Eerst nodig:** 9. Batchdocumenten, waarschuwing en archief
- **Vindplaatsen:** `shared/inventory.js`, `shared/purchase-stock.js`, `admin/inventory.js`

### 27. Meerdere ontwerpvarianten bij één product en maat

- **ID:** `product-design-alternatives`
- **Voor:** Spatlappen
- **Doel:** Een klant kan kiezen tussen twee of meer ontwerpen bij dezelfde productregel, zonder dubbele aantallen of kosten.
- **Omvang / status:** Middel; opslag, preview en definitieve keuze
- **Volgende stap:** Toon bij het product kleine voorbeelden met een naam zoals Ontwerp A/B. Voeg een variant toe vanuit een kopie of nieuw ontwerp; bewerk en bewaar elke variant afzonderlijk. Wijs pas na klantkeuze één als definitief aan.
- **Klaar wanneer:** Bestaand ontwerp en voorbeeld blijven behouden; openen, opslaan en herladen raken alleen de gekozen variant. Alternatieven zijn geen revisies en overschrijven elkaar niet. Aantal, maat, prijs en inkoop blijven op één productregel; afwijkende maat vraagt bewuste aparte productkeuze. Definitieve keuze is zichtbaar; productie/documenten gebruiken alleen een expliciet gekozen ontwerp. Historische documenten en eerder goedgekeurde afbeeldingen blijven intact. Gelijktijdig opslaan en een gewijzigde definitieve variant vragen conflict-/herbevestigingscontrole.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/product-designs.js`, `spatlap-preview.html`, `admin/app.js`, `admin/document-library.js`, `shared/state-validation.js`

### 34. Betalingen periodiek controleren zonder meldingsruis

- **ID:** `scheduled-payment-checks`
- **Voor:** Spatlappen
- **Doel:** Niet telkens handmatig controleren; alleen aandacht bij nieuwe ontvangst of een fout die actie vraagt.
- **Omvang / status:** Middel
- **Volgende stap:** Voeg een gecontroleerde servercontrole toe op een afgesproken interval (wens: ieder uur), met bedrijfsbinding, bestaande importdeduplicatie en zichtbare laatste geslaagde controle.
- **Klaar wanneer:** Niet actief door alleen deze planning. Geen dubbele ontvangsten bij retries/parallelle checks; alleen bevestigde ontvangst melden, niet iedere controle. Telefoonpush volgt afzonderlijk onderzoek.
- **Eerst nodig:** Nuttige vervolgstappen na betaling
- **Vindplaatsen:** `cloudflare/tikkie.js`, `admin/payment-workflow.js`, `docs/plan/AUTOMATISERINGEN.md`

### Meerdere producten en ontbrekende gegevens uit aanvraagmail

- **ID:** `request-recognition-next`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** De bestaande herkenning uitbreiden zodat minder gegevens dubbel worden ingevoerd en de AI gericht kan doorvragen.
- **Omvang / status:** Middel
- **Volgende stap:** Werk meerdere productregels, klantmatch en ontbrekende materialen/maten/aantallen uit met geanonimiseerde aanvraagvoorbeelden. Vraag alleen wat echt ontbreekt.
- **Klaar wanneer:** Bestaande klantgegevens niet overschrijven op een gok; preview en bevestiging vóór CRM-overname. Geen automatische mailboxtraining, Gmailmutaties of verzonnen prijs.
- **Eerst nodig:** Snelle aanvraagherkenning uit e-mail
- **Vindplaatsen:** `shared/request-recognition.js`, `admin/inquiries/`, `tests/request-recognition.mjs`, `docs/AANVRAAGHERKENNING.md`

### Automatiseringen die een voorstel klaarzetten

- **ID:** `automation-proposals`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Ontbrekende gegevens, offerteopvolging en levering krijgen één zichtbare volgende stap in het bestaande overzicht.
- **Volgende stap:** Begin met ontbrekende productspecificaties: toon een voorstel en laat de gebruiker controleren en uitvoeren.
- **Klaar wanneer:** Aanleiding, voorwaarden en gevolg zijn zichtbaar. Herhalen maakt geen dubbele taak; wijzigingen sinds de preview blokkeren opslaan. Gmail/mail alleen na expliciete toestemming.
- **Eerst nodig:** Code per werkonderdeel bij elkaar
- **Vindplaatsen:** `shared/work-queue.js`, `shared/inquiries.js`, `admin/inquiry-ui.js`, `docs/plan/AUTOMATISERINGEN.md`

### Van akkoord naar uitvoering zonder dubbel invoeren

- **ID:** `dossier-process`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Offerte, akkoord, inkoop, levering en factuur verwijzen naar hetzelfde klant- en orderdossier.
- **Volgende stap:** Maak per overgang zichtbaar welke gegevens worden hergebruikt en wat nog ontbreekt.
- **Klaar wanneer:** Een akkoord kan een gecontroleerde vervolgstap voorbereiden; geen dubbele order, factuur of inkoop. De bron en wijzigingen blijven terug te vinden.
- **Eerst nodig:** De rust van Documenten op meer pagina’s; Automatiseringen die een voorstel klaarzetten
- **Vindplaatsen:** `shared/sales-funnel.js`, `shared/purchase-stock.js`, `admin/app.js`

### Veilig tegelijk aan een dossier werken

- **ID:** `concurrent-work`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Voorkom dat een oude browserweergave nieuw werk van iemand anders overschrijft.
- **Volgende stap:** Inventariseer bestaande versiecontroles en maak één conflictpatroon voor alle wijzigingen.
- **Klaar wanneer:** Twee sessies met hetzelfde dossier kunnen een conflict reproduceren. De tweede wijziging vraagt verversen of vergelijken; bestanden en financiële gegevens blijven behouden.
- **Eerst nodig:** Code per werkonderdeel bij elkaar
- **Vindplaatsen:** `admin/cloud-storage.js`, `cloudflare/`, `shared/state-validation.js`

## Eerst uitzoeken

Nog geen bouwafspraak of actieve koppeling.

### 20. Dezelfde CRM-opmaak en previewtool zonder wifi

- **ID:** `same-ui-offline`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Precies dezelfde werkplek met echte dossiers en de Spatlappen-preview bij slechte wifi.
- **Omvang / status:** Groot; eerst beperkte haalbaarheidsproef
- **Volgende stap:** Huidige aparte offlinepagina voldoet niet aan deze wens. Advies: bestaande webapp/PWA gefaseerd uitbreiden; eerst code/preview/assets en gecontroleerde data/filesync onderzoeken.
- **Klaar wanneer:** Online browser blijft leidend; dezelfde opmaak, versie/conflictcontrole, wachtrij/ruimtefouten en bekende offline grenzen. Geen aparte native desktopapp bouwen zonder nieuwe afweging.
- **Eerst nodig:** Veilig tegelijk aan een dossier werken
- **Vindplaatsen:** `admin/offline/`, `admin/cloud-storage.js`, `spatlap-preview.html`, `scripts/build-pages.mjs`, `docs/OFFLINE-WERKEN.md`

### 21. Nuttige telefoonmeldingen, zonder ruis

- **ID:** `mobile-notifications`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Alleen berichten over werkelijk ontvangen betaling, klantactie, batch of opvallende prestatie.
- **Omvang / status:** Middel tot groot; aparte toestemming
- **Volgende stap:** Onderzoek PWA/WebPush en servertrigger; één instelbaar type per melding, geen controles/iederrefresh-push.
- **Klaar wanneer:** Pushoptin door gebruiker, bedrijfs/deviceafscheiding en geen gevoelige dossierinhoud op vergrendelscherm. Geen actieve meldingendienst claimen.
- **Eerst nodig:** 20. Dezelfde CRM-opmaak en previewtool zonder wifi
- **Vindplaatsen:** `admin/offline/`, `cloudflare/`, `docs/plan/AUTOMATISERINGEN.md`

### 22. Mailadressen, Gmailarchief en continuïteit in 2027

- **ID:** `mail-routing-future`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Info/facturen rechtstreeks kunnen ontvangen en de verzendroute begrijpen.
- **Omvang / status:** Klein onderzoek; configuratie apart
- **Volgende stap:** Googlewijziging betreft Gmailify/POP-ophalen; Cloudflare-forwarding is een andere route. Per alias ontvanger/Reply-To controleren. Bestaand SMTP2GO verzendt buiten GmailVerzonden.
- **Klaar wanneer:** Geen onnodige migratie, DNSverandering, BCC of Gmail-schrijfbevoegdheid; eerst exacte opzet vastleggen, alle aliassen testen na toestemming.
- **Eerst nodig:** 2. Gmail online instellen zonder verwarring met localhost
- **Vindplaatsen:** `docs/EMAIL.md`, `cloudflare/gmail.js`, `cloudflare/mail.js`

### 24. Externe ontvangst, sorteren en versturen vergelijken

- **ID:** `fulfilment-crossdock`
- **Voor:** Spatlappen
- **Doel:** Beoordelen of uitbesteden werkelijk goedkoper en betrouwbaarder is dan zelf versturen.
- **Omvang / status:** Onderzoek; offertes nodig
- **Volgende stap:** Vergelijk sorteren, orderpicken, labels, handling, transport, claims en eigen tijd. Dit is overslag/crossdock, niet automatisch langdurige voorraadopslag.
- **Klaar wanneer:** Geen besparingsclaim zonder quotes/aantallen; eerst één gecontroleerde proefbatch, aflever-/adresbestanden pas na bewuste deelkeuze.
- **Eerst nodig:** 12. Winst en transportbeslissing per batch
- **Vindplaatsen:** `shared/purchase-stock.js`, `docs/plan/AUTOMATISERINGEN.md`

### 25. Eén bedrijfsCRM met markten/landen en verzendroutes

- **ID:** `international-markets`
- **Voor:** Spatlappen
- **Doel:** Andere domeinen/talen/markten kunnen filterbaar bij dezelfde bedrijfsadministratie horen.
- **Omvang / status:** Groot; gefaseerd
- **Volgende stap:** Advies: markt, taal, leverland, factuurland, valuta, magazijn en verzendbatch apart modelleren; geen CRMkopie per land. Andere rechtspersoon/administratie blijft aparte grens.
- **Klaar wanneer:** Eerst Nederland/België betrouwbaar, daarna één extra markt. Rechtstreekseroute van Turkije naar Frankrijk en lokale fulfilment/btw pas na logistieke/fiscale inrichting.
- **Eerst nodig:** 19. Nog te leveren maatwerk per product volgen; 23. Btw-aangifte voorbereiden per kwartaal
- **Vindplaatsen:** `shared/companies.js`, `shared/state-validation.js`, `docs/plan/ARCHITECTUUR.md`

### 26. Keuze voor VOF of BV op winst, risico en kosten

- **ID:** `vof-bv-decision`
- **Voor:** Spatlappen
- **Doel:** Geen rechtsvormwissel alleen op twee maanden omzet baseren.
- **Omvang / status:** Onderzoek met boekhouder/notaris
- **Volgende stap:** Leg verwachte structurele winst per vennoot, aansprakelijkheid, privéopnames, verzekeringen en jaarlijkse administratie vast; beoordeel fiscaleinbreng/terugwerkende kracht vooraf.
- **Klaar wanneer:** Geen generieke BVomzetgrens of vrije winstverschuiving met terugwerkende kracht beloven; nieuwejuridischeidentiteit en historische documentsnapshots onderscheiden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `docs/plan/ARCHITECTUUR.md`, `docs/plan/BESLUITEN.md`

### Online AI met het gekozen ChatGPT-abonnement

- **ID:** `chatgpt-cloud-sign-in`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Gebruiker wil het eigen ChatGPT-abonnement blijven gebruiken en zelf aanmelden; geen API-verbruik als stil alternatief.
- **Omvang / status:** Afhankelijk van ondersteunde aanmelding
- **Volgende stap:** Bepaal een daadwerkelijk ondersteunde online aanmeldroute met registratie. Houd intussen handmatige AI-prompt/import beschikbaar en benoem geïntegreerde AI online als nog niet ingericht.
- **Klaar wanneer:** Geen actieve cloudkoppeling claimen op basis van lokale login of bestaande knop. Geen sleutels/tokens in browser of prompt; providerrechten en kosten vooraf duidelijk.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `assistant/chatgpt-auth.mjs`, `assistant/server.mjs`, `admin/assistant.js`, `docs/ASSISTENT.md`

### Boekhouding koppelen, bijvoorbeeld Exact

- **ID:** `exact-integration`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Onderzoeken waar klant-, factuur- en betaalgegevens nu dubbel worden ingevoerd.
- **Volgende stap:** Bepaal eerst welk systeem per gegeven leidend is, welke administratie erbij hoort en hoe correcties worden verwerkt. Nog geen account koppelen.
- **Klaar wanneer:** Een gegevensmapping, benodigde rechten en proefscenario met fictieve gegevens zijn beschreven vóór implementatie.
- **Eerst nodig:** Van akkoord naar uitvoering zonder dubbel invoeren; Veilig tegelijk aan een dossier werken
- **Vindplaatsen:** `docs/plan/AUTOMATISERINGEN.md`

### Samenwerken met een leverancier

- **ID:** `supplier-collaboration`
- **Voor:** Maatwerkkunststof
- **Doel:** Een leverancier kan een technische aanvraag en eigen tarieven controleren zonder toegang tot andere klantdossiers.
- **Volgende stap:** Bepaal wat gedeeld mag worden: een afzonderlijk aanvraagbestand, afgeschermde pagina of later een portaal.
- **Klaar wanneer:** Toegang, prijseigendom en wie wat bevestigt zijn duidelijk. Bestaande lokale presentatiemodus is geen beveiligd leveranciersportaal.
- **Eerst nodig:** Calculator V2 als complete werkroute
- **Vindplaatsen:** `tools/costing-v2/`, `docs/ACCOUNTS-EN-BEVEILIGING.md`

## Al aanwezig

Dit vormt de basis. Uitbreidingen blijven apart in het plan staan.

### Afwijkende btw: redenen vastleggen en terugvinden

- **ID:** `vat-exception-review`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Afwijkingen van 21% bewust verklaren en terugvinden, met herbruikbare eigen redenen per bedrijfsadministratie.
- **Omvang / status:** Alleen lokaal · niet getest
- **Volgende stap:** Lokaal gebouwd: Analytics → Btw-controle (#analytics/vat), afwijkend/ontbrekende reden/alle tarieven, periode op aanvraagdatum, ook archief. Reden verplicht in order- en AI-importformulier bij afwijking, eigen reden met expliciete bewaaroptie. Geen volledige aangiftehulp, tests, build of publicatie.
- **Klaar wanneer:** Geen fiscale classificatie uit alleen percentage/land afleiden; 0/verlegd/vrijgesteld gescheiden. Bestaande orders zonder reden blijven intact en worden gemarkeerd. Oude documenten niet wijzigen, toekomstige documentmetadata bewaart reden apart van klantinhoud. Verplichte keuze vóór nieuw bewaren, bedrijfsgrens en conflicten behouden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/vat-review.js`, `admin/orders/vat-reason.js`, `admin/analytics/vat.js`, `docs/BTW-CONTROLE.md`

### 50. Instellingen en Overzicht in tabs, CRM-stijl centraal

- **ID:** `workspace-section-tabs-style`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Lange pagina’s per taak openen en leesbare gedeelde tekst-/hoverkleuren gebruiken.
- **Omvang / status:** Alleen lokaal · niet getest
- **Volgende stap:** Instellingen6tabs en Overzicht3tabs lokaal gebouwd met gemounte formulieren en URL-/toetsenbordnavigatie. Werkplek-, zoek- en analytics-CSS naar admin/style.css; één actief stylesheet met gedeelde palet-/statusparen. Geen tests/contrastmetingen/build/browser-QA/publicatie; gebruiker beoordeelt.
- **Klaar wanneer:** Geen invoerverlies bij tabwisseling, geen settingsopslag door navigatie, beide bedrijfsprofielen dezelfde UI. Nieuwe CRM-opmaak centraal en leesbare foreground/background bij hover/focus/selected; tools en HTML-mail afgebakend.
- **Eerst nodig:** Gegroepeerd menu en één ontwikkelplan
- **Vindplaatsen:** `admin/workspace/overview-settings.js`, `admin/workspace/section-tabs.js`, `admin/style.css`, `admin/index.html`, `docs/UX-WERKPLEK.md`

### 49. CRM-hoofdcode opdelen en losse modules ordenen

- **ID:** `crm-feature-source-structure`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Schermen/formulieren bij hun feature, app.js voor centrale samenstelling, routes en opslagcoördinatie.
- **Omvang / status:** Alleen lokaal · niet getest
- **Volgende stap:** 133functies in11featurefactories, actuele status via expliciete contextgetters/setters.12implementaties naar submappen; oude paden behouden als compatibele re-exports. app.js ongeveer66% minder tekens. Geen nieuwe state/opslag/providers. Geen tests/build/browser-QA uitgevoerd; gebruiker controleert.
- **Klaar wanneer:** Gemeenschappelijke code voor beide bedrijven, behoud centrale transacties en IDs, geen terugimport naar app.js. Vindkaart en afhankelijkheidscontract gedocumenteerd.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/app.js`, `admin/workspace/ARCHITECTURE.md`, `admin/documents/`, `admin/orders/`, `admin/customers/`, `admin/purchases/`, `admin/mail/`, `admin/inquiries/`, `admin/analytics/`

### 48. Spatlap-editor opdelen en oude werkpakketten opruimen

- **ID:** `preview-source-structure`
- **Voor:** Spatlappen
- **Doel:** Schermstructuur, styling, functiegroepen en initialisatie duidelijk scheiden zonder ontwerpdata of gedrag te herschrijven.
- **Omvang / status:** Alleen lokaal · niet getest
- **Volgende stap:** HTML circa700regels,163functies in8bestanden, aparte CSS/boot/runtime/bootstrap. Gedeelde state en bestaande API behouden; nog geen volledige ES-module-isolatie.13oude gegenereerde werkpakketten verwijderd124,9MiB; Gitcheckouts/back-ups behouden. Gebruiker test zelf; geen tests/build/browser-QA uitgevoerd.
- **Klaar wanneer:** Bestaande ontwerp-URL, schema en opslag blijven leidend. Laadvolgorde en vindkaart gedocumenteerd. Nieuwe bestanden gaan via bestaande admin-build mee.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/editor/`, `spatlap-preview.html`, `docs/plan/ARCHITECTUUR.md`

### 47. Ontwerpkopie en onderdelen tussen tabs overzetten

- **ID:** `preview-portable-transfer`
- **Voor:** Spatlappen
- **Doel:** Ontwerp veiligstellen zonder Bewaar en geselecteerde onderdelen via systeemklembord naar een andere ontwerptab meenemen.
- **Omvang / status:** Lokaal aangepast · gebruiker controleert
- **Volgende stap:** Ontwerp overzetten onderaan: tekst kopiëren/plakken, JSON downloaden/laden, ingesloten assets. Selectie via native copy/cut/paste met nieuwe IDs. Herstelknop buiten inert werkgebied. Geen CRM-integratie of klantkoppeling; gemelde opslagblokkade nog niet vastgesteld. Geen tests/build/browser-QA op gebruikersverzoek.
- **Klaar wanneer:** Versie1-formaat, begrensde gevalideerde data, SVG-sanitizer, geen externe bestandspaden of overgenomen klant/ordercontext. Productgebonden tab weigert volledige import; losse tab opent nieuwe onbewaarde kopie met undo. Oude tab niet verversen zonder kopie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/design-transfer.js`, `admin/designs/transfer.js`, `spatlap-preview.html`, `docs/ONTWERP-OVERZETTEN.md`

### 45. Mobiele preview bovenaan en passend beeldvak

- **ID:** `preview-responsive-frame`
- **Voor:** Spatlappen
- **Doel:** Mobiele header scrollt uit beeld en preview sluit bovenaan aan; beeldvak volgt spatlapverhouding.
- **Omvang / status:** Lokaal aangepast · gebruiker controleert
- **Volgende stap:** Lokaal aangepast. Mobiel max42% schermhoogte/max360px met ruimte voor zoom/dimensies; desktop eigen begrenzing. Gebruiker heeft verdere eigen tests overgenomen.
- **Klaar wanneer:** Geen lege vaste headerstrook na scroll; brede en vierkante spatlappen verschillend kader; ontwerpgeometrie behouden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `shared/spatlap-layout.js`

### 46. Zichtbare bezig-, klaar- en foutmeldingen in de ontwerptool

- **ID:** `preview-action-feedback`
- **Voor:** Spatlappen
- **Doel:** Na bewaren/export/import/laden direct zien dat de klik verwerkt wordt en hoe die eindigt.
- **Omvang / status:** Lokaal aangepast · niet zelfstandig getest
- **Volgende stap:** Lokaal gebouwd: knoptekst+disabled/aria-busy en vaste statusmelding met spinner. Bevestiging na echte opslag/generatie, fout blijft tot sluiten/nieuwe poging. Bewaren, PNG/PDF/SVG, openen/init, logo-import/vervangen/vectoriseren/aansnijden meegenomen. Gebruiker test zelf; geen test/build/browser-QA uitgevoerd.
- **Klaar wanneer:** Geen succes vóór opslag gereed. Fout/cancel/partiële import eerlijk; overlappende activiteiten behouden knopstatus. Actiemelding blijft zichtbaar terwijl werkgebied inert is. Geen ontwerp-/ordergegevens wijzigen door feedback.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `admin/designs/shortcuts.js`

### 44. Bewaar- en exportsneltoetsen, aantal optioneel

- **ID:** `preview-save-export-shortcuts`
- **Voor:** Spatlappen
- **Doel:** ⌘⇧S bewaart, ⌘⇧E downloadt klantpreview-PNG en ⌘⇧T het vector-drukbestand.
- **Omvang / status:** Lokaal gebouwd · niet gepubliceerd
- **Volgende stap:** Zelfde knoppen/routes, ook Ctrl+Shift. Herhaling en actieve dialogen/inert/pipet afgevangen; actieve invoer eerst blur. Leeg ontwerpaantal geaccepteerd, bestaand orderaantal behouden; expliciet ingevuld aantal blijft gevalideerd. Alle drie Mac-combinaties echt getest in geïsoleerde fictieve browseropslag.
- **Klaar wanneer:** Geen vervanging onbekend door0/1; bestaande leveranciers-/conflictguards behouden. Leeg aantal blijft leeg in artwork, orderaantal niet wissen. Shortcuts/tooltips/hulp zichtbaar; browser kan systeemcombinaties reserveren, knoppen blijven beschikbaar.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/shortcuts.js`, `shared/design-shortcuts.js`, `admin/product-designs.js`, `spatlap-preview.html`, `tests/design-shortcuts.mjs`

### 43. Kleur en zelfstandig pipet bij de selectie

- **ID:** `preview-selection-colors`
- **Voor:** Spatlappen
- **Doel:** Photoshopachtige kleurbediening onder de preview, onafhankelijk van browserkleurvenster.
- **Omvang / status:** Lokaal gebouwd · niet gepubliceerd
- **Volgende stap:** Eigen kleurvenster (stalen, HEX, RGB) en aparte artworkpipet onder selectie. Hele vector/tekst/groep of expliciete vulling/lijn van los vectoronderdeel; transparantie en undo behouden. Browserfictietests tekst/hele vector/los onderdeel/pipet/undo/mobiel geslaagd; geen andere browsers fysiek getest. Pipet kiest uit ontwerp, niet buiten browservenster.
- **Klaar wanneer:** Zelfde kleurbron voor preview en opgeslagen vector; undo, geen rasterlogo onbedoeld verven, geen schermopname of provider. Asynchrone sample weigert gewijzigde selectie; transparantie behouden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/selection-color.js`, `shared/design-colors.js`, `spatlap-preview.html`

### 42. Nieuwe ontwerpen zonder gaten met meeschalende onderhoeken

- **ID:** `preview-default-shape`
- **Voor:** Spatlappen
- **Doel:** Nieuwe ontwerpen beginnen met montagegaten uit en afgeronde onderkant.
- **Omvang / status:** Lokaal gebouwd · niet gepubliceerd
- **Volgende stap:** Radius standaard20% van kortste zijde, afgerond op0,1cm; auto meeschalen expliciet schakelbaar. Handmatig wijzigen stopt auto. Bestaande ontwerpen zonder nieuwe radiusAuto-vlag blijven handmatig. Nieuwe start/reset en productmaten meegenomen.
- **Klaar wanneer:** Bestaande gaten/vorm/radius behouden. Auto/manual-mode in undo en ontwerpdata; expliciete URL-radius is handmatig. Geen klant- of orderwijziging.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `shared/spatlap-layout.js`, `tests/spatlap-layout.mjs`

### 35. Feedback melden vanuit de Spatlappen-ontwerptool

- **ID:** `preview-feedback`
- **Voor:** Spatlappen
- **Doel:** Een vaste Feedback-knop opent een melding met ontwerptoolcontext zonder ontwerp te verliezen.
- **Omvang / status:** Lokaal gebouwd · nog niet gepubliceerd
- **Volgende stap:** Lokaal gebouwd. Vaste Feedback melden bij de preview, bestaande bedrijfsfeedbackdienst en elementkeuze hergebruikt; ontwerptoolcontext zonder artworkpayload. Formulier geopend/annuleren browsergecontroleerd; geen echte proefmelding opgeslagen.
- **Klaar wanneer:** Bestaande bedrijfsfeedback hergebruiken; geen nieuw los feedbacksysteem. Bewaren bevestigen en invoer bij fout behouden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`

### 36. Snelle selectie en formaatknoppen onder het ontwerp

- **ID:** `preview-selection-tools`
- **Voor:** Spatlappen
- **Doel:** Kleiner en Groter naast Kopiëren en Dupliceren; slepen over lege ruimte selecteert meerdere onderdelen.
- **Omvang / status:** Lokaal gebouwd · nog niet gepubliceerd
- **Volgende stap:** Lokaal gebouwd. Kleiner/Groter (10%) in selectiebalk; sleepkader in beide richtingen, Shift toevoegen, groep samen verplaatsen/schalen, één undo-stap. Fictieve browsercontrole met twee SVG-logo’s geslaagd, mobiel bereikbaar.
- **Klaar wanneer:** Selectiekader in beide richtingen; Shift voegt toe; groep samen verplaatsen en proportioneel schalen rond groepsmidden. Eén ongedaan-stap per handeling; Spatie blijft pannen.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`

### 37. Rode uitlijnhulplijnen en schakelbaar snappen

- **ID:** `preview-alignment-guides`
- **Voor:** Spatlappen
- **Doel:** Logo’s en tekst op bovenkant, midden, onderkant of dezelfde as uitlijnen.
- **Omvang / status:** Lokaal gebouwd · nog niet gepubliceerd
- **Volgende stap:** Lokaal gebouwd. Rode tijdelijke midden-/randhulplijnen, onafhankelijk tonen/snappen, Alt vrij bewegen. Dichtstbijzijnde target binnen 6 schermpixels; groepskader versus andere objecten/spatlapassen. Pure regressies en fictieve dragcontrole geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Rode live hulplijnen met toggle voor tonen en apart voor snappen. Targets: spatlapmidden en andere objectranden/centra; Alt tijdelijk vrij bewegen. Hulplijnen nooit in export.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`

### 40. Logo’s bij import meteen logisch plaatsen

- **ID:** `preview-smart-import`
- **Voor:** Spatlappen
- **Doel:** Passende breedte én hoogte, onderaan gecentreerd met bescheiden marge; extreme verhoudingen passen ook.
- **Omvang / status:** Lokaal gebouwd · nog niet gepubliceerd
- **Volgende stap:** Lokaal gebouwd. Nieuwe import onderaan gecentreerd, breedte én hoogte begrensd met fysieke marge. Extra imports krijgen begrensde verspringing; geen automatische overlapoplossing. Vervangen houdt bestaande frame. Extreme ratio’s pure tests; SVGbrowservoorbeeld passend. Plaatsingsvoorkeuren apart bij41.
- **Klaar wanneer:** Alleen nieuw geïmporteerde objecten positioneren; bestaand ontwerp/replacement behouden. Aanvullende imports niet blind op elkaar stapelen; conflictsituatie zichtbaar en ongedaan mogelijk.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`

### HTML-handtekening uploaden voor e-mail

- **ID:** `html-email-signature`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Een eigen HTML-handtekening met opmaak, links en afbeeldingen gebruiken in gewone CRM-mails.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Lokaal gebouwd. Upload .html/.htm bij E-mail & facturen, controleer voorbeeld en tekstfallback, sla expliciet op. Geen echte mailproef uitgevoerd; gebruiker test de bediening.
- **Klaar wanneer:** Opmaak gaat als HTML-body naast tekst mee; scripts en actieve inhoud verwijderd. Handtekening in verzendvoorbeeld gelijk aan providerpayload; gewijzigde instellingen blokkeren oude preview. Beide bedrijven gescheiden; geen automatische verzending.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/mail-signature.js`, `shared/mail-service.js`, `admin/email-service.js`, `admin/app.js`, `tests/mail-signature.mjs`

### Bouwtaken afvinken en overdracht bewaren in het CRM

- **ID:** `build-task-board`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Philippe en toekomstige AI-bouwers gebruiken dezelfde afvinkbare lijst met opmerkingen en controlebewijs.
- **Omvang / status:** Lokaal gereed · nog niet live
- **Volgende stap:** Open Beheer → Bouwtaken. Lees het bestaande log, gebruik je eigen bouwernaam, noteer resultaat/tests/beperkingen en leg publicatie apart vast. Catalogus in broncode; actuele voortgang in de planning-opslag.
- **Klaar wanneer:** Bewaren/herladen, historische opmerkingen, bedrijfsgrens, statusconflicten, verloren ACK, back-up en mobiel gecontroleerd. Geen klant-/order-/mailwijziging door een taakafvinkactie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/workspace/development-plan.js`, `admin/workspace/build-task-store.js`, `shared/planning/progress.js`, `tests/build-tasks.mjs`, `docs/BOUWTAKEN.md`

### 1. Felpaars CRM-icoon in het browsertabblad

- **ID:** `crm-favicon`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** CRM-tabs direct herkennen tussen gewone websites.
- **Omvang / status:** Live bij Spatlappen · Maat lokaal
- **Volgende stap:** Gebouwd en gecontroleerd; live bij Spatlappen (release spatlappen-branding-gmail-20261017), Maat lokaal. Eigen SVG-icoon voor beide profielen bij CRM/login, plus offline codebundel.
- **Klaar wanneer:** Zichtbaar bij CRM, login en toekomstige geïnstalleerde webapp. Geen openbare websitebranding vervangen.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/index.html`, `login.html`, `scripts/build-pages.mjs`, `admin/icons/`, `admin/branding.js`, `functions/_middleware.js`

### 2. Gmail online instellen zonder verwarring met localhost

- **ID:** `gmail-online-guidance`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** De bestaande browser gebruiken met het juiste Web-app-clientbestand voor de online server.
- **Omvang / status:** Live bij Spatlappen · Maat lokaal
- **Volgende stap:** Gebouwd en gecontroleerd; live bij Spatlappen (release spatlappen-branding-gmail-20261017), Maat lokaal. Typeverschil, behoud Desktop-client, exacte callback en testmodus uitgelegd. Gebruiker koppelt zelf.
- **Klaar wanneer:** Gebruiker koppelt zelf. Geen bestaand lokaal account wissen, geen echte mails/Gmailwijzigingen. Testmodus/verificatie apart uitleggen.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/mail-inbox.js`, `shared/google-oauth-client.js`, `cloudflare/gmail.js`, `docs/EMAIL.md`, `tests/gmail-upload.mjs`

### 3. Gaten en glad/anti-spray expliciet op documenten

- **ID:** `explicit-spatlap-specs`
- **Voor:** Spatlappen
- **Doel:** Klant en leverancier zien wat voor uitvoering daadwerkelijk is afgesproken.
- **Omvang / status:** Lokaal gereed · nog niet live
- **Volgende stap:** Lokaal gebouwd en gecontroleerd; niet gepubliceerd. Gestructureerde gaten/oppervlak-keuzes en voorstellen in nieuwe klantdocumenten. Oude documenten behouden.
- **Klaar wanneer:** Geen onbekende specificatie stil bevestigen, oude PDF niet overschrijven; pakbon/offerte/bevestiging consistent. Bedrijf- en productspecifiek, niet op kunststof plakken.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/app.js`, `document-generator.py`, `shared/state-validation.js`, `docs/plan/AUTOMATISERINGEN.md`, `shared/product-specifications.js`, `admin/products/specifications.js`, `tests/concrete-ux.mjs`

### 4. Teststukken herkenbaar met opvolging

- **ID:** `sample-order-followup`
- **Voor:** Spatlappen
- **Doel:** Gratis leveranciersproeven zijn zichtbare investeringen, geen ontbrekende kostprijs.
- **Omvang / status:** Lokaal gereed · nog niet live
- **Volgende stap:** Lokaal gebouwd en gecontroleerd; niet gepubliceerd. Proefmarkering, bekende kosten, opvolgdatum/afronding en dashboardtaak. €0 inkoop apart van onbekend transport.
- **Klaar wanneer:** Geen totale investering van €0 claimen bij onbekende bijkomende kosten. Teststukken apart analyseren en uitsluiten van normale prijsvoorspelling.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/app.js`, `shared/work-queue.js`, `shared/state-validation.js`, `admin/products/sample-order.js`, `shared/sample-order.js`, `tests/concrete-ux.mjs`

### 5. Komma en punt consequent bij geldinvoer

- **ID:** `money-input-consistency`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Bedragen kunnen met komma of punt worden ingevuld en worden Nederlands weergegeven.
- **Omvang / status:** Lokaal gereed · nog niet live
- **Volgende stap:** Lokaal gebouwd en gecontroleerd; niet gepubliceerd. Centrale formulierbediening accepteert komma/punt, toont komma, bewaart canonical decimalen en behoudt herhaalde veldnamen.
- **Klaar wanneer:** Regressies voor paste/typen/negatief/teveeldecimalen en onbekende bedragen; geen stille verandering van bestaande bedragen.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `number-inputs.js`, `admin/app.js`, `tests/form-guidance.mjs`, `admin/decimal-fields.js`, `shared/decimal-input.js`, `tests/concrete-ux.mjs`

### 7. Alleen belangrijke hiaten bij naderende levering

- **ID:** `critical-inbound-checks`
- **Voor:** Spatlappen
- **Doel:** Werkvoorraad noemt relevante blokkades, geen lange lijst kleine ontbrekende velden.
- **Omvang / status:** Lokaal gebouwd · gebruikstest bij Philippe
- **Volgende stap:** Lokaal gebouwd; nog niet gepubliceerd. Werkvoorraad en order gebruiken dezelfde gerichte leverhiaten bij onderweg/ontvangen. Expliciete leverwijze onder Adres & levering, geen factuurmail als algemene blokkade. Technische regressies geslaagd; gebruiker controleert de bediening.
- **Klaar wanneer:** Expliciete leverwijze bepaalt noodzakelijke gegevens. Bekende0kosten zijn bekend; geen automatische fysieke voortgang.
- **Eerst nodig:** Nuttige vervolgstappen na betaling
- **Vindplaatsen:** `shared/inbound-readiness.js`, `shared/order-readiness.js`, `shared/work-queue.js`, `admin/orders/fulfilment.js`, `admin/sales-funnel.js`, `shared/state-validation.js`, `tests/order-readiness.mjs`

### 8. Nieuwe orders standaard naar de open Turkije-batch

- **ID:** `active-purchase-batch`
- **Voor:** Spatlappen
- **Doel:** Na vertrek van batch 1 wordt batch 2 de voorgestelde verzamelbestelling.
- **Omvang / status:** Lokaal gereed · nog niet live
- **Volgende stap:** Lokaal gebouwd en gecontroleerd; niet gepubliceerd. Expliciete voorkeur of unieke open batch voorgesteld bij nieuwe aanvragen, vrije keuze en stale-batchcontrole. Bestaande koppelingen blijven staan.
- **Klaar wanneer:** Bestaande koppelingen nooit stil verplaatsen; geen batch op factuurdatum of leveranciersnaam raden. Bij meerdere open batches bewuste keuze.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/purchase-stock.js`, `admin/app.js`, `shared/state-validation.js`, `shared/purchase-default.js`, `tests/concrete-ux.mjs`

### 9. Batchdocumenten, waarschuwing en archief

- **ID:** `purchase-transit-guards`
- **Voor:** Spatlappen
- **Doel:** Transportbevestiging, leveranciersdocumenten en orders horen bij dezelfde batch.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Batchkoppelingen controleren vertrek/archief op verse gegevens, met expliciete transitafwijking. Leveranciersregels verhinderen onbedoeld verplaatsen. Transport-/leveranciers-/betaal-/douanebestanden krijgen een batchlabel. Archiveren pas na gekoppelde leveringen, historie blijft intact. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Kosten/omzet/betalingen blijven doorzoekbaar en meetellen na archief; afwijkingen expliciet bevestigen. Handmatige bronkoppeling blijft mogelijk.
- **Eerst nodig:** 8. Nieuwe orders standaard naar de open Turkije-batch
- **Vindplaatsen:** `shared/purchase-workflow.js`, `admin/purchases/workflow.js`, `admin/app.js`, `tests/purchase-workflow.mjs`

### 10. Aankomstmail als gecontroleerd voorstel

- **ID:** `arrival-mail-drafts`
- **Voor:** Spatlappen
- **Doel:** Bij ontvangst per klant een passend bericht voorbereiden zonder echte verzending.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Aankomstmail voorbereiden bij werkelijk ontvangen batch. Passend restant-/leverafspraak-/betaald voorstel, onbekende bedragen blijven onbekend; één passend gesprek hergebruikt. Alleen composer openen, geen automatische opslag of verzending. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Geen morgen beloven zonder geplande verzenddatum, onbekende bezorgkosten niet0, geen verzendkosten dubbel innen; preview en aparte bevestiging.
- **Eerst nodig:** 7. Alleen belangrijke hiaten bij naderende levering; 9. Batchdocumenten, waarschuwing en archief
- **Vindplaatsen:** `shared/arrival-mail.js`, `admin/purchases/arrival.js`, `tests/purchase-workflow.mjs`

### 11. Pakbonnen per Turkije-bestelling controleren en samen downloaden

- **ID:** `batch-packing-slips`
- **Voor:** Spatlappen
- **Doel:** Na ontvangst de relevante pakbonnen met vooraf zichtbare hiaten als één printbare PDF downloaden.
- **Omvang / status:** Uitgebreid op 19 oktober · alleen lokaal, niet getest
- **Volgende stap:** Eigen tabblad Pakbonnen. Controlelijst en order-/bestandsselectie vóór downloaden, bewuste bevestiging bij waarschuwingen. Nieuwe pakbonnen voor volledige leverancierslevering als PDF+Word samen opslaan, bestaande PDF’s/revisies behouden. Eén gecombineerde PDF zonder leverstatuswijziging. Geen tests/checks/build/browser-QA of publicatie; gebruiker controleert.
- **Klaar wanneer:** Belangrijke ontbrekende gegevens vóór download zichtbaar; override expliciet, onbekende adressen herkenbaar. Geen verzonnen aantallen, lokale producten of afgehandelde orders stil meenemen. Deelleveringen afzonderlijk controleren. Verse bron-/nummercontrole en gezamenlijke transactie; geen dubbele nummers of stille revisies.
- **Eerst nodig:** 7. Alleen belangrijke hiaten bij naderende levering; 9. Batchdocumenten, waarschuwing en archief
- **Vindplaatsen:** `shared/batch-packing-review.js`, `shared/batch-packing.js`, `shared/document-address.js`, `admin/purchases/packing.js`, `admin/purchases/batch-workspace.js`, `admin/documents/merge-pdfs.js`

### 12. Winst en transportbeslissing per batch

- **ID:** `batch-freight-economics`
- **Voor:** Spatlappen
- **Doel:** Zien hoe Turkije-transport, binnenlands bezorgen en productmarge zich verhouden.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Batchresultaat uit dezelfde CRM-geldprojectie, met gearchiveerde orders en niet-verdeelde batchkosten. Eigen transportaanname/bandbreedte vervangt de bestaande freight éénmaal; alleen lokaal scenario, geen kostenopslag. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Toon opbrengst, directe kosten, batchtransport en lokale bezorging afzonderlijk. Voorlopige waarden/verdeelsleutels zichtbaar; archief beïnvloedt historie niet.
- **Eerst nodig:** 9. Batchdocumenten, waarschuwing en archief
- **Vindplaatsen:** `shared/batch-economics.js`, `admin/purchases/economics.js`, `tests/batch-economics.mjs`

### 13. Foutieve betalingen gecontroleerd verwijderen/corrigeren

- **ID:** `payment-removal-correction`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Een fout of proefbetaling kan uit het actuele ordersaldo zonder dubbel herimporteren.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Ontvangst gecontroleerd aanpassen of uit saldo halen met reden en originele registratie in correctielog. Herstel mogelijk. Geen providerbedrag aanpassen; verwijderde Tikkie-ontvangst wordt niet opnieuw geïmporteerd. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Geen echt betaalproviderbedrag wijzigen of financiële historie onherleidbaar wissen; correcte saldo-, document- en deduplicatieregels.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/payment-corrections.js`, `admin/orders/payment-corrections.js`, `admin/payment-workflow.js`, `tests/payment-corrections.mjs`

### 14. Aanbetaling en productievrijgave als expliciete afspraak

- **ID:** `deposit-production-rule`
- **Voor:** Spatlappen
- **Doel:** Nieuwste feedback: vanaf 50% aanbetaling productievrijgave voorstellen; afwijkingen van de afgesproken betaallink duidelijk tonen.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Voorstel vanaf 50% werkelijke ontvangst bij bekende prijs, ontwerpgoedkeuring en complete specificaties. Percentage per order expliciet bevestigd, betaallinkafwijking zichtbaar. Vrijgave is een eigen fase; fysieke start blijft afzonderlijke registratie. Gewijzigde voorwaarden komen opnieuw onder aandacht. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Nieuwe wens van 17 oktober vervangt de eerdere 70%-wens; nog niet actief. Controleer prijs, werkelijk ontvangen voorschot en ontwerpvoorwaarden; teststuk0 heeft eigen route. Betaling maakt geen pakbon, levering of verzending gebeurd.
- **Eerst nodig:** Nuttige vervolgstappen na betaling
- **Vindplaatsen:** `shared/production-release.js`, `admin/orders/production-release.js`, `shared/order-readiness.js`, `shared/sales-funnel.js`, `tests/production-release.mjs`

### 15. Tijdelijke inkoophulp voor verkoopprijs

- **ID:** `supplier-price-estimates`
- **Voor:** Spatlappen
- **Doel:** Een tijdelijke inkoopindicatie helpt Philippe een verkoopprijs te kiezen; het is geen werkelijke kostprijs.
- **Omvang / status:** Historische Erturk-hulp lokaal gebouwd · niet getest
- **Volgende stap:** Lokaal: Verkoopprijs bepalen vergelijkt actuele positieve Erturk-productinkoop op maat/aantal/drukkleuren, toont indicatie/bandbreedte/voorbeeldaantal. Factuurregels per stuk/paar zonder dubbeltelling, geen offertes/nul/calculator/lokale productie; handmatige inkoop als terugval. Nieuwe echte prijzen doen vanzelf mee. Geen passende historie geeft handmatige invoer, geen nulschatting. Alleen gekozen verkoopprijs bewaren. Geen tests/build/browser-QA; nog niet gepubliceerd.
- **Klaar wanneer:** Geen geschatte inkoop in order/product/batch, marge, analytics, documenten, exports of back-ups. Alleen gekozen verkoopprijs bewaren; werkelijke inkoop blijft afzonderlijk. Geen schatting terughalen nadat een prijs is gegeven. Geen verzonnen tarieven; valuta/btw/transport/teststukken en bronvoorwaarden expliciet.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/erturk-price-estimate.js`, `shared/temporary-price.js`, `admin/orders/temporary-pricing.js`, `admin/orders/workspace.js`, `docs/TIJDELIJKE-PRIJSHULP.md`

### 16. Inzoomen en eigen grafiek kiezen

- **ID:** `analytics-drilldown-charts`
- **Voor:** Spatlappen
- **Doel:** Van jaar naar maand naar relevante orders en beperkte eigen X/Y-keuzes.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Eigen financiële grafiek met maand/klant/batch/land en orders/omzet/marge. Exact doorklikken naar dezelfde dossiers, inclusief archief/incomplete aanvragen. Onbekende bedragen en voorlopige marges zichtbaar. Google/SEO-aansluiting blijft apart bij taak6. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Gevalideerde eenheden/filters en bronherkomst; geen willekeurige databasequery, onbekend niet0 en geen financiële dubbeltelling.
- **Eerst nodig:** 6. Analytics-tabbladen afronden en controleren
- **Vindplaatsen:** `shared/financial-chart.js`, `admin/analytics/financial-chart.js`, `admin/dossier-search.js`, `tests/financial-chart.mjs`

### 28. Vroege aanvraag opslaan zonder prijs of akkoord

- **ID:** `early-inquiry-order`
- **Voor:** Spatlappen
- **Doel:** Een WhatsApp-aanvraag meteen op datum van vandaag als dossier bewaren om er een ontwerp aan te koppelen.
- **Omvang / status:** Lokaal gereed · nog niet live
- **Volgende stap:** Lokaal gebouwd en gecontroleerd; niet gepubliceerd. Aanvraagdatum en duidelijke uitleg, lege prijs/verzendprijs/levertijd toegestaan zonder akkoord/betaling.
- **Klaar wanneer:** Onbekende prijs blijft onbekend; geen akkoord of betaling verzinnen. Aanvraag verschijnt bij de juiste klant en kan later worden aangevuld. Ontwerpen blijven bij de bestaande productregel.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/app.js`, `shared/order-readiness.js`, `tests/form-guidance.mjs`, `tests/concrete-ux.mjs`

### 29. Klantnummer en startnummer zelf instellen

- **ID:** `customer-number-settings`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Klantnummers hoeven niet met 000 te beginnen en moeten bewust aanpasbaar zijn.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Nummering bij Klanten: startnummer en minimale cijfers, zonder bestaande klanten te hernummeren. Individueel klantnummer bij Klantgegevens aanpassen; uniek en conflictcontrole binnen dezelfde transactie. Bestaande IDs/documenten blijven behouden. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Bestaande interne IDs, dossiers, documenten en zoekverwijzingen blijven intact; geen stille hernummering of dubbele nummers.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/customer-number-settings.js`, `admin/customers/number-settings.js`, `admin/customer-numbers.js`, `tests/customer-number-image.mjs`

### 30. Productafbeeldingen verwijderen en eerste beeld kiezen

- **ID:** `product-primary-image`
- **Voor:** Spatlappen
- **Doel:** Zelf bepalen welk beeld als eerste bij het product verschijnt.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Als eerste tonen kiest een eigen hoofdafbeelding, onafhankelijk van ontwerpgoedkeuring. Eigen productgrens en verse keuzecontrole. Verwijderen gebruikt bestaande route; pointer wordt opgeruimd en bij ontwerpupdate geldig gehouden. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Beeld moet bij dit product horen; goedgekeurde beelden en historische documenten blijven behouden. Een afbeelding kiezen keurt het ontwerp niet goed.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/product-primary-image.js`, `admin/products/primary-image.js`, `shared/document-removal.js`, `admin/product-designs.js`, `tests/customer-number-image.mjs`

### 31. Benoemde kosten en verdeling per order/product

- **ID:** `named-extra-costs`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Naast vaste kostensoorten zelf kosten met een naam invullen en de kostverdeling begrijpen.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Benoemde kosten voor hele order, expliciet product of batch. Vaste kosten blijven apart; dezelfde projectie rekent de extra regels éénmaal mee. Leeg bedrag blijft onbekend, 0 geldig; wijzigingen hebben conflictcontrole. Geen klantdocumenten automatisch wijzigen. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Geen dubbeltelling naast bestaande kosten; onbekend blijft onbekend, expliciet0 blijft geldig. Btw/valuta/verdelen en historische totalen gecontroleerd; geen los tweede geldmodel.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/named-costs.js`, `admin/orders/named-costs.js`, `admin/app.js`, `tests/named-invoice-costs.mjs`

### 32. Ontvangsten kiezen voor een nieuw factuurdocument

- **ID:** `invoice-payment-selection`
- **Voor:** Spatlappen
- **Doel:** Bij factuurvoorbereiding bewust aangeven welke betalingen worden getoond/meegenomen.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Ontvangsten expliciet kiezen voor de toelichting van een nieuw factuurdocument. Snapshot van geselecteerde ontvangsten bewaard; verkoopregels, btw, saldo en echte betaaldstatus blijven gelijk. Keuze blijft behouden bij invulhulp, oude facturen blijven staan. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Selecteren wijzigt geen ontvangst, openstaand saldo of bestaande factuur. Geen omzet dubbel boeken of oude definitieve factuur overschrijven; correcties volgen aparte route.
- **Eerst nodig:** Nuttige vervolgstappen na betaling
- **Vindplaatsen:** `shared/invoice-payments.js`, `admin/documents/payment-selection.js`, `admin/app.js`, `tests/named-invoice-costs.mjs`, `tests/form-guidance.mjs`

### 33. Orderkaart filteren op batch en bezorgroute vergelijken

- **ID:** `delivery-route-scenarios`
- **Voor:** Spatlappen
- **Doel:** Na aankomst van een batch de bijbehorende adressen zien en zelf bezorgen vergelijken met losse verzending.
- **Omvang / status:** Lokaal gebouwd · nog niet live
- **Volgende stap:** Orderkaart filtert op batch en linkt naar bezorgvergelijking. Alleen opgeslagen bruikbare leveradressen selecteerbaar; routeschets in keuzevolgorde met eigen afstand/tijd/km-/uurtarief en pakketkosten. Geen externe routedienst of financiële opslag. Technische controles geslaagd; verdere gebruikstest bij Philippe.
- **Klaar wanneer:** Geen adres als bezorgklaar aanmerken bij ontbrekende informatie; routes/kosten als schatting met bron tonen. Geen gegevens naar een externe routedienst sturen zonder bewuste keuze.
- **Eerst nodig:** 7. Alleen belangrijke hiaten bij naderende levering; 12. Winst en transportbeslissing per batch
- **Vindplaatsen:** `shared/batch-economics.js`, `admin/purchases/economics.js`, `admin/app.js`, `tests/batch-economics.mjs`

### AI-prompt kopiëren, antwoord plakken en feedback behouden

- **ID:** `ai-copy-feedback-baseline`
- **Voor:** Maatwerkkunststof
- **Doel:** Eenvoudige hulp met zichtbare prompt, duidelijke kopieerbevestiging en één herkenbaar antwoordvak.
- **Omvang / status:** Bestaande lokale bediening; geen cloud-AI-login
- **Volgende stap:** Bestaande V2-dialogus behouden: opnieuw openen snel, concept blijft staan, elke kopieeractie geeft feedback. Uitbreidingen volgen de calculatorwerkroute; offline feedback heeft een eigen bestaande veilige overzetroute.
- **Klaar wanneer:** Geen overbodige stap2, geen dubbele popup of oude async-resultaten. Antwoord eerst controleren en daarna expliciet overnemen; feedback is geen automatische uitvoeropdracht.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `tools/costing-v2/workspace-help.js`, `admin/feedback.js`, `docs/UX-WERKPLEK.md`

### Offline rondkijken in dezelfde CRM-opmaak en feedback bewaren

- **ID:** `offline-feedback-review`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Een reis voorbereiden met een alleen-lezen CRM-kopie en feedback op het eigen apparaat bewaren.
- **Volgende stap:** Spatlappen live op 17 oktober; gebruiker moet de eigen kopie één keer online activeren. Volledige offline dossierbewerking, bestanden en ontwerpen vallen onder same-ui-offline. Maatwerkkunststof alleen lokaal getest.
- **Klaar wanneer:** Expliciete voorbereiding, gecontroleerde code-assets, bedrijfs-/eigenaarscope en 24u toegang; feedback/concept na herladen behouden, append-only overzetten met conflictcontrole en dedup. Geen business- of providerwrites vanuit reviewmodus.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/offline/review.js`, `admin/offline/review-store.js`, `admin/offline/feedback-outbox.js`, `tests/offline-feedback.mjs`, `docs/OFFLINE-WERKEN.md`

### Beperkte offline tussenoplossing op dezelfde CRM-URL

- **ID:** `offline-workspace`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Zonder lokale server klantgegevens, nieuwe basisorders en bestaande ordernotities op het eigen apparaat bewaren.
- **Volgende stap:** Dit is niet de gewenste volledige offlineCRM. Gebruiker wil dezelfde opmaak en previewtool; zie same-ui-offline. De bestaande beperkte route blijft behouden totdat een opvolger getest is. Alleen Spatlappen is gepubliceerd.
- **Klaar wanneer:** Beperkte projectie zonder mail/files/secrets, CAS en veldconflicten, verloren bevestiging gededupliceerd, nummers centraal, 24u offline toegang, geen stille vervanging of providerqueue.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/offline/`, `shared/offline-state.js`, `docs/OFFLINE-WERKEN.md`, `tests/offline-workspace.mjs`, `tests/offline-worker.mjs`

### Website-metingen en CRM-conversie

- **ID:** `website-conversion-live`
- **Voor:** Spatlappen
- **Doel:** Zien hoe bezoek, formuliergebruik, aanvragen en betaalde CRM-orders samenhangen, zonder fictieve cijfers of klantinhoud in gedragstelemetrie.
- **Volgende stap:** Controleer de eerste echte metingen en herkenningspatronen. Historische conversies worden niet geraden; verdere metingen voor Maatwerkkunststof blijven een eigen aansluiting.
- **Klaar wanneer:** Website en CRM gebruiken dezelfde aparte meetdatabase; bedrijfs-DB/R2 blijven gelijk. Formulier werkt bij weigering; betaalde conversie vereist bekende bedragen en volledige betaling. Geen echte mailproef zonder toestemming.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/analytics/`, `cloudflare/site-analytics.js`, `shared/site-conversion.js`, `docs/WEBSITE-METINGEN.md`

### Snelle aanvraagherkenning uit e-mail

- **ID:** `request-recognition`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Een geopende ontvangen mail kan klantnaam, contact, e-mail, telefoon en expliciete productgegevens alvast invullen; ontbrekende gegevens staan direct in beeld.
- **Volgende stap:** Voeg herkenningspatronen toe aan de hand van geanonimiseerde voorbeelden en regressietests; werk meervoudige productregels als aparte vervolgstap uit.
- **Klaar wanneer:** Lokaal patroonherkenning zonder AI-aanroep. Controle en bevestiging vóór CRM-opslag; bestaande klantvelden blijven behouden. Geen automatische mailboxtraining, prijzen of Gmail-wijzigingen. Chatstart wacht niet op spraak.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/request-recognition.js`, `admin/inquiries/`, `tests/request-recognition.mjs`, `docs/AANVRAAGHERKENNING.md`

### Prioriteit en wachttijd bij mail en taken

- **ID:** `mail-attention`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Zien wie op antwoord wacht, hoelang en wat eerst aandacht vraagt, zonder losse takenadministratie.
- **Volgende stap:** Breid patronen alleen uit met geanonimiseerde voorbeelden; echte automatische opvolging blijft apart gecontroleerd.
- **Klaar wanneer:** Eén projectie voor mailbox en ordertaken. Concepten resetten geen wachttijd. Aandachtfilter/sortering behouden antwoordtekst; onbekende datums zijn herkenbaar. Geen mail- of Gmailmutaties door de weergave.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/mail-attention.js`, `shared/work-queue.js`, `admin/mail-workspace.js`, `admin/workspace/task-list.js`, `tests/mail-attention.mjs`

### Klant als rustig startpunt voor alle dossiers

- **ID:** `customer-workspace`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Lopende dossiers met dezelfde vervolgstappen als de werkvoorraad, directe dossierlinks naar mail/documenten/inkoop, contact en betalingen zonder dubbele opslag.
- **Volgende stap:** Werk vanuit bestaande dossiers verder; nieuwe financiële regels of automatiseringen blijven apart gecontroleerd.
- **Klaar wanneer:** Maximaal drie lopende dossiers direct zichtbaar, overige ingeklapt. Onbekende bedragen heten Nog te bepalen; voorlopige bedragen zijn herkenbaar. Oude klanttabs en routes blijven geldig. Klantweergaven staan echt in admin/customers/.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/customers/`, `shared/customer-workspace.js`, `tests/customer-workspace.mjs`

### Gegroepeerd menu en één ontwikkelplan

- **ID:** `workspace-foundation`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Werkdag, Verkoop & relaties, Uitvoering en Beheer gebruiken dezelfde routes voor beide bedrijven.
- **Volgende stap:** Werk dit plan bij als een volgende stap is afgerond.
- **Klaar wanneer:** Navigatie staat in admin/workspace; dit scherm gebruikt shared/planning/roadmap.js. Architectuur en bouwwijze staan in docs/plan.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/workspace/`, `shared/planning/roadmap.js`, `docs/plan/`

### Algemeen zoeken met duidelijke bestemmingen

- **ID:** `workspace-search`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Klanten, orders, documentnummers, betaalreferenties, bewaarde mail, voorraad, inkoop en pagina’s via één ingang vinden.
- **Volgende stap:** Breid alleen met concrete zoekvoorbeelden uit. PDF-inhoud en niet opgehaalde Gmail-mail zijn nog geen zoekbron.
- **Klaar wanneer:** Exacte nummers eerst; typefoutvoorstellen voor woorden, toetsenbord en mobiel, oude documentversies gegroepeerd. Vaste responsieve venstermaat en behoud van resultaten tijdens typen. Geen gegevenswrites of verlies van onbewaarde invoer.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/workspace-search.js`, `admin/search/`, `tests/workspace-search.mjs`

### Bestaande documenten aanpassen met versiehistorie

- **ID:** `document-revisions`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Bewaarde offertes/orderbevestigingen/proforma’s/pakbonnen aanpassen onder hetzelfde nummer zonder eerdere bestanden te verliezen.
- **Volgende stap:** Financiële factuurcorrecties en Maatwerkkunststof-templates blijven aparte vervolgstappen.
- **Klaar wanneer:** Nieuw PDF+Word-paar atomair, geen wijziging aan bronbedragen/mail/betaallinks/reeks. Laatste revisie en conflicten bewaakt. Maat voorlopig alleen pakbon.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/documents/`, `shared/document-revisions.js`, `tests/document-revisions.mjs`

### Nuttige vervolgstappen na betaling

- **ID:** `payment-followup`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Dashboard en order tonen dezelfde ontbrekende factuur-, ontwerp-, bevestigings- en inkoopstappen.
- **Volgende stap:** Werk de nieuwe 50%-aanbetalingswens uit via deposit-production-rule; nog geen automatische bestaande instelling.
- **Klaar wanneer:** Factuur maken/mailen verschillend; lokale productie zonder leverancierstaak. Geen fysieke voortgang of verzending uit betaling afleiden. Onbekende bedragen blijven onbekend.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/order-readiness.js`, `shared/work-queue.js`, `tests/order-readiness.mjs`

### Documenten als voorbeeld voor de werkplek

- **ID:** `documents-baseline`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Documentvakken, previews, primaire acties en Meer zijn aanwezig; de persoonlijke indeling blijft per bedrijf in deze browser.
- **Volgende stap:** Gebruik dit patroon bij nieuwe schermen.
- **Klaar wanneer:** De huidige bediening is vastgelegd in docs/UX-WERKPLEK.md en afgedekt door bestaande documenttests.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/document-library.js`, `admin/document-layout.js`, `docs/UX-WERKPLEK.md`

### Calculator V2 met vormen, CAD en CRM-overname

- **ID:** `costing-local`
- **Voor:** Maatwerkkunststof
- **Doel:** Prijs en marge blijven prominent. Dagelijkse stuk- en leverancierinvoer staat direct in beeld; Vierkant/Rond/Mangat hebben passende vervolgkeuzes. Ronde gaten via boutcirkel; losse X/Y als extra. DXF/STEP bij het stuk.
- **Volgende stap:** Verder volgens de V2-werkroute hierboven.
- **Klaar wanneer:** Lokaal aanwezig met tests; expliciete overname per orderproduct. Geen ingebouwde fictieve tarieven. V2 zit nog niet in de publicatiebuild.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `tools/costing-v2/SOURCE.md`, `tests/crm-order-v2.mjs`, `tests/cad-import.mjs`

## Zo houden we samenhang

Zie [architectuur en mappen](ARCHITECTUUR.md), [automationontwerp](AUTOMATISERINGEN.md), [besluiten](BESLUITEN.md) en [UX-afspraken](../UX-WERKPLEK.md). Werk na oplevering de bronstatus, klaarcriteria en nieuwste overdracht bij. Bestaande functies staan bij Al aanwezig; geplande integraties worden daardoor niet als actief gepresenteerd.
