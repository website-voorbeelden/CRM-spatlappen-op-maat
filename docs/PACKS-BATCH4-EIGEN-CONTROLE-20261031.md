# PACKS batch 4 — jouw controle en lokaal/online vergelijken

31 oktober 2026. Taak `maat-packs31-batch4`: **gedeeltelijk/lokaal, eigen beoordeling en ingebruikname open**. Een nieuw controleoverzicht is brongebouwd. De totale automatische PACKS-koppeling is nog niet klaar; geen tests, provideractie, mail of publicatie uitgevoerd.

## Wat is toegevoegd

Bij een geschikte Maatwerkkunststof-order: **Dropshippen via Kunststofbaas → Meer → Eindcontrole & lokaal / online vergelijken**. De knop staat ook onder Meer in het bestaande besteloverzicht. Daardoor is controle bereikbaar voordat een bestelling actueel is; er wordt geen bewerkformulier met onbewaarde invoer vervangen. Tijdens het asynchroon lezen blokkeert een inmiddels nieuw geopend of gesloten formulier de late weergave.

Het overzicht toont eigen order/Kunststofbaasnummer, omgeving/versieaanduiding, momentopname, werkelijke bewaarde pakketwaarden en datum, ontbrekende voorbereiding en de twee bijlagen. Label en pakbon zijn met bestaande bestandsviewer te openen. Voorbereiding, herladen en proefmail staan onder Meer; de proefmail alleen als de twee actuele bestanden leesbaar binnen de bestaande mailgrenzen zijn. De bestaande proefmailfactory blijft ontvanger/capability/actuele basis controleren.

Automatisch boeken is zichtbaar niet beschikbaar. Technische bouwrestanten, externe afspraken, eigen controle en afzonderlijke publicatie worden niet door één voltooid-vinkje samengevoegd. Het rapport legt geen geslaagde gebruikerscontrole of providerfeit vast.

## Controlerapport

**Deze momentopname downloaden** maakt op gebruikersklik een JSON-bestand van de zichtbare momentopname. Het bevat relevante order-/product-/pakket-/adres-/datumvelden, bewaarde controlevinkjes, documentmetadata en SHA-256 van de werkelijk gelezen PDF's. Omgeving, moment en versieaanduiding staan erbij. Geen PDF-inhoud/base64, credentials, accountconfiguratie, betaalgegevens of volledige CRM-back-up. Het bestand bevat wel klant-/adresgegevens; daarom bij de knop expliciet privé bewaren.

State en bestandsmetadata worden in één readonly-transactie gelezen. Blobomvang en PDF-header worden vóór het begrensde volledige lezen beoordeeld; cloudpeek voorkomt een onbegrensde download. Label maximaal 4 MB en pakbon maximaal 2 MB zoals de huidige mailgrenzen. Geen CRM-bestandswrite, migratie of statewijziging door export/vergelijking. Download gebruikt de bestaande helper, die lokaal een tijdelijk downloadbestand kan klaarzetten; dit wordt volledig afgewacht en een weigering blijft zichtbaar bij het formulier. Bij verdergaan naar bestelling/voorbereiding/proefmail wordt een achterhaalde schermcontext via de bestaande guarded refresh opgehaald, zonder opgeslagen records te schrijven. Mislukte refresh heropent hetzelfde controleformulier met de gekozen vergelijking. Ontbrekend, niet leesbaar, onjuist, te groot en niet actueel blijven zichtbaar; de code neemt daarvan geen nul of goedgekeurd bewijs aan.

Onder Meer kan het controlerapport uit de andere omgeving worden ingelezen. Grootte vóór lezen begrensd op 128 kB; bekend schema/bedrijf/ordernummer-ID/veldallowlist/types/aantallen en unieke velden worden gevalideerd. Andere order of ongeldig bestand geeft een fout bij het bestaande invoerveld; keuze en huidige momentopname blijven staan. De ingelezen informatie wordt nooit toegepast op klant/order/bestanden/config/planning.

Verschillen in waarden/bestanden worden apart getoond van omgeving-/versieverschillen. De ingelezen momentopname is expliciet geen live opvraag. Gelijke vingerafdruk betekent dezelfde gelezen bytes, geen beoordeelde barcode, PDF-pagina's of juiste fysieke zending. Als een actueel bestand niet in beide rapporten kon worden gelezen, wordt de vergelijking niet als gelijke bijlagen gepresenteerd. Geen verschillen geldt uitsluitend voor de opgenomen rapportvelden.

De versieaanduiding is geen volledige codehash. Gelijke bron-/service-/account-/documenttemplate-/runtimeconfiguratie kan hiermee niet bewezen worden. Een rapport kan handmatig gewijzigd zijn en is geen ondertekende vrijgave. automaticBooking en userReviewConfirmed zijn altijd false; import kan geen vrijgave of gebruikersgoedkeuring activeren.

Heeft de online versie deze nieuwe optie nog niet, dan is afzonderlijke update/publicatie eerst nodig. Er is in deze batch geen actuele livebron, providerconfig of online dataset gelezen of vergeleken. Er is ook nog geen aparte online proef-URL gemaakt.

## Controle vóór proefmail en leveranciersmail

De laatste preview van zowel een leveranciersproefmail als de gewone Kunststofbaas-mail vraagt nu apart:

- Pakbon bekeken: juiste klant, adres, producten en Kunststofbaasnummer.
- Label bekeken en vergeleken met de echte PACKS-boeking: ontvanger, adres, pakketten, geboekte maten en gewicht.

Dit zijn bewuste gebruikersbevestigingen in de laatste preview, geen softwareverklaring dat de PDF-inhoud is onderzocht. Bestands-/orderbasisbewaking en de afzonderlijke laatste Versturen-knop blijven bestaan. Bekend geaccepteerde verzendstatus herstellen blijft zonder nieuwe verzending en vraagt deze nieuwe verzendbevestigingen niet. Gewone klantmails zonder supplierFulfilmentMail blijven ongewijzigd. Geen bronfeit voor afhaling/geleverd/betaald of automatische verkoopfase.

## Nog door jou te beoordelen — niet door Codex uitgevoerd

1. Open bij een geschikte order het nieuwe Meer-item. Controleer bewaarde pakketwaarden, Nederlandse afhaaldatum, voorbereidingstekorten en de juiste originele twee PDF's.
2. Open hetzelfde overzicht ook als de leveranciersbestelling niet meer actueel is. Bestaande labelinformatie moet als oud zichtbaar blijven en mag niet als actuele bijlage gelden.
3. Download een momentopname, vergelijk later met een rapport van dezelfde order uit de andere bijgewerkte omgeving. Kijk naar waarden en documentinhoud én de aparte omgeving-/versieaanduidingen.
4. Kies een andere order, ongeldig/groot JSON-bestand of rapport met ontbrekende bijlagen. Er mag geen CRM-invoer worden overgenomen of werkende-ketenclaim verschijnen.
5. Controleer fout/terug/herladen/een inmiddels geopend ander formulier. Eigen zakelijke invoer mag niet door een late leesactie worden vervangen.
6. Bekijk bij de laatste proef- en leveranciersmailpreview beide bijlagen en de twee nieuwe bevestigingen. Een eventuele echte verzending blijft jouw afzonderlijke bewuste actie; er is hier niets verstuurd.

Bovenstaande is een gebruikerslijst, geen uitgevoerde test. Philippe heeft automatische tests expliciet geweigerd. Geen nieuwe toestemming vragen op grond van alleen het woord batch4.

## Eerlijke open eindstand

| Onderdeel | Stand |
|---|---|
| Pakketvoorbereiding/advies/gerichte aanvulbediening | Lokaal brongebouwd, jouw beoordeling open |
| Generieke proefmail en eigen cloudbestandscontrole | Lokaal brongebouwd, echte aflevering niet geprobeerd |
| Afzonderlijke online proefomgeving | Voorbereid, resources/login/config/URL niet aangemaakt |
| Interne PACKS-client/boekpoging/GetLabels | Gedeeltelijk brongebouwd, niet op HTTP/UI aangesloten of geactiveerd |
| Automatische labelopslag en volledige meer-colli-PDF | Nog te bouwen in bestaande state/files-transactie |
| Bevestigde account-/dienst-/datum-/tarief-/herstelafspraken en operationele inrichting | Open |
| Nieuwe eindcontrole/rapportvergelijking/twee mailbevestigingen | Lokaal brongebouwd, niet uitgevoerd/beoordeeld |
| Publicatie/activering/eerste echte API-zending | Niet uitgevoerd, open |

De bouwrestanten zijn werk voor de bouwer. De interne adapter uit batch3 wordt in deze batch niet via een half werkende boekknop aangesloten. De bestaande handmatige PACKS-label-/pakbon-/mailroute blijft beschikbaar. Batches en hoofdtaak worden niet als geheel afgerond. [Actuele vier batches](PACKS-VIER-VERVOLGBATCHES-20261031.md), [concrete uitvoerrestanten](PACKS-BATCH3-UITVOERBRON-20261031.md), [ingebruiknameplan](PACKS-BATCH4-INGEBRUIKNAME.md).

## Werkelijk uitgevoerd

Alleen bron/documentatie gelezen, vergeleken en lokaal bewerkt, plus bronbouwlog via `scripts/build-task.mjs`. Geen tests/checks/syntaxchecks/build/generator/browser-/DOM-/visuele QA, runtimeactie, onlinebron-/provider-/livegegevensopvraag, login/token/boeking/label/mail/betaling, cloudresourceaanmaak/migratie, zakelijke gegevens-/bestandsmutatie, Git-/indexwijziging/upload/publicatie. Geen nieuwe tests toegevoegd. Geen controlerapport van echte klantgegevens door Codex gegenereerd. Oude29tests horen bij eerdere bron. Nieuwe codebron is niet functioneel bewezen.

Nieuwe pure `shared/packs-control-report.js` en featurefactory `admin/orders/packs-final-review.js` onder de bestaande leverancierfactory. Bestaande readonly opslagfacade en bestandsviewer, geen nieuwe zakelijke store/globale context/timer. CRM-CSS ongewijzigd/centraal; bestaande controls/details/tabelregels. Cacheketen `packs-final-review-20261031`. Alle eerdere wijzigingen/klantgegevens/bestanden/templates/staging en opgeslagen feedback-/gebruikersstatus behouden.
