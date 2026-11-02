# PACKS — boeken, originele labels, herstel en logs

1 november 2026. Alleen lokaal brongebouwd. Geen nieuwe tests, checks, syntaxcontrole, build of browsercontrole uitgevoerd. Geen PACKS-login, token, accountproductopvraag, boeking, labels, mail, betaling, echte CRM-mutatie of publicatie uitgevoerd door Codex. De eerdere interne uitvoerlaag is nu aangesloten in de bron. Dit is geen actieve of bewezen werkende productieverbinding.

## Wat de gebruiker krijgt

Bij een passende Maatwerkkunststof-order: **Kunststofbaas → PACKS boeken / labels herstellen**. De bestaande pakketvoorbereiding heeft dezelfde ingang onder Meer. Het venster toont pakketwaarden in cm/kg, ontvanger/afhalen/transportretour, gereedheid/afhaaldatum en korte labeltekst. De gebruiker controleert de echte verpakking; geen materiaal-/verpakkingsgewicht of prijs geraden.

1. **Status ophalen** leest alleen inrichting/register; geen provideractie. In browseropslag, lokale ontwikkelmodus of de bestaande mailproefstand blijft boeken uit, met concrete uitleg en beschikbaar sessielog. De echte route vereist actuele centrale CRM-opslag en echte login.
2. **Dienst & pakket bij PACKS controleren** doet na bewuste klik een token-/productopvraag, valideert actuele accountdienst/limieten en de precieze huidige order-/voorbereidings-/accountbasis. Dit boekt nog niets. Nieuwe poging-ID is stabiel binnen dezelfde controle, 20–32 hextekens passend binnen bevestigde referentielimiet. Minder dan 20 tekens wordt niet ondersteund in deze UI; niet stil verkorten tot een zwakke identiteit.
3. Daarna verschijnen drie bevestigingen: waarden/omgeving/dienst gecontroleerd, werkelijke boeking volgens tariefafspraak, en ook buiten CRM geen bestaande zending. Pas **Definitief boeken bij PACKS** roept de boekroute aan. Geen extra Pickup, geen automatische klant-/leverstatus, kostenboeking of mail. Create/printLabel=false of niet scannen is geen dry-run of gegarandeerd kosteloze proef.
4. De server legt eerst een duurzame pending-intentie vast. Alleen de CAS-winnaar doet maximaal één BookShipment. Elke bestaande pending/uncertain/booked-poging bij dezelfde order verhindert opnieuw boeken, ook na timeout, tabsluiten, andere accountversie of verlopen lease. Bekende provider-ID’s worden vóór PDF-werk bewaard. Bij onduidelijk antwoord: dezelfde poging onderzoeken, geen automatische herboeking.
5. Bij een bekende complete boeking haalt dezelfde gebruikersactie de labels op. Oorspronkelijke PDF’s moeten exact bij shipment/item/barcode horen. Alle pakketten nodig, samen maximaal 4 MB. De server bewaart de ontvangen oorspronkelijke bytes privé in R2 en hun SHA-256/identiteiten in het versleutelde register vóór teruggeven. Een verloren HTTP-antwoord gebruikt daarna dezelfde bewaarde bytes; geen nieuwe boeking of wisselende opnieuw gegenereerde PDF als stille vervanging.
6. De browser controleert identiteit/omvang/hash/header, bewaart alle originele pakketlabels en één volledige PDF-bundel in de bestaande state/files-transactie en kiest de bundel als orderlabel. De bestaande lokale pdf-lib wordt hergebruikt; alle pagina’s van ieder origineel worden gekopieerd. Geen barcode-/visuele inhoudsverificatie claimen. De bundelgrens blijft 4 MB. Bij een bundel-/opslagprobleem zijn de ontvangen originelen afzonderlijk te downloaden, met vingerafdrukcontrole.
7. De server bevestigt projectie pas nadat originele bestandsmanifesten/identiteiten/hash, bundel en R2-beschikbaarheid bij de huidige centrale order passen. Ontbrekende bevestiging: bekende labels herstellen, nooit BookShipment als labelfallback. Herhaling leest eerst de vers bewaarde state en bestaande bundelbytes; een na verloren antwoord al opgeslagen bundel wordt niet opnieuw met andere PDF-metadatums gegenereerd. Gelijke oorspronkelijke filewrites kunnen hun eigen manifest herstellen zonder een extra activiteit of andere bytes. Een werkelijk ontbrekende/beschadigde oude bundel vraagt herstel van het bewaarde bewijs; de originelen blijven afzonderlijk beschikbaar. Een andere handmatig gekozen labelpointer wordt niet stil overschreven. Een gewijzigde fysieke basis blokkeert automatische toepassing; de oude boeking/bytes blijven bestaan.
8. Maak daarna de bestaande pakbon en gecontroleerde leveranciersmail. Geen mail door deze boekingscode. Een label uit de PACKS-testomgeving mag alleen via de bestaande proefmailroute naar het gekozen proefadres, niet als gewone leveranciersopdracht.

## Inrichting: gewone velden, geen accountwaarden raden

**Meer → PACKS-account instellen** bestaat uitsluitend op de centrale omgeving. Gewone velden voor test/live, API-gebruiker/wachtwoord, product/code/ID, handler/netwerk, bestemmingslanden, pakket-/gewicht-/buitenmaat-/samengestelde limieten. API-afspraken staan onder een apart onderdeel: datumvorm, referentielimiet, boekstatus/printLabel en de algemene OAuth-velden uit de handleiding. Account-/leveranciersafspraken worden door de gebruiker expliciet aangevinkt met een korte bronnotitie; dat is een gebruikersverklaring, geen door CRM afgegeven PACKS-certificaat.

Geen account of dienst uit een voorbeeldbestand of de ontvangen namen afleiden. Niet aannemen dat een van de eerder ontvangen accounts een testaccount is. Het bekende dagelijkse-rondemodel zonder extra Pickup is behouden; operationele retour-/product-/datum-/tarief-/limietrechten moeten voor het werkelijke account kloppen. Alleen afhaal-/bezorgdata en gewichten gebruiken die de gebruiker heeft gecontroleerd.

Accountgegevens worden versleuteld bewaard via bestaande integration-store. Elke bewuste instellingensave maakt een nieuwe onveranderlijke accountversie; oude profiel-/credentialversies blijven voor labelherstel beschikbaar. Er is geen secret-readback en geen credential in browserdraft/log/AI-export. Een te laat statusantwoord overschrijft geen begonnen formulierinvoer. Bewaren doet geen token-/product-/boekaanroep. Een nieuwe versie blijft geblokkeerd tot de serverrelease expliciet overeenkomt.

## Serverinrichting voor beheerder — niet uitgevoerd

Bestaande CRM-login, D1-integratietabellen (migratie0004), R2 en CRM_INTEGRATIONS_KEY zijn vereist. Gebruik eigen opslag/login voor een PACKS-testaccount. De bestaande PACKS-mailproefomgeving met CRM_PACKS_TRIAL_ONLY=true blijft geheel zonder provideracties; een echte PACKS-testomgeving is een andere inrichting en is hier niet aangemaakt.

| Instelling | Vereist gedrag |
|---|---|
| CRM_COMPANY_ID | maatwerkkunststof; Spatlappen geweigerd |
| CRM_PACKS_ENVIRONMENT | expliciet test of live; moet bij opgeslagen profiel passen |
| CRM_RELEASE_ENV | preview voor test, production voor live |
| CRM_PACKS_EXECUTION_ENABLED | uitsluitend true na concrete vrijgave; bronaanwezigheid activeert niets |
| CRM_PACKS_RELEASE_ID | exact de bewust opgeslagen actieve accountprofielversie |
| CRM_PACKS_REGISTRY_GENERATION | unieke onafhankelijke servergeneratie buiten de gewone CRM-back-up |
| CRM_PACKS_FRESH_INSTALL | tijdelijk true uitsluitend voor een werkelijk nieuwe installatie; na eerste inrichting verwijderen/false |
| CRM_LOCAL_DEV / CRM_LOCAL_SERVICES / CRM_PACKS_TRIAL_ONLY | geen van deze lokale/mailproefgrenzen mag de echte boekroute omzeilen |

Voor eerste inrichting vraagt de UI een afzonderlijke verklaring dat dit geen herstel van een verloren register is en dat bestaande zendingen zijn onderzocht. De initroute kan alleen een ontbrekende guard maken als de tijdelijke first-install-vlag en onafhankelijke generatie bewust bestaan. Bestaand register/generatie nooit resetten. Een gewone state/files-back-up draait het externe boekingsregister niet terug. Voor herstel van de gehele integratiedatabase eerst uitvoering uitzetten, register op reconcile en PACKS-historie afstemmen; een ontbrekende/teruggedraaide integratiedatabase is geen bewijs dat niets geboekt is. D1-integratiehistorie en private R2-labelcache hebben een eigen beheerback-up nodig. Geen retentie-/restoreproef uitgevoerd of rampenherstelgarantie.

Er zijn geen serverbindings/secrets/configrecords, resources, login, proef-URL, registergeneratie of migraties aangemaakt of gewijzigd. Er is niets gepubliceerd. Werkelijke activering wacht dus nog op juiste account-/dienstwaarden en afzonderlijke serverpublicatie/inrichting. Dat zijn concrete operationele stappen; de eerder ontbrekende HTTP-/UI-/bestandsprojector is nu brongebouwd.

## Diagnoselog tijdens jouw controle

In hetzelfde venster **Meer → Staplog bekijken / Diagnoselog downloaden**. Bestaande pakketvoorbereiding logt openen en bewaarresultaat; boekroute logt configuratie, token/cache, diensten, controle, claim, dispatch, complete/onzekere uitkomst, labels en projectie. Elk event heeft vaste code, UTC-tijd, interne order-/poging-/trace-ID en waar bekend duur/HTTP-status. Bij een afwijkend boekantwoord worden alleen vaste ja/nee-vlaggen over referentie, adres, datum, handler/netwerk, pakketvelden/aantal en ID’s opgenomen. Geen eigen of providerfouttekst dumpen.

Geen wachtwoorden, OAuth-tokens, gebruikersnamen, adressen, klantnamen, bedragen, PDF/base64, complete payload of ruwe providerbody. Strict allowlist bij opslaan en export; gebruikte accountinvoervelden uitgesloten van bestaande formulier-/AI-export. Het log wordt niet automatisch naar Codex of per mail gestuurd. De gebruiker deelt zelf het bestand bij feedback. Interne IDs blijven herleidbaar binnen de eigen administratie: behandel het als intern diagnosebestand.

Maximaal200serverevents per order,100sessie-events per order/20orders, export begrensd400events. Sessiegegevens uitsluitend geheugen, niet browserdraft of aparte zakelijke database. Serverlog via bestaande versleutelde integratiestore, best effort/CAS begrensd; geen complete auditgarantie, gebeurtenissen kunnen ontbreken. De boekingsintentie en provideridentiteiten blijven afzonderlijk duurzaam bewijs. Bij onbereikbare server downloadt de UI nog het sessielog, met serverLogStatus=unavailable; geen claim dat het serverlog is gelezen. Chronologische weergave en vaste stapnamen. Geen echte logs of providerproeven gegenereerd door Codex.

## Broneigenaren en grenzen

- cloudflare/packs.js: echte auth/Origin/bodylimiet, eigen serveractor/snapshot/config/release/generatie, status/config/init/review/book/recover/projectie-ack/diagnostics. Geen publieke claim/settle/reset. Reviewactualisatie kan blokken zonder provideractie; volledige token-/productreview pas op expliciete klik.
- cloudflare/packs-configuration: immutable encrypted versies, originele credentials voor bekende boeking, servervrijgave los van UI. cloudflare/packs-diagnostics: strikte logvelden/bounded CAS.
- cloudflare/packs-execution en packs-provider-client: bestaande veldmapping/eenmaal-dispatch, nu staplogging. Geen transport-/401-/boekretry of test/livefallback. Alleen dezelfde monotone resultaatwrite kan na verloren bevestiging herhaald worden.
- cloudflare/packs-registry: bekende poging, oorspronkelijke labelidentiteiten/hashes en pending/complete-projectiestatus. Private R2-labelcache vóór response. Geen automatische vrijgave van uncertain.
- shared/packs-label-projection: één idempotente geselecteerde bundel met alle oorspronkelijke bestanden, optionele metadata binnen bestaande documents. Centrale validator en documentverwijdering beschermen bewijs. Labels niet automatisch in kosten/btw/betaalstatus.
- admin/orders/packs-booking en packs-session-log: bewuste bedieningsstappen, actuele basis/keuzes, dezelfde state/files-transactie, fouten/waarden behouden, geen constructor-state-I/O. Geen boeking vanuit alleen browseropslag/offline/mailproefstand.

De gebruiker moet echte pagina’s en barcodes bekijken. Een passend JSON-antwoord, PDF-header, vingerafdruk, complete bundel of log is geen fysieke pakket-/aflever-/volledige veiligheidsverificatie. Voorgestelde ruimte/datum/gewicht blijft eigen controle. Andere geselecteerde labels, gewijzigde basis, credits/correcties, provider-normalisatie buiten expliciete contractvelden en onzekere resultaten vragen gericht vervolg; nooit automatisch vervangen of opnieuw boeken.

## Onderzoek en voortgang

Actuele openbare Swagger op1november uitsluitend via GET opgehaald; webreader niet bereikbaar, openbare curl-opvraag met netwerkmachtiging wel. Versie v9.0.0.0, relevante product-/Shipment-/label-/pakketstructuren naast bestaande mapping gelezen. Aangeleverde privéhandleidingtekst opnieuw gelezen voor OAuth-/DirectBooking-/datumvelden; algemene voorbeeldaccountpagina niet als eigen accountrechten gebruikt. Geen actual-accountcalls of credentials gebruikt. Bronnen: [PACKS-documentatie](https://packsonlineapp.packs.nl/docs/index.html), [Swagger](https://packsonlineapp.packs.nl/swagger/v1/swagger.json).

Taak maat-packs-operation-20261101 en uitvoeringsbatch maat-packs31-batch3 review/local voor bronwerk. Hoofdtaak blijft doing/local; operationele inrichting, PK-bevestigingen, online proefomgeving, eigen controle en afzonderlijke publicatie blijven open. Batches2/4 niet als afgerond gemarkeerd. Historische29tests gelden oudere bron; nieuwe bron heeft geen geslaagde testclaim. Geen nieuwe testcode, tests/checks/builds/browser-QA, runtimeherstart, netwerkaccount-/boek-/mail-/betaalactie, data-/bestandsmutatie, Git-/indexwijziging/upload/publicatie. Andere lokale wijzigingen, klantgegevens, templates, staging en opgeslagen gebruikers-/feedbackstatus behouden. CSS centraal/ongewijzigd in deze ronde. App-/importouders bijgewerkt naar packs-operation-review-20261101, 111 bronbestanden met aangepaste importverwijzingen en app-entry; buiten de beschreven features uitsluitend die verwijzingen, geen generator.
