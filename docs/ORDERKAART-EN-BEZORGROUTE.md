> Vervolg27oktober: [Google Maps-routeberekening](OPEN-PUNTEN-VERVOLG-20261027.md). Afstand/rijtijd, optioneel volgordevoorstel en bewuste kostenovername lokaal gebouwd via een gedeelde serveradapter. Eigen API-sleutel en Google-activering nodig; geen providerproef, tests, herstart of publicatie uitgevoerd. De eerdere beschrijving geen externe API hieronder beschrijft de oude basis.

# Orderkaart en eigen bezorgroute

Lokale gedeelde bron, 21 oktober 2026. Geen tests, syntaxchecks, builds, browser-QA, echte providerproeven, klantmutaties of publicatie uitgevoerd. Philippe controleert zelf.

## Dagelijkse kaart

De standaardselectie is **In productie**. Ontwerp, akkoord en offertes zijn geen aparte kaartfases meer. De kaart gebruikt de fysieke uitvoeringsregistratie van de order, met waar toepasselijk de gekoppelde leveranciersbatch als context. Een betaling of productievrijgave wordt niet vanzelf fysieke productie.

Filters: uitvoering, levering/inkoopbestelling, leverwijze en zoeken op klant, ordernummer, ontvanger, postcode/plaats of leveringsnaam. Zoeken en leverwijze staan bij Zoeken & leverwijze; het geopende onderdeel en de zoekcursor blijven tijdens invoer behouden. Fase-aantallen volgen de overige filters. Instellingen blijven tijdens de huidige appsessie behouden; opnieuw laden begint weer bij In productie.

Kiezen van een specifieke levering schakelt naar **Alle fases** binnen die levering. Daarna kun je verder beperken tot bijvoorbeeld Binnen / te leveren of Bezorgen. Alle lopende orders omvat ook verzonden maar nog niet afgeronde orders. Alle fases omvat afgeronde orders; gearchiveerde klantorders blijven buiten de kaart. In productie tonen herstelt de basisselectie. Een lege selectie biedt direct Alle lopende orders.

Bij de inkoopbestelling onder Orders in dezelfde zending staat **Op kaart & bezorgroute bekijken**. Deze link opent de juiste levering via `#order-map/<purchaseId>`; de werkplek neemt de selectie over en normaliseert naar `#order-map`, zodat verdere filters vrij te bedienen zijn. Vanuit de kaart blijft de levering bereikbaar.

Naast de kaart staat de volledige gefilterde orderlijst, ook zonder gevonden kaartlocatie. Elke order is direct selecteerbaar. De kaart is offline op postcode-/plaatsgebied, geen exact huisnummer. De legenda toont de aanwezige uitvoeringsfases. Orderbedrag blijft excl. btw en betaling/restant incl.; bij onbekende verzend-/prijsafspraken geen definitief saldo.

## Voortgang is een projectie

`shared/order-map.js` leest `orderExecution` en batchdata. De verst gevorderde vastgelegde fysieke status is leidend; een batch kan een echte klantverzending of levering nooit terugdraaien. Alleen orders met leveranciersproducten nemen batchvoortgang mee. Zuiver lokale productie volgt de eigen orderregistratie. Batchvoortgang wordt expliciet als bron benoemd; bij gemengde producten of deelleveringen blijft compleetheid handmatig te controleren.

Dit wijzigt geen orderstatus, voorraad, productie, betaling, Gmail-label of daadwerkelijke aflevering. Er is geen nieuw model voor meerdere afzonderlijke deelleveringen binnen één bestaande batch. De kaart volgt de huidige opgeslagen batchkoppeling en aankomstregistratie.

## Eigen bezorgroute

De ingeklapte routeplanner bewaart alleen een werkversie in het huidige tabblad. Kies orders, vul vertrekadres in, verander de stopvolgorde met de pijlen en kies eventueel terugkeer naar het vertrekadres. Er wordt niets automatisch geselecteerd; Geschikte orders kiezen is een bewuste actie. Geen opslag in order, lokale voorkeuren of cloud. Binnen de app weg- en teruggaan behoudt het werk; herladen sluit de werkversie af.

Afhalen, al verzonden/afgeronde orders en voorbereiding zijn geen routekeuze. Ontbrekende leverwijze biedt direct Leverwijze afspreken via het bestaande formulier; ontbrekend afleveradres linkt naar Adres & levering. Orders met verzenden als afspraak mogen bewust in de routeschets, met melding dat zelf bezorgen eerst moet worden afgestemd. Onbekende of open betaal-/prijsafspraken en nog niet geregistreerde aankomst worden benoemd. Batch-aankomst blijft geen bewijs van complete orderontvangst.

Gekozen orders buiten de huidige filters worden niet ongemerkt meegestuurd: het aantal staat vermeld en de routelinks gebruiken uitsluitend de zichtbare selectie. Een niet meer geschikte zichtbare keuze blokkeert het maken van een link totdat die wordt verwijderd of hersteld. Bij klikken op een routelink vergelijkt de planner de actuele levering, adressen, leverwijze en financiële projectie met de getoonde versie. Wijziging vereist opnieuw bekijken en klikken.

De links openen Google Maps pas na een gebruikersklik. Geen externe geocoding, locatiepermissie, tracking, Google-API-key of betaalde routeaanroep vanuit het CRM. Alleen adressen en land staan in de link, geen klantnamen, telefoons, ordernummers of betaalinformatie. [Google Maps URL-documentatie](https://developers.google.com/maps/documentation/urls/get-started) beschrijft `api=1`, de limiet van2048tekens en maximaal3 tussenpunten voor mobiele browsers. De lokale linkmaker splitst daarom in passende overlappende delen; geen gekozen stop afkappen. Een individueel te lang adres geeft een melding. Regeleindes en pipe-scheiding in adresregels worden als leestekens behandeld.

Dit is een handmatig gekozen **stopvolgorde**, geen berekend optimaal rondje of bewijs van afstand/rijtijd. Google Maps toont de werkelijke wegroute na openen; controleer daar de afleverpunten. De routeplanner vult geen kosten of leverafspraken stil in.

## Kosten bij de gekozen route — 26 oktober 2026

Onder Eigen bezorgroute plannen staat nu de ingeklapte vergelijking **Zelf bezorgen of verzenden vergelijken**, gedeeld voor beide bedrijven. Gebruik de gekozen zichtbare orders en vul vijf eigen aannames in: totale kilometers, rij- en stoptijd, vervoerskosten per kilometer, waardering van eigen tijd per uur en pakketkosten voor de hele selectie. Alle kosten excl. btw; geen tarieven of afstand uit klantgegevens afleiden. De terugrit hoort in de ingevoerde totalen als die aanstaat. Meerdere orders op één adres kunnen één fysieke stop zijn.

De uitkomst hergebruikt `deliveryScenario` uit `shared/batch-economics.js`: kilometers × km-tarief + uren × uurtarief tegenover de eigen totale pakketkosten. Gelijke kosten worden als gelijk benoemd. Alle vijf aannames zijn vereist, expliciet nul is toegestaan; komma en punt met maximaal twee decimalen, Nederlandse weergave na verlaten van het veld. Geen duizendtallen of exponentnotatie.

De invoer en uitklapstand blijven in de bestaande tabbladwerkversie staan, ook bij filterwisseling of verlaten en heropenen van de kaart binnen de app. Herladen sluit de werkversie af. Verandert de routebasis (selectie, volgorde, vertrek, retourkeuze of relevante lever-/ordergegevens), dan verdwijnt de oude uitkomst. De invoer blijft behouden en de gebruiker moet de aannames voor de huidige route opnieuw bevestigen. Geen geschikte orders, onbekend vertrek of ongeschikte levergegevens blokkeren de vergelijking. Alleen zichtbare gekozen orders tellen mee, zoals bij de routelinks; verborgen keuzes blijven in de bestaande routewaarschuwing vermeld.

Dit blijft een eigen schatting: geen automatische routeafstand, tijd, optimaal rondje, externe API of financiële opslag. De bestaande batchvergelijking blijft beschikbaar. Gebruikerscontrole open: beide bedrijven, komma/punt/nul/leeg/ongeldig, gelijk of duurder/goedkoper, behoud van invoer en herbevestiging na route-/filterwijziging, retour, herstel van ontbrekende gegevens en mobiel. Geen tests, checks, builds, browser-QA of publicatie uitgevoerd.

## Vindplaatsen en open controle

- `shared/order-map.js`: pure voortgang/filter/adres-/routelinkregels.
- `admin/orders/map-workspace.js`: live kaartwerkplek, filters en batchselectie.
- `admin/orders/map-route.js`: tabbladwerkversie, stopvolgorde, directe ontbrekend-hulp en actuele linkcontrole.
- `admin/orders/route-costs.js`: tabbladgebonden aannames en vergelijking via de bestaande gedeelde rekenregel; geen businesswrites.
- `admin/orders/delivery-map.js`: bestaande offline kaart, nu uitvoeringslegenda en complete selectielijst.
- `admin/analytics/workspace.js`: behoudt compatibele `renderOrderMap`-ingang en delegeert naar de orderfeature.

Gebruikercontrole open: beide bedrijfsversies, productie-/batch-/eigen uitvoeringsfeiten, zoeken/leverwijze en lege selecties, ontbrekende adressen, gemengde/deelleveringen, routekeuze/volgorde/retour, wijzigingen tijdens plannen, meerdere routelinkdelen en mobiel. Geen live-adressen openen als automatische controle. Publicatie apart afspreken.
