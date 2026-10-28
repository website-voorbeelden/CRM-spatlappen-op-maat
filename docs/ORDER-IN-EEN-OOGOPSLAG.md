> Vervolg: de presentatie is doorgetrokken naar het CRM. De kop gebruikt nu workspace/key-facts.js met dezelfde gegevens en centrale workspace-key-facts-CSS; dossier-header en tab-visibility worden gedeeld. Zie [Rustige werkplek](RUSTIGE-WERKPLEK.md). Oudere eigenaarbenamingen hieronder beschrijven de eerste ronde.

# Order in één oogopslag — 27 oktober 2026

Nieuwste feedback: de compacte kop was een dichte regel met fase, uitvoering, onbekende bedragen, saldo en twee uitklappers. De gebruiker wil direct weten of betaald is, hoelang de klant wacht en wat met uitvoering/levering gebeurt. Deze afspraak vervangt de eerdere fase-/bedragregel en Bedragen & marge in de kop. Gedeeld voor beide bedrijven, uitsluitend lokaal aangepast.

## Indeling

1. Klantnaam, ordernummer en aangemaakt op, met Order bewerken en Meer. Archief blijft expliciet herkenbaar.
2. Drie grotere gegevens met eigen label, uitleg en voldoende witruimte: Betaling, Sinds volledige betaling/aanbetaling/aanvraag, Uitvoering & levering. Geen aparte kaders rond elk gegeven. De waarden verwijzen naar bestaande Betalingen of Adres & levering.
3. De bestaande horizontale dossieronderdelen op een afzonderlijke regel.

Geen prijsbadge naast de klantnaam, dubbele fase, algemeen saldo of marge in de kop. Verkoop-/prijsopbouw, ontvangst-/saldo-overzicht en inkoop/marge blijven bij hun bestaande onderdelen. Fases & voortgang openen vanuit Meer een tijdelijk uitklapgedeelte onder de kerngegevens, met dezelfde faseregistratie, uitvoeringsbediening, bronmarkeringen en stappenlinks. Dichtklappen verbergt het weer; focus terug naar Meer wanneer de focus anders verborgen zou raken. Geen nieuwe voorkeur of opgeslagen fase.

## Betaling en wachttijd

De kop presenteert bestaande totalen/ontvangsten; geen eigen prijsengine of betaalregistratie. Volledig betaald vereist bekende productprijs én expliciet bekende verzendprijs, een positief totaal en voldoende ontvangen bedrag. Bij onbekende prijs blijft een aanwezige ontvangst zichtbaar, zonder betaaldclaim of verzonnen saldo. Geen ontvangst wordt Nog geen betaling, met een gerichte uitleg over de ontbrekende prijs. Een bekende nulorder, deelbetaling, overbetaling en negatieve netto-ontvangst blijven afzonderlijk benoemd. Betaalbedragen zijn inclusief btw.

Wachttijd gebruikt de bestaande ontvangstdatumprojectie alleen na volledige betaling. Bij een afgesproken aanbetalingsbasis en werkelijk bereikte drempel de bestaande depositLeadTime-projectie. Anders expliciet Sinds aanvraag; dat is geen claim dat de klant al betaald heeft. Bij vastgelegde levering stopt de teller op die leverdatum. Een afgeronde order zonder leverdatum of onbruikbare/toekomstige/omgekeerde datum krijgt een uitleg in plaats van een verzonnen dagtelling. De huidige dag blijft de bestaande CRM-dag in Nederlandse tijd.

Uitvoering komt uit orderExecution, niet uit een verkoop-/Gmailfase. Bestaande vaste of afgeleide leverafspraak eronder; een betalingsafhankelijke datum wordt niet als bekend gepresenteerd bij onvolledige prijs. Wanneer de levertermijn nog op de startbasis wacht, staat de concrete afgesproken termijn er (bijvoorbeeld weken na volledige betaling). Werkelijk geleverd/verzonden en een verstreken leverdatum krijgen eigen tekst. Geen aankoop-, productie-, lever- of betaalfeiten geschreven tijdens renderen.

## Eigenaars en controle

admin/orders/key-facts.js presenteert de drie gegevens vanuit dezelfde actuele context. header.js maakt de kop; installOrderHeader beheert uitsluitend de lokale disclosure en actieve-tabonthulling. progress.js deelt bestaande uitgebreide voortgangsmarkup zonder dubbele compacte kop. workspace.js composeert; app.js alleen importversies aangepast. Eén bestaande eigenaar in admin/style.css herwerkt; vervallen context-/geldregel-CSS verwijderd, geen nieuwe stylesheet of override-laag. Klein scherm: gelabelde rijen in plaats van drie smalle kolommen.

De openbare [nieuwe Exact-interface](https://www.exact.com/befr/software/exact-online/la-nouvelle-interface-d-exact-online) beschrijft witruimte, leesbaarheid en informatie tonen wanneer nodig. Dat is het gebruikte principe; dit is onze dossierindeling voor maatwerk, geen claim dat Exact precies deze drie gegevens heeft.

De gebruiker gaf voor deze opdracht expliciet toestemming zelf de lokale preview te bekijken. Alleen de bestaande Maatwerkkunststofvoorbeeldweergave voor/na bekeken en de read-only Meer/disclosure open/dicht bediend in een eigen tab. Geen betaling, formulieropslag, klantgegeven of provideractie uitgevoerd. Oorspronkelijke gebruikerstabs niet herladen. Afbeelding lokaal onder work/order-key-facts-20261027/maat-header.png; geen klantvoorbeeld of afbeelding gepubliceerd.

Geen automatische tests/checks/syntaxchecks/builds uitgevoerd. Geen brede functionele/browser-QA, contrastmeting of mobiele beoordeling. Nog eigen controle voor beide bedrijven, smalle schermen/lange namen, betaald/deels/nul/te veel/ontvangst bij onbekende prijs of verzending, ontvangstdatum/aanbetalingsbasis, geleverde/afgeronde orders en afwijkende datums, planning/te laat, invoerbehoud en gewone tab-/Meeracties. Bouwtaak review/local, brede werkplek doing/local. Geen GitHubupload of livepublicatie van deze stap.
