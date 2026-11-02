# PACKS — dagelijkse afhaalronde en datumvoorstel

30 oktober 2026. Lokale bronaanvulling op de antwoorden van Philippe. Alleen Maatwerkkunststof/Kunststofbaas; hoofdtaak `maat-kunststofbaas-fulfilment-20261029` blijft doing/local. Geen operationele providerkoppeling of livevrijgave.

## Vastgelegd en nog open

| Tag | Nu bekend | Nog open |
|---|---|---|
| PK-03 | Philippe bevestigt meegaan met de dagelijkse afhaalronde van Kunststofbaas. Geen extra Pickup-opdracht bestellen. | PACKS bevestigt de passende dienst, accountkoppeling en laadadresautorisatie. Een dagelijkse ronde bewijst niet dat hij op iedere kalenderdag rijdt. |
| PK-04 | Philippe stelt Kunststofbaas voor als bestemming bij onbestelbaar transport. Normale maatwerkretouren staan daar los van. | Akkoord van Kunststofbaas en PACKS op het operationele retouradres. Dit is een voorstel, geen namens leverancier bevestigde toestemming. |
| PK-07 | Gebruikelijk 1–3 werkdagen productietijd volgens Philippe, langer mogelijk bij maatwerk buiten webshop. Morgen gewenst als aanpasbare standaard; geen tijdstip. | Werkelijke gereedheid per order, cutoff, afhaaldagen/feestdagen en definitieve datumserialisatie/accountcontract. |

Overige PK-tags en ontbrekende providerclient/boekuitvoering/GetLabels-/bestandsprojectieherstel blijven open. De antwoorden geven geen toestemming voor login, boeking of publicatie.

## Lokale bediening

- Nieuwe voorbereiding: `loadDate` is morgen, gerekend volgens Europe/Amsterdam. Kalenderdag, inclusief weekend; geen stil verzonnen werkdagen-/feestdagenkalender. Weekend geeft aanvullende uitleg; controle op afhaalronde/cutoff blijft nodig.
- Lichtpaarse herkomst `sources.loadDate=automatic`, met uitleg over de dag na het moment van voorstellen. Handmatig wijzigen verwijdert die markering. Opnieuw openen schuift een bewaarde datum niet door.
- Bestaande voorbereiding wordt gekloond en blijft ongewijzigd tot bewuste opslag. Meer datumopties bevat **Morgen opnieuw voorstellen**; wijzigt alleen dit veld en wist de drie controlekeuzes, behoudt alle andere invoer.
- Afhaaldatum blijft nodig voor een complete voorbereiding. `readyOn` en `deliveryDate` zijn optioneel en staan bij Meer datumopties. Er wordt geen exact verzendtijdstip gevraagd en geen bezorgdatum beloofd. De gebruiker kan onvolledige voorbereiding blijven bewaren.
- Lege gereeddatum is geen gereedmelding. `readyConfirmed` blijft afzonderlijk noodzakelijk: werkelijk verzendklaar uiterlijk op de gewenste afhaaldatum gecontroleerd. Bekende gereeddatum na afhaaldatum, bekende bezorgdatum vóór afhaling en afhaal-/bezorgdatums in het verleden blijven controlepunten. Een al verstreken gereeddatum mag wel: een bestelling kan al klaarstaan.
- Load-/retouradres niet stil invullen uit een aanname of publieke bron. Bestaande adresinvoer blijft behouden. De retouruitleg benoemt Kunststofbaas als voorstel, niet als reeds bevestigde bestemming.
- Gewijzigde fysieke datum blijft onderdeel van de bestaande labelbasis; eerdere bestanden blijven bestaan en eerdere labels worden niet door de nieuwe datum actueel gemaakt. Bestaande order-/klant-/inkoop-/voorbereiding-CAS en foutinvoerbehoud blijven leidend.

## Wat zeggen de bronnen?

[PACKS FAQ](https://cs.packs.nl/focus-win/en-US/kb/articles/faq), geraadpleegd30oktober2026, beschrijft bezorgen bij buren als mogelijkheid bij afwezigheid, en een nieuwe afspraak via niet-thuiskaart/Track & Trace als aflevering niet lukt. De FAQ beschrijft ook retour na bewaren. Dat is algemene informatie; geen garantie dat een buur het aanneemt of een accountgebonden dienst iedere optie ondersteunt. Geen extra buren-vlag of automatische neerzettoestemming in het CRM verzonnen.

De eerder opgeslagen [openbare Swagger](https://packsonlineapp.packs.nl/swagger/v1/swagger.json), info.version9.0.0.0, vereist in BookShipmentInputModel een `returnAddress` naast loadAddress en deliveryAddress. `loadDate` en `deliveryDate` zijn nullable. De aangeleverde handleiding laat providerkeuze bij weggelaten datums toe; dit bewijst geen passende gereedheid. Een leeg optioneel CRM-veld wordt nu alleen opgeslagen: er bestaat nog geen uitgaande serializer of dienstkeuze. Bevestigde accountregels bepalen later of/hoe de adapter dat veld mag weglaten.

## Werkelijk uitgevoerd

Broncode en templates gelezen/vergeleken; gedeelde voorstel-/reviewregels, featureformulier en documentatie aangepast. Bestaande cache-importketen vernieuwd vanwege de toegestane extra herkomstsleutel; centrale CSS niet gewijzigd. Bouwvoortgang via scripts/build-task.mjs. Geen CRM-records, bestanden, accountinstellingen of runtime aangepast.

Drie gerichte fictieve regressiegevallen toegevoegd voor Nederlandse kalendergrenzen, voorstel zonder gereed-/retourfeiten en optionele datums met gereedheidsbewaking. **Niet uitgevoerd.** De eerdere29geslaagde batch3-tests horen bij de vorige bronversie. Geen nieuwe tests, checks, builds, browser-QA, provideractie, mail, Gitwijziging, GitHubupload of livepublicatie. Eigen gebruikerscontrole en verificatie van deze aanvulling blijven open.
