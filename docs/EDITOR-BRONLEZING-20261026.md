# Spatlap-ontwerptool: stand en codebevindingen

26 oktober 2026. Onderzoek door bronbestanden te lezen; geen uitgevoerde tests, checks, syntaxchecks, builds, browser-QA, exportproeven of productieproeven. Alle nieuwe correcties zijn lokaal. Er zijn geen echte klantgegevens, ontwerpen of feedbackstatussen gewijzigd. Een aangetroffen implementatie is geen bewijs dat de bediening of afdruk bij werkelijk gebruik goed werkt.

## Antwoord op de vraag of alles gedaan is

Veel van de opgeslagen feedback is eerder gebouwd en is nu daadwerkelijk in de bron teruggevonden. Niet alle ruimere wensen zijn af. De lijst hieronder geldt voor de huidige lokale bron; de publicatie van 23 oktober staat historisch in OVERDRACHT.md, maar de vijf correcties uit deze ronde zijn niet gepubliceerd. Geen actuele online controle gedaan en geen nieuwe feedbackexport ontvangen.

| Opgeslagen feedback | Wat in de code aanwezig is | Grens / nog nodig |
|---|---|---|
| Dubbelklik op SVG, los onderdeel kiezen, kleur/verwijderen/verplaatsen/schalen | Dubbelklik opent onderdeelmodus, selectAt zoekt de getroffen vorm; bestaande kleur-, verwijder-, positie- en ±10%-acties werken op het gekozen onderdeel. | Dit is een beperkte geometrie-editor, geen volledige Illustrator of gelijktijdige selectie van alle vormen met dezelfde kleur. Werkelijke logo’s controleren. |
| Spiegelen en draaien op dezelfde plaats | flipX en kwartslagrotatie om het eigen midden, ook bij meerdere complete objecten. | Nu ook expliciet behouden bij Bestand vervangen; zichtbare positie bij bijsnijden gecorrigeerd. Gebruikerscontrole open. |
| Nieuwe tekst compact, bestaande tekst voorrang | Tekst toevoegen blijft bereikbaar; bij bestaande tekst sluit het invoeronderdeel. Selectie opent het passende paneel. | Er wordt geen tweede teksteditor of nieuwe gegevensopslag gebruikt. Bedieningscontrole open. |
| Opmaak van andere tekst overnemen | Keuze Tekstopmaak neemt font, grootte, gewicht, tracking en kleur over; inhoud en positie blijven apart. | Vereist twee teksten. Font-/exportcontrole door gebruiker open. |
| Breed en groeiend tekstvak | Zijbalkbreedte, textarea groeit tot maximaal 420 schermpixels en kan daarna scrollen. | Geen onbeperkt hoog invoervak; mobiel/toetsenbord zelf beoordelen. |
| Selectie direct links openen en Enter ondersteunen | revealSelectedPanel, live textarea, meerregelige schermweergave en regels in PNG/vectoropbouw. | Meerregelige tekst in het echte exportbestand nog door gebruiker beoordelen. |
| Verticaal tussen de randen uitlijnen | balanceArtwork voor horizontale en verticale richting. | Dit is geen volledige gelijkmatige verdeling van drie of meer objecten. |
| Fontvoorbeeld boven keuze, vergelijken en meer fonts | Voorbeeld tot 60 tekens, hover/focusgalerij, drie toegevoegde lokale fonts: Metal Mania, Rye, Germania One. | Eigen TTF/OTF als gewone bewerkbare tekst importeren ontbreekt. AIhulp beschrijft alleen echte tekstcontouren als SVG; dat is daarna geen gewone tekst. |
| Bewaren en export consistent houden | Rotatie/spiegeling lopen door compacte ontwerpdata, portable transfer, PNG-canvas en vectorwrapper; tekst wordt voor PDF gecontourd. | Echte fonts en vectorcontroles blijven behouden. Geen print-/download-/bewaarproef uitgevoerd. |

Vindplaatsen: spatlap-preview.html, admin/designs/editor/runtime.js, selection-and-controls.js, text-and-objects.js, layout-and-preview.js, export.js, storage-and-integration.js, spatlap-preview-vector-editor.js, spatlap-preview-vector-export.js en shared/design-transfer.js.

## Vijf concrete fouten gevonden en lokaal gecorrigeerd

### 1. Eén verwijderkruisje kon een oude groep meenemen

De logo-/tekstlijst zette alleen de primaire selectie op de aangeklikte rij. deleteSelectedObject gebruikte daarnaast de nog bestaande multiSelection. Daardoor kon een klik op één kruisje meerdere objecten verwijderen. Ook nieuwe tekst/logo’s vervingen de primaire selectie zonder altijd de oude groep leeg te maken.

Correctie: rijverwijderen maakt eerst de groep leeg; toevoegen van een nieuw logo of tekst eveneens. De algemene selectie-verwijderactie blijft bewust een groep kunnen verwijderen. Een nog actieve hoogtereferentiekeuze wordt bij verwijderen beëindigd.

Bronnen: admin/designs/editor/text-and-objects.js, import-and-vectorize.js en runtime.js. Gebruikercontrole nodig: groep kiezen, één rij verwijderen, nieuwe tekst/logo toevoegen en daarna een selectieactie uitvoeren.

### 2. Ongedaan/opnieuw herstelde het ontwerp maar niet de tijdelijke selectie

History bewaart state, maar multiSelection en de vector-/referentiemodus staan daarbuiten. Een oude groepsverwijzing kon na undo wijzen naar een object dat in die herstelde versie niet bestaat. Acties zoals spiegelen konden daarop vastlopen of nog geldige oude groepsleden meenemen.

Correctie: undo/redo beëindigt de tijdelijke groep-, vector- en hoogtereferentiemodus en gebruikt de primaire selectie uit de herstelde ontwerpstaat. allSelectedRefs geeft alleen bestaande objecten terug. Historyonderdrukking wordt met finally beëindigd, ook als renderen een fout geeft. Er is geen nieuw opslagformaat voor ontwerpen ingevoerd.

Bronnen: admin/designs/editor/history-and-feedback.js en selection-and-controls.js. Gebruikercontrole nodig: gemengde logo-/tekstgroep, toevoegen/undo/redo en daarna verplaatsen, schalen en spiegelen. Na undo/redo kan de oude groepsselectie vervallen; de artworkinhoud wordt hersteld.

### 3. Bijsnijden verplaatste gedraaide of gespiegelde beelden verkeerd

SVG- en rasterbijsnijden telden de verschuiving van het lokale afbeeldingscentrum direct op bij de schermpositie. Na rotatie of spiegeling liggen die assen anders. Vectoronderdeel-reframe had hiervoor al een eigen transformatieberekening; de twee bijsnijroutes niet.

Correctie: één offsetArtworkCenter-helper zet een lokale verschuiving in centimeters eerst om met de bestaande spiegel-/rotatievolgorde. SVG/rasterbijsnijden en vectorreframe gebruiken nu die helper. Maten, cropgegevens en oorspronkelijke pixels/vectorpaden blijven via de bestaande routes lopen.

Bronnen: admin/designs/editor/selection-and-controls.js, import-and-vectorize.js en vector-editing.js. Gebruikercontrole nodig: asymmetrische transparante SVG en PNG, 0/90/180/270 graden, met en zonder spiegeling; zichtbare tekening vóór/na bijsnijden vergelijken en undo gebruiken. Geen geometrie- of exportproef uitgevoerd.

### 4. Bestand vervangen vergat de oriëntatie

De vervangroute bouwde een nieuw logo-object met de oude positie en w/h, maar nam rotation en flipX niet over. Een gedraaid of gespiegeld logo kon daardoor bij vervangen terugklappen naar de standaardoriëntatie.

Correctie: bestaande rotation/flipX expliciet overnemen; oude brongebonden backups blijven zoals bedoeld vervallen. Geen andere objectvelden of opslagrecords achteraf herschreven.

Bron: admin/designs/editor/runtime.js. Gebruikercontrole nodig: gedraaid én gespiegeld logo vervangen, frame vergelijken en undo/redo gebruiken.

### 5. Bewaren controleerde niet opnieuw bij welke klant de order hoort

saveProductDesign controleerde de actuele producthandtekening, maar die bevat alleen product-/ontwerpvelden. Na een tussentijdse klantwisseling op dezelfde order kon de handtekening gelijk blijven terwijl de binding nog de oude klant bevatte. De opgeslagen ontwerpcontext kon zo de oude klant-ID houden.

Correctie: binnen dezelfde bestaande state/files-transactie de actuele order.customerId vergelijken met binding.customerId, vóór enige record-/bestandsmutatie. Bij verschil afbreken met hulp om een ontwerpkopie te bewaren en opnieuw vanuit de order te openen. Geen automatische herverdeling of herstel van historische klantgegevens.

Bron: admin/product-designs.js; de editor laadt de nieuwe versie via storage-and-integration.js. Gebruikercontrole nodig: producteditor openlaten, in een andere tab de klantkoppeling wijzigen en bewaren laten weigeren zonder verlies van het onbewaarde ontwerp. Geen echte order verplaatst of bewaard tijdens dit onderzoek.

## Wat nog openstaat

- Eigen fontbestand importeren als bewerkbare tekst; de huidige SVG-contourroute is daarvoor geen volledige vervanging.
- Vrij gelijk verdelen van drie of meer objecten en verdere vereenvoudiging van exacte cm-bediening (taak 39).
- Betrouwbare grenzen bij bijzondere SVG’s en zeer kleine details. Bestaande grensmeting gebruikt gerenderde alpha tot 2048 pixels, geen analytisch exacte oplossing (taak 38).
- Eigen plaatsingsvoorkeuren toepassen/uitzetten/wissen en pas daarna eventueel leren uit bewuste bevestiging (taak 41). Er is geen automatische plaatsingslering actief.
- Een echte overlapoplosser bij nieuwe imports; de bestaande begrensde verspringing is dat niet.
- Afzonderlijk benoemde A/B-ontwerpen op één product met één definitieve keuze (taak 27). Het bestaande actieve ontwerp/revisiebeeld is geen variantensysteem.
- Jouw gebruikscontrole, mobiel, bewaring/overzetten en werkelijke PNG/PDF/drukuitkomst. De volledige feedback blijft open waar deze meer omvat dan de aanwezige bron.

## Wat ik nu van de CRM-opbouw heb gevolgd

Het CRM gebruikt gedeelde code met een bedrijfsprofiel. admin/app.js stelt de onderdelen samen met actuele getters, zodat een onderdeel niet ongemerkt een verouderde kopie van de CRM-status gebruikt. Pure regels staan grotendeels in shared; bediening in admin; serverzaken in cloudflare. Er zijn lokale browseropslag en centrale opslag, met één opslagfacade voor de gebruikte transacties. De centrale commit vergelijkt de revisie en gebruikt een stabiele commit-ID om een identieke herhaling te herkennen. De producteditor bewaart ontwerp-JSON en PNG samen met de productkoppeling via een state/files-transactie.

Dit is een bruikbare basis die ik behoud. Deze bronlezing richtte zich op de editor, de feedbackpaden en de aansluiting op opslag/product/order. Het is geen volledige doorlichting van alle mail-, betaal-, btw-, voorraad- en beveiligingsfuncties.

## Structurele verbeterpunten

1. **Editorstatus is versnipperd.** De bestanden zijn opgesplitst, maar veel functies delen nog globale toestand; selectie, history, tijdelijke referenties en async acties hebben geen enkel centraal overgangspunt. De eerste twee gevonden fouten komen daar concreet uit voort. Een volgende gerichte stap is selectieovergangen bundelen, met behoud van huidige opslag en laadvolgorde. Geen grote refactor in deze ronde.
2. **Productwijzigingen zitten op meerdere plekken.** Het gewone orderformulier en de ontwerp-bewaarroute hebben elk bescherming rond aantallen en leverancierskoppelingen. De nieuwe klantcontrole is nu toegevoegd, maar gedeelde productregels verdienen later één gerichte helper. Bestaande transacties en bedrijfsgrenzen blijven leidend.
3. **Planning bevat historische teksten.** Sommige catalogusregels noemen oudere grenzen, radiusinstellingen of publicatiestatussen. De nieuwste overdracht en bronnotities zijn daarom nodig naast de catalogus; een oude status is geen bewijs van actuele online werking. Alleen de nieuwe afgebakende bouwtaak is in deze ronde toegevoegd; geen bestaande gebruikersstatus of historie overschreven.

## Bouwadministratie

Nieuwe taak editor-integrity-20261026 staat bij Jouw controle / alleen lokaal. Bronnotitie via scripts/build-task.mjs, catalogus en leesbare roadmap bijgewerkt. De vijf codecorrecties zijn geen afhandeling van alle feedback. Geen online feedback resolve, publicatie, GitHubpush of automatische functionele controle.
