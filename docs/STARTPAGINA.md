# Startpagina — 28 oktober 2026

Philippe wil vanaf het logo een duidelijke homepagina: grote zoekbalk, laatst geopende orders, recente ontvangsten en de dagelijkse menuonderdelen als grote tegels. Gedeelde bron voor beide bedrijven; geen leeftijdslabels in de UI.

## Indeling en bediening

#dashboard is voortaan de startpagina; de sidebar noemt deze Start. Het bedrijfslogo op desktop en de bedrijfsnaam mobiel zijn normale links hierheen. Open/busy of onbewaarde dossierinvoer blokkeert deze nieuwe logonavigatie met een duidelijke melding. De homezoektekst blijft vluchtig binnen de factory en is geen zakelijke draft. De logohandler wordt per shellrender vervangen op de bestaande app-root; geen opeenstapeling van oude routecallbacks. De bestaande mobiele sluitactie sluit het menu ook wanneer Start al openstaat. Bestaande sidebar-, tool-, mail-, back-up- en uitvoeringsroutes blijven behouden.

Bovenaan een grote gelabelde zoekbalk met één Zoekenactie. Enter/Zoeken geeft de ingevoerde tekst aan de bestaande globale zoekdialoog; geen tweede zoekindex, provider of recordstore. Zoekformulier pas schoon markeren bij overname door die dialoog; bestaande actuele-resultaat-/bewerkingsguards behouden. Geen autofocus op page load en geen zoektekst in browseropslag. Betalingen is ook als pagina vindbaar in de gedeelde index.

Direct onder de zoekbalk staan de menutegels. Bouwtaken en Feedback zijn op verzoek uit deze tegelgroep weggelaten; hun bestaande routes en plekken in de zijbalk blijven.

Onder de tegels maximaal4werkelijk eerder geopende orders uit bestaande dossier-view-v1-ID/tijdstipvoorkeuren, per bedrijf/browser. Namen/bedragen worden uitsluitend uit de actuele state geprojecteerd; verwijderde dossiers niet tonen, archief expliciet. Geen schijnrecentheid op basis van aanvraagdatum en geen extra tracking/opslag.

Naast/onder die lijst maximaal4recente positieve huidige ontvangsten uit paymentOverviewRows, afgelopen7kalenderdagen. Bekende order/klant en echte bedragen incl. btw; ontbrekende order gaat naar Betalingen en wordt niet automatisch gekoppeld. Dit is geladen CRM-informatie, geen bankcontrole of duurzaam ongelezenlijstje. Bestaande achtergrondverversing blijft leidend; geen extra poll/provideractie.

Direct onder de zoekbalk de onderdelen uit dezelfde navigationGroups als de sidebar, behalve Bouwtaken en Feedback, met bestaand lijnicoon, duidelijk opschrift en korte uitleg. De Start-tegel gaat zinvol naar Te doen & overzicht (#dashboard/tasks). Taken, lopende orders en activiteiten blijven bestaande dashboardtabs. Hashovergang vanuit dat gemounte tabwerkblad naar #dashboard moet de home renderen, niet stil de eerste tasktab selecteren. Tegels3/2/1kolommen en recente lijsten2/1kolommen; CSS bij centrale eigenaren in admin/style.css, geen nieuwe stylesheet.

## Grenzen en controle

Alleen bronlezing/bewerking en bouwadministratie. Geen automatische tests/checks/syntaxchecks/builds, browser-/DOMcontrole, echte mail-/Gmail-/betaal-/provider-/pushactie, herstart, GitHubupload of livepublicatie. Geen klant-/order-/betaaldata/IDs/schema/bedrijven/CAS/gebruikersstatus/feedback gewijzigd. Catalogus review/local, bredere werkplek doing/local.

Eigen controle beide bedrijven/desktop/mobiel: logo heen/terug vanaf taken/dossier, alle tegels/toetsenbord/focus/contrast, zoekopdracht/Enter/terugkeren en open/busy/onbewaarde formulieren, recent geopend na reload en gescheiden bedrijfvoorkeuren, lege/verwijderde/gecorrigeerde ontvangsten en hun dossierlink. Geen claim dat dit al visueel of functioneel beoordeeld is.
