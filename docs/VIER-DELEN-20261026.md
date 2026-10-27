> Actueel vervolg27oktober: [open punten verder gebouwd](OPEN-PUNTEN-VERVOLG-20261027.md). Hieronder staat de oorspronkelijke vierdeling met resultaat van26oktober; de restpunten voor segmentatie/leren/50%-fase/routeberekening zijn voor de beschreven ondersteunde scope verder geïmplementeerd. Gebruikerscontrole, Google-sleutel/activering en publicatie blijven apart.

# Vier werkstukken — Spatlappen-CRM en ontwerptool

26 oktober 2026. Alleen lokaal. Geen tests, checks, syntaxchecks, builds, browser-QA, export-/productie-/providerproeven, GitHubpush of publicatie. Bestaande wijzigingen behouden; geen echte dossiers, betalingen, mails of ontwerpen aangepast. Functionele controle door Philippe blijft open.

## Komt de feedback overeen?

De aangeleverde export bevat 44 meldingen. 35 IDs waren al bekend en hebben dezelfde opmerkingstekst; 9 zijn nieuw. De 3 oudere lokale meldingen die ontbreken in de export zijn behouden. De vaste privéwerklijst telt nu 47 meldingen. De 9 ontbrekende meldingen zijn via scripts/feedback.mjs toegevoegd zonder bestaande afhandeling te overschrijven. De originele export en de gedetailleerde ID-matrix blijven in de privéfeedbackmap, niet in publieke CRM-code. Dit bewijst de vergelijking met het aangeleverde bestand, geen actuele online uitlezing.

## 1. Ontwerpvarianten — prioriteit

Vervolg op expliciete opdracht doe batch1: zie [batch1afronding](BATCH1-ONTWERPVARIANTEN-20261026.md). Bronmaat uit opgeslagen JSON vereist voor definitieve keuze; legacyherstel, versieoverzicht en goedkeuringsroutes verder afgewerkt. Geen tests of publicatie; gebruikerscontrole blijft open.

- Bij het product meerdere benoemde ontwerpen: nieuw, kopie van bestaande variant, openen en bewerken. Namen kunnen bij bewaren worden aangepast; dubbele namen geweigerd.
- Eén product blijft één hoeveelheid/maat/prijs. Alternatieven maken geen extra producten of aantallen aan. Afwijkende productmaat/aantal eerst bij de order afspreken; geen stil wijzigen via een alternatief.
- Elke save bewaart een nieuw JSON-/PNG-paar in de bestaande gezamenlijke transactie. Eerdere bestanden blijven in revisies; eerdere revisie als nieuwe variant openen. Geen bestaande bestandsbytes overschrijven of automatisch verwijderen.
- De definitieve keuze kan via Meer bewust worden opgeheven, met behoud van alle varianten en bestanden.
- Eén expliciete definitieve keuze na klantakkoord, zichtbaar met badge en hoofdafbeelding. Andere varianten behouden. Die keuze heeft een basis van exacte versie, maat en aantal; na wijzigingen opnieuw bevestigen. De gewone leveranciers-PDF-route vraagt een actuele definitieve keuze; een voorstel-PDF is apart bij Meer van de variant bereikbaar.
- Oude ontwerpen blijven leesbaar zonder opstartmigratie. Omzetten naar de nieuwe metadata gebeurt uitsluitend bij een bewuste bewaar-/keuzeactie. Een al expliciet goedgekeurde oude preview kan bij de overgang behouden blijven; geen oude orderdatum als bewijs van een specifieke variant raden.
- Maximaal100varianten en500revisies per variant; bij de grens geen historie wissen. Product-/klantrelatie en volledige ontwerpmetadata opnieuw toetsen voor opslag. Tegenstrijdige saves weigeren met hulp voor een ontwerpkopie.

Bronnen: shared/product-design-variants.js, admin/product-designs.js, admin/products/images.js, download-links, saved-download, state-validation, order-readiness, order-progress en production-release. Geen fysieke productie-/betaalfeiten gewijzigd.

## 2. Tekst en dagelijkse bediening

Vervolg op doe batch2: [lokale batch2afronding](BATCH2-TEKST-EN-BEDIENING-20261026.md), met fontpreview-/import-/klembordherstel, sneltoetsopname, kopie-openactie en consistente desktopscroll. Geen tests/publicatie; gebruikerscontrole en prestatiewaarneming blijven open.

- Lettertypehover/focus laat het tijdelijke font op de geselecteerde tekst zien. Klik kiest het; verlaten herstelt het. Tijdelijk voorbeeld heeft een label en gaat niet ongemerkt naar opslag/export.
- Hoofdlettersknop, fontgalerij met veelgebruikte fonts vooraan. Alleen begrensde lokale tellers van fontkeuzes; geen teksten of klantinformatie.
- Drie nieuwe ingebouwde lokale fonts: Bungee, Fredericka the Great en Ewert. Ongewijzigde TTF plus OFL uit google/fonts; herkomst in print-assets/EXTRA-FONTS-20261026.md.
- Eigen statische TTF/OTF importeren: maximaal2MB per bestand en5 per ontwerp. Native preview en OpenType-contouren uit dezelfde bytes; ingesloten in ontwerp/portable transfer en beschikbaar voor vector-PDF. Variabele, bitmap- en kleurenfonts worden geweigerd; er wordt geen vervangend font als succes gepresenteerd.
- Tekstinvoer werkt alleen het betrokken artworkelement bij, gegroepeerd per animatieframe. Fontdata in history gedeeld als onveranderlijke tekst, geen grote binaire kopie bij iedere toetsaanslag. Custom fontfaces/cache niet onbeperkt vasthouden bij andere ontwerpen.
- Zoomknoppen richten op de selectie. Kopie openen gebruikt een nieuwe losse opgeslagen kopie en korte link, met terugvallink bij een geblokkeerde pop-up; geen enorme artwork-URL meer als hoofdroute.
- Cmd/Ctrl+Shift+klik op ondersteunde selectieacties opent sneltoetsbeheer, inclusief huidige combinatie/verwijderen. Gereserveerde bestaande editorcombinaties blijven beschermd. Browser/OS kan eigen combinaties reserveren.
- Desktop: artwork blijft bovenaan en aanvullende editoropties scrollen apart. Mobiel behoudt eigen scroll-/viewportgedrag.

Bronnen: font-tools, custom-shortcuts, text-and-objects, selection-and-controls, history-and-feedback, layout-and-preview, storage-and-integration, shared/design-transfer en spatlap-preview-vector-export. Geen snelheidsmeting of hardwaregarantie; Philippe beoordeelt werkelijke soepelheid op de MacBook Air.

## 3. Logo’s, kleuren, randlijnen en plaatsing

Vervolg op doe batch3: [lokale batch3afronding](BATCH3-LOGO-KLEUR-PLAATSING-20261026.md). Transparantie/palet, begrensd herkennen van losse eilanden, tijdelijke vectorresultaten, randveiligheid en voorkeurentoepassing verder afgewerkt. Alleen lokaal, geen tests/publicatie.

- Vaste kleuren in het geselecteerde SVG onder elkaar. Eén kleur vervangen of weghalen over alle betreffende vullingen/lijnen, zonder andere kleuren of plaatsing te veranderen. Transparantie/compound holes behouden via bestaande SVG-structuur. Kleurverlopen blijven bij uitgebreide bediening.
- Per kleur zijn de bestaande SVG-vormen bereikbaar onder Meer. Hele-logoactie en technische X/Y-/onderdeelbediening ingeklapt; dubbelklik op bestaande vectorvorm blijft beschikbaar.
- Randlijn om logo of tekst: kleur en0,1–20mm. Meegenomen in bewaren/undo/portable, scherm, PNG en vectoropbouw. Raster blijft raster en wordt niet als vector-PDF gepresenteerd. Niet-proportioneel uitgerekt SVG met randlijn blokkeert vector-PDF totdat de verhouding hersteld of de rand verwijderd is; geen onbetrouwbare fysieke lijndikte verbergen.
- Vectorinstellingen geven een tijdelijk voorbeeld op de spatlap. Max400pixels bronzijde en350ms debounce voor minder werk; definitieve omzetting kan meer detail hebben. Alleen Toepassen wijzigt het artwork, met actuele bron-/maatcontrole. Stoppen, andere selectie en undo beëindigen/verwerpen oude resultaten. Experimenten gaan niet ongemerkt mee in de bewaarde originele staat.
- Horizontaal/verticaal gelijke vrije ruimte voor minstens3geselecteerde objecten; buitenste grenzen als basis, te weinig ruimte weigeren, één undo.
- Expliciete lokale geometrievoorkeuren bewaren/toepassen/wissen, maximaal20. Alleen maat/posities/formaten/typen, geen logo’s/tekst/klantIDs; zelfde maat en aantallen/typen vereist. Geen passief plaatsingsleren aangezet.

**Nog open:** volledige topologische verbonden-kleursegmentatie. De nieuwe eilandherkenning kan gesloten gevulde subpaden met gescheiden begrenzingsvakken splitsen, maar houdt overlappende vakken samen en verenigt geen verschillende paden. Ook complexe SVG-effecten en analytisch exacte zichtbare grenzen blijven begrensd door de bestaande vectorveiligheid; eigen logo’s en printuitkomst controleren.

Bronnen: logo-colors, outline-tools, placement-tools, import-and-vectorize, export.js, shared/design-transfer en vector-export. Geen Illustrator-achtige topologische segmentatie of fysieke productieproef claimen.

## 4. CRM en overige meldingen

Vervolg op doe batch4 na hervatten van batch3: [lokale batch4afronding](BATCH4-MAIL-EN-CRM-20261026.md). Labels klappen binnen de pagina uit bij Meer; onafhankelijke busy-status en inline labelconflictherstel. Gesprekrefresh bewaart ook tijdens ophalen getypte tekst en het oorspronkelijke antwoordanker; template-/vragenonderwerp blijft bij reply behouden. Geen tests/publicatie.

- Mailberichten krijgen gelijke strakke kaders zonder de dikke gekleurde linkerstrip. Inkomend/uitgaand blijft leesbaar in de berichtkop.
- CRM-labelstrook heeft eigen ruimte en grens. Uitleg en Gmail-/fase-instellingen staan ingeklapt; de gewone labelkeuzes blijven direct bereikbaar.
- Concepten, ontvanger/replykeuze, instellingen, Gmailrechten en provideracties blijven bestaande routes. Geen mail verzonden of Gmail gewijzigd.
- De overige meldingen zijn aangesloten op de bestaande vier feedbackbatches en de latere broncorrecties: mobiel/invoer, contact/factuurmail, templates/reply, aanbetalingsvoorstel, correctie met behoud historie, factuurvervolg/ontvangstselectie, benoemde kosten, routevergelijking, klantnummer, hoofdafbeelding en lege vakken.
- Financiële betekenis blijft eerlijk: PDF gereed is geen verzendbewijs; betaling is geen fysieke productie. De nieuwste50%-afspraak vervangt het oude70%-idee. Expliciet gratis blijft anders dan onbekend; geen nulprijzen, oude facturen of klantgegevens stil herschrijven. Externe verzending kan bewust geregistreerd worden.

Nog niet volledig automatisch doorgevoerd: productievrijgave bij50% vraagt nog bevestiging; PDF/betaallink maken is geen verzending en wist niet automatisch alle verzendherinneringen; routeafstand/rijtijd/optimalisatie blijven handmatig/extern. Volledige materiaalopbouw vereist echte brongegevens. Zie batch4doc voor de precieze grenzen.

Bronnen: admin/mail/mail.css, thread-labels.js, gmail-label-review.js, shared/mail-thread-labels.js, mail-workspace.js en bestaande klant-/betalings-/document-/routefeatures. De volledige privé-ID-matrix bevat elke exportmelding en de drie extra lokale meldingen. Geen feedback resolve of opgeslagen gebruikersstatus gewijzigd.

## Zelf controleren, met proefontwerp/proeforder

1. Maak A/B bij één product, geef verschillende namen en inhoud, heropen beide en bewaar meerdere keren. Open een oude revisie als nieuwe variant. Kies definitief, wijzig de andere variant en daarna de gekozen variant; controleer opnieuw kiezen, gelijkblijvende aantallen/prijzen en bestanden.
2. Probeer hoofdletters, native/importfont, hover verlaten en kiezen, undo/redo, kopie openen/pop-upblokkade, overdracht/reload en PNG/PDF. Beoordeel snelheid en mobiel; niet verversen in een tab met onbewaard werk.
3. Probeer kleur vervangen/weghalen, transparantie, rand in verschillende breedtes, spiegel/rotatie, vectorvoorbeeld stoppen/toepassen, meerdere objecten verdelen en eigen geometrievoorkeuren. Controleer werkelijke printmaat/contouren zelf.
4. Beoordeel mailkaders en labels bij beide bedrijven; controleer bestaande klant-/betaal-/documentroutes zonder fictieve acties op echte klanten uit te voeren.

## Status

Vier afgebakende bouwtaken bij Jouw controle / alleen lokaal, met append-only bronnotities via scripts/build-task.mjs. Niet alle47meldingen zijn daardoor afgehandeld; meerledige meldingen en eigen controle blijven open. Geen GitHubupload of publicatie. De nieuwe varianten-/validatiecode moet bij een latere expliciete release met de serverzijde meegaan; deze ronde levert geen online wijzigingen.
