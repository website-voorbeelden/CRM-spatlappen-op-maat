# Batch 1 · meerdere ontwerpen bij één product

26 oktober 2026. Alleen lokale bron, zonder tests, checks, syntaxchecks, builds, browser-QA, export-/productieproeven, GitHubpush of publicatie. Philippe controleert zelf. Geen echte klanten, orders, ontwerpen of feedbackstatussen gewijzigd.

## Resultaat

De eerder gebouwde A/B-variantopslag is verder afgewerkt. Eén product houdt zijn maat, aantal en prijs; meerdere benoemde voorstellen krijgen eigen ontwerpbestanden. Nieuw ontwerp, kopie, heropenen en hernoemen blijven beschikbaar. Iedere bewaaractie maakt een nieuw JSON-/PNG-paar in de bestaande gezamenlijke transactie. Oudere bestanden blijven behouden; revisies staan met versienummer, nieuwste eerst, onder Meer en kunnen als nieuwe variant worden geopend. Geen tweede CRM-opslag of automatische migratie.

Bij elke nieuwe versie staat nu de werkelijk opgeslagen maatbasis in `sourceBasis`: hele mm en een expliciet aantal of null bij een leeg ontwerpaantal. Null blijft onbekend/ongeschreven, geen nul of nieuw orderaantal. Een definitieve keuze blijft bovendien gebonden aan de exacte bestanden, revisie en actuele productmaat/aantal. Een maat-/aantalwijziging maakt de oude keuze ongeldig.

Vóór definitief kiezen worden het opgeslagen ontwerp en de PNG opnieuw uit dezelfde bedrijfsopslag gelezen. Productbinding, de werkelijk opgeslagen maten/aantal en aanwezigheid van het voorbeeld zijn vereist; de actuele productbasis en variantmetadata worden daarna opnieuw binnen de bestaande transactie vergeleken. Het gekozen voorbeeld is ook in de bevestiging zichtbaar. Een oude variant met afwijkende maat kan niet door alleen opnieuw aanklikken worden goedgekeurd: eerst openen, plaatsing beoordelen en opnieuw bewaren. De editor vermeldt dat de huidige ordermaat is overgenomen en beoordeling nodig is. Een leeg ontwerpaantal mag leeg blijven; een nieuwe definitieve keuze blijft wel aan het actuele orderaantal gebonden.

De algemene orderactie Ontwerp goedgekeurd kan een ontbrekende keuze bij producten met varianten niet vervangen. De oude afbeeldingsgoedkeuringsroute weigert bij beheerde varianten en gebruikt voor oude producten een actuele merge, zodat zij niet een hele verouderde dossierkopie terugschrijft. Definitieve keuze opheffen ruimt ook een oude goedkeuringsmarkering op als die keuze door een maatwijziging al ongeldig was; productiestatus en historische bestanden blijven behouden.

Voor bestaande ontwerpen zonder varianten leest het CRM bij bewust bewaren eerst de originele JSON-maatbasis. Alleen een nog passende expliciet goedgekeurde oude preview kan bij de overgang als keuze behouden blijven. Een oude orderdatum wordt niet als bewijs van een specifiek ontwerp gebruikt. Expliciet bewaarde legacyversies mogen een ontbrekend oud tijdstip of PNG behouden, zodat opnieuw bewaren een volledig nieuw paar kan maken zonder oude verwijzingen te wissen of een historisch tijdstip te verzinnen. Definitief kiezen vereist altijd een aanwezig opgeslagen PNG-voorbeeld. Een ontbrekende of onleesbare oorspronkelijke JSON vraagt herstel uit de bestaande bestanden/back-up; deze ronde verzint geen ontwerpinhoud.

Een nieuwe variant krijgt een nog vrije standaardnaam. Het naamveld bovenaan en het bestaande veld blijven ook na programmatic openen/bewaren gelijk. Volledige product-/klant-/variantconflictguards blijven behouden: gelijktijdige bewerkingen aan hetzelfde product kunnen een heropening vereisen. De invoer blijft in de tab beschikbaar, met de bestaande losse ontwerpkopie als uitweg; geen automatische conflictoplossing die varianten overschrijft.

## Bevindingen in de code

De belangrijkste foutkans was dat de eerdere definitieve keuze alleen de huidige productmaat vastlegde, zonder die met het opgeslagen ontwerp te vergelijken. Daardoor kon een verouderd ontwerp na een productwijziging opnieuw als akkoord gelden. Dat is in de bron gecorrigeerd. Daarnaast schreef de oude afbeeldingsgoedkeuring een volledige snapshot terug en kon het opheffen van een al ongeldig geworden keuze de oude afbeelding als goedgekeurd laten staan. Beide routes zijn gericht aangepast. Dit is bronlezing en bronbewerking, geen functioneel bewijs of volledige CRM-audit.

## Nog door Philippe te controleren

Gebruik een proefproduct, zonder echte klantgegevens te veranderen:

1. Bewaar A en B met verschillende inhoud/namen bij hetzelfde product, heropen beide en bewaar nogmaals. Controleer dat maat/aantal/prijs gedeeld blijven en dat oudere versies beschikbaar zijn.
2. Open een kopie en een oude revisie als nieuwe variant. Controleer eigen naam/inhoud en dat het oorspronkelijke ontwerp gelijk blijft.
3. Kies A definitief; wijzig B en daarna A. Alleen wijzigen van de gekozen variant moet opnieuw kiezen vereisen. Controleer leveranciers-PDF en voorstel-PDF.
4. Wijzig productmaat/aantal. Een afwijkende bewaarde variant mag niet opnieuw definitief worden door alleen aanklikken. Open, controleer plaatsing, bewaar en kies opnieuw. Probeer ook een leeg ontwerpaantal.
5. Hef een definitieve keuze op, ook na een maatwijziging. Bestanden blijven beschikbaar en de ontwerpgoedkeuring vervalt; fysieke productie wordt niet teruggedraaid.
6. Open dezelfde productvariant in twee tabs. Een verouderde save moet een conflict geven met behoud van de invoer. Beoordeel ook een oud ontwerp en een ontbrekend oud voorbeeld.

Bouwtaken `feedback4-variants-20261026` en `product-design-alternatives` blijven Jouw controle / alleen lokaal. Geen feedbackmelding automatisch afgehandeld. Frontend, gedeelde regels en servervalidatie moeten bij een eventuele latere expliciete publicatie samen worden geleverd. De overige drie feedbackdelen vallen buiten deze afrondingsronde.
