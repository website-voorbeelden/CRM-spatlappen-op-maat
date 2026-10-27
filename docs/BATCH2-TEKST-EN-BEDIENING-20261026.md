# Batch 2 · tekst, lettertypen en dagelijkse bediening

26 oktober 2026. Alleen lokale bron. Geen tests, checks, syntaxchecks, builds, browser-QA, font-/export-/drukproeven, GitHubpush of publicatie. Philippe controleert zelf. Bestaande wijzigingen en echte klanten/orders/ontwerpen behouden; geen feedbackstatus afgehandeld.

## Afgewerkte bron

De basis uit de vierdelige feedbackronde blijft behouden: fontvoorbeelden op de geselecteerde tekst, hoofdletters, veelgebruikte fonts via begrensde lokale keuzetellers, 18 ingebouwde lokale fonts inclusief Bungee, Fredericka the Great en Ewert, eigen statische TTF/OTF-import en ingebedde bytes in ontwerp/kopie/overdracht/PDF. Deze ronde downloadt of installeert geen nieuwe fonts.

Tijdelijke fontpreview stopt nu bij een selectiewissel, een echte historyactie of het openen van een ander ontwerp. Ook de twee kleine fontvoorbeelden ruimen hun tijdelijke vergelijking op. Een later fontlaadresultaat kan de beëindigde hover niet opnieuw activeren. Galerijen verversen hun opties als eigen fonts worden toegevoegd/verwijderd. De aanwijzing over tekst als SVG-contouren is als alternatief benoemd; gewone bewerkbare tekst kan via de fontimport.

De import herkent identieke fontbytes en kiest dan het bestaande font zonder nog een plaats in te nemen. De limiet van vijf wordt na de asynchrone invoer tegen het huidige ontwerp gecontroleerd. Een ontwerp-/selectiewissel tijdens laden wordt bewaakt; de fontkeuze wordt alleen op het oorspronkelijke nog passende geselecteerde tekstobject toegepast. Het bestand wordt eerst op leesbaarheid beoordeeld en daarna pas als font van de actuele werkversie geregistreerd. Een compact beheerblok binnen Eigen lettertype importeren toont het gebruik per font; alleen ongebruikte fonts kunnen eruit. Verwijderen is ongedaan te maken; gebruikte teksten en historische bestanden worden niet herschreven.

Gelijktijdige FontFace-laadvragen delen één lopende registratie per font-ID/bestand. Verlaten ontwerpen kunnen een nog lopende registratie niet later opnieuw aan het actieve fontregister toevoegen. Eén font-ID met tegenstrijdige bytes wordt geweigerd. Oude fontlaadfouten blijven niet permanent alle volgende PNG-/productbewaaracties blokkeren: de huidige fonts worden opnieuw opgevraagd. Bij PNG/productbewaren wordt voor eigen fonts nu ook de bestaande contourparser gebruikt om ontbrekende tekens te weigeren. De bestaande vector-PDF deed dit al. Geen vervangende letters als geslaagde productpreview presenteren. Een losse JSON-ontwerpkopie blijft als herstelroute beschikbaar.

Selecties kopiëren neemt het bijbehorende eigen font ook mee als de fontfamilie met CSS-aanhalingstekens of een fallback is geschreven. Plakken weigert botsende font-ID’s of meer dan vijf eigen fonts vóór mutatie. Gewone duplicatie en de oude interne plakroute melden de fout; de overdrachtsdialoog blijft open bij een afgewezen plakactie. De bestaande broncodec, eigen fonts en contextvrije kopie blijven behouden.

Tijdens tekstinvoer werkt de bestaande animatieframe-update alleen het betrokken artwork en lijstlabel bij. De volledige selectie-/referentiebediening wordt niet meer per toetsaanslag opnieuw doorlopen. Fontvoorbeelden plannen een tweede update alleen wanneer fonts werkelijk laden. Geschiedenis deelt al de onveranderlijke fontstrings. Dit is gericht bronwerk zonder snelheidsmeting; geen prestatiebelofte voor de MacBook Air of willekeurig complexe logo’s.

Sneltoetsen opnemen heeft nu voorrang op de vaste bewaren/export-sneltoetslistener, zonder een actie uit te voeren tijdens het opnemen. De vaste editorcombinaties, laagvolgorde, tekstbewerking en veelvoorkomende browsercombinaties zijn beschermd. Opgeslagen combinaties worden bij lezen aan dezelfde regels en dubbelen getoetst. Tab blijft bruikbaar om naar Bewaren te gaan; Escape sluit. Opnieuw Cmd/Ctrl+Shift+klik toont de huidige combinatie; aanpassen/verwijderen blijft in hetzelfde venster. Een mislukte lokale opslag verandert de actieve koppelingen niet en houdt de keuze open. Knoptitels en aria-keyshortcuts geven de gekozen combinatie. Browser/OS kan combinaties zelf reserveren; de gewone knoppen blijven nodig.

Kopie openen bewaart één nieuwe losse kopie met lege klant-/orderbinding en korte opslaglink. De terugvallink wordt na geslaagde opslag altijd getoond, ook als de pop-up geblokkeerd of gesloten is, of de gebruiker in de nieuwe tab al naar een andere pagina ging. Alleen de nog lege eigen nieuwe tab wordt automatisch doorgeleid/gesloten. Een geslaagde opslag wordt niet meer als mislukt gemeld door een later pop-upprobleem. Het oorspronkelijke tabblad en product blijven behouden.

De plus/minzoom brengt de geselecteerde groep in beeld rond het midden voor zover de werkelijke scrollruimte dat toelaat. Muiszoom houdt de positie onder de muis vast. De gesplitste desktopscroll gebruikt nu dezelfde grens van 951px als de desktopwerkplek; tot 950px volgt de bestaande paginastroom. De previewhoogte reserveert op desktop ook ruimte voor het paneel met extra opties, met een minimum van 96px voor dat paneel. Geen nieuwe permanente hoofdknoppen; uitleg in het bestaande vraagteken.

Aanvullende exportguard: klantpreview-PNG en los artworkcanvas vergelijken vóór opleveren hun hele artworkbasis met de basis aan het begin. Een wijziging tijdens fonts/logo’s laden stopt met duidelijke uitleg en behoud van de invoer. Selectie en tijdelijke fontvoorbeelden tellen niet als bewaarde artworkwijziging. Vector-PDF gebruikte al een eigen ontwerpsnapshot; de bewaarde downloadroute houdt daarnaast zijn bestaande bronherlezing. Controle door Philippe: start een PNG/artworkactie en wijzig tijdens het laden de tekst, maat of inhoud; er mag geen gemengde versie worden aangeboden.

## Onlogische code die is gericht hersteld

- Tijdelijke hover werd alleen bij verlaten van de fontgalerij beëindigd, waardoor een selectie-/ontwerpwissel een oud experiment kon laten hangen.
- Fontregistratie werd bij iedere gelijktijdige aanroep opnieuw gestart en herhaalde import vulde de beperkte fontlijst met hetzelfde bestand.
- Plakken kon een fout melden en daarna toch als succesvol worden gepresenteerd; een font-ID kon bestaande fontbytes vervangen.
- Sneltoetsen werden in het geheugen al gewijzigd vóór bevestigde browseropslag, en de vaste capturelistener kon het opnemen onderscheppen.
- De nieuwe desktopscroll begon bij 701px terwijl de bestaande werkplek pas boven 950px een vaste viewportindeling had. De twee modellen werkten daardoor door elkaar.
- Kopie-opslag en het openen van de nieuwe tab stonden in dezelfde foutafhandeling; een gesloten tab kon een al bewaarde kopie als fout laten eindigen.

Dit is bronlezing, geen volledige CRM-audit of functioneel bewijs. Batch1varianten, centrale producttransactie, klantbindingen en de overige gedeelde bedrijfsregels blijven behouden.

## Gebruikerscontrole blijft open

Gebruik een los proefontwerp en een proefproduct, zonder echte klantdossiers te wijzigen:

1. Selecteer tekst, hover/focus over fonts, verlaat de galerij en wissel selectie/ontwerp. Kies daarna een font en gebruik undo/redo. Vergelijk gekozen inhoud met PNG/PDF; een hover mag niet opgeslagen worden.
2. Maak meerregelige tekst, gebruik hoofdletters en typ een langere tekst. Controleer cursor/invoerbehoud en de werkelijke snelheid met eigen logo’s.
3. Importeer een statisch TTF/OTF (max2MB), kies hetzelfde bestand opnieuw, heropen het bewaarde ontwerp en kopieer tekst naar een andere tab. Controleer dat het font meekomt.
4. Verwijder een ongebruikt font en maak dit ongedaan; een gebruikt font moet beschermd blijven. Probeer vijf fonts en daarna nog een andere. Probeer een font dat een gebruikt teken mist: PNG/productbewaren moet duidelijk stoppen met behoud van invoer.
5. Cmd/Ctrl+Shift+klik op een ondersteunde selectieactie, stel bijvoorbeeld Alt+B in, open opnieuw, wijzig en verwijder. Probeer een gereserveerde/dubbele combinatie, Tab/Escape en gebruik tijdens een dialoog of tekstinvoer. Browser-/OSgedrag op Mac beoordelen.
6. Kopie openen met grote ingesloten logo’s/fonts, pop-upblokkade en een tussentijds gesloten nieuwe tab. De korte link blijft na opslag beschikbaar; originele tab en product blijven gelijk.
7. Zoom op één object en een groep; controleer ook muiszoom en reset. Beoordeel desktop, klein venster rond950px en mobiel: artwork/opties blijven bereikbaar.

Taak `feedback4-editor-20261026` staat Jouw controle / alleen lokaal. Meer ingewikkelde SVGsegmentatie en andere batch3/4scope zijn hiermee niet afgevinkt. Geen gemeten performance, export-/printgarantie of automatische feedbackresolve.
