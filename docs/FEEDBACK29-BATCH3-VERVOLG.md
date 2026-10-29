# Batch 3 verder uitgewerkt — 29 oktober 2026

Scope: de 16 meldingen over aanbetalingen, betaalbediening, fases en facturen uit de vijf-batchindeling. Volledige Melding-ID is de vaste tag in de privéadministratie. Bestaande code uit de andere batches, invoer-btw, klantgegevens, documenten en Git-werkkopie/index behouden. De eerdere implementatie is eerst met de meldingen vergeleken; bestaande functies zijn niet opnieuw gebouwd.

## Aanbetaling voorstellen

De gedeelde paymentDepositSuggestion gebruikt de expliciete productieafspraak, anders een afgesproken levertijdaanbetaling, anders de standaard50%. Een ongeldig expliciet percentage krijgt geen verzonnen vervangende afspraak. De productievrijgavestandaard blijft50%; bestaande expliciete afwijkingen worden niet gemigreerd. Een levertijdpercentage is niet automatisch dezelfde afspraak als de productievrijgave.

Het voorstel onderscheidt doelbedrag en nog nodig tot dat doel. Voorbeeld: order200euro incl. btw, afspraak50%, al60euro ontvangen → doel100euro, voorstel40euro. Het bedrag is een rekensuggestie; bewaren registreert uitsluitend de werkelijk ontvangen betaling. Zodra de aanbetaling is bereikt stelt deze route geen dubbele aanbetaling voor. Openstaand bedrag blijft een afzonderlijke bewuste keuze.

Zowel Ontvangst registreren als een eerste betaallink bij een complete passende orderbasis gebruiken hetzelfde voorstel. Bij een factuurverzoek blijft het restant op de gekozen factuurbasis leidend. Een onbekende product-/verzendprijs levert geen vooringevuld geschat bedrag of definitief restant. Bedrag en percentage blijven aanpasbaar; suggesties krijgen de bestaande berekeningsherkomst. Presets veranderen geen afspraak of ontvangst.

Bij betaallinks volgt de resterende som de gekozen document-/orderbasis. Een afwijkend documentbedrag ten opzichte van de actuele order krijgt uitleg; een bewust hoger verzoek bewaakt zowel het ordersaldo als de gekozen basis. Voor een onbekende prijs kan de gebruiker nog zelf een echt bedrag kiezen. De bestaande bevestiging, request-ID, herhaalbescherming en actuele order-/document-/betaalbasis blijven vóór een eventuele echte gebruikersactie gelden. In deze bouwronde is geen link gemaakt of provider benaderd.

De ontvangstbasis bewaakt nu ook de levertijdaanbetalingsvelden die het voorstel kiezen. Actueel saldo ophalen houdt de invoer vast en blokkeert gelijktijdige formulieracties tijdens het ophalen. De bestaande dubbele-ontvangst-/overbetaling-/bankcontrole, datumregels en idempotente ontvangst-ID blijven behouden.

## Vrijgave en wachten op betaling

funnelPayment behoudt de bestaande bedragenberekening maar geeft alleen bekende betaalvoorwaarden bij geldige productaantallen/centprijzen, expliciet bekende niet-ontbrekende verzending, geldig tarief en geldige ontvangstbedragen in gehele centen. Ongeldige ontvangstgegevens kunnen geen automatische productievrijgave of volledig-betaaldstatus opleveren. Geen ontvangstbedrag, prijs of fysieke datum wordt hierdoor herschreven.

De bestaande automatische Spatlappen-vrijgave volgt de actuele50%- of expliciete productieafspraak plus ontwerpgoedkeuring en complete specificaties. Fysieke productie en volledige betaling vóór levering blijven apart. Er wordt bij het bekijken geen productiestart, leveranciersbestelling of betaalfeit opgeslagen.

Een gedeelde read-only guard laat automatische linkvoorstellen alleen veilige HTTPS-Tikkie-links met positief centbedrag, bruikbare status/kalendervervaldatum en passende vastgelegde prijsbasis gebruiken. Gesloten/geannuleerde/verlopen of op een andere vastgelegde basis gemaakte links geven geen automatisch Wacht op betaling of nieuw mailvoorstel. Oude links zonder basisTotal behouden hun begrensde bestaande compatibiliteit. Bij een documentbinding moet de bevestiging bij deze order horen. De faseafleiding blijft een projectie, geen fictieve verzenddatum.

De vrijgaveuitleg toont de laatste bruikbare link en, als de providerstand bewaard is, wat op die specifieke link ontvangen/open staat. Ontbrekende linkontvangsten worden niet uit het totale ordersaldo gegokt. De vrijgavedrempel blijft apart van het gevraagde linkbedrag. Recente bevestiging/link als maildefault bewaart eigen tekst, concepten, replies en expliciete keuzes. De bestaande gesprekkeuze, variabele linkpercentages en100%-bevestigingsvariant blijven bestaan; geen nieuwe mail of Gmailwijziging uitgevoerd.

## Factuur aanpassen en ontvangsten kiezen

De eerder gebouwde editor bewaart een nieuwe versie met hetzelfde nummer en houdt de eerdere PDF/Word beschikbaar. Een actieve btw-boeking, niet-eenduidige serie of ontbrekende bewerkbare payload blijft beschermd. Bij een gegenereerde huidige factuur toont de bibliotheek de reden als Aanpassen niet beschikbaar is. Losse uploads en reeds geboekte facturen blijven gedeeltelijke scope; er is geen willekeurige PDF-editor, creditnota of fiscale correctieroute toegevoegd.

Nieuw: een factuurrevisie heeft een bewuste optie Huidige ontvangsten en betaalstand op deze factuur overnemen. Standaard blijven de oude ontvangstvermelding en oude bewaarde betaalstand behouden. De gebruiker kan daarna per actuele ontvangst kiezen wat in de toelichting komt. Uitvinken wijzigt alleen de vermelding; het betaalstempel gebruikt het totaal van alle actuele ontvangsten wanneer de gebruiker actualiseren kiest. Werkelijke orderontvangsten en btw worden niet toegewezen of gewijzigd. Dit is geen afzonderlijke factuurbetalingenadministratie.

Eigen toelichting en het gegenereerde ontvangstenblok worden in nieuwe payloads apart bewaard via invoiceNoteText en selectedPayments. Bij oudere payloads wordt alleen een exact herkenbaar eindblok gescheiden. Onherkenbare vrije tekst wordt nooit op trefwoorden/datumregels verwijderd; de oude toelichting/betaalstand blijft staan met uitleg over de beperking. Een nieuwe factuur vanuit de order blijft de route om daar actuele ontvangsten te kiezen.

De samengestelde toelichting heeft vóór conversie dezelfde500tekengrens als de bestaande documentgenerator. Bij overschrijding blijft de invoer staan met een gerichte melding. Geen referenties of gebruikersnotities stil inkorten. Nieuwe facturen gebruiken dezelfde helper als revisies. De afzonderlijke metadata verandert de Word-template of documentservice niet; de converter blijft de bestaande samengestelde invoice_note lezen.

Producten/bedragen opnieuw laden actualiseert niet stil de betaalstand. PDF met optioneel Word is ook bij revisies expliciet te kiezen, standaard volgens de bestaande bestandskeuze. Als bewust het actuele btw-tarief uit de order wordt geladen, blijft de nieuwe versie niet aan een oude afwijkingsreden gekoppeld: gewijzigd tarief moet bij de actuele order horen, bijbehorende reden volgt diezelfde orderbasis. Geen actieve btw-boeking wordt herschreven.

De revisiebasis omvat nu ook de orderontvangsten en wordt voor lezen/voorbeeld en in de bestaande gezamenlijke state/files-opslag opnieuw gecontroleerd. Nieuwe/gewijzigde betaling of btw-boeking tijdens het bewerken weigert bewaren; invoer blijft staan, eerdere versies behouden. Template-/serie-/order-/CASbescherming blijft. Er zijn door de bouwer geen documenten geconverteerd, opgeslagen of gedownload.

## Factuur aanwezig, corrigeren en bestaande functies

Bij beide bedrijven geldt een aanwezige factuur-PDF als aanwezig voor de factuurstap; deze leidt niet tot een verplichte Factuur nog mailen-actie. Mail voorbereiden blijft bewust beschikbaar en een verzenddatum ontstaat alleen uit een echt geregistreerd verzendfeit. Betalings-/productie-/levervoorwaarden blijven aparte controles. Geen reeds afgehandelde gebruikerskeuze opnieuw afgevinkt.

De bestaande correctiemodal met oorspronkelijke ontvangst, reden, expliciete bevestiging, correctielog en herstelmogelijkheid blijft behouden. Vervangen vereist nu net als een nieuwe ontvangst een echte kalenderdatum uiterlijk vandaag, ook in de gedeelde regel. Een foutieve oude ontvangst uit het saldo halen blijft mogelijk, zonder providerbedrag of factuur te wijzigen. De bestaande uitsluiting tegen herimport van een verwijderde Tikkie-ontvangst blijft intact. Er is geen echte ontvangst verwijderd/gecorrigeerd/hersteld.

Punt-/kommainvoer, directe Factuur maken/mail voorbereiden na ontvangsten, automatische servercontrole en meldingen uitsluitend bij echte providerontvangsten, en orderbevestiging als offertealternatief zijn in de bestaande bron vergeleken en behouden. Er is geen providerproef of telefoondiagnose gedaan. Melding62blijft gedeeltelijk wegens configuratie/bezorging en eigen controle; melding11blijft gedeeltelijk wegens losse/geboekte facturen.

## Voortgang en eigen controle

Bouwtaak feedback29-batch3 krijgt een aanvullende review/local-bronnotitie via scripts/build-task.mjs. Alleen de16bijbehorende developmenttags/matrixregels worden bijgewerkt; de gebruikerstatus Open/Afgehandeld, afhandelnotities en alle andere batches blijven behouden. De livebasis van eerdere functies komt uitsluitend uit de historische releaseoverdracht; dit vervolg is lokaal.

Geen tests, checks, syntaxchecks, builds, browser-/DOM-/visuele QA, converterproef, runtimeherstart, provider-/mail-/betaalactie, GitHubupload, publicatie, migratie of zakelijke gegevens-/bestandsmutatie. Uitsluitend bron-/documentlezing/bewerking en bouw-/feedbackadministratie. De laadverwijzingen zijn bijgewerkt; serverpublicatie en gebruikscontrole blijven apart.

Philippe beoordeelt beide bedrijven: expliciete/default50%-afspraak, gedeeltelijke ontvangst/top-up/restant, onbekende verzending/ongeldige bedragen, bronmarkering/handmatig bedrag/percentage, bestaande link/opgeslagen verzoek/afwijkende documentbasis, geldige/verlopen/gesloten/stale links en behoud van eigen mail/reply, vrijgave/leveringsgrens, ontvangstcorrectie/invoerbehoud, factuur aanwezig zonder verplichte mailactie, nieuwe factuur en revisie met0/1/meerdere geselecteerde ontvangsten, oude betaalstand versus bewuste actualisatie, herkenbare/ongekende oude toelichting, tekstlimiet, PDF/Word, veranderende order/betaling/template/btw-boeking/serie/twee tabs. Telefoonbezorging/configuratie, losse uploads en fiscale correctieroute blijven open. Geen volledige geslaagde controleclaim.
