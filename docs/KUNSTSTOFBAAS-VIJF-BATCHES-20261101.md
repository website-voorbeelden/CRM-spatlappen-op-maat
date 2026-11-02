> Vervolg2november: nieuw aangeleverde reeds gepubliceerde PACKS v3 geïntegreerd als bronbaseline. [Werkelijke cloudinrichting en open stappen](PACKS-WORKER-V3-CRM-AANSLUITING-20261102.md). Preview-schema/bindings nu ingericht, CRM-bron nog ongepubliceerd; Worker/shared secrets/Origin/login/account/documentservice/eigen proef open. Oudere onderstaande stand beschrijft de voorgaande vijf-batchronde.

> Vervolg na rate-limit: batch2 hervat en de reeds opgedragen batches3–5 daarna lokaal in bron aangesloten. Geen tests of publicatie; inrichting/activering en jouw controle blijven open.

# Kunststofbaas — vijf vervolgbatches, 1 november 2026

Opdrachtverloop: eerst voorbereiden, daarna batches1–5 expliciet gevraagd; de onderbroken batch2 eerst hervat. Alleen Maatwerkkunststof. Dit is de nieuwe ronde rond de leveranciersworkflow, PACKS en inkomende/uitgaande mail; geen hernoeming of afhandeling van historische feedbackmeldingen. Alle eerdere taken, opmerkingen, bestanden en gebruikersstatus blijven behouden.

| Batch / vaste bouwtaak | Scope | Status | Levering |
|---|---|---|---|
| 1 · maat-supplier-nov1-batch1 | Werkvolgorde, adresinvoer en knopvervolg | Gebouwd in bron; eigen controle open | Lokaal |
| 2 · maat-supplier-nov1-batch2 | PACKS aansluiten op proefomgeving, datumkeuze, prominente pakbonreferentie | [Planning/pakbon/serviceroute brongebouwd](KUNSTSTOFBAAS-BATCH2-20261101.md); inrichting/vrijgave/eigen proef open | Lokaal, niet geactiveerd |
| 3 · maat-supplier-nov1-batch3 | Outlook-bevestigingen en originele PDF’s automatisch ontvangen | [Leeskoppeling/wachtrij brongebouwd](KUNSTSTOFBAAS-BATCH3-20261101.md); Microsoft/inrichting/eigen controle open | Lokaal, niet geactiveerd |
| 4 · maat-supplier-nov1-batch4 | Mail/factuur/orders vergelijken en bewerkbare kosten accepteren | [Bronwissel/matching/artikelkostenvoorstel brongebouwd](KUNSTSTOFBAAS-BATCH4-20261101.md); eigen controle open | Lokaal |
| 5 · maat-supplier-nov1-batch5 | Korte leveranciersmail, juiste twee PDF’s, TJ Worx-afzender en eigen proef | [Korte mail/twee-PDF-serverbewaking brongebouwd](KUNSTSTOFBAAS-BATCH5-20261101.md); afzender/inrichting/eigen proef open | Lokaal |

## Batch 1 — wat nu veranderd is

De bestaande directe invoer is behouden: naam en groot afleveradresvak, losse PACKS-adresvelden, één Kunststofbaas-bestelnummer dat bij verlaten/Enter bewaart, PDF slepen, kostenacceptatie en compacte producten vóór pakbon/label/mail. De kopieertekst bevat uitsluitend naam, afleveradres/land en ons ordernummer. Geen extra product-/telefoon-/leveranciersinformatie aan deze tekst toegevoegd.

- Ons ordernummer staat ook in de eerste stapkop. Kopieertekst en adresinvoer staan bij voldoende breedte naast elkaar, op een smal scherm onder elkaar. Kunststofbaas openen staat direct naast kopiëren en opent hun gewone website in een aparte tab. Dit logt niet in en plaatst geen bestelling.
- Bij een landwijziging worden handmatig ingevulde losse adresvelden niet opnieuw door de parser overschreven. Zonder handmatige splitsingswijziging mag een compleet parsevoorstel worden overgenomen; een onvolledig voorstel wist geen bestaande losse velden. Plakken/vervangen van het grote adresvak blijft een bewuste nieuwe parsepoging. De daaropvolgende change-gebeurtenis voert dezelfde inputinterpretatie niet nogmaals uit. Terugzetten herstelt ook bronmarkering en parse-uitleg.
- Een nummeropslagfout wordt alleen als reeds gecommitteerd behandeld wanneer de eigen unieke activiteit én het opgeslagen nummer terug te vinden zijn. Een toevallig gelijk nummer uit een andere wijziging bewijst geen geslaagde eigen opslag.
- Fouten bij kopiëren of een logistieke vervolgstap blijven zichtbaar op de tab. Een ongeldige veldinvoer krijgt focus bij de bestaande veldbegeleiding; onafgehandelde factuurinvoer krijgt de eigen factuurstatus en open kostenweergave. Opnieuw proberen of een geslaagde eigen bronopslag ruimt de relevante oude melding op.
- Bestaande actuele pakbon/label bekijken of downloaden kan tijdens factuur-/adresinvoer, zonder die invoer te bewaren, te accepteren, te wissen of een nieuw document te maken. Sluiten en Downloaden in de bestaande alleen-lezen bijlageviewer zijn ook toegestaan door de invoerbewaking. Die leesroute leest alleen bewaarde state/files en vervangt de centrale contextstate niet. Ontbrekende/verouderde bestanden blijven een zichtbare fout; een expliciet mislukte download wordt niet stil genegeerd. Een verlaten tab opent geen laat bestand meer.
- Nieuwe pakbon/label/mailacties wachten nog steeds op de eigen referentie-/adresopslag en op afgeronde factuurinvoer. De actiesectie blijft tijdens openen tijdelijk geblokkeerd met een korte voortgangsmelding, ook wanneer nummeropslag de knoppen opnieuw tekent. Eén actieve handeling, geen tweede klik die stil een tweede actie start.
- Zonder leveranciersnummer is stap 4 zichtbaar met één korte verwijzing naar stap 2. Geen extra bevestigingsknop, geen knop die zonder nummer probeert te boeken. Voor werkelijk boeken blijven alle bestaande server-, account-, registratie- en eigen bevestigingsgrenzen gelden.
- Mislukte logistieke vervolgacties voegen een generieke stapmelding toe aan de bestaande tijdelijke feedbackdiagnostiek. Geen adres, factuurbedrag, PDF, toegangslink, wachtwoord of providerantwoord in deze nieuwe melding; niets automatisch verstuurd of als afgehandeld gemarkeerd.

De nieuwe statushelper bezit alleen DOM-meldingen en veldfocus. Featureconstructie vraagt geen company/runtime/state op. CSS uitsluitend bij de bestaande supplierregels in admin/style.css. Gedeelde opslag, klantadres-synchronisatie, financiële berekeningen, factuuracceptatie, originele bestanden en conflictdetectie blijven bij hun bestaande eigenaren.

## Jouw controle voor batch 1

Bewaar eventuele open invoer voordat je zelf lokaal vernieuwt. Open een Maat-order → Kunststofbaas. Beoordeel daar de volgorde en de exacte kopieertekst; plak een adres, pas losse velden en daarna het land aan. Controleer nummer bewaren met Enter/veld verlaten, en of PDF/kosteninvoer behouden blijft. Met aanwezige actuele documenten kun je bekijken/downloaden terwijl je iets invult; een nieuwe logistieke handeling vraagt eerst om de begonnen invoer af te ronden. Geen echte PACKS-boeking of mail nodig voor deze beoordeling. Smalle schermindeling, twee tabs/conflicten en mislukte opslag zijn nog niet door Codex functioneel gecontroleerd.

## Batches 2–5 · bron en resterende inrichting

**2. PACKS eerst:** bestaand eigen workerpakket en CRM-route aansluiten op een afzonderlijke proefomgeving met dezelfde registry/opslagidentiteit; operationele accountrechten en dienstlimieten niet raden. Automatisch door PACKS laten plannen versus expliciete datum door voorbereiding, payload, resultaat en mail verwerken. Pakketmaten/gewicht zelf kunnen beoordelen en aanpassen. Hun volledige nummer prominent op de nieuwe pakbon, zonder onze interne documentreeks of oude documenten te wijzigen. Onzeker boekingsresultaat herstellen, niet opnieuw boeken. Publicatie en echte uitvoering blijven aparte acties.

**3. Inkomende Outlook-mail:** bestaand ontvangstadres behouden als uitgangspunt. Tijdens de eerdere voorbereiding zijn alleen gericht profiel, bevestigingsmetadata en één bijlagelijst gelezen: de mailbox is bereikbaar, hun bevestigingen bevatten het volledige bestelnummer en er is een ingebedde factuur-PDF. Dit is geen ingerichte permanente CRM-integratie. Aparte beperkte leesmachtiging/configuratie, originele bronbewaring, begrensde bijlageverwerking, deduplicatie en gemiste-berichtenherstel voorbereiden. Onzekere of meerdere matches in een keuzelijst, geen bank-/verzendfeit uit alleen mailtekst. Geen account of doorstuurregel nu gewijzigd.

**4. Kostenvoorstel uit die bron:** bestaande factuurinvoer en bewijs-/revisie-/duplicaatregels hergebruiken. Exact leveranciersnummer en waar beschikbaar ons nummer combineren; productregels, CNC/opstart/transport/btw afzonderlijk tonen. Afwijkingen zichtbaar, geen adreswijziging door N/A of factuurtekst. Kosten pas na eigen acceptatie, nooit automatisch een betaling. Leverancierspakbon uitsluitend controlebewijs. Dubbele aanvoer via PDF/link/mail mag niet tot dubbele kosten leiden.

**5. Uitgaande mail en eigen eindcontrole:** bevestigd TJ Worx-afzenderadres via bestaande verzenddienst; onderwerp `Pakbon <hun nummer> - Order <ons nummer>`, korte adres-/aantal-/datumgegevens, alleen de twee juiste actuele originele PDF’s. Gewone mail en proefmail afzonderlijk, proefontvanger aanvankelijk het afgesproken eigen adres maar bewerkbaar. Concept, aanbod aan de maildienst en echte aflevering niet verwarren. Bij onbekend verzendresultaat eerst dezelfde poging onderzoeken. Jouw praktijkcontrole, GitHubupload en livepublicatie niet afvinken omdat de bron bestaat.

## Lokaal bekijken en wat nog niet werkt zonder inrichting

Bewaar je open invoer vóór verversen. Open lokaal een Maat-order → Kunststofbaas. De bestaande bestel-/adres-/nummer-/PDF-invoer en nieuwe kostenvoorstellen zijn daar te beoordelen. Nieuwe pakbonnen met de prominente leverancierskop vragen óók de bijgewerkte documentservice; die is in deze ronde niet herstart. Een nog draaiende oude service geeft daarom een gerichte melding in plaats van een ongemerkt verkeerde pakbon.

Facturen uit Outlook staat als optionele sectie klaar, maar lokaal ophalen is bewust niet actief zonder de aparte online Microsoft-koppeling. Echte PACKS-boeking vereist de bedoelde serverinrichting/accountvrijgave; gewone leveranciersmail vereist de passende centrale twee-PDF-controle en ingestelde afzender. De bron-ZIP uit batch2 is geen zelfstandige complete CRM-installatie. Geen reële verzending proberen op basis van alleen deze bronstand.

## Werkelijk uitgevoerd

Alleen lokale bron-/documentlezing, bronbewerking en bouwadministratie. Geen automatische tests/checks/syntaxchecks/builds/generatoren, app-/modeluitvoering, browser-/DOM-/visuele QA, runtimeherstart, echte CRM-recordmutatie, mailboxactie, providerlogin/boeking/label/mail, resource/secret/migratie, Git/index/GitHub of publicatie. Nieuwe cacheverwijzingen laten de gewijzigde modules en bronplanning na eigen verversen ophalen. Alle vijf batches hebben nu bronwerk. Operationele inrichting/activering, de hoofdtaak en jouw beoordeling blijven open; geen historische feedback of praktijkcontrole als afgehandeld gemarkeerd.
