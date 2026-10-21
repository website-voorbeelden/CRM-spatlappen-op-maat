# Ordervoortgang en losse bestellingen

Lokaal aangepast op21oktober2026. Philippe controleert zelf: geen tests, syntaxchecks, builds of functionele browser-QA uitgevoerd. Geen echte orderdata gewijzigd of online gepubliceerd.

## Bediening

Boven de order staat één aanklikbare stappenbalk. Maatwerkkunststof: Aanvraag & prijs → Offerte → Betaling → Uitvoering → Levering. Spatlappen behoudt Ontwerp als eerste onderdeel. Een stap opent het juiste tabblad van dezelfde order: Order, Documenten, Betalingen, Inkoop & marge of Adres & levering. Klikken registreert geen gebeurtenis.

Onder iedere stap staat de bekende toestand, bijvoorbeeld Concept beschikbaar, Deels ontvangen of Nog niet geleverd. Een vinkje volgt bekende gegevens per onderdeel, niet de positie van een willekeurige status in een lijst. Een late fase maakt oudere ontbrekende gegevens of datums niet automatisch compleet.

Verkoopfase is het bestaande CRM-/mailproces en blijft bewust bij te werken via Fase bijwerken. Uitvoering van deze order toont de geregistreerde fysieke voortgang. Deze twee begrippen hebben elk een duidelijke naam; een Gmail-label is geen bewijs van geldontvangst of levering. De volgende-actiekaart gebruikt dezelfde verkoopfase maar herhaalt de fasekeuze niet nogmaals.

## Losse order: geen verplichte verzamelbestelling

Voortgang bijwerken opent een formulier voor deze order. Kies wat er werkelijk is gebeurd, bijvoorbeeld Besteld bij leverancier, In productie, Verzonden of Afgerond. Vul de werkelijke datum in, of kies Datum nog onbekend, en bevestig de registratie. Spatlappen kan hier ook de ontwerpverzending/goedkeuring registreren; die keuzes zijn niet beschikbaar bij Maatwerkkunststof.

De registratie geldt voor deze klantorder. Zij past geen andere orders, gezamenlijke inkoopbestelling, betaling of verstuurd document aan. Afgerond archiveert het dossier na de bevestiging in het formulier. Bij een gewijzigde order sinds openen stopt opslag en blijft de invoer staan. Datums van andere gebeurtenissen worden niet aangevuld met aangenomen waarden.

Inkoop & marge en Adres & levering hebben een kaart Uitvoering & levering van deze order met dezelfde bijwerkknop en bekende eigen datums. De kaart staat bij Inkoop boven de rekentool en kosten. Een gezamenlijke inkoopbestelling is een optionele koppeling voor gezamenlijk bestellen/kosten verdelen. Een echte eigen supplierOrderedDate telt ook zonder die koppeling als geregistreerde bestelling in de vervolgstaphulp.

Een batchstatus of batchdatum is context en voltooit niet automatisch de hele klantorder in de nieuwe stappenbalk. Dit voorkomt dat lokale producten of nog ontbrekende delen als geleverd gelden omdat een gekoppelde gezamenlijke bestelling verder is. Fijnmazige deel-/productlevering blijft een afzonderlijke bouwtaak; deze bediening registreert de hele klantorder.

## Techniek en grenzen

shared/order-progress.js projecteert uitsluitend bestaande verkoopfase, betaling, documenten, eigen uitvoeringsdatums en stage. admin/orders/progress.js rendert gedeelde header en orderkaart; geen tweede opgeslagen voortgang of nieuw statuseschema. De oude indexbalk in planning is vervangen door dezelfde component. Volgende stap behoudt bestaande orderReadiness/salesFunnel-toestemming en betalingsregels. Het register voor fysieke feiten behoudt de bestaande handmatige registratie, vraagt expliciete bevestiging en gebruikt nu de centrale merge met actuele ordervergelijking in plaats van een oude volledige snapshot op te slaan. Het register voert geen provideractie uit.

Maat rendert geen Spatlappen-ontwerpkeuzelijst in de header. De invoer controleert bedrijfseigen statuskeuzes ook voor oude nog aanwezige klikhandlers. De actieve voorkant krijgt vernieuwde app-/feature-/CSS-versies; gebruiker moet eerst eventuele invoer bewaren en daarna de eigen oude tab herladen. Een verouderde geopende pagina als oorzaak van de gemelde oude tekst is niet met browser-QA vastgesteld.

Alleen broninspectie en documentatie. Bouwtaak consistent-workspace blijft gedeeltelijk open voor eigen controle en verdere werkplek-/inkoopverbeteringen. Geen algemene UX-volledigheid, veilige livewerking of afgeronde volledige bouwtaak geclaimd.
