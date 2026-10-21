# Tijdelijke prijshulp Spatlappen

Lokaal toegevoegd op 18 oktober 2026, niet gepubliceerd en op gebruikersverzoek niet zelfstandig getest.

## Waar staat de hulp?

Open een aanvraag/order met een product zonder verkoopprijs. Bij dat product staat **Verkoopprijs bepalen**. Dit opent Order bewerken en klapt de prijshulp van dat product open. Ook bij een nieuwe order staat de gesloten hulp onder de productvelden. Bij bekende verkoopprijzen of een afgesproken totaalprijs wordt geen nieuwe schatting aangeboden.

Voor automatische hulp moet het product via **Erturk** gaan: koppel een Erturk-inkoopbestelling. Voor oude orders zonder batch kan de expliciete orderleverancier worden gebruikt. Een gekoppelde batch is leidend; een andere leverancier of lokale productie krijgt geen Erturk-schatting. Vul breedte, hoogte, aantal en drukkleuren in. Een nog onbekende maat of drukkleurenaantal wordt niet geraden.

De hulp toont een **Erturk-indicatie per fysieke spatlap**, de gevonden prijsbandbreedte en het aantal gebruikte productvoorbeelden. **Indicatie gebruiken** vult deze tijdelijk in; zelf aanpassen blijft mogelijk. Vul je eigen opslagpercentage bovenop de indicatie in. Opslag is geen brutomargepercentage. Het voorstel toont de afgeronde verkoopprijs per stuk en voor het hele productaantal.

**Voorstel als verkoopprijs invullen** kopieert uitsluitend de verkoopprijs naar het gewone productprijsveld. Bewaren blijft de bestaande, aparte orderactie. Invullen van een eigen verkoopprijs of totaalprijs verwijdert de tijdelijke invoer eveneens. Een formulierfout zonder prijskeuze verwijdert de tijdelijke invoer niet. Bij gewijzigde productmaten, aantal, uitvoering, leverancier of bronuitkomst vervalt een eerder automatisch overgenomen indicatie; kies haar opnieuw. Eigen handmatige invoer blijft staan.

## Welke bestaande prijzen tellen mee?

- Alleen Erturk (ook Ertürk) als expliciete leverancier van de batch, of oude order zonder batch. Geen herkenning uit notities of batchnaam.
- Alleen positieve, opgeslagen productinkoop in euro. Nul, onbekend, andere bedrijven, lokale productie en calculatorbedragen worden niet gebruikt.
- Positieve gekoppelde echte leveranciersfactuurregels hebben voorrang. Offerte/pro-formaregels en nulregels worden overgeslagen; een afgeleide prijs uit uitsluitend zulke documenten mag niet via de productcache terugkomen.
- Een prijs per paar wordt gedeeld door twee fysieke spatlappen. Meerdere factuurregels voor één product worden samengenomen naar één gewogen stukprijs. De productprijs wordt dan niet nogmaals als voorbeeld toegevoegd.
- Zonder gekoppelde documentregels mag de handmatig opgeslagen positieve productinkoop meetellen. Een niet meer onderbouwde supplierInvoice-cache wordt niet gebruikt.
- Archief blijft bruikbare inkoophistorie. Het eigen doelproduct wordt uitgesloten. Teststukken worden uitsluitend met andere teststukken vergeleken.

## Vergelijkingsmethode

Zoek dezelfde drukkleuren en geen bekende verschillen in gaten/oppervlak. Elke afzonderlijke maat mag maximaal factor 1,35 afwijken; aantallen maximaal factor 2. Exacte breedte, hoogte en aantal krijgen voorrang. Kies anders maximaal 12 dichtstbijzijnde productvoorbeelden op maat en aantal, bij gelijke afstand de recentste. Het voorstel is hun gewogen mediaan: dichterbij telt zwaarder. Er is geen verzonnen prijs-per-m²-formule, kleurtoeslag of extrapolatie buiten deze grenzen. De bandbreedte toont de laagste en hoogste gebruikte historische stukprijs, geen statistisch betrouwbaarheidsinterval.

Nieuwe opgeslagen inkoopprijzen worden bij de volgende berekening automatisch uit de actuele CRM-state gelezen. Correcties/verwijderingen werken eveneens door; er is geen aparte trainingsdatabase, modelbestand of upload. Meer geschikte voorbeelden verrijken de vergelijking maar garanderen geen betere prijs of actueel leverancierstarief. Minder dan drie voorbeelden en onbekende uitvoering krijgen een zichtbare waarschuwing. Brondata worden getoond; oude bedragen kunnen verouderd zijn. Maten/uitvoering komen uit de huidige gekoppelde productgegevens, niet uit een gereconstrueerde historische snapshot. Ontbrekende vergelijkbare data geeft een uitleg en handmatige invoer, geen nulschatting.

Bedragen zijn productinkoop in euro excl. btw. Gezamenlijk transport, invoerrechten en overige batchkosten zitten niet in de indicatie; de gebruiker kan zulke kosten zelf in de tijdelijke invoer meenemen. Er worden geen valuta of toekomstige staffels voorspeld.

## Opslaggrens en bronverdeling

De invoervelden hebben geen formuliernaam en worden niet aan CRM-state toegevoegd. De schatting, opslag en berekende hulp worden niet bewaard in order/product/batch, calculatorhistorie, logs, documenten, exports, back-ups of analytics. Alleen de gekozen verkoopprijs volgt de bestaande prijsroute. Werkelijke leverancierskosten, ontvangsten, margeprojectie en bestaande Maatwerkkunststof-calculatorgegevens worden niet gewijzigd. Sluiten of herladen van het formulier verliest de tijdelijke hulp.

- `shared/erturk-price-estimate.js`: alleen-lezen bronselectie, stuks/paar en historische vergelijking.
- `shared/temporary-price.js`: decimale invoer, geldige aantallen, centafronding en verkoopprijsvoorstel.
- `admin/orders/temporary-pricing.js`: tijdelijke formulierbediening zonder opslag.
- `admin/orders/workspace.js`: productingang en actuele bedrijfsstate/formuliergegevens.

Geen tests, syntaxchecks, builds of browser-QA uitgevoerd volgens de expliciete gebruikersafspraak. Geen runtime-bouwlog bijgewerkt; catalogustaak 15 en deze overdracht beschrijven de lokale wijziging. De huidige Cloudflare-versie bevat deze aanvulling nog niet.
