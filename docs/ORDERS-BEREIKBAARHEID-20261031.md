> Laatste keuze31oktober: gebruiker antwoordt **Alles lokaal houden** op de publicatievraag. Geen GitHubupload/livepublicatie uitvoeren of als nog te beantwoorden goedkeuring behandelen. Beide bestaande kandidaten behouden; nieuwe inkoop-/feedbackbron blijft eveneens lokaal.

# Aanvragen & orders bereikbaar houden bij weergavefouten

31 oktober 2026. Beide bedrijven, gedeelde bron. `crm-orders-resilience-20261031`: lokaal brongebouwd, gebruikerscontrole en publicatie open. Deze ronde volgt de eerdere uitval; geen tests uitgevoerd en niets live gewijzigd.

## Oorspronkelijke oorzaak en actuele bron

GitHub main opnieuw read-only opgehaald. `admin/app.js` heeft nog blob `ce8fce3ea27e061bcca3787a82859c97b9188e94`: ordersTable geeft geen state aan orderListMarkup. De betaalcel gebruikt context.state.payments. Dit kan de lijstopbouw stoppen vóór de nieuwe pagina de vorige vervangt, waardoor een klik niet lijkt te reageren. De minimale correctie staat al lokaal, maar staat nog niet in de opnieuw gelezen GitHub-mainbron. Er is in deze ronde geen live-CRM/browser/klantdataset opgevraagd; GitHub-bron is geen afzonderlijke livecontrole.

[Opgehaalde GitHub-mainbron](https://github.com/website-voorbeelden/CRM-spatlappen-op-maat/blob/main/admin/app.js). Het bestaande kleine herstelpakket onder `work/orders-state-hotfix-20261030/` blijft ongewijzigd beschikbaar. De vier nu opgehaalde basisblobs zijn vastgelegd in het nieuwe manifest.

## Aanvullende bescherming in de lokale bron

| Niveau | Gedrag bij een fout |
|---|---|
| Betaalgegevens voor de weergave ontbreken | Expliciet Betalingen niet beschikbaar; geen impliciet nul/volledig betaald en geen berekend bedrag wijzigen |
| Eén betaal-, status- of planningscel faalt | Die cel toont een tekortmelding; de overige rij en dossiers blijven opgebouwd worden |
| Andere berekening of inhoud van één rij faalt | Eenvoudige klant-/nummer-/dossierlink voor die rij, zonder financiële of faseafleiding |
| Zoek-/filter-/sorteer-/lijstbouwer faalt | Eenvoudige lijst van alle opgeslagen orders inclusief archief, eigen zoekveld en Nieuwe klantorder |
| Pagina-/orderdetail-/ordertab-/hashnavigatie faalt | Zichtbare herstelweergave met primaire Nieuwe klantorder en normale navigatielinks; geen stil achterblijvende vorige pagina zonder melding |
| Laat asynchroon resultaat na andere navigatie | Niet over een inmiddels andere route schrijven |
| Openstaande invoer op het moment van herstel | Huidige invoer behouden en melding geven; geen nieuwe herstelpagina over die invoer |

De normale lijst blijft de normale berekeningen, filters, sortering en fases gebruiken. De nieuwe opvang wijzigt geen financiële regels, Tikkie-aanroep, betaling, orderstatus, klant, bestanden, import of databaseschema. De eenvoudige weergave doet geen berekeningen en noemt ontbrekend niet €0 of betaald. Ook onvolledige records worden niet gewist om de lijst te laten verschijnen; zonder bruikbare record-ID verschijnt geen verzonnen dossierlink.

De herstelweergave gebruikt de bestaande ordermaker. Zij maakt of bewaart niet automatisch een order. Bij een fout in die ordermaker volgt een zichtbare fout, geen fictief opgeslagen resultaat. Opnieuw proberen is een bewuste actie; geen reloadlus/providerretry. Klikken op dezelfde route vanuit de herstelweergave probeert opnieuw, ook als er anders geen hashchange zou komen. Nieuwe klantorder is de hoofdactie, aanvullende opties staan bij Meer.

## Diagnose zonder klantinhoud

Opvang rapporteert alleen vaste onderdeelcode en standaard fouttype. Geen ruwe fouttekst/stack, veldwaarden, betaalbedragen of providerbody naar de nieuwe diagnose. Bestaande lokale feedbackdiagnostiek kan dit signaal opnemen; er wordt geen feedback automatisch verstuurd of opgeslagen. De code staat ook zichtbaar onder Informatie voor feedback, zodat de oudere feedbackversie in het geïsoleerde pakket geen verplichte nieuwe diagnosemodule nodig heeft. De huidige erroropvang wijzigt geen eerdere feedbackstatus of Melding-ID.

## Twee afgebakende publicatiekeuzes

1. **Minimale correctie, aanbevolen eerste liveherstel zonder bredere gebruikerscontrole:** bestaand pakket `work/orders-state-hotfix-20261030/`, uitsluitend state meegeven en app-entrycache. De opnieuw gelezen main-app/HTML hebben dezelfde oorspronkelijke blobs. Geen extra beveiliging uit deze ronde, maar de concrete oorspronkelijke bronfout wordt gecorrigeerd.
2. **Correctie plus deze extra foutopvang:** nieuw `work/orders-resilience-20261031/`. Vier bestaande bestanden gewijzigd (`admin/app.js`, `admin/orders/list.js`, `admin/orders/key-facts.js`, `admin/index.html`) en twee nieuwe helpers (`admin/orders/list-recovery.js`, `admin/workspace/render-recovery.js`). Alleen vanaf de daadwerkelijk opgehaalde mainbron opgebouwd, niet de veel bredere canonieke app kopiëren. Geen PACKS-/website-/template-/overig feedbackwerk, CSS, servercode of databasemigratie inbegrepen.

Het nieuwe pakket bevat exacte basisbestanden, kandidaatbron, patch en manifest met GitHub-blob-ID’s en kandidaat-SHA-256. Alleen inhoudelijk bronvergeleken. Geen check/test/syntaxcheck/build of visuele beoordeling uitgevoerd. `publishReady=false` en toestemming/open verpakking zijn eerlijk vastgelegd. De losse zes bestanden zijn geen complete Pages-deploy: bij latere toestemming alle overige bestaande assets/Functions/config/bindings behouden, uitsluitend deze overlay verpakken. Nooit alleen deze zes bestanden als volledige website uploaden of de normale brede release-CLI blind draaien.

Voor daadwerkelijke upload/publicatie actuele hoofdbranch en echte publicatiescope opnieuw vergelijken, omdat ander werk na deze bronopvraag kan veranderen. Bestaande Git-index/werkkopie niet gebruiken of wijzigen. Geen reset/import/migratie, geen nieuwe PACKS-config. Alleen afzonderlijk toegestane noodzakelijke verpakking; geen tests uit publicatie toestemming afleiden. GitHubupload en beide livepublicaties blijven afzonderlijk nog niet uitgevoerd.

## Jouw controle — nog niet uitgevoerd

- Bij beide bedrijven Aanvragen & orders openen, filteren/zoeken, sorteren en een dossier openen; gewone betalingen/bedragen behouden.
- Bij een weergavefout controleren dat de betrokken cel/rij of eenvoudige lijst zichtbaar blijft, bestaande dossiers bereikbaar blijven en Nieuwe klantorder het gewone formulier opent.
- In de eenvoudige lijst zoeken, archief herkennen, dezelfde routelink en Normale weergave opnieuw proberen gebruiken; geen automatische order/provideractie.
- Tijdens open invoer geen herstelpagina daarover; foutsituatie duidelijk zichtbaar en gekozen waarden behouden.
- Na een afzonderlijk goedgekeurde publicatie online herladen zodra eigen invoer veilig is, vervolgens beide bedrijfsversies zelf beoordelen.

Dit document is geen testuitslag. De opvang betreft uitvoerings-/weergavefouten nadat de app geladen is; zij bewijst geen oplossing voor ontbrekende codebestanden, syntax-/bootstrapfouten, login-/opslag-/netwerkuitval of fouten in alle andere formulieren. Een algemene garantie dat nooit een fout voorkomt is hiermee niet aangetoond. Wel is de invloed van de concrete foutklasse gericht beperkt.

## Werkelijk uitgevoerd

Read-only GitHub-bronopvraag, lokale bron/documentatievergelijking en bewerking, geïsoleerde kandidaat/patch/manifest en bouwadministratie. Geen tests/checks/syntaxchecks/build/generator/browser-/DOM-/CRM-QA, live-/klantgegevensopvraag, provider-/mail-/betaalactie, CRM-runtimeherstart, migratie, zakelijke data-/bestandsmutatie, Git-/indexwijziging/upload/publicatie. Op apart gebruikersverzoek caffeinate -i -t 7200 opnieuw gestart (sessie96488), alleen Mac-idleslaap twee uur blokkeren zolang klep open. Geen CRM-runtimeactie daardoor.

Bestaande klantgegevens, bestanden/templates, PACKS-/overige lokale bron en bestaande Git-staging behouden. CSS centraal/ongewijzigd; huidige app/planningcache orders-resilience-20261031. Gebruikerscontrole en publicatie open; brongebouwd is geen bewezen geslaagde werking.
