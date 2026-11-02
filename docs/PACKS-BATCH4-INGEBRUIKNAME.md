> Batch4vervolg31oktober: nieuw readonly eindcontrolescherm, oorspronkelijke PDF-viewers en controlerapportvergelijking lokaal brongebouwd. Beide leveranciersmailsoorten vragen finale eigen bijlagecontrole. Geen gebruikerscontrole/publicatie uitgevoerd, operationele restbouw open. [Actuele bediening en open eindstand](PACKS-BATCH4-EIGEN-CONTROLE-20261031.md).

> Batch3vervolg31oktober: client, contractmapping, interne boekpoging en GetLabels-bron nu gedeeltelijk lokaal gebouwd. HTTP/UI blijft uit; bestandsprojectie/meer-colli-bundel, veilige runtime-inrichting, PK-afspraken en controle open. Geen nieuwe tests/provideractie/publicatie. [Actuele bouwstand en resttaken](PACKS-BATCH3-UITVOERBRON-20261031.md). Oudere nog-te-bouwenvermeldingen hieronder zijn de toenmalige stand.

> Vervolg31oktober: vier nieuwe afgebakende taken, generieke proefmail met actuele twee bijlagen en gekozen proefadres, aparte online proefstand/inrichting voorbereid. Geen runtime-/hosting-/mail-/boekingsproef of publicatie. [Stand, risico’s en vier batches](PACKS-VIER-VERVOLGBATCHES-20261031.md).

> Gerichte bronreview30oktober: vijf lokale herstelpunten PR-01 t/m PR-05; niet getest of gepubliceerd. [Bevindingen en resterend werk](PACKS-BRONREVIEW-20261030.md). Provideruitvoering blijft nog te bouwen.

> Actuele aanvulling30oktober: gebruiker bevestigt dagelijkse afhaalronde zonder extra Pickup. Morgen is lokaal een aanpasbaar voorstel; gereedheid blijft apart en retour naar Kunststofbaas is nog een voorstel. Zie [dagelijkse ronde en datums](PACKS-DAGELIJKSE-RONDE-20261030.md). Geen nieuwe test-/liveclaim.

# PACKS batch 4 — ingebruikname voorbereid, nog niet vrijgegeven

30 oktober 2026. Alleen Maatwerkkunststof/Kunststofbaas. **Geen livegang uitgevoerd; volledige batch4 blijft open.** Dit is een concreet vrijgave- en uitvoeringsplan, geen actieve configuratie, publicatiepakket of bewijs van een werkende verzendkoppeling.

## Wat nu werkelijk beschikbaar is

| Onderdeel | Stand | Bewijs / beperking |
|---|---|---|
| Bestelling/leveranciersnummer, handmatig label, pakbon en leveranciersmail | Lokale bron aanwezig | Eerdere bestelstroom; eigen schermbeoordeling open |
| Pakket-/adres-/datumvoorbereiding | Lokale bron aanwezig | Gerichte pure/state-tests, geen browserbediening beproefd |
| Versleutelde registratie en dubbele-pogingbewaking | Interne lokale serverbasis | Lokale SQLite/CAS-/herstarttests; geen actieve providerketen |
| Historische verificatie eerdere basis | 29 tests geslaagd in batch3; nieuwe bronwijzigingen niet getest | Geen echte PACKS/D1-/PDF-/schermproef |
| Account, dienst, ophalen, retour, kosten en herstelafspraken | Niet volledig bevestigd | PK-01 t/m PK-11 blijven open |
| Echte providerclient, authenticatie en producten-/payloadverwerking | Interne bron gedeeltelijk gebouwd | Huidige HTTP-handler blijft zonder uitvoering; profiel/credential-/runtimeaansluiting open |
| Automatische boeking en label-/bestandsherstel | Interne boek-/GetLabels-bron gedeeltelijk gebouwd | Publieke routes blijven geblokkeerd; state/files-projectie en meer-colli-bundel nog te bouwen |
| Eigen eindcontrole en lokale/online rapportvergelijking | Lokaal brongebouwd | Jouw beoordeling open; versieaanduiding is geen volledige codehash |
| Publicatie, activering en eerste echte zending | Niet uitgevoerd | Voorgaande ontbrekende onderdelen blokkeren vrijgave |

De 29 geslaagde tests gaan over de bestaande voorbereiding en registerbasis. Er is daarmee geen volledige automatische PACKS-koppeling opgeleverd. Ook een bevestiging van alle accountafspraken zou de ontbrekende uitvoercode niet vanzelf toevoegen.

## Werkvolgorde tot echte ingebruikname

| Stap | Verantwoordelijk | Vereist concreet resultaat | Huidige stand |
|---|---|---|---|
| G4-01 Contract vastleggen | PACKS + Philippe/Kunststofbaas | Per PK-tag gedateerde bevestiging: eigen identiteit/omgeving/DirectBooking, kostenvrij testen, dienst/netwerk/product, ophalen/retour, tarieven/limieten, gereedheid/datums, lookup/label/correctie en berichtkeuze | Open |
| G4-02 Uitvoerende serverkoppeling afmaken | Bouwer | Serversecrets, gescheiden omgeving/host, tokenafhandeling, actuele accountproductregels, definitieve payload/datum, laatste order-/configcontrole, duurzame intentie vóór dispatch en vastlegging providerfeit | Gedeeltelijk brongebouwd, niet aangesloten/geactiveerd |
| G4-03 Labels en herstel afmaken | Bouwer | GetLabels voor dezelfde bekende zending, correcte meer-colli-PDF-dekking, begrensde opslag, herstel bij verloren response/commit/bijlage, correcte order-/pakbon-/mailprojectie | Open, nog te bouwen |
| G4-04 Register operationeel voorbereiden | Bouwer/beheerder | Beoordeelde provisioning/retentie/herstelprocedure; verlies van bewijs leidt tot blokkade en reconciliatie, niet nieuw schoon beginnen | Open |
| G4-05 Uitgebreide verificatie van de afgemaakte keten | Bouwer + Philippe + PACKS | Eerst gericht fictief, dan afzonderlijk toegestane aantoonbaar kostenvrije provideromgeving; ook schermen, D1-runtime, originele PDF en bewaren/herstellen | Open; nieuwste keuze: Philippe controleert zelf, nieuwe tests expliciet geweigerd. Historische29tests betreffen oudere bron |
| G4-06 Exacte release vastleggen en publiceren | Bouwer + Philippe | Vastgelegde commit/bestandenscope/configverschil, bestaande bindings/gegevens behouden, afgesproken publicatie; provider nog uit totdat eerste zending beoordeeld kan worden | Niet uitgevoerd |
| G4-07 Eén echte zending begeleiden | Philippe + bouwer + leverancier | Concrete actuele order, werkelijke verpakking/datum, zichtbaar kostencontract, één bewuste boeking, provider-ID/labels controleren en originele bijlagen bewaren | Niet uitgevoerd |
| G4-08 Leveranciersmail bewust aanbieden | Philippe | Juiste leverancier, eigen CRM-nummer en Kunststofbaasnummer, actuele pakbon-PDF + volledige originele label-PDF; afzonderlijke laatste Versturen-keuze | Niet uitgevoerd |

G4-02 t/m G4-04 zijn ontwikkel-/beheertaken, geen vragen die Philippe zelf technisch moet oplossen. De schriftelijke contractwaarden bepalen de uitvoerbare adapter en het herstelpad. Ontbrekend wordt niet met voorbeelden/een accountnaam/een vinkje vervangen. Accountgeheimen horen later uitsluitend in serversecretconfiguratie, niet in dit plan of een mailconcept.

## Voorbereid draaiboek voor die ene toekomstige zending

1. Kies expliciet een geschikte actuele Maatorder bij Kunststofbaas. Leg het werkelijke externe bestelnummer vast. Bewaar de huidige product-/klant-/adres-/pakket-/configbasis die Philippe in het controleoverzicht ziet.
2. Gebruik de bevestigde bestaande dagelijkse afhaalronde; controleer de account-/dienstkoppeling, dat Kunststofbaas werkelijk gereed is, welke fysieke colli/maten/gewichten gelden en waar onbestelbaar transport naartoe moet. Een supplier-origin zending is niet automatisch een extra betaalde Pickup-opdracht.
3. Controleer de echte dienst/limieten/tarieven/toeslagen en keuze van Track & Trace-berichten. Een ontbrekende offerteprijs mag niet als €0 of gegarandeerde eindprijs verschijnen.
4. Controleer het bestaande register en mogelijke eerdere handmatige zending. Een bestaande labelupload kan een al buiten het CRM geboekte zending vertegenwoordigen; niet opnieuw boeken omdat er geen nieuwe API-poging in het register staat.
5. Toon de laatste bewuste boekactie met kostenbetekenis. Na duurzame pending-intentie maximaal één providerdispatch. Bij timeout/onzeker resultaat stoppen en de oorspronkelijke poging onderzoeken; geen herhaalboeking op basis van een lege zoekuitslag of verlopen klok.
6. Bewaar eerst de bekende providerzending en colli-ID's. Haal ontbrekende originele labels van diezelfde zending op. Bij een mislukte label-/bestands-/orderopslag blijft het externe bewijs bestaan; herstel projectie, geen BookShipment-fallback.
7. Vergelijk ontvanger, afhaal-/retouradres, datums, aantal colli, barcode-/itemkoppeling en volledige PDF. Nieuwe pakketgegevens maken eerdere labels ongeschikt als actueel voorstel. Oude bestanden behouden.
8. Maak de bestaande pakbon met afzonderlijke eigen orderreferentie/Kunststofbaasnummer en bewuste klantreferentiekeuze. Bereid de leveranciersmail voor met exact de actuele pakbon en het volledige labelbestand; geen automatische verzending door alleen boeken.
9. Leg de feitelijke uitkomsten vast: boekingsacceptatie, beschikbare labels, mail aangeboden versus afgeleverd en latere logistieke feiten afzonderlijk. Label gemaakt of interface Done is geen bewijs dat het pakket afgeleverd is.

Dit draaiboek voert nu geen enkele stap met een echte order uit. Er is nog geen order voor een eerste echte boeking geselecteerd, geen token aangevraagd en geen kosten veroorzakende handeling uitgevoerd.

## Stoppen en terugzetten

Bij onzekere uitkomst nieuwe boekingen blokkeren en de betreffende poging bewaren. Een label-/mail-/schermfout annuleert de externe zending niet. Geen automatische vervanging, extra afhaling, restitutie of financiëlerecordcorrectie. Bekende scan-/kostenfeiten volgens het werkelijke contract met PACKS bespreken.

Een latere codeterugzetting mag de externe registratie of bestaande bestanden niet terugdraaien. Bij herstel van integratieopslag eerst de betrokken periode reconciliëren; een hersteld oud guardrecord bewijst geen volledige geschiedenis. Configsecrets niet verwijderen zolang herstel van een aangeboden zending daarvan afhankelijk kan zijn. Concrete terugzet-/reconciliatieprocedure moet bij G4-04 worden afgemaakt en beoordeeld; dit document is geen uitvoerbaar rollbackscript.

## Recente informatie en aparte onlineherstelactie

In deze batch uitsluitend read-only gezocht naar mail direct van packs.nl na29oktober2026 in de drie gekoppelde Gmail-accounts, maximaal12resultaten per account. Alle drie zoekresultaten waren leeg. Dit bewijst geen afwezigheid van antwoorden in andere accounts, doorgestuurde mails of andere kanalen. Geen mailbox gewijzigd, concept in Gmail gemaakt of mail verstuurd. De reeds lokaal voorbereide vragen aan PACKS blijven beschikbaar; geen accountnamen/credentials gepubliceerd.

Het acute probleem met Aanvragen & orders is een afzonderlijke kleine herstelkandidaat. Twee bestanden op basis van de opgehaalde gepubliceerde main-bron: actuele state aan de orderlijst meegeven en app-entrycacheversie verversen. De kandidaat bevat geen PACKS-code of nieuw feedbackwerk. De specifieke publicatievraag daarvan staat nog open; het noemen van PACKS-batch4 geldt niet als antwoord op die andere vraag. Zie [online herstel](ORDERS-ONLINE-HERSTEL-20261030.md).

## Registratie

Hoofdtaak `maat-kunststofbaas-fulfilment-20261029`: doing/local; batch4 voorbereid, niet afgerond of live. Alleen bron-/documentatievergelijking, gerichte read-only mailzoekopdrachten en plan-/bouwadministratie in deze ronde. De29tests horen bij batch3 en zijn hier niet opnieuw uitgevoerd. Geen builds, nieuwe test-/checkrondes, browser-QA, providerlogin/boeking/label/mail/betaling, runtimeherstart, migratie, klant-/order-/bestandswijziging, GitHubupload of publicatie. Bestaande wijzigingen/gegevens/templates/Git-staging behouden.
