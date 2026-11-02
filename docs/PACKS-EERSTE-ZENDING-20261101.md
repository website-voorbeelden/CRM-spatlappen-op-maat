# PACKS — wat nog nodig is voor de eerste echte zending

Prioriteit 1 november 2026. Plan en verantwoordelijkheden; geen uitgevoerde inrichting/proef/publicatie. De ontvangende domeinen, pakketadressen en dagelijkse ronde zijn eerder door gebruiker aangeleverd; niet opnieuw om dezelfde informatie vragen. De ontvangen inloggegevens zijn geen bevestiging van test/live, toegestane dienst of Direct Booking. Geen credentials in deze documentatie.

## Wat Philippe laat bevestigen door PACKS

Vraag de contactpersoon deze zaken voor het al ontvangen API-account te bevestigen:

- Welk van de ontvangen accounts is voor de API, is dat test of live, en staat Direct Booking aan? Is er een apart testaccount of moet de eerste proef een werkelijk bedoelde livezending zijn?
- Welke dienst/product/handler/netwerk hoort bij jullie tariefafspraak en dagelijkse ronde op het bekende Kunststofbaas-adres? Bevestig landen, colli, verpakte buitenmaten/gewicht en samengestelde maatgrens, toeslagen en afhaaldagen/cutoff. Geen extra Pickup bestellen.
- Bevestig retourafhandeling bij onbestelbaar transport en de procedure bij een boeking met verloren/onzeker antwoord: hoe terugvinden zonder opnieuw te boeken? Hoe horen een unieke technische shipperShipmentId en het zichtbare Kunststofbaas-bestelnummer in de portal-/labelvelden? Welke boekstatus/labelinstellingen en datumweergave zijn voor dit account vereist?

Bestaande contractpunten PK01–11 blijven de fijnere bron; bovenstaande bundelt ze tot bruikbare vragen. Geen algemene kosteloze-proefgarantie uit niet scannen/vervallen afleiden. Geen mail aan PACKS verstuurd door Codex.

## Werk voor de CRM-bouwer/beheerder

Na die bevestigingen kan het passende accountprofiel concreet ingevuld worden. De bouwer moet de centrale Maat-CRM-login/opslag, afzonderlijke integratiehistorie/privélabelopslag, versleutelde credentials en expliciete test/live-/release-/registervrijgave inrichten. Details staan in PACKS-BOEKEN-EN-LOGS-20261101.md. Dit is implementatie/beheerwerk, niet iets dat Philippe zelf uit broncode hoeft samen te stellen.

De ontvangende bron staat lokaal. GitHubupload, centrale infrastructuurwijzigingen en livepublicatie zijn aparte acties. De bestaande gebruikerskeuze Alles lokaal houden blijft geldig; geen ongevraagde vrijgave. De concrete benodigde release moet eerst voorbereid en inzichtelijk worden gemaakt, zonder andere lokale feedback-/template-/financewijzigingen ongemerkt mee te publiceren. In deze ronde is geen uitrolpakket/cloudomgeving aangemaakt en geen actieve configuratie onderzocht of gewijzigd.

Een apart PACKS-testaccount en de bestaande proefmailstand zijn verschillende dingen. De proefmailstand boekt niets. Een liveboeking met de mail naar jezelf blijft een echte zending volgens het tariefcontract. Er wordt niet automatisch gekozen dat onbekende credentials test of productie zijn.

## Wat Philippe bij de echte order doet

Bewaar het volledige Kunststofbaas-bestelnummer en bevestig de werkelijk geplaatste bestelling. Controleer de fysieke verpakking: aantal pakketten, verpakte maten, gemeten gewicht, adres en werkelijke gereedheid/afhaaldatum. Maak onze pakbon. Open PACKS-label aanmaken, beoordeel de centrale dienst-/pakketcontrole en bevestig pas daarna de werkelijke boeking. Bekijk het originele label en de pakbon. De mailknop zet beide PDF’s in het concept; kies de geconfigureerde TJ Worx-afzender en controleer ontvanger/bijlagen vóór Versturen.

Bij een timeout of onzeker boekresultaat dezelfde poging terugvinden/herstellen; geen nieuwe boeking als oplossing voor een ontbrekend label. De echte boekings-/mailcontrole gebeurt door de gebruiker. Geen tests/proeven door Codex toegestaan of uitgevoerd in deze ronde. Inrichting en praktijkcontrole staan open; geen gebruiksklaarclaim.
