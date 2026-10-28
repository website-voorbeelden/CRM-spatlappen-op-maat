# Nieuwe feedback — drie batches, 28 oktober 2026

**Alle drie batches lokaal brongebouwd, eigen controle open.** Zie ook [batch3](FEEDBACK-BATCH3-20261028.md). Zie [uitwerking batch1](FEEDBACK-BATCH1-20261028.md). Zes nieuwe meldingen tegenover de export van26oktober. Alle44eerdere meldingen staan er met dezelfde opmerkingstekst in. Veel eerder werk staat lokaal bij Jouw controle; Open in de feedbackexport betekent daarom niet automatisch dat de functie nog ontbreekt. Geen bestaande melding of gebruikersstatus automatisch afvinken.

De6nieuwe IDs via bestaande feedback-CLI aan de privéwerklijst toegevoegd:53totaal, inclusief3oudere lokale meldingen die niet in de export staan. Bestaande51open/2afgehandeld na import; de2afgehandelde meldingen zijn niet heropend door deze export. Dit is een vergelijking met het aangeleverde bestand en de lokale privéwerklijst, geen uitlezing van live CRM of actueel cloudbouwlog. Originele context/ID-matrix blijft privé.

## Batch1 — Aanvragen worden bruikbare orders

Nieuwe exportpunten3en4. Eerst de dagelijkse orderstroom, omdat correcte productgegevens ook nodig zijn voor het koppelen van inkoopregels.

- **Aanvraaggegevens naar product.** Vanuit bekende maat/aantal/bedrukking een duidelijke productaanmaakroute met dezelfde gegevens als voorstel. Onbekende velden onbekend laten; geen fictieve productprijs/akkoord of dubbele regel. Bij bestaande producten geen eigen wijzigingen stil overschrijven. Voorstel en werkelijk opslaan onderscheiden, invoer en actuele klant-/productbasis behouden.
- **Orderbevestiging als alternatief voor aparte offerte.** Een werkelijk verstuurde bevestiging moet de relevante commerciële voortgang kunnen voldoen, zodat niet ten onrechte Offerte nog niet verstuurd blijft staan. Geen extra offerte verplichten in het maatwerkproces. Een klaargezet PDF of betaallink blijft afzonderlijk van werkelijk versturen; geen historische mail-/akkoord-/betaalfeiten verzinnen.

**Lokaal brongebouwd:** bestaande aanvraagchecklist/producteditor/delta-/conflictguards hergebruikt. Lege order krijgt bekende waarden als voorstel, ook actuele onbewaarde aanvulinvoer, zonder bestaande producten te vervangen. Gedeeltelijke maten/herkomst behouden. Offerte / bevestiging telt nu ook werkelijk geregistreerde bevestiging; klaargezet document blijft onverstuurd. Gebruikerscontrole en feedbackafhandeling blijven open; zie FEEDBACK-BATCH1-20261028.md.

**Bronnen:** admin/inquiry-ui.js, shared/inquiries.js, shared/inquiry-edit.js, admin/orders/workspace.js, shared/order-progress.js, shared/order-readiness.js, shared/sales-funnel.js en bestaande document-/mailbewijshelpers.

**Eigen controle na bouwen:** aanvraag zonder product, gedeeltelijke gegevens, bestaande afwijkende productregel, dubbele klik/CAS, voorstel annuleren, bevestiging wel/niet werkelijk verstuurd, bestaand offertetraject en bedrijfsverschillen. Bestaande varianten/goedkeuring/ontvangsten behouden.

## Batch2 — Inkoop: btw vastleggen en minder overtypen

Nieuwe exportpunten1en2. Na de orderbasis zodat AI-regels correct aan bestaande producten kunnen worden gekoppeld.

- **Betaalde btw bij een inkoop/zending bijhouden.** Expliciete bedragen, datum en bewijs/bron bij leveranciersfactuur of afzonderlijk invoerbewijs vastleggen en vanuit de zending terugvinden. Onderscheid met factuurtotaal, betaalde leverancier, invoerrechten en kostprijs behouden. Bestaande btw-bronnen/boekingen hergebruiken; geen dubbele registratie, automatische aftrekclaim of wijziging van onbekende bedrijfsinrichting.
- **AI-hulp bij leveranciersofferte/factuur.** Kleine AI-actie met kopieerbare prompt en begrensde JSON-invoer, eerst als bewerkbaar voorstel. Documentsoort, referentie, datums, aantallen/paren/stuks, prijzen en totalen expliciet controleren. Alleen actuele producten uit juiste bedrijf/zending koppelen, onbekende koppelingen laten kiezen. Document zelf handmatig toevoegen zoals gevraagd. Concepttekst/invoer bij fouten behouden; geen automatisch uploaden, betaling registreren of bestaande regels vervangen.

**Lokaal brongebouwd:** vanuit inkoop dezelfde btw-boeking met betaalde-btw-metadata, datum en bewijs bewerken; invoerbewijs aan zending koppelen. Leverancierrecord/uploads één bron met behoud van historische file:-boekingen. Nieuw leveranciersformulier heeft afgebakende prompt/JSON-voorinvulling zonder betaling of overschrijven bestaande regels. Eigen invoer/bijlagen, herkomst, basis-/revisie-/CASguards behouden. Zie FEEDBACK-BATCH2-20261028.md voor gebruik/grenzen en open eigen controle; feedback niet afgehandeld.

**Bronnen:** admin/purchases/batch-workspace.js, admin/purchases/costs.js, shared/supplier-invoices.js, admin/inquiries/ai-import-flow.js, admin/ai-import.js, shared/vat-ledger.js, admin/analytics/vat-quarter.js en docs/BTW-VOORBEREIDING.md.

**Eigen controle na bouwen:** offerte versus factuur/invoerbewijs, werkelijk betaald versus berekend, onbekende btw/valuta, bestaande bronnen/duplicaten, gedeeltelijke leveringen, JSONfouten, verkeerde zending, gewijzigde basis en handmatige correctie. Dit is technische registratie, geen fiscale beoordeling of aangifte.

## Batch3 — Duidelijkere Analytics en bediening op kleiner scherm

Nieuwe exportpunten5en6. Twee afgebakende verbeteringen aan zichtbaarheid/bediening.

- **Formulier afgerond en grafieken per meetwaarde.** In Websitegebruik naast begonnen ook versturen/daadwerkelijk ontvangen logisch zichtbaar maken. Vanuit relevante meetkaarten de bijbehorende tijdreeks laten zien, dezelfde periode-/paginafilters en uitsluitingen behouden. Eerst de reeds gemeten data ontsluiten: bezoeken, actieve tijd, formulierstappen, scroll en gekoppelde aanvragen. Onbekende meetdekking expliciet houden; geen nieuwe metrics/meetgegevens verzinnen of een verzendpoging een succesvolle aanvraag noemen.
- **Editorwerkbalk passend op MacBook.** Selectieknoppen/groepjes binnen beschikbare breedte naar extra rij laten doorlopen, zonder horizontale uitloop of afgesneden dropdowns. Bestaande CSS heeft al flex-wrap:wrap: eerst groepsbreedtes/min-width/nowrap en de beschikbare canvas-/paneelruimte onderzoeken; alleen nog een wrapregel toevoegen is geen volledige oplossing. Zoom, selectie, artworkzichtbaarheid, sneltoetsen en mobiele bediening behouden.

**Lokaal brongebouwd:** acht klikbare meetkaarten met juiste dagreeks/tabel, poging en ontvangen formulier apart; read-only dagquery op bestaande velden aangevuld. Filters/uitsluitingen/oude-backend-/dekkingsgrenzen behouden. Editorbron had latere nowrap/shrink:0-conflicten: geconsolideerd naar wrap binnen beschikbare breedte, begrensde maatgroep/knoppen en scrollruimte bij geringe hoogte. Geen browserreproductie/visueel akkoord; eigen controle en feedbackafhandeling open. Zie FEEDBACK-BATCH3-20261028.md.

**Bronnen:** admin/analytics/website.js, cloudflare/site-analytics.js, bestaande meet-/uitsluitingshelpers, admin/designs/editor/editor.css, selection-and-controls.js, layout-and-preview.js, spatlap-preview.html. Lees eerst editor/README.md vóór wijzigingen aan laadvolgorde/state.

**Eigen controle na bouwen:** beide bedrijven/perioden/paginafilter/lege of ontbrekende meting, juiste serie bij meetkaart, klik/focus, smalle desktop/klein MacBookscherm, dropdownruimte en canvas/knoppen/toetsenbord/mobiel.

## Bestaand werk niet opnieuw bouwen

Voorbeelden van eerder lokaal gebouwde scope: meerdere ontwerpvarianten en definitieve keuze, fontpreview/import/hoofdletters, logo-/kleur-/randbediening, contact-/factuurmail, betaalcorrectie, factuurvervolg/ontvangstselectie, 50%-vrijgave onder bestaande voorwaarden, benoemde kosten/routebasis en mailinvoerbehoud. Zie VIER-DELEN-20261026.md, OPEN-PUNTEN-VERVOLG-20261027.md, ALGEMENE-CODELEZING-20261027.md en BATCHES2-4-OPMAAK-20261027.md.

Gebouwd in bron, functioneel door Philippe beoordeeld en live gepubliceerd zijn drie aparte zaken. Prestatie-/mobiele-/exportcontrole, complexe SVG-randgevallen en activering van koppelingen blijven open waar eerder zo vastgelegd. Nieuwere afspraken gaan voor oudere feedback: bijvoorbeeld50% in plaats van de oude70% en onbekende verzendprijs anders dan expliciet gratis. De indeling blijft vertrekpunt; alle drie batches zijn nu uitgevoerd op vervolgopdracht. Oude meldingen niet opnieuw implementeren.

De startpagina-/wachttijd-/zebra-/inklapcorrecties van28oktober blijven behouden. De nieuwe pakbon valt buiten deze6meldingen: Philippe stuurt daarvoor nog zelf de Word-template. Voorlopig geen GitHubpush of livepublicatie.

## Voortgang

Alle drie batches staan in de broncatalogus op Jouw controle / alleen lokaal. Bronnotities via scripts/build-task.mjs. Brongebouwd, geen functioneel/visueel akkoord of feedbackresolve. Eigen controle van metingen, formulieren/inkoop en MacBook-/mobiele bediening blijft open. Bestaande bron-/gebruikersstatus en feedbackafhandeling behouden. De indeling gebruikte exportvergelijking en append-only privéfeedbackimport; de uitvoering bestaat uit bronlezing/bewerking en bouwadministratie. Geen automatische tests/checks/syntaxchecks/builds, browser-/DOMcontrole, provider-/klant-/mail-/betaalactie, documentrender, herstart of publicatie.
