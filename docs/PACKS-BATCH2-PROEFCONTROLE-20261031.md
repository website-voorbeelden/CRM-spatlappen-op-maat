# PACKS batch 2 — proefmail en voorbereiding online proef

31 oktober 2026. Vervolg van `maat-packs31-batch2`; alleen Maatwerkkunststof/Kunststofbaas. Gedeeltelijk brongebouwd/lokaal. Niet getest, geen online proefinstallatie of publicatie.

## Gebouwd in deze vervolgronde

| Punt | Bronwijziging | Stand |
|---|---|---|
| B2-01 | Online mailserver leest het eigen bewaarde proefconcept op request-ID, controleert order/klant/leveranciersbasis/ontvanger/tekst/afzender/bijlageselectie via bestaande leveranciersregels. | Lokaal brongebouwd; online/usercontrole open |
| B2-02 | Beide PDF's vergelijken op oorspronkelijke naam, type, omvang en SHA-256 met de eigen database én werkelijke bestandsinhoud. Pakbon maximaal 2 MB, label maximaal 4 MB, bestaande grenzen behouden. | Lokaal brongebouwd; niet uitgevoerd |
| B2-03 | Werkspacerevisie controleren tijdens het lezen en opnieuw na de bewaarde pending-verzendintentie, direct vóór dispatch. Bij afwijking geen automatische vervanging of verzending. Een vóór dispatch geweigerd verzoek krijgt rejected/notDispatched; een onzekere uitgaande verzending houdt de bestaande uncertain-bewaking. | Lokaal brongebouwd; niet uitgevoerd |
| B2-04 | Laatste proefvoorbeeld vraagt afzonderlijk bevestiging dat pakbon en label/werkelijke PACKS-boeking bekeken zijn. Bekende geaccepteerde verzendstatus herstellen vraagt deze nieuwe verzendcontrole niet en verzendt niet opnieuw. | Lokaal brongebouwd; jouw bedieningcontrole open |
| B2-05 | Herhaal-/onzekerheidscontrole onderscheidt supplier-trial van gewone mail op server en in het voorbeeld. Eenzelfde request-ID mag niet wisselen tussen proef en gewone mail. | Lokaal brongebouwd; niet uitgevoerd |
| B2-06 | Online capability voor eigen server-/bestandscontrole verplicht. Oude cloudmailservice wordt zichtbaar geweigerd, geen fallback. Lokale helper houdt browsercontrole en toont dat de onafhankelijke online vergelijking daar ontbreekt. | Lokaal brongebouwd; helpers niet herstart |
| B2-07 | Pure configuratievoorbereiding voor eigen Pages/D1/R2/URL en proefidentiteit met vergelijking tegen vier bestaande doelen. Onbekende API-/authroutes in proefbeleid gesloten. | Bron en leeg invulvoorbeeld klaar; geen functie uitgevoerd/inrichting/publicatie |

De servercontrole geldt voor een nieuwe online proefmail, zowel in de dagelijkse cloudomgeving als later in de afzonderlijke proefomgeving. Dit activeert geen normale leveranciersmail, boeking, labelaanmaak of betaal-/klantfase. Een al bekende geaccepteerde request-ID geeft uitsluitend de bestaande acceptatie terug; geen nieuwe dispatch en geen nieuwe PDF-keuze. De bestaande SMTP-configuratie/CAS/lock/journal blijft de eigenaar van verzending.

## Wat jij ziet en blijft kiezen

Open zelf een geschikte order met een actuele leveranciersbestelling, echt gekozen PACKS-label en actuele pakbon. Kies **Meer → Proefmail met label en pakbon**, controleer je proefadres en bereid het bericht voor. Geen vaste order of hardcoded proefadres. Afzender en antwoordadres komen uit de bestaande toegestane instellingen; bij het voorbeeld blijft de afzenderkeuze beschikbaar. Het systeem controleert geen domeinverificatie bij SMTP2GO door alleen een waarde te tonen.

Het laatste voorbeeld toont beide bestandsnamen met bestaande kijk-/downloadknoppen. Jij bevestigt apart de pakbon (klant/adres/producten/leveranciersnummer) en het label tegenover de werkelijke boeking in PACKS (ontvanger/adres/pakketten/maten/gewicht). Het CRM decodeert geen barcode en leest de geboekte pakketwaarden niet uit de PDF. Alleen de laatste knop Versturen biedt een ECHTE proefmail aan. PROEF-herkenning, gekozen servergepinde ontvanger en precies twee actuele PDF's blijven verplicht; dit is geen leveranciersopdracht. Een bestaande vervoersboeking blijft echt.

Fouten houden formulierinvoer en bestanden beschikbaar. Een gewijzigde online werkspacerevisie kan uit voorzorg ook na een andere CRM-bewerking weigeren; open dan een actueel proefvoorbeeld. Bestaande label/pakbon/mails worden niet gewist of geannuleerd.

## Aparte online omgeving — nog niet aanwezig

`scripts/packs-trial-target.mjs` is een pure configuratiefunctie zonder CLI/netwerk/writes/build/publicatie. `work/packs-preview-20261031/target.example.json` bevat bewust lege werkelijke resource-IDs/URL/loginontvanger/bronversie/omgeving-ID. De functie weigert een onvolledige vergelijking of gedeeld project, database-ID of bucket. Zij bewijst niet dat een ingevulde inventaris overeenkomt met de echte providerbindings; die moeten bij de latere inrichting apart worden vergeleken.

Voor de eigen nieuwe Pages-installatie is het bindingslot production/main, terwijl de applicatie preview + trial-only blijft. Geen gewone CRM-release-CLI hiervoor uitvoeren. Eigen login/integratiesleutel/documenttoegang en SMTP zijn apart nodig; geen productieconfig of volledige back-up overnemen. De proefmarkers moeten uitsluitend in de nieuwe database/bucket worden gezet. `publishReady=false` blijft staan.

Nog open: afzonderlijke resource-inrichting/vergelijking, eigen secrets/login/document-/SMTP-configuratie, nieuwe proefidentiteit, expliciet toegestane verpakking/publicatie en proef-URL. Geen van die provideracties hier uitgevoerd. Batch 2 blijft gedeeltelijk; batch 3 echte PACKS-client/boeking/GetLabels en batch 4 eigen eindcontrole/ingebruikname blijven open.

## Jouw controle — nog niet uitgevoerd

1. Controleer lokaal ontvanger/afzender/antwoordadres, het voorbereidingsscherm en beide oorspronkelijke bijlagen; geen leveranciersontvanger als proefadres en geen derde bijlage.
2. Controleer dat beide nieuwe proefvinkjes nodig zijn bij nieuwe verzending en dat aanpassen/teruggaan/fout invoer behoudt. Een verzending is een aparte bewuste echte actie.
3. Beoordeel later in de aparte online installatie dat ontbrekende/oude/beschadigde of verwisselde bijlagen, een gewijzigd concept en een gewijzigde orderbasis vóór dispatch weigeren. Geen echte providerboeking daarvoor nodig.
4. Beoordeel het verschil tussen vooraf gestopt, onzeker aangeboden en bekend geaccepteerd herstellen. Geen nieuw verzendverzoek gebruiken om een onzeker resultaat te omzeilen.
5. Vergelijk vóór inrichting de werkelijke resource-IDs en URL's met beide bestaande CRM's en hun previewbindings; eigen opslag/login/secrets/markers vereist. Geen productie-opslag met proefmarkers aanpassen.

Geen bovenstaande stap is door Codex uitgevoerd. De aangelegde twee offline testbestanden en oudere regressies blijven ongemoeid; Philippe heeft uitvoering expliciet geweigerd. Geen nieuwe testcode toegevoegd.

## Werkelijk uitgevoerd en grenzen

Alleen relevante bron/documentatie gelezen en vergeleken, source/configuratievoorbeelden/documentatie/cachemetadata lokaal bewerkt en bouwlog via `scripts/build-task.mjs` toegevoegd en teruggelezen. Geen tests/checks/syntaxchecks/builds/generator/browser-/DOM-/visuele QA, CRM-helperherstart, resourceaanmaak/migratie, netwerk/providerlogin/token/boeking/label/mail/betaling, zakelijke datamutatie, Git-/indexwijziging/upload/publicatie. Alle voorgaande wijzigingen/data/bestanden/templates en staging behouden. CSS ongewijzigd; bestaande formulieropmaak hergebruikt. Cacheketen `packs-batch2-evidence-20261031`.

Tijdens dit werk vroeg Philippe afzonderlijk om de Mac wakker te houden. Alleen daarvoor `caffeinate -i -t 7200` gestart; geen CRM-runtime gewijzigd. Een gesloten klep kan de Mac nog laten slapen. Dit is geen test- of publicatiehandeling.

Bronvergelijking is geen geslaagde functionele of livecontrole. Ook de laatste revisievergelijking is geen databasevergrendeling tijdens de externe mailaanbieding. Het juiste fysiek verpakte pakket en de betekenis van de labelinhoud blijven gebruikers-/leverancierscontrole. Geen waterdichtheidsclaim.
