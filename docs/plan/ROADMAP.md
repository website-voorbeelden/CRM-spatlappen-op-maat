# Ontwikkelplan — beide CRM’s

Bijgewerkt: 2026-10-27. Automatisch gemaakt uit `shared/planning/roadmap.js` met `npm run plan`. Bewerk de bron, niet dit bestand.

Dit is een geordende planning, geen opdracht om alles tegelijk uit te voeren. De volgorde binnen Eerstvolgend is het vertrekpunt; de gebruiker kan die bijstellen. Dezelfde taakcatalogus staat in beide CRM’s onder **Beheer → Bouwtaken**, gefilterd op bedrijf. Actuele afvinkstatus, publicatie en opmerkingen staan in de aparte CRM-planningopslag; deze gegenereerde catalogus is daarvan geen live export.

## Eerstvolgend

Eerst deze basis afmaken voordat we meer functies toevoegen.

### Online feedbackexport verwerken in de vaste privéwerklijst

- **ID:** `web-feedback-export-20261023`
- **Voor:** Spatlappen
- **Doel:** Alle opmerkingen uit online gebruik blijven voor volgende bouwers beschikbaar zonder klantinformatie in publieke code.
- **Omvang / status:** Export opgenomen · verdere punten open
- **Volgende stap:** 35meldingen uit aangeleverde Markdown-export via CLI gelezen;29nieuwe IDs toegevoegd en38totaal privé. Bestaande afhandelstatus behouden, niets online gewijzigd of afgehandeld gemarkeerd. Privé-uitvoerplan naast feedback met ID/volgende stap. Vier batches lokaal uitgewerkt: mobiel/pushhardening, betaal-/documentbediening, contact/externe verzending en editor. Bronresultaat plus open grenzen in docs/VIER-BATCHES-2026-10-23.md en privé-uitvoerplan. Niet alle brede meldingen opgelost; geen resolve zonder gebruikerscontrole. Geen tests/browserQA; Philippe controleert zelf.
- **Klaar wanneer:** Bronexport en IDs behouden, import alleen ontbrekende meldingen, geen privéfeedback publiceren of gedeeltelijke punten resolve doen. Open punten in normale feedbacklijst met privéoverdracht vindbaar.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `scripts/feedback.mjs`, `scripts/feedback-markdown.mjs`, `FEEDBACK.md`, `docs/BOUWTAKEN.md`

### Eigen verkoopfases en gecontroleerde Gmail-faselabels

- **ID:** `maat-sales-gmail-labels-20261020`
- **Voor:** Maatwerkkunststof
- **Doel:** De bestaande Verkoopfase/00–08-labels aansluiten op het Maat-dossier, met compacte gesprekstags en behoud van betaalfeiten.
- **Volgende stap:** Bron lokaal uitgebreid: opt-in tweerichtings-fasesynchronisatie voor gekoppelde gesprekken, betekenisvolle CRM-feiten (ook betaling), Gmail-voorrang bij gewone edits en conflictreview. Geen AI nodig. Zichtbaar CRM vereist; aanvullende Google-toestemming/activering, eigen gebruikscontrole, gerichte onlinepublicatie en 24/7-serverroute blijven open.
- **Klaar wanneer:** Alleen na vaste expliciete mappingtoestemming automatische fase-labels; Gmailwijzigingen niet door gewone edits terugdraaien. Conflicten exact bevestigen, bedrijf/verbinding/gespreksbinding controleren. Financiële feiten en overige labels intact, concept behouden. Geen functionele/liveclaim zonder gebruikerscontrole.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `docs/MAAT-FASES-EN-LABELS.md`, `shared/sales-funnel.js`, `shared/gmail-phase-sync.js`, `shared/gmail-phase-auto.js`, `admin/mail/automatic-phase-sync.js`, `docs/GMAIL-FASESYNCHRONISATIE.md`, `admin/mail/phase-label-sync.js`, `cloudflare/gmail.js`

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
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Toestemmende browsers en sessies tellen, sessies tot aanvraag/betaalde order onderscheiden en aantoonbare herkomst bij het juiste dossier tonen.
- **Omvang / status:** Pagina-overzicht en exact gefilterde aanvragen gebouwd · sessiemeting open
- **Volgende stap:** 24oktober: alle gemeten pagina’s als rapportbasis, exact paginafilter met juiste bezoek-/leadnoemers, bestaande uitsluitingen en tijdvergelijking. Geen query-/PII-paginanamen tonen. Maatcollector/binding en doorlopende browsers/sessies nog open; afstemming met website-AI bij Philippe gevraagd. Geen nieuwe tracking of database geactiveerd. Zie VERVOLGWERK-2026-10-24.md.
- **Klaar wanneer:** Geen bezoekers volgen na weigeren, geen fingerprint/IP-hash/emailmatching, geen oude historie verzinnen. Unieke browsers niet mensen; onvolledige dekking/minstensN herkenbaar. Aanvraag/offerte/betaald apart, werkelijk betaalbewijs en correcties. Sessies tot aanvraag bevroren, later betaaldconversie afzonderlijk. Gedrag in aparte meetdatabase; exact aanvraag-ID naar CRM. Geen tests/publicatie zonder opdracht.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `docs/WEBSITE-DOSSIER.md`, `docs/WEBSITE-CONVERSIEMETING.md`, `shared/website-dossier.js`, `cloudflare/website-journey.js`, `cloudflare/site-analytics.js`, `admin/analytics/dossier.js`, `admin/analytics/website.js`, `admin/orders/`, `admin/customers/`

### 21. Nuttige telefoonmeldingen, zonder ruis

- **ID:** `mobile-notifications`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Alleen nuttige berichten over nieuwe providerontvangsten, klantactie, batch of opvallende prestatie; zelf ingevoerde betalingen blijven stil.
- **Omvang / status:** Servers actief · CRM-ontvangstmelding/bezorgstatus lokaal · concrete telefoonoorzaak en eigen controle open
- **Volgende stap:** 27oktober lokaal: providerontvangsten tijdens geopende sessie krijgen klein CRM-bericht met Bekijken, baseline/handmatig/correctie/herstel/expliciete import stil. Gedeelde receipt-/recencyregels met bestaande serverpush. Telefoonstatus toont eigen recente eventbezorguitkomst; accepted is geen weergavebewijs. Concrete gemiste push niet live onderzocht; geen tests/publicatie. Eerdere handmatige-pushfilter/vrijdagrapportbron behouden, bredere meldingen en eigen controle open.
- **Klaar wanneer:** Toestelopt-in en bedrijfs/deviceafscheiding; geen gevoelige inhoud op vergrendelscherm. Zelf ingevoerde betalingen geen telefoonpush, ook niet vanuit oude pending wachtrij. Alleen bewezen Tikkieontvangsten, geen dubbele import of terugbetaling. Serveractivering is geen bewezen telefoonaflevering; bredere klant-/batchmeldingen apart.
- **Eerst nodig:** 20. Dezelfde CRM-opmaak en previewtool zonder wifi
- **Vindplaatsen:** `admin/notifications/client.js`, `admin/offline/worker-template.js`, `shared/mobile-app.js`, `shared/tikkie-payments.js`, `cloudflare/notifications.js`, `cloudflare/web-push.js`, `workers/notifications/`, `migrations/0005_notifications.sql`, `docs/MOBIELE-MELDINGEN.md`, `admin/payments/notifications.js`, `shared/payment-notifications.js`, `cloudflare/payment-delivery-status.js`

### 23. Btw-aangifte voorbereiden per kwartaal

- **ID:** `vat-quarterly-assistance`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Controleerbaar kwartaaloverzicht met bronfacturen, omzetsoorten en importdocumenten.
- **Omvang / status:** Kwartaalwerkplek lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Lokaal bronregister met kwartaaloverzicht, bronvoorstellen, inkoop/invoer, credits, bewijs, revisies en CSV/JSON gebouwd. Aparte btw-administraties bevestigd; stelsel nog onbekend laten. Geen tests uitgevoerd (opnieuw expliciet geweigerd), geen publicatie. Vóór echt gebruik stelsel/inrichting vaststellen en gebruikercontrole/boekhoudaansluiting uitvoeren.
- **Klaar wanneer:** Bewaarde factuurinhoud leidend, geen geschatte inkoop of orderomzet als aangifte. Bron/btw-moment/bedragen/rubrieken/aftrek en toepasselijk bewijs expliciet gecontroleerd. Concepten, dubbele/gewijzigde bronnen en onbekende data herkenbaar; voorbereidingssnapshot met historie en hernieuwde controle bij wijziging. Geen automatische aangifte/ICP/OSS/suppletie of bedrijfsvermenging. Eigen gebruikstest en fiscale inrichting blijven nodig.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/vat-ledger.js`, `admin/analytics/vat-quarter.js`, `admin/analytics/vat-entry.js`, `shared/state-validation.js`, `docs/BTW-VOORBEREIDING.md`, `tests/vat-ledger.mjs`

### Online AI met het gekozen ChatGPT-abonnement

- **ID:** `chatgpt-cloud-sign-in`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Gebruiker wil het eigen ChatGPT-abonnement blijven gebruiken en zelf aanmelden; geen API-verbruik als stil alternatief.
- **Omvang / status:** Eigen CRM-domeinen aangesloten in bron · browserkoppeling door gebruiker
- **Volgende stap:** 24oktober: gedeelde exacte origins voor beide crm-domeinen, eigen pages.dev/localhost, client en lokale helper. Bedrijfsgrens/browserconsent/postMessage/cloudreview behouden. Lokale hulpdienst gestart; gebruiker moet vanuit online Agent AI aanzetten en zelf browser koppelen. Geen echte AI-vraag/aanmelding/providerproef. Publicatie apart gelogd.
- **Klaar wanneer:** Geen actieve cloudkoppeling claimen op basis van lokale login of bestaande knop. Geen sleutels/tokens in browser of prompt; providerrechten en kosten vooraf duidelijk.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `assistant/browser-bridge.mjs`, `admin/assistant/laptop-transport.js`, `cloudflare/assistant.js`, `docs/LAPTOP-AI.md`

### Meerdere producten en ontbrekende gegevens uit aanvraagmail

- **ID:** `request-recognition-next`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** De bestaande herkenning uitbreiden zodat minder gegevens dubbel worden ingevoerd en de AI gericht kan doorvragen.
- **Omvang / status:** Handmatige productblokken en productgerichte vragen gebouwd · gebruikercontrole open
- **Volgende stap:** 24oktober: herkenbare Product/Artikel/Onderdeel- of genummerde blokken apart controleren, handmatig toevoegen/uitsluiten, geen vermengde specificaties, ieder meervoudig product bewust aantal. Eén transactie met bestaande dedup/klant-/threadchecks. Mailchecklist per product met bewerkbare tekst/bedrijfsstandaard. Automatische intake niet verruimd; vrije complexe tekst/bijlagen en verdere herkenning apart. Geen tests/browserQA; Philippe controleert zelf. Zie VERVOLGWERK-2026-10-24.md.
- **Klaar wanneer:** Bestaande klantgegevens niet overschrijven op een gok; preview en bevestiging vóór CRM-overname. Geen automatische mailboxtraining, Gmailmutaties of verzonnen prijs.
- **Eerst nodig:** Snelle aanvraagherkenning uit e-mail
- **Vindplaatsen:** `shared/inquiries.js`, `shared/inquiry-quantity.js`, `shared/mail-content.js`, `shared/request-recognition.js`, `admin/inquiry-ui.js`, `admin/inquiries/`, `tests/request-recognition.mjs`, `docs/AANVRAAGHERKENNING.md`

### Een rustige maatwerkwerkplek met Exact als opmaakreferentie

- **ID:** `consistent-workspace`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Gedeelde rustige Exact-geïnspireerde navigatie, lijsten en formulieren met één hoofdactie en overige opties bij Meer.
- **Volgende stap:** Nieuwste opmaakbatches2–4 brongebouwd/review lokaal; aanvullen/varianten/lijsten/mail/documenten en Maatvoorwaarden. Eigen beoordeling beide bedrijven/mobiel en bredere werkproces-/codeaudit blijven open. Geen tests/publicatie. Vervolg27oktober: dossierkop gegroepeerd, context op aanvraag, horizontale tabstrip/actieve-tabonthulling, hoofdactie in productwerkvlak, productregels/gelabelde specs vóór ontwerpen en één aanvullend dossiergedeelte. Dubbel Bewerken weg, notities direct na openen. Centrale CSS-eigenaren aangepast, vervallen productregels weg en globale aside-menugeometrie begrensd. Alle acties/varianten/projecties/gegevens/CAS behouden; geen tests/browsercontrole/publicatie. Eigen beoordeling beide bedrijven/mobiel open. Feedback27oktober: compacte fase/bedragregels en standaard gesloten details; volgende hoofdactie en review/conflictmelding zichtbaar, donker-op-lichtkleurparen en paars uitsluitend herkomst. Nieuwste: centrale CSS inclusief mail en compact orderoverzicht bij crm-central-css-20261027/crm-compact-overview-20261027, direct rekenen en begrensde automatische werkfase. Niet meer tonen bij mailfasepopup alleen weergave, geen extra actieautorisatie. Lokaal, eigen controle open. Correctie27oktober: Excel was niet voor hele CRM bedoeld; vervangen door gedeelde Exact-geïnspireerde bronopmaak. Historisch stijltaak-ID crm-excel-style-20261027 blijft, nieuwe titel/scope en eigen visuele controle open. Vergelijking maatwerkfuncties bij exact-fit-gap-20261027; aanbevelingen geen nieuwe bouwopdracht. Bredere werkprocesvereenvoudiging blijft gedeeltelijk. Reparatie27oktober: verkeerde f.phase in order-progress vervangen door bestaande funnel.phase; openen van orders zonder uitvoering kon hierdoor vóór shellvervanging afbreken. Alleen bronwerk, ook browseruitlezing expliciet geweigerd; eigen controle van dossier/stappentabs bij beide bedrijven open. Bredere werkplekscope blijft gedeeltelijk. 21 oktober lokaal: aanklikbare orderstappen naar eigen onderdelen, aparte verkoopfase/uitvoering, eigen voortgang met CAS en datum/confirm, zonder verplichte gezamenlijke inkoop; Maat zonder ontwerpstappen. Geen tests/publicatie. Aanvulling: Maat-Inkoop direct bij order met leverancier, kosten en factuurfiles; ook bestaande inkoop met precies één klantorder compact bewerken, multiorder gedeeld houden. Bedragpresentatie gedeeld: verkoop/kosten/marge excl. btw primair, betalingen incl. btw apart, lijst/Analytics/formulierlabels gelijkgetrokken; historische leveranciersbasis niet gokken. Gebruikercontrole en verdere werkplekvereenvoudiging blijven open.
- **Klaar wanneer:** Op desktop en mobiel is de volgende actie duidelijk. Filters, invoer, documentindeling en oude links blijven werken.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/workspace/money.js`, `admin/orders/money-summary.js`, `docs/BEDRAGEN-EN-BTW.md`, `admin/orders/direct-purchase.js`, `shared/direct-purchase.js`, `admin/orders/progress.js`, `shared/order-progress.js`, `admin/orders/workspace.js`, `docs/INKOOP-BIJ-ORDER.md`, `docs/ORDERVOORTGANG.md`, `docs/UX-WERKPLEK.md`

### Calculator V2 als complete werkroute

- **ID:** `costing-v2-complete`
- **Voor:** Maatwerkkunststof
- **Doel:** Van materiaal en vorm naar kostprijs, marge en een bewuste overname in het juiste CRM-product.
- **Omvang / status:** Centrale V2-order/klantopslag en expliciete releasecapability gebouwd
- **Volgende stap:** 24oktober: online runtimecapability en expliciete assetsoptie, bestaande centrale opslag/prijs-/aantal-/factuur-/versieguards, online feedbacktransactie; V1 behouden. Orderroute kiest V2 alleen als meegeleverd. Geen CAD-/productie-/browsercontrole; Philippe test zelf. Volledige supplierquote-V2 en meerdere producten als afzonderlijke calculaties blijven gescheiden. Publicatie apart.
- **Klaar wanneer:** Vorm, gaten en import blijven exact bewaard; één stuk hoort bij één product. Meerregelige offertes en releaseverpakking worden apart gecontroleerd. V1 blijft bruikbaar.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `tools/costing-v2/`, `admin/orders/`, `admin/costing-links.js`, `shared/costing-product.js`, `shared/cost-quote-domain.js`

### Veilig tegelijk aan een dossier werken

- **ID:** `concurrent-work`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Voorkom dat een oude browserweergave nieuw werk van iemand anders overschrijft.
- **Omvang / status:** Deelherstel lokaal · bredere inventarisatie open
- **Volgende stap:** 27oktober: dagelijkse oude save-acties naar actuele merge met formulierbasiscontrole, cloudcomplete/abort/waargenomen delete/lifecycle hersteld; source note doing/local. Open: overige features/offline/volledige vervanging, globale observed-map versus eigen formulierbasis, conflicten door één hoofdrecord. Lokale back-upherstelcoördinatie en401-invoerherstel als gerelateerde structurele punten vastgelegd; geen volledige gelijktijdigheidsclaim of tests/publicatie. Zie ALGEMENE-CODELEZING-20261027.md.
- **Klaar wanneer:** Twee sessies met hetzelfde dossier kunnen een conflict reproduceren. De tweede wijziging vraagt verversen of vergelijken; bestanden en financiële gegevens blijven behouden.
- **Eerst nodig:** Code per werkonderdeel bij elkaar
- **Vindplaatsen:** `admin/cloud-storage.js`, `cloudflare/`, `shared/state-validation.js`

## Gebouwd · jouw controle

De implementatie is aanwezig. Controleer de bediening zelf; publicatie staat apart en open vervolgwerk blijft als eigen taak staan.

### Opmaakbatch 1/4 — Gedeelde basis en navigatie

- **ID:** `crm-polish-batch1-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Rustige consistente type/control-/menu-/shellbasis voor beide bedrijven.
- **Omvang / status:** Lokaal bronwerk klaar · eigen controle en publicatie open
- **Volgende stap:** Centrale tokens/controls/nav/bovenbalk en gedeelde native Meer-menucontroller/-stijl lokaal uitgewerkt. Oude conflictlagen weggehaald; voorkeuren/acties/invoer/bedrijven behouden. Geen tests/browsercontrole/publicatie. Eigen beoordeling open; zie docs/VIER-OPMAAKBATCHES-20261027.md.
- **Klaar wanneer:** Philippe beoordeelt beide bedrijven/desktop/mobiel; bronwerk, eigen controle en publicatie apart. Gegevens/IDs/transacties/CAS behouden. Geen automatische QA- of visuele claim.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `docs/VIER-OPMAAKBATCHES-20261027.md`, `admin/style.css`, `admin/workspace/action-menus.js`, `admin/workspace/preferences.js`, `admin/workspace/navigation.js`

### Opmaakbatch 2/4 — Aanvragen en orderdossiers

- **ID:** `crm-polish-batch2-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Kop, hoofdactie, producten/dossierdetails en ontwerpvarianten verfijnen op gedeelde basis.
- **Omvang / status:** Aanvullen/varianten lokaal · jouw controle open
- **Volgende stap:** Vervolg27oktober: aanvraagformulier hervat alleen zelf gewijzigde velden na Productregels bewerken, geen ongewijzigde oude productmaten terugzetten. Bewust leegmaken/herhaalde uitstap/vinkjes behouden; opgeslagen afwijkende aanvraagwaarden expliciet melden, niet synchroniseren. Opslag vergelijkt ook klantkoppeling en relevante actuele productvelden; aanvraagbasis blijft tijdens uitstap bewaakt. Geen automatische tests/checks/build/browsercontrole/publicatie; eigen controle beide bedrijven open. Aanvraagchecklist direct aanklikbaar/focus, productregel gericht bewerken, inquiry- en klantreviewinstallatie ook op ordertabs. Geldige finale ontwerpvariant prominent, voorstellen/versiehistorie behouden; stale keuze/maat/aantal/metadata zichtbaar, previewlabel geen besteld voorstel. Bestaande approval/signatures/JSON/PNG/CAS leidend. Bekende ontvangst bij onbekend saldo zichtbaar. Alleen lokaal bronwerk; geen tests/checks/syntaxchecks/builds/browser-/DOMcontrole of providerproef/publicatie. Philippe beoordeelt beide bedrijven en mobiel zelf. Bestaande gebruikersstatus/feedback/data/IDs/CAS blijven leidend.
- **Klaar wanneer:** Philippe beoordeelt beide bedrijven/desktop/mobiel; bronwerk, eigen controle en publicatie apart. Gegevens/IDs/transacties/CAS behouden. Geen automatische QA- of visuele claim.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/inquiry-ui.js`, `admin/orders/workspace.js`, `admin/orders/overview.js`, `admin/orders/money-summary.js`, `admin/products/design-variants.js`, `admin/products/images.js`, `admin/sales-funnel.js`, `admin/style.css`, `docs/BATCHES2-4-OPMAAK-20261027.md`, `shared/inquiry-edit.js`

### Opmaakbatch 3/4 — Overzichtslijsten en betalingen

- **ID:** `crm-polish-batch3-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Heldere gelijkmatige kolommen, statussen, bedragen en zoekfilters.
- **Omvang / status:** Lijsten lokaal · jouw controle open
- **Volgende stap:** Vervolg27oktober: zichtbare telling actieve extra criteria bij orders/klanten, inclusief 0 drukkleuren; fasefilter dat archief meeneemt expliciet uitleggen. Kolom-/sorteerlabels benoemen aanvraagdatum versus opgeslagen uitvoeringsstatus; sleutels/voorkeuren behouden. Betaalstatuslabel en statusfilter delen dezelfde pure labelregel: productprijs of verzendprijs onbekend blijft onbekend, geen Betaald/overbetaling uit onvolledige prijs. Dossierbadge alleen groen bij bekende prijs. Betalingen markeert omgekeerde periode, verbergt paginering daarbij en herstelt dezelfde rij/link-/detailfocus na verversen. Geen tests/build/browsercontrole/publicatie; eigen controle open. Ordertabel naar eigen presentatiemodule met dezelfde actuele projecties/sortering, gelabelde uitvoering, uitklapbare vervolgactie en toegankelijke sorteerkoppen. Bedragen rechts/tabulair, bekend ontvangen blijft bij onvolledige prijs zichtbaar, klantkolomlabels mobiel en betaalissues tekstaccent. AI/nummering bij Meer, reset bij Meer filters; zoek/sortering/filters/paginering behouden. Alleen lokaal bronwerk; geen tests/checks/syntaxchecks/builds/browser-/DOMcontrole of providerproef/publicatie. Philippe beoordeelt beide bedrijven en mobiel zelf. Bestaande gebruikersstatus/feedback/data/IDs/CAS blijven leidend.
- **Klaar wanneer:** Philippe beoordeelt beide bedrijven/desktop/mobiel; bronwerk, eigen controle en publicatie apart. Gegevens/IDs/transacties/CAS behouden. Geen automatische QA- of visuele claim.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/orders/list.js`, `admin/app.js`, `admin/customers/views.js`, `admin/payments/workspace.js`, `admin/sales-funnel.js`, `admin/style.css`, `docs/BATCHES2-4-OPMAAK-20261027.md`, `shared/order-payment-status.js`, `admin/workspace/list-filters.js`, `admin/workspace/dossier-search.js`, `admin/workspace/dossier-preferences.js`, `admin/payments/list-focus.js`, `admin/orders/header.js`

### Opmaakbatch 4/4 — Mail, documenten en afwerking

- **ID:** `crm-polish-batch4-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Mail/documenten/formulieren laten aansluiten, inclusief mobiele bronindeling.
- **Omvang / status:** Mail/documenten lokaal · jouw controle open
- **Volgende stap:** Vervolg27oktober: gezamenlijke modalguard respecteert feature-inert/aria-busy naast submitbusy, dus geen Escape/sluiten/tweede submit/aanvulactie tijdens bijlagewerk. Composer alleen huidig open formulier; fout eerst weer bedienbaar voor errorfocus, succes beperkte focusterugkeer. Bijlagekeuze toont aantallen/KB en echte namen+reden bij historische ongeschikte selectie. 4MB/8MB vóór lezen, naam/type één strikte allowlisthelper met Object.hasOwn, bestaande byte-/base64validatie erna. Geen tests/checks/build/browsercontrole/publicatie; eigen controle open. Mail/composer/bijlagen neutrale werkvlakken, gedeelde knop-/focusbasis, ophalenperiode bij Meer filters. Document preview/download direct, beheren in Meer, mailvoorbereiding hoofdactie. Bestanden drop/paste in composer, gezamenlijke metadatalimiet vóór opslag, echte bytes in bestaande preview. Interne ontwerpbestanden uit gewone bijlagekeuze. Actuele inline replyseed na afzenderladen opnieuw lezen met mount/gesprek/dialogguard. Aanvullende voorwaardenopdracht alleen Maat apart vastgelegd. Alleen lokaal bronwerk; geen tests/checks/syntaxchecks/builds/browser-/DOMcontrole of providerproef/publicatie. Philippe beoordeelt beide bedrijven en mobiel zelf. Bestaande gebruikersstatus/feedback/data/IDs/CAS blijven leidend.
- **Klaar wanneer:** Philippe beoordeelt beide bedrijven/desktop/mobiel; bronwerk, eigen controle en publicatie apart. Gegevens/IDs/transacties/CAS behouden. Geen automatische QA- of visuele claim.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/mail-workspace.js`, `admin/mail/composer.js`, `admin/documents/library-workspace.js`, `admin/documents/order-terms.js`, `admin/style.css`, `docs/BATCHES2-4-OPMAAK-20261027.md`, `admin/app.js`, `shared/mail-attachments.js`

### Algemene voorwaarden snel vanuit order en mail gebruiken

- **ID:** `crm-order-terms-20261027`
- **Voor:** Maatwerkkunststof
- **Doel:** De aangeleverde algemene voorwaarden downloaden/slepen/kopiëren waar ondersteund en gericht aan een mail toevoegen.
- **Omvang / status:** Aangeleverde PDF lokaal · jouw controle open
- **Volgende stap:** Philippe bevestigt alleen Maatwerkkunststof. PDF ongewijzigd als vaste bedrijfsbijlage; Order → Meer/Documenten en mailbijlagen/inline Meer. Expliciete toevoeging via actuele state/files-transactie, per order hergebruik, metadata-/ontbrekendbestandmelding en gewone verzendpreview. Kopiëren/slepen browserafhankelijk, downloadterugval. Uitsluitend exact PDFpad toegelaten voor toekomstige Maatbuild; Spatbundle verwijdert dit bestand. Alleen lokaal bronwerk; geen tests/checks/syntaxchecks/builds/browser-/DOMcontrole of providerproef/publicatie. Philippe beoordeelt beide bedrijven en mobiel zelf. Bestaande gebruikersstatus/feedback/data/IDs/CAS blijven leidend.
- **Klaar wanneer:** Philippe beoordeelt Maatdesktop/mobiel, downloaden/slepen/kopiëren in eigen mailprogramma, bestaand/nieuw bericht en reply-/tekstbehoud, opnieuw toevoegen/ontbrekend bestand/limieten/annuleren. Geen automatische bijlage of verzending; Spat geen voorwaardenoptie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/company-documents.js`, `shared/state-validation.js`, `admin/documents/order-terms.js`, `admin/assets/terms/maatwerkkunststof-2023.pdf`, `admin/mail/composer.js`, `admin/mail-workspace.js`, `scripts/build-pages.mjs`, `docs/ALGEMENE-VOORWAARDEN-BIJ-ORDER.md`

### Centraal betalingenoverzicht: ontvangst terugvinden bij klant en order

- **ID:** `payment-overview-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Na een ontvangen Tikkie direct kunnen terugvinden bij welke klant/order de ontvangst hoort.
- **Omvang / status:** Lokaal gebouwd · eigen controle en publicatie open
- **Volgende stap:** Lokaal menu Betalingen (#payments), gedeeld voor beide bedrijven. Readonly lijst van huidige klantontvangsten, nieuwste ontvangstdag/echt tijdstip eerst, klant uit gekoppelde order, ordernummer, incl-btwbedrag, Tikkie/andere registratie en omschrijving met details. Zoeken op klant/order/bedrag/omschrijving, bronfilter, datum/aandacht onder Meer,50regels/pagina en directe klant-/orderbetalingslink. Archief blijft vindbaar, ontbrekend onbekend; geen rekeninghouder verzinnen of ongematchte bedragen automatisch koppelen. Bestaande actuele read-only refresh met foutmelding/invoerbehoud, geen providercheck of nieuwe poll. Bestaande correctielog/financiële/CAS-/bedrijfsregels behouden; geen klant-/betaaldata aangepast. Geen tests/publicatie, Philippe controleert zelf.
- **Klaar wanneer:** Juiste klant/order zien vanuit bestaande payment.orderId; rekeninghouder niet gelijkstellen aan klantnaam. Herkomst onbekend blijft andere registratie, verwijderde betalingen niet opnieuw tellen en correcties op order beschikbaar. Zoeken/filter/focus/details bij refresh behouden; fout geen succes/0bedragen of dataverlies. Datum/DST/unknown/archief/paginering en beide bedrijven/mobiel door gebruiker beoordelen. Geen bank-/Tikkie/provider-/pushactie of nieuwe stateopslag; expliciete publicatie en eigen controle apart.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/payment-overview.js`, `admin/payments/workspace.js`, `admin/app.js`, `admin/workspace/navigation.js`, `admin/workspace/navigation-icons.js`, `admin/style.css`, `shared/assistant-page-context.js`, `docs/BETALINGENOVERZICHT.md`

### Vrijdagrapporten: vindbaarheid, websitegebruik en aanvraagconversie

- **ID:** `weekly-analytics-reports-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Elke vrijdag bruikbare grafieken en opvallende positieve/negatieve weekverschillen ontvangen, met aantallen en eerlijke meetdekking.
- **Omvang / status:** Rapporten en telefoonmelding lokaal gebouwd · eigen controle/publicatie open
- **Volgende stap:** 27oktober ontvangst gekozen: CRM met telefoonmelding en Rapport bekijken. Lokale bron: bestaande 3 hoofdstukken/6 grafieken/12 edities plus aparte duurzame rapportpush in versleutelde integrationsopslag. Eerst rapport bewaren, daarna één event/bedrijf/vrijdag; ook na onderbreking herstelbaar. Pas na afgeronde of laatste gedeeltelijke ophaalpoging. Alleen vooraf gekoppelde apparaten met bevestigde nieuwe worker, actuele login/sleutel-/apparaatversie en eigen bedrijf; oude worker geen verkeerd betaalbericht. Veilige exacte editie-link, optionele native actieknop en aantikken als fallback, geen cijfers op lockscreen. Max4offers/ronde, max8pogingen/24uur en resterende TTL; geen dubbele nieuwe edities of nieuwe Google-opvraag voor pushretry. Config standaarduit, bestaande CRM-only planning niet stil naar push migreren. Geen tests/echte push/publicatie/activering; benodigde eigen bronkoppelingen, telefoonapp bijwerken en Philippecontrole open.
- **Klaar wanneer:** Google, eigen metingen en GA4 apart met eigen tijdzones/noemers; onbekend geen0, paginabezoeken geen personen/sessies en aanvraag geen betaalde order. Signalen zijn aandachtspunten, geen statistisch bewezen significantie of oorzaak. Geen nieuwe tracking/rechten, klant-/order-/betaalmutatie of liveconfigwijziging. Herhaalde/partiële verwerking bewaart beschikbare weekbronnen en historie, uitsluitingen consequent, CAS/invoerbehoud en beide bedrijfsgrenzen. Gekozen ontvangst CRM+telefoon in bron aanwezig; juiste editie openen met normale login/invoerbehoud, oude workers afvangen en zichtbare acceptatie versus echte aflevering onderscheiden. Gebruikerscontrole, appupdate en expliciete publicatie/activering blijven nodig.
- **Eerst nodig:** Analytics: compact overzicht en duidelijke grafieken
- **Vindplaatsen:** `shared/weekly-analytics.js`, `cloudflare/weekly-reports.js`, `cloudflare/weekly-website.js`, `cloudflare/marketing.js`, `cloudflare/notifications.js`, `cloudflare/api.js`, `admin/analytics/weekly-report.js`, `admin/analytics/workspace.js`, `admin/analytics/website.js`, `admin/style.css`, `docs/VRIJDAGRAPPORTEN.md`, `cloudflare/report-push.js`, `cloudflare/push-devices.js`, `cloudflare/web-push.js`, `admin/notifications/report-device.js`, `admin/notifications/client.js`, `admin/offline/worker-template.js`

### Eén centrale CRM-stijlbasis met gedeelde componenten

- **ID:** `crm-central-css-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Gedeelde opmaak consequent op één plek beheren, zonder nieuwe visuele regels per scherm te stapelen.
- **Omvang / status:** Lokale consolidatie · eigen controle open
- **Volgende stap:** admin/index.html laadt alleen admin/style.css, inclusief mail in eerdere cascadevolgorde. Eén root voor actuele kleuren/type/radius en gedeelde controls/surfaces, identieke eerdere declaraties en achterhaalde gewone control-eigenschappen opgeruimd. Vaste AI-promptpresentatie naar gedeelde klasse. Oude CSSpaden als lege compatibiliteit; losse tools/documentinhoud apart. Bron leesbaar uitgeschreven. Verschillende componentselectors/media niet blind samengevoegd; resterende historische uitzonderingen geen conflictvrijclaim. Geen tests/checks/build/browsercontrole/publicatie. Philippe beoordeelt beide bedrijven.
- **Klaar wanneer:** Eén actieve CRM-stylesheet en thema-eigenaar; gewone navigatie/tabs/knoppen/invoer/mail gebruiken de gedeelde basis. Bronkleuren licht automatisch/donker AI behouden. Gebruiker beoordeelt hover/focus/disabled/readonly, mail/Meer/bijlagen en mobiel; geen data-/gedragsverlies claimen zonder controle.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/style.css`, `admin/index.html`, `admin/mail/mail.css`, `admin/inquiries/ai-import-flow.js`, `docs/CRM-CSS.md`

### Compact orderoverzicht en minder handmatige werkfasekeuzes

- **ID:** `crm-compact-overview-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Volgende actie en producten direct, detailregistratie op verzoek en onnodige faseformulieren vermijden.
- **Omvang / status:** Dossierindeling lokaal verder uitgewerkt · eigen beoordeling en publicatie open
- **Volgende stap:** Vervolg27oktober: dossierkop gegroepeerd, context op aanvraag, horizontale tabstrip/actieve-tabonthulling, hoofdactie in productwerkvlak, productregels/gelabelde specs vóór ontwerpen en één aanvullend dossiergedeelte. Dubbel Bewerken weg, notities direct na openen. Centrale CSS-eigenaren aangepast, vervallen productregels weg en globale aside-menugeometrie begrensd. Alle acties/varianten/projecties/gegevens/CAS behouden; geen tests/browsercontrole/publicatie. Eigen beoordeling beide bedrijven/mobiel open. Nieuwste feedback27oktober: geen aparte fasepopup; gedeeld niet-modaal meldingsvak met Bekijken en Terugdraaien. Eén sessiewachtrij per bedrijf met inkomende mail/aanvragen, per order nieuwste fasemelding, blijven staan na bekijken. Gerichte undo binnen actuele merge: dezelfde automatische mailfase/bron/basis/klant vereist, alleen salesFunnel.selection plus activiteit, geen snapshot/mail-/betaal-/fysieke rollback. Nieuwe bekende mailfase volgt nog automatisch, weergavevoorkeur onafhankelijk via Meer. Compacte details/direct rekenen/centrale CSS behouden. Legacy pending/dismissed/herstel niet migreren. Geen tests/checks/build/browsercontrole/provideractie/publicatie; eigen controle open.
- **Klaar wanneer:** Philippe beoordeelt beide bedrijven/mobiel: compact dossier, direct rekenen, melding samen met nieuwe aanvragen, Bekijken/blijven staan/sluiten en alleen laatste fase per order. Terugdraaien herstelt alleen fase en behoudt mail/ontvangsten/documenten/notities; weigert nieuwere fase/mail/betaling/klantkoppeling. Open/onbewaarde invoer, dubbele klik, opslagconflict/fout en meldingen aan/uit. Geen visueel/functioneel bewijs geclaimd.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/orders/overview.js`, `admin/orders/workspace.js`, `admin/orders/planning.js`, `admin/orders/progress.js`, `admin/inquiry-ui.js`, `admin/sales-funnel.js`, `admin/mail/composer.js`, `admin/workspace/phase-notice-preference.js`, `shared/sales-funnel.js`, `admin/style.css`, `docs/COMPACT-ORDEROVERZICHT.md`, `admin/workspace/notifications.js`, `admin/mail-notifications.js`, `admin/mail-workspace.js`, `shared/funnel-phase-undo.js`, `admin/orders/header.js`, `docs/DOSSIER-INDELING-20261027.md`

### Herkomst herkenbaar: licht automatisch, donker AI of interpretatie

- **ID:** `provenance-colors-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Paars uitsluitend gebruiken voor de bron van ingevulde gegevens, zonder gewone UI-selectie of handmatige invoer ermee te verwarren.
- **Omvang / status:** Lokale bron bijgewerkt · eigen controle open
- **Volgende stap:** Bronclassificatie onafhankelijk van assisted/automatic: AI en vrije tekst-/historische interpretatie donkerpaars met witte tekst; rechtstreeks formulier, template, default, berekening en Gmailfase heel lichtpaars met donkere tekst. Bronuitleg maakt het onderscheid expliciet; onbekende historie niet invullen. Ook antwoordhulpresultaat/notities en AI-historie donker, eigen vraag/context/bediening neutraal. Gewone selecties/filters/bouwtaken/kaartlegenda blauw/neutraal. Veldbindingslistener vervangen bij nieuwe bron, alleen passende herkomst met originele mode/tijd bewaren. Bestaand schema/data/gebruikersstatus behouden. Geen tests/checks/build/browsercontrole of publicatie. Philippe beoordeelt beide bedrijven zelf.
- **Klaar wanneer:** Gebruiker beoordeelt automatische velden tegenover AI/interpretatie, hover/focus/uitleg, template naar AI, handmatige afwijking/terugzetten en bewaren/heropenen. Ook native selects, mobiel en gewone navigatie/filters zonder paars. Geen achteraf verzonnen historische AI-herkomst of automatische externe actie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/mail/reply-assistant.js`, `shared/provenance.js`, `admin/provenance-ui.js`, `admin/style.css`, `admin/mail/mail.css`, `admin/orders/progress.js`, `admin/sales-funnel.js`, `shared/order-map.js`, `docs/HERKOMST.md`

### Exact-functies vergelijken voor onze maatwerkorders

- **ID:** `exact-fit-gap-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Bruikbare maatwerkverbeteringen kiezen zonder een compleet handels-/productie-ERP na te bouwen.
- **Omvang / status:** Bronvergelijking gereed · voorstellen niet gebouwd
- **Volgende stap:** Vergelijking met officiële Handel/Productiepagina’s en lokale bron in docs/EXACT-REFERENTIE-20261027.md. Offerteversies, opvolging, leverafspraken/waarschuwingen, aanbetaling, ontwerpen, inkoop/marge en lichte voorraad bestaan. Volledige beveiligde klantakkoordlink en begroting/werkelijke eigen tijd-kosten niet aangetroffen; advies voor apart vervolg. Deellevering/productrestant al open bij custom-order-inventory. Geen nieuwe functies/provider/bank-/portalactivatie. Philippe bepaalt eventuele vervolgbouwscope.
- **Klaar wanneer:** Huidige bronmogelijkheden en nog niet gebouwde voorstellen duidelijk onderscheiden, bronnen en maatwerkrelevantie vermeld; geen claim over livewerking/volledige audit. Opmaak/gebruikercontrole apart.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `docs/EXACT-REFERENTIE-20261027.md`, `shared/lead-time.js`, `admin/orders/planning.js`, `admin/orders/cost-composition.js`, `shared/document-revisions.js`, `shared/inventory.js`, `shared/planning/roadmap.js`

### CRM-opmaak met Exact Online als referentie

- **ID:** `crm-excel-style-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Rustige Exact-geïnspireerde kleur-/navigatie-/formulieropmaak voor beide maatwerkbedrijven; geen breed Excelcelraster.
- **Omvang / status:** Dossierindeling lokaal verder uitgewerkt · eigen beoordeling en publicatie open
- **Volgende stap:** Vervolg27oktober: dossierkop gegroepeerd, context op aanvraag, horizontale tabstrip/actieve-tabonthulling, hoofdactie in productwerkvlak, productregels/gelabelde specs vóór ontwerpen en één aanvullend dossiergedeelte. Dubbel Bewerken weg, notities direct na openen. Centrale CSS-eigenaren aangepast, vervallen productregels weg en globale aside-menugeometrie begrensd. Alle acties/varianten/projecties/gegevens/CAS behouden; geen tests/browsercontrole/publicatie. Eigen beoordeling beide bedrijven/mobiel open. Feedback27oktober: donker op licht, oude witte sidebarhoverregels hersteld. Tabs/navigatie donkerblauw; paars uitsluitend herkomst: licht automatisch, donker AI/interpretatie; gewone selectie/filters blauw. Orderbovenkant compacte fase/bedragregels; volledige stappen, bedragen/marge en toelichting/historie standaard gesloten. Hoofdactie/reden en actieve review-/Gmailconflictmelding zichtbaar. Geen financiële/fase-/bewaarregels of data gewijzigd. Philippe corrigeert de te brede Exceltoepassing. Oude eigen Excel-laag vervangen door blauw hoofdactie en rustige witte/lichtgrijze vlakken, dunne lijstlijnen en rustige tabs/formulieren. Tekstuele bedrijf-/modulecontext bij bestaande zoekbalk en lokale lijniconen; huidige groepen/routes/menuvoorkeuren behouden. Mail brede lijst met witte leesruimte. Eigen merken/tools, gegevens en transacties intact. Alleen openbare Exactreferentie bekeken; geen pixelgarantie, CRM-QA/tests/publicatie. Vergelijking/voorstellen bij exact-fit-gap-20261027, geen nieuwe ERPfuncties gebouwd.
- **Klaar wanneer:** Philippe beoordeelt beide CRM’s op desktop/mobiel: lange waarden/kolommen, mailboxselectie/filters/antwoord/Meer/quotes/bijlagen/preview, klanten/taken/orders en formulieren. Gegevens, financiële betekenis en opgeslagen ontwerpen blijven gelijk. Geen visuele bewijsclaim.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/style.css`, `admin/mail/mail.css`, `admin/workspace/navigation.js`, `admin/workspace/navigation-icons.js`, `admin/app.js`, `docs/EXACT-REFERENTIE-20261027.md`, `admin/orders/progress.js`, `admin/orders/money-summary.js`, `admin/orders/workspace.js`, `admin/sales-funnel.js`, `admin/orders/header.js`, `docs/DOSSIER-INDELING-20261027.md`

### Algemene codelezing en veilige dossieropslag

- **ID:** `crm-general-review-20261027`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Concrete fouten rond opslaan, invoerbehoud en orderkopieën herstellen en grotere verbeterpunten zichtbaar houden.
- **Omvang / status:** Gerichte bronverbeteringen lokaal · gebruikerscontrole open
- **Volgende stap:** Cloudvoltooiing/abort/waargenomen deletes en lifecycle, synchrone transactiehulpen, inline foutvak/listeners en inert bewaren aangepast. Dagelijkse oude save-acties naar actuele merge met beginbasiscontrole; generieke save verwijderd. Kopie wist geleende ontwerpvarianten/definitieve keuze/afgeleide inkooptoerekening, bronbestanden blijven. Reparatie27oktober: niet-bestaande f in order-progress naar bestaande funnel gecorrigeerd; openen zonder uitvoeringsstatus kon anders afbreken. Alleen bronwerk, eigen controle open. Geen volledige audit: lokale back-upatomiciteit,401-login, bredere conflicten/offline en verdere samenstelling/geldhulpen open bij concurrent-work/vervolgscope. Geen tests/publicatie.
- **Klaar wanneer:** Philippe beoordeelt beide bedrijven: klant met0/1/meerdere orders, kosten/notities, factuur-/afleveradres, categorie/archief, opslagfout/invoerbehoud en gelijktijdige wijziging. Spatorder met A/B/revisies dupliceren zonder geleende bestanden/goedkeuring; origineel behouden. Geen functioneel bewijs geclaimd.
- **Eerst nodig:** Code per werkonderdeel bij elkaar
- **Vindplaatsen:** `admin/cloud-storage.js`, `admin/form-guidance.js`, `admin/workspace/transactions.js`, `admin/workspace/dossier-actions.js`, `admin/customers/dossier.js`, `admin/orders/addresses.js`, `admin/orders/workspace.js`, `shared/order-copy.js`, `docs/ALGEMENE-CODELEZING-20261027.md`

### Deel 1 · Meerdere ontwerpvarianten per product

- **ID:** `feedback4-variants-20261026`
- **Voor:** Spatlappen
- **Doel:** Benoemde alternatieven en eerdere versies bewaren bij één product, met één definitieve keuze.
- **Omvang / status:** Batch 1 lokaal afgewerkt · gebruikerscontrole open
- **Volgende stap:** Nieuw/kopie/bewerken met eigen variant-ID en naam; ontwerp-JSON en PNG samen transactioneel, eerdere bestanden append-only behouden. Revisie als nieuwe variant openen. Maat/aantal/prijs blijven gedeeld; gewijzigde klant/productbasis weigeren. Definitieve keuze met confirm en basis van revisie/maat/aantal; wijzigen maakt keuze ongeldig, leveranciersroute vraagt definitief ontwerp. Oude productontwerpen blijven zonder migratie leesbaar; bestaande expliciet goedgekeurde preview bij overgang behouden. Geen automatische klantmutaties of publicatie; gebruikercontrole open. Batch1vervolg: bronmaat/aantal uit opgeslagen JSON, aanwezigheid PNG en actuele variantbasis toetsen vóór definitieve keuze; na afwijkende maat eerst opnieuw bewaren. Legacybronbasis bij save, ontbrekend oud tijdstip/PNG behouden zonder historie te verzinnen. Revisies nieuwste eerst met versienummers, vrije standaardnaam en gesynchroniseerde naamvelden. Algemene order-/oude afbeeldingsgoedkeuring vervangt geen variantkeuze; oude approvalmarker correct opheffen. Geen tests of publicatie.
- **Klaar wanneer:** Proefproduct: A/B afzonderlijk heropenen, hernoemen, kopiëren en herbewaren; vorige bestanden behouden. Eén definitieve keuze, andere variant wijzigen beïnvloedt die niet; gekozen variant of productmaat/aantal wijzigen vraagt opnieuw akkoord. Conflicten weigeren met invoerbehoud. Geen extra financiële productregels.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/product-design-variants.js`, `admin/product-designs.js`, `admin/products/images.js`, `admin/designs/editor/storage-and-integration.js`, `admin/designs/editor/saved-download.js`, `shared/state-validation.js`, `docs/VIER-DELEN-20261026.md`, `docs/BATCH1-ONTWERPVARIANTEN-20261026.md`

### Deel 2 · Tekst, fonts en dagelijkse editorbediening

- **ID:** `feedback4-editor-20261026`
- **Voor:** Spatlappen
- **Doel:** Tekst snel bewerken, fonts op de spatlap vergelijken en de dagelijkse bediening voorspelbaar houden.
- **Omvang / status:** Batch 2 lokaal afgewerkt · gebruikerscontrole open
- **Volgende stap:** Tijdelijke fontpreview op geselecteerde tekst; keuze pas na klikken. Hoofdlettersknop, veelgebruikte fonts via lokale begrensde tellers, drie extra lokale fonts Bungee/Fredericka the Great/Ewert. Statische TTF/OTF-import max2MB en5fonts, ingebed in bewaren/kopie/portable/PDF; echte contouren, geen variabele/kleurenfonts. Tekstinput werkt eigen DOM bij i.p.v. alle logo’s; fonthistory deelt onveranderlijke data. Zoom om selectie, Kopie openen via nieuwe losse opgeslagen kopie i.p.v. enorme URL. Cmd/Ctrl+Shift+klik configureert geselecteerde toolbaracties. Desktoppreview vast met aparte scroll; mobiel bestaande route. Geen prestatietest of garantie. Batch2vervolg: hover stoppen bij selectie/history/ander ontwerp, herimport zelfde font dedupliceren, ongebruikte fonts beheren met undo. Pending FontFaces delen en verlaten laadresultaten niet registreren. PNG/productsave weigert ontbrekende eigen glyphs; clipboardfamilie/collision/limiet vóór mutatie. Sneltoetsopname vóór vaste capture, beschermd en opslag vóór actieve wijziging. Kopielink behouden bij pop-upprobleem; zoomselectie en desktopgrens951px met onderpaneelruimte. Geen tests, prestatiemeting of publicatie.
- **Klaar wanneer:** Eigen statisch font, hoofdletters, hover verlaten/keuze, undo/redo, copy/paste tussen tabs en reload van bewaard ontwerp; PNG/PDF controleren. Zoomselectie, pop-upblokkade en sneltoetsen op Mac/toestel. Geen klanttekst of logo in gebruikstellers.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/editor/font-tools.js`, `admin/designs/custom-shortcuts.js`, `shared/design-transfer.js`, `spatlap-preview-vector-export.js`, `admin/designs/editor/text-and-objects.js`, `admin/designs/editor/history-and-feedback.js`, `spatlap-preview.html`, `docs/VIER-DELEN-20261026.md`, `docs/BATCH2-TEKST-EN-BEDIENING-20261026.md`

### Deel 3 · Logo’s, kleuren, randlijnen en tijdelijk voorbeeld

- **ID:** `feedback4-colors-20261026`
- **Voor:** Spatlappen
- **Doel:** Per logokleur werken met minder technische bediening en zonder experimenten direct vast te leggen.
- **Omvang / status:** Vectorgebiedsegmentatie lokaal · eigen SVG/uitvoercontrole open
- **Volgende stap:** Vervolg27oktober: lokale Paper.js0.12.18-gebiedbewerkingen voor gevulde kleursegmenten, kruisingen/vulregels/gaten/eiland-in-gat en aangesloten naastliggende paden. Geen begrenzingsvakgroepering meer; laagvolgorde andere kleuren behouden, transparante paden apart met alpha. Clip/lijn/verloop/genesteSVG blijven buiten deze bewerking, numerieke/complexiteitsgrenzen expliciet. Eigen projectcleanup, selectie-/bron-/flapguard, undo/origineel. Pijlrichting losse delen inverse rotatie/spiegeling. Eerdere palet/rand/vectorpreview behouden. Geen tests/publicatie; fysiek renderer-/drukresultaat zelf controleren.
- **Klaar wanneer:** Kleur verwijderen/wijzigen bij eigen SVG, transparantie/andere kleuren behouden; rand bij tekst/SVG/PNG, rotatie/spiegel en echte PDF beoordelen. Tijdelijk vectorvoorbeeld niet in opgeslagen ontwerp/export vóór toepassen; oude async-resultaten niet overnemen. Voorkeuren expliciet bewaren/toepassen/wissen, geen passief leren.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/editor/logo-colors.js`, `admin/designs/editor/outline-tools.js`, `admin/designs/editor/placement-tools.js`, `admin/designs/editor/import-and-vectorize.js`, `admin/designs/editor/export.js`, `spatlap-preview-vector-export.js`, `docs/VIER-DELEN-20261026.md`, `admin/designs/editor/vector-islands.js`, `docs/BATCH3-LOGO-KLEUR-PLAATSING-20261026.md`, `docs/OPEN-PUNTEN-VERVOLG-20261027.md`

### Deel 4 · Rustige mailweergave en feedback aansluiten

- **ID:** `feedback4-crm-20261026`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Overzichtelijk mailregister met grijze metadataregels en rustige labels, met volledige traceerbaarheid van de aangeleverde feedback.
- **Omvang / status:** Vervolgautomatisering lokaal · eigen controle/Googleconfig open
- **Volgende stap:** Nieuwste feedback27oktober: Excel-stijl met brede mailkolommen en vlakke metadata-/labelregels vervangt de eerdere losse kaders; alleen lokaal, eigen visuele controle open. Spatvrijgave automatisch bij actuele voorwaarden; bevestiging-PDF+bruikbare betaallink bereidt Wacht op betaling voor, aanwezige factuur-PDF voldoet aan de factuurwerkstap zonder verzendbewijs te verzinnen. Google Maps-routeadapter/inline keyconfig en kostenovername; vectorsegmenten en opt-in leren apart vastgelegd. Bestaande mailfixes/klantdata/44export+3oudere meldingen behouden. Geen tests/providerproef/herstart/publicatie/feedbackresolve. Googlekey/activering en fysieke controle apart; geen verborgen kostensplitsing uit één prijs raden.
- **Klaar wanneer:** Beide bedrijven desktop/mobiel: berichtkaders, Meer en behandeld; labelconflict en gelijktijdige Gmailread zonder heractiveren. Tijdens threadrefresh typen, focus/tekst en oorspronkelijk replyanker behouden; template/vragen, ontvanger/onderwerp, conceptfout en previewterug. Bestaande betaling/contact/document/route zelf controleren. Geen aanmaak als verzendbewijs; automatische Spatvrijgave uitsluitend op de actuele afgesproken voorwaarden, fysieke uitvoering apart.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/mail/thread-labels.js`, `admin/mail/gmail-label-review.js`, `shared/mail-thread-labels.js`, `admin/mail/mail.css`, `admin/mail-workspace.js`, `docs/BATCH4-MAIL-EN-CRM-20261026.md`, `docs/VIER-DELEN-20261026.md`, `docs/BOUWTAKEN.md`, `docs/OPEN-PUNTEN-VERVOLG-20261027.md`

### Ontwerptool: selectie, herstel en productkoppeling consistent houden

- **ID:** `editor-integrity-20261026`
- **Voor:** Spatlappen
- **Doel:** Geen extra objecten verwijderen, oude groepsselecties gebruiken, draaiing/spiegeling verliezen of verouderde klantcontext opslaan.
- **Omvang / status:** Vijf bronfouten lokaal hersteld · gebruikerscontrole open
- **Volgende stap:** 26 oktober: negen editorfeedbackthema’s in bron langs bediening, bewaren, overdracht en export gelegd. Lokale fixes: verwijderkruisje is enkelvoudig; nieuwe tekst/logo maakt oude groep leeg; undo/redo ruimt tijdelijke groep/vector-/referentiemodus op en negeert ontbrekende objectrefs; bijsnijden verplaatst centrum via dezelfde lokale spiegel-/rotatieregel als vectorreframe; vervangen behoudt rotation/flipX; bewaren blokkeert gewijzigde order-klantrelatie binnen transactie. Geen tests/checks/build/browserQA/publicatie. Latere batches1–3 en vervolg27oktober hebben fontimport, verdeling, voorkeuren/opt-in leren en A/B-varianten lokaal toegevoegd; zie die actuele taaknotities. De oudere bronlezing is historisch, gebruikers-/uitvoercontrole blijft open. Zie docs/EDITOR-BRONLEZING-20261026.md.
- **Klaar wanneer:** Gebruiker controleert enkelvoudig versus groep verwijderen, nieuwe tekst/logo na groep, undo/redo en daarna spiegelen/schalen, gedraaid/gespiegeld asymmetrisch SVG/PNG bijsnijden, vervangen met transformaties, bewaren bij intussen gewijzigde klant. Bestaande geometrie/IDs/bedrijf/opslag/transactie behouden. Bronlezing is geen functionele of volledige CRM-audit.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/editor/selection-and-controls.js`, `admin/designs/editor/history-and-feedback.js`, `admin/designs/editor/text-and-objects.js`, `admin/designs/editor/import-and-vectorize.js`, `admin/designs/editor/vector-editing.js`, `admin/designs/editor/runtime.js`, `admin/product-designs.js`, `docs/EDITOR-BRONLEZING-20261026.md`

### Formuliermails herkennen bij MIME-onderwerp en gemengde regeleinden

- **ID:** `form-intake-encoding-20261026`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Expliciete klantvelden uit formuliermails vooraf invullen en zichtbaar uitleggen wanneer automatische verwerking stopt.
- **Omvang / status:** Lokaal gebouwd · websitepublicatie en gebruikerscontrole open
- **Volgende stap:** RFC2047B/Qonderwerp passief decoderen bij Gmail-inleesroute én herkenning; oude bewaarde onderwerpen blijven leesbaar. Gemengde echte/geserialiseerde regeleinden met meerdere veldlabels normaliseren. Handmatige herkenner deelt klantveldparser, gebruikt formulierafzender niet als klantfallback. Kandidaatselectie/melding los van strikte automatische ontvanger-/DKIM-/datum-/dedupgrens. Klantvoorbeeld heeft geldige ontvanger, feitelijke MIME via provider niet onderzocht. Extra product/accessoire vraagt bewuste productcontrole. Websitefooterfix staat voorbereid maar nog niet gepubliceerd; geïsoleerde releasekandidaat met livebasisguard, geen nieuwe tracking/frontend/migratie. Geen tests; Philippe controleert.
- **Klaar wanneer:** Afzender/onderwerp/ontvanger en Gmailhandtekening niet versoepelen voor auto-intake. Geen gegokte aantallen, prijzen, klantidentiteit of stil herstel van bestaande dossiers. Metadata alleen headers in nieuwe mails; oude mails niet herschrijven. Gecontroleerde publicatie en eigen gebruikscontrole apart.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/mail-content.js`, `shared/gmail-message.js`, `shared/inquiries.js`, `shared/request-recognition.js`, `admin/mail-workspace.js`, `docs/FORMULIERHERKENNING-20261026.md`

### Google-rapporten en meldingen: Cloudflare-verbindingsfout herstellen

- **ID:** `cloudflare-provider-transport-20261024`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Geen onterechte Google-netwerkfout voordat het serververzoek is verstuurd.
- **Omvang / status:** Online gepubliceerd · gebruikercontrole open
- **Volgende stap:** Cloudflare ondersteunt redirect:error niet. Marketing, pushtransport en cronworker gebruiken manual; onverwachte3xx niet volgen, geen credentials doorsturen. Marketingcache transporteversie2 forceert een nieuw rapport in plaats van oude gecachte verbindingsfouten. Sleutels/configuratie/read-only scopes ongewijzigd. Gebruiker controleert online rapport en push; geen providerproef of tests uitgevoerd.
- **Klaar wanneer:** Geen automatische redirects met auth/JWT/pushkeys, Google3xx duidelijk als fout, Worker accepteert alleen2xx, push3xx niet als geslaagd. Geen serviceaccount opnieuw uploaden of rechten wijzigen op basis van deze bronfout; externe Googletoegang kan pas na eigen controle vastgesteld worden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `cloudflare/marketing.js`, `cloudflare/web-push.js`, `workers/notifications/index.js`, `docs/GOOGLE-VERBINDING-HERSTEL.md`

### Achtergrondwerk beperken: kwartiercontrole voor beide CRM’s

- **ID:** `background-cost-control-20261024`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Minder terugkerende Cloudflare-/providerverzoeken met behoud van automatische betaalregistratie.
- **Omvang / status:** Kwartiercontrole online · gebruikercontrole open
- **Volgende stap:** Gedeeld interval15minuten voor server/browser/operator/voorbeeldcron, bron en bestaande workers publiceren zonder nieuwe secrets of datawijziging. 192geplande rondes per dag voor beide samen in plaats van576; dit is geen claim over exact gefactureerde requests of geldbesparing. Gezondheidsmelding met35minutenmarge aangepast aan kwartiercron. Geen tests; Philippe controleert zelf. Werkelijk abonnement, usage, DBgrootte en factuur niet onderzocht; geen gratisgarantie.
- **Klaar wanneer:** Beide workercrons en statusuitleg dezelfde15minuten, automatische betaalcontrole blijft aan, handmatige knop blijft. Alleen minder geplande rondes, geen klant-/bestandsopschoning. Limieten/gebruik en kosten per dienst apart onderscheiden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/notification-schedule.js`, `cloudflare/notifications.js`, `admin/notifications/client.js`, `scripts/configure-payment-polling.mjs`, `scripts/activate-notifications.mjs`, `workers/notifications/`, `docs/CLOUDFLARE-KOSTEN.md`

### Tikkie-ontvangsten automatisch controleren zonder open CRM

- **ID:** `tikkie-background-polling-20261024`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Niet handmatig op Betalingen controleren hoeven klikken voordat een ontvangst wordt geregistreerd en gemeld.
- **Omvang / status:** Online geactiveerd · Philippe controleert zelf
- **Volgende stap:** Kwartiervensters in plaats van uurpauze, maximaal twee links per job met rondevervolg; ontbrekende Tikkie-inrichting expliciet zichtbaar. Ook gesloten links met nog niet geïmporteerde cached ontvangst opnieuw bij provider verifiëren na onderbroken CRM-commit. Online geactiveerd voor beide bedrijven via configure-payment-polling; productieconfig/secrets/cron en beide bedrijfsidentiteiten behouden; geen nieuwe bankkoppeling of providerproef. Eigen werking en pushontvangst nog controleren.
- **Klaar wanneer:** Alleen bestaande CRM-Tikkielinks, uitsluitend bevestigde GET-ontvangsten, dedup/correcties/CAS blijven; geen nieuwe link, terugbetaling, mail of gegokte bankmatch. Gewone bankoverschrijving apart. Bij meer links/storing geen vijfminutengarantie per link; ontbrekende configuratie niet als actief tonen.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `cloudflare/notifications.js`, `admin/notifications/client.js`, `scripts/configure-payment-polling.mjs`, `shared/tikkie-payments.js`, `docs/AUTOMATISCHE-TIKKIECONTROLE.md`

### Analytics: compact overzicht en duidelijke grafieken

- **ID:** `analytics-workspace-ux-20261024`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Bezoeken, aanvragen, conversie en financiën kunnen beoordelen zonder een lange stapel dubbele grafieken en details.
- **Omvang / status:** Gebouwd · Philippe controleert zelf
- **Volgende stap:** Overzicht als analyticsstart, vier kerncijfers, dagelijkse bezoek/aanvraaggrafiek met dagtabel, twee afzonderlijke conversietellingen en CRM-dossiers. Website/aanvragen hebben eigen details; financiën begint met bedragen en één interactieve drilldowngrafiek. Vorige rapport blijft zichtbaar bij filterladen of fout met expliciete vorige-contextmelding. Offertedocumenten via ownerId worden meegeteld. Geen functionele tests/browserQA; zelf gebruik beoordelen. Maat-collector en sessies blijven aparte website-overdracht, geen bezoekersdata verzonnen.
- **Klaar wanneer:** Bestaande financiële rekenkern en bedrijfsgrenzen behouden, onbekend niet als nul presenteren, bezoekcohort en alle CRM-aanvragen gescheiden, negatieve/voorlopige bedragen zichtbaar, mobiel leesbare detailtabel en bronperiode herkenbaar. Publicatie apart registreren.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/analytics/workspace.js`, `admin/analytics/website.js`, `admin/analytics/financial-chart.js`, `admin/style.css`, `shared/site-conversion.js`, `docs/ANALYTICS-WERKPLEK.md`

### Betaling en document zonder zoeken afmaken

- **ID:** `payment-document-ux-20261023`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Aanbetaling zichtbaar voorstellen, hele documentpagina passend en verzendprijs met leverwijze op dezelfde plek.
- **Omvang / status:** Batch2 lokaal verder afgemaakt · gebruikercontrole open
- **Volgende stap:** Betaalpresets en live saldo incl. btw, mogelijk dubbel/overbetaling met extra bevestiging. Financiële basis-CAS en actuele saldo-ophaalactie met invoerbehoud, zelfde-ID-retry zonder dubbel. Factuurvervolg bij saldo, invoice-mail-startrouter hersteld, ontbrekende factuur ook Maat eigen generator. Factuurontvangstteller/alles/niets met lege resume behouden, rustig correctie/verwijderen, previewretry en directe verzendprijsactie. Kostenbalken via bestaande projectie. Geen tests/checks/build/browserQA/provideractie of publicatie; Philippe controleert zelf. Zie BETALINGEN-EN-DOCUMENTEN.md.
- **Klaar wanneer:** Voorstel is geen bankbewijs; geen automatische fysieke productiestart of mail. Onbekend blijft onbekend, expliciet gratis blijft0. Herstelscherm keert met documentinvoer terug; gelijktijdige prijs/leverwijziging blokkeert. Gebruikerscontrole nodig.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/orders/workspace.js`, `admin/orders/production-release.js`, `admin/documents/preview.js`, `admin/documents/generated-forms.js`, `docs/VIER-BATCHES-2026-10-23.md`, `admin/orders/payment-entry.js`, `shared/manual-receipt.js`, `admin/orders/payment-corrections.js`, `admin/documents/payment-selection.js`, `admin/mail/composer.js`, `docs/BETALINGEN-EN-DOCUMENTEN.md`

### Klantgegevens en mail bewerken zonder je werk kwijt te raken

- **ID:** `order-contact-delivery-20261023`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Contact en templates dichtbij het bericht, duidelijke reply-/nieuwkeuze en eerlijke externe documentverzending.
- **Omvang / status:** Batch3 lokaal verder afgemaakt · gebruikercontrole open
- **Volgende stap:** Gedeelde contacteditor order/inline mail, alleen gewijzigde standaardvelden met veldbasis en order-klantcontrole; expliciet klant-/factuuradres gebruiken. Compacte templates boven bericht, inline editor met naamconflict openhouden; volledige mail-DOM/tekst/bijlagen behouden en template alleen bewust toepassen. Replylabel/nieuwknop blijven, huidig antwoordanker bij body-only behouden, ontvanger-/semantische onderwerpwijziging wist antwoordmetadata. Externe PDFregistratie klantrelatie/gelijke-datumvolgorde verbeterd. Geen tests/build/browserQA/provideractie/publicatie; Philippe controleert zelf. Zie KLANT-EN-MAILWERKPROCES.md.
- **Klaar wanneer:** Bestaande klantkoppeling, adresdrafts en overige velden behouden. Aanwezig PDF is niet hetzelfde als verstuurd; oude bestanden worden niet aangepast. Verplaatsen verandert registratiesoort niet. Geen online/provideractie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/orders/addresses.js`, `admin/documents/manual-delivery.js`, `admin/documents/library-workspace.js`, `shared/state-validation.js`, `admin/style.css`, `docs/VIER-BATCHES-2026-10-23.md`, `admin/customers/contact-editor.js`, `shared/customer-contact.js`, `admin/mail/templates.js`, `admin/mail/composer.js`, `admin/inline-tasks.js`, `docs/KLANT-EN-MAILWERKPROCES.md`

### Ontwerpselectie, meerregelige tekst en vectorbediening verfijnen

- **ID:** `editor-feedback-20261023`
- **Voor:** Spatlappen
- **Doel:** Selectie direct kunnen bewerken met minder zijbalkruis; tekst/transformaties behouden bij bewaren en export.
- **Omvang / status:** Batch4-bron gebouwd · gebruikercontrole open
- **Volgende stap:** Bestaande selectie-/tekst-/vector-/fontfeedback verder uitgewerkt. Gedraaide logo’s schalen vrij langs zichtbare assen; uitlijnen/positie/fit gebruiken gedraaide kadermaat. Meerregelige/gedraaide tekst verticaal plaatsen met actuele kaders. Live tekst-undo na andere handeling of undo/redo opnieuw groeperen, caret niet onnodig resetten. Fontvergelijking behoudt hovervoorbeeld tijdens fontladen en toont echte vaste dikte. Eerdere SVGonderdeelbewerking/exports/portable/ongewijzigde laadvolgorde behouden. Geen tests/browserQA/export-/productieproef; Philippe controleert zelf. Publicatie wordt apart gelogd.
- **Klaar wanneer:** Undo en objectmidden behouden; opgeslagen en overgezette rotatie/spiegeling blijven. Geen raster/fallbackexport of willekeurige TTFimport. Dubbelklik volgt echte SVGgeometrie, niets aan klant-/order-/prijsdata. Volledige gebruikerscontrole nog nodig.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/editor/`, `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `spatlap-preview-vector-export.js`, `shared/design-transfer.js`, `print-assets/`, `docs/SPATLAP-ONTWERP-UX.md`

### Mobiele invoer zichtbaar houden en factuurontvangsten vooraf aanvinken

- **ID:** `mobile-form-ux-20261023`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Bij feedback en andere modals kunnen zien wat je typt, en echte factuurontvangsten standaard meenemen als toelichting.
- **Omvang / status:** Lokaal aangepast · gebruikercontrole open
- **Volgende stap:** Gedeelde viewporthelper voor CRM en editorfeedback: visualViewport/offset, actief veld in eigen scrollvlak en begrensde feedbacktextarea. Ontvangsten standaard geselecteerd, expliciete hervatselectie inclusief leeg behouden. Vervolg batch1: menu-focus slaat verborgen links over, listenercleanup; standalone editorfeedback nu ook viewportoffset/hoogte en16px-invoer. Geen saldo-, betaalstatus- of oude PDFwijziging. Niet getest/gepubliceerd; fysieke telefooncontrole door Philippe open. Gehele meerledige feedbackmelding blijft open.
- **Klaar wanneer:** Invoer en focus blijven intact bij toetsenbord, bovenliggend feedbackvenster en invulhulp. Geen financiële mutatie of nieuwe selectie bij expliciet uitvinken. Eigen toestelcontrole nodig.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/mobile-ui.js`, `admin/style.css`, `admin/documents/payment-selection.js`, `admin/documents/generated-forms.js`, `docs/UX-WERKPLEK.md`

### Aanvragen, orders en klanten standaard op laatst geopend

- **ID:** `recent-dossier-sorting-20261023`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Snel terug naar het laatst geopende dossier, met een zichtbare eigen sorteerkeuze naast bestaande filters.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Browsergebonden laatste openingsmomenten en sorteerkeuze per bedrijf; zichtbare dropdown op beide lijsten, bestaande kolomsortering en filters behouden. Tabwissels, opslaan en achtergrondverversing tellen niet opnieuw als opening. Filters wissen behoudt de sorteerkeuze. Geen historische openmomenten verzonnen; onbekende dossiers op orderdatum respectievelijk laatste bestelling/naam. Geen tests/checks/build/browserQA of publicatie; Philippe controleert zelf.
- **Klaar wanneer:** Eigen keuze na herladen, beide bedrijven, terugnavigatie en smalle schermen door Philippe controleren. Alleen IDs/tijdstippen/voorkeur in begrensde browseropslag; geen CRM-recordwijziging, synchronisatie naar account of laatst-bewerktclaim. Bij opslagfout blijft tabblad bruikbaar met melding. Prijsvergelijking behoudt overeenkomstrangschikking.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/workspace/dossier-preferences.js`, `admin/workspace/dossier-search.js`, `admin/customers/views.js`, `admin/app.js`, `admin/style.css`, `docs/DOSSIER-SORTERING.md`

### Formulierherkomst en aanvraagnummer buiten geciteerde mails

- **ID:** `form-mail-metadata-20261023`
- **Voor:** Spatlappen
- **Doel:** Direct vanuit Gmail kunnen antwoorden op een schone formuliermelding, met aanvraagnummer en herkomst behouden voor het CRM.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole en aparte release open
- **Volgende stap:** Lokale Spatlappen-writer zet ID/bron/interne test en optionele UTM-data in technische headers, niet in HTML of platte mailtekst. Gedeelde lokale/online Gmail-lezer en intake ondersteunen headers met oude bodyfallback, bestaande afzendercontrole en expliciete review bij conflicten. Bron bij Websitegegevens; geen provider-/DNSwijzigingen, tests of publicatie. Eerst CRM/Gmail-lezer leveren, daarna aparte website-writer; Philippe controleert zelf. Spamoorzaak van directe Gmail-antwoorden nog niet vastgesteld, serveraflevering is geen inboxbewijs. Zie FORMULIERMAIL-EN-SPAM.md.
- **Klaar wanneer:** Normale Reply-To/bijlagen blijven; geen verborgen HTML/pixel of extra ontvanger. Metadata geen autorisatie, bestaande bedrijfs-/DKIM-/intakegrenzen behouden. Oude mails blijven herkenbaar en worden niet herschreven. Geen garantie spamvrij of volledige spamdetectie uit providerstatus. Maat-websitewriter valt buiten deze Spatlappen-stap.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/inquiry-mail-metadata.js`, `shared/gmail-message.js`, `shared/inquiries.js`, `shared/state-validation.js`, `assistant/gmail-service.mjs`, `cloudflare/gmail.js`, `admin/analytics/dossier.js`, `docs/FORMULIERMAIL-EN-SPAM.md`

### Opgeslagen preview en vector-PDF direct downloaden

- **ID:** `saved-design-downloads-20261021`
- **Voor:** Spatlappen
- **Doel:** Bij een opgeslagen ontwerp of orderproduct de klantpreview en leveranciers-PDF downloaden zonder de editor te openen.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Downloadknoppen bij bewaarde ontwerpen en CRM-producten; aparte downloadtab hergebruikt bestaande PNG-/vectorcode zonder normale editoropslag of feedbackstart. Maten/aantal/bronconflicten blokkeren, vectorcontrole en echte lettertypen behouden, leesbare terugvaldownloadlink. Geen tests of publicatie uitgevoerd; Philippe controleert zelf.
- **Klaar wanneer:** Actief onbewaard ontwerp blijft intact; precies gekozen bewaarde versie, geen raster-PDF/fallbacklettertype, geen automatische opslag/statuswijziging of losse externe dienst. Downloadtab blijft dicht voor ontwerpbediening, gebruikerscontrole voor layout en bestandsresultaat open.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/download-links.js`, `admin/designs/editor/saved-download.js`, `admin/designs/editor/storage-and-integration.js`, `admin/designs/editor/runtime.js`, `admin/designs/editor/bootstrap.js`, `admin/products/images.js`, `docs/ONTWERP-DOWNLOADS.md`

### Orderkaart voor productie, leveringen en eigen bezorgroute

- **ID:** `delivery-map-20261021`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Leveringen filteren en een eigen bezorgroute met afstand, rijtijd en kosten voorbereiden.
- **Omvang / status:** Google-routeberekening lokaal · sleutel/activering en eigen controle open
- **Volgende stap:** Bestaande kaart/filters/route/kosten behouden.27oktober: Google Routes-engine gedeeld cloud/local,1–25stops, afstand/rijtijd zonder verkeersdrukte en optionele stopvolgorde, retour/eenrichting. Sleutel inline met veilige serveropslag/CAS, geen terugsturen naar browser. Adressen pas bij expliciet Berekenen, actuele routebasis en late-resultaatguards, eigen aflevertijd, volgorde/kostenovername na eigen keuze. Geen financiële/dossierwrites. Nog eigen sleutel/Routes API/facturering en nieuwe servercode laden; geen echte providerproef, tests of publicatie.
- **Klaar wanneer:** Beide bedrijven: ontbrekende key inline herstellen, configuratiefout/conflict/invoerbehoud, max25stops/retour/vast eindpunt, late routewijziging, voorstelvolgorde en kostenovername/annuleren. Google Maps-routelinks behouden; geen verkeer-/venster-/voertuigbeperkingsgarantie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/order-map.js`, `admin/orders/map-workspace.js`, `admin/orders/map-route.js`, `admin/orders/route-google.js`, `admin/orders/route-costs.js`, `cloudflare/google-routes-provider.js`, `cloudflare/google-routes.js`, `assistant/google-routes.mjs`, `assistant/server.mjs`, `functions/__local/[[path]].js`, `dev-server.py`, `docs/OPEN-PUNTEN-VERVOLG-20261027.md`

### Betaalstempels en herkenbare facturen per dossier

- **ID:** `invoice-payment-status-20261021`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Onbetaald, aanbetaling en volledig voldaan duidelijk op factuur en per bestand in Documenten.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Converter met gecentreerde tweeregelstempels; documentkaart toont betaalstand bij aanmaken, percentage en ontvangen/open incl. btw. PDF/Word blijven samen. Nieuw factuurnummer blijft volledige orderfactuur, met melding bij bestaande facturen. Oude bestanden blijven intact; geen aparte deel-/restfactuuradministratie gebouwd. Philippe controleert zelf, geen tests/renderproef/build/publicatie.
- **Klaar wanneer:** Stempel past binnen bestaand vak, deelbetaling toont minder dan100% zolang restant bestaat; geen betaalstand raden bij ontbrekende snapshot en geen actuele betaling aan oude bestanden toeschrijven.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `document-generator.py`, `shared/invoice-payment-status.js`, `admin/documents/invoice-status.js`, `admin/documents/library-workspace.js`, `admin/documents/generated-forms.js`, `docs/FACTUUR-BETAALSTAND.md`

### Dikte op documenten en als bruikbare productdata

- **ID:** `product-thickness-20261021`
- **Voor:** Maatwerkkunststof
- **Doel:** Dikte per product numeriek in mm bewaren, zichtbaar op nieuwe klantdocumenten en op materiaal/dikte kunnen analyseren.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Materiaal/dikte naar publieke documentdetails en gestructureerde snapshot; ontbrekende dikte met terugkeerhulp aanvullen vóór nieuwe documenten. Analytics Materialen & diktes en exacte productfilters gebouwd. Geen tests/build/browser-QA/publicatie; Philippe controleert zelf. Historische documenten en vrije-tekstdata niet gemigreerd.
- **Klaar wanneer:** Geen gegokte dikte of nul als onbekend; bron is order.items[].thickness in mm. Materiaal/dikte per product, oude documenten/revisiehistorie behouden; telling dossiers/productregels/stuks helder, geen omzet verdubbelen over diktes.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/product-specifications.js`, `shared/product-metrics.js`, `admin/documents/generation.js`, `admin/documents/generated-forms.js`, `admin/documents/revision-editor.js`, `admin/analytics/product-metrics.js`, `admin/workspace/dossier-search.js`, `docs/DIKTE-EN-PRODUCTDATA.md`

### Handtekeningen per afzender en kopieerbare AI-uitleg

- **ID:** `sender-signature-profiles-20261021`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Meerdere afbeeldingen expliciet plaatsen, varianten per afzender kiezen en een bruikbaar HTML-contract naar een andere AI kopiëren.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Lokaal bronwerk: batchvakkeuze, benoemde profielen, adresbinding, conceptoverride, gedeelde server/previewselectie en versiecontrole. Geen tests/build/browserQA/providerproef/publicatie; eigen gebruikerscontrole en gerichte release open.
- **Klaar wanneer:** Bestaande standaard behouden, geen ongevraagde verzending, geen credentials in AI-uitleg, geen verloren invoer of stale instellingenoverschrijving. Beide bedrijven dezelfde code met eigen configuratie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/mail-signature-profiles.js`, `admin/mail/signature-editor.js`, `admin/workspace/ai-help.js`, `docs/MAIL-HANDTEKENINGEN.md`

### Levertijd vanaf ontvangen aanbetaling

- **ID:** `deposit-lead-time-20261021`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Levertijd in weken starten vanaf het afgesproken percentage werkelijke betaling.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Lokaal bronwerk: percentagekeuze, cumulatieve ontvangstdatum, pendinghulp, documentdefault en import/export. Geen tests uitgevoerd; eigen gebruikscontrole en gerichte publicatie open.
- **Klaar wanneer:** Werkelijke betalingen inclusief btw/verzending, geen start bij onbekend bedrag, vaste leverdata voorgaan, historische afspraken behouden.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/lead-time.js`, `admin/orders/planning.js`, `docs/LEVERTIJD-AANBETALING.md`

### Maat zonder Spatlappen-ontwerp- en drukkleurbediening

- **ID:** `maat-remove-print-workflow-20261021`
- **Voor:** Maatwerkkunststof
- **Doel:** Alleen kunststofspecifieke dagelijkse bediening; technische tekeningen en historische data behouden.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Lokaal bronwerk: bedrijfsstatuskeuze, afbeeldingen/documenten/AI/mailtemplates/vergelijking/inkoop opgeschoond. Geen tests of publicatie; gebruikerscontrole en gerichte release open.
- **Klaar wanneer:** Maat rendert geen drukwerkcontrols; Spat houdt deze. Geen gegevens wissen, technische productbestanden blijven bruikbaar.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/companies.js`, `admin/orders/workspace.js`, `admin/products/images.js`, `docs/MAAT-EIGEN-WERKPROCES.md`

### Antwoordhulp per mailgesprek

- **ID:** `reply-assistant-per-thread-20261020`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Met juiste gespreks- en dossiercontext samen een passend antwoord maken, verfijnen en bewust in het concept overnemen.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Antwoordhulp in mailwerkplek: eigen sessie/instructies, begrensde geladen mail plus gekozen dossier/notities, lokale toolvrije generatie via bestaande ChatGPT-verbinding. Kopieer/JSON-import als afzonderlijke onlinevoorbereiding; geen directe cloudagent. Alleen eigen werkinstructies expliciet bewaren, AI-historie in tabblad. Geen tests, proefgeneraties, verzendingen of publicatie uitgevoerd.
- **Klaar wanneer:** Geen contextmenging tussen bedrijven/gesprekken/dossiers; ontbrekende feiten als vraag, geen verzonnen beloften; exacte context zichtbaar; stale-proposalcontrole; alleen body overnemen en bestaande verzendpreview behouden; geen nieuwe scopes of automatische mails.
- **Eerst nodig:** Mail grondig herstellen en overzichtelijk maken
- **Vindplaatsen:** `admin/mail/reply-assistant.js`, `admin/mail-workspace.js`, `shared/mail-reply-assistant.js`, `shared/mail-reply-engine.js`, `shared/assistant-engine.js`, `docs/ANTWOORDHULP.md`

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
- **Volgende stap:** Footer27oktober: gedeelde MIMEherkenning voor lezen/download scheidt ingesloten afbeeldingen van echte bijlagen; explicit attachment/ongemerkt-onzeker behouden. Oude snapshots/files intact. Gebruiker bevestigt CRM-mailoverzicht; geen bestanden/.eml nodig. Eerder eigen Spatdienst herstart en nieuwe code geladen, geen functionele controle. Philippe haalt zelf gesprek opnieuw op; oude snapshots/dossierfiles behouden. Eigen controle en online publicatie open. Native Gmail geen onderdeel van deze melding. 27oktober standaardteksten: factuurontvangst alleen bij volledig betaald na gebruikersakkoord; open/onbekend zonder ontvangstclaim. Bevestiging70%/volledig op bekende gekozen linkbasis, anders neutraal. Eigen templates/concepten behouden, label eigen aanpassing/reset verduidelijkt. Gebruikercontrole open, geen tests/publicatie. Lokale herziening en grenzen vastgelegd in docs/MAIL-HERZIENING.md: PDF-default, context/afzenders, References/Message-ID, bijlagen, één HTML-handtekening en aparte mailstijl. Geen tests/proefzending of publicatie; Philippe controleert zelf. Maillijst: zichtbare sortering aandacht/nieuwste/oudste en filters status/datum/koppeling/bekende bijlagen, alleen geladen mail; gebruikercontrole open. AI-vindbaarheid daarna.
- **Klaar wanneer:** Replyheaders oorspronkelijke klantmail inclusief websiteformulier; nieuw/reply expliciet; info standaard/facturen alleen factuur en instelbare mailsoorten; PDF standaard Word optioneel; veilige bijlagen uploaden/lezen/bewaren; afbeelding in HTML-handtekening en geen dubbele afsluiting; overzichtelijke Gmailachtige composer en gesprekshiërarchie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/gmail-body.js`, `shared/gmail-message.js`, `shared/gmail-attachment.js`, `shared/mail-templates.js`, `admin/mail/templates.js`, `admin/mail/`, `admin/mail-workspace.js`, `shared/mail-service.js`, `shared/mail-signature.js`, `shared/document-mail-context.js`, `admin/documents/generated-forms.js`, `docs/MAIL-HERZIENING.md`

### AI-assistent weer vindbaar maken

- **ID:** `assistant-discoverability-20261019`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Philippe kan de agent vinden en ziet eerlijk welke verbinding beschikbaar is.
- **Omvang / status:** Ingang gebouwd · online dienst nog niet gekoppeld
- **Volgende stap:** Cloudknop was hard uitgeschakeld door runtime.mode===local. Nu vaste Agent-ingang op desktop/mobiel en sneltoets; cloudstatus met bestaande AI-export en handmatig kopieerbare vraag. Geen actieve online agentdienst of ChatGPT-login nagebootst. Echte online agentkoppeling blijft vervolgwerk; lokale agent blijft intact.
- **Klaar wanneer:** Zichtbare vaste ingang, duidelijke status als dienst niet beschikbaar is, geen onopgeslagen invoerverlies of automatische provideracties.
- **Eerst nodig:** Mail grondig herstellen en overzichtelijk maken
- **Vindplaatsen:** `admin/app.js`, `admin/assistant.js`, `docs/MAIL-HERZIENING.md`

### 39. Gelijke witruimte en uitlijnen op een ander logo

- **ID:** `preview-spacing-layout`
- **Voor:** Spatlappen
- **Doel:** Rustige plaatsingshulp voor brede spatlappen: tussen buitenrand en middenlogo, gelijke onder-/zijafstand.
- **Omvang / status:** Verdelen en bestaande plaatsingshulp lokaal · gebruikerscontrole open
- **Volgende stap:** 26oktober: horizontaal/verticaal gelijke vrije ruimte voor minstens3geselecteerde objecten, buitenste grenzen als basis, overlap weigeren en één undo. Bestaande cm-/rand-/middenreferenties behouden. Bijzondere SVGgrenzen en fysieke controle blijven open; geen tests/publicatie. Batch3: min/maxspan van alle geselecteerde grenzen, brede middenvorm correct meenemen, ongeldige grenzen/negatieve ruimte stoppen en no-op zonder history. Geen tests; gebruikercontrole open.
- **Klaar wanneer:** Duidelijke referentie kiezen en benodigde ruimte tonen; links/rechts/midden/boven/onder uitlijnen, gelijk verdelen en exact cm. Geen onduidelijke automatische keuze tussen meerdere middenlogo’s; geometrie als basis, optische correctie handmatig.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `spatlap-preview.html`, `spatlap-preview-vector-editor.js`, `docs/SPATLAP-ONTWERP-UX.md`, `admin/designs/editor/placement-tools.js`

### 41. Eigen plaatsingsvoorkeuren hergebruiken

- **ID:** `preview-placement-learning`
- **Voor:** Spatlappen
- **Doel:** Op termijn minder handwerk door eigen goedgekeurde plaatsingen bij vergelijkbare maten te hergebruiken.
- **Omvang / status:** Opt-in leren uit geslaagde saves lokaal · gebruikerscontrole open
- **Volgende stap:** Vervolg27oktober: leren standaard uit, expliciet aanzetten; alleen na geslaagde ontwerp-save geometrie/type/aantal/maat/shape/hits/tijd bewaren, geen inhoud/fontbytes/klantIDs. Max20, frequentie/recency, zelfde vorm/typen en ratio binnen5%. Voorstel pas na confirm met undo, huidige logo-aspectratio behouden en onpassende maat weigeren. Uitzetten/wissen/reset, sessiestop bij mislukte uitzetopslag. Benoemde handmatige voorkeuren behouden. Geen tests/publicatie.
- **Klaar wanneer:** Eerst expliciet Bewaar als plaatsingsvoorkeur, lokaal per maat/verhouding/type en aantal objecten. Geen klantlogo of klantdata verzamelen; transparant toepassen/resetten, uitzetten en wissen. Automatisch leren pas na gecontroleerde bevestiging, nooit elke toevallige sleepbeweging als waarheid.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/designs/editor/placement-tools.js`, `admin/designs/editor/storage-and-integration.js`, `docs/OPEN-PUNTEN-VERVOLG-20261027.md`

### Bouwtaken afvinken en overdracht bewaren in het CRM

- **ID:** `build-task-board`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Philippe en toekomstige AI-bouwers gebruiken dezelfde afvinkbare lijst met opmerkingen en controlebewijs.
- **Omvang / status:** Lokaal gereed · nog niet live
- **Volgende stap:** Nieuwe bronlogroute lokaal: scripts/build-task.mjs met append-only shared/planning/source-updates.js. Updates verschijnen zonder handmatig browserinvullen, inclusief AI-export; bestaande gebruikersstatus/opmerkingen blijven leidend. Geen functionele tests; Philippe controleert zelf. Oude opgeslagen taakstatus niet automatisch vervangen.
- **Klaar wanneer:** Bewaren/herladen, historische opmerkingen, bedrijfsgrens, statusconflicten, verloren ACK, back-up en mobiel gecontroleerd. Geen klant-/order-/mailwijziging door een taakafvinkactie.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/workspace/development-plan.js`, `admin/workspace/build-task-store.js`, `shared/planning/progress.js`, `tests/build-tasks.mjs`, `docs/BOUWTAKEN.md`

### 14. Aanbetaling laat productievrijgave automatisch volgen

- **ID:** `deposit-production-rule`
- **Voor:** Spatlappen
- **Doel:** Vanaf de afgesproken werkelijke aanbetaling automatisch Productie vrijgegeven tonen bij actuele ontwerp- en prijsvoorwaarden.
- **Omvang / status:** Automatische projectie lokaal · gebruikerscontrole open
- **Volgende stap:** 27oktober: pure automatische vrijgave bij default50% of eigen orderpercentage, complete specs/prijs, expliciet bekende verzending en actuele ontwerpgoedkeuring. Geen extra vrijgaveklik voor gewone order, percentage apart aanpassen; gratis teststuk bewust. Correctie/gewijzigd ontwerp kan automatische vrijgave intrekken. Werkvoorraad/readiness/voortgang delen dezelfde projectie; fysieke datums/historie blijven echt. Bestaande gewone Gmail-/Maatbasis behouden. Geen tests/provideractie/publicatie.
- **Klaar wanneer:** 49/50%-grens, eigen percentage, prijs/ontwerp/ontvangstcorrectie en gratis teststuk zelf controleren. Geen automatische fysieke productiestart, bestelling of verzending. Maat behoudt eigen fasen.
- **Eerst nodig:** Nuttige vervolgstappen na betaling
- **Vindplaatsen:** `shared/production-release.js`, `admin/orders/production-release.js`, `shared/order-readiness.js`, `shared/sales-funnel.js`, `tests/production-release.mjs`, `docs/OPEN-PUNTEN-VERVOLG-20261027.md`

### 27. Meerdere ontwerpvarianten bij één product en maat

- **ID:** `product-design-alternatives`
- **Voor:** Spatlappen
- **Doel:** Een klant kan kiezen tussen twee of meer ontwerpen bij dezelfde productregel, zonder dubbele aantallen of kosten.
- **Omvang / status:** Batch 1 lokaal afgewerkt · gebruikerscontrole open
- **Volgende stap:** Nieuw/kopie/bewerken met eigen variant-ID en naam; ontwerp-JSON en PNG samen transactioneel, eerdere bestanden append-only behouden. Revisie als nieuwe variant openen. Maat/aantal/prijs blijven gedeeld; gewijzigde klant/productbasis weigeren. Definitieve keuze met confirm en basis van revisie/maat/aantal; wijzigen maakt keuze ongeldig, leveranciersroute vraagt definitief ontwerp. Oude productontwerpen blijven zonder migratie leesbaar; bestaande expliciet goedgekeurde preview bij overgang behouden. Geen automatische klantmutaties of publicatie; gebruikercontrole open. Batch1vervolg: bronmaat/aantal uit opgeslagen JSON, aanwezigheid PNG en actuele variantbasis toetsen vóór definitieve keuze; na afwijkende maat eerst opnieuw bewaren. Legacybronbasis bij save, ontbrekend oud tijdstip/PNG behouden zonder historie te verzinnen. Revisies nieuwste eerst met versienummers, vrije standaardnaam en gesynchroniseerde naamvelden. Algemene order-/oude afbeeldingsgoedkeuring vervangt geen variantkeuze; oude approvalmarker correct opheffen. Geen tests of publicatie.
- **Klaar wanneer:** Bestaand ontwerp en voorbeeld blijven behouden; openen, opslaan en herladen raken alleen de gekozen variant. Alternatieven zijn geen revisies en overschrijven elkaar niet. Aantal, maat, prijs en inkoop blijven op één productregel; afwijkende maat vraagt bewuste aparte productkeuze. Definitieve keuze is zichtbaar; productie/documenten gebruiken alleen een expliciet gekozen ontwerp. Historische documenten en eerder goedgekeurde afbeeldingen blijven intact. Gelijktijdig opslaan en een gewijzigde definitieve variant vragen conflict-/herbevestigingscontrole.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/product-design-variants.js`, `admin/product-designs.js`, `admin/products/images.js`, `admin/designs/editor/storage-and-integration.js`, `admin/designs/editor/saved-download.js`, `shared/state-validation.js`, `docs/VIER-DELEN-20261026.md`, `docs/BATCH1-ONTWERPVARIANTEN-20261026.md`

### 31. Benoemde kosten en verdeling per order/product

- **ID:** `named-extra-costs`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Naast vaste kostensoorten zelf kosten met een naam invullen en de kostverdeling begrijpen.
- **Omvang / status:** Kostenbasis aanwezig · nieuwe uitleg lokaal, gebruikercontrole open
- **Volgende stap:** Bestaande benoemde kosten/order-product-batchverdeling behouden. Batch2 voegt gesloten read-only categoriepercentages/meters toe met dezelfde economics/allocatedAmount. Directe inkoop/benoemde kosten en afgerond per-stuk-uitleg bij product; gedeelde kosten niet opnieuw verdeeld. Onbekend/gratis/geschat herkenbaar. Geen nieuwe financiële berekening/tarieven, tests/build/browserQA of publicatie; Philippe controleert zelf.
- **Klaar wanneer:** Geen dubbeltelling naast bestaande kosten; onbekend blijft onbekend, expliciet0 blijft geldig. Btw/valuta/verdelen en historische totalen gecontroleerd; geen los tweede geldmodel.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `shared/named-costs.js`, `admin/orders/named-costs.js`, `admin/app.js`, `tests/named-invoice-costs.mjs`, `admin/orders/cost-composition.js`, `docs/BETALINGEN-EN-DOCUMENTEN.md`

### Code per werkonderdeel bij elkaar

- **ID:** `feature-boundaries`
- **Voor:** Spatlappen en Maatwerkkunststof
- **Doel:** Een wijziging aan Klanten of Inkoop moet op één herkenbare plek beginnen, zonder de andere onderdelen mee te veranderen.
- **Omvang / status:** Lokaal gebouwd · gebruikercontrole open
- **Volgende stap:** Deze oudere opdracht is inmiddels uitgevoerd binnen crm-feature-source-structure: klantadressen/formulier staan in admin/customers/dossier.js, inkoop en andere features in eigen factories via dezelfde live context. Geen nieuwe verplaatsing nodig; Philippe controleert zelf. Geen tests/build/browserQA/publicatie voor deze registratie uitgevoerd.
- **Klaar wanneer:** Dezelfde routes en opslagcontracten blijven geldig; tests bewijzen dossier- en bedrijfsafscheiding. Geen massale verplaatsing.
- **Eerst nodig:** Geen aparte stap in dit plan.
- **Vindplaatsen:** `admin/app.js`, `admin/customers/`, `admin/workspace/`, `shared/`, `docs/plan/ARCHITECTUUR.md`

### Eigen complete documentenset

- **ID:** `company-documents`
- **Voor:** Maatwerkkunststof
- **Doel:** Offerte, orderbevestiging en factuur laten aansluiten op de Maatwerkkunststof-order en huisstijl.
- **Omvang / status:** Gebouwd en gepubliceerd · gebruikercontrole open
- **Volgende stap:** Op verzoek dezelfde Spatlappen-templates/opmaak en registratie-/bankgegevens met Maatwerkkunststof-naam/website. Offerte, bevestiging, proforma, factuur en pakbon beschikbaar; gedeelde converter met eigen bedrijfstoken en gescheiden tijdelijke downloads. Render/Cloudflare-activering bevestigd op 19 oktober, met eigen afgeleide Maat-token zonder extra Render-invoer. Gebruiker moet documentgeneratie nog bevestigen; geen tests of proefdocumenten uitgevoerd.
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

### 34. Betalingen periodiek controleren zonder meldingsruis

- **ID:** `scheduled-payment-checks`
- **Voor:** Spatlappen
- **Doel:** Niet telkens handmatig controleren; alleen aandacht bij nieuwe ontvangst of een fout die actie vraagt.
- **Omvang / status:** Middel
- **Volgende stap:** Voeg een gecontroleerde servercontrole toe op een afgesproken interval (wens: ieder uur), met bedrijfsbinding, bestaande importdeduplicatie en zichtbare laatste geslaagde controle.
- **Klaar wanneer:** Niet actief door alleen deze planning. Geen dubbele ontvangsten bij retries/parallelle checks; alleen bevestigde ontvangst melden, niet iedere controle. Telefoonpush volgt afzonderlijk onderzoek.
- **Eerst nodig:** Nuttige vervolgstappen na betaling
- **Vindplaatsen:** `cloudflare/tikkie.js`, `admin/payment-workflow.js`, `docs/plan/AUTOMATISERINGEN.md`

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
- **Eerst nodig:** Een rustige maatwerkwerkplek met Exact als opmaakreferentie; Automatiseringen die een voorstel klaarzetten
- **Vindplaatsen:** `shared/sales-funnel.js`, `shared/purchase-stock.js`, `admin/app.js`

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
- **Vindplaatsen:** `admin/workspace/overview-settings.js?v=maat-cleanup-20261021`, `admin/workspace/section-tabs.js`, `admin/style.css`, `admin/index.html`, `docs/UX-WERKPLEK.md`

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
