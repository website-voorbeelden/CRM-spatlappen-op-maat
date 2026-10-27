> Actuele aanvulling26oktober: [batch4 mail en CRM](BATCH4-MAIL-EN-CRM-20261026.md). Meer met labels klapt binnen de pagina uit; labelconflicten zonder gesprekheropening; refresh bewaart recente invoer en oorspronkelijk antwoord. Deze ronde uitsluitend bronwerk, geen tests/publicatie.

> Actuele batch3-aanvulling, 23 oktober: [klant en mailwerkproces](KLANT-EN-MAILWERKPROCES.md). Contact inline aanpassen, templatekeuze direct bij tekst en bewerken zonder oudermail vervangen; consistente reply-/nieuwkeuze. Alleen lokale bron, niet getest/gepubliceerd. Oudere testbeschrijvingen hieronder zijn historie.

# Mailwerkplek en offerteaanvragen

De nieuwe werkplek staat op **E-mail** en in het **E-mailtabblad van een order**. In de algemene mailbox staan gesprekken links en het antwoord rechts. In een order opent het recentste bewaarde Gmail-gesprek direct over de volle breedte; als er geen Gmail-gesprek is, opent het recentste CRM-gesprek. **Gesprekken** opent de wissellijst en filters. Mails worden als veilige tekst getoond, zonder actieve HTML of externe afbeeldingen.

## Lezen en antwoorden

- Klik **Bijwerken** om recente Gmail-berichten te laden. Via **Oudere mails laden** kun je de volgende pagina binnen de gekozen periode ophalen (7, 30, 90 dagen of een jaar). Weergaves: alles, Gmail Inbox, Gmail Verzonden, CRM aangeboden en CRM-concepten. Zoeken doorzoekt de geladen metadata en bewaarde tekst, niet heel Gmail.
- Selecteer een gesprek en schrijf direct je antwoord. Reply-To wordt gebruikt als het één adres bevat, anders controleer je de geadresseerde zelf. **Voorbeeld & versturen** opent de bestaande verzendcontrole. Alleen de aparte **Versturen**-knop biedt het bericht aan SMTP2GO aan.
- **Uitgebreid bericht / bijlage** opent het bestaande formulier met je tekst, onderwerp en antwoordheader. Daar blijven de bewerkbare templates, betaallink- en documenthulp beschikbaar.
- **Gespreksopties → Gesprek bijwerken** leest de hele thread opnieuw en bewaart je getypte antwoord. **Berichten bij dossier bewaren** slaat nieuwe mails in het CRM op zonder dubbele berichten. Je antwoord blijft ook bij deze stap behouden.
- **Gmail-gesprek koppelen** en **Bewaard gesprek koppelen** staan onder **Meer** bij een order. Verplaatsen naar een ander dossier vraagt de bestaande bevestiging. **CRM-kopie verwijderen** verwijdert alleen de lokale archiefkopie; Gmail, betalingen en verzendhistorie blijven behouden.
- **Meer → Automatisch bijwerken** is optioneel, standaard uit, per bedrijf/browser bewaard. Controle vindt plaats wanneer het CRM open en zichtbaar is en er geen open dialoog, actieve invoer of onbewaarde formulierwijzigingen zijn. De automatische controle blijft bij geslaagde controles elke minuut lopen, ook bij ongewijzigde resultaten. Alleen bij fouten wordt tijdelijk minder vaak geprobeerd. Tabbladen van hetzelfde bedrijf delen een laatste controletijdstip om dubbele controles te beperken; dit is geen serverbrede quota-administratie. Dit is geen server-webhook of achtergrondtaak na sluiten.

Gmail blijft technisch read-only. Er worden geen extra Google-scopes aangevraagd. Google-concepten, labels, archiveren en verwijderen in Gmail zijn geen actieve nieuwe functies. Gmail Verzonden toont wat Gmail zelf bevat; via SMTP2GO verzonden CRM-mail staat in het CRM en verschijnt niet automatisch in Gmail Verzonden. Antwoordheaders worden meegestuurd, maar de ontvangende mailclient bepaalt de uiteindelijke threadindeling.

## Van formulier naar aanvraagorder

Bij een ingelezen gesprek staat **Offerteaanvraag → klant & order** of **Als aanvraag verwerken**. Je controleert klantnaam, klantadres, product en herkende gegevens voordat het concept wordt opgeslagen. Een bestaande klant wordt alleen hergebruikt bij één eenduidige match op klant-/factuur-e-mailadres. Het formulieradres en Reply-To worden vergeleken; verschillen vragen controle. Een thread die al bij een order hoort blijft daar: vul die order aan in plaats van een tweede order onder dezelfde thread te maken.

Voor Maatwerkkunststof is de bronregel: **aanvragen@tjworx.nl**, onderwerp begint met **Nieuwe offerteaanvraag:**, ontvanger op **maatwerkkunststof.nl**. Ronde producten herkennen expliciete buitendiameter, gatdiameter en dikte in mm/cm. Er worden geen prijzen, fictieve maten, adressen of betalingen ingevuld. Zonder aantal blijft de productlijst leeg. Meerdere aantallen/materialen vereisen handmatige beoordeling; de herkenning is een voorstel, geen volledige productparser.

**Aanvraagverwerking** biedt optioneel automatisch klaarzetten. Dit staat standaard uit en verstuurt nooit mail. Na bewust inschakelen worden alleen nieuwe aanvragen vanaf dat moment verwerkt, met een door de Google-server gerapporteerde DKIM-verificatie voor het afzenderdomein en eenduidige klantgegevens. Een verwijderde eerdere order wordt niet automatisch opnieuw aangemaakt. Onzekere aanvragen kun je handmatig beoordelen. Voor Spatlappen wordt noreply@spatlappenopmaat.nl herkend met onderwerp Nieuwe aanvraag spatlappen, gericht aan het bedrijfsdomein of de bekende formuliermailbox spatlappenopmaat@gmail.com. Ook de oorspronkelijke veldindeling met Bijlage en Bericht wordt ondersteund. Automatische verwerking blijft uit totdat je die zelf inschakelt.

Het Overzicht toont nieuwe aanvraagconcepten met een link naar hun ordergesprek. Bij **Gegevens invullen / afvinken** kun je aangeven wat aanwezig of bewust niet nodig is. Opslaan hiervan rondt de nieuwe-aanvraagmelding af. Het productveld en financiële gegevens worden door deze checklist niet stilzwijgend gewijzigd.

## Gegevenscontrole en AI

De order en het gekoppelde gesprek hebben een checklist: aantal, materiaal, rechthoekige maten of ronde diameter/gat, dikte voor Maatwerkkunststof en bedrukking voor Spatlappen. Als ingevulde aanvraaggegevens verschillen van de echte productregel, blijft een controlepunt zichtbaar. Voor meerdere productregels moet je de producten afzonderlijk beoordelen; de checklist is momenteel op orderniveau.

**Aanvraag ontvangen** en **Ontbrekende gegevens opvragen** vullen het antwoordvak. Je kunt de tekst wijzigen en controleren vóór verzending. De ontvangstbevestiging wordt niet automatisch verstuurd.

**AI: gegevens uit mail halen** zet maximaal 9.500 tekens van de geselecteerde thread klaar in de assistent. Er gaat pas tekst naar de gekoppelde AI wanneer je **Vraag sturen** kiest. De AI kan een voorstel geven voor expliciete productkenmerken; de mail wordt als onbetrouwbare bron behandeld. **Gegevens controleren** opent het formulier. Alleen jouw daaropvolgende opslaan wijzigt aanvraaggegevens. Het voorstel is bedrijfsgebonden, verloopt na 30 minuten en wordt geweigerd als het orderdossier intussen veranderd is. Prijzen, betalingen, productie en mailverzending vallen buiten deze voorsteltool.

## Opslag en controles

Dit blijft de lokale versie met bestaande bedrijfsopslag. Gmail-bijlagen worden slechts vermeld en niet gedownload. Het compacte mailarchief behoudt de bestaande grens van 10 MB; er is geen cloudmigratie of verhoging van quota uitgevoerd.

Gecontroleerd met fictieve gegevens: formulierherkenning, veilige HTML-conversie, bronverificatie, bedrijfsafscheiding, atomair opslaan en deduplicatie, klant hergebruiken, onbekenden leeg laten, geen financiële/verzendactie bij intake, conflicterende specs, voorstelverloop en wijzigingencontrole. De echte UI-handlers zijn in een DOM-fixture geoefend: inline antwoorden, preview, extra berichten, behouden invoer, terugkeer uit de ordereditor, opt-in/ontvangstdatum, verwijderen van CRM-kopie en AI-review. De aparte preview→verzendroute is getest met een fictieve SMTP-provider. Geen echte mailbox of klantmail gebruikt bij de ontwikkeling. Fysieke desktop/mobiele browsercontrole volgt bij gebruik.

## Concepten en herstel — 14 oktober 2026

**Concept opslaan** staat direct in het antwoordvak. Het bewaart het bericht bij de klant/order en behoudt bij wijzigingen het concept-ID en verzendverzoek-ID. Een bewaard concept verschijnt in het gesprek en onder CRM-concepten, wordt bij opnieuw openen hervat en kan via Concept bewerken naar het uitgebreide formulier. Bijlagen en betaallinks van bestaande concepten worden behouden. Een in een ander tabblad gewijzigd/verwijderd concept wordt niet overschreven; de getypte tekst blijft in het formulier voor controle. Aangeboden, onzekere, lopende en geweigerde berichten worden niet door de inline conceptactie herschreven.

Niet opgeslagen tekst blijft tijdens navigeren in het geheugen van deze CRM-sessie. Dit is geen automatische databaseopslag: kies Concept opslaan vóór herladen/sluiten. Bij nog niet opgeslagen tekst probeert de browser een sluit-/herlaadwaarschuwing te tonen. Op mobiele browsers is zo'n waarschuwing niet gegarandeerd. Opslaan en preview zijn tijdens dezelfde handeling onderling geblokkeerd tegen dubbele klikken. De afzonderlijke verzendbevestiging blijft verplicht.

Gewone/vraagtemplates uit de bestaande bedrijfstemplates staan ook in Snelle tekst. Variabelen voor klant/bedrijf worden ingevuld; onbekende variabelen blijven zichtbaar en blokkeren preview/opslag totdat je ze invult. Bij een antwoord blijft het gespreksonderwerp behouden. Templates met documenten blijven in Uitgebreid bericht / bijlage, met de bestaande template-editor en ontbrekende-bijlagecontrole.

Concepten krijgen het label Concept, SMTP-resultaten hun werkelijke status en Gmail-verzendingen het label Verstuurd via Gmail. Gmail Verzonden filtert alleen echte Gmail-berichten; CRM aangeboden toont SMTP-berichten met geaccepteerd resultaat, geen aflevergarantie.

Op mobiel toont de werkplek de lijst óf het gekozen gesprek. Met ← Gesprekken keer je terug zonder je tekst te verliezen. Als Gmail ophalen mislukt, blijft een bewaarde CRM-kopie leesbaar met een zichtbare waarschuwing. Zonder kopie staan Opnieuw proberen en Gmail-koppeling instellen naast de fout. Een late response van een oud gesprek/periode kan de nieuw gekozen selectie niet overschrijven.

Controles: tests/mail-drafts.mjs test expliciete opslag, ID-behoud, conflicten, dossierafscheiding, bijlagen/links, headerinjectie, verzendstatusbewaking en atomaire opslaggrens. De echte handlers zijn getest met fictieve DOM voor opslaan/hervatten/navigeren, templates, mobiele terugknop, late Gmail-responses, offline archiefweergave en gelijktijdige save/preview. Geen echte klantmail, providerverzending, extra Gmailrechten of WhatsApp-inrichting uitgevoerd.

## Vinkmenu voor gegevens opvragen — 14 oktober 2026

Bij de ordermail staat **Gegevens opvragen** en bij het antwoordvak **Gegevens kiezen & opvragen**. Kies per onderdeel Hebben we of Nog opvragen; beide uit betekent nu niet nodig. Bekende orderwaarden en ontbrekende verplichte gegevens vormen het eerste voorstel. Extra onderwerpen zoals toepassing en gewenste leverdatum kun je bewust toevoegen. Een aangevinkt Hebben we is alleen een keuze voor deze vragenmail en vult geen ontbrekende numerieke orderwaarde in.

Alleen de Nog opvragen-vinkjes en je extra vraag komen in het mailvoorstel. Onderwerp en volledige mailtekst zijn direct bewerkbaar. Als je na een eigen tekstwijziging vinkjes wijzigt, blijft je tekst staan en verschijnt uitleg. Met Voorstel opnieuw opbouwen kun je de vinkjes opnieuw verwerken, met bevestiging vóór vervangen van je eigen tekst.

Via Inleiding en afsluiting aanpassen kun je de opbouw wijzigen en bewust als standaard voor dit bedrijf bewaren. De begroeting met klantnaam wordt automatisch opnieuw samengesteld; de selectie en extra vraag worden niet automatisch in die bedrijfsstandaard gezet. De standaard is per bedrijf in de bestaande CRM-state opgeslagen, niet als gedeelde code voor beide bedrijven.

Onthoud deze checklist bij deze order bewaart de selectie en extra vraag na Tekst gebruiken. Wijzigen van relevante ordergegevens maakt een eerder bewaarde selectie ongeldig voor de volgende keer; dan wordt weer een voorstel uit actuele gegevens gemaakt. Wordt de order/checklist tijdens het openstaande venster gewijzigd, dan stopt opslaan met een melding en blijft je mailtekst staan. Orderproducten, prijzen, betalingen en productie worden niet aangepast.

Tekst gebruiken sluit het menu en vult het bestaande antwoordvak. Het vervangt je eerdere antwoord pas op dat moment. Annuleren laat het oorspronkelijke antwoord intact. Klik vervolgens Concept opslaan voor een bewaard bericht, of Voorbeeld & versturen voor de afzonderlijke verzendcontrole. Zonder geopend gesprek kun je via de orderknop eerst de vragenmail maken en daarna in de gewone composer verdergaan.

Checks: tests/inquiry-mail.mjs controleert de selectielogica, alleen geselecteerde vragen, opbouw, extra vraag, nul als bekende gatmaat en het vervallen van oude keuzes. De echte UI is met fictieve DOM-data getest voor wederzijdse checkboxkeuze, live voorstel, bescherming van handmatige tekst, opgeslagen bedrijfstekst/orderkeuze, aparte conceptopslag, annuleren en wijzigingsconflicten. Geen echte mailbox, klantmail of provideractie gebruikt. Fysieke browser-/mobielcontrole blijft een gebruikerstest.


## Formuliermail met tabel of escaped regeleinden
De herkenning leest ook HTML-tabellen met Naam/E-mail/Telefoon en Bijlage/Bericht, en formulierzenders die letterlijk `\n` in hun platte tekst zetten. Expliciete maten zoals “240cm breed en 35cm hoog” worden 2400 × 350 mm. Niet genoemde aantallen blijven onbekend. Een overgeslagen herkende aanvraag toont waarom (bijvoorbeeld vóór inschakelen ontvangen of afzender niet geverifieerd); via de aanvraagknop kun je die gecontroleerd verwerken. Herhaald ophalen maakt dezelfde aanvraag niet opnieuw aan.


## Aanvragen terugvinden
**Aanvragen & orders** toont ook aanvragen zonder productregels of bekend aantal. Het label Aanvraag, Offerte of Order onderscheidt de fase; onbekende prijzen worden als Nog te bepalen getoond. Bij hetzelfde e-mailadres blijft één klantdossier bestaan. Een andere naam op een nieuw formulier wordt bij de aanvraag bewaard en is doorzoekbaar, zonder de bestaande klantnaam te overschrijven. Een oud gesloten formulier mag het controleren van nieuwe aanvragen niet pauzeren; een nog openstaande bewerking blijft beschermd.

## Rustige indeling en eigen standaardteksten

Het order-mailtabblad laat de planning en financiële kaarten weg; die blijven op het Ordertabblad. De gesprekstekst krijgt de volledige breedte. Antwoorden springt naar het schrijfveld. Eerdere geciteerde tekst is inklapbaar en blijft volledig bewaard. Ontvanger en onderwerp kun je uitklappen; de echte geadresseerde staat direct in de samenvatting. Bij een bewaarde thread met alleen een uitgaand bericht wordt diens ontvanger gebruikt, met de oorspronkelijke antwoordheader.

Kies bij het antwoord een Standaardtekst en klik Tekst bewerken om de opgeslagen versie voor toekomstige mails aan te passen. Je huidige antwoord blijft staan. Kies de standaardtekst daarna opnieuw als je de nieuwe versie in je huidige antwoord wilt invullen. Via Meer → Tekst als template bewaren maak je een eigen template van je huidige onderwerp en tekst; controleer klantgebonden tekst en vervang die zo nodig door variabelen. Bestaande naamconflicten blijven een expliciete keuze om te hernoemen of te vervangen. Aanvraag ontvangen is nu ook een echte bewerkbare template. Gegevens opvragen blijft het vragenmenu met de eigen bedrijfsopbouw. Geen templatebewerking verstuurt een mail.

Minder gebruikte acties, koppelingen, aanvraagverwerking, automatisch bijwerken en oude pagina's laden staan onder Meer of Gespreksopties. De menu's sluiten bij kiezen, buiten klikken of Escape. Nieuwe mail blijft altijd beschikbaar via Meer in een order en direct in de algemene mailbox. De initiële orderweergave gebruikt de bewaarde kopie zonder automatisch het hele gesprek op te halen. Bijwerken haalt zowel de lijst als het huidige gesprek op en bewaart je antwoordtekst.

## Zijbalk en lokaal knopgebruik

De zijbalk kan op desktop volledig verdwijnen; linksboven blijven alleen → Menu, de assistent en Feedback melden naast elkaar zichtbaar. Er blijven geen losse navigatie-iconen over; de keuze blijft per bedrijf/browser bewaard. → Menu klapt het volledige menu met alle opties en fasen terug uit. Onder Aanvragen & orders staat Fases, met aantallen en direct filteren. De fasekeuze opent de aanvragenlijst; de uitgeklapte lijst heeft een eigen scrollvlak. Op mobiel blijft het bestaande menupaneel beschikbaar.

Onder Instellingen → Mijn gebruik & lokale voorkeuren staan lokale gebruikstellers, aflopend op gebruik. We tellen uitsluitend vaste actie-IDs en of een knop binnen een Meer-menu zat. Geen klantnamen, mailinhoud, veldwaarden of externe tracking. De kleine telling wordt na een korte vertraging opgeslagen, niet via een databaseverzoek per klik. Je kunt tellen uitzetten, tellers wissen en het overzicht als JSON downloaden om bij verbeteringen te bespreken. Deze voorkeuren en tellers staan buiten CRM-back-ups en synchroniseren niet tussen apparaten. De indeling herschikt zichzelf niet automatisch.

## Gmail API-gebruik

Gecontroleerd op 15 oktober 2026: Google beschrijft standaard Gmail API-gebruik als zonder extra kosten binnen de gebruiksgrenzen en kondigt facturering boven de grenzen aan. Het werkelijke quotum kan per project verschillen. Zie https://developers.google.com/workspace/gmail/api/reference/quota?hl=en. Het CRM gebruikt dezelfde read-only scopes; SMTP2GO blijft de verzendroute. Deze UI-verbetering wijzigt geen Google-billinginstellingen. Er is geen kostengarantie of controle van je privébilling uitgevoerd.

## Stille controles en klikbare meldingen

Automatische controles van de Gmail-lijst en het ophalen van formulierthreads gebruiken geen globale laadindicator. Handmatig Bijwerken, een gesprek openen en instellingen opslaan behouden hun normale laadfeedback. De stille optie geldt per request, zodat een gelijktijdige handmatige actie haar laadindicator behoudt.

Een nieuw automatisch aangemaakte aanvraag geeft een blijvende, sluitbare melding met een link naar die aanvraag. Nieuwe inkomende berichten na de eerste controle geven een melding naar hun ordergesprek of de mailbox; klikken haalt het geselecteerde gesprek op. Een eerste lijst met bestaande berichten veroorzaakt geen stapel meldingen. Meer pagina's met oude mails laden geeft ook geen nieuwe-berichtmeldingen. Meldingen worden per aanvraag/gesprek samengevoegd en blijven in dit geopende CRM-tabblad staan totdat je ze opent of sluit. Na herladen staan nieuwe aanvragen ook in het bestaande Overzicht.

Achtergrondverwerking ververst de huidige pagina niet bij het aanmaken van een aanvraag. De melding wijst de weg; je werk blijft staan. Tijdens open formulieren of onbewaarde invoer blijven de bestaande pauzes gelden. De melding navigeert pas nadat je je huidige invoer hebt bewaard of gesloten. De automatische controle blijft optioneel met de bestaande bedrijfs-/browservoorkeur. Er zijn geen Google-billinginstellingen gewijzigd.


## Prioriteit en antwoordtijd — 16 oktober 2026

Gesprekken tonen Antwoord nodig · duur, Wacht op reactie · duur of Verzending controleren. De teller start bij het oudste ontvangen bericht na de laatste geregistreerde echte verzending in dat gesprek. Een concept, opnieuw lezen of een extra klantmail reset hem niet. Hoog bij drie dagen zonder antwoord en bij te controleren verzendingen. Afgewezen verzendingen gelden niet als antwoord; een later geaccepteerd antwoord kan een eerdere afwijzing opvolgen. Een onzeker resultaat blijft controle vragen. Onbekende/toekomstige datums krijgen Wachttijd onbekend.

Aandacht eerst sorteert lokaal; Meer → Gesprekken sorteren → Nieuwste eerst behoudt de gebruikelijke datumvolgorde. Weergave → Aandacht nodig filtert alleen geladen mail en houdt bestaande ontvangen/verzonden/conceptfilters beschikbaar. Een bereikt opvolgmoment gebruikt de dossiertermijn (standaard zeven dagen), zonder automatisch iets te versturen. De lijst gebruikt echte berichtdatums en correspondenten, geen conceptbewerking als laatste klantcontact.

Een geladen volledig gesprek wordt in de sessie gebruikt om lijstsignalen te corrigeren, zonder automatisch naar CRM of Gmail te schrijven. Tijdens filteren/sorteren en na terugkeer blijft de eigen antwoordtekst behouden, ook als het actieve gesprek niet meer in het aandachtfilter past. Bestaande aparte verzendbevestiging blijft verplicht. Dezelfde projectie levert de wachttijd bij Te doen en bij lopende klantdossiers.
