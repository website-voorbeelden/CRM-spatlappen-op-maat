# Belangrijke informatie eerst — gedeelde CRM-werkplek

27 oktober 2026. Philippe vraagt de gedachte achter de nieuwe dossierkop door het CRM heen toe te passen. Lokale bronronde voor beide bedrijven. Deze afspraak gaat vóór oudere dichte fase-/cijferstroken, de brede Excelrichting en meerdere even belangrijke knoppen. Het is geen opdracht bedrijfsprocessen, bedragen of opgeslagen voorkeuren stil te veranderen.

## De gedeelde indeling

Een duidelijke paginatitel met korte context en één hoofdactie. Enkele relevante kerngegevens in een rustig vlak, met een eigen label en uitleg. Dossieronderdelen op een aparte horizontale regel. Financiële details, historie en instellingen op de plek waar ze nodig zijn, onder Meer of een gesloten onderdeel. Tekorten, fouten, onzekere bedragen en actieve waarschuwingen blijven zichtbaar. Geen kunstmatig betaaldlabel, verzonnen nulbedrag of nieuw deadlinefeit om een scherm mooier te maken.

workspace/key-facts.js maakt uitsluitend semantische dl-markup van doorgegeven projecties. Eén centrale CSS-eigenaar voor die kerngegevens en dossierkoppen in admin/style.css, één metricfont-token. Bestaande algemene kaarten zijn als rustige cijfergroepen behandeld; tabellen, werkrijen, paginakoppen en gedeelde oppervlakken krijgen meer ruimte. workspace/tab-visibility.js onthult alleen de horizontaal geselecteerde tab, zonder pagina- of focusverplaatsing. Instellingenpanelen blijven gemount; formulieren en drafts worden niet herbouwd om de tabs rustiger te maken.

## Doorgetrokken naar de schermen

| Scherm | Nieuwe prioriteit | Wat bereikbaar blijft |
|---|---|---|
| Overzicht | Te doen met prioriteit, lopende dossiers, te ontvangen geld; één Nieuwe klantorder-actie | Activiteiten/orders via bestaande tabs; AI-prompt en nieuwe klant bij Meer; voorlopige/onbekende prijzen benoemd |
| Aanvragen-/orderlijsten | Verkoop en betaling hebben eigen kolommen; geen vier betaal-/prijsteksten onder één bedrag | Prijs incl. btw en de gekoppelde inkoop onder Prijs & inkoop; fase-/volgende-actieregels en sorteerkeys behouden |
| Orderdossier | Bestaande nieuwe kop gebruikt dezelfde gedeelde kerngegevenscomponent | Fases via Meer, product-/ontwerp-/review-/planning-/bedrijfs- en CAS-regels behouden |
| Betalingen bij order | Werkelijk ontvangen bedrag; bij complete prijs openstaand en totaal; bij onvolledige prijs één gerichte aanvulmelding | Eén primaire betaalregistratie, bestaande ontvangsten/correcties, Tikkieacties en zichtbare verzendprijs-/vrijgavewaarschuwingen. Prijsopbouw & btw gesloten |
| Inkoop & marge bij order | Drie duidelijk benoemde projecties voor verkoop, kosten en marge, excl. btw | Ontbrekende kosten en voorlopige cijfers zichtbaar; bestaande specificaties/kostenverdeling/bewerking blijven |
| Klantdossier | Lopende orders, te ontvangen bedrag, contactpersoon; eigen rustige kop en tabs | Contact/notities en betalingsdetails opvraagbaar, ontbrekend e-mailadres blijft open; vervolgstap/wachttijd zichtbaar, fase bij Meer |
| Inkoop | Lijst met zending, status, orders, aankomst en betaald; dossierkop met drie kerngegevens | Product-/gedeelde kosten bij eigen tab; documenten/betalingen/voorraad/pakbonnen/archief en alle bestaande acties behouden |
| Ontvangstenoverzicht | Gefilterd ontvangen bedrag, aantal ontvangsten en aandachtspunten | Filters/periodefout/zoekfocus/ontvangstdetails/correcties, waarschuwingen en refreshstatus; langere uitleg gesloten |
| Mail | Gesprekken/zoeken/weergave vóór instellingen | Sorteren en uitleg onder bestaande Meer filters; Gmailinstellingen bij Meer. Actieve filters/status, verzendproblemen, concept-/reply-/bijlage-/herkomstregels en automatische stand behouden |
| Documenten | Hoofdactie bovenaan, minder herhaalde Maak/Upload-knoppen per categorie | Categoriekeuzes onder Meer, upload/drop/doelkeuze/indeling/zichtbare verborgen-vakkenmelding en PDF/Word/versies/voorwaarden blijven |
| Financiële Analytics | Orderwaarde excl. btw, ontvangen geld incl. btw en marge excl. btw met eigen betekenis | Kostprijsberekening opvraagbaar; orderwaarde-geen-factuuromzet en voorlopige waarschuwingen, grafieken/perioden/drilldown/open posten blijven |
| Instellingen/overige CRM-schermen | Gedeelde ruimere koppen, oppervlakken, cijfergroepen, rijen en horizontale tabnavigatie | Bestaande instellingenformulieren en invoerbescherming; geen activering/nieuwe voorkeur. Losse ontwerptool/calculator/documentinhoud niet herontworpen |

## Grenzen en broncorrecties

Geen nieuwe financiële engine, serverroute, store, providerpoll, automatisering of bedrijfskopie. Onderliggende totalen/ontvangsten/sortering/projecties blijven. Orderbetalingspresentatie gebruikt nu expliciet shippingKnown===true voor definitieve bedragen/progressie, net als de kop; een ontbrekende legacyflag blijft onbekend. Een bekende nulorder krijgt Geen bedrag te voldoen. Overzicht markeert ook ontbrekende verzendkennis als onvolledig. Dit zijn weergaveguards, geen wijziging van financiële opslag of van bestaande funnel-/vrijgave-/mailregels.

De bron van financiële projecties verschilt historisch nog per werkproces. Deze ronde vervangt die niet door één nieuwe engine en is geen sluitende financiële audit. Met name historische/onvolledige projecties en bredere herstel-/login-/conflictscope blijven eigen controle/vervolgwerk. Gegevens, IDs, bedrijfsafscheiding, bestaande wijzigingen, opgeslagen status/feedback, documenten/ontwerpen en private configuratie behouden.

## Controle en voortgang

Bronnen gelezen en bewerkt; het al toegestane bestaande Maatvoorbeeld Betalingen in een eigen tab bekeken, zonder formulier-/betaalactie of herladen van de oorspronkelijke tab. Afbeelding uitsluitend lokaal onder work/calm-workspaces-20261027/betalingen.png. Andere schermen zijn in deze ronde op basis van hun bron aangepast; geen claim dat ze allemaal visueel/functioneel gecontroleerd zijn.

Geen automatische tests/checks/syntaxchecks/builds, brede browser-QA, provider-/mail-/Gmail-/betaal-/pushproef, database-/privateconfiguitlezing, herstart, GitHubupload of livepublicatie. Alleen de administratieve roadmap wordt opnieuw geschreven. Bouwlog via scripts/build-task.mjs, nieuwe taak review/local, brede werkplek doing/local. Eigen controle beide bedrijven/desktop/mobiel/lange gegevens/lege en historische dossiers, tab-/Meer-/focus-/invoerbehoud, actieve waarschuwingen/filters en onbekende/volledige/nul-/deel-/overbetalingen blijft open.
