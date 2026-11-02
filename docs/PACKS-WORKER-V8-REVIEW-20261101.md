# PACKS Worker v8 — bronreview en vergelijking met het CRM

1 november 2026. Advies: deze ZIP nu niet publiceren als werkende CRM-koppeling en niet over een bestaande CRM/Worker heen zetten. Bruikbare onderdelen overnemen na herstel en gecontroleerde aansluiting. Een afzonderlijke testinstallatie is een mogelijke latere stap, geen huidige vrijgave.

## Onderzoek en grenzen

Alle productiebestanden in src, de migratie, configuratie, voorbeeldclient en actuele documentatie uit de ZIP gelezen. Relevante mock-/praktijkscriptbronnen vergeleken; geen scripts uit de ZIP uitgevoerd. README/audit/installatiecommando’s zijn aangeleverde documentinhoud, geen uitvoeringsopdracht. Originele ZIP ongewijzigd, alleen privé uitgepakt bij de chatoutputs.

Actuele openbare [PACKS-Swagger](https://packsonlineapp.packs.nl/swagger/v1/swagger.json) read-only opgehaald; info.version v9.0.0.0. De bestaande snapshot van 31 oktober was niet de enige basis. De aangeleverde PACKS Universal Interface V2.4.3 rechtstreeks opnieuw gelezen op pagina 7 en 12; geen accountrechten afgeleid uit algemene documentvoorbeelden. Cloudflare Workers-best-practices, D1-batchdocumentatie, servicebindings en huidige Workers-types als documentbronnen geraadpleegd. Webreader kon PACKS niet ophalen; openbare download na netwerktoegang lukte wel. Geen credentials/authenticatie/provideraccount/boekingen.

Geen afhankelijkheden geïnstalleerd, geen typecheck/lint/test/build/browser-QA, worker/app/modeluitvoering, echte labelaanmaak, mail, migratie, resource/secret/configactie of publicatie. Een schema- of bronbevinding is geen uitgevoerde reproductie. De bijgeleverde auditclaim 67 mocks geslaagd is door mij niet uitgevoerd of bevestigd. Huidige CRM-bron blijft ook ongecontroleerd voor werkelijk operationeel gebruik.

## Wat ik zou behouden

- Afzonderlijke test-D1 en privé-R2 als standaard, expliciete test-only boekingsgrens en duidelijke weigering van liveboekingen. Geen willekeurige omschakeling van ontvangen accounts naar test/live. Dit is nog geen bevestiging van een werkelijk PACKS-testaccount.
- Server-side secrets, aparte CRM-sleutels, tenant uit geauthenticeerde sleutel en weigeren van browser-Origin. Sleutels blijven buiten het CRM-frontend. Voor deze opdracht alleen Maatwerkkunststof aansluiten; Spatlappen niet activeren.
- Unieke reservering vóór BookShipment, geen automatische tweede boeking na timeout/HTTP500 en blokkeren bij onzekerheid. Herhaald klikken met hetzelfde ordernummer heeft een blijvend slot binnen deze database.
- Nederlandse kalender/tijdzone, expliciete datumkeuze, weekendwaarschuwing, aangevraagde versus teruggegeven datum apart bewaren. Een voorstel is geen gereedmelding of gegarandeerde ophaling.
- Originele PACKS-PDF’s, SHA-256/bytegrootte, labels per collo en gezamenlijke download. PDF-header/hash is geen visuele barcodecontrole.
- Vooraf product-/land-/gewicht-/buitenmaatregels gebruiken en onduidelijke meercollokoppeling blokkeren. Hieronder staan nog gaten in die controles.

## Eerst herstellen

### R1 — P1: verplicht PDF-formaat ontbreekt in de boeking

Bron: [src/packs-client.ts:61](<lokale-projectmap> bookPayload zet printLabel=true op zendingsniveau, maar ieder shipmentItems-item bevat alleen product, maten, gewicht en eventuele toeslagen. Het actuele schema vereist per item fileType én product; fileType ondersteunt Pdf/Zpl. Een top-level printLabel is geen vervanging. Dit is een concrete schema-afwijking: mogelijke afwijzing of geen bruikbaar PDF-label. De mock voor BookShipment controleert dit veld niet, dus die simuleert dit niet betrouwbaar.

Voorstel: expliciet fileType:'Pdf' per collo en de vaste gewenste labelopties. labelText ontbreekt ook: het leveranciersnummer staat nu alleen in adresreferenties; daarmee is niet expliciet dezelfde vrije labeltekst aangevraagd die onze CRM-route gebruikt. Voeg hun volledige nummer als zichtbare labelText toe (maximaal 50 tekens), met aparte unieke technische poging-ID. shipmentType/status niet ongemerkt aan accountdefaults overlaten; deze velden zijn niet allemaal schema-verplicht, maar expliciete vastlegging past bij de bestaande CRM-werkwijze.

### R2 — P1: Done wordt ten onrechte afgeleverd

Bron: [src/tracking.ts:11](<lokale-projectmap> statusOf retourneert Delivered zodra r.status==='Done', ook als logisticsStatus bijvoorbeeld een nog niet afgeleverde situatie beschrijft. active in db.ts stopt daarna met periodiek bijwerken. Dat kan een onjuiste aflevermelding/webhook geven én verdere tracking beëindigen.

PACKS-handleiding pagina 12 definieert Done als geboekt in het systeem van de handler. Manifest is geboekt in Universal Interface. Beide zijn boekings-/verwerkingsstatussen, geen bewijs van fysieke aflevering.

Voorstel: verwerkingsstatus apart van fysieke vervoersstatus bewaren; Delivered alleen uit expliciet bevestigde afleverinformatie van het juiste endpoint. Onbekend blijft onbekend, foutieve tekst nooit naar Delivered forceren. Dit betreft de aangeleverde worker; onze bestaande boekingsantwoordherkenning gebruikt Done alleen als boekingsstatus, niet als afleverfeit.

### R3 — P1: labelherstel leest verkeerde antwoordstructuur

Bron: [src/index.ts:66](<lokale-projectmap> [src/packs-client.ts:69](<lokale-projectmap> en tests/mock.mjs. labelFor zoekt raw.shipmentItems. Het actuele GetLabelsOutputModel bevat labels. Daardoor wordt een geldig werkelijk labelantwoord niet gevonden. De eigen mock retourneert juist shipmentItems en maskeert de afwijking.

Voorstel: labels lezen; shipmentId, shipmentItemId, barcode en PDF-formaat exact aan de bekende boeking koppelen; mergeLabels expliciet kiezen. De huidige bron controleert bij fallback alleen item-ID. Herstel is standaard uitgeschakeld, dus dit is een latente fout bij activering, geen reeds uitgevoerde mislukte download. Onze bestaande shared/packs-provider-contract leest wel labels en controleert de bekende identiteiten; behoud dat contract.

### R4 — P1: volledige order-/antwoordbinding ontbreekt

Bron: [src/mapping.ts:10](<lokale-projectmap> [src/index.ts:126](<lokale-projectmap> [migrations/0001_create.sql:5](<lokale-projectmap> Bij één collo wordt de eerste responsregel vrijwel direct gebruikt: product mag zelfs ontbreken en maten/gewicht worden niet vergeleken. De volledige bookrespons wordt niet getoetst op werkelijk afleveradres, eigen poging-ID, handler/network en geslaagde verwerkingsstatus. Een HTTP200-object met IDs is dus niet voldoende bewijs voor de getoonde bookedsituatie.

Bij handmatig herstel worden alleen de door beheerder ingevulde PACKS-ID, postcode, handler en network vergeleken. De aangevraagde volledige ontvanger is niet duurzaam opgeslagen, alleen de postcode; er is geen eigen meegestuurde shipperShipmentId om een verloren antwoord exact terug te binden. Twee zendingen op dezelfde postcode kunnen niet hierdoor worden onderscheiden. Herstel laat labels gelukkig geblokkeerd, maar het resultaat verified_existing_booking is sterker dan dit bewijs rechtvaardigt.

Voorstel: onze stabiele interne order-ID + onveranderlijke gecontroleerde momentopname + poging-ID/vingerafdruk behouden. Hun zichtbare bestelnummer afzonderlijk bewaren. Volledig antwoord en later herstel tegen die bron controleren, ook bij één pakket. shipperShipmentId is bij Direct Booking niet verplicht volgens schema, maar is hier een belangrijke correlatiekeuze; het is geen bewijs dat PACKS zelf idempotentie garandeert. Met alleen een wijzigbaar orderNumber als lock kan dezelfde CRM-order onder een ander nummer alsnog nogmaals worden aangeboden. Een verse/herstelde lege D1 heeft bovendien geen onafhankelijke generatiebewaking zoals de huidige CRM-opzet.

### R5 — P1: opslagfout na boeking kan labelherstel blijvend blokkeren

Bron: [src/index.ts:111](<lokale-projectmap> [src/db.ts:18](<lokale-projectmap> Alle PDF’s gaan naar R2 vóór de shipment_items en volledige boekingsuitkomst naar D1 gaan. Mislukt de eerste of een latere R2-write, dan bewaart markIssue hoogstens de zendings-ID; de afzonderlijke pakket-ID’s en barcodes zijn nog niet duurzaam vastgelegd. De reconcile-route herstelt die pakketregels niet en blijft reconciled_review. De downloadroute meldt zonder pakketregels NO_COLLI. Een bewezen verwachte boeking kan zo alsnog geen herstelbaar label opleveren.

Voorstel: eerst de gecontroleerde provideridentiteiten en oorspronkelijke poginguitkomst duurzaam bewaren, daarna PDF’s ophalen/opslaan en die stappen idempotent vervolgen. Geen nieuwe boeking voor een ontbrekend label. Maak ook het echte beheerherstelpad af. Onze huidige executor bewaart de provideruitkomst vóór labelverwerking; die volgorde behouden. Ook daar blijft onzeker herstel operationeel te organiseren, geen waterdichtheidsclaim.

### R6 — P2: foutafhandeling mist asynchrone afwijzingen

Bron: [src/index.ts:154](<lokale-projectmap> en dezelfde constructie bij reconcile op regel 162. Binnen try staat return handleBook(...) zonder await. Een latere rejection, bijvoorbeeld van token/productinformatie/DB, bereikt daardoor niet de omliggende catch in deze fetch-handler. Dan kan de platformfout afwijken van de bedoelde veilige JSON-fout. Niet iedere fout mist opvang: er zijn ook lokale catches binnen handleBook.

Voorstel: binnen deze try return await voor de twee async handlers, vaste foutcodes/trace-ID en één duidelijke melding in het CRM. Geen ruwe providerbody of credentials terugsturen. Dit is bronanalyse, niet door uitvoeren gereproduceerd.

### R7 — P2: productlimieten en adressen nog onvolledig

Bron: [src/rules.ts:9](<lokale-projectmap> [src/index.ts:28](<lokale-projectmap> en regel 93. Buitenmaatlimieten per as/gewicht/land zijn aanwezig. De dienstgeldigheid validFrom/validUntil en productSizeMax met bevestigde betekenis worden niet getoetst. De maximale invoer accepteert buitenmaten tot 10000 terwijl het huidige PACKS-schema per dimensie maximaal 999 noemt. De initiële configuratiecheck controleert ook niet alle verplichte afhaal-/retourvelden. Contractregels kunnen een deel opvangen, maar vervangen geen complete payloadvalidatie. deliveryInstructions accepteert 250 tekens terwijl Swagger 200 aangeeft; productcode accepteert 60 versus schema 20.

Voorstel: actuele eenduidige dienst plus geldigheid, contract-/providerlimieten en eventuele samengestelde maatgrens controleren; alle verplichte adressen en veldlengtes vooraf controleren. De betekenis van productSizeMax en contract/toeslagen moet PACKS bevestigen, geen formule raden. Onze huidige profiel/mapper bevat hiervoor meer velden, maar die zijn niet automatisch juiste accountwaarden.

### R8 — P2: logs zijn onvoldoende voor jouw eerste zending

Bron: [src/index.ts:193](<lokale-projectmap> [src/db.ts:23](<lokale-projectmap> [src/tracking.ts:46](<lokale-projectmap> en wrangler.toml. Er is een audit voor issues/herstel, maar geen samenhangend trace-ID en vaste stapreeks van gebruikerscontrole naar token/product/dispatch/antwoord/label/opslag. Diverse catches slikken details; de melding Controleer logs belooft daarmee meer zicht dan deze bron zelf vastlegt. Observability is niet expliciet in dit configuratiebestand gezet; eventuele dashboardinstellingen zijn niet onderzocht.

Voorstel: aansluiten op ons bestaande begrensde staplog en sessierapport, vaste eventcodes en ja/nee-vergelijkingen. Geen tokens, passwords, hele adressen, factuurbedragen, PDF/base64 of ruwe providerrequests loggen. Foutcode en trace-ID bij iedere fout, zodat jij die veilig kunt delen. Cloudflare adviseert expliciete observability en gestructureerde logging; dit vervangt geen duurzaam boekingsregister. Zie [Workers-best-practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).

### R9 — P2: datumwaarschuwing en standaardkeuze afstemmen

Bron: [src/schedule.ts:50](<lokale-projectmap> [src/index.ts:25](<lokale-projectmap> en regels 64/124. packs_automatic laat beide datums terecht weg volgens handleiding p.7; custom vraagt een datum aan, deliveryDate blijft door PACKS bepaald. Mijn eerdere suggestie dat PACKS altijd expliciet loadDate nodig heeft was te streng: dat is momenteel een beperking van onze CRM-bron, geen algemene PACKS-eis.

De aangeleverde worker kiest echter standaard next_day; jouw nieuwste voorkeur is packs_automatic. Ontbreekt een bruikbare bevestigde laaddatum, dan bestaat wel een warning maar needsReview is false. Een frontend die alleen de boolean gebruikt kan de datumcontrole overslaan. packsDate accepteert ook een willekeurig T-vervolg; dit is nog geen strikte datumtijdvalidatie. expectedLoadDate beschermt middernacht alleen als de client het optionele veld meestuurt.

Voorstel: jouw keuze zichtbaar: PACKS plant / zelf gereeddatum kiezen. Geen gereedheid uit een standaarddatum afleiden. Ontbrekende, afwijkende of ongeldige bevestiging zichtbaar ter beoordeling; echte PACKS-datum als teruggegeven planning tonen, niet als gegarandeerde ophaling. Wijziging naar automatic vraagt aanpassing van voorbereiding/basis/register/antwoordcontrole in ons CRM, niet alleen een dropdown. Account/cutoff/kalender en gereedheid blijven relevante eigen controles.

### R10 — P2: een geslaagde SQL-batch kan ondanks mislukte guard schrijven

Bron: [src/db.ts:18](<lokale-projectmap> De pakketregels worden ingevoegd, gevolgd door een conditionele UPDATE WHERE booking_status='pending'. De controle meta.changes===1 vindt pas na await db.batch plaats. Een UPDATE met nul geraakte rijen is op zichzelf geen SQL-fout: een JavaScript-throw achteraf draait een geslaagde batch niet terug. Als een beheerherstel tegelijk de pendingrij verandert, kunnen pakketregels toch worden toegevoegd terwijl de statusovergang faalde. Het labelendpoint controleert niet opnieuw dat die gehele combinatie overeenkomt.

Voorstel: de verwachte status-/pogingversie ook in de databasewrites afdwingen zodat geen half passende bewijscombinatie commit, beheerherstel en boeking onder dezelfde exclusieve regel; daarna alleen labels uit de bewezen combinatie vrijgeven. Geen claim dat D1.batch algemeen niet atomair is: SQL-fouten laten een batch falen; een 0-row-update is juist geen SQL-fout. Zie [D1 batch](https://developers.cloudflare.com/d1/worker-api/d1-database/).

## Verschillen met onze huidige inrichting

| Onderdeel | Huidige CRM-bron | Aangeleverde worker | Voorkeur |
| --- | --- | --- | --- |
| Orderidentiteit | Interne order-ID, leveranciersnummer apart | Wijzigbaar orderNumber is sleutel | Interne identiteit behouden; hun nummer zichtbaar |
| Boeking | CRM-session, snapshot/CAS, profiel-/releasevrijgave en registergeneratie | Eigen Bearer-auth en nieuwe D1-reservering | Eén gecontroleerde uitvoeringsroute |
| Provider-/labelbewijs | Unieke poging en volledige pakket-/adres-/responsecontrole, originele labelprojectie | Losse worker-ID, beperktere mapping/herstel | Bestaande bewijsroute behouden en bovengenoemde gaten dichten |
| Labelbestanden | Huidige aggregate grens 4MB, bundel-PDF en documentmetadata | Tot 8MB per PDF, ZIP tot circa20MB, losse R2-keys | Limieten/bundel/metadata met mailroute afstemmen |
| Datums | loadDate verplicht, automatische planning niet gebouwd | Automatic/custom/morgen aanwezig | Bruikbare datumlogica overnemen, standaard jouw keuze |
| Bedrijven | PACKS uitsluitend Maatwerkkunststof | Ondersteunt beide CRM’s en beide accounts | Alleen Maat activeren |
| Mail/pakbon/financiën | Bestaande order-/document-/mailketen | Niet aangesloten | Bestaande bronnen gebruiken |

Uploaden geeft dus niet vanzelf een werkende knop, pakbon, labelbundel of mail met twee bijlagen. De request/response-contracten van /api/packs/book en onze /api/crm/packs/... komen niet overeen. Een R2-write naar dezelfde bucket registreert evenmin vanzelf een CRM-document; IDs/metadata/opslagregels verschillen.

## Mijn keuze voor de uitvoering

**Aanbevolen:** geen tweede zelfstandige boekingsmotor publiceren. Neem de goede automatic/custom-datumlogica en relevante verbeteringen over in de bestaande CRM-provideradapter; behoud één gezaghebbend register, actuele ordercontrole, bestandstoerekening en mailroute. Een aparte PACKS-testinstallatie komt alleen als bewust afgebakende volgende stap, met echt bevestigd testaccount en eigen resources. Dat is nog niet gedaan.

**Alternatief:** als een losse Worker gewenst is, maak hem tot expliciet afgebakende providerdienst achter de CRM-server met hetzelfde poging-/bewijscontract. Voor interne Worker-communicatie biedt Cloudflare [servicebindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/). Spreek precies af welke dienst exclusief mag dispatchen en welke registratie leidend is; laat niet beide uitvoeringsroutes voor dezelfde order actief. Frontend krijgt nooit de server-API-key. Dit is meer aansluit-/beheerwerk, geen simpel URL-veld.

Niet een losse nieuwe testdatabase of alleen ENABLE_LIVE_BOOKING omzetten als snelweg naar productie. Deze versie weigert live in code en de SQL legt test vast; de vlag is geen werkende livevrijgave. Nieuwe D1/KV-IDs staan bovendien nog op REPLACE; resources/secrets/accountrechten ontbreken. README noemt bij health nog versie7 terwijl de worker8 teruggeeft: kleine documentcorrectie nodig. Standaardnaam test zegt niets over daadwerkelijke PACKS-testrechten.

## Concrete open stappen

1. Bronfouten R1–R10 oplossen in één gekozen architectuur; eerste prioriteit PDF/labelcontract, statusbetekenis en bewijs/herstel.
2. Datumkeuze met jouw workflow uit KUNSTSTOFBAAS-WORKFLOW-20261101.md verbinden; leveranciersnummer leidend op label/pakbon, eigen interne order-ID onveranderd.
3. PACKS laat test/live-account, Direct Booking, diensten/limieten/toeslagen/kalender en herstel bevestigen. Eerdere algemene documentvoorbeelden zijn geen eigen accountbevestiging.
4. Concrete aparte testinrichting/release voorbereiden, zonder de bestaande CRM-database of staged werkkopie te wijzigen. Afzonderlijke publicatieopdracht blijft nodig.
5. Jij beoordeelt de echte order/pakketwaarden, originele bijlagen, teruggegeven datums en mailontvanger; geen automatische proef door mij. Eerste echte boeking en mail zijn afzonderlijke bewuste acties.

Beoordeling geleverd; de gevonden bronfouten zijn in deze ronde NIET gerepareerd en de worker is NIET geïnstalleerd of geactiveerd. De hele PACKS-hoofdtaak blijft gedeeltelijk. Bestaande gegevens, lokale wijzigingen, templates, feedbackstatus en Git-staging behouden.
