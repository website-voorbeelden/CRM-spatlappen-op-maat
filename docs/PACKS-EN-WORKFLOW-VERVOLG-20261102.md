> Nieuwste pakboncorrectie2november: zichtbare Pakbonnummer is PB- gevolgd door hun bestelnummer (PB-30268793), in veld/voorbeeld/nieuwe PDF-Wordkop en bestandsnamen. Canonieke leveranciersreferentie en technische unieke jaarreeks blijven apart; oude documenten niet herschreven. Browser/generator samen aangepast, onlinepublicatie nog apart. Alleen bron, geen tests/documentgeneratie; jouw controle open.

> Nieuwste vervolg2november: PACKS-verbinding met beide diagnoseknoppen staat helemaal onderaan, na overige opties. Eerst zelf lokaal de scherm-/factuurbediening beoordelen; daarna dezelfde bijgewerkte bron in de bedoelde online omgeving voor de volledige keten. Huidige livecode is nog ouder. Geen tests/publicatie uitgevoerd.

# PACKS en praktische Kunststofbaas-bediening

2 november 2026. Het onderbroken werk hervat; tussentijdse gebruikersfeedback in dezelfde opdracht meegenomen. Alles hieronder is lokaal bronwerk, behalve de expliciet genoemde echte read-only accountopvraag. Geen publicatie, boeking, label, mail of financiële wijziging uitgevoerd.

## Echte accountinformatie

Philippe heeft bevestigd dat hij zelf de lokale Identity-knop gebruikte en de verbinding werkt. Dat is gebruikerscontrole van die knop, niet van de volledige verzendketen.

Daarna daadwerkelijk aangemeld en `POST /api/Products/GetProductInfo` met `{}` naar de echte live-API gedaan: tokenHTTP200, dienstenHTTP200. Geen test-/netwerk-/productkeuze geraden: de Swagger-invoer maakt deze filters optioneel. Drie diensten ontvangen:

| Dienst | ID | Handler / netwerk | Gewicht per pakket | Pakketten | Landen |
|---|---|---|---|---|---|
| envelope | 1004 | Packs / NextDay | 2 kg | 9 | NL, BE, LU |
| package | 1003 | Packs / NextDay | 35 kg | 9 | NL, BE, LU |
| Packs_Export | 1030 | Packs / NextDay | 32 kg | 9 | Meerdere Europese landen, zie de actuele response |

Dit zijn waarden van deze accountopvraag, geen vast tariefcontract of permanente vrijgave. Voor gewone pakketten is package het voorstel. Die dienst gaf ook productSizeMax350. De aangeleverde officiële Swagger v9 beschrijft geen formule of maximale afzonderlijke zijden; die niet verzonnen of ingevuld. Er zijn geen prijzen uit de API afgeleid en geen toeslagen geselecteerd.

De lokale knop **Beschikbare diensten ophalen** toont een leesbare tabel, HTTP-statussen en de volledige geschoonde JSON. Alleen op jouw klik, nooit bij het openen van een order. Dezelfde private accountconfig als Identity; geen wachtwoord/token in de browser of bronlog. De vaste aparte Node-helper en lokale Host/Origin/JSON-confirmedtrue-route lezen uitsluitend de accountcatalogus. Oorspronkelijke Identity-actie blijft uitsluitend Identity. De nieuwe productknop/route is brongebouwd en niet door Codex als UI/HTTP-keten getest; de echte dienstenopvraag hierboven liep via de vaste Node-helper. De lokale servers zijn voor de nieuwe route herstart.

### Concrete boekingsfout gevonden met de echte response

De werkelijke API laat lege nullable velden weg. Alle drie diensten hadden geen validUntil; sommige hadden geen productSizeMax. De bestaande code vereiste letterlijk null en zou deze geldige responses afwijzen. `shared/packs-provider-contract.js` behandelt nu ontbreken en null gelijk, maar valideert aanwezige einddatums/limieten nog steeds en houdt de verplichte bevestigde profielgrenzen in stand. Geen verruiming van productSizeMax350 of automatische formulekeuze.

Voor dezelfde bestaande Cloudflare Worker staat één gerichte vervangingsmodule met toelichting klaar onder `work/packs-cloudflare-v3-20261102/pending-account-fix-20261102/`. Uitgangspunt exact gepubliceerde v3-module; bij eerder vastgelegde v4 bleef juist deze module gelijk. De v4-trackingtoevoegingen worden niet teruggezet. Deze correctie is NIET gepubliceerd; een volgende installatie moet eerst rekening houden met eventuele intussen nieuwere actieve bron. Geen tweede motor of register.

## Nieuwe lokale bediening

- Bestelnummer Kunststofbaas staat nu compact onder de kopieerbare beschrijving in stap1. Nog steeds één canoniek orderveld, bewaren bij verlaten/Enter. Geen nieuwe achtcijferige eis voor historische nummers; 30268793 is het invoervoorbeeld. Naam/adres blijven ernaast rechtstreeks bewerkbaar.
- Factuur & kosten is stap2; pakbon/label/mail stap3. De logistieke acties hebben directe knoppen, zonder Meer-dropdown in dat actieblok. Downloaden en pakketgegevens staan er direct onder. Alleen de actuele volgende hoofdactie krijgt nadruk.
- Bij nieuwe pakbonnen vanuit de gekoppelde leveranciersworkflow is hun nummer de vaste pakbonreferentie, zonder een overbodige koppelcheckbox. Gewone documentinvoer/andere bedrijven en bewaarde documenten behouden hun bestaande keuze/inhoud.
- Bij geblokkeerde navigatie wordt het open formulier in beeld gebracht en de factuurcontrole opengeklapt. Direct daar staan Bewaren/Kosten accepteren en Invoer wissen of bewaarde invoer terugzetten. Bewaren gebruikt het bestaande formulier met validatie; wissen gebruikt de bestaande bevestiging. Geen automatische acceptatie of verlies van PDF/velden. Een bezige actie toont eerst wachten/bestandskeuze afronden.
- Alleen zoeken in de factuurkeuze of schakelen zonder een daadwerkelijke bron-/bedragwijziging houdt de lege factuurinvoer niet als onbewaard vast. De vergelijking gebruikt werkelijke formulierwaarden, PDF/link/tekst en voorgestelde invoer; echte wijzigingen blijven beschermd. Een browser die na een knopklik focus in een schoon werkplekveld laat staan, wordt niet alleen daardoor als onbewaarde invoer behandeld.

## Factuurcontrole vóór kosten accepteren

De vergelijking staat direct bij de oorspronkelijke PDF, buiten de ingeklapte kostendetails. Zij toont factuurnummer versus PDF, werkelijk gelezen leveranciersbestelnummer versus geopende klantorder, aantallen fysieke producten, dubbele bestaande factuurnummers en expliciete maten/dikte wanneer gelezen. CNC/opstart/verzending tellen niet als fysieke stuks. Een factuur met meerdere bestellingen wordt niet met één ordertotaal als compleet beoordeeld. Niet gelezen is **Nog controleren**, niet groen akkoord. Materiaal, bewerkingen en scans worden hiermee niet volledig herkend/gecertificeerd.

Een andere factuur mag niet ongemerkt een andere klantorder selecteren. In de inline orderwerkplek blijft de huidige bewuste orderselectie staan; regels van een andere voorgestelde order krijgen geen automatische productkoppeling. Orders/producten kun je nog zelf kiezen voor een echte gecombineerde factuur. Het leveranciersbestelnummer en factuurnummer zijn verschillende nummers: alleen hun eigen betekenis wordt vergeleken.

De oorspronkelijke herkende PDF-gegevens blijven los van de bewerkbare bedragen. Ook bij bewaren wordt de huidige PDF op hash/tekst/kop/type bekeken, niet alleen een aangepast veld geloofd. Een bronwissel maakt de oude vergelijking ongeldig; bestaande invoer blijft tot bewust overnemen staan. Expliciete afwijkingen vragen de juiste PDF/koppeling of een toelichting bij Eigen toelichting, zonder extra checkbox. De bestaande duplicaat-, revisie-, deelfactuur-/hoeveelheids-, centen-, bewijs- en CAS-opslag blijft eigenaar. Geen bestaande factuur, kosten of betaling aangepast door deze bronbewerking.

## Mail en resterende activering

Zie [TJ Worx-mailvoorbereiding](TJ-WORX-MAILVOORBEREIDING-20261102.md). Ontvanger info@kunststofbaas.nl, proefvoorstel info@bouwmarktxl.nl, bewerkbaar onderwerp/tekst met precies twee actuele originele PDF's. Het bestaande ontvangstadres behouden is het voorstel; geen nieuwe mailbox nodig voor uitgaande mail. Exact TJ Worx-Van-adres/domeinverificatie en centrale serverinrichting zijn nog niet afgerond. Outlook-alleenlezen broncode is nog geen actieve automatische inbox.

Nog niet operationeel: centrale CRM/private Worker op dezelfde bedoelde opslag/sessie/secrets, accountprofiel met bevestigde maatformule/zijgrenzen en vrijgave/registergeneratie; de gerichte Workercorrectie publiceren; passende document-/mailservice; eigen boekings-/label-/mailpraktijkcontrole. Het bestaande test-Worker/previewregister blijft zonder productieorders en boeken uit. De lokale Identity/catalogushelper omzeilt deze grenzen niet. Een echte accountopvraag bewijst geen zending/label/bezorging. Geen gebruiksklaar- of 100%-claim.

Uitgevoerd: bronlezen/-vergelijking/-bewerking, de echte read-only catalogusopvraag en normale bouwadministratie/runtimeherstart. Geen automatische tests/checks/syntax/build/generator/browser/DOM/visuele QA, BookShipment/GetLabels/tracking, mail, cloudconfig-/schema-/secret-/Git-/index-/GitHub-/publicatieactie. Bestaande gegevens, bestanden, eigen templates, wijzigingen en oude staging behouden. Nieuwe schermwerking blijft voor Philippe om zelf te beoordelen.
