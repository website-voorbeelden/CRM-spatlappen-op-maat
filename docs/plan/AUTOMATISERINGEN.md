# Automatiseringen — eerst de werkstap helder

Dit is een ontwerp voor vervolgstappen, geen ingeschakelde automatiseringsdienst. Hergebruik eerst de bestaande verkoopfunnel, `shared/work-queue.js`, inline invulhulp en AI-voorstellen. Vermijd een tweede takenlijst die dezelfde order anders beoordeelt.

## Wat we leren van andere systemen

ClickUp beschrijft automatiseringen als een aanleiding, optionele voorwaarden en acties. Verschillende weergaven presenteren dezelfde taken. Dat ondersteunt onze keuze om orderlijst, kaart en prioriteiten als weergaven op dezelfde dossiers te behandelen. Zie [Automation Triggers](https://help.clickup.com/hc/en-us/articles/6312128853015-Use-Automation-Triggers), [Conditions](https://help.clickup.com/hc/en-us/articles/6312136485527-Use-Automation-Conditions) en [Task views](https://help.clickup.com/hc/en-us/articles/6310172583831-Use-Task-views).

Exact beschrijft een samenhangende handelsketen met offertes, verkooporders, levering en facturatie, plus goedkeuringen. Dat ondersteunt onze keuze om geaccepteerde gegevens te hergebruiken en de herkomst bij elke vervolgstap te behouden. Zie [Exact Online Handel — functies](https://www.exact.com/nl/producten/handel/features-en-prijzen) en [het inkoopproces](https://www.exact.com/nl/producten/handel/zo-professionaliseer-je-je-inkoopproces).

De vertaling hieronder is ons ontwerp, geen claim dat ons CRM al dezelfde mogelijkheden heeft. Er is geen ClickUp- of Exact-account gekoppeld, en er zijn geen prijs-/abonnementskeuzes gemaakt.

## Vaste opbouw van een toekomstige regel

| Onderdeel | Betekenis |
|---|---|
| Aanleiding | Een benoemde gebeurtenis of een controle op een afgesproken moment |
| Voorwaarden | Bedrijf, actuele orderfase, ontbrekende velden, bevoegdheid en andere vereisten |
| Voorstel | Wat komt klaar te staan, met bron en uitleg waarom? |
| Uitvoeren | Wie controleert en bevestigt de echte wijziging? |
| Herhalen | Hoe herkennen we dezelfde aanleiding zodat er geen dubbele taak of actie ontstaat? |
| Vastleggen | Wat is gedaan, op welke bronversie, wanneer en door wie? |
| Herstel | Wat gebeurt er na gewijzigde bron, uitval, fout of onzekere providerrespons? |

Voor een toekomstige uitvoerder is de unieke sleutel minimaal bedrijf + regel-ID + dossier-ID + bronversie/gebeurtenis-ID. Vlak vóór opslaan worden bronversie en voorwaarden opnieuw gecontroleerd, in dezelfde transactie als de wijziging. Een providersend krijgt een eigen stabiele actie-ID en resultaatcontrole; na een onbekende respons niet blind opnieuw sturen. Dit is nog te implementeren infrastructuur, geen bestaande universele garantie.

## Eerste bruikbare recepten

| Situatie | Voorwaarden | Voorstel en gebruikersstap | Wat nu al bestaat / wat ontbreekt |
|---|---|---|---|
| Aanvraag mist materiaal, maten of aantallen | Actieve aanvraag; velden daadwerkelijk onbekend | Toon concrete ontbrekende velden. Laat aanvullen of een mailtekst voorbereiden; controleer en verstuur zelf | Funnel/taken en inline invulhulp bestaan; één consequente werkroute uitbreiden |
| Calculatie is klaar | Juiste order/product; actuele bron; geldige kosten; geen geblokkeerde factuurkost | Toon verschil in specs, kost en verkoop. Gebruiker kiest wat overgaat; verkoop standaard uit | V2 heeft deze expliciete overname per product; nog geen generieke multi-productautomatisering |
| Offerte wacht op antwoord | Wachttermijn afgesproken; nog geen nieuw antwoord/afwijzing; order actief | Zet opvolgactie en eventueel concept klaar; laat mail afzonderlijk controleren en versturen | Opvolging zit deels in funnel/mailwerkplek; regels voor termijnen en dubbelen nog samen uitwerken |
| Klant geeft akkoord | Bron is aantoonbaar; juiste offerteversie; specificaties compleet | Voorstel voor volgende fase en benodigde inkoop. Controleer wat al bestaat | Status-/fasevoorstellen bestaan; samenhangende akkoord→inkoop-overgang nog ontwerpen |
| Leveranciersprijs verandert | Nieuwe betrouwbare bron; bestaande prijs en orderversie bekend | Vergelijk kosten en marge; vraag bewuste overname | Herkomst/kostcontroles bestaan; automatische leveranciersinname staat niet aan |
| Levering is geregistreerd | Aantallen/afleveradres bekend; geen eerdere identieke levering | Pakbon/factuur als volgende stap aanbieden; gebruiker maakt en controleert document | Documenten en deellevering bestaan; geen automatische factuur of verzending toevoegen zonder apart ontwerp |
| Betaaltermijn is voorbij | Definitieve factuur, echte vervaldatum en actuele openstaande balans | Eén zichtbare controleactie; herinneringsconcept pas na controle | Openstaande bedragen bestaan; een datum of ‘betaald’-status niet afleiden uit alleen mailtekst |

## UX bij uitvoeren

In het overzicht staat de reden en één volgende actie. Op het dossier staan benodigde gegevens en een voorbeeld van de wijziging. Het resultaat vermeldt wat is opgeslagen, en een fout behoudt invoer met een concrete herstelactie. Niet elke regel krijgt een eigen ingewikkelde instellingenpagina; begin met één nuttige regel.

Echte mail en Gmail-wijzigingen blijven onder expliciete gebruikerscontrole. Het samenstellen van een voorstel is een andere stap dan verzenden, archiveren of gegevens naar een externe dienst delen. Een onvolledig tarief is geen nultarief; een AI-antwoord is een te controleren voorstel.

## Eerst vaststellen vóór een boekhoudkoppeling

Bepaal per gegeven welk systeem leidend is: klantnummer, artikel, offerte, definitieve factuur, creditnota, betaalstatus en btw. Leg de bedrijfs-/administratiekoppeling, unieke sleutels, sync-richting en correcties vast. Test dubbele gebeurtenissen, gewijzigde bron en verbindingsuitval met fictieve administratie. Onderzoek daarna pas actuele API-mogelijkheden, rechten en kosten bij de gekozen leverancier. Geen credentials of echte dossiers in het ontwikkelplan.
