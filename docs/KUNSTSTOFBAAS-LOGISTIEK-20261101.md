# Kunststofbaas — logistieke referentie, documentacties en factuurdatums

1 november 2026. Alleen lokaal brongebouwd voor eigen controle, geen tests/checks/syntaxchecks/build/generator/CRM-browsercontrole. Twee door de gebruiker aangeleverde factuur-PDF’s zijn uitsluitend als documentbron gelezen en weergegeven. Geen werkelijke orders/facturen/bestanden/labels/betalingen of accountconfiguratie gewijzigd, geen providerlogin/boeking/mail of publicatie.

## Hun nummer is leidend

Gebruik bij Bestelnummer van Kunststofbaas het volledige **Bestelnummer op hun factuur/bevestiging**. Het korte order_ids-nummer in een downloadlink is een intern document-/webshop-ID en kan daarvan afwijken. De URL-invoer toont dat voortaan expliciet en biedt dat interne ID niet meer als bestelnummerovername aan. Geen bestaande ordernummers gemigreerd of geraden; vul een eerder verkort nummer zelf aan.

De PACKS-kopieerknop kopieert nu uitsluitend het bewaarde Kunststofbaas-bestelnummer, zonder omschrijving of ons CRM-nummer. Zonder hun nummer blijft de knop uit. Bij nummer bewaren wordt de zichtbare kopieertekst meteen bijgewerkt; kopiëren leest de bron opnieuw. De voorgestelde labelText in het PACKS-boekvenster is hetzelfde volledige nummer. Pakketvolgnummers kunnen bij meer colli volgens de bestaande providergrens worden toegevoegd.

De API gebruikt daarnaast nog steeds een unieke interne pogingcode als shipperShipmentId, met dezelfde register-/herstel-/antwoordidentiteitsregels. Dit is bewust niet vervangen door een mogelijk opnieuw gebruikt bestelnummer. De zichtbare labelreferentie en de technische boekingsidentiteit zijn verschillende velden. Of PACKS in zijn portaal daarnaast een apart klantreferentieveld nodig heeft, hoort bij de open account-/referentiebevestiging vóór ingebruikname; geen claim dat alle technische provider-ID’s nu hun bestelnummer zijn.

Nieuwe standaardbeschrijvingen beginnen met hun bestelling en verwijzen naar onze pakbon/PACKS-label voor aflevering. Bekende aflevergegevens en productcontrole blijven erbij. Onze eigen orderreferentie is aanvullend; vóór een bekend leveranciersnummer mag de bestelbeschrijving duidelijk ons nummer gebruiken. Een template mag de leveranciersreferentie of onze referentie bevatten, zonder verplicht ons nummer overal toe te voegen. Eigen bewaarde templates/orderteksten en bestaande mails/documenten blijven behouden; pas zo nodig zelf de eigen standaard aan of herstel de nieuwe standaard. De gewone leveranciersmail en proefmail krijgen hun bestelnummer vooraan in het nieuwe onderwerp. Logistieke controlekoppen tonen hun nummer eerst, ons nummer als intern.

## Drie directe acties

Bovenaan Kunststofbaas staat nu hetzelfde leveranciersproces als drie zichtbare stappen:

1. **Pakbon genereren**: bestaande eigen pakbonmaker met leverancierskoppeling. Hun bestelnummer is de gekoppelde klantreferentie/opmerking volgens de bestaande bewuste keuze. Eerdere versies blijven staan. Generatie blijft een eigen formulier met voorbeeld en bewaren.
2. **PACKS-label aanmaken**: bestaande beveiligde boek-/herstelroute met pakketcontrole en laatste boekbevestiging. Onder Meer ook pakketgegevens voorbereiden en een reeds in het PACKS-portaal gemaakt origineel label toevoegen. De knop is geen boeking op zichzelf.
3. **Mail naar Kunststofbaas**: bestaande mailmaker met precies de actuele pakbon-PDF en het actuele PACKS-label bijgevoegd. De ontvanger is de bewaarde leveranciersontvanger, standaard info@kunststofbaas.nl. Eerst mail/bijlagen beoordelen, daarna eigen knop Versturen. Geen mail uit alleen de nieuwe knop. Een al aangeboden/pending/onzeker bericht wordt bekeken/hersteld, niet stil opnieuw verstuurd. Testlabel/mailproefstand krijgt alleen de proefmail naar het gekozen proefadres.

Eerst de actuele geplaatste bestelling bevestigen; alleen het leveranciersnummer invullen bewijst dat niet. Ontbrekende/gewijzigde bestelling of bijlage geeft een zichtbare vervolgstap. Eén volgende hoofdactie; de andere knoppen blijven gewone acties. Pakbon kan onafhankelijk van het label gemaakt worden. Na de directe bevestigings-/pakbon-/labelopslag terug naar de ordertab; oude modalroute behoudt zijn eerdere vervolg. Nieuwe acties lezen opgeslagen state opnieuw en vervangen geen begonnen invoer/geopend formulier. Inline factuurinvoer blijft haar bestaande bescherming houden.

## Factuurherkenning uit werkelijke voorbeelden

Factuurkoppen staan in twee kolommen en kunnen in tekst op één regel terechtkomen. De herkenning splitst uitsluitend bekende expliciete koplabels en leest Nederlandse/Engelse maandnamen, onder andere maand dag, jaar. Kalenderdatum strikt valideren; Besteldatum is geen fallback voor Factuurdatum. Bewaarde waarde blijft YYYY-MM-DD, normale numerieke datums blijven ondersteund. Conflicterende factuurdatums blijven een eigen controlepunt.

De tabel heeft een Artikelnummer- en Productkolom. Productomschrijvingen worden zonder de aparte artikelcode voorgesteld wanneer die kolommen leesbaar zijn. Lengte/breedte/dikte/meeteenheid op vervolgregels blijven bij de voorgestelde productomschrijving, zonder productbinding of maatberekening te raden. Instelkosten CNC en Programmakosten CNC zijn afzonderlijke bijkomende regels, geen extra fysieke productstuks. Expliciete verzendkosten rechts bij het totaal kunnen worden gelezen ook als links klantopmerkingen staan. Subtotaal wordt niet blind als volledig netto gebruikt als verzending apart staat; de bestaande netto/bruto/btw- en regelsomcontrole blijft verplicht.

Verzenden naar: N/A is geen afleveradres en wijzigt geen CRM-adres. Deze factuurroute bevat geen adresmutatie. Het echte adres blijft bij de order en in de bestelbeschrijving/opmerkingen, onze pakbon en het label. De facturen zijn brongegevens, geen instructies of bewijs dat een pakket daadwerkelijk klaar/verzonden/betaald is. Geen automatische verwerking van deze twee facturen in CRM.

## Bron en open werk

Admin supplier-fulfilment is de eigenaar van het actieblok en de bestaande acties; supplier-workspace composeert deze via de al aanwezige featurefactory, geen tweede boek-/mailfabriek. Pure invoice-header voegt kalender-/kopherkenning toe, supplier-invoice-recognition verwerkt de gelezen tabelvarianten; supplier-invoice-intake blijft financiële eigenaar. CSS centraal en oude wijzigingen/gegevens/templates/bestanden/Git-staging behouden.

Taak maat-logistics-reference-20261101 review/local. Eigen controle nummer/URL-ID/label/kopie/standaard/eigen teksten/knoppen/afhankelijkheden/bronwijzigingen/nieuwe versus bestaande mails/bijlagen/maanddatum/CNC/verzending/N-A/twee tabs/back-up open. Geen geslaagde werking uit bronlezing of PDF-brononderzoek afleiden. Werkelijke centrale PACKS-inrichting en eerste eigen boekings-/mailcontrole blijven afzonderlijk en open; zie PACKS-EERSTE-ZENDING-20261101.md.
