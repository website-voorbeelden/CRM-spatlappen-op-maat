# Kunststofbaas batch 4 — één bewerkbaar kostenvoorstel per bron

1 november 2026. Lokaal brongebouwd; jouw controle staat open. Geen tests/checks/build/browser-QA, factuur opgeslagen, betaling gemaakt of account ingesteld.

## Gebouwd in de bron

De Outlook-PDF gebruikt dezelfde financiële invoer als een gesleepte/gekozen/downloadlink-PDF. Hashes van bestaande facturen en hun historie verwijzen naar de bestaande factuurcontrole; de financiële eigenaar bewaakt daarnaast factuurnummer, bewijs, regelbedragen, dekking, andere kostenbronnen en revisies. Geen tweede factuurregister of losse automatische betaling.

Voorstellen koppelen alleen bij exact leveranciersnummer, één beschikbare order/productmatch, expliciete passende buitenmaten en voldoende resterende fysieke stuks. Dikte wordt vergeleken wanneer expliciet gelezen. Gedraaide buitenmaten mogen passen. Materiaal is hiermee niet bewezen: jij controleert de omschrijving. Onbekende, dubbele of tegenstrijdige keuzes blijven handmatig. CNC/opstart/verpakking/verzending blijven aparte kostenregels, geen extra fysieke stuks. Een AI-keuze blijft een voorstel dat je controleert.

Een nieuwe alleen-lezen tabel toont per artikel deze factuur: fysieke stuks, netto productbedrag, verdeelde overige kosten/niet-aftrekbare btw, totaal en afgerond gemiddeld stukbedrag. De orderverdeling gebruikt dezelfde centrale centenverdeling als de opslag; binnen de order volgt het artikelvoorstel de nettowaarde. Geen nieuwe kostenbron: de verdeling wordt niet nogmaals opgeslagen of opgeteld. Nog onbekende btw-aftrek blijft voorlopig. Andere facturen en overige orderkosten blijven apart; de opgeslagen marge wordt duidelijk als opgeslagen gemarkeerd.

Een bronwissel wist geen ingevulde bedragen. Hij verwijdert de oude PDF-preview en de automatische koppeling met oude herkende tekst; een zichtbaar bericht en de acceptatieknop maken duidelijk dat je de bedragen aan de huidige PDF bindt. Een nieuw voorstel vervangt je invoer pas via Nieuw voorstel overnemen. Los geplakte tekst/AI krijgt dezelfde bronvergelijking. Na directe PDF-herkenning hoeft geen tweede controlecheckbox te worden aangevinkt.

De oorspronkelijke PDF wordt ook vóór kostenopslag op herkend documenttype beoordeeld, met een begrensde hashcache. Een herkende pakbon/credit/offerte/proforma wordt niet via handmatig ingevulde JSON alsnog een gewone factuur. Een scan zonder leesbare titel kan dit niet bewijzen; de gebruiker moet het origineel beoordelen. Geen OCR- of volledige materiaal-/prijsverificatieclaim.

Importfeedback blijft direct zichtbaar en optioneel. Alleen na eigen Bewaren komt een melding in de bestaande feedbacklijst. Verslag bevat begrensde stapcodes en desgewenst bewust meegestuurde bedragen; geen ruwe PDF/mailtekst, toegangslink, sleutel of token. Een gerichte documenttypefout blijft herkenbaar. Geen zelflerende financiële regels of automatische afhandeling.

Bij begonnen factuurinvoer krijgt de kostenacceptatie voorrang boven de logistieke hoofdactie. Bestaande actuele PDF’s bekijken/downloaden blijft beschikbaar; nieuwe logistiek wacht op afgeronde invoer. Geen extra vinkjes of betalingsformulier toegevoegd.

## Eigen controle open

Controleer met eigen oorspronkelijke facturen: maanddatum, factuur-/bestelnummer, fysieke stuks en productkeuze, CNC/opstart/verzending, centenaansluiting en btw-aftrek. Beoordeel bronwissel, zelf ingevulde JSON, dubbele PDF via mail/handmatig, revisie/conflict en uitval tijdens inlezen/bewaren. Geen functionele geslaagde controle geclaimd. Outlook zelf is nog niet geactiveerd; zie batch3.
