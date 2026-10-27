> Nieuw27oktober: centraal [Betalingenoverzicht](BETALINGENOVERZICHT.md) toegevoegd, naast bestaande ordertab. Ontvangst → gekoppelde klant/order terugvinden, Tikkie-/zoek-/datumfilter, geen nieuwe financiële regels/provideractie. Lokaal, eigen controle en publicatie open.

> Vervolg27oktober: [automatische vrijgave en documentstatus](OPEN-PUNTEN-VERVOLG-20261027.md). Spatlappen gewone vrijgave nu afgeleid van actuele voorwaarden zonder extra bevestigingsklik; gratis teststuk bewust. Bevestiging+link bereidt Wacht op betaling voor, factuur-PDF voldoet aan de factuurstap zonder verzendclaim. Alleen lokale bron, geen tests/publicatie of echte betalingsmutatie.

# Betalingen en documenten — batch2, 23 oktober 2026

Lokale bronuitbreiding op verzoek “doe batch2”. Beide bedrijfsprofielen gebruiken dezelfde code. Geen tests, syntaxchecks, builds, browser-QA, proefdocumenten, echte provideracties, klant-/betaalmutaties of publicatie uitgevoerd. Philippe controleert zelf.

## Ontvangst registreren

Vanuit Betalingen staat het ordertotaal/ontvangen/openstaand bij het formulier. Alleen bij complete bekende prijs inclusief expliciet bekende verzendprijs kun je een percentage kiezen. Eerste ontvangst stelt afgesproken aanbetaling voor (standaard50%); snelle knoppen voor die aanbetaling en openstaand bedrag. Percentage blijft van het hele orderbedrag, niet van het restant. Paarse waarde is een rekensuggestie; de gebruiker registreert alleen werkelijk ontvangen geld incl. btw.

Previewzin toont het saldo na registratie. Mogelijk dubbel (zelfde order, bedrag en dag) of meer ontvangen dan de order vraagt extra expliciete bevestiging. Dat kan legitiem zijn; de UI weigert het niet categorisch. Bedrag vereist maximaal twee decimalen, komma/punt toegestaan. Ontvangstdatum is een echte kalenderdag, uiterlijk vandaag; referentie begrensd.

shared/manual-receipt.js bewaakt de concrete basis van orderprijzen, btw, verzending, aanbetalingspercentage en ontvangsten. Veranderde basis blokkeert de save met Actueel saldo ophalen direct bij de melding; dezelfde knop staat ook in het formulier. Deze expliciete leesactie bewaart de ingevoerde bedrag/datum/referentie en reset de risicobevestiging. Nieuwe basis wordt opnieuw ter controle getoond. Geen verborgen automatische refresh van de invoer. Dezelfde registratie-ID bij herhalen met dezelfde waarden wordt niet nog eens toegevoegd. Activiteit alleen bij echt nieuwe ontvangst; geen automatische factuur, mail of productievrijgave.

## Corrigeren en verwijderen

Bestaande correctie/reden/bevestiging/historie en herstel blijven. Bij Uit saldo halen verdwijnen irrelevante bedrag-/datumvelden en hun validatie; providerbedragen blijven handmatig niet wijzigbaar. Kalenderdatum bij vervanging echt valideren; niets veranderd geeft een duidelijke melding in plaats van een leeg correctie-event. Oude PDF’s/providerbetalingen blijven intact. Geen oude geregistreerde betaling in deze bouwronde veranderd.

## Factuur als vervolgstap

Na ontvangst staat Factuur maken of Factuurmail voorbereiden bij het saldo, naast de bestaande afzonderlijke productievrijgave. De bestaande factuurmailknop had geen uitvoertak in de centrale klikrouter; die is nu aangesloten op startInvoiceMail. Bij ontbrekende factuur gebruikt ook Maatwerkkunststof de bestaande eigen documentgenerator. Eerdere upload-only terugval is vervangen door dezelfde gecontroleerde maak→mailroute als Spatlappen. Een bestaande eigen PDF blijft bruikbaar en kan nog via Documenten worden toegevoegd. Maken, voorbereiden, preview en echt versturen blijven verschillende gebruikershandelingen.

Betaallinks houden maken/controleren direct zichtbaar. Algemene mail/concept/geschiedenis staan onder E-mail & eerdere verzendingen. Geen functies weggegooid. Ontbrekende verzendprijs op Betalingen heeft een directe invulknop; die gebruikt het bestaande herstelvenster met expliciete leverkeuze en terugkeer naar de huidige ordertab.

## Ontvangsten op een factuur

Het gesloten onderdeel toont geselecteerd aantal, met totaalbedrag binnen het onderdeel. Alles aanvinken / Niets vermelden veranderen alleen de toelichting. Standaard alle ontvangsten geselecteerd; een expliciet lege selectie blijft behouden bij terugkeer uit herstel. Selectie verandert niets aan btw, echte ontvangst, betaalstempel of ordersaldo. Bestaande documentvoorbeelden vervallen bij een gewijzigde selectie. Historische facturen blijven hun eigen bewaarde betaalstand tonen.

## Kosten begrijpen

Inkoop & marge → Hoe zijn de kosten opgebouwd? toont bedragen, percentages en balken voor ingevulde directe inkoop, leverancierstransport, invoerrechten, overige inkoop-/orderkosten, klantverzending en benoemde kosten. De bestaande economics/allocatedAmount/namedCostSummary blijven de enige geld- en verdelingsregels. Geen nieuwe tarieven of verdeelsleutel. Onbekend is herkenbaar, expliciet gratis is0; geschatte invoer blijft geschat.

Per product alleen directe inkoop en expliciet aan dat product gekoppelde benoemde kosten; per stuk afgerond ter uitleg. Dit is geen volledige kostprijs inclusief gedeeld transport en geen opgeslagen nieuw tarief. Gemeenschappelijke kosten worden niet stil opnieuw verdeeld. Volledige materiaal-/bewerking-/transportuitsplitsing van één leveranciersprijs kan niet worden verzonnen.

## Documentpreview en controle door Philippe

Bestaande hele-paginafit en zoom blijven. Een lees-/paginaprobleem biedt Opnieuw proberen naast de fout; origineel downloaden blijft beschikbaar. Geen automatische nieuwe documentgeneratie door retry.

Eigen controle nog open: aanbetaling/restant/komma/punt, dubbele ontvangst/overbetaling en conflict met invoerbehoud; providercorrectie/verwijderen/herstel; eigen Maat-/Spatfactuur en preview→mail, expliciet lege ontvangstselectie na herstel; onbekende/gratis/gedeelde kosten en mobiele opmaak. Niets hiervan is door Codex uitgevoerd of als geslaagd geclaimd. Feedback niet resolved en online versie niet aangepast.

## Downloadnaam bij vervangen — 23 oktober 2026

shared/document-revisions.documentDownloadName bepaalt de naam per bestaande bewerkbare documentserie en MIMEtype. Bij offerte/orderbevestiging/proforma/pakbon Aanpassen houden nieuwe bestanden de vroegst beschikbare naam. Ook oude _vN-downloadnamen worden zonder datamutatie geprojecteerd naar de serienaam. De interne revision/IDs/blobs/historie blijven behouden. Elke nieuwe factuur/nieuwe serie houdt eigen naam/nummer; geen invoicehernoeming. Cloudroute krijgt dezelfde gecontroleerde naam in de downloadquery, lokaal dezelfde naam bij de blob. Browser/OS bepaalt overschrijven versus volgnummer; CRM kan bestaande laptopbestanden niet gedwongen vervangen. Alleen bronwerk, geen downloadproef.
