> Factuurlink1november: expliciet overgenomen ordernummer uit URL is supplierDocumentLink (rechtstreekse bron, lichtpaars), geen door PDF bevestigde match en geen wijziging van order.supplierOrderReference. Herkende documentregels donkerpaars; expliciet berekend netto calculator/lichtpaars. Nieuwe voorstelvelden binden aan getoonde waarden; bestaande handmatige invoer alleen na aparte vervangkeuze. URL/sleutel niet in herkomst. Alleen lokaal bronwerk, geen tests/publicatie. Zie KUNSTSTOFBAAS-FACTUURLINK-20261101.md.

> Factuurinvoer31oktober: nieuwe bron documentRecognition = Factuurtekst / veldherkenning, interpretatie (donkerpaars), apart van AI. Header-/regelwaarden binden op getoonde formulierwaarden, worden voor bewaarde centen opnieuw ondertekend; eigen afwijkingen verliezen de markering. Exacte productkosten uit toerekening hebben berekeningsbron, oorspronkelijke AI/tekstvelden blijven bij de factuur. Geen oude bronmarkeringen gemigreerd. Zie KUNSTSTOFBAAS-FACTUURINVOER-BATCH4-20261031.md.

> Feedback30oktober, batch3: centrale AI-/interpretatietokens staan op middenpaars #7041a6 met witte tekst; automatische overname blijft lichtpaars. In vervolgbronvergelijking behouden, geen nieuwe CSSlaag/visuele beoordeling; jouw controle open.

# Herkomst van automatisch ingevulde gegevens

Laatste gebruikersafspraak27oktober2026: paars heeft uitsluitend herkomstbetekenis. Gewone knoppen, tabs, navigatie, filters, selectie en legenda gebruiken blauw/neutrale kleuren.

| Herkomst | Kleur | Uitleg |
|---|---|---|
| Rechtstreeks overgenomen gestructureerde formulierwaarde, template, standaardwaarde, berekening, Gmailfasesynchronisatie, afgeleide bekende mailfase, afgeleide rekenfase bij complete onbesliste aanvraag of automatische mailactie | Heel lichtpaars, donkere tekst | Automatisch ingevuld / overgenomen |
| AI-voorstel | Donkerpaars, witte tekst | AI-invoer / voorstel |
| Afleiding uit vrije mailtekst | Donkerpaars, witte tekst | Uit tekst afgeleid / geïnterpreteerd; dit hoeft geen AI te zijn |
| Historische vergelijking met een bewaarde formuliermail | Donkerpaars, witte tekst | Bronvergelijking / interpretatie; historische invoerwijze onbekend |
| Handmatige invoer of ontbrekende/passendheid verloren herkomst | Geen paars | Geen herkomst verzinnen |

Hover, toetsenbordfocus of aantikken van een gemarkeerde waarde toont bronuitleg; geen herhaald AI-label naast elk veld. `shared/provenance.js` bepaalt de categorie met provenanceKind. De bestaande mode assisted/automatic beschrijft de uitvoering, niet de kleur: een bevestigd AI-voorstel blijft donker, een bewust gekozen template licht. Een volledig automatisch uitgevoerde interpretatie blijft donker. Deze wijziging activeert geen automatisering of mailverzending.

Nieuwe formulieraanvragen nemen Contactpersoon over als dat veld is opgegeven; anders wordt Naam gebruikt. Een nieuwe klant krijgt de contactpersoon, e-mail en telefoon uit het formulier. Een bestaande contactpersoon wordt nooit overschreven. Een lege contactpersoon wordt bij hergebruik alleen ingevuld bij dezelfde klantnaam, zonder andere namen in bestaande aanvragen. Handmatig gewiste of gewijzigde contactinvoer in het controlevenster blijft gerespecteerd. Als alleen een bedrijfsnaam in Naam staat, wordt daar geen fictieve persoon uit afgeleid.

De herkomst staat per veld in optionele provenance-metadata bij de record, productregel of het mailconcept. Opgeslagen worden een vaste broncode, assisted/automatic, tijdstip en een compacte waardehandtekening. Deze handtekening voorkomt dat een later handmatig gewijzigde waarde ongemerkt de oude bronkleur houdt; het is geen cryptografisch bewijs. Bij handmatig wijzigen verdwijnt de betreffende veldmarkering. Andere automatisch ingevulde velden blijven gemarkeerd. Backendvalidatie begrenst de metadata en laat alleen de bekende broncodes toe.

Markeringen zijn aangesloten op formulierklanten en aanvraagmaten, de aanvraagchecklist/editor, klanteditor/contactweergave, assistentvoorstellen voor klanten/orders/specificaties, de AI-importcontrole, standaard/default orderinvoer, gekoppelde kostprijsvelden en mailtemplates/AI-mailvoorstellen. De antwoordhulp markeert ook het nog niet gebruikte AI-antwoord, bijbehorende AI-notities/vragen en AI-geschiedenis donker; eigen vraag/instructies, meegestuurde context en knoppen blijven neutraal. Mailherkomst blijft bij opslaan/preview en in de CRM-mailhistorie bewaard. Een provideracceptatie betekent niet dat een mail volledig automatisch is verstuurd.

Bij oude dossiers bestaat niet altijd een herkomstregistratie. Als een bewaarde formuliermail exact dezelfde waarde bevat, kan de weergave die overeenkomst donkerpaars tonen met de uitleg Bronvergelijking; historische invoerwijze onbekend. Dit verandert de opgeslagen klant- of ordergegevens niet. Zonder passende bron wordt geen historische AI-herkomst verzonnen. Niet iedere historische berekening of extern verstuurde mail kan achteraf worden gemarkeerd.

## Formulierbinding en bewaren — 27 oktober 2026

admin/provenance-ui.js houdt één actuele bronbinding per invoerveld bij. Opnieuw invullen (bijvoorbeeld template naar AI-antwoord) verwijdert de oude listeners en hun eigen tooltip. Gedeeltelijke bronrecords laten andere velden met rust; een aanwezige waarde zonder geldige bron ruimt de oude binding op. Afwijkende handmatige invoer verliest de kleur; exact terugzetten kan de passende markering herstellen. Bij bewaren worden ook programmatische wijzigingen opnieuw met de oorspronkelijke veldwaarde vergeleken. Alleen een passende actuele binding wordt overgenomen, met de oorspronkelijke bron, mode en tijd. Geen nieuw tijdstip enkel doordat een concept wordt bewaard. De nieuwe waardehandtekening hoort bij de opgeslagen normalisatie.

Bestaande provenance-records/schema/validator en klant-/ordergegevens zijn niet gemigreerd. Oude dossiers krijgen geen verzonnen automatisch/AI-verleden. Herkomst is een waardemarkering en geen volledige bewerkingshistorie. Alleen broncode gelezen/bewerkt, geen tests, checks, builds, kleurmeting of browsercontrole. Philippe beoordeelt zelf bij beide bedrijven de kleuren, bronuitleg, template naar AI, handmatig aanpassen en concept bewaren/heropenen; ook native selectmenu’s en mobiel. Alleen lokaal, niet gepubliceerd.
