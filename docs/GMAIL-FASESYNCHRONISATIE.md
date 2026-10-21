# Automatische verkoopfases tussen Gmail en CRM

21 oktober 2026. Bron lokaal gebouwd, niet getest of gepubliceerd. Geen echte Gmail-read, labelmutatie, accounttoestemming, klantmutatie of mail uitgevoerd door de bouwer. Philippe test zelf. Deze notitie vervangt de oudere beperking dat iedere losse faselabelwijziging een eigen review nodig heeft. Alleen deze afgebakende automatisering krijgt na activering door de gebruiker een vaste toestemming; AI-acties buiten deze route houden hun bestaande toestemmingscontrole.

## Bediening

Instellingen → Gmail → Gmail ↔ CRM-fases instellen. Ook bij Order → Volgende stap → Gmail-fase en bij E-mail → Labels. Aanvullende Google-aanmelding alleen via een expliciete klik als gmail.modify ontbreekt. Daarna bestaande Gmail-labels per fase kiezen en de automatische synchronisatie bewust bevestigen. Het staat standaard uit. Beide bedrijven gebruiken dezelfde code met hun eigen fases en mailbox; bij Maat worden de bestaande Verkoopfase/00–08-labels voorgesteld als ze eenduidig bestaan. Spatlappen vereist eigen labelkeuzes, zonder namen te verzinnen of labels aan te maken.

Labelkeuze en toestemmingsversie staan op de server, gebonden aan bedrijf, mailbox en concrete Google-verbinding. Andere labels blijven intact. Opnieuw koppelen/accountwijziging pauzeert de automatisering tot een nieuwe bewuste activering. Uitzetten kan ook als de verbinding niet meer werkt; een reeds lopende ronde kan eerst aflopen. Geen nieuwe losse AI- of mailprovider nodig; dit pad gebruikt geen AI-inferentie.

## Welke wijziging is leidend?

- Eerste synchronisatie / bewust opnieuw activeren: bestaande eenduidige Gmail-fase overnemen. Zonder faselabel de actuele CRM-fase toevoegen. Conflicterende bestaande labels vragen een keuze.
- Daarna: een andere Gmail-fase overnemen in de dossierfase en eventuele andere gekoppelde gesprekken van dezelfde order.
- Een nieuwe betekenisvolle CRM-handeling mag daarna de fase naar Gmail zetten, ook zonder mail te sturen: expliciete faseregistratie/bevestigde mailfase, een ontvangen of gecorrigeerde betaling, productie-/leverregistratie of archiveren/heropenen. Basis bevat de relevante feiten, niet de al overgenomen Gmail-projectie.
- Gewone notities, klantgegevens, bedragen/productvelden bewerken en pagina’s openen geven geen nieuwe faseopdracht. Alleen het document aanmaken is geen mailverzending.
- Gmail-labels zijn een faseweergave, geen betaal-, verzend-, productie- of leverbewijs. Overnemen schrijft uitsluitend order.gmailSalesPhase met bron en factbasis. Financiële/productievrijgavecontroles blijven hun echte feiten gebruiken. Een bewuste CRM-fasekeuze krijgt een aan diezelfde basis gebonden salesFunnel.selection; een nieuw feit maakt deze keuze opnieuw verouderd.
- Als beide kanten sinds de vorige controle veranderden, meerdere fase-labels bestaan, gesprekken verschillende nieuwe fases hebben, of een label is verwijderd: niet de hoogste of laatst gepollde fase raden. Order → Gmail-fase → Synchronisatie controleren / conflict oplossen geeft één exacte fasekeuze. Bevestiging is twee minuten geldig en wordt opnieuw tegen actuele CRM-/Gmail-informatie gecontroleerd.
- Nieuwe berichten erven bestaande threadlabels niet automatisch. Binnen een eenduidig gesprek brengt de route nieuwe berichten weer onder dezelfde fase. Gesprekken met concepten, spam of verwijderde berichten worden gepauzeerd voor controle.

## Uitvoering en grenzen

De browsercoördinator loopt rustig iedere minuut in een zichtbaar, niet bewerkt CRM-tabblad, plus na gegevensopslag/focus. Maximaal tien dossiers per ronde, gewijzigde dossiers eerst en daarna de minst recent gecontroleerde. Grote administraties hebben meerdere rondes nodig. Web Locks voorkomt dubbele rondes binnen dezelfde browserherkomst; de backend serialiseert daarnaast per bedrijf. Geen laadscherm voor achtergrondwerk. Invoer/dialogen worden niet vervangen. Afwijkingen staan dichtbij de order en in Gmail-instellingen. Resultaten worden met de bestaande transactie en actuele versie vergeleken en opgeslagen. Een overgenomen/gehouden fase is donkerpaars met uitleg bij hover/focus.

Dit is **geen 24/7-servertaak**. Bij gesloten CRM, een verborgen tab, geen netwerk of tijdens invullen blijven verschillen staan tot een volgende ronde. Cloudbetalingen die buiten de browser binnenkomen worden dan uit de verse centrale snapshot gezien. Voor bijwerken terwijl niemand het CRM open heeft is een afzonderlijke serverworker/webhook- en Gmail-history-inrichting nodig. Die is niet actief en niet als voltooid gemarkeerd.

Maximaal tien gesprekken per order uit één eigen mailbox. Koppelingen met verschillende eigenaren, gewijzigde/verwijderde mappings, verkeerde mailbox/bedrijf of ontbrekende scope blokkeren. Geen losse threads uit de mailbox die niet aan een order zijn gekoppeld. De centrale dienst controleert koppelingen en workflowbasis zelf tegen eigen D1-state. Lokaal staat de order in IndexedDB: de browser levert de beperkte workflowbasis/koppeling en controleert bij opslaan opnieuw. De lokale helper heeft geen zelfstandige autoritatieve toegang tot IndexedDB; de account-/labelgrens en vaste toestemming worden wel serverzijdig afgedwongen.

Private synchronisatievoortgang per order bevat vorige workflowbasis, fase, bindingsversie en eventuele korte conflictbevestiging; geen mailbody. Cloud versleuteld in bestaande integraties met CAS/lease, lokaal in bestaande beschermde Gmail-dienstmap. Geen nieuwe databasetabellen/migratie. Synced-record wordt niet iedere poll met een nieuwe tijd herschreven.

Vóór schrijven worden CRM/verbinding/labels opnieuw gelezen; de executor kan alleen de expliciet gekozen gebruikerslabels toevoegen/verwijderen. Applying wordt vóór providerwijzigingen opgeslagen. Een onzekere uitkomst leidt tot opnieuw lezen en eventueel expliciet conflict oplossen, nooit blind opnieuw uitvoeren. Er is geen gezamenlijke transactie met Google: een labelwijziging precies tussen de laatste read en threads.modify kan nog racen. Bij meerdere gesprekken is gedeeltelijke uitvoering mogelijk; de voortgang blijft dan onzeker en vraagt controle. Browseropslag van de fase kan na een providerresultaat mislukken; de volgende ronde leest opnieuw en probeert alleen de nog geldige CRM-projectie te bewaren.

## Bronverdeling

- shared/sales-phase-signal.js: relevante workflowbasis en geldigheid van Gmail-projectie.
- shared/sales-funnel.js: faseprojectie en bewuste fasekeuze; echte betaal-/leverfeiten blijven apart.
- shared/gmail-phase-context.js: begrensde gesprekskoppeling uit actuele state.
- shared/gmail-phase-auto.js: vaste automatische executor, mappingtoestemming, vergelijking, conflict en onzeker resultaat.
- assistant/gmail-service.mjs en cloudflare/gmail.js: vaste provideradapters en beschermde voortgang; bestaande handmatige reviewroute blijft bestaan.
- admin/mail/automatic-phase-sync.js: één gedeelde browsercoördinator en formulieren, met live getters/transacties uit app.js.

Officiële bronnen: [threadlabels aanpassen en vereiste scopes](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.threads/modify), [threadlabels en nieuwe berichten](https://developers.google.com/workspace/gmail/api/guides/labels). Google is tijdens het bouwen alleen via openbare documentatie geraadpleegd.

Open: gebruikerscontrole, aanvullende Google-toestemming en activering per bedrijf, gerichte online release met behoud van bestaande instellingen/data, en desgewenst een afzonderlijke 24/7-servertaak. Geen tests, syntaxchecks, builds, browser-QA of echte providerproeven uitgevoerd. Niet als live werkend of volledig gevalideerd claimen.
