# Batch 3 — bedrijfskosten, btw en betaalbewijs

31 oktober 2026. Lokaal brongebouwd voor jouw controle. Gedeelde code voor beide bedrijven; hun bestaande opslag en btw-administraties blijven gescheiden. Geen tests, checks, build of browsercontrole uitgevoerd. Niet gepubliceerd en geen werkelijke uitgaven/betalingen/bestanden ingevoerd.

## Bediening

Beheer → **Bedrijfskosten** (`#expenses`). Eén hoofdactie **Uitgave toevoegen**. Zoek op omschrijving, tegenpartij, referentie of dossier, en filter op kostensoort/brondatum. Onder Meer staat de CSV-download van de huidige selectie, met bedragen in gehele eurocenten. De download bevat privégegevens. De geselecteerde registratie toont netto, btw, gekozen aftrek, kostprijs, bruto, betaald en bewijs; bij Aanpassen blijven deze gegevens bewerkbaar.

Kies algemene bedrijfskosten, een klantorder of een inkoopbestelling. Kostensoorten: bezorgen/koerier, verzenden, bank, materiaal/hulpmiddelen, diensten en overig. Een betaling aan een bezorger kun je ook zonder klantorder vastleggen. Vul bedragen volgens het bewijs in; er wordt geen btw-percentage, aftrekbaarheid, bankbetaling of betaaldatum geraden. Leeg blijft onbekend. Expliciet 0 is mogelijk. Bruto berekenen uit netto + btw is een bewuste knop, zonder berekening van een btw-tarief.

Betaalregistraties bevatten werkelijk overgemaakt bedrag, datum en kenmerk. Ze veroorzaken geen bankbetaling. Betaalde btw is een afzonderlijk, optioneel bedrag met datum; het is onderdeel van de geregistreerde betalingen en wordt daar niet bij opgeteld. Dit bedrag wordt niet naar rato van een aanbetaling geschat.

Voeg PDF/PNG/JPG-bewijs toe of noteer een externe bewijsverwijzing. Maximaal vijf nieuwe bestanden per opslag, 15 MB per bestand en 30 MB samen. Geen OCR, inhoudscontrole van facturen of automatische fiscale goedkeuring in deze batch. De factuurlees-/matchwerkplek is batch 4.

## Bestaande kosten één keer gebruiken

Onder **Bestaande dossierkosten aanvullen** staan eerder ingevulde vaste en benoemde kosten. Kies bij zo'n uitgave die bestaande bron. Je vult netto/btw/betaling/bewijs aan bij dezelfde kostprijs, in plaats van een tweede kostenregel toe te voegen. Het controleoverzicht toont het bestaande bedrag. Een afwijkende nieuwe kostprijs vraagt een aparte bevestiging; onbekende bedragen kunnen niet ongemerkt een al bekende kostprijs vervangen.

Ondersteunde vaste bronnen: verzending en overige kosten van een order; transport, overige kosten en vaste werkelijke invoerrechten van een inkoopbestelling. Berekende invoerrechten blijven een schatting in de bestaande inkoopwerkplek. Nieuwe gekoppelde extra kosten gebruiken de bestaande benoemde kostenregels. Bij een bestaande benoemde regel blijven onder meer regel-ID en productkoppeling behouden. Een registratie kan in deze versie aan één kostenbron worden gekoppeld; splitsen over verschillende bronnen/orders is nog geen automatische functie.

Het bedrag voor de marge is `netto + btw − expliciet aftrekbaar deel`. Onbekende btw of een ontbrekende aftrekkeuze bij positieve btw geeft een onbekende kostprijs. Niet-aftrekbare btw telt mee als kosten. Algemene kosten blijven afzonderlijk: de bestaande ordermarge is nog steeds vóór algemene bedrijfskosten. Het samengevoegde financiële overzicht volgt in batch 5. De lijst Bedrijfskosten mag niet nogmaals boven op alle order-/inkoopkosten worden geteld.

De registratie is de eigenaar van haar gekoppelde bedrag. Op de gebruikelijke kostenformulieren staan die velden alleen-lezen met een verwijzing naar Bedrijfskosten. Ook de centrale opslagvalidatie bewaakt dat de projectie overeenkomt. Een andere oude invoerroute die zo'n bedrag probeert te overschrijven, kan daardoor met een uitleg blokkeren; er wordt dan geen tweede of afwijkende kostprijs opgeslagen. Bestaande leveranciersfacturen blijven in hun eigen werkplek. Een overeenkomende leverancier/factuurreferentie of leverancier/betaalbedrag/datum/kenmerk wordt bij nieuwe kostenopslag tegengehouden. Dit is geen volledige bankreconciliatie of bewijs dat alle mogelijke dubbelen herkend worden.

## Bewijs, wijzigingen en btw

Bestanden en registratie worden in dezelfde bestaande state/files-transactie opgeslagen. Bij fouten blijft het formulier met de gekozen bestanden open. De opslag leest actuele gegevens en vergelijkt de geopende registratie/het dossier en geselecteerde bestaande bewijsmetadata; geen oude volledige CRM-snapshot over een nieuwere schrijven. Vaste bestands-/registratie-ID's beschermen een herhaling na een verloren opslagbevestiging. Gelijke nieuw gekozen bewijsbestanden en hetzelfde gehashte bewijs bij een andere kostenregistratie worden geweigerd.

Wijzigen vraagt een reden en bewaart de vorige registratie, inclusief betalingen en bewijsverwijzingen. Er is in deze eerste versie geen verwijderen/verplaatsen-knop voor kostenregistraties. Bewijs in huidige registratie of historie wordt beschermd tegen gewone bestandsverwijdering. Een gekoppelde order blijft archiveerbaar, maar kan niet gewoon definitief worden verwijderd of samengevoegd; kopiëren neemt haar werkelijke kostenregistraties niet over. Stap terug wist de financiële historie niet: na een wijziging van Bedrijfskosten begint de sessiegeschiedenis opnieuw. Een volledige back-up terugzetten is een afzonderlijke vervanging van de administratie en blijft een bewuste handeling.

Meer → **Btw-bron controleren** opent het bestaande btw-register met de bewaarde bedragen en bewijsverwijzing. Rubriek, tijdvak, stelsel, controle en boeking blijven expliciet. Bestaande boekingen via een bestand blijven als dezelfde bron bereikbaar; er wordt geen nieuwe parallelle boeking voorgesteld. Een gewijzigde kostenbron geeft een controlepunt bij de eerdere btw-boeking. Netto/btw/aftrek en expliciet betaalde btw moeten aansluiten voordat die boeking opnieuw gecontroleerd kan worden. Bewaarde eerdere kwartaalvoorbereidingen worden niet herschreven.

## Bron en resterende controle

- `shared/business-expenses.js`: optionele `state.businessExpenses`, validatie, kostenformule, bronprojectie, dubbele-bronbewaking, actuele-basiscontrole en revisies.
- `admin/expenses/`: werkplek, formulier en alleen-lezen dossierverwijzingen. Fabrieken lezen status pas bij gebruik; geen nieuwe opslaglaag of provider.
- Bestaande `state-validation`, `named-costs`, orderkopie/samenvoegen/verwijderen, documentverwijdering, sessieherstel en btw-register zijn aangesloten. De optionele records reizen met de bestaande volledige state/back-up mee; geen SQL-migratie.
- Bestaande centrale `admin/style.css` gebruikt en niet gewijzigd. Import-/cacheversies vernieuwd als bronmetadata, zonder build of generator.

Jouw controle staat open voor beide bedrijven: een losse uitgave, dezelfde bestaande verzendkosten koppelen, bekende/lege/0-btw en gedeeltelijke aftrek, meerdere betalingen, bijlagen en fout/invoerbehoud, gelijktijdige wijziging, bewijshistorie, orderkopie/archiveren en btw-bron/hercontrole. De brondatumfilter selecteert uitgaven; bijbehorende betaalbedragen zijn niet automatisch op betaaldatum gefilterd. Het kasoverzicht per betaaldatum volgt in batch 5. Grenzen: maximaal 1.000 kostenregistraties, 100 revisies en 100 betalingen per registratie, 20 bewijsverwijzingen en de bestaande 50 benoemde kostenregels per dossier.

Taak `crm-finance31-batch3`: review/local, **gebouwd voor jouw controle**, niet afgehandeld of functioneel goedgekeurd. Batches 4 en 5 blijven open. Bestaande feedbackstatussen, klantgegevens, bestanden/templates en Git-staging behouden. Geen tests/checks/syntaxcontrole/build/browser-QA, runtime-/provider-/mail-/bankactie, migratie, Gitwijziging, GitHubupload of livepublicatie uitgevoerd.
