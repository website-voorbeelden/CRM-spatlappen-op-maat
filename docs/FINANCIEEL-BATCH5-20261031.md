# Batch 5 — kosten, geldstromen en privéoverboekingen

31 oktober 2026. Lokaal brongebouwd voor eigen controle, gedeeld voor beide CRM's. De bestaande gescheiden bedrijfsopslag/btw-administraties blijven leidend. Geen tests, checks, syntaxcontrole, build, browsercontrole of publicatie uitgevoerd. Geen voorbeeldbedrag, werkelijke betaling, nieuwe zakelijke registratie of fiscale instelling ingevoerd door Codex.

## Bediening

**Analytics → Kosten & geld** (`#analytics/money`). De ingang staat ook bij Bedrijfskosten → Meer. De eerdere financiële pagina blijft bereikbaar als **Ordermarges** met haar bestaande selectie en berekeningen. De nieuwe pagina opent op het huidige jaar; je kiest zelf Van/Tot en met, of alle geregistreerde periodes. De periode blijft alleen in het geheugen van de werkplek.

De hoofdactie is **Privéoverboeking registreren**. Dit is een registratie van een reeds gedane geldoverschrijving tussen de VOF en een persoonlijke rekening. Het formulier vraagt richting, werkelijk bedrag, datum, herkenbaar vennoot-/ontvangerlabel, bankkenmerk en eventueel een verwijzing naar het bankafschrift. Gebruik steeds hetzelfde label om bedragen per persoon te groeperen. Er wordt geen bankverbinding gebruikt en geen geld overgemaakt.

Controleer de VOF en de actieve administratie vóór bewaren. Als één zakelijke rekening voor meerdere handelsnamen wordt gebruikt, hoort dezelfde bankmutatie niet tweemaal in de twee CRM's. De pagina leest geen andere bedrijfsdatabase en maakt geen automatische verdeling tussen de merken of vennoten. De al ontvangen persoonlijke context blijft in de privénotitie bij de actuele chatoutputs; geen rekening-/vennootschapsnaam of bankconfiguratie in de publieke bron hardgecodeerd.

Bij een echte privéopname/inleg kies je die categorie. Voor bijvoorbeeld een mogelijke lening of kostenvergoeding kies je **Nog beoordelen** en geef je toelichting. Beide staan afzonderlijk van omzet, kosten, marge en btw. Er wordt geen salaris, dividend, winstverdeling of kapitaalrekening berekend. De gebruiker heeft een VOF-situatie opgegeven; deze registratie is daarvoor bedoeld, zonder andere fiscale inrichting te wijzigen.

Vergelijkbare datum/vennoot/richting/bedrag geeft een waarschuwing en vraagt een aparte bevestiging voor een werkelijk tweede bankmutatie. Bij wijzigingen vervalt de controlekeuze. Wijzigen vraagt een reden en bewaart de vorige registratie. Uitsluiten, bijvoorbeeld bij een dubbel ingevoerde regel, bewaart historie en haalt alleen de CRM-registratie uit de huidige totalen. Het draait geen bankmutatie terug. Geen verwijderknop, maximaal 1.000 registraties en 50 wijzigingen per registratie. Betalingsdatum verplicht en uiterlijk vandaag; bedrag een positief aantal eurocenten, maximaal 1.000.000.000.000 centen. Invoer blijft bij fouten staan.

## Wat de bedragen voorstellen

| Onderdeel | Datum / bron | Wel / niet optellen |
|---|---|---|
| Geregistreerd geld | Werkelijke betaaldatum | Klantontvangsten, leveranciersbetalingen, bedrijfsuitgavebetalingen en afzonderlijke privébewegingen. Factuurbedragen worden geen extra bankbetaling. Geen berekend banksaldo. |
| Inkoop / kosten | Brondatum | Eén originele bron uit Bedrijfskosten, ingelezen Kunststofbaas-facturen, bestaande leveranciersdocumenten of invoer-btw. Product-/benoemde kostenprojecties komen er niet opnieuw bij. |
| Betaalde btw | Expliciete btw-betaaldatum | Metadata over werkelijk betaalde btw, geen tweede kasbetaling en niet automatisch gelijk aan aftrek. |
| Gecontroleerde aftrek | Btw-datum | Alleen door het bestaande btw-register als gecontroleerd en zonder open bronproblemen opgenomen regels; geen nieuwe fiscale boeking. |
| Ordermarge na algemene kosten | Orderdatum naast brondatum | De bestaande ontvangen-orderselectie en orderkostprijzen, minus afzonderlijke algemene kosten. Gekoppelde kosten/facturen zitten al in die orderkostprijzen. Alleen een operationele indicatie, geen fiscale periodewinst. |
| Openstaande documenten | Alle periodes | Geregistreerd documentbedrag minus werkelijke betalingen, overbetaling apart. Offertes worden geen extra factuurschuld. |

Bedrijfskosten en ingelezen facturen leveren hun bewaarde netto/btw/aftrek/bruto. Bij oude leveranciersdocumenten wordt een ontbrekende btw-basis niet uit het documenttotaal geraden. De bekende nettoregelbasis blijft zichtbaar. Een passende, actuele, gecontroleerde gewone inkoop-btw-boeking kan de volledige basis leveren, alleen wanneer netto + btw exact bij het documentbedrag past en de grondslag niet onder de reeds gekoppelde nettoregels ligt. Verleggings-/invoerboekingen worden niet zomaar in gewone factuurkosten omgezet. Een hogere bronbasis dan de gekoppelde regels vraagt controle van de bijkomende toerekening.

Oude vaste kostprijsvelden en ramingen zonder afzonderlijke brondatum blijven bij volledigheidscontrole. Ze blijven onderdeel van hun bestaande ordermarge en worden niet op orderdatum opnieuw een periode-uitgave. Expliciete nulvelden worden niet als ontbrekende uitgave op de controlelijst herhaald. Een ontbrekende datum of onbekend bedrag wordt niet gelijkgesteld aan nul. Ongeldige/toekomstige betaaldatums vallen buiten de kasperiode en blijven zichtbaar. Een toekomstige brondatum telt in deze werkplek nog niet als huidige bronuitgave.

Mogelijk dezelfde factuur bij meerdere kostenbronnen (leverancier/referentie/jaar) wordt apart gezet totdat de gebruiker afstemt; geen automatische verwijdering of wijziging van de bron. Bekende leveranciersnaamvarianten uit de Kunststofbaas-stroom worden samen herkend. Deze signalering bewijst niet iedere mogelijke dubbeling of correcte kostentoerekening. Bij oude orderbetaaltotalen naast gestructureerde leveranciersbetalingen kiest het overzicht de gestructureerde bron en toont het oudere bedrag afzonderlijk als overlapcontrole. Andere mogelijk dubbele bankregels met dezelfde richting/tegenpartij/datum/bedrag/kenmerk blijven een expliciet afstempunt; er is geen volledige bankreconciliatie.

## Invoer-btw: bron- en betaaldatum

De bestaande zendingvelden zijn uitgebreid met optionele `importVatDate` en `importVatPaidDate`. Zij staan bij het bestaande Inkoopkosten-formulier en de overige gedeelde invoerformulieren. De eerste is de datum volgens het invoer-/btw-bewijs, de tweede uitsluitend de werkelijke betaaldatum. Geen overname van aanvraag-, bestel- of factuurdatum als betaalfeit. Beide AI-prompts, normalisatie, document-JSON en bewaarroutes ondersteunen de optionele datums; oudere antwoorden blijven geldig. Een onbekend AI-veld blijft bij bestaande documentinvoer ongewijzigd. Geen migratie of datums in oude records ingevuld.

De bestaande `importVatIncludedInSupplierPayments` blijft leidend. Apart betaald geeft één extra kasregel op de expliciete betaaldatum. Al inbegrepen betekent geen tweede kasbedrag. Onbekende overlap geeft een afstempunt en wordt niet blind extra opgeteld. De invoer-btw blijft afzonderlijk zichtbaar als betaalde-btw-metadata. De invoer-/betaalbewijzen en aftrekkeuze blijven nodig in de bestaande bron-/btw-werkplek.

Het btw-register kan hetzelfde betaalfeit als de kostenbron bevatten. Het overzicht gebruikt dan de bestaande bron één keer; huidige/historische bestandsaliases en bewijsrelaties worden herkend. Meerdere conflicterende btw-betaalregistraties, een gewijzigde bron of een ontbrekende datum/bewijsreferentie worden getoond voor controle. Geen pro rata berekening van btw uit een aanbetaling. Een handmatige btw-betaalregistratie veroorzaakt nooit zelf nog een uitgaande kasregel.

## Downloaden

Meer → **Periodeoverzicht downloaden** bevat alle gekozen perioderegels, bron-ID's, bedrijfs-ID, aanmaaktijd, datumbasis, bewijsreferenties/bestandsnamen en onvolledigheidsaantallen. Bedragen staan in gehele eurocenten. Kas binnen/uit, netto, btw, kostprijs en betaalde-btw-metadata hebben afzonderlijke kolommen. Een privébeweging staat één keer bij kas; uitgesloten registraties bevatten daar geen positief bankbedrag. Btw-metadata wordt geen tweede bankbedrag.

Meer → **Broncontroles downloaden** bevat de ongedateerde bronnen, oude kostprijsvelden/ramingen, overlap- en afstempunten. Die hebben geen bedragen in de financiële periodekolommen; hun oorspronkelijke waarden staan als controletekst. Zo komt een ongedateerde post niet ongemerkt opnieuw bij een periodesom. Beide CSV's bevatten privégegevens, geen credentials. Tekstcellen krijgen formulebescherming. Maximaal 50.000 regels per bestand; bij overschrijding wordt geen stil afgekapt deelbestand gemaakt. De schermtabellen tonen maximaal 100 bron-/controleregels, de periode-export de volledige passende selectie binnen die limiet.

## Bron, grenzen en eigen beoordeling

De importverwijzingen en app-entry gebruiken `finance-period-review-20261031`; 92 bronbestanden kregen bij deze bronbewerking bijgewerkte importverwijzingen. Buiten de beschreven features gaat het uitsluitend om deze verwijzingen, geen build of generator.


`shared/owner-transfers.js` beheert de optionele `state.ownerTransfers`, geldigheid, basisvergelijking, herhalingsbewaking en historische correcties. `shared/finance-period.js` is een pure leesprojectie; er worden geen afgeleide totalen opgeslagen. `admin/analytics/money-workspace.js` gebruikt dezelfde actuele context en opslagtransactie. Fabrieken doen bij constructie geen state-I/O. De aanvullende ordermarge wordt pas berekend als je die details opent. Centrale `admin/style.css` hergebruikt en niet gewijzigd. Bestaande volledige state/back-up neemt de optionele records mee; de centrale validator en lokale merge bewaken het model. Na een wijziging van privéregistraties begint Stap terug opnieuw om de financiële historie te bewaren; een hele back-up terugzetten blijft een afzonderlijke bewuste vervanging.

Dit is een CRM-overzicht van geregistreerde bronnen. Ontbrekende bankregels, buitenlandse valuta, verrekeningen, voorraadwaardering, afschrijving, verschillende fiscale tijdvakken en een volledige jaarrekening worden niet automatisch gereconstrueerd. Er wordt geen btw-stelsel, kapitaalverdeling of aangifte ingesteld. Voor privéonttrekkingen/stortingen is de officiële [uitleg van de Belastingdienst](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/privestortingen_en_priveonttrekkingen) als bron gelezen; de implementatie blijft registratie van geldverkeer.

Jouw controle staat open: beide actieve bedrijfsprofielen, privéopname/inleg/nog beoordelen, datum/bedrag/vennoot, mogelijke dubbele invoer, wijzigen/uitsluiten/herhalen/twee tabbladen, algemene versus gekoppelde kosten, leveranciersofferte versus factuur, normale en ingelezen leveranciersbetalingen, invoer-btw apart/inbegrepen/onbekend, ontbrekende/verschillende datums, btw-aliases, CSV-kolommen, ongedateerde/overlappende bronnen en volledige back-up. Geen van deze praktijkstappen is door Codex uitgevoerd. Bouwtaak `crm-finance31-batch5` review/local; alle vijf nieuwe batches brongebouwd voor eigen controle. Eerdere gedeeltelijke feedback en PACKS-resttaken blijven open. Geen live- of waterdichtheidsclaim.
