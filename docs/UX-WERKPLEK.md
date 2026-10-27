> Vervolg27oktober: opmaakbatches2–4 nu brongebouwd/review lokaal. Aanvraagtekorten direct aanvullen, varianten/finale duidelijker, rustigere lijsten/bedragen/filters en mail/documentacties; centrale CSS-eigenaren, geen extra sheet. Alleen Maatwerkkunststof: aangeleverde voorwaarden bij order en mail, nooit automatisch meesturen. Zie [Batches2–4](BATCHES2-4-OPMAAK-20261027.md) en [Voorwaarden](ALGEMENE-VOORWAARDEN-BIJ-ORDER.md). Eigen beoordeling open; geen tests/checks/build/browser-/DOMcontrole/publicatie. Oudere geplande stand hieronder is historie.

> Opmaakbatch1,27oktober: centrale type/spacing/controlbasis, begrensde hoofdnavigatie, compacter gegroepeerde bovenbalk en één native Meer-menucontroller/-stijl. Batches2–4 gepland; huidige batch bronreview/local, geen tests/browsercontrole/publicatie. Zie [Vier opmaakbatches](VIER-OPMAAKBATCHES-20261027.md).

> Vervolg27oktober: dossierindeling na kritiek verder uitgewerkt: samenhangende kop, horizontale tabs, geïntegreerde volgende actie, productregels en één aanvullend dossiergedeelte. Oude globale aside-menuregels begrensd en vervallen productCSS opgeruimd. Alleen bron, geen eigen visuele beoordeling/tests/publicatie; Philippe beoordeelt zelf. Zie [Dossierindeling](DOSSIER-INDELING-20261027.md).

> Nieuw27oktober: apart menu Betalingen voor ontvangen klantgeld; tabel met klant uit order, datum/bedrag/herkomst/omschrijving, nieuwste eerst en directe dossierlink. Zoeken/Tikkie zichtbaar, datum/aandacht/reset bij Meer,50regels/pagina, één Bijwerkenactie. Invoer/zoekfocus/details behouden bij refresh; onbekende koppeling markeren en geen rekeninghouder/auto-matching verzinnen. Gedeelde centrale CSS; bron lokaal, gebruikerscontrole/publicatie open. Zie BETALINGENOVERZICHT.md.

# Laatste27oktober: fasemelding zonder onderbreking

Fase bijgewerkt in hetzelfde kleine meldingsvak als nieuwe aanvragen, met Bekijken en Terugdraaien plus sluiten. Geen automatisch modal. Bij Bekijken de undo beschikbaar houden; per order alleen nieuwste fasemelding. Undo alleen de eerdere fase op actuele basis, geen mail/betaling/gegevens terugzetten. Nieuwere fase of gewijzigde bron/klantkoppeling weigert oude undo, fout zichtbaar. Open/onbewaarde invoer blijft beschermd. Eén gedeelde meldingscomponent per bedrijf en centrale CSS; voorkeur om meldingen te verbergen blijft alleen weergave. Zie COMPACT-ORDEROVERZICHT.md. Alleen lokaal, geen tests/checks/build/browsercontrole/publicatie, eigen beoordeling open.

# Laatste vereenvoudiging — 27 oktober: één CSS-basis, compact orderoverzicht

Gedeelde stijl inclusief mail in één actief admin/style.css-bestand, één :root en gedeelde controls/surfaces; onderdeel-/responsive-indeling blijft specifiek waar nodig. Geen extra gedateerde themalaag of losse feature-CSS. Lees CRM-CSS.md.

Product/ontwerp en volgende actie eerst; aanvraagchecklist, planning, klant/notities en prijsopbouw dicht. Tekorten/actieve waarschuwingen en te-laatsignaal zichtbaar. Rekenen zonder extra faseformulier; een complete nog onbesliste vroege aanvraag krijgt afgeleid Prijs berekenen, bewuste fase-/Gmailkeuze houdt voorrang. Philippe verduidelijkt: nieuwe bekende SMTPmailfasen volgen automatisch, popup is uitleg achteraf met Verder/Sluiten/aanpassen. Vinkje verbergt alleen de melding per bedrijf/browser; fase volgt onafhankelijk. Meer → Fase-meldingen zet meldingen weer aan. Oude pending/dismissed/herstel behouden hun eerdere reviewkeuze. Zie COMPACT-ORDEROVERZICHT.md. Alleen lokale bron, geen tests/checks/build/browsercontrole/publicatie. Eigen controle en bredere scope open.

# Nieuwste kleurafspraak — 27 oktober: paars uitsluitend voor herkomst

Heel lichtpaars voor automatisch ingevulde/overgenomen waarden; donkerpaars met witte tekst voor AI of interpretatie. Bronuitleg onderscheidt AI van vrije tekstherkenning of historische bronvergelijking. Kleur volgt de bron, niet de uitvoeringsmode of gebruikersbevestiging. Gewone selectie, filters, tabs, navigatie, bouwtaken en kaartlegenda zijn blauw/neutraal. Dit vervangt oudere paarse selectieafspraken hieronder. Handmatige afwijking verliest de markering; geen historische herkomst verzinnen of gegevens migreren. Zie HERKOMST.md. Alleen lokale bron, geen tests/browsercontrole/publicatie; Philippe beoordeelt zelf.

# Nieuwste aanscherping — 27 oktober: dossierinhoud eerst, donker op licht

Philippe vindt fases/voortgang bovenaan te groot en wil geen lichte tekst op lichte vlakken. Boven de tabs alleen compacte huidige fase en netto bedrag/bekend bruto saldo. Volledige stappen/fasekeuzes onder Fases & voortgang, cijferkolommen onder Bedragen & marge, standaard gesloten. Overzicht toont één volgende hoofdactie + noodzakelijke reden; overige acties bij Meer, toelichting/historie gesloten. Fase-na-mailreview en actieve Gmailconflictwaarschuwing blijven zichtbaar. Geen functies/data/financiële betekenis verwijderen. Tabs/navigatie donkerblauw; blauwe selectie-/filteraccenten, paars uitsluitend voor herkomst (zie nieuwste afspraak hierboven). Gedeelde hover/focus/actiefregels expliciet donker op licht. Behoud mobiele44pxbediening en alle invoer-/CASbescherming. Zie nieuwste OVERDRACHT, ORDERVOORTGANG en EXACT-REFERENTIE-20261027. Alleen bronwerk/openbare bronlezing; geen tests/contrastmetingen/CRMbrowsercontrole/publicatie, eigen controle open.

# Nieuwste correctie — 27 oktober: Exact Online als referentie

De Excelwens was door Codex te breed op de hele CRM toegepast. Philippe vraagt nu Exact Online vrijwel1op1 als visuele richting. Zie [Exactreferentie en maatwerkvergelijking](EXACT-REFERENTIE-20261027.md): blauwe hoofdactie en actieve selectie, wit/lichtgrijs, lijniconen en rustige onderstreepte tabs; geen groen spreadsheetcelraster om formulieren/dossiers. Tabellen voor echte gegevenslijsten blijven passend. Bestaande navigatieroutes/menuvoorkeuren, bedrijfsnamen, duidelijke hoofdactie/Meer en inline invoerherstel behouden. Nieuwe bedrijfs-/modulecontext bovenaan is tekst, geen onwerkzame administratiekiezer. Losse tools en documentinhoud niet aanpassen met deze ronde. Oude Excelparagraaf hieronder is historisch en niet meer leidend. Alleen lokale bron, openbare Exactreferentie bekeken; geen CRM-browser-QA/DOMuitlezing/tests/publicatie. Eigen visuele/bedieningscontrole open bij beide bedrijven.

# Nieuwe visuele afspraak — 27 oktober: Excel-stijl

Philippe vraagt nadrukkelijk een andere stijl dan losse kaders: overzichtelijke kolommen/rijen, vlakke grijze kopregels en werkbalken, dunne scheidingen, wit/zebra en een groen selectie-/hoofdactieaccent. Deze nieuwste keuze gaat vóór de oudere afgeronde kaartstijl hieronder. Mail als breed gespreksregister boven het gekozen gesprek; vaste status/Van/Aan/datumregels met witte inhoud. Klanten en taken met herkenbare kolomkoppen, dossier-/bedragvelden uitgelijnd. Formulieren en de overige CRM-schermen volgen dezelfde compacte taal. Geen extra instellingen, nep-bewerkbare cellen, meer permanente knoppen of wijziging aan gegevens/reply/exportinhoud. Mobiel bestaande navigatie en gestapelde velden. Lees EXCEL-STIJL-20261027.md; alleen lokale bron, geen tests/browsercontrole/publicatie. Philippe beoordeelt zelf.

# Reparatie — 27 oktober: aanvragen/orders openen

De voortgangsprojectie gebruikte een niet-bestaande f-binding voor nog niet uitgevoerde orders. Nu de bestaande funnel-binding, zodat die weergavetak niet op deze bronfout afbreekt voordat het dossier wordt getoond. Geen nieuwe bediening of wijzigingen aan verkoop-/uitvoeringsstatus. Alleen bronwerk; expliciet geen browseruitlezing of QA, gebruikerscontrole open. Zie ORDERVOORTGANG.md en nieuwste OVERDRACHT.md.

# Aanvulling — 27 oktober: opslag en foutbediening

Een dossier pas zichtbaar aanpassen na geslaagde transactie. Bewaren maakt het formulier tijdelijk inert; foutbediening/focus daarna herstellen met dezelfde invoer. Kleine formulieren maken zo nodig zelf een inline foutvak; foutnotities naast kale invoervelden, geen opstapeling van listeners. Klant/adres-/kosten-/notitiebewerking bewaakt de oorspronkelijke basis, ook als de pagina met een adresdraft opnieuw getekend wordt. Dupliceren krijgt nieuwe product-ID’s en geen ontwerp-/bestands-/goedkeuringsverwijzingen uit het oude dossier. Originele varianten blijven behouden. Geen extra permanente knoppen. Sessieverloop/login en lokale back-updeelresultaten blijven aparte open UX-punten; zie ALGEMENE-CODELEZING-20261027.md. Alleen lokale bron, geen tests/publicatie.

# Aanvulling — 27 oktober: open punten uit batch3/4

Spatlappen: de gewone productievrijgave volgt automatisch uit actuele echte ontvangst/prijs/ontwerpvoorwaarden; alleen het percentage aanpassen blijft bij Meer, fysieke start/levering apart. Document plus betaallink mag Wacht op betaling voorbereiden zonder verzendbewijs. Aanwezige factuur niet uitsluitend wegens een ontbrekende verzenddatum opnieuw als verplichte mailtaak tonen. Leren van plaatsingen standaard uit, alleen na geslaagd Bewaren, een voorstel pas bewust toepassen. Segmentherkenning expliciet, vectorcurves en gaten met undo; geen onzichtbare herschikking van anders gekleurde tussenlagen. Google Maps-berekening in één gesloten routeonderdeel; sleutel inline aanvullen met formulier-/invoerbehoud, geen automatisch betaalde opvraag. Aflevertijd niet raden, volgorde en kostenovername expliciet. Zie OPEN-PUNTEN-VERVOLG-20261027.md; geen tests of publicatie.

# Aanvulling — 26 oktober: rustige mail en behoud bij verversen

Gesprekslabels krijgen een eigen kader; Behandeld is direct zichtbaar, andere labels/uitleg/Gmail-fase bij Meer. Dat onderdeel klapt in de paginastroom uit, zonder zwevend instellingenmenu. Een labelconflict toont de actuele labels en vraagt opnieuw kiezen binnen hetzelfde gesprek; antwoordtekst blijft staan. Alleen eigen labelknoppen blokkeren tijdens labelsave. Gesprek bijwerken bewaart ook de tijdens ophalen getypte tekst, waar mogelijk cursor/scroll, en het oorspronkelijke replyanker. Bij een open venster of ander actief formulier geen late vervanging. Templates/vragen behouden het reply-onderwerp, ook in puur CRM-gesprek; gewijzigde ontvanger/onderwerp vóór gebruik herbeoordelen. Zie BATCH4-MAIL-EN-CRM-20261026.md; lokaal, eigen controle open.

# Aanvulling — 26 oktober: kleur en plaatsing

SVGpalet: Kleur aanpassen direct, verwijderen en optionele Losse delen onder Meer. Eilandherkenning is expliciet en conservatief; niet presenteren als volledige segmentatie. Stoppen van een vectorvoorbeeld blijft gestopt tot een bewuste nieuwe instelling/heropening/andere afbeelding; na Toepassen het echte resultaat laten staan. Plaatsingsvoorkeuren blijven ingeklapt met expliciete bevestiging; gewijzigde/onleesbare voorkeuren inline opnieuw ophalen met behoud van ontwerp en naamveld. Geen onbedoelde inhoudsovername uit geometrievoorkeuren. Zie BATCH3-LOGO-KLEUR-PLAATSING-20261026.md; lokaal, gebruikerscontrole open.

# Aanvulling — 26 oktober: tekst en ontwerptoolbediening

Fontimport en beheer ongebruikte fonts delen één ingeklapt onderdeel; tekst als SVGcontour is een apart benoemd alternatief. Fontvoorbeelden zijn tijdelijk tot kiezen en stoppen bij selectie-/ontwerpwissel. Eigen sneltoetsen via Cmd/Ctrl+Shift+klik, uitleg in bestaand vraagteken; geen extra permanente hoofdknop. Kopie openen houdt een terugvallink na bevestigde opslag, ook bij pop-upblokkade. Desktoppreview/onderpaneel delen de bestaande werkplekgrens boven950px; kleinere vensters houden de normale stroom. Zie BATCH2-TEKST-EN-BEDIENING-20261026.md; alleen lokaal en gebruikerscontrole open, geen tests/publicatie.

# Bezorgkosten bij de route — 26 oktober 2026

Eigen bezorgroute plannen houdt routelinks als hoofdactie. De optionele kostenvergelijking begint ingeklapt en gebruikt vijf eigen aannames excl. btw; geen tarieven raden of klantverzendbedragen als pakketkosten gebruiken. Live uitkomst via bestaande rekenregel, geen bewaarknop. Bij route-/filterwijziging invoer behouden en oude uitkomst verbergen tot bewuste herbevestiging voor de huidige stops. Geen automatische afstand, tijd of optimale route beloven. Zie ORDERKAART-EN-BEZORGROUTE.md; lokaal, gebruikerscontrole open.

# Analytics — 24 oktober 2026

Begin met een compact overzicht van bezoek, aanvragen en conversie. Dagcijfers en formuliertechniek optioneel; bron-/meetdekking eerlijk, geen grote permanente onbekend-kaarten. Bij filterladen/fout blijft de vorige weergave met expliciete context staan. Financiën: kernbedragen eerst, één interactieve grafiek, openstaande posten en topklanten optioneel. Bezoek- en CRM-tellingen niet optellen; orderwaarde is geen factuuromzet. Zie ANALYTICS-WERKPLEK.md. Geen functionele controle door Codex; Philippe beoordeelt zelf.

# Mobiel invullen en betalingsmeldingen — 23 oktober 2026

Instellingen → Telefoon & meldingen houdt installatie en apparaatkeuze bij elkaar. Geen toestemming/push bij alleen paginabezoek; geen browserbrede laadmelding voor een servercontrole. Alleen algemene betalingsmelding, tik naar Betalingen in het dossier. Bestaande onopgeslagen werkplek niet vervangen. Online activering blijft apart; ontbrekende inrichting wordt zichtbaar benoemd.

Factuur: echte ontvangsten standaard aangevinkt als toelichting, handmatig uitvinken blijft mogelijk. Expliciete eerdere selectie (ook leeg) blijft bij invulhulp/terugkeer staan; betaalstatus, saldo en oude facturen veranderen niet. Mobiele modals volgen echte zichtbare viewport inclusief toetsenbord/offset; actief veld in eigen scrollvlak zichtbaar houden, feedbacktextarea begrensd. Geen inhoud resetten of formulier vervangen. Gebruikercontrole op toestel open. Zie MOBIELE-MELDINGEN.md; geen tests/publicatie.

# Recente dossiers en zichtbare sortering — 23 oktober 2026

Aanvragen & orders en Klanten standaard op laatst geopend; Sorteren direct naast de filters. Eigen keuze per browser/bedrijf bewaren, ook via bestaande orderkolommen. Filters wissen laat deze keuze staan. Alleen een daadwerkelijke dossieropening telt, geen tabwissel/opslag/achtergrondverversing. Onbekende historie niet invullen als laatst bewerkt. Prijsvergelijking behoudt relevantievolgorde. Zie [DOSSIER-SORTERING.md](DOSSIER-SORTERING.md); lokaal bronwerk, Philippe controleert zelf, geen tests/publicatie.

# Werkplek: hoofdactie eerst

Gedeeld voor Spatlappen op maat en Maatwerkkunststof. Updates blijven lokaal totdat publicatie wordt afgesproken.

## Less is more — leidende afspraak

Toon alleen bediening die voor de huidige werkstap nodig is. Een functie behouden betekent niet dat haar knop permanent zichtbaar moet zijn. Minder gebruikte opties horen achter Extra opties / Meer of in een ingeklapt onderdeel. Voeg bij vervolgwerk niet opnieuw losse primaire tegels, patroonknoppen, dubbele invoervelden of extra banners toe zonder een concrete gebruikersreden. Prijs, marge, AI en de relevante CRM-bewaaractie blijven de hoofdroute van de calculator.

## Documenten

Facturen tonen hun bewaarde betaalstand bij aanmaken: status, ontvangen percentage en incl.-bedragen compact op de kaart. Oude PDF’s niet als actueel voldaan presenteren. Onbekende bron expliciet, PDF/Word samen. Stempels passen op twee regels binnen het bestaande kader. Nieuwe volledige factuur bij bestaande nummers duidelijk toelichten; een andere betaalstand is geen extra te factureren omzet. Zie [Factuur-betaalstand](FACTUUR-BETAALSTAND.md). Lokaal bronwerk, gebruikercontrole open.

- De documententeller gebruikt dezelfde documentreeksen als de bibliotheek: PDF/Word en hun revisies tellen samen als één document. Losse uploads blijven afzonderlijk. Verwijderdialogen tellen bewust echte bestanden.
- Het documententabblad toont de bibliotheek direct. Uitgebreide orderstatus, tijdlijn en financiële kaarten blijven beschikbaar bij de order; ordernummer en betaalbadge blijven in beeld.
- Preview, PDF downloaden en Mail voorbereiden zijn direct beschikbaar. Word downloaden, verwijderen, categoriseren en overige beheertaken staan onder Meer / bestanden beheren.
- In een documentvak is Maken de hoofdactie. Uploaden staat direct naast Maken; ook deze aanvullende actie hoort niet alleen achter een Meer-menu te staan. Bij overige typen blijft Uploaden direct zichtbaar.
- Indeling bevat twee/drie kolommen, ruim/compact en lege vakken verbergen. Bij beperkte breedte worden automatisch minder kolommen gebruikt. De algemene knoppen Document maken en Bestand uploaden blijven zichtbaar, ook als alle lege vakken verborgen zijn. Alle vakken tonen herstelt de zichtbaarheid direct.
- Slepen via de drie streepjes, pijltjestoetsen en het verplaatsmenu veranderen dezelfde categorievolgorde. Bij verborgen lege vakken slaat de toetsenbordbediening die vakken over.
- De bestaande sleutel `crm-document-layout-v1:<bedrijf>` bewaart nu ook `view`. Oude volgordes blijven behouden. Voorkeuren staan alleen in deze browser, per bedrijf; ze bevatten geen documentinhoud of klantgegevens. Opslagfouten laten de weergave wel veranderen en melden dat bewaren niet lukt.
- Indelingswijzigingen verplaatsen bestaande DOM-vakken, zonder bestandsreads, CRM-mutaties of een nieuwe paginarender. Standaardindeling herstellen reset zowel volgorde als weergave.

## Mail

- Het nieuwste gedeelte van een gesprek blijft direct zichtbaar. Eerdere berichten staan achter één samenvatting. Onzekere en afgewezen CRM-verzendingen worden niet onder de oude historie weggestopt.
- Het actieve bewaarde concept verschijnt in de composer, niet ook nog als nieuwste bericht in de geschiedenis. Andere concepten blijven bereikbaar.
- Voorbeeld & versturen, Concept opslaan en Gegevens opvragen blijven dichtbij het antwoord. Bijlage / uitgebreid en templatebeheer staan onder Meer. De standaardtekst kan direct worden gekozen en bewerkt.
- Chronologie gebruikt de verzenddatum van aangeboden CRM-mails waar beschikbaar. Geciteerde mailgeschiedenis blijft afzonderlijk inklapbaar.
- Bestaande bescherming blijft: antwoordtekst behouden bij navigatie/verversing/templatebewerking; preview en aparte verzendbevestiging; geen automatische Gmail-wijzigingen of verzendingen.

## Richtlijn voor vervolgaanpassingen

Kies per werkstap één herkenbare hoofdactie. Plaats beheeropties bij Meer, maar verberg geen noodzakelijke herstelactie achter een foutmelding. Ontbrekende gegevens moeten direct invulbaar zijn met behoud van het oorspronkelijke formulier. Gebruik de bestaande inline taken, form guidance, preview en conflictcontroles. Persoonlijke indeling verandert alleen de presentatie, nooit dossiergegevens of bedrijfsregels.

## Kostprijscalculator

De V1-opmaak blijft uitgangspunt: kostprijs, verkoopprijs en marge prominent bovenaan. Geen presentatiehero of marketinglaag. De vormkiezer, pakkinginstellingen en DXF/STEP-import horen bij Stukken. De bestaande AI-knop houdt zijn opmaak en opent uitleg met zichtbare prompt, kopieerstatus en een plakvak voor het antwoord; controle en expliciet overnemen beschermen de huidige invoer. Het gesprek en vragen over ontbrekende gegevens vinden plaats in ChatGPT. Opslaan bij klant toont een controleoverzicht en bewaart in V2 een nieuwe berekeningskopie in het klantdossier, geen automatische wijziging van orderprijzen. Bij klant openen onder Berekening beheren opent zo’n kopie direct na preview en bevestiging. De bewaarstatus vervalt zodra de berekening wijzigt. Kostenuitsplitsing, extra margevelden en rekenuitleg staan ingeklapt; de hoofdprijzen en het margebedrag blijven direct zichtbaar.

### V2 bij een bestaande order

De lokale order heeft onder Kostprijscalculator een V2-ingang per productregel. In V2 kun je ook zelf een order koppelen. Koppelen bewaart niets; laden vervangt pas na een zichtbare keuze de huidige invoer. Bij gekoppelde orders wordt de hoofdactie Uitkomst naar order. Een vergelijking en afzonderlijke keuzes bepalen of maten, directe kostprijs en verkoopprijs worden overgenomen; verkoop staat standaard uit. Transport/invoer worden niet dubbel als productkost geboekt. Factuurkostprijzen, totaalprijsorders en gewijzigde bronnen blijven beschermd. Vormen/contouren en gatposities blijven bij de version2-orderberekening bewaard. Eén stukregel hoort bij één CRM-product.

### Minder dubbele bediening

Stukken staan open met direct bewerkbare basisgegevens. Materiaal, dikte en vormmaten staan bij het stuk. Ring en pakking delen de vormkeuze; boutgaten op een steekcirkel zijn daar bereikbaar. Minder gebruikte bewerkings- en beheerkeuzes staan bij Meer opties; de primaire bewaarknop blijft bij de prijsuitkomst. AI- en feedbacktekst blijven tijdens de sessie behouden bij sluiten van het venster.

## Gedeelde werkplek en navigatie

De documentenpagina is het visuele en functionele voorbeeld voor verdere schermverbetering: lichte werkvlakken, rustige vakken, één hoofdactie bij de taak en overige beheerkeuzes bij Meer. Behoud noodzakelijke informatie, zoeken, herstelacties en invoer; minder bediening mag geen functies stil verwijderen. Prijs en marge blijven bij calculeren direct prominent.

Het menu heeft vier vaste groepen voor beide bedrijven: Werkdag (Overzicht, E-mail), Verkoop & relaties (Aanvragen & orders, Klanten, Orderkaart), Uitvoering (Inkoop, Voorraad, bedrijfstool) en Beheer (Analytics, Feedback, Ontwikkelplan, Instellingen). Bestaande hash-routes, actieve orderfase, mobiele bediening en persoonlijke zijbalkvoorkeur blijven behouden. Nieuwe navigatiecode staat in admin/workspace/.

Ontwikkelplan is een leesbaar overzicht, gefilterd per bedrijf. Eerstvolgend, Daarna en Eerst uitzoeken zijn plannen; Al aanwezig benoemt bestaande mogelijkheden inclusief grenzen. Uitgebreide klaarcriteria en bouwpaden staan ingeklapt. Idee doorgeven opent de bestaande Feedback-pagina; feedback wordt niet automatisch uitgevoerd of in de roadmap gezet. De bron is shared/planning/roadmap.js; npm run plan houdt de Markdown-versie gelijk.

## Snelle AI-bediening en aanvraagherkenning

Chat openen wacht niet op de spraakdienst; Praten controleert die pas bij gebruik. Statuscontroles worden bij herhaald openen/focus kort hergebruikt. De modelkeuze blijft behouden. Voortgang van een chatvraag staat in de chat zelf. De calculator-AI houdt maximaal één venster open en bewaart geplakte tekst tijdens de sessie.

Bij een geopend ontvangen mailgesprek zonder order staat Aanvraag herkennen direct in beeld. Herkende klant- en productgegevens verschijnen als bewerkbaar voorstel met bronnen en een live lijst Nog nodig. De vormkeuze toont passende maatvelden; extra productgegevens en bronmail staan ingeklapt. Bewaren vereist controle en bevestiging. Een bestaand e-mailadres kan een klant hergebruiken; bestaande klantvelden worden niet gewijzigd. Verschillende klanten met hetzelfde adres vragen een bewuste koppeling. Productprijzen en betalingen worden niet uit de mail ingevuld.

AI-voorstellen voor bestaande aanvragen tonen Nederlandse veldnamen en ontbrekende gegevens. Null/onbekend uit een AI-antwoord maakt al bekende aanvraagwaarden niet leeg. Mailanalyse voor een order gebruikt de geselecteerde ontvangen mail; eigen antwoorden worden niet als nieuwe klantspecificaties aangeboden.

## Calculatorvormen — correctie 16 oktober 2026

Deze afspraak vervangt de eerdere zes-vormkeuze en prominente X/Y-/hoekgatbediening. De gebruiker wil de volgorde van het referentievoorbeeld: **Vierkant, Rond, Mangat → passende uitvoering → maten**. Vierkant omvat rechthoekige delen; afronding is een extra optie. Mangat heet Mangat, niet Ovaal. DXF/STEP is een aparte importactie, geen vierde basisvormtegel.

Rond biedt Massief, Middengat en Midden + boutcirkel. Een regelmatige boutcirkel heeft één set instellingen: aantal, gatdiameter, steekcirkeldiameter of h.o.h naastliggende gaten. Er verschijnen standaard geen individuele X/Y-velden voor deze gaten. De bestaande exacte coördinaten blijven de interne bron voor geometrie, snijlengte en DXF; wisselen tussen PCD en h.o.h verandert uitsluitend de bediening. Herkenning van een bestaand regelmatig patroon verandert niets. Losse of onregelmatige gaten blijven intact en zijn bereikbaar onder Extra opties → Losse gaten op X/Y. De vier-hoekgaten-tegel is verwijderd uit de normale bediening. Buiten materiaal, raaklijnen en overlapping blijven geblokkeerd.

Vierkant/Mangat bieden Massief of Open midden met passende buiten-/binnenmaten. Bestaande andere contouren en binnenvormen blijven behouden. Een bewuste vervanging van aanwezige gaten vraagt bevestiging. Geavanceerde opties, bewerking, afronding, alternatieve binnenvorm, losse gaten en uitgebreide tekeninggegevens staan ingeklapt. Coördinaatvelden worden pas opgebouwd wanneer dat onderdeel wordt geopend.

### Correctie: dagelijkse invoer direct bereikbaar — 16 oktober 2026

Deze afspraak vervangt de eerdere gesloten stuk- en leverancierskaarten. Negen van de tien stukken zijn rechthoeken: naam, aantal, materiaal, dikte, lengte en breedte zijn zonder uitklappen invulbaar. Een nieuw stuk is massief en heeft geen gaten. Bestaande berekeningen worden niet leeggemaakt. De actuele vormmaten blijven ook bij ronde/CAD-stukken direct zichtbaar; andere vormen, uitvoeringen, boutcirkel, losse X/Y-gaten, afronding en technische details staan onder Andere vorm, gaten & extra opties. De vormtegels Vierkant/Rond/Mangat blijven daar beschikbaar.

Leveranciersnaam, kostprijsbasis, materiaalprijs per m² of plaat en de lengte/breedte van de plaat staan direct in beeld. Bewerkingsbedrag of -tijd blijft direct invulbaar. Snijlengteberekening, valuta en bijkomende kosten staan onder Extra opties; een actieve vreemde valuta is direct zichtbaar. Geen uitklapper met één download: DXF en SVG staan als rustige tekstknoppen onder de tekening. Plaatindeling & nesting staat helemaal onderaan, na de leveranciers, en begint dicht. Feedback en beheer blijven bij het bovenste Meer opties-menu. Prijs, marge, AI en opslaan blijven bovenaan.

In het lokale Maatwerkkunststof-CRM opent Rekentool openen nu V2 met de gekozen order- en product-ID. Bekende productgegevens gaan mee; bij één product vullen bekende aanvraaggegevens lege productvelden aan. Gegevens van verschillende producten worden niet gemengd. Een bewaarde berekening krijgt voorrang en wordt exact heropend. Laden schrijft niets in de order; prijzen overnemen blijft na controle/bevestiging. De originele V1 blijft bereikbaar als extra route. Online builds blijven V1 gebruiken zolang V2 niet gecontroleerd is vrijgegeven.


## Klanten als startpunt — 16 oktober 2026

Een klantdossier opent op Overzicht: maximaal drie lopende dossiers in de bestaande prioriteitsvolgorde, overige onder Meer lopende dossiers. Elke rij heeft één bestaande vervolgactie, met de aanleiding en ontbrekende gegevens erbij. Meer bij de rij geeft toegang tot het juiste mailgesprek, documenten, inkoop & marge en eventueel gekoppelde inkoop. Deze acties gebruiken dezelfde formulieren en controles als de werkvoorraad; weergeven registreert geen nieuwe taak, status, mail of betaling.

Nieuwe klantorder is de hoofdactie, met de juiste klant vooraf gekoppeld. Klant bewerken en archiveren staan bij Meer; ontbrekend e-mailadres kan direct worden aangevuld. Overige klantgegevens, adressen, alle orders, documenten en mail blijven via de bestaande tabs bereikbaar. Bestaande links naar Klantgegevens blijven geldig. Geen herhaalde grote financiële strook boven elk tabblad: contact en betalingen staan op Overzicht. Interne notities starten dicht.

Onbekende productprijzen, een lege aanvraag en onbekende verzendkosten maken het openstaande bedrag onvolledig. Bij nul bekend openstaand bedrag verschijnt Nog te bepalen; een reeds bekend deel wordt als voorlopig gemeld. €0 blijft geldig bij een expliciet vastgelegde nulprijs. Klantlijst en dossier gebruiken dezelfde projectie; bedragen worden niet opnieuw opgeslagen. Ontvangen betalingen blijven exact zoals geregistreerd.

Bij orderproducten blijft Ontwerp/Kostprijs openen de directe actie. Berekening koppelen, afbeelding beheren en eerdere prijzen vergelijken staan onder Meer bij dat product. Op het algemene Overzicht staat Nieuwe klant onder Meer; Nieuwe klantorder en AI blijven direct bereikbaar.

In het orderdossier blijft Volgende stap de zichtbare route. De aanvullende bestaande voortgangsactie staat direct bij Voortgang registreren; Factuur mailen blijft bij Meer in de orderkop. Productprijs onbekend toont ook bij ordertotaal/openstaand/marge Nog te bepalen; bekende deelbedragen met onbekende verzending blijven herkenbaar voorlopig. De rekenregels en registraties veranderen hierdoor niet.


## Mail en taken: prioriteit en wachttijd — 16 oktober 2026

De mailbox toont één korte regel per gesprek: Antwoord nodig, Wacht op reactie of Verzending controleren, met de verstreken uren/dagen. Hoog verschijnt bij minstens drie dagen onbeantwoord en bij een onzeker/afgewezen resultaat. Een nieuwe ontvangen mail binnen een nog onbeantwoorde reeks zet de teller niet terug: de eerste onbeantwoorde mail telt. Een concept of leesstatus is geen antwoord. Alleen een echte Gmail-verzending of een CRM-verzending met geaccepteerd resultaat en verzenddatum stopt die wachttijd; SMTP-aanbod blijft geen aflevergarantie. Zonder geldige datums staat Wachttijd onbekend.

Aandacht eerst is de standaardvolgorde. Weergave → Aandacht nodig filtert de geladen gesprekken, inclusief een bereikte opvolgtermijn. Sorteren op Nieuwste eerst staat bij Meer. Dit bewaart of wijzigt niets in Gmail. Wachttijden volgen de geladen/bewaarde mail, geen claim dat de volledige mailbox is gecontroleerd. Een volledig geopend gesprek kan het beeld uit een lijstfragment corrigeren. Afzender/onderwerp/datum in de lijst volgen echte berichten; een recente conceptbewerking laat een oude aanvraag niet nieuw lijken.

Filteren en sorteren verversen alleen de lijst: je antwoord blijft in hetzelfde formulier. Een actief gesprek buiten het gekozen filter blijft hervatbaar met zijn eigen tekst. Antwoord nodig en Concept kunnen tegelijk voorkomen. De bekende fout-, preview-, concept-, bijlage- en aparte verzendcontroles blijven bestaan.

Te doen gebruikt dezelfde mailprojectie bij bestaande ordertaken: zichtbaar Hoog/Normaal, wachttijd en één actie. Hoge prioriteit eerst; deadlines, verzending controleren en betalingen behouden hun onderlinge werkvolgorde. Een verse reactie is normaal zolang de mailwachttijd onder drie dagen blijft; oude aanvragen blijven ook zonder mail een prioriteit vanaf drie dagen. Bij geen mail zie je uitdrukkelijk dagen sinds aanvraag. Maximaal zes taken direct zichtbaar, overige onder Meer taken. Uitleg over prioriteit en overige lopende dossiers start dicht. Dit is een projectie van dossiers, geen nieuwe takenadministratie.


## AI-kopieerhulp en vindbare mailinstellingen — 16 oktober 2026

Het calculator-AI-venster heeft twee vlakken: zichtbare prompt met opvallende Prompt kopiëren en daaronder Plak hier het antwoord van ChatGPT met Antwoord controleren. Geen aparte middenstap met uitleg om in ChatGPT te werken. Elke geslaagde kopieerklik geeft opnieuw zichtbare feedback; een mislukking laat handmatig kopiëren of opnieuw proberen toe. Draft, controle en expliciet overnemen blijven behouden.

Een actie-uitklapper met slechts één keuze is geen doel: Klanten toont AI prompt direct, dashboard toont Nieuwe klant direct, en in de al geopende extra vormopties staat bij nul losse gaten de toevoegknop direct. Uitklapbare inhoud zoals een formulier of log is iets anders dan een menu met één actie.

Gmail-inbox en uitgaande-mailinstellingen zijn rechtstreeks bereikbaar via de eerste tabbladen van Instellingen. De mailbox linkt rechtstreeks naar Gmail instellen. Cloud en lokaal gebruiken dezelfde bediening, met begrijpelijke verschillen tussen Web-app en Desktop-client. Alleen werkelijk beschikbare serverroutes activeren providerbediening. De geïntegreerde ChatGPT-assistent blijft lokaal zolang een online aanmeldroute niet is ingericht; handmatige AI-prompts/export blijven online bruikbaar.


### Geen actiemenu met één keuze

Dit geldt voor alle schermen, inclusief Documenten: Uploaden en Als nieuwe template bewaren zijn directe secundaire knoppen. Gespreksopties verschijnt alleen als er meerdere acties zijn; bij alleen CRM-kopie verwijderen staat die actie direct, bij nul acties verschijnt geen leeg menu. Uitklapbare inhoud/formulieren mogen bestaan; deze afspraak gaat over een extra klik om één losse actie te bereiken.

Bij de ordercalculator met één product staat Originele calculator (V1) openen direct. Alleen bij meerdere producten blijft de productkeuze gegroepeerd.


## Documenten aanpassen — 17 oktober 2026

Aanpassen staat direct op de actuele offerte, orderbevestiging, proforma en pakbon wanneer de bewaarde documentinhoud beschikbaar is. Heropen de oorspronkelijke inhoud en bedragen, behoud het nummer en maak een nieuwe revisie. PDF en Word blijven samen; de vorige versie staat onder Eerdere versies. Bestaande mails/betaallinks blijven hun oorspronkelijke bestand gebruiken. Huidige orderproducten en bedragen worden alleen met een expliciete keuze geladen. Facturen en losse uploads worden niet op deze manier herschreven. Bij Maatwerkkunststof zijn dezelfde documentsoorten ingericht met eigen naam/website en dezelfde opmaak; de online converter moet met het eigen bedrijfstoken zijn verbonden. Wijzigen van het document is geen wijziging van orderprijs, betaling of verzending.

## Eén zoekingang voor het CRM — 17 oktober 2026

Zoek klant, order, nummer of pagina staat bovenaan elke CRM-pagina; ook bereikbaar via ⌘/Ctrl K. Eén venster toont resultaten met type, dossier, reden van de match en bestemming. Exacte nummers krijgen voorrang, meerdere woorden mogen over velden verdeeld zijn en een typefout levert herkenbare suggesties. Nummers worden niet met typefouten geraden. Filters zijn echte resultaatsoorten. Pijltjes/Enter/Escape werken; snel typen of filteren mag geen oude resultaten terugbrengen. Meer resultaten toont de volgende reeks.

Een documentresultaat opent en markeert het juiste document in het dossier. Mail opent het bewaarde gesprek/bericht; een zoekklik haalt niets bij Gmail op. Telefoon/klantnummer opent de klant, ordernummer opent de order, betaalreferentie opent Betalingen en een paginanaam opent die pagina. Openstaande bewerkingen blokkeren doorklikken met uitleg, zonder invoer weg te gooien. Zoeken bewaart geen queries en gebruikt geen AI of provider. De bedrijfsdatabase blijft de grens. PDF-inhoud, geheime instellingen en niet opgehaalde Gmail-mail worden niet geïndexeerd.

## Betaling, dossier en vervolgstap

Na een opgeslagen betaling worden dezelfde afgeleide controles opnieuw getoond in dashboard en order. Eén hoofdactie: factuur maken als er geen PDF is, anders factuur mailen; daarna ontbrekende gegevens, ontwerp/akkoord, orderbevestiging en inkoop. De overige hiaten staan kort bij de taak. Een gekoppelde verzameling is pas besteld wanneer dat werkelijk is geregistreerd. Lokale productie krijgt geen leverancierstaak. Ontvangen geld is geen bewijs dat ontwerp, verzending of productie klaar zijn. De betalingsstap toont ✓ bij volledige bekende betaling, zonder ontbrekende eerdere stappen af te vinken.

Onbekende prijzen tonen ook op dashboard en Betalingen Nog te bepalen/voorlopig, zonder onterechte voldaan-datum, overbetaling of betalingspercentage. Een percentage in Betaling registreren berekent alleen een paars voorbereidingsbedrag; gewone bevestiging blijft vereist. Contactgegevens en factuurmail zijn direct bereikbaar bij Adres & levering via het bestaande klantformulier. Geen parallel contactrecord op de order.

## Documentmail bij een gesprek

Bij precies één passend bewaard gesprek voor order en ontvanger wordt antwoordcontext voorgesteld. Bij meerdere kies je bewust bij Gesprek. Nieuw bericht is altijd een echte keuze. Gesprekkeuze neemt het onderwerp over en bewaart tekst/bijlage. Een gewijzigde ontvanger of ander onderwerp verbreekt de voorgestelde antwoordcontext. Preview toont waarop je antwoordt; verzending blijft apart. De SMTP-route zet antwoordheaders; daadwerkelijke Gmail-groepering vereist nog een echte, door de gebruiker uitgevoerde proef. Bestaande Gmail-gesprekken worden niet samengevoegd of gewijzigd.


## Website & aanvragen — 17 oktober 2026

Analytics behoudt de financiële kaarten. Website & aanvragen is een eigen rustig vlak met vier kerncijfers, een eigen meetperiode en twee duidelijke routes: bezoek → aanvraag en aanvraag → huidige CRM-status. Diagnosevelden, vaste feedbackredenen en bron-/apparaat-/contactcijfers staan achter inhoudelijke uitklappers, geen menu met één actie. Fouten/ongeconfigureerd tonen ontbrekende gegevens, geen nul bezoekers. Oude async antwoorden mogen een nieuwere meetperiode niet overschrijven. Maat toont geen Spatlappen-metingen.

Website-metingen vragen een gelijkwaardige keuze; het formulier blijft zonder toestemming werken. Afhaken alleen bewijst geen reden. Een contactklik is geen lead, een door de maildienst geaccepteerde aanvraag geen afgeleverde mail, een offerte geen betaalde order. De nieuwe websitebron en ontbrekende live-aansluiting staan in WEBSITE-METINGEN.md. Geen nieuwe drukke dashboardstrook of automatische provider-/CRM-mutatie door het bekijken van metingen.

## Zoeken blijft staan; offline werk is herkenbaar — 17 oktober 2026

Het zoekvenster heeft een vaste responsieve hoogte. Tijdens de korte zoekvertraging blijft de huidige lijst staan; geen lege-tussenstap of verspringen. Oude resultaten worden tijdens die vertraging niet geopend; pijltjes/Enter verwerken eerst de nieuwste invoer. IME-invoer wordt pas na afronden doorzocht. Alleen de resultatenlijst scrolt, ook bij nul resultaten.

Offline werken is één directe link bij de opslaginformatie. De aparte rustige werkplek bewaart alleen klantgegevens, nieuwe basisorders en bestaande ordernotities. De gebruiker maakt die met internet beschikbaar en ziet expliciet wat lokaal en nog niet online staat. Synchroniseren is één bewuste actie, met veldkeuzes bij een conflict. Geen mail-, betaal-, document- of providerbediening in de offline werkplek. Geen automatisch weggooien of vervangen van onbewaarde invoer. Lees OFFLINE-WERKEN.md voor grenzen en toegangstermijn.

## Nieuwe wensen eerst ordenen — 17 oktober 2026

De nieuwste offlinewens is dezelfde CRM-opmaak en previewtool zonder internet, niet de eerder gebouwde afzonderlijke compacte werkplek. Die bestaande route blijft intact terwijl haalbaarheid van PWA en synchronisatie wordt beoordeeld. Geen dure native desktopvariant automatisch bouwen. Favicon felpaars als herkenning voor CRM, geen nieuw publiek websiteontwerp.

Werkvoorraad rond binnenkomende batches moet alleen belangrijke hiaten tonen. Optionele factuurmail is niet standaard een blocker. Aankomstmails beginnen als expliciet gecontroleerde concepten; geen verzenddag of kosten invullen die niet afgesproken zijn. De ontwikkelplankaarten tonen nu omvang/status, zodat lokaal werk in bewerking niet als live functionaliteit wordt gepresenteerd.

## Gepland: ontwerpvarianten bij één product — 17 oktober 2026

Bij dezelfde productregel en maat kunnen meerdere ontwerpvoorstellen horen, bijvoorbeeld Ontwerp A en B. Toon naam en klein voorbeeld bij elkaar, met één actie om een variant toe te voegen en bewerking bij de gekozen variant. Na klantkeuze krijgt één variant het label Definitief. De andere voorstellen blijven terug te vinden. Geen aparte orderregels, extra aantallen of dubbele kosten voor een alternatief ontwerp. Variantspecifieke bediening verschijnt pas als er varianten zijn; geen extra menu met maar één actie.

Dit is een geplande uitbreiding, nog niet gebouwd. De huidige opslag heeft één bewerkbaar ontwerp per product. Een alternatief is iets anders dan revisiegeschiedenis: wijzigen van variant A mag variant B niet overschrijven. Een wijziging aan een definitief ontwerp vraagt opnieuw bewuste bevestiging; bestaande goedgekeurde beelden en historische documenten blijven intact.

## Offline-modus om feedback te geven — 17 oktober 2026

Eén knop onderaan de CRM-zijbalk zet een leesbare kopie klaar en opent dezelfde CRM-opmaak met een compacte paarse statusstrook. Feedback is de enige nieuwe schrijfroute; meldingen tonen Nog niet online, concepten tonen pas bewaard na voltooide lokale opslag. Terug online & feedback overzetten opent de bestaande Feedback-pagina met een expliciete overzetknop. Dossierwijzigingen blijven geblokkeerd in deze modus, ook als er internet terugkomt. De oudere compacte klantinvoerroute blijft apart behouden. Geen algemene claim dat bestanden, ontwerpen of alle functies offline werken.


## Kleine concrete verbeteringen — 17 oktober 2026

Het CRM en de login krijgen per bedrijfsprofiel een eigen felpaars SVG-tabbladicoon. De gewone bedrijfswebsite blijft buiten deze wijziging. Gmail-instelhulp benoemt expliciet dat beide versies in een browser werken: Desktop-client voor lokaal, een aparte Web-app-client voor online. De bestaande callback-kopieeractie blijft direct bereikbaar. Een hulpscherm is geen bewijs van een verbonden account.

Nieuwe aanvragen mogen zonder verkoopprijs, inkoop, akkoord of levertijd worden opgeslagen. De datum heet Aanvraagdatum. Lege levertijden krijgen geen stil ingevulde toezegging. Bestaande afspraken blijven bewaard. Bij Spatlappen kan een open verzamelbestelling voor nieuwe aanvragen voorgesteld worden; bij meerdere open batches alleen na expliciete voorkeurskeuze. De koppeling is zichtbaar en kan geweigerd worden. Bestaande orders verplaatsen niet mee. Een intussen vertrokken voorgestelde batch wordt bij opslaan geweigerd.

Spatlappen-productregels hebben optionele, gesloten Uitvoering-velden voor gaten en oppervlak. Alleen expliciet bevestigde keuzes komen als voorstel in nieuwe klantdocumenten; onbekend is geen bevestiging van Geen gaten of Glad. Interne opmerkingen worden niet naar klantdocumenten gekopieerd. Historische PDF's en documentrevisies blijven hun oorspronkelijke inhoud houden.

Een teststuk heeft een optionele markering, opvolgdatum en Klaar-keuze. De order toont bekende werkelijke kosten met uitleg bij ontbrekende bedragen; expliciet €0 blijft een echte waarde. Een vervallen/ontbrekende opvolgdatum verschijnt in de bestaande werkvoorraad, ook na levering; een afgehandelde of gearchiveerde proef krijgt geen nieuwe herinnering. Geen automatische mail, verkoopprijs of productiestatus. Prijshistorie/leveranciersschattingen moeten deze markering later expliciet meenemen.

Bedrag- en andere decimale CRM-velden accepteren komma of punt en tonen na verlaten van het veld een komma. Gehele aantallen blijven gehele aantallen. Te veel decimalen, exponenten en duizendtalsnotatie geven een invoerfout; geen stil afronden. De bestaande opslag in centen en betekenis van onbekend versus nul blijven behouden. De beschermde V1-calculator is niet omgebouwd.

## Lokale Analytics zonder meetkoppeling — 17 oktober 2026

Bij Spatlappen blijft Aanvragen lokale CRM-aanvragen op aanvraagdatum tonen als de website-meetdienst ontbreekt of niet bereikbaar is. Deze telling krijgt een eigen bronuitleg; geen websitebezoeken of conversiepercentages verzinnen. Een foutmelding en opnieuw proberen blijven bereikbaar. Maatwerkkunststof toont voorlopig alleen Financiën; Spatlappen-tabbladen verschijnen daar ook niet via een directe hashroute.

## Naderende levering: alleen beslissende hiaten — 17 oktober 2026

Bij Spatlappen onderweg of binnen in Nederland gebruiken Te doen, het klantoverzicht en Volgende stap dezelfde levercontrole. De leverwijze wordt expliciet afgesproken onder Adres & levering: nog afspreken, afhalen, verzenden of bezorgen. Geen afleiding uit verzendkosten of documenttekst. Afhalen vereist geen afleveradres. Verzenden/bezorgen gebruikt het eigen orderadres als dat bestaat, anders het klantadres; een leeg eigen adres valt niet stil terug op een ander adres. Ontvanger, land, bereikbaar klantcontact, bekende productkostprijs, verzendprijs en een bekend betalingsrestant zijn relevante hiaten. Factuurmail is geen algemene leverblokkade. Expliciete nulkosten zijn bekend. De levercontrole wijzigt geen status of geldbedrag en registreert geen verzending. Bij afwezigheid van hiaten blijft de order bij de overige lopende dossiers. Verstreken leverplanning en onzeker mailverzendresultaat houden hun prioriteit.


## Bouwtaken voor Philippe en AI-bouwers — 17 oktober 2026

Beheer → Bouwtaken vervangt het alleen-lezen Ontwikkelplan op dezelfde route. Eén rustige lijst met Open/Afgerond/Alles, zoeken en een titel per taak. Het rondje/vinkje bereidt afronden/heropenen voor; de titel opent dezelfde taak met opdracht, klaarcriteria en bestaand bouwlog. Status, publicatie en een nieuwe opmerking worden pas bij Opslaan vastgelegd. Bouwernaam verplicht, bij afronden een resultaat of controlebewijs. Afgerond betekent geen publicatie; Niet vastgelegd/Alleen lokaal/Live staan apart.

Bestaande opmerkingen blijven leesbaar; aanvullingen krijgen naam/datum. Opslagfouten behouden formulierinvoer. Een statusconflict vraagt eerst de actuele taak te lezen; gewone opmerkingen mogen toevoegen zonder nieuwere status terug te zetten. Alleen de lijst/counters verversen bij zoeken/filteren, niet het zoekveld. Kopieer voor AI en Download bouwlog zijn directe knoppen. De taakcatalogus blijft broncode; voortgang staat apart per CRM-bedrijf en omgeving, zonder klant/order te wijzigen. Offline-review toont geen actuele log of schrijfroute. Zie BOUWTAKEN.md.

## HTML-handtekening — 17 oktober 2026

E-mailinstellingen bieden direct HTML uploaden met voorbeeld en gewone tekstfallback. HTML-bron is ingeklapt; verwijderen is een directe secundaire knop bij actieve HTML. Upload blijft onopgeslagen tot Instellingen opslaan. Een lopende bestandslezing mag intussen gewijzigde invoer niet overschrijven. Het verzendvoorbeeld toont de echte HTML-opbouw in een geïsoleerd frame; gewone mailtekst blijft tekst en wordt niet als willekeurige HTML uitgevoerd. De bestaande expliciete verzendstap blijft verplicht.

## Lokale werkronde 18 oktober 2026

**Batch:** Zending bewerken blijft direct; AI en archiveren staan samen bij Meer. Vertrokken/aangekomen batches vragen een bewuste afwijkingskeuze bij nieuwe koppeling, ook via orderbewerking, batchbewerking en AI-import. Archiveren controleert de werkelijke gekoppelde leveringen. Een gearchiveerde order is geen leverbewijs. Archief verwijdert geen kosten, ontvangsten, voorraad of bestanden. Documenten kunnen een transport-/leveranciers-/betaalbewijs-/douanelabel krijgen zonder een betaling of status te registreren.

**Aankomst en pakbon:** Bij werkelijk ontvangen orders opent Aankomstmail voorbereiden alleen een passend concept. Restant, ontbrekende leverwijze, bekende adresafspraak en onbekende bedragen blijven verschillend; geen verzenddag beloven. Pakbonnen voorbereiden toont geschiktheid per order, linkt een bestaande pakbon en vraagt anders om expliciete documentcontrole. Ontbrekende levergegevens tijdens uitvoering verschijnen in Te doen. Deze eerdere basis is op 19 oktober uitgebreid met gecontroleerde bulk-PDF hieronder; geen stille regeneratie.

**Financiële controle:** Batchscenario’s gebruiken de bestaande geldprojectie, inclusief archief en bekende nog niet toegewezen batchkosten. Freight wordt in een scenario vervangen, niet opgeteld. Routevergelijking gebruikt gekozen, bruikbare opgeslagen leveradressen en eigen totale kilometers/tijd/tarieven; geen automatische optimalisatie of externe adresuitwisseling. Scenario’s bewaren niets. Eigen grafiek biedt begrensde dimensies en eenheden; klik opent exact de betreffende dossiers inclusief onvolledige aanvragen. Onbekende bedragen mogen niet als definitieve nul of overbetaling verschijnen.

**Betaalcorrectie:** Corrigeren opent een uitgebreide controle met reden en expliciete bevestiging. Gewone ontvangsten kunnen worden aangepast; providerbedragen worden niet handmatig herschreven. Uit saldo halen bewaart de oorspronkelijke ontvangst in een correctielog. Herstellen is een afzonderlijke bevestigde actie. Historische facturen en echte bank-/Tikkiebetalingen blijven buiten deze wijziging. Verwijderde Tikkie-ontvangsten mogen niet via een volgende import terugkomen.

**Vrijgave:** Vanaf de voorgestelde 50% kan een geschikte Spatlappen-order ter controle verschijnen. Prijs/verzending, werkelijk ontvangen bedrag, productspecificaties en ontwerpgoedkeuring blijven voorwaarden. De gebruiker bevestigt de afspraak per order. Productie vrijgegeven is een afzonderlijke fase; fysieke start wordt later apart geregistreerd. Wijzigingen aan ontvangsten of voorwaarden vragen opnieuw aandacht. Een teststuk met expliciet nulverkoop heeft een eigen route, geen fictieve betaling.

**Nummers en afbeeldingen:** Nummering staat direct bij de klantlijst. Start en minimumcijfers gelden voor nieuwe nummers, niet voor bestaande dossiers; eerder gebruikte tellerstanden worden niet hergebruikt. Individueel klantnummer staat bij Klantgegevens. Als eerste tonen kiest een productafbeelding onafhankelijk van goedkeuring. Een ontwerpupdate houdt de gekozen pointer geldig; verwijderen gebruikt de bestaande bewuste verwijderroute.

**Extra kosten en factuurvermelding:** Benoemde extra kosten krijgen naam, bedrag en hele-order/product/batchscope. Ze komen éénmaal in de bestaande interne kostprijs; de vaste kostensoorten blijven apart en onbekend blijft onbekend. Bij een nieuw factuurdocument kiest de gebruiker expliciet welke ontvangsten in de toelichting staan. Deze keuze wijzigt geen verkoopregels, btw, ordersaldo of bestaande documenten. De werkelijke betaalstatus blijft gebaseerd op alle echte ontvangsten. Selectie blijft bij invulhulp bewaard; een nieuw voorbeeld blijft noodzakelijk.

## Tijdelijke prijsindicatie Spatlappen — correctie 18 oktober 2026

Taak 15 gebruikt nu lokaal bestaande positieve Erturk-inkoop voor een tijdelijke indicatie op maat/aantal/drukkleuren. Alleen Erturk-bronnen boven nul; gekoppelde echte factuurregels per fysieke spatlap met handmatige productinkoop als terugval, geen dubbeltelling. Vergelijkbare prijzen en aantal voorbeelden zichtbaar; onbekende maten/kleuren of geen passende historie geven geen nulschatting. Nieuwe opgeslagen inkoop doet automatisch mee zonder trainingsdatabase. Alleen expliciet gekozen verkoopprijs wordt overgenomen. Niet gepubliceerd en niet zelfstandig getest. Zie TIJDELIJKE-PRIJSHULP.md. De geschatte inkoop dient uitsluitend als tijdelijke persoonlijke hulp om een verkoopprijs te bepalen. Zodra Philippe de verkoopprijs vastlegt, verdwijnt de indicatie. Bewaar haar niet in klant/order/product/batch, calculatorhistorie, logs, documenten, exports of back-ups; neem haar niet op in werkelijke kostprijs, marge of analytics. Alleen de gekozen verkoopprijs wordt via de gewone prijsroute opgeslagen. Werkelijk ontvangen leveranciersprijzen en bestaande Maatwerkkunststof-berekeningen blijven afzonderlijke gegevens met hun bestaande betekenis. Geen bestaande echte kosten verwijderen.

## Ontwerptoolwensen 18 oktober 2026

Bouwtaken35–41 leggen feedback, formaatknoppen, kader-/groepsselectie, rode hulplijnen/snappen, zichtbare vectorgrenzen, gelijke witruimte en slimme import/plaatsingsvoorkeuren vast. Zie SPATLAP-ONTWERP-UX.md voor samenhangende bediening, referenties en grenzen. Alles eerst lokaal; plaatsingsleren is nog geen actieve gegevensverzameling.

## Eerste uitvoering — 18 oktober 2026

Lokaal gebouwd: feedback met bestaande bedrijfsopslag; 10%-formaatknoppen; kader-/groepsselectie en samen verplaatsen; rode tijdelijke snaplijnen met onafhankelijke toggles/Alt; expliciete plaatsingsreferentie en gelijke witruimte; passende nieuwe import onderaan. SVG-grenzen via gerenderde alpha tot2048pixels, conservatieve pixelmarge; geometrie blijft vector. Nieuwe SVG’s bijgesneden, bestaande alleen via expliciete actie met behoud fysieke tekening. Geen achtergrondmeting/verzameling voor leren.

Open: uitgebreide verdeelacties voor meerdere objecten, precieze cm-bediening verder vereenvoudigen, bijzondere SVG’s/masks/filters en extreem kleine details testen, plaatsingsvoorkeuren/leren. Extra imports verspringen maar er is nog geen overlapoplosser. Bestaande artwork/PDF-routes behouden; geen nieuwe druk-PDF fysiek geproduceerd.

Bron: shared/spatlap-layout.js pure geometrie (klassiek script voor preview), spatlap-preview.html DOM/bediening. admin/feedback.js optionele launcherHost/contextOverride; CRM-defaults gelijk. Nieuwe regressie tests/spatlap-layout.mjs inclusief inline-syntax; bestaande feedbacktest en volledige npmruncheck/beidebuilds geslaagd. Laatste kleine CSS/feedback-picker-/Escape-/links-rechtsaanpassingen daarna gericht gecontroleerd met syntax/geometrie/feedbacktest en beide builds.

## Headercorrectie 18 oktober 2026

Ontwerptooltitel en apart blok Live voorvertoning verwijderd. PDF/feedback en Hulplijnen/Snappen staan bij Bewaar/Download in de header. Selectie-/sneltoetsuitleg onder het vraagteken; Alt houdt snappen tijdelijk uit, Spatie+slepen pant de preview. Mobiele header krijgt drie compacte rijen en bijpassende offset voor de vaste preview.

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

## Ontwerp meenemen — 18 oktober 2026

Gesloten onderdeel onderaan voor complete tekst-/bestandskopie met ingesloten logo’s. Herstelknop in actieve melding bereikbaar buiten geblokkeerde werkgebied. Native systeemklembord voor geselecteerde complete onderdelen tussen tabs; tekstvelden behouden eigen bediening. Geen automatische klant/orderkoppeling of opslag. Contract en grenzen: docs/ONTWERP-OVERZETTEN.md. Gebruiker test zelf.

## Aanvraagcontrole bij meerdere Spatlappen-producten — 19 oktober 2026

Aantal, breedte, hoogte en bedrukking worden per product gecontroleerd. Verschillende bekende maten zijn geen ontbrekende gegevens of onderling conflict. De compacte checklist toont gedeelde waarden of Ingevuld per product; bij gedeeltelijke invoer het aantal complete productregels. Het controlevenster toont de waarden per product en verwijst voor wijzigingen naar Productregels bewerken; één algemeen maatveld mag niet meerdere producten overschrijven. Niet nodig blijft een expliciete bestaande keuze voor de aanvraag. Drukkleuren worden niet afgeleid uit een voorbeeldafbeelding. Lokaal aangepast; geen tests of publicatie.

## Geen navigatie met horizontale muisswipe — 19 oktober 2026

In beide CRM-profielen staat horizontale overscroll op html/body uit. Daarmee wordt de browserhandeling terug/vooruit via horizontaal swipen onderdrukt in browsers die overscroll-behavior ondersteunen. Gewoon verticaal scrollen, horizontaal scrollbare tabellen, tekstselectie en slepen blijven beschikbaar. Geen algemene blokkade van muis-/wielgebeurtenissen. Alleen lokaal aangepast, niet getest of gepubliceerd.

## Pakbonnen van een gezamenlijke Turkije-bestelling — 19 oktober 2026

Inkoop → bestelling → Pakbonnen is een eigen tabblad. De hoofdactie Alle pakbonnen downloaden… opent altijd eerst een controlevenster; geen onmiddellijke download. De pagina zelf toont al welke orders belangrijke gegevens missen. Relevante actieve leveranciersorders staan standaard aan; orders en afzonderlijke bewaarde pakbonnen zijn uit te vinken. Gearchiveerde/verzonden/afgehandelde orders en puur lokale productie staan buiten de selectie.

Ontbrekende leverwijze, adres/contact, maten/drukkleuren en de bestaande inkomende-leveringscontrole (o.a. prijs/betaling/kosten) worden benoemd. Waarschuwingen vragen één expliciete bevestiging om toch door te gaan, opnieuw bij gewijzigde selectie. Ontbrekende adresvelden krijgen op een nieuwe pakbon NIET INGEVULD en een waarschuwing voor verzending; niets gokken. Ongeldige aantallen/omschrijvingen of een verdwenen klant moeten eerst hersteld worden. Afhalen krijgt expliciet Afhalen / Geen verzendadres.

Nieuwe pakbonnen nemen alleen leveranciersproducten met het volledige bestelde aantal over na aparte bevestiging dat die volledig meegeleverd worden. Bij deellevering eerst een afzonderlijke pakbon maken. Bestaande PDF’s worden exact gebruikt; nieuwste revisie per reeks, verschillende leveringsreeksen afzonderlijk zichtbaar/selecteerbaar, waarschuwing bij meerdere pakbonnen of verschillen met huidige gegevens. Geen automatische herschrijving van een bestaande pakbon.

Eén gecombineerde PDF voor samen afdrukken, met voortgang en herhaalbare downloadknop. Nieuwe documenten worden eerst allemaal gemaakt en samengevoegd en daarna samen met nummerreeks en PDF+Word in één bestaande opslagtransactie bewaard. Wijzigingen in bronnen of nummers vragen nieuwe controle. Geen leverdatum, voorraad, betaling, orderfase of mailactie door downloaden. Alleen lokaal gebouwd; Philippe test, niet gepubliceerd. Zie PAKBONNEN-PER-BESTELLING.md.

## Tabbladen en gedeelde kleuren — 19 oktober 2026

Lange pagina’s opdelen naar duidelijke werkzaamheden, in dezelfde stijl als order/klant/inkoop/analytics. Instellingen: Gmail, Verzenden & handtekening, Mailtemplates, Voorkeuren, Back-up & herstel en Archief. Overzicht: Te doen, Lopende orders en Activiteiten, met de bestaande samenvattingscijfers erboven. Geen extra volledige kaartenlijsten onder elkaar. Analytics behoudt bestaande indeling.

Binnen deze twee pagina’s wisselen tabbladen alleen zichtbaarheid en URL (#settings/gmail, #settings/sending enz.; #dashboard/tasks, /orders, /activity). De bestaande formulieren blijven in dezelfde DOM staan, met hun invoer, bestandslees-/bewaarstatus en handlers. Terug/vooruit, directe link en pijltjestoetsen/Home/End volgen dezelfde indeling. Een template-/archiefactie mag een onopgeslagen of bezig mailformulier in een andere instellingentab niet vervangen. Geen instellingen activeren of opslaan door een tab te kiezen.

Alle hoofd-CRM-opmaak in admin/style.css, inclusief de voormalige workspace/search/analytics-regels. Oude CSS-URLs blijven als lege compatibiliteitsbestanden behouden. Geen extra stylesheet, styleblok of inline kleur voor gewone CRM-opmaak toevoegen. Hergebruik kleurvariabelen en de bestaande tab-/knopklassen. Gedempte tekst blijft donker genoeg om op lichte vlakken te lezen; statuskleuren zijn donker op licht. Geef hover/focus/selected altijd passende tekst én achtergrond: primaire knoppen wit op blauw, gewone knoppen donker op licht en de zijbalk licht op donker. Uitgeschakelde knoppen krijgen een expliciet grijs/donker paar in plaats van alles halftransparant. Bedrijfstool/calculator en de bewuste HTML-mailhandtekening behouden hun eigen afgebakende opmaak.

Alleen lokaal aangepast; geen tests, contrastmetingen, builds of browser-QA volgens afspraak. Geen publicatie of runtime-bouwlogwijziging.

## Gepland Conversie-tabblad — 19 oktober 2026

Klant/order krijgt later een eigen Conversie-tab met aantoonbare aanvraagherkomst en gemeten sessies/tijd tot aanvraag, plus afzonderlijke echte verkoop-/betaalgegevens. Dit is nog niet gebouwd. Onbekend blijft zichtbaar onbekend; 'minstens N gemeten sessies sinds datum' als eerdere bezoeken niet waargenomen zijn. Cookiekeuzes als aantallen keuzes, unieke toestemmende browsers niet mensen. Niet via klantnaam/email raden welke anonieme bezoeker het was. Geen nieuwe tegels overal: hoofdcijfers in Analytics, concrete bron-/tijdlijngegevens bij het dossier. Zie WEBSITE-CONVERSIEMETING.md.

## Website-cookiekaart — correctie 19 oktober 2026

Publieke website (aparte bron, geen CRMstijl) krijgt compact kaartje midden onderaan in plaats van volle breedte. Vergelijkbare technieken uit de korte tekst, Accepteren bestaande websitegroen, Weigeren rustige omlijnde secundaire knop die leesbaar/direct bedienbaar blijft. Mobiel beide knoppen naast elkaar. Keuzelogica ongewijzigd. Alleen lokaal aangepast; niet getest of gepubliceerd.

## Google-rapportkoppeling — 19 oktober 2026

Het Google-serviceaccountformulier gebruikt dezelfde invoerbescherming als Gmail: een open bestandskiezer, gekozen bestand, gewijzigde velden en actieve bewaaractie verhinderen focus-/achtergrondverversing die het formulier vervangt. Er worden alleen bewerkingsflags bijgehouden; geen sleutelinhoud in browserdrafts. Bestandskeuze is nog geen opslag: toon geselecteerd, bezig, opgeslagen of niet opgeslagen expliciet. Bij fout blijven invoer en bestand behouden. Opgeslagen koppeling en geslaagd rapport zijn aparte uitkomsten: bij ontbrekende Google-leesrechten blijft de bewaarde sleutel geldig aanwezig. Propertyhulp noemt sc-domain:<domein>, geen volledige Search Console-scherm-URL. Alleen lokaal gewijzigd, niet getest/gepubliceerd.

## Formulierbescherming is algemeen — 19 oktober 2026

De CRM-shell installeert gedelegeerde bescherming voor bestaande en nieuwe formulieren. Invoerwijziging, open bestandskiezer en expliciete busy/inertstatus beschermen tegen achtergrond-/focusverversing. Dit verandert validatie of submitgedrag niet. Alleen flags, geen kopie van gevoelige invoer of credentials. Featurecode roept markFormClean pas na bevestigde opslag aan, of sluit/vervangt het formulier; een mislukte bewaaractie laat invoer staan. Reset wist flags alleen wanneer reset doorgaat. Handmatig herladen/tab sluiten valt hier niet onder.

GA4 gebruikt dezelfde koppeling/bewaaractie als Search Console; een bestaande serviceaccountsleutel hoeft niet opnieuw gekozen te worden. SMTP2GO en HTML-handtekening tonen lees-/bewaarstatus, blokkeren bewaren tijdens bestandslezen en beschermen tegen late initiële statusantwoorden. Niet opnieuw verzenden of koppelen als onderdeel van deze UI-aanpassing. Alleen lokaal gewijzigd, niet getest/gepubliceerd.

## Btw-afwijkingen terugvinden — 19 oktober 2026

Analytics krijgt voor beide bedrijven Btw-controle (#analytics/vat). Standaard alle afwijkende/onbekende tarieven, ook archief; filter Nog controleren en Alle tarieven. Periode expliciet op aanvraagdatum, geen aangiftetijdvak. Reden direct invullen met behoud van percentage en bedragen; actuele orderbedragen zijn geen fiscale aangifteomzet. Volledige kwartaalhulp blijft apart gepland.

Order-/AI-importformulier houdt 21% eenvoudig. Ander percentage opent verplichte redenkeuze met afzonderlijk 0% EU/uitvoer, verlegd, vrijgesteld, 9%, buitenlandse btw of eigen reden. Eigen korte reden expliciet bewaren voor hergebruik binnen hetzelfde bedrijf; toelichting blijft per order. Nederlandse komma/punt-invoer gebruikt bestaande decimalNumber/FormData-normalisatie. Bestaande orders zonder reden krijgen een controlepunt, geen automatische herschrijving. Reden intern en toekomstige documentmetadata als snapshot, geen automatische wettelijke factuurtekst. Lees BTW-CONTROLE.md voor grenzen. Alleen lokaal, niet getest/gepubliceerd.

## Kwartaalvoorbereiding btw — 19 oktober 2026

Analytics → Btw heeft vier taakgerichte tabs: Kwartaal voorbereiden, Bronnen & boekingen, Afwijkende btw en Inrichting. Gebruiker bevestigt aparte btw-administraties; geen bedrijfsprofielen mengen. Stelsel onbekend laten en instelbaar houden; geen gecontroleerde voorbereiding vóór dat is vastgesteld. Alleen bronboekingen tellen, niet actuele ordertotalen. Factuurvoorstellen gebruiken de bewaarde factuurinhoud; inkoop-/invoer-btw en uitzonderingen vereisen bewijs en expliciete rubriek/controle. Concept, gecontroleerd en uitgesloten hebben eigen betekenis.

Eén primaire kwartaalactie opent eerst volledigheids-/aansluitingsreview; open controles blokkeren bewaren. Concept-export onder Meer, bewaarde voorbereidingen met datum en melding bij latere bronwijziging. Een vaste kopie is geen ingediende aangifte. Wijzigen van gecontroleerde boeking vraagt reden en bewaart historie; algemeen Stap terug mag die historie niet uitwissen. Bronbestanden samen met boeking opslaan, laad-/foutfeedback behouden. Kopieën expliciet aan origineel koppelen, niet dubbel boeken of verwijderen om het overzicht passend te krijgen. Centrale bestaande stylesheet hergebruikt. Philippe bevestigt opnieuw: zelf testen, geen tests uitvoeren. Alleen lokaal; lees BTW-VOORBEREIDING.md.

## Eigen tests uitsluiten — 19 oktober 2026

In Analytics Websitegebruik en Aanvragen een gesloten onderdeel Eigen bezoeken & testaanvragen uitsluiten. Browserlink met omkeerbare lokale boolean; testadressen en exacte Aanvraag-ID’s met één bewaaractie, invoer behouden en conflicten melden. Geen automatische verwijdering van klant/orders/mails of financiële uitsluiting. Leg beperking onbekende historische bezoeken en nog niet geïmporteerde aanvragen bij de instelling uit. Website meldt actieve browseruitsluiting en biedt Weer meetellen. Alleen lokaal, niet getest/gepubliceerd.

## Mailwerkplek herzien — 19 oktober 2026

Gebruiker staat voor mail een eigen stylesheet toe: admin/mail/mail.css blijft afgebakend. Bovenaan reply/nieuw en Van/Aan/onderwerp, daarna tekst en bijlagen; templates/betaallinks/techniek onder extra opties. Snelle reactie heeft zichtbare afzender en bijlage-ingang. Nieuwe gewone mail neemt geen oude factuur/betaallink/concept over. Per-mailsoort afzenders instelbaar; gewone standaard niet overschrijven wegens toevallige laatste factuur. Bijlagen bekijken/downloaden en expliciet als E-mailbijlage onder Overige documenten bewaren. Eén HTML-handtekening met gewone tekst als alternatief; ontbrekende Gmail-cid-afbeelding vraagt los bestand. Factuur standaard alleen PDF; Word-vink optioneel. Websiteformuliermelding aan beheerder is geen door klant ontvangen origineel. Geen garantie over mailboxgroepering zonder gebruikerscontrole. Alleen lokaal, geen tests/build/publicatie; zie MAIL-HERZIENING.md.

## Afbeelding in HTML-handtekening — 19 oktober 2026

Upload van een logo vervangt standaard het bestaande geselecteerde img-vak. Bewaar plaats en breedte uit de HTML. Nieuwe afbeelding onderaan alleen expliciete keuze. Behoud veilige lege vakken voor cid/file/voorbeeldbronnen zodat een ontbrekend bestand op zijn oorspronkelijke plek kan worden ingevuld. Geen stille toevoeging na de handtekening; meld resterende ontbrekende bestanden vóór bewaren/verzenden. Eén compleet HTMLbestand met ingebedde afbeelding is ook te importeren. Alleen lokaal, niet getest/gepubliceerd.


## Aanvrager is niet automatisch het klantbedrijf — 19 oktober 2026

Een e-mailadres mag door meerdere personen worden gebruikt. Bij afwijkende naam/contact/telefoon toont iedere ordertab een rustige maar zichtbare controle. Vergelijk oorspronkelijke inzending met bestaande bedrijfsgegevens; laat bewust kiezen tussen behouden, aparte klant en extra contactpersoon bij dit bedrijf. Geen voorgeselecteerde beslissing en geen stil overschrijven. Na bewaren inklappen tot bevestiging met opnieuw bekijken. Extra contactpersonen staan bij Klantgegevens; primaire contact en factuurgegevens blijven apart. Bij nieuwe klant alleen betreffende order en bewaarde mail koppelen, eerdere documenten behouden en adrescontrole duidelijk noemen. Oudere bronnen alleen reconstrueren uit bewaarde aanvraag; ontbrekend heet Niet bewaard. Lokaal gebouwd, Philippe test zelf.


## Mail sorteren en filteren — 19 oktober 2026

Sorteren staat zichtbaar boven de lijst: Aandacht eerst, Nieuwste eerst, Oudste eerst. Bewaar laatste sorteerkeuze per bedrijf/browser. Weergave en zoeken blijven direct; aanvullende status-/koppel-/bijlage-/datumfilters onder Meer filters. Datum betreft laatste bericht, daggrenzen inclusief in browserdatum. Laat zien hoeveel gesprekken de selectie geeft en dat deze alleen geladen gegevens omvat. Gmail ophalen is een ophaalperiode, geen grens voor opgeslagen CRM-gesprekken. Zoekfilters vervangen nooit de geopende antwoordtekst; gesprek buiten selectie blijft met melding open. Alleen lokaal, gebruiker test zelf.


## Agent ook online vindbaar — 19 oktober 2026

Vaste Agent-knop desktop/mobiel en Cmd/Ctrl+O in beide versies. Lokale agent behoudt bestaande bediening. Online is de ingang zichtbaar met expliciete status Online agent nog niet gekoppeld; geen login-/microfoon-/verzendknoppen voor niet-bestaande serverroutes. Bestaande AI-export bereikbaar en een vraag handmatig kopiëren; geen automatische gegevensoverdracht, geen verwarring tussen lokale en centrale dossiers. Echte online agentdienst blijft apart vervolgwerk.

## Maatwerkkunststof: productgegevens — 20 oktober 2026

Materiaal en dikte staan direct in de gewone productregel en in het orderoverzicht. Drukkleuren blijven bij Spatlappen; bestaande waarden worden bij Maat niet verwijderd. Nieuwe kunststofregels beginnen met onbekende maten, niet met de oude Spatlappen-standaard 600 × 350 mm. Lege materiaal-/diktevelden mogen bij een eerste aanvraag blijven staan.

De aanvraagcontrole leest ook dikte, ronde vorm en diameters uit de productregel. Bij meerdere kunststofproducten worden aantal, materiaal, dikte, vorm en maten per product beoordeeld. Algemene aanvraagwaarden worden niet over verschillende productregels uitgesmeerd. Verschillen tussen een enkele productregel en de oorspronkelijke aanvraag blijven ter controle zichtbaar. Bij meerdere producten wordt de productgebonden invoer via Productregels bewerken gedaan; algemene oorspronkelijke aanvraaggegevens blijven bewaard.

De bestaande V1-offertekoppeling neemt nu materiaal en dikte mee bij de expliciete overname én terugstuuractie. De bevestiging vermeldt deze gegevens. Een gewijzigd materiaal of andere dikte maakt een berekende kostprijs ongeldig, net als andere maten/aantallen. Bij opslaan vervalt alleen de ongewijzigd oude berekende kostprijs; een bewust ingevulde nieuwe prijs blijft staan. Een leveranciersfactuur blijft leidend. De bronberekening wordt bewaard, en een afwijkende bewaarde orderberekening krijgt een melding in het productvak. Tijdens bewerken verschijnt de waarschuwing dichtbij de betrokken regel.

V1-toolbestanden zelf zijn niet gewijzigd. De oudere inline V1-route vult nog uitsluitend aantal en buitenmaten vooraf in; materiaal/dikte invullen gebeurt daar in de calculator. De lokale hoofdroute via V2 leest deze productvelden al. V2 blijft lokaal; deze wijziging is geen toestemming of vrijgave om V2 online te leveren. Geen tests of browser-QA uitgevoerd op gebruikersafspraak.

## Antwoordhulp bij het gesprek — 20 oktober 2026

Antwoordhulp staat ingeklapt bij het antwoordvak, met een opdracht in gewone taal en eigen denksessie per bedrijf/gesprek/dossier. Context & werkinstructies biedt exacte contextweergave, dossierkeuze, optionele interne notities en expliciet bewaarbare instructies. Nieuwe denksessie wist geen mailconcept. Alleen antwoordtekst overnemen; geen wijziging van afzender/ontvanger/onderwerp/headers/bijlagen. Verouderde context of gewijzigd concept blokkeert overnemen. Vragen aan de gebruiker en aandachtspunten staan apart van de klanttekst. Generatie toont bezig/stop/fout/klaar; niets wordt automatisch verstuurd of bewaard. Online directe agentdienst ontbreekt nog: handmatig context kopiëren/JSON terugplakken is als afzonderlijke route voorbereid. Zie ANTWOORDHULP.md voor grenzen en opslag. Lokaal, geen tests/publicatie.


## Analytics en AI-ingang per bedrijf — 20 oktober 2026

Analytics toont dezelfde tabbladen Financiën, Btw, Websitegebruik, Aanvragen en Google & SEO voor beide bedrijven. Een niet-ingerichte bron wordt uitgelegd op het tabblad, niet verborgen of als financiële tab geopend. Website-metingen vereisen de publieke website-instrumentatie en een eigen bedrijfsgebonden meetdatabase. Ontbrekende binding blijft onbekend, geen nulcijfers of overname van de andere onderneming. Bewaarde CRM-aanvragen blijven een afzonderlijke projectie op bestaande dossiers. Google & SEO geeft eigen Search Console-/optionele GA4-inrichting; een Google-login alleen activeert onze website-metingen niet.

De online Agent benoemt expliciet dat directe ChatGPT-aanmelding nog niet is ingericht. Geen schijn-login of API-sleutelveld. Voorlopig: bewust geselecteerde pagina-/dossiergegevens klaarzetten via bestaande AI-export, zelf kopiëren en ChatGPT openen. De link stuurt geen prompt/klantdata in de URL. Een lokale login koppelt niet automatisch het online CRM. Bestaande keuze voor het eigen ChatGPT-abonnement blijft; geen stil API-verbruik als alternatief. Echte online agentdienst blijft vervolgwerk.

Alleen bron lokaal aangepast; geen tests, checks, build, browser-QA, publicatie of bron-/accountkoppeling uitgevoerd. Online CRM verandert pas na afzonderlijke publicatie. Geen website-meetgegevens of gebruikersdata ingelezen.


## Maatwerkkunststof-fases en gesprekslabels — 20 oktober 2026

Maat gebruikt de eigen Gmail-nummerreeks00–08 als verkoopfases; geen ontwerpworkflow bovenaan het dossier. Betaling, productievrijgave en verzending blijven feiten naast de fase. Eén Behandeldknop, overige gesprekstags onder Labels; geen conceptvervanging. Bij fasewijziging kan de gebruiker optioneel een exacte Gmail-labelreview openen; andere kant levert opnieuw gelezen Gmail-labels als expliciet te bevestigen CRM-voorstel. Geen stille wijziging/automatische synclus, geen mailrechten aanvragen bij gewoon openen. Zie MAAT-FASES-EN-LABELS.md. Bronwerk, niet getest/gepubliceerd.


## Feedbackknop blijft bereikbaar — 20 oktober 2026

De feedbackfunctie is eigenaar van één knop; AI-componenten mogen hem niet verplaatsen of in hun verborgen parkeerplaats bewaren. Shell voor/na render geeft de plek door. Desktop: naast Agent, ook bij ingeklapt menu. Mobiel: bovenbalk; bij een geopende AI-chat binnen het paneel zodat de inert gemaakte achtergrond geen blokkade vormt. Ontbreekt de shell, dan blijft de vaste bodyknop beschikbaar. Toolwerkplekken met expliciete launcherHost behouden hun eigen plek. Alleen bronwijziging, niet functioneel gecontroleerd.


## AI op de eigen laptop — 21 oktober 2026

Zichtbare AI aan/uitknop boven de composer; uit maakt gewone CRM-functies niet onbruikbaar. Online opent de gebruiker een gecontroleerd lokaal koppelvenster; geen popups bij automatisch laden. Een verlopen/gesloten verbinding zet de schakelaar weer uit, zodat opnieuw verbinden één herkenbare actie blijft. Standaard alleen gekozen dossier, extra bedrijfsbrede context in de bestaande instellingen; wijzigen start een nieuw gesprek. Replyhulp gebruikt dezelfde verbinding, geen tweede login/AIachtergrondtaak. Tokens/credentials nooit in browserdrafts. Browser ontkoppelen trekt alleen die lokale toestemming in, niet het ChatGPT-account. Zie LAPTOP-AI.md; geen functionele controle uitgevoerd.


## Gmail ↔ CRM-fases — 21 oktober 2026

Eén instelbare vaste toestemming voor expliciet gekozen verkoopfaselabels van gekoppelde ordergesprekken. Geen mail nodig om een fase gelijk te houden. Gmail is leidend totdat een relevante nieuwe CRM-handeling plaatsvindt; gewone notities/prijzen/paginabezoek tellen niet als faseopdracht. Conflicten vragen één keuze dichtbij dossier/mail, geen hoogstefasegok of synclus. Fase is een projectie, geen betaling/levering. Donkerpaarse herkomst. Stillere achtergrondrondes zonder laadscherm en zonder invoer te vervangen. Geldt zolang zichtbaar CRM open is; geen 24/7-claim. Zie GMAIL-FASESYNCHRONISATIE.md; bron niet getest/gepubliceerd/geactiveerd.


## Levertijd en Maat-bediening — 21 oktober 2026

Levertijd heeft nu optionele basis Aanbetaling ontvangen, met zichtbaar bewerkbaar percentage en cumulatieve werkelijke ontvangstdatum. Geen start uit betaalverzoek of Gmailfase. Vaste leverdata blijven leidend. Planning geeft passende aanvulactie bij ontbrekende betaal-/prijsgegevens; documentvoorstel volgt de orderplanning en bewaart bestaande eigen tekst. Zie LEVERTIJD-AANBETALING.md.

Maat gebruikt geen drukkleuren, logo-/ontwerpgoedkeuring of Spatlappen-ontwerpvoortgang. Productbestanden/technische tekeningen blijven beschikbaar. Eigen statuskeuzes en nieuwe aanvragen zonder ontwerpstatus; historische records/data blijven behouden. Spat houdt zijn drukwerkflow. Ook documentvelden, mailtemplatekeuze, AI-import/-antwoordcontext en prijsvergelijking volgen het bedrijf. Zie MAAT-EIGEN-WERKPROCES.md. Geen tests of publicatie in deze ronde.

## Handtekeningen en kopieerbare AI-uitleg — 21 oktober 2026

Eén editor met profielkeuze, geen formulierkopie per afzender. Een HTML-indeling met meerdere afbeeldingen krijgt expliciete bestand→vakcontrole vóór plaatsen; bestaande maten/posities blijven. Afzenderbindingen staan ingeklapt. Mail gebruikt automatisch de adreskeuze, afwijkingen onder extra opties, de echte handtekening zichtbaar in preview. Wijzigingen blijven in het formulier tot bevestigde opslag; tijdens ophalen/bestanden lezen/opslaan geen overlappende edits.

Uitleg voor AI is een gedeeld kopieervenster, zonder providerverzoek. Huidige inhoud alleen na aanvinken; geen credentials, ingebedde afbeeldingdata wordt vervangen door vakken. Nu toegepast bij handtekeningen. Zie MAIL-HANDTEKENINGEN.md. Alleen lokaal, gebruiker controleert.

## Bouwtaken: afgerond uit de werkvoorraad — 21 oktober 2026

Te bouwen is de standaardlijst met echt open werk (Open/Mee bezig/Geblokkeerd), eerst eerstvolgende stappen en onderzoek onderaan. Gebouwd · jouw controle heeft een eigen compacte tab; geen implementatie opnieuw bouwen omdat alleen gebruikerscontrole of publicatie ontbreekt. Afgerond staat buiten beide werkvoorraden maar behoudt ID en compleet log. Publicatie blijft een apart gegeven, geen automatische afleiding uit een vinkje of bronwijziging. Opgeslagen expliciete status gaat vóór de catalogusbasis. Geen automatische tests of provideracties door deze bediening.

## Orderstappen en losse voortgang — 21 oktober 2026

De bolletjes worden echte navigatie naar de relevante onderdelen van dezelfde order, met een bekende toestand per stap. Maat begint bij Aanvraag & prijs, Spat bij Ontwerp. Verkoopfase en geregistreerde fysieke uitvoering expliciet benoemen; een mailfase of positie in een statuslijst is geen bewijs van betaling/productie/levering. Geen dubbele ruwe orderstatuskeuze en passieve stapjes naast de verkoopfase. Klikken opent, bevestigde gebeurtenis registreert.

Eigen voortgang werkt zonder gezamenlijke inkoop. Uitvoeringkaart bij Kosten/Levering staat voor de order; gezamenlijke inkoop is optioneel en wordt niet meeveranderd. Alleen bekende eigen feiten als vinkje, andere ontbrekende datums niet aanvullen. Opslag via actuele merge/conflictcontrole, bevestiging vóór opslaan en archiveren. Zie ORDERVOORTGANG.md. Gebruiker controleert zelf; geen functionele browserQA/tests/publicatie.


## Eén leverancier direct bij de Maat-order — 21 oktober 2026

Inkoop & marge begint bij eigen kosten/marge en een compacte leverancierskaart met Inkoop invullen en Factuur toevoegen. Geen verplichte aparte inkoopbestelling. Ook bestaande exclusieve inkoop compact op de order, met behoud van de oorspronkelijke kostenscope. Meerorders-inkoop blijft gedeeld; geen stille allocatiewijziging. Gezamenlijke koppeling bij losse orders en de calculator onder extra/gesloten onderdelen. Facturen intern met preview en expliciet bronlabel, geen klantfactuur of impliciete betaling. Zie INKOOP-BIJ-ORDER.md; lokaal gebouwd, gebruikercontrole open.


## Bedragbasis zichtbaar en gescheiden — 21 oktober 2026

Verkoop/kosten/marge primair excl. btw. Volledige klantontvangsten, betaalverzoek en saldo incl. btw in een apart betaalvak. Bedragbasis direct in kop of invoerlabel, niet alleen ergens in een alinea. Orderlijst primair netto met bruto betaalinfo apart, Analytics resultaat en ontvangen geld visueel gescheiden. Dezelfde compacte basislabels uit workspace/money.js. Geen omgerekende bankontvangsten of historische leverancierstotalen zonder bekende btw-basis als netto/bruto aanduiden. Onvolledig blijft voorlopig/onbekend. Zie BEDRAGEN-EN-BTW.md. Lokaal, Philippe test zelf.


## Maat-dikte is een productgegeven, geen vrije offertetekst — 21 oktober 2026

Materiaal/dikte vanuit de productregel automatisch als vaste publieke documentdetails; numerieke dikte in mm blijft de bron voor zoeken/analyse. Nieuwe Maat-klantdocumenten niet stil zonder dikte maken: directe aanvulknop naar betrokken product, terug naar het document met invoerbehoud. Oude bestanden behouden, actuele producten pas na bewuste laadkeuze in revisie. Analytics Materialen & diktes telt geregistreerde dossiers/productregels/stuks, onbekend apart en materiaalkeuze/doorklik met passende filters. Geen geleverde omzet uit aanvragen afleiden. Zie DIKTE-EN-PRODUCTDATA.md; lokaal gebouwd, gebruikercontrole open.

## Orderkaart als uitvoeringswerkplek — 21 oktober 2026

Standaard fysieke In productie, hoofdkeuzes uitvoering en levering; geen ontwerp-/offertelegenda. Levering kiezen toont alle fases binnen die koppeling; search/leverwijze onder extra filters met invoer/open-onderdeelbehoud. Alle gefilterde orders naast kaart, ook zonder postcodepunt. Bestaande echte orderverzending/levering niet overschrijven uit batchcontext en compleetheid niet aannemen. Optionele routeschets met eigen vertrek en bewuste stopvolgorde; ontbrekende leverwijze dichtbij invullen, adres direct bij order. Routelinks pas op klik, geen kosten/statuswijziging of route-optimaliteitsclaim. Zie [Orderkaart en bezorgroute](ORDERKAART-EN-BEZORGROUTE.md). Lokaal bronwerk, Philippe controleert zelf.

## Ontwerpdownloads dichtbij — 21 oktober 2026

PreviewPNG en leveranciersvectorPDF direct bij bewaarde Spat-ontwerpen en huidig opgeslagen productontwerp. Bron/datum zichtbaar; niet doen alsof losse uploads of oude goedgekeurde afbeeldingen vectorbestanden zijn. Downloadtab bewaart niets, toont voortgang en blijvende downloadlink, bij problemen naar juiste ontwerp. Huidig onbewaard werk blijft staan. Zie ONTWERP-DOWNLOADS.md; alleen lokaal, Philippe controleert zelf.

## Websitegegevens bij een dossier — 21 oktober

Eén tab Websitegegevens bij klant/order. Ontvangen contact vastleggen is de hoofdactie; exact aanvraagnummer koppelen staat bij de ontbrekende relatie, correctie bij de bestaande relatie. Klantorders blijven apart; detailrapport pas bij laden, geen serie achtergrondopvragen. Geen contactklik als ontvangst presenteren. Bron/meetdekking en onbekende sessies expliciet; geen persoonlijke details uit oude meetkeuze. Zie WEBSITE-DOSSIER.md.

## Vier feedbackbatches — 23 oktober 2026

Zie VIER-BATCHES-2026-10-23.md voor resultaat/open grenzen. Betaalformulier stelt afgesproken percentage (standaard50%) paars voor bij bekende onbetaalde order; ontvangen bedrag blijft door gebruiker te bevestigen. Productievrijgave is ook zichtbaar bij deelbetaling/op Betalingen, blijft afzonderlijk. Preview begint hele pagina passend. Herstel verzendprijs heeft leverkeuze ernaast, met paars voorstel bij positieve prijs zolang onbekend; bestaande afspraken en handmatige keuze blijven. Na save/cancel terug naar documentinvoer.

Contact/factuurmail bewerkbaar direct in order, klein conflictveilig venster. Document-Meer bevat handmatige registratie van werkelijk elders verstuurd PDF, met datum/confirm; geen verzendactie of bewijs van aflevering. Bundle leest PDFregistratie. Sidebarhover heeft beide kleuren expliciet. Gedeelde viewporthelper wordt ook door editorfeedback gebruikt; geen eigen tweede mobielgedrag. Bron lokaal en niet getest/gepubliceerd.

## Batch1 instellingen — 23 oktober 2026

Telefoon & meldingen: drie herkenbare stappen, één hoofdactie (aanzetten/herstellen) en uitzetten indien er een browserkoppeling is. Statusdetails onder gesloten onderdeel, voortgang bij de actie. Geen groen werkend-pushbewijs op alleen browsertoestemming; achtergrondcontrole zonder recente heartbeat zichtbaar waarschuwen. Bij serverfout endpoint niet weggooien en echte herstelactie behouden. Editorfeedback op mobiel gebruikt nu ook zelf viewport-CSS en16px-invoer. Alleen bron, Philippe controleert zelf.

## Batch2 — betalingen/documenten, 23 oktober 2026

Betaling: zichtbare bedragbasis, snelle aanbetaling/restantkeuze, live saldo na invoer; extra bevestiging alleen bij mogelijk dubbel of te veel. Gewijzigde prijs/ontvangsten: Actueel saldo ophalen in hetzelfde formulier, invoer behouden en bevestiging opnieuw. Factuuractie dichtbij het saldo, algemene mailopties rustiger onder details. Geen automatische echte verzending of productievrijgave. Verzendprijs ontbreekt: invullen bij de melding.

Factuurontvangsten: teller en expliciet alles/niets, uitsluitend toelichting; lege hervatselectie blijft leeg. Previewfout: opnieuw proberen en origineel downloaden dichtbij. Kostenbalken achter gesloten uitleg; percentages van ingevulde kosten, geen onbekend als gratis of gedeeld transport als verzonnen productprijs. Verwijderen ontvangst toont geen irrelevante vervangvelden. Bron lokaal, gebruikscontrole door Philippe open; zie BETALINGEN-EN-DOCUMENTEN.md.

## Batch3 — klant en mail, 23 oktober 2026

Standaardcontact direct op orderoverzicht en naast mailontvanger aanpassen; in de mail boven de echte ouder-DOM, niet via navigatie of conceptopslag. Gebruik klant-/factuuradres is een aparte expliciete keuze, nooit stil de replyontvanger omzetten na contactsave. Alleen gewijzigde contactvelden opslaan, andermans andere velden behouden.

Compacte templatekeuze boven het bericht; invullen/bewerken direct, nieuwe template onder Meer. Bewerken/bewaren in inlinevenster, naamconflict openhouden, huidige tekst/bijlagen/gesprek behouden. Pas met Tekst invullen en bevestiging vervangen. Replylabel en Nieuw bericht-knop blijven staan; ontvanger of ander onderwerp maakt zichtbaar nieuw met replymetadata gewist, body-only behoudt bestaand antwoord. Geen bestaande mail-/Gmail-/toestemmingsgates veranderd. Zie KLANT-EN-MAILWERKPROCES.md; gebruikerscontrole open.

Batch3-correctie: template invullen in een bestaand antwoord behoudt standaard het gespreksonderwerp. Alleen body vervangen na confirm; voor templateonderwerp eerst bewust Nieuw bericht maken. Geen stille opsplitsing van de thread door standaardtekst gebruiken.

## Feedback en vervangende downloads — 23 oktober 2026

Feedbackslot in CRM-sidebar altijd renderen, onafhankelijk van AI.enabled. Bestaande eigen launcherreferentie/beforeRender/mount en mobiel slot behouden. Bij documentrevisie dezelfde serienaam aanbieden, versiehistorie in CRM behouden; nieuwe factuur blijft nieuw. Browser kan zelf een volgnummer toevoegen. Geen tests/browser-QA uitgevoerd.

## Vervolg 24 oktober: per product en per pagina

Aanvraagherkenning toont bestaande klantcontrole en afzonderlijke productkaarten; toevoegen/uitsluiten in hetzelfde formulier, oorspronkelijke mail beschikbaar, niets kopiëren tussen producten. Meerdere productregels vereisen bewust aantal, overige onbekende maten/materialen blijven leeg. Mailvinkjes noemen precies het product en maken een vrij bewerkbaar voorstel; bewerkte body niet stil opnieuw opbouwen. Geen extra verzendhandeling of automatische mail.

Websitegebruik standaard alle gemeten pagina’s, één paginakeuze naast de periode. Bij paginakeuze beperkt de noemer zich tot exact gekoppelde bezoeken/aanvragen, onbekende herkomst niet verzinnen. Laptop-AI via eigen CRM-domein met zichtbare browsertoestemming; helperstart is geen koppelsucces. V2 online alleen als de benodigde assets expliciet meegeleverd zijn, normale V1-route behouden. Details VERVOLGWERK-2026-10-24.md; Philippe controleert zelf.
