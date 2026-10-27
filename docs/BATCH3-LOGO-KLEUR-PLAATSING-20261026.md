> Vervolg27oktober: [open punten verder gebouwd](OPEN-PUNTEN-VERVOLG-20261027.md). Nieuwe vectorsegmentatie, optioneel plaatsingsleren, automatische vrijgave en Google-routeadapter vervangen een deel van de hieronder historische restpunten. Nog geen tests of publicatie.

# Batch 3 · logo’s, kleuren, randlijnen en plaatsing

26 oktober 2026. Alleen lokale bron. Geen tests, checks, syntaxchecks, builds, browser-QA, SVG-/PNG-/PDF-/druk-/providerproeven, GitHubpush of publicatie. Philippe controleert zelf. Geen echte klanten/orders/ontwerpen, feedbackstatus of opgeslagen gebruikersstatus gewijzigd. Bestaande batch1/2code en overige wijzigingen behouden.

## Kleurpalet en losse delen

De zichtbare vaste kleuren van een SVG staan onder elkaar. Kleur aanpassen blijft direct beschikbaar; verwijderen en losse delen zitten bij Meer. Wijzigen bewaart nu ook alpha uit rgba/slashnotatie door die met de bestaande kanaalopacity te combineren. Verborgen en volledig transparante verf telt niet als zichtbare paletkleur; de SVGkleurprojectie is daarop aangesloten. De UI herbindt na undo of een nieuw object met hetzelfde ID/dezelfde bron, zodat knoppen niet naar een oude objectinstantie blijven wijzen. Dubbele kleurtoepassing hoeft geen geschiedenisactie te maken als niets verandert.

Onder Meer → Losse delen bewerken staat Losse eilanden herkennen. De nieuwe klassieke helper vector-islands.js leest gesloten samengestelde SVG-paden en maakt duidelijk gescheiden delen afzonderlijk bewerkbaar. De oorspronkelijke curve-/boogcommando’s blijven vector; relatieve subpadstarts krijgen hun juiste absolute start, overige segmenten behouden hun betekenis. Er wordt niet gerasteriseerd of opnieuw getraceerd. Fillregel, uitsparingen, transformaties en bestaande fysieke logoplaatsing blijven bij de oorspronkelijke vormen. Elke splitsing is expliciet en heeft één undo; de oorspronkelijke vector blijft ook via de bestaande herstelroute beschikbaar.

De groepering is bewust conservatief: subpaden met rakende/overlappende begrenzingsvakken blijven samen. Daarmee blijven gaten bij hun omhullende buitenvorm en wordt een overlappend/gevlochten pad niet op een gok in stukken geknipt. Alleen gesloten, gevulde paden zonder zichtbare lijn komen in aanmerking. Bestaande losse SVG-vormen zijn daarnaast beschikbaar. Complexe/open of niet ondersteund geschreven paden blijven onveranderd. Grenzen: maximaal500.000tekens/100.000tokens per pad,256subpaden per pad en512gemeten subpaden per actie; bij overschrijding geen bewaarde artworkmutatie. Native getBBox meet alleen de losse hulppaden na deze expliciete gebruikersactie, niet bij iedere render.

**Nog open:** dit is geen volledige topologische verbonden-kleursegmentatie. Echte losse vormen met overlappende begrenzingsvakken kunnen bij elkaar blijven. Delen uit verschillende paden die elkaar raken worden niet tot één verbonden kleursegment verenigd. Complexe stroke-/clip-/verloopgevallen en compacte niet ondersteunde boognotaties vragen de bestaande vormbewerking of een eenvoudiger bron-SVG. Niet als Illustrator-achtige volledige segmentatie afvinken.

## Tijdelijk vectorvoorbeeld en toepassen

Het bestaande snelle voorbeeld blijft maximaal400pixels en350ms gedebounced. Instellingen worden vastgelegd bij het starten, met de volledige logobron/plaatsing en spatlapbasis. Een laat resultaat vereist nog dezelfde geselecteerde objectinstantie, bron, maat en actuele aanvraag. Bij een nieuwe instelling verdwijnt het oude tijdelijke artwork tijdens het bijwerken; opslaan/export leest de echte staat.

Stoppen blijft gestopt totdat de gebruiker instellingen wijzigt, het onderdeel opnieuw opent of bewust een andere afbeelding kiest. Undo beëindigt en pauzeert het experiment. Toepassen maakt het definitieve trace-resultaat en pauzeert daarna het snelle voorbeeld: geen onmiddellijke terugval naar een grover tijdelijk beeld. Tijdens toepassen draait geen nieuwe voorbeeldtrace. Een gewijzigde selectie, bron, spatlap of instelling tijdens laden stopt toepassen zonder artworkwijziging. Stoppen kan een nog niet vastgelegde omzetting beëindigen; het latere resultaat wordt dan niet toegepast. De snelle witte-PNGroute bewaakt de oorspronkelijke selectie vóór instellingen/toepassen, zodat wisselen van logo tijdens decode niet een ander logo omzet. Origineel herstellen, undo en bestaande rotatie-/spiegel-/cropregels blijven beschikbaar.

## Randlijn

Breedte0,1–20mm en kleur blijven bij Rand, inclusief de eigen sneltoetsroute van batch2. Het dialoog vergelijkt nu ook spatlap en actuele selectie met de geopende basis. Filter-ID’s onderscheiden logo en tekst, ondersteunen bijzondere ID-tekens en ongebruikte previewfilters worden na render opgeruimd.

De vectorrand kleurt niet langer een vorm met zowel fill:none als stroke:none alsnog zichtbaar. Ook verborgen, geheel transparante of ongevulde lijngeometrie krijgt geen fantoomrand. Uniforme SVGschaaltransformaties worden in de extra lijndikte verrekend; niet-proportioneel uitgerekte logoframes blijven geweigerd. De rand krijgt een solide eigen lijn zonder oude dash-/vector-effectinstellingen. Uitsparingen en de oorspronkelijke fillregel blijven behouden.

Voor betrouwbare vectoropbouw worden complexere randgevallen expliciet geweigerd: zichtbare strokes, clip-uitsnedes, transparantie/kleurverloop, geneste tekenvlakken en scheve/niet-uniforme interne transformaties. De uitleg noemt verwijderen van de rand of werken met passende gevulde contouren. Gewone vectorartwork zonder rand behoudt de bestaande mogelijkheden. Geen stille raster-PDF of automatische wijziging van het originele SVG.

**Gebruikerscontrole blijft essentieel:** schermrand gebruikt een alpha-morfologiefilter, PNG een begrensde alpha-opbouw en vector een contour-/strokeopbouw. Hoeken, heel kleine details en randen kunnen daardoor afwijken. Deze ronde claimt geen analytisch identieke contour in alle drie renderers of fysieke drukgarantie. Controleer het uiteindelijke bestand op ware grootte; bij bijzondere bronnen de rand verwijderen of de bron vereenvoudigen.

## Gelijk verdelen en plaatsingsvoorkeuren

Verdelen gebruikt nu de werkelijke minimum-/maximumgrens van de hele selectie. Een breed middelste onderdeel kan daardoor niet een verkeerde korte buitenmaat veroorzaken. Ontbrekende/niet-eindige grenzen stoppen vóór mutatie. Kleine afrondingsverschillen worden opgevangen; al gelijk verdeelde onderdelen maken geen extra undo. Eén actie voor minimaal3onderdelen en geen negatieve tussenruimte.

Bij voorkeuren worden alleen x/y, formaat, draaiing en spiegeling toegepast. Extra informatie uit de opgeslagen voorkeur kan geen tekst, logo, font of kleur overschrijven. Nieuwe voorkeuren zijn versie2 en gebruiken de stabiele volgorde in de logo-/tekstlijst. Eerder bewaarde onversioneerde/versie1voorkeuren behouden hun bestaande positievolgorde; geen stille conversie van browseropslag. Zelfde spatlapmaat en aantallen/typen zijn nodig, daarna expliciet bevestigen en één undo.

Maximaal20voorkeuren; dubbele namen worden geweigerd. Een gewijzigde opslagbasis uit een andere tab of een onleesbare voorkeurenlijst wordt niet blind overschreven. Voorkeuren opnieuw ophalen werkt in hetzelfde onderdeel, zonder ontwerp of naamveld kwijt te raken. Dit is een browserbasisvergelijking, geen centrale multiusertransactie. Alleen geometrie en eigen voorkeurnaam worden bewaard, geen klantgegevens, tekst, logo’s, fonts of passieve plaatsingsverzameling. Automatisch leren blijft apart en open.

## Bevindingen en resterende controle

Gericht hersteld: alpha verliezen bij paletwijziging, oude UIobjectreferenties na undo, onzichtbare vormen met een nieuwe rand zichtbaar maken, verkeerde randbreedte bij interne schaal, late vectorresultaten op een andere selectie, onbedoeld herstarten na stoppen/toepassen, onjuiste spanmaat bij verdelen en brede objectspread uit opgeslagen voorkeuren. Dit is bronlezing en bewerking, geen volledige audit of functioneel bewijs.

Philippe controleert met een proefontwerp:

1. SVG met meerdere kleuren en halftransparantie: één kleur aanpassen/verwijderen, andere kleuren en transparantie behouden, undo/redo en opnieuw bedienen.
2. Gesloten samengesteld pad met losse eilanden en gaten: herkennen, een deel selecteren/verplaatsen/kleuren/verwijderen, herstellen, bewaren/heropenen en PNG/PDF beoordelen. Bij overlappende vakken/open/strokepaden moet de tool eerlijk delen bij elkaar houden.
3. Vectorinstellingen wijzigen, stoppen, ander logo kiezen, undo en toepassen. Het snelle beeld mag na toepassen niet automatisch terugkomen. Wissel tijdens laden van selectie/instellingen en controleer behoud van het origineel.
4. Rand op tekst en eenvoudige gevulde SVG,0,1–20mm, draaiing/spiegel, verwijderen en undo. Controleer ware grootte en de foutuitleg voor uitgerekte, transparante, geclipte of strokebronnen.
5. Minimaal3onderdelen verdelen, ook een breed middelste object, gelijkliggende grenzen en te weinig ruimte. Controleer groepen, undo en buitenste span.
6. Nieuwe voorkeur bewaren, onderdelen kruisen en opnieuw toepassen: de logo-/tekstlijst bepaalt de slots. Controleer bestaande oude voorkeuren, verkeerde maat/aantallen, dubbele naam, verwijdering en opnieuw ophalen na een andere tab. Inhoud blijft behouden.

`feedback4-colors-20261026` en `preview-spacing-layout` blijven Jouw controle / alleen lokaal. Complexe volledige segmentatie, renderer-/drukcontrole en automatisch leren blijven eerlijk open. Bouwvoortgang append-only via scripts/build-task.mjs; geen feedbackresolve.
