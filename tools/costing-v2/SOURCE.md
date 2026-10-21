## Dagelijkse invoer & CRM — 16 oktober 2026

Rechthoek zonder gaten is de standaard voor nieuwe stukken. Naam/aantal/materiaal/dikte/maten direct zichtbaar; andere vorm, pakking en X/Y-gaten bij Extra opties. Leveranciersnaam/kostprijsbasis/plaatmaten/materiaalprijs en bewerkingskosten direct invulbaar. Snijlengte, valuta en bijkomende kosten ingeklapt. DXF en SVG zonder een-item-menu onder preview. Nesting na alle leveranciers, onderaan. Rekenformules, opgeslagen geometrie en tarieven behouden.

Lokale CRM-productlinks openen deze V2 met orderId/itemId. De actuele productregel wordt gelezen; bekende aanvraaggegevens vullen alleen lege velden bij een enkele productregel aan. Bestaande berekeningen worden exact heropend. Geen CRM-schrijving bij openen/laden; overnemen blijft gecontroleerd. Cloudbuild en oorspronkelijke V1-bron blijven ongewijzigd. Deze actuele afspraken vervangen de historische gesloten-stuk/leverancierkeuze en oude V1-standaardroute hieronder.

## Eenvoudige vormroute — 16 oktober 2026

Leidend: Vierkant / Rond / Mangat, daarna passende uitvoering. Rond Massief/Middengat/Midden+boutcirkel, vierkant/mangat Massief/Open midden. Geen zes losse basisvormtegels of prominente hoekgaten. Regelmatige ronde gaten worden uit bestaande exacte coördinaten herkend en hebben inline één count/diameter/PCD-h.o.h-bediening. Geen wijziging van broncoördinaten door alleen renderen of afstandsweergave wisselen. Losse X/Y-gaten onder gesloten Extra opties; hun velden worden pas bij openen opgebouwd. Bestaande onregelmatige/CAD-/vrije contouren, alternatieve binnenvormen en gaten blijven behouden. Geen migratie of automatische opslagschrijving.

Basisvelden van stukken en leverancierstarieven direct zichtbaar (laatste gebruikerscorrectie). Alleen bijzondere vormen/extra variabelen starten dicht. Nesting staat onderaan en begint dicht. DXF en SVG direct onder de preview. Prijs/marge/AI/CRM-hoofdactie blijven V1-gericht. Feedback nu bij Meer opties. Pure veiligheid van randen/overlap ongewijzigd, nieuwe variantkeuzes valideren voordat state wijzigt. Import heropent niet standaard alle stukken; expliciete add/focusacties blijven gericht openen. Alle tools/costing V1-assets blijven ongewijzigd.

## AI-bediening — 16 oktober 2026

Herhaald openen gebruikt hetzelfde AI-venster; direct focus op het antwoordvak en sessieconcept behouden. Prompt begint bij een al geplakte aanvraag direct met herkenning, vraagt maximaal drie ontbrekende gegevens tegelijk en noemt exacte hole_coordinates in plaats van een verzonnen schematisch gatenpatroon. Preview/expliciet overnemen en bestaande snapshot-/geometriecontroles blijven gelijk. Geen model- of providerwijziging en geen V1-wijziging.

## Actueel: minder dubbele bediening

V1-financieeloverzicht behouden; referentievormkeuze vereenvoudigd tot zes keuzes. Leesbare stuksummary, materiaal/dikte/maten eenmaal in body, Ring/pakking gecombineerd met bestaande boutgatinstelling. Hoofdacties bij uitkomst, administratie onder Meer opties. AIcompact met behouden draft en deduplicatie van dezelfde teruggeplakte link. Geometrie/rekenlogica/opslag/CRMcommitregels blijven gelijk. Zie OVERDRACHT voor validatie en browsercontrole.

## Actueel: orderkoppeling V2 (15 oktober 2026)

Bestaande CRM-orderproductregels kunnen nu direct worden geladen en na review bijgewerkt. crm-order-domain.js hergebruikt V1calculationRecord/applyCalculation voor de bestaande kostprijsbescherming, met extra versie2/orderfinancial/snapshotchecks. Exacte inputs blijven als version2 bij het product; oude V1bridge weigert deze recordversie. shared toolUrl opent V2records in V2. Geen shape/coordinate-allowlistverruiming van de bestaande quote/inkoopwerkplek; die blijft V1. Klantbestandbewaren/openen blijft afzonderlijk bruikbaar. Nieuwe bron of reset koppelt de order los. Alleen lokaal; V2 nog niet in releasebuild, toekomstige cloudroute moet deze assets eerst leveren. Zie OVERDRACHT voor tests/limieten.

## Focus op de hoofdroute (15 oktober 2026)

Kostprijs/verkoop/marge direct; uitsplitsing en rekenuitleg ingeklapt. CRM-bewaren toont controleoverzicht en maakt een nieuwe JSON-kopie. Bij klant openen leest direct vanuit de bestaande klantdocumenten, met preview/expliciete bevestiging en asyncconflictchecks. Geen prijswrites in orders, geen download/uploadomweg, geen opslag tijdens preview. Bewaarstatus volgt de exacte werkversie. V1 en providerintegraties blijven ongewijzigd.

## Actueel: V1 als werkblad behouden (15 oktober 2026)

Eerdere presentatieherovariant is op gebruikersverzoek verwijderd. Dashboard/prijs/marge/AI-knop weer in V1-opmaak bovenaan; uitbreidingen blijven bij Stukken. workspace-help.js toont prompt/kopieerstatus/plakantwoord met controle, feedback via bestaande lokale dienst. bolt-circle.js levert pakkinggaten op steekcirkel/h.o.h als echte coördinaten. crm-customer.js bewaart uitsluitend na klantkeuze+bevestiging een V2-JSON bij klantdocumenten; bestaande V1 order/quote-flow blijft ongewijzigd. Geen online samenwerking/publicatie/provider-AI ingebouwd. Zie OVERDRACHT voor actuele validatie.

## Leverancierswerkplek, 15 oktober 2026

Presentatie bijgewerkt met bestaande bedrijfsnaam Maatwerkkunststof. Werkvolgorde: onderdeel, nesting, leverancierstarieven, prijs/marge. Import primair; administratie en AI-hulp ingeklapt. Alleen presentatie gewijzigd; tarieven, opslagisolatie, CAD-validatie en expliciet bewaren behouden. Geen publicatie of gedeelde online samenwerking toegevoegd.

# Actueel: eigen leverancierstarieven — 15 oktober 2026

De gebruiker wil deze tool aan een mogelijke leverancier laten zien om samen berekeningen te kunnen maken. Daarom zijn alle eerder ingebouwde rubberplaatprijzen, snijsnelheden, €6/uur, setup- en aanzettijden verwijderd uit nieuwe berekeningen en uit de bediening. Geen knop voor voorbeeldtarieven meer. De diktekeuze blijft een geometrische keuze en bevat geen tarieven. Nieuwe leveranciers hebben geen materiaalprijs of automatisch uurtarief. Handmatige minutenberekening vraagt een ingevuld uurtarief wanneer de bewerking daadwerkelijk wordt berekend. Snijlengteberekening gebruikt uitsluitend eigen snijsnelheid en uurtarief; ontbrekend blijft onbekend, expliciet €0/uur is een bewuste invoer. Bestaande opgeslagen bedragen/tijden worden behouden, ook als ze ooit als voorbeeld zijn ingevoerd: ze worden niet zonder bronbewijs gewist.

Schone lokale ingang: index.html?presentatie=leverancier. Eigen sleutel maatwerkkunststof:costing-v2:calculation-v1:leveranciersoverleg; leest geen bestaande normale V2-opslag of CRM-database. Neutralere titel/uitleg, geen CRM-teruglink in deze weergave, Nieuwe berekening maakt na bevestiging alleen een nieuwe werkversie. De eerder bewaarde versie wordt pas vervangen bij expliciet bewaren. JSON-openen/downloaden blijft beschikbaar om berekeningen uit te wisselen. Er is geen online publicatie of gelijktijdige multiuser-synchronisatie toegevoegd.

Default is eenvoudig rekenen met eigen kosten/tijden, of optioneel rekenen op snijlengte met eigen snelheid/uurprijs. Dit werkt ook voor andere ingevoerde materialen. De huidige geometrie/import/nesting is behouden. Een nieuwe dikte krijgt geen automatisch afgeleide prijs. Onbekende queryparameters zoals presentatie/v worden niet als productinvoer behandeld.

Tests: volledige scripts/check met beide builds work/supplier-tool/final-check.log; permanente costing-v2-tests nu met expliciete fictieve tarieven in de testfixture, plus assertions voor lege defaults/geen prijscatalogus/geen snelheiddefaults/ontbreekt≠gratis. Bovenliggende actualDOM supplier-view-check.mjs bewijst opslagisolatie, geen overgenomen bestaande prijzen, eigen tariefinvoer, expliciete opslag, nieuwe werkberekening zonder opgeslagen data te wissen. V1 SHA256 onveranderd. Eerdere passages hieronder over voorbeeldtarieven beschrijven de voorgaande ontwikkelversie en gelden niet meer als huidig gedrag.

---

# Huidige V2-bediening — 15 oktober 2026

Stukken worden gekozen via vormplaatjes: Rechthoek, Afgerond, Rond, Ring, Ovaal of DXF/STEP. Geen handmatige uitsparingsdropdown, gatpositiemethode of coördinaattextarea meer in de gewone editor. Voor een ring blijft de eenvoudige binnengatdiameter beschikbaar. Oude L-vormen, veelhoeken en binnencontouren blijven in opgeslagen invoer bewaard en leesbaar; ingewikkelde nieuwe vormen komen via bestandsimport.

Gaten hebben patroonplaatjes (geen/één/vier), daarna per gat X, Y en diameter met directe invoer en −/+. X naar rechts en Y omhoog vanaf het midden. Nieuwe gaten worden veilig geplaatst. Diameter maximaal 12 mm, met een kleinere actuele bovengrens als randen/andere gaten dit vereisen. Bestaande grotere of afwijkende gatdata wordt niet stil herschreven. Ongeldige positie/diameter of een maatwijziging die bestaande geldige gaten buiten de vorm zet wordt niet toegepast; bij focusverlaten wordt de geldige waarde hersteld met korte uitleg. Gaten raken geen buitenrand of elkaar. Voorbeeld gebruikt een materiaalmasker zodat ook een oude ongeldige invoer geen gekleurde gaten buiten het stuk kan tekenen. Geldige SVG-export blijft een zelfstandig compound vectorpad, opnieuw importeerbaar.

Nesting staat direct na Stukken, vóór de leveranciersinstellingen. Bovenaan staat de ingang Plaatindeling & nesting, en bij een stuk Nesting bekijken. De bestaande nestingstrategieën blijven behouden; complexe geïmporteerde/concave vormen worden conservatief in hun omhulling geplaatst.

# Lokale CAD-bestandsimport

De knop Tekening importeren en de DXF/STEP-vormtegel openen dezelfde preview. De tegel kiest vooraf het huidige stuk als te vervangen doel; de algemene knop kiest een nieuw stuk. Overname blijft expliciet, met verplichte controlecheckbox. Bij wijzigen van eenheid, vlak of dikte wordt de checkbox gewist. Preview/annuleren schrijft niets, oudere async-resultaten worden genegeerd, wijzigen van de berekening tijdens lezen/preview blokkeert vervanging. Geen auto-save. Vaste offerte-/verkoopbedragen voor gewijzigde geometrie worden vrijgegeven voor nieuwe controle; overige stukken behouden hun geometrie/identiteit.

- DXF: tekst-DXF met LINE, ARC, CIRCLE, LWPOLYLINE incl. bulges en eenvoudige 2D-POLYLINE. Exacte lijnen/cirkelbogen/cirkels blijven behouden. Eenheden uit INSUNITS worden omgerekend; zonder bruikbare eenheid moet de gebruiker kiezen. Tekst/maatvoering/referentiepunten worden gemeld en niet als snijgeometrie meegenomen. Open, vertakkende, kruisende contouren, spline-/block-inserts, 3D-polylijnen en afwijkende OCS worden met uitleg geweigerd; geen stille gedeeltelijke geometrie.
- SVG: zelfstandige rect/circle/ellipse/polygon/polyline/line/path met transformaties. Ronde bogen behouden hun analytische vorm; Bézier- en ellipsdelen hebben een expliciete benadering (basis 0,001 bron-eenheid plus begrensde ellips-naar-Bézierbijdrage). Fysieke SVG-maten/viewBox bepalen de eenheid waar mogelijk, anders bewuste keuze. Bron-SVG blijft in een los XML-document; alleen zelf gegenereerde numerieke SVG wordt getoond. Scripts/afbeeldingen/use/foreignObject/maskers/CSS-geometriewijzigingen worden geweigerd, niets extern geladen.
- STEP/STP, IGES/IGS, BREP/BRP: lokale OpenCascade-WASM in een aparte Worker. Alleen bruikbare vlakke faces; geen 3D-ontvouwing of volledige CAM. Gebruiker kiest vlak. Werkelijke modelunits worden door OpenCascade naar mm geconverteerd. De totale modeldiepte normaal op het vlak wordt als te controleren maat getoond; de dikte blijft expliciet. Curves vanuit triangulatie hebben een meshinstelling van 0,02 mm en zijn zichtbaar als benadering. Geen fysieke productie-/CAD-importgarantie.

Bestand max10MB; worker stopt bij annuleren, vervangen bestand of 45s timeout. Geometrie 2000 lijn-/boogdelen, max100 contouren met verdere puntgrenzen. Binnencontouren blijven behouden en tellen mee in snijlengte/aanzettijd. Losse onderdelen worden afzonderlijk aangeboden. Geometrie krijgt eigen cadGeometry in de bestaande V2-JSON/browseropslag, zonder CRM-gegevens of bronbestanden te uploaden. V2 blijft buiten de gewone publicatiebuild.

Vendored, vastgezet: occt-import-js 0.0.23, dxf-parser 1.1.2, svgpath 2.6.0. Licentieteksten in vendor/ (LGPL/OCCT-notices en MIT), ongewijzigde OpenCascade JS/WASM uit de npm-release; svgpath als lokale UMD-bundel zonder externe dependencies. Bron: https://github.com/kovacsv/occt-import-js (gitHead c2148e54b456b571238d35cac037d304053d64b2), https://github.com/gdsestimating/dxf-parser, https://github.com/fontello/svgpath. Geen CDN, serverconversie of bestandsupload naar derden. STEP-worker haalt alleen de eigen localhost-WASM op.

Controles: tests/cad-import.mjs (echte WASM/STEP fixture, eenheden, faces, meshopening, exacte DXF/roundtrip, ongeldige contouren); tests/packing-controls.mjs (patronen/ringen/gatbewegingen/12mm/randen/overlap/purity); bestaande tests/costing-v2.mjs. Alle opgenomen in scripts/check.mjs. Echte DOM-fixtures in bovenliggende work/assistant-dom-test/calculator-v2-check.mjs en cad-import-check.mjs: nieuwe bediening, broncontourbehoud, nesting, veilige importpreview/annuleren/checkbox/eenheid/stale input/vervanging en eigen opslag. Echte browser met fictieve DXF + STEP 200x120x3, vormplaatjes/ring, X+/−, buitenrandweigering en nesting bekeken. Geen fysieke mobiele proef.

---

# Kostprijscalculator V2 — lokale proefversie

Aparte ingang: http://localhost:3011/tools/costing-v2/index.html.
De bestaande tools/costing/ is niet aangepast. CRM-ingangen, opgeslagen orders en bestaande offerteconcepten blijven de oorspronkelijke versie gebruiken. V2 is bewust niet toegevoegd aan scripts/build-pages.mjs; de gewone bedrijfsbuild/publicatieroute bevat alleen de vertrouwde calculator.

## Bronnen en scheiding

- Basis: lokale tools/costing/, gebaseerd op website-voorbeelden/Rekentool, commit 2ea77feb588cd1cfe3c7130eb6f5c74bed5ceb36. De bestaande bediening, kostprijs-/margelogica en nesting zijn naar deze aparte map gekopieerd.
- Referentie: https://jipbuildsapps.github.io/gasket-configurator/, bekeken/opgehaald op 15 oktober 2026. De referentie inspireert de materiaalvarianten, snijlengteberekening en DXF-lagen. De al aanwezige gasket-configurator-core.js levert de gedeelde exacte afgeronde-rechthoek LINE/ARC-geometrie. De nieuwe coördinaatvalidatie, vrije contouren en V2-integratie staan in geometry.js/rubber.js; het oorspronkelijke patroon voor gaten is niet overgenomen.
- Geen Shopify-code, accountkoppeling of externe prijsophaling toegevoegd. Geen Gmail, AI-providerrequests of CRM-API vanuit V2-opslag.

## Geometrie

Rond/ring, rechthoek met optionele afgeronde hoeken, mangat/capsule, L-vorm en eigen gesloten veelhoek. Middenuitsparing rond/rechthoek waar passend. Vrije contour: 3–100 hoekpunten in volgorde, X;Y per regel; automatische sluiting. De contour mag zichzelf niet kruisen/raken/teruglopen. Een vrije contour kan asymmetrisch zijn; de veilige omhulling is symmetrisch rond het gekozen nulpunt.

Gaten: maximaal 200 regels X;Y;diameter in mm. X rechts, Y omhoog, nulpunt midden van de omhulling. Vier-hoekgatenhelper vult exacte bewerkbare coördinaten in. Positieve diameter, voldoende materiaal rondom elk gat, geen overlap/raken. Geometriefouten blokkeren prijsuitkomst en DXF/SVG; invoer blijft bewerkbaar. Oude schematische gaten worden niet zonder posities tot productiegeometrie gepromoveerd.

Preview en DXF gebruiken hetzelfde coördinatenmodel; uitsluitend de SVG-Y-as wordt gespiegeld. DXF AC1015, INSUNITS=4 (mm), drie snijlagen CUT_OUTER/CUT_INNER/CUT_HOLES, exacte CIRCLE/ARC/LINE en gesloten LWPOLYLINE. SVG gebruikt mm en een viewBox op de buitenmaat, zonder schalende previewmarge. Dit is 2D-geometrie, geen machineprogramma, gereedschapcompensatie of CAM-toolpath. DXF werkelijk gedownload en als tekststructuur gecontroleerd; geen fysieke machine/CAD-import geclaimd.

Nesting behoudt de bestaande strategieën en materiaalkeuze: hele plaat, gebruikte strook of compact vlak. Voor L-vormen en vrije contouren wordt veilig de omhullende rechthoek met rechte hoeken gebruikt. Geen concave contour-nesting of nieuwe plaatsing in uitsparingen toegevoegd. De getoonde vorm volgt de coördinaten binnen die omhulling.

## Rubbervoorbeelden

Bewust fictief en laag: plaat 2000×1000 mm, 1/2/3/4/5/6/8/10 mm respectievelijk €0,50/0,75/1,00/1,25/1,50/1,75/2,25/2,75. Snijsnelheid respectievelijk 1500/1200/1000/800/650/550/400/300 mm/min. Rubber/EPDM/NBR/SBR worden herkend. Geen materiaalcertificering of echte leveranciersprijzen.

Automatische rubberbewerking: totale buitensnijrand + middenuitsparing + alle gaten; snijlengte/snelheid + 0,1 seconde per contour, €6/uur, 0,2 minuut insteltijd eenmaal per aanvraag. Insteltijd verdeeld naar aantallen. Eigen snelheid (0 = diktevoorbeeld), uurprijs, insteltijd en aanzettijd bewerkbaar. Werkplaatsuurtarief blijft EUR bij een leveranciersvaluta. Onbekende rubberdikte vereist een eigen snijsnelheid en positieve eigen materiaalprijs. Bij een offerte blijft de offerteprijs leidend; geen dubbel getelde automatische bewerking. Gemengde materialen houden gewone handmatige tarieven voor overige materialen.

Eenvoudige rekenwijze behoudt handmatige kosten/tijden en offerte per stuk/totaal. Voorbeeldtarieven toepassen vraagt bevestiging en geldt voor één leverancier; nieuwe diktes krijgen alleen hun eigen voorbeeld als er nog geen tarief voor bestaat. Bestaande handmatige tarieven worden niet op elke render vervangen. Bij gewijzigde plaatmaten blijft de plaatprijs een expliciete prijs voor die plaat.

## Opslag en grenzen

Uitsluitend eigen localStorage-sleutel maatwerkkunststof:costing-v2:calculation-v1; bewaren is expliciet. Automatisch openen van de laatst bewust bewaarde V2-berekening. JSON-download/-openen met eigen envelope format gasket-costing-v2, version 1; maximaal 1 MB. Import controleert vóór vervanging en vraagt bevestiging; nieuwere invoer tijdens bestandslezen blokkeert vervanging. Waarschuwing bij verlaten met onbewaarde wijzigingen. Geen automatische order-/offertewrites, geen IndexedDB-CRM-toegang en geen netwerkverzoeken vanuit opslag. Browseropslag is geen centrale back-up: JSON-export beschikbaar.

Lokale proefgrenzen: 50 stukregels, 20 leveranciers, 2000 exemplaren per regel, 3000 totaal. Geen fysieke mobiele of productietest uitgevoerd.

## Controle

node tests/costing-v2.mjs: geometrie, coördinaatfouten, DXF-entiteiten/mm/lagen, snijlengtes, rubberprijzen/snelheden/eenmalige setup, FX, offerte- en handmatige regressie, purity en link-roundtrip. Opgenomen in scripts/check.mjs.

work/assistant-dom-test/calculator-v2-check.mjs in de bovenliggende werkmap: echte V2 DOM met fictieve gegevens, bediening/textarea-behoud/vrije contouren/isolatie/import. Echte localhost-browser: hoekgatenhelper, wijzigen rubberdikte, DXF-download, expliciet bewaren+herladen. De oorspronkelijke calculatorbestanden met voor/na SHA256 gecontroleerd en ongewijzigd.
