> Laatste keuze31oktober: gebruiker antwoordt **Alles lokaal houden** op de publicatievraag. Geen GitHubupload/livepublicatie uitvoeren of als nog te beantwoorden goedkeuring behandelen. Beide bestaande kandidaten behouden; nieuwe inkoop-/feedbackbron blijft eveneens lokaal.

> Aanvulling31oktober: GitHub main opnieuw gelezen, oorspronkelijke app/HTML-blobs ongewijzigd en statefix nog afwezig. Bestaande minimale kandidaat behouden. Extra lokale foutopvang en aparte6bestanden-kandidaat nu klaar; geen tests/publicatie. Zie [bereikbaarheid en beide concrete keuzes](ORDERS-BEREIKBAARHEID-20261031.md).

# Aanvragen & orders — gerichte herstelwijziging

30 oktober 2026. Gebruiker meldt dat bij beide online CRM's Aanvragen & orders niet op een klik reageert. Via de mail kan nog wel een order gemaakt worden. Onderstaande bronoorzaak aangetroffen; daadwerkelijke browserfout en het voorafgaande tijdelijke algemene laadprobleem niet afzonderlijk vastgesteld.

## Bronoorzaak

GitHub main, `admin/app.js` (blob `ce8fce3ea27e061bcca3787a82859c97b9188e94`), geeft bij `ordersTable` geen `state` mee aan `orderListMarkup`. De orderlijst roept `orderPaymentFact(context, o, totals)` aan; de gepubliceerde helper gebruikt `context.state.payments`. Bij normale ontvangsttotalen bereikt de uitvoering die ontbrekende `state` en stopt het opbouwen van de lijst vóór `shell(...)` de vorige pagina vervangt. Dat verklaart waarom de klik bij aanwezige orders niets lijkt te doen. Beide bedrijfsprofielen gebruiken deze gedeelde code.

De huidige lokale canonieke bron bevat `state` al sinds feedbackbatch1 van30oktober. Die correctie is nog niet meegepubliceerd. Geen tweede lokale wijziging nodig; de lokale PACKS-/feedback-/website-/templateontwikkeling en bestaande Git-staging worden behouden.

## Kleine publicatiekandidaat

Vanaf de werkelijk opgehaalde main-bestanden, niet vanaf de veel verder gewijzigde lokale app:

1. `admin/app.js`: alleen `state` toevoegen in de bestaande `orderListMarkup({state, esc, ...})`-aanroep.
2. `admin/index.html`: alleen de app-entrycacheversie naar `orders-state-hotfix-20261030`, zodat een herlaadbeurt de correctie ophaalt.

Basiskopie, twee kandidaatbestanden, `changes.patch` en manifest met oorspronkelijke GitHub-blob-ID's staan geïsoleerd onder `work/orders-state-hotfix-20261030/`. Geen Git-index of bestaande werkkopie aangepast. Het leveranciers-/PACKS-werk en andere nog lokale verbeteringen zitten niet in deze kandidaat. De correctie verandert geen betaalbedrag, order, klant, bestand of databaseschema.

## Publicatie en open controle

Alleen bronvergelijking: GitHub main-app/HTML/orderlijst/betaalhelper naast huidige lokale code en bestaande release-overdracht. Geen tests/checks/syntaxchecks/builds/browser-/DOM-/functionele QA of productiegegevens opgevraagd. Geen liveherstelclaim.

GitHubupload en livepublicatie zijn volgens de gebruikersafspraak aparte acties; voor precies deze correctie op beide CRM's is toestemming gevraagd, inclusief uitsluitend noodzakelijke publicatieverpakking. Nog niet uitgevoerd bij deze notitie. Voor publicatie opnieuw actuele branche-/productieversie vergelijken zodat eventueel recenter werk behouden blijft. Gebruik niet blind de gewone releaseprocedure: die doet ook automatische checks/migraties en zou de hele lokale bron meenemen.

Bij publicatie huidige configuratie/bindings bewaren, uitsluitend deze bronwijziging opnemen, geen migratie/reset/import. Eerstvolgende gebruikerscontrole: online herladen zodra eigen invoer veilig is en Aanvragen & orders openen bij beide bedrijven. Als er daarna nog een fout overblijft, fouttekst gericht onderzoeken; de huidige bronoorzaak bewijst geen oplossing van alle mogelijke laadproblemen.
