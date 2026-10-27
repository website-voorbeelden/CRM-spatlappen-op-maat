> Nieuwste27oktober: automatische mailfasemelding nu in gedeeld niet-modaal vak met Bekijken en gericht Terugdraaien, geen aparte popup met Verder/Fase aanpassen. Undo gebruikt actuele fase/bron/klant-/workflowbasis en herstelt geen betaal-/mail-/fysieke feiten of hele snapshot. Alleen sessiegeheugen; invoer beschermd. Zie COMPACT-ORDEROVERZICHT.md. Lokaal, geen tests/browsercontrole/publicatie; eigen controle open.

# Verduidelijking27oktober: melding en automatische fase staan los

Philippe kiest expliciet: melding verbergen, fase blijft automatisch uit bekende gegevens volgen. Nieuwe werkelijk door SMTP2GO aangeboden mails met expliciet doel Specificaties, Prijsindicatie, Offerte of Orderbevestiging krijgen hun bestaande fase-event direct als confirmed in dezelfde communicatieopslag. confirmed betekent hier dus ook: automatisch toegelaten op grond van een bekende verzendregistratie, niet altijd een aparte bevestigingsklik. De popup is achteraf uitleg en blokkeert deze afleiding niet. Geen extra fase-event of verzonnen handmatige verzenddatum.

Alleen expliciet documenttype/maildoel, geen tekstinterpretatie. Concept, preview, onzekere/afgewezen verzending of gewone mail geven geen nieuwe verkoopfase. Factuur-/opvolgmail houden hun bestaande betekenis. Bij Herstel verzendstatus of een inmiddels door een andere tab opgeslagen acceptatie blijft bestaande reviewkeuze behouden; oude pending/dismissed records niet migreren of stil bevestigen. Bestaande betaald/vrijgave/fysieke status en nieuwere bewuste fasekeuze blijven volgens de bestaande regels leidend. Geen betaling/productiestart/levering uit een offerte- of bevestigingsmail afleiden.

De nieuwe melding toont Fase automatisch bijgewerkt met Verder, Sluiten en Fase aanpassen (bestaande editor met actuele basis). Niet meer automatisch tonen bewaart alleen een boolean per bedrijf/browser; Meer → Fase-meldingen zet de melding weer aan. De voorkeur wordt niet geraadpleegd bij het opslaan of afleiden van de fase. Een nieuwere fase of open editor krijgt geen verouderde/vervangende popup. Voor oude pendingvoorstellen blijft de eerdere handmatige reviewroute beschikbaar. Automatische herkomst van de bekende mailfase lichtpaars met uitleg, geen claim van aflevering of betaling.

Alleen lokale bron; geen echte mail-/Gmail-/klant-/provideractie, tests/checks/builds/browser-/DOMcontrole of publicatie. Philippe beoordeelt zelf nieuwe verzending met meldingen aan/uit, Verder/Sluiten/aanpassen, weer aanzetten, acceptatieherstel/retry, ouder pending/dismissed record, gelijktijdige fasekeuze en betaald/fysiek later stadium. Opgeslagen historische klant-/orderdata en schema/bedrijfs-/CASgrenzen behouden.

# Laatste27oktober — compact vervolg

Aanvraag-/planning-/klantdetails en prijsopbouw ook standaard dicht, producten en hoofdactie zichtbaar. Complete onbesliste vroege aanvraag afgeleid naar Prijs berekenen; bewuste fase-/Gmailkeuze behouden. Direct rekenen zonder registratieformulier. Mailfasepopup heeft Niet meer tonen als lokale weergavevoorkeur, geen automatische bevestiging. Zie COMPACT-ORDEROVERZICHT.md; alleen lokale bron, eigen controle open.

# Compacte weergave — 27 oktober 2026

Nieuwste UIafspraak: de huidige verkoopfase en eventueel geregistreerde uitvoering staan in één compacte regel. Fases & voortgang opent dezelfde volledige fase-/uitvoeringskeuze en aanklikbare stappen, standaard dicht. Bedragen & marge opent dezelfde vier cijferkolommen; netto bedrag en bekend bruto saldo blijven kort zichtbaar, inclusief voorlopig/onbekend/te veel ontvangen. Geen berekeningen of registraties wijzigen door openen/sluiten. Op overzicht compact volgende-actiepaneel, actieve review-/Gmailconflictwaarschuwing behouden. Onderstaande oudere beschrijving van een altijd zichtbare volledige stappenbalk is historisch. Geen tests/browsercontrole/publicatie, Philippe beoordeelt zelf.

# Ordervoortgang en losse bestellingen

## Reparatie27oktober: dossier openen

De nieuwe uitvoeringsregel verwees naar f.phase zonder lokale f-binding. Bij een order zonder fysieke uitvoeringsstatus brak renderOrder daardoor af voordat de pagina werd vervangen; een klik uit de lijst kon alleen de URL veranderen. Nu wordt de bestaande funnel.phase gebruikt. Rechtstreeks openen wordt door dezelfde pure projectie geraakt; bestaande vrijgave-/uitvoeringsbetekenis behouden, geen gegevensmutatie of globale fallback. Gebruiker heeft ook browseruitlezing geweigerd: uitsluitend bron gelezen/bewerkt, geen tests/checks/build/browserQA. Philippe herlaadt zelf na behoud van eventuele invoer en beoordeelt dossieropenen en tabs voor beide bedrijven, met/zonder uitvoeringsstatus.

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
