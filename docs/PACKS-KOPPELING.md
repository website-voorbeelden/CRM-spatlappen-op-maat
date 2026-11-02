> Batch3vervolg31oktober: client, contractmapping, interne boekpoging en GetLabels-bron nu gedeeltelijk lokaal gebouwd. HTTP/UI blijft uit; bestandsprojectie/meer-colli-bundel, veilige runtime-inrichting, PK-afspraken en controle open. Geen nieuwe tests/provideractie/publicatie. [Actuele bouwstand en resttaken](PACKS-BATCH3-UITVOERBRON-20261031.md). Oudere nog-te-bouwenvermeldingen hieronder zijn de toenmalige stand.

> Vervolg31oktober: vier nieuwe afgebakende taken, generieke proefmail met actuele twee bijlagen en gekozen proefadres, aparte online proefstand/inrichting voorbereid. Geen runtime-/hosting-/mail-/boekingsproef of publicatie. [Stand, risico’s en vier batches](PACKS-VIER-VERVOLGBATCHES-20261031.md).

> Gerichte bronreview30oktober: vijf lokale herstelpunten PR-01 t/m PR-05; niet getest of gepubliceerd. [Bevindingen en resterend werk](PACKS-BRONREVIEW-20261030.md). Provideruitvoering blijft nog te bouwen.

> Antwoorden30oktober verwerkt: dagelijkse ronde zonder extra Pickup; morgen als aanpasbaar voorstel, optionele gereed-/bezorgdatum en aparte gereedheidscontrole. Kunststofbaas als transportretourvoorstel, nog geen leverancierakkoord. [Actuele aanvulling](PACKS-DAGELIJKSE-RONDE-20261030.md), lokaal en niet opnieuw getest.

> [Batch4 ingebruiknameplan](PACKS-BATCH4-INGEBRUIKNAME.md) voorbereid; concrete providerclient/boekuitvoering/labelherstel en contractbevestigingen ontbreken nog. Vier batches zijn niet als geheel afgerond of live.

> [Batch3 lokale verificatie](PACKS-BATCH3-LOKALE-VERIFICATIE.md): expliciete toestemming voor afgebakende fictieve tests,29geslaagd; echte PACKS-test/activering nog open.

# PACKS — batch 1: contract en technisch ontwerp

Aanvulling batch2: [lokale voorbereiding en serverbasis brongebouwd](PACKS-BATCH2-LOKAAL.md); automatische provideruitvoering/contract en gebruikerscontrole open. De onderstaande batch1-opzet blijft ontwerp waar uitvoering niet expliciet is beschreven.

30 oktober 2026. **Ontwerp uitgewerkt, externe contractbevestigingen open. Alleen lokaal.** Dit document beschrijft nog te bouwen gedrag, geen actieve koppeling of bewezen werking. Taak: `maat-kunststofbaas-fulfilment-20261029`, doing/local. Alleen geschikte Maatwerkkunststof/Kunststofbaas-orders; de gedeelde code en Spatlappen blijven behouden.

## Vier afgebakende batches

| Batch | Resultaat | Huidige stand |
|---|---|---|
| 1. Contract en ontwerp | Besluitenregister, veldkoppelingen, boekingsregistratie, foutafhandeling, vragen aan PACKS | Ontwerp lokaal uitgewerkt; externe bevestigingen en beoordeling open |
| 2. Lokale/serverbouw | Formulier, zuivere regels, beveiligde serveradapter, duurzame registratie en labelherstel | Lokale voorbereiding en beveiligde registerbasis brongebouwd; concrete providerclient/uitvoering/herstel en eigen controle open |
| 3. Verificatie | Eerst afzonderlijk toegestane tests zonder provider; daarna bevestigd kostenvrij testaccount en fictieve gegevens | Alleen afzonderlijk toegestane lokale tests uitgevoerd:29geslaagd na leverwijzecorrectie. Echte provider-/browserverificatie open |
| 4. Ingebruikname | Afzonderlijk toegestane publicatie/activering en één begeleide echte zending, daarna leveranciersmail | Ingebruiknameplan voorbereid; niet vrijgegeven. Provideruitvoering/contract/ketenverificatie nog open; geen livegang uitgevoerd |

Batch 1 geeft geen toestemming voor login, tokens, productopvraag, boeking, labels, mail of een test. Een betaalde boeking mag ook niet als proef dienen om accountrechten te ontdekken. Batches zijn werkafspraken, geen automatisch uitvoerbare keten.

## Bronnen en bewijskracht

Gelezen: aangeleverde Universal Interface Zelfbouw v2.4.3 (2 juni 2026), openbare Swagger-snapshot met info.version v9.0.0.0 (API-pad v1), door gebruiker doorgestuurde PACKS-mail en bestaande CRM-bron. Snapshot en aangeleverde PDF blijven bij het privéonderzoek; geen credentials of accountnamen in projectbron. Versieverschillen en voorbeelden zijn geen bevestiging van eigen accountinstellingen.

- [Openbare documentatie](https://packsonlineapp.packs.nl/docs/index.html)
- [Swagger](https://packsonlineapp.packs.nl/swagger/v1/swagger.json)
- [Bestaande bestelstroom](KUNSTSTOFBAAS-BESTELLEN.md)

Hieronder betekent **gedocumenteerd** dat iets in de geraadpleegde bron staat; **gebruiker** is een verstrekte bedrijfsafspraak; **open** is nog geen uitvoerbaar contract. De privébijlage bevat adres/contact en een niet-verstuurd vragenconcept. Er zijn geen operationele PACKS-aanroepen gedaan.

## Besluitenregister en blokkades

| ID | Onderwerp | Bekend | Nog nodig / eigenaar | Blokkeert |
|---|---|---|---|---|
| PK-01 | Omgeving en account | Gebruiker heeft toegang ontvangen; rechten onbekend | PACKS: juiste API-identiteit, expliciete test/live-omgeving en gescheiden gegevens | Iedere operationele aanroep |
| PK-02 | Direct Booking en testen | Handleiding: testaccount op verzoek Packs Partner; lege voorbeeldpagina bewijst geen rechten | PACKS: Direct Booking, juiste testprocedure en schriftelijk geen productie-/afhaalkosten | Providerverificatie en activering |
| PK-03 | Zendingssoort en afhalen | API kent Shipment/PUDO/RTPU/Pickup; gebruiker bevestigt bestaande dagelijkse ronde bij Kunststofbaas, geen extra Pickup | PACKS: type/product/netwerk/handler, account-/laadadresautorisatie en juiste aansluiting op bestaande ronde | Boeken; geen Pickup afleiden uit ophalen |
| PK-04 | Retour bij onbestelbaar transport | Gebruiker bedoelt geen normale klantretour; Kunststofbaas voorgesteld als operationele retourbestemming | PACKS + leverancier: akkoord op operationeel retouradres en afhandeling | Boeken; geen retouradres raden |
| PK-05 | Tarieven en limieten | Gebruiker meldt dezelfde tarieven als leverancier; geen exacte tabel/accountkoppeling | PACKS: tarieven, toeslagen, colli/gewicht/maten/landen en definitie productSizeMax | Betrouwbare prijs en livevrijgave |
| PK-06 | Verpakking | Gewenst: aanpasbaar voorstel, doorgaans één pakket | Gebruiker/leverancier: betrouwbare massa, bescherming, verpakte buitenmaten, pakketindeling | Definitief boeken zolang fysiek onbekend |
| PK-07 | Gereedheid en datums | Gebruiker wil morgen als aanpasbaar voorstel zonder tijdstip; meestal 1–3 werkdagen gereed, langer maatwerk mogelijk; dat is geen gereedmelding | Leverancier + PACKS: werkelijke gereedheid/cutoff/afhaaldagen, datumformaat en tijdzone | Boeken met passende datum |
| PK-08 | Onzeker boekingsresultaat | Geen bewezen idempotentie op shipperShipmentId; geen gedocumenteerde directe zoekfilter daarop | PACKS: duplicaatgarantie, lookup, vertraging/volledigheid en supportprocedure | Automatisch herboeken; activering zonder herstelprocedure |
| PK-09 | Labels | Direct Booking/GetLabels beschreven; oorspronkelijke PDF gewenst | PACKS: vereiste ID-combinatie, meer-colli/merged-PDF en koppeling ontbrekende response-ID's; leverancier: afdrukmogelijkheid | Betrouwbaar labelherstel en ingebruikname |
| PK-10 | Berichten en status | Interface Done is geen bezorgbewijs | Gebruiker + PACKS: Track & Trace-mailkeuze, tracebron/identiteit en betekenis boekingsresultaat | Automatische klantmail-/leverstatusafleiding |
| PK-11 | Foute boeking en kosten | Mail PACKS: niet aanpassen; vervallen onder voorwaarden zonder scan, pickups altijd belast | PACKS: toepassing op gekozen dienst en praktische correctieprocedure | Automatische annulering/vervanging/kostenterugboeking |

PK-01 t/m PK-11 blijven zichtbaar open zolang alleen algemene documentatie of een gebruikersverwachting beschikbaar is. Afhaaladres is bekend als gebruikersinformatie; autorisatie ervan door PACKS is apart. Een enumwaarde Cancelled is geen annulerings- of restitutietoezegging. Geen automatisch kostenbedrag, nulprijs of btw-/margewijziging bij een boeking.

## Veldkoppelingen voor batch 2

Onderstaande namen zijn een ontwerp voor de adapter, geen nu toegevoegde CRM-velden. Server valideert types, eenheden, limieten en actuele orderbasis opnieuw. Ontbrekend is onbekend. Niets stil afknippen, normaliseren naar een andere betekenis of met nul aanvullen om de API te laten accepteren.

| CRM / gecontroleerde invoer | PACKS-veld | Contract / validatie |
|---|---|---|
| Serverprofiel Maat + geschikte leveranciersorder | Geen payloadveld, serverguard | Bedrijf uit serveromgeving, niet uit browserbody; capability én actuele order/leverancier controleren |
| Omgevingsconfig met bevestigde dienst | shipmentType, handler, network, item.product | Alleen expliciet bevestigde/accounttoegestane waarden; productcode 1–20 tekens; geen voorbeeldcodes |
| Eigen onveranderlijke poging-ID | shipperShipmentId | Uniek binnen CRM/omgeving, exact opslaan; schemalimiet ontbreekt, lengte/tekens met PACKS bevestigen. Geen idempotentie aannemen |
| order.number | Korte eigen referentie/labelText | Eigen CRM-nummer blijft apart van leverancier- en provider-ID; labelText max50; uiteindelijke referentierol met PACKS vastleggen |
| order.supplierOrderReference | Afzonderlijke leveranciersreferentie waar toegestaan | Blijft canoniek Kunststofbaas-bestelnummer; pakbon customer_reference volgt bestaande bewuste keuze. Niet gebruiken als unieke poging-ID |
| Vastgelegde laadlocatie | loadAddress | Gebruikersadres uit privébesluit, pas actief na PK-03; niet uit factuuradres afleiden |
| Actuele gekozen aflevergegevens | deliveryAddress | Gestructureerd controleren; vrije tekst is hoogstens voorstel, geen stil geraden straat/huisnummer/land |
| Expliciet afgesproken transportretour | returnAddress | Swagger vereist object, productinfo heeft daarnaast returnAddressRequired. Geen adres invullen op basis van maatwerk-retourbeleid |
| Bedrijfs-/contactnaam | address.name / nameTo | name verplicht, max50; nameTo max50. Geen naam stil afknippen; bewuste verdeling waar inhoudelijk juist |
| Straat, nummer, toevoeging | street / number / numberExt | street en number verplicht; elk max50, numberExt max50. Nummer is string, toevoeging behouden |
| Postcode, plaats, land | zip / place / country | Verplicht; max10/max50/country max2 ISO-alpha2. Land uit gecontroleerde bestemming, niet altijd NL |
| Zakelijk contact / bezorgcontact | phone / mail | Optioneel volgens schema; max50/max255. Alleen benodigde gegevens; geen klantnotities/contacten ongericht kopiëren |
| Korte gecontroleerde adresreferentie | address.reference / location | Max50 elk. Geen volledige bestelbeschrijving; nummers niet ongemerkt inkorten |
| Klaar-/afhaal-/bezorgdatum | loadDate / deliveryDate | Bewust bevestigde logistieke datums; schema date-time versus beschrijving YYYY-MM-DD eerst oplossen. Nederland-logistiek, niet browser-/reistijdzone |
| Korte afleverinstructie | deliveryInstructions | Max200; geen verborgen tekstafkap. Instructie is geen toestemming een ander adres te gebruiken |
| Werkelijke colli | shipmentItems[] | Eén item per werkelijk pakket; voorstel '1' vraagt bevestiging. MaxColli en accountproductregels toepassen |
| Verpakte buitenmaat per collo | item.length / width / height | CRM-productmaat mm is bron voor voorstel, PACKS cm; omrekenen /10 pas na pakketvorming. Schema 0..999; fysieke maat moet positief en accountgeldig zijn |
| Gewicht inclusief verpakking | item.weight | Kilogram; positief eindig en accountlimiet. Schema-default0 niet als gemeten gewicht gebruiken |
| Labelkeuze | item.fileType, printLabel | Originele PACKS-PDF voor leverancier; printLabel=false of status Create is geen bewezen dry-run |
| Geen gewone klantretourflow | item.returnOrder | Alleen op bevestigd contract vastzetten; geen afleiding uit gebrek aan klantretourrecht |
| Providerantwoord | shipmentId, item.shipmentItemId, barcode | Provider-ID's en colli exact opslaan/matchen, gescheiden van order- en leveranciersnummer; HTTP200 alleen bewijst geen bruikbare boeking |
| Bestaande zending | GetLabels.shipmentItems[] | Heropvraag met bekende provider-ID's/barcodes volgens bevestigd contract. Geen BookShipment als labelfallback |

Optionele velden weglaten tenzij bewust ingevuld of contractueel vastgelegd. ProductInfo-limieten en geldigheid zijn aanvullend op schema; productSizeMax is geen bewezen omtrekformule. ProductInfo kent geen aangetoonde definitieve verzendprijs. Accountproductopvraag zelf is een operationele aanroep en volgt pas na toestemming/omgevingbevestiging.

### Een verantwoord pakketvoorstel

Eén pakket mag alvast als **voorstel** verschijnen. De gebruiker bevestigt aantal, verpakte buitenmaten en gewicht vóór definitief boeken; handmatig aanpassen blijft mogelijk. Bron en onzekerheid staan bij de waarden, niet verborgen achter een algemene bevestiging.

Een gewicht uit materiaal mag alleen met bekende productgeometrie/volume en een vastgelegde passende dichtheid: massa in kg = volume in m³ × dichtheid in kg/m³, vervolgens werkelijk verpakkingsgewicht erbij. Uitsparingen, verschillende materialen/aantallen en ontbrekende gegevens expliciet behandelen. Dit document introduceert geen dichtheden, verpakkingsgewichten, tarieven of standaard toeslagcentimeters. Bij onvoldoende bron alleen handmatige werkelijke pakketgegevens accepteren.

Buitenmaten zijn die van het verpakte pakket met bescherming, stapeling en uitstekende delen. Een optelsom van productdiktes is geen verpakkingsbewijs. Geen automatische rotatie/stapeling of colli-splitsing op grond van alleen productregels. Pakketvoorstel wijzigt geen productie-/productmaten, inkoopkosten, financiële administratie of voorraad.

## Bediening die in batch 2 gebouwd wordt

De bestaande handmatige Kunststofbaas-bestelling en het leveranciersnummer blijven de basis. Bij een actuele bevestigde bestelling: pakket-/datum-/adresvoorstel → controleoverzicht → één duidelijke laatste actie **Zending boeken bij PACKS**. Vóór die knop staan ontvanger, leveranciernummer, eigen ordernummer, afhaal-/retouradres, datums, colli en eventuele nog onbekende prijs/toeslagen. Kostenonzekerheid kan niet met een vinkje ontbrekende contractvrijgave vervangen.

Openen, renderen, preview, opslaan van een concept of status bekijken boekt niets. Geen 'testen' via een echte BookShipment. Meer bevat details/historie; onzeker resultaat blijft juist prominent met vervolgstap. Tijdens echte opslag busy/inert en bij fouten invoer behouden, ook bij andere-tab-/revisieconflicten. Nooit een technische retryknop tonen die opnieuw BookShipment doet.

Na bewezen boeking: originele labels ophalen/bewaren → bestaande pakbonmaker → bestaande leveranciersmail met gecontroleerde twee bijlagen. Meerdere colli moeten volledig vertegenwoordigd zijn in het labelbestand; niet stil alleen het eerste label gebruiken. Verzenden van mail blijft een eigen bewuste stap met bestaande mailjournalbescherming. Geen automatische betaal-, productie-, verkoopfase- of fysieke leverstatus door het boeken/label/mail klaarzetten.

## Duurzame boekingsregistratie

Batch 2 bouwt op de bestaande versleutelde `cloudflare/integration-store.js`: serverbedrijf, AES-GCM en versie-CAS. Geen tweede CRM-state of browserjournal. Voorstel: één record `packs-<omgeving>-order-<orderId>` met actieve poging en voorgeschiedenis samen onder dezelfde CAS. Geen losse poging-/indexwrites die zonder transactie uit elkaar kunnen lopen. De blokkeeridentiteit hangt niet alleen aan een wijzigbare accountconfigversie.

De registratie bevat minimaal schemaVersion, companyId, environment, orderId, poging-UUID, clientrequest-ID, configversie/afgeschermde accountidentiteit, tijdstippen, actor, status, gecontroleerde onveranderlijke payload en basisfingerprint, provider-ID's per collo, beperkte foutclassificatie en herstel-/projectiestatus. Payloadadresgegevens alleen versleuteld en toegangbeperkt; geen volledige body/token/base64labels in bouwlog, foutlog of browserdiagnostics.

Het providerregister staat los van gewone order-undo, kopiëren, archiveren en CRM-state/files-back-upherstel. Ordermetadata is een projectie, niet het bewijs dat nooit geboekt is. Herstel van een oude gewone CRM-back-up mag een bestaande poging niet verwijderen/vrijgeven. Gewijzigde/verdwenen order toont een herstelconflict. Ook registerlimiet of opslagfout betekent stoppen, nooit geschiedenis wissen om opnieuw te kunnen boeken.

Een rampenherstel van de integratiedatabase zelf kan externe feiten terugdraaien in de opslag. Daarom: aparte operationele back-up/retentieprocedure en boekingen na zo'n herstel geblokkeerd totdat de betrokken periode door PACKS/support is gereconcilieerd. Ontbrekend register, ontsleutelfout, sleutelwisseling of onbekend schema is geen leeg schoon register. Dit blijft een activeringsvoorwaarde; alleen CAS claimt geen herstelgarantie.

### Overgangen

| Interne toestand | Betekenis | Toegestane volgende stap |
|---|---|---|
| prepared | Actuele gevalideerde controlebasis, nog geen providerdispatch | Eén CAS-winnaar mag pending vastleggen; gewijzigde basis vraagt nieuwe controle |
| pending | Duurzaam vastgelegd vóór mogelijk verzonden boekingsverzoek | Resultaat opslaan; crash/timeout blijft blokkeren. Niet opnieuw dispatchen |
| uncertain | Verzoek kan geboekt zijn, geen sluitend lokaal bewijs | Alleen herstel/reconciliatie van dezelfde poging; geen automatische nieuwe boeking |
| rejected | Bewezen geen zending aangemaakt, reden vastgelegd | Na foutcorrectie en expliciet nieuw controleoverzicht nieuwe poging met historie; geen stille retry |
| booked | Geldige bekende providerzending/collo-ID's duurzaam opgeslagen | Bestaande labels ophalen en orderprojectie herstellen |
| labels_pending | Bekende boeking, label ontbreekt/onbruikbaar/niet opgeslagen | GetLabels voor dezelfde zending; geen BookShipment |
| ready | Alle vereiste labels duurzaam bewaard en gekoppeld aan actuele basis | Pakbon/mail via bestaande bewaking |
| changed / review_required | Nieuwe order/config/basis past niet bij externe boeking | Oud bewijs bewaren; bewuste beoordeling/correctie via afgesproken proces |

Deze namen zijn ontwerp, geen statusvelden die nu al bestaan. Label-/orderprojectiestatus kan apart in dezelfde poging staan zodat een bruikbaar providerfeit nooit verloren gaat door een mislukte bijlageopslag. Een definitieve lokale validatiefout vóór dispatch is geen onzeker providerresultaat.

De exclusieve lease van integration-store duurt beperkt en is alleen aanvullende concurrencybescherming. Een verlopen lease maakt pending/uncertain nooit herhaalbaar: de oude provideractie kan nog onderweg of al uitgevoerd zijn. Ook een procescrash tussen duurzaam pending en feitelijke HTTP-dispatch blijft conservatief geblokkeerd. Geen herstel op alleen klok, tweede klik of page refresh.

Een herhaald clientrequest krijgt de opgeslagen uitkomst/blokkade terug. Ander request-ID, ander apparaat, gewijzigde accountconfig of opnieuw opgeslagen order mag een actieve/onzekere eerdere poging niet omzeilen. Bij een noodzakelijke echte vervangingszending: apart expliciet beoordeeld verzoek, zichtbare oorspronkelijke poging/kosten/onzekerheid en schriftelijke herstelprocedure; geen generiek 'vrijgeven' of geschiedenis verwijderen.

## Fouten en herstelcontract

| Situatie | Vastleggen / tonen | Herstel zonder dubbele boeking |
|---|---|---|
| Dubbelklik, twee tabs/apparaten | Zelfde order/omgeving onder CAS; verliezer leest actuele poging | Eén dispatchclaim; bekende uitkomst teruggeven, niet blind opnieuw |
| Order/klant/adres/datums veranderen vóór dispatch | Huidige basis wijkt af van controlebasis | Invoer behouden, nieuw overzicht bevestigen, nog geen verzoek |
| Config/account verandert tijdens lopende poging | Oude account/omgeving en configversie bij poging bewaren | Niet naar nieuw account herboeken; oude credentials niet zomaar wissen als herstel nodig is |
| Timeout, 5xx, verbroken verbinding, procesherstart | pending/uncertain blijft duurzaam actief | PACKS-reconciliatie; geen automatische BookShipment-retry |
| HTTP200 met onleesbare of onvolledige body | Onzekere uitkomst; beschikbare ID's bewaren | Gericht dezelfde zending onderzoeken; HTTP200 is geen volledig resultaat |
| Slechts een deel van colli/labels terug | Bekende ID's bewaren, pakketdekking onvolledig | Geen complete mail; herstel per bekende zending, ontbrekende ID's reconciliëren |
| Bekende zending, PDF ontbreekt/fout type/te groot | labels_pending, provider-ID's behouden | Begrensd GetLabels/bestandherstel; nooit opnieuw boeken |
| Providerresultaat ontvangen maar registerwrite faalt | Geen succes claimen; bestaande pending blokkeert | Beperkt opnieuw dezelfde resultaatwrite, of reconciliatie; geen BookShipment |
| Register goed, order/files-save faalt | Geboekt blijft bewaard, projectie onvoltooid | Zelfde zending/labels opnieuw aan actuele order koppelen na basiscontrole |
| Token ongeldig/nieuw login nodig | Voor dispatch afhandelen; geheimen niet loggen | Eén gebundelde tokenverversing, geen loginlus; geen replay van mogelijk aangeboden boeking |
| Afwijzingsantwoord | Alleen rejected bij sluitend bewijs geen boeking | Niet elke 4xx/500/proxyfout als bewijs interpreteren; providercontract eerst |
| GetShipments geeft geen match | Zoekbereik/status/vertraging/limiet bekend of onbekend vermelden | Geen match is geen bewijs van niet boeken zolang lookupcontract ontbreekt |
| Adres/pakket verandert na boeking | Oude labels bewaren, niet meer actueel aanbieden | Geen UpdateShipment-adreswijziging/automatisch annuleren; afgesproken correctieproces |
| CRM-back-up hersteld of order gekopieerd | Register behouden; kopie krijgt geen actuele boeking/labels | Externe feiten niet terugdraaien; mismatch beoordelen vóór vervolg |
| Mail mislukt/onzeker | Bestaand mailjournal leidend, label/boeking behouden | Mailherstel apart, nooit transport opnieuw boeken |

GetShipments vereist loadDate/statussen en heeft in de gelezen schema's geen directe shipperShipmentId-filter. TrackAndTrace noemt die identifier alleen voor handler HPD; dat is geen algemeen PACKS-herstelpad. Tijdelijk lokaal zoeken in resultaten kan hoogstens helpen na bevestiging van volledigheid/vertraging, nooit automatisch een blokkade opheffen. Geen annuleerroute afleiden uit UpdateShipment-statussen.

## Servergrenzen en eigenaars voor batch 2

| Onderdeel | Ontwerpverantwoordelijkheid |
|---|---|
| `shared/` | Pure pakket-/veldeenheden-/basis-/resultaatregels, geen fetch/geheimen/DOM; bestaande supplier-fulfilment-regels hergebruiken |
| `admin/orders/` | Bestaande featurefactory uitbreiden met gecontroleerd formulier/status/labelherstel, live context en invoerbehoud |
| `cloudflare/` | Eigen PACKS-handler/client/register op bestaande auth, encrypted integration-store en CAS; credentials/tokens uitsluitend server |
| Routering | Zowel cloudroute als lokale route expliciet aansluiten, vóór bestaande documentfallback; onbekende route niet laten boeken |
| State/files | Alleen optionele begrensde gevalideerde projectiemetadata en echte originele labelbestanden; bestaande transacties/back-ups behouden |
| Bestaande document-/mailcode | Pakbonreferentie en bijlage-/ontvanger-/basisbewaking blijven eigenaar; geen tweede generator of SMTP-client |
| `admin/style.css` | Alleen noodzakelijke gedeelde presentatie; geen nieuwe losse CRM-CSS |

Voorgestelde acties onderscheiden: config/status lezen, lokale preview, boeken, labelherstel en reconciliatie. Alleen een expliciete POST-boekactie kan BookShipment doen. Server valideert login, bedrijf Maat, Origin/contenttype/bodylimiet, request-ID, config-/order-/basisversie en actuele geschiktheid. Preview/offline/Spatlappen weigeren uitvoeren, ook via rechtstreeks endpoint. Geen clientkeuze van provider-URL, credentialheaders of willekeurige netwerkhost.

Test/live hebben afzonderlijke allowlisted hosts, secrets, tokens en registers. Geen automatische fallback naar live. Redirects bij credential-/boekverzoeken niet volgen, BookShipment niet automatisch retriën. Access-tokenverversing bundelen; werkelijke expires_in gebruiken. Config lezen toont alleen beschikbaarheid/versie, geen wachtwoord/token. Accountkeuze mag een onzeker register niet wissen.

Lokale eerste bouw is **offline voorstel zonder provideruitvoering**. De huidige lokale mailadapter heeft slechts een in-process Promise-lock: dat is geen voldoende cross-process boekingsgarantie. Lokale operationele PACKS-uitvoering vereist later dezelfde duurzame autoritatieve registratie via server of een expliciet ontworpen cross-process opslag/lock. Nooit terugvallen op browserfetch/IndexedDB of vluchtig geheugen voor boekingsbewijs.

Voor labels: bekende zending-/item-/barcoderelaties, verwacht aantal colli, PDF-inhoud/type en begrensde grootte controleren. Bestaande handmatige uploadgrens is4MB. Een samengevoegd providerbestand boven die grens vraagt een expliciet opslag-/downloadbesluit; geen stil afkappen, geen eerste-pakketfallback, geen nieuwe boeking. Geen willekeurige provider-URL's downloaden of eigen barcode/PDF namaken. Ruwe labels horen niet in het register of status-JSON.

## Klaarcriteria en resterend werk

Voor batch 1 zijn lokaal beschreven: bronnen/bewijskracht, elf vaste open contracttags, veldmapping met eenheden/limieten, pakketvoorstelregels, duurzame pogingregistratie, overgangs-/foutmatrix, server-/bedrijfsscheiding en eigenaren voor batch 2. Vragen aan PACKS staan als privéconcept klaar; niet verstuurd. Dit is documentwerk, geen functionele implementatie of controlebewijs.

Batch 1 blijft **gedeeltelijk** totdat PACKS/leverancier de relevante contractpunten bevestigen en Philippe de werkwijze beoordeelt. Batch 2 kan lokaal beginnen met pure regels/formulier/offline adapter; onbekende operationele contractwaarden blijven blokkerend en worden niet ingevuld met voorbeelden.

Voor een latere batch 3 afzonderlijk toestemming vragen voor daadwerkelijk uit te voeren verificatie. Het plan bevat: dubbele gelijktijdige actie, ander request-ID, timeout met later succes, procescrash vóór/na dispatch, kapotte200respons, gedeeltelijke colli, verlopen lease, tokenwissel, savefout, gewijzigde order/config, herstel van oudere CRM-back-up, Spat-/omgevingafscherming en labelherstel zonder BookShipment. Deze scenario's zijn **niet uitgevoerd** en geen nu toegevoegde automatische tests. Daarna pas aantoonbaar kostenvrije providerverificatie. Geen betrouwbaarheids- of liveclaim op grond van dit ontwerp.
