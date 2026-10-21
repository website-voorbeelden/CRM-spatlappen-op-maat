# Spatlappen-ontwerptool: werkplan 18 oktober 2026

Doel: Philippe plaatst en vergelijkt logo’s met weinig handelingen, vooral op brede spatlappen. Alle wensen eerst geborgd in Bouwtaken 35–41. Dit plan is geen bewijs dat de functies al gebouwd zijn.

## Vaste bediening

Boven de preview: Feedback melden en bestaande PDF-actie. Direct bij de preview een rustige werkbalk voor Selectiekader, Hulplijnen en Snappen, met zichtbare aan/uitstand. Onderaan bij de huidige selectie: Kleiner/Groter, Kopiëren, Dupliceren, plaatsingshulp en Verwijderen. Geen vermenging van objectgrootte met canvaszoom. Toon groepsselectie en behoud consistente sneltoetsen (Shift toevoegen, Esc stoppen, Spatie pannen, Alt vrij slepen). Uitgebreide referentie-/afstandskeuzes in één gesloten Plaatsen-onderdeel. Mobiel ombreken, geen horizontaal onbereikbare knoppen.

## Selectie en bewegen

Muis indrukken op lege ontwerpruimte en slepen maakt een selectiekader in beide richtingen. Alle geraakte objecten worden geselecteerd; Shift voegt toe. Een geselecteerde groep samen verplaatsen, proportioneel schalen rond het gezamenlijke midden, met één undo-stap. Klik blijft enkel selecteren; losse vectoronderdelen hebben hun eigen bewerkmodus en mogen niet met complete logo’s verward worden.

## Uitlijnen en witruimte

Rode tijdelijke lijnen voor boven-/onderkant en midden van objecten; ook de middenassen van de spatlap. Tonen en snappen apart schakelbaar, Alt tijdelijk zonder snap. Tolerantie in schermpixels zodat zoom voorspelbaar blijft. Hulplijnen/selectiekader nooit in export, PDF of opgeslagen artwork. Later: referentielogo bewust kiezen, horizontaal/verticaal centreren, gelijke afstanden en verdelen. Bij brede flap een zijlogo tussen buitenrand en dichtstbijzijnde rand van middenlogo centreren; ook ondermarge gelijk aan zijmarge. Keuze uit zichtbare vrije ruimte versus midden-tot-middenafstand duidelijk benoemen: deze zijn verschillend. Gebruikerswens benoemt ook afstand tot middenlogo; bij uitvoering referentie en maat eerst zichtbaar maken, geen verborgen interpretatie.

## Zichtbare vectorgrenzen

SVG-viewBox is vaak groter dan de tekening. Gebruik zichtbare grenzen met transformaties en lijndikte voor selectie/uitlijnen. Nieuwe import mag witruimte verliezen; opgeslagen ontwerpen houden hun fysieke plaatsing en export. Fallback en onbekende grenzen eerlijk tonen bij filters/masks/clips/embedded rasters. Geen onbedoeld bijsnijden van bedrukking.

## Slimme beginpositie

Nieuwe logo’s in passende breedte én hoogte onderaan midden, met een bescheiden fysieke marge. Extreme hoge/smalle en brede logo’s passen binnen de spatlap. Tweede import niet ongemerkt over eerste plaatsen; keuze/offset zichtbaar. Vervangen behoudt bestaande maat/positie. Eerst deterministische plaatsing, daarna expliciete lokale plaatsingsvoorkeuren per maat/verhouding/type. Alleen bewuste bevestiging als voorbeeld; geen uploads/AI-training of klantlogo-opslag voor leren, transparant uitschakelen/wissen. Bestaande ontwerpen nooit automatisch opnieuw plaatsen.

## Bouwvolgorde en acceptatie

Eerst feedback en selectie/formaatbediening, daarna geometrie en hulplijnen/snappen, vervolgens witruimte en importvoorkeuren. Controle met fictieve logo’s, groepen, undo/redo, zoom en vectorbewerkmodus. Gebruiker doet verdere gebruikstest. Alle wijzigingen lokaal; publicatievraag uit vorige ronde staat afzonderlijk open.

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

## Vindbaarheid — 18 oktober 2026

Ontwerp overzetten staat direct onder preview/selectiebalk, vóór het standaard gesloten vectorpaneel. Zonder selectie legt een korte hint uit waar Kleiner/Groter/Kleur/Pipet/Dupliceren naar andere zijde verschijnen. Geen uitbreiding van de header; selectiebediening blijft contextueel. Gerichte scherm-/foutdiagnose door gebruiker toegestaan; geen functionele testtoestemming afgeleid.

## Compacte selectiebalk — 18 oktober 2026

Geen zichtbare geselecteerd-teller. Min/plus als compacte knoppen; B en H direct bewerkbaar in cm, proportioneel rondom gezamenlijk midden, ook voor groepen. Maten van zichtbare selectiekaders; tekst inclusief font-/letterafstandweergave. Geen rekken in één richting. Onderdeelbewerkmodus blokkeert schalen van geheel. Kleurvak, pipet, andere-zijde, aansnijden en verwijderen als iconen met toegankelijke namen/tooltips. Plaatsingsmenu heet Uitlijnen. Op smalle schermen mag de balk ombreken. Nieuwe invoer gebruikt bestaande schaal/undo/bereikbewaking. Geen eigen tests of builds uitgevoerd.

Correctie: Uitlijnen neemt geen volledige rij; normale selectiebalk blijft één horizontale rij. Open uitlijnpaneel zweeft boven de balk. Alleen bij zeer smalle schermen (tot480px) mag de bediening ombreken.

## Correctie bediening — 18 oktober 2026

Uitlijnen opent naar beneden; ruimere knoppen/tussenruimte. Slotje ontgrendelt losse breedte/hoogte voor logo’s en logogroepen; tekst blijft proportioneel wegens exportconsistentie. Pipet toont vergroot 11×11 bronpixelraster met centraal gemarkeerde pixel en HEX. In kleurvenster expliciete hele-logoactie met de gekozen kleur, ook vanuit onderdeelbewerking; bestaande recolorroute/signatuur bewaakt selectie. Geen eigen tests uitgevoerd.

Correctie volgorde: Vector & klantpreview vóór Ontwerp overzetten & veiligheidskopie. Klik lege artworkruimte of Esc buiten invoer/dialogen deselecteert alles, inclusief vectorbewerkmodus; pan/sleep/pipet houden hun eigen bediening.

## Zijlogo naast middenlogo — 18 oktober 2026

Tijdens slepen automatisch gelijke zijwitruimte voorstellen: buitenrand → zijlogo en zijlogo → groter centraal logo. Links/rechts, zichtbare kaderafstanden in cm, twee rode maatsegmenten; 6px-snap, bestaande toggles/Alt gelden. Referentie moet groter zijn, centraal liggen en verticaal overlappen. Geen automatische plaatsing van bestaande ontwerpen. Geavanceerde handmatige opties onder Meer. Logo/Tekst toevoegen rechtstreeks onder preview. Knopgebruik optioneel lokaal, standaard uit, alleen anonieme tellers zonder automatisch schuivende bediening; wissen mogelijk.

Dagelijkse selectieacties direct: Midden (horizontaal op spatlap), Tussen rand & logo (automatische grotere middenreferentie op huidige zijde), Onder = zij. Geavanceerde verticale opties onder Meer. Daar ook per onderdeel snapreferentie aan/uit; uitgesloten object blijft zelf verplaatsbaar. Voorkeur hoort bij ontwerp/undo en portable overdracht; telt geen klantgegevens.

Hoogte overnemen: X selecteren → knop → vector Y kiezen. X proportioneel naar hoogte Y rond eigen midden, Y behouden, één undo, X geselecteerd houden. Actieve referentiekeuze zichtbaar; Esc/lege klik annuleert. Alleen complete SVG-logo’s, geen losse vectoronderdelen.

Laatste correctie: slotje alleen links onder uitgebreide formaatinstellingen, standaard vast; linker maatvelden delen dezelfde lockkeuze. Geen cm-label in compacte balk. ＋ Logo/＋ Tekst alleen zonder selectie zichtbaar; selectietools nemen hun plaats in zodra iets geselecteerd is.

Hoogte overnemen ondersteunt ook tekst als X/Y. Meetkeuze: zichtbare volledige letterhoogte (inclusief uitstulpingen/staarten) of hoofdletterlijn gemeten aan H tot basislijn in hetzelfde font/gewicht. SVG gebruikt kaderhoogte. Dit past formaat aan, geen baseline-uitlijning; canvas-fontmeting, geen Adobe-integratie.

Hoogtemeetwijze niet permanent in werkbalk. Start Hoogte overnemen opent tijdelijk links meetwijze/uitleg. Keuze laatst gebruikt lokaal onthouden (geen ontwerp- of klantdata), gedurende referentiekeuze wijzigbaar. Voltooien/annuleren sluit en verbergt hulponderdeel.

Laatste correctie: geen Meer in balk, uitgebreide opties links onder Plaatsing & hulplijnen, automatisch open bij plaatsingsactie. ＋Logo/＋T ook met selectie beschikbaar. ↔ Tussen centreert tussen dichtstbijzijnde linker/rechtergrenzen van onderdelen (teksten inbegrepen), zonder buur spatlaprand; één onderdeel dus midden spatlap. Verticaal blijft staan. ↕ Hoogte behoudt twee-stappenkeuze. # werkt ook voor rastertransparantie, behoud bronresolutie/zichtbare fysieke maat en undo; verwijdert geen ondoorzichtige witte achtergrond.

Systeempipet waar browser EyeDropper ondersteunt: gekozen schermpixel buiten artwork mogelijk, resultaat eerst bevestigen. Shift+klik behoudt artworkloep; zonder API automatisch artworkfallback. Geen eigen schermopname, uploads of provider. Vensterblur stopt alleen custom pipet, niet browserpick.

Kleurvenster: vaste stalen in volgorde wit/zwart/donkergrijs, HEX/RGB tekstinvoer, HSL bij extra notatie. Geen RGB-schuiven of willekeurige standaardregenboog. Aanbevelingen uit recent toegepaste kleuren (alleen browser) en bekende kleuren huidig artwork. Pas toepassen verandert ontwerp.

Start met rustig laadscherm tot ontwerp/modules/fonts gereed, met herstelknop na15s zonder reset. Nieuwe automatische radius10% kortste zijde (voorheen20%); handmatige bestaande waarde behouden.

Tijdens formaatbewerking eerste Esc = invoer afronden/selectie behouden/pijltjes bewegen. Volgende losse Esc deselecteert. ✥ naast maatvelden doet hetzelfde; geen scrollsprong. Ingevoerde maat behouden, undo via bestaande wijzigingsroute.
