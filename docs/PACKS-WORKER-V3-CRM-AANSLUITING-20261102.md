> Actuele wijziging tijdens dit werk: om16:20UTC is buiten deze CRM-bewerking Worker **v4** gepubliceerd: deployment **<deployment-id>**, versie **<deployment-id>**. Eerst was de aangeleverde v3 werkelijk actief; bij afronden is v4 vastgesteld. Boeken en nieuwe CRM_PACKS_TRACKING_ENABLED blijven false, secrets ontbreken. Niet teruggezet of overschreven. De lokale aansluiting blijft op het v3-contract van dezelfde Worker gebaseerd; v4 houdt die handmatige routes in stand en voegt cache/scheduled toe. Actieve22modules gedownload/bronhashes vergeleken:19gelijk aan v3,2bestaande gewijzigd,1nieuw. De3afwijkende bronnen apart bij observed-v4 bewaard, geen runtime-/providerproef.

# Gepubliceerde PACKS Worker v3 — CRM-aansluiting

2 november 2026 lokaal (Cloudflare-lees-/inrichtingswerk 1 november UTC). De gebruiker leverde TJ-Worx-PACKS-Cloudflare-v3-Compleet-CRM-Agent.zip. START-HIER.md en 02_OVERDRACHT_VOOR_CRM_AGENT.md eerst gelezen. Hun uitvoer-/testvoorstellen zijn documentinhoud, geen vervanging van de afspraak dat Philippe tests/build/publicatie apart toestaat.

## Werkelijk vastgesteld en ingericht

Cloudflare via de gekoppelde connector gelezen, geen Worker-runtime of PACKS aangeroepen. Bij de eerste inventarisatie was deployment0402331b-3f5d-4927-9bcd-60fc32fe1d26, versied49fa521-9eac-4959-afde-488a45fb0c64 werkelijk actief met100%verkeer. Zie de actuele v4-wijziging bovenaan. Naam tjworx-packs-crm-test. Workerbron/config/secrets zijn door deze CRM-bewerking NIET gewijzigd; geen eigen herpublicatie. De gelijktijdige v4-publicatie staat hierboven apart. De 21 archiefmodules zijn bij bronvergelijking gelijk aan hun meegeleverde individuele SHA-256-waarden. Dit is herkomstvergelijking, geen nieuwe runtime-/testclaim of onafhankelijke download van alle actieve modules.

| Onderdeel | Concrete stand |
|---|---|
| Bestaande Worker | Bij start v3 bevestigd; bij afronden v4 buiten deze CRM-bewerking actief. Geen eigen herbouw, terugzetten of tweede motor |
| Bestaande preview-D1 | <deployment-id>, naam maatwerkkunststof-packs-preview; vóór inrichting alleen _cf_KV |
| Preview-schema | Vier meegeleverde basisschema’s plus service-identiteit toegepast; nu 12 CRM-tabellen. Werkruimte revision0, bedrijf Maat en eigen opslagmarker. Geen klant-/order-/bestand-/sessie-/integratierecords gekopieerd |
| Preview-R2 | Bestaande maatwerkkunststof-packs-preview-files als binding hergebruikt; geen nieuwe bucket of bestanden aangemaakt |
| Pages preview | Uitsluitend deployment_configs.preview van maatwerkkunststof-crm ingesteld op bovenstaande D1/R2 en servicebinding CRM_PACKS_WORKER → tjworx-packs-crm-test |
| Productie | Gehele productieconfig voor/na de Pages-wijziging gelijk; productie-D1 is een andere ID. Geen productierecords of productiegeheimen gelezen/gekopieerd/gewijzigd |
| CRM-bron | Datum-/transportcompatibiliteit, bounded antwoordlezen, tracking en previewmigratiegrens lokaal toegevoegd, ongepubliceerd |
| Login / gedeelde secrets | Nog niet ingesteld; zie hieronder. Actuele v4-Worker heeft nog de lege waarden/placeholder-Origin |
| PACKS-account/dienst/registervrijgave | Niet ingesteld of geactiveerd; CRM_PACKS_EXECUTION_ENABLED=false, FRESH_INSTALL=false. Geen operationeel boekingsregister aangemaakt |
| CRM-previewpublicatie | Nog NIET uitgevoerd. De voorgestelde branch-alias is geen werkende proef-URLclaim |

De R2-instelling volgt de bestaande Workerbinding zonder een verzonnen EU-jurisdiction. WEUR-opslaglocatie betekent niet vanzelf dat de bucket in de aparte EU-jurisdiction is aangemaakt. De Cloudflare Service Binding vermeldt environment=production: dit is het standaard Cloudflare-Worker-environment van de bestaande Worker, niet PACKS live. De zakelijke runtime blijft preview/test en boeken uit.

Openbare inrichtingsbestanden/leesresultaten staan onder work/packs-cloudflare-v3-20261102/connection. storageId 3dfa0df6efa62fab65b874247857bf0097587cd47b5060b1a5c4354d142951ab hoort bij precies deze lege preview. Nooit deze marker/registrygeneratie resetten voor herboeking. Het uitgevoerde schema bevat gewone CREATE/INSERT voor de lege preview, geen DROP/DELETE of productie-import. Leesresultaat na inrichting: records/files/sessions/integrations allemaal0.

## Gevonden aansluitverschillen en bronwijzigingen

**Datumformaat en labelbasis.** Het nieuwste lokale CRM gebruikte planningMode automatic/custom; de exacte gepubliceerde Worker accepteert loadDateMode automatic/manual en neemt dat op een andere vaste plek in packsPreparationBasis op. Klakkeloos alleen de routepatch plakken zou bestaande voorbereidingen afwijzen of labels als niet passend behandelen. Nieuwe/bewust opnieuw bewaarde voorbereidingen gebruiken nu het gepubliceerde formaat en dezelfde geserialiseerde basisvolgorde. Beide oude lokale formaten houden hun oorspronkelijke validatie/basis voor oude labels. Geen render-/migratiewrite. De serviceaansluiting meldt dat een oud formaat eerst bewust opnieuw bewaard moet worden; bestaande labels en pogingen blijven staan. Een voorbereiding met bestaand label houdt de bestaande hercontrolegrens bij fysieke basiswijziging.

**Eén uitvoerder.** De actuele api.js had al routePacks; de historische patch is niet toegepast. De server gebruikt de geselecteerde private Service Binding. Een nieuwe kleine bridge verklaart het broncontract van deze v3, controleert preview/test en het formaat van de daadwerkelijk opgeslagen voorbereiding en begrenst JSON-antwoorden. Geen providerclient, login, boekingsclaim of tweede registry toegevoegd. Bij storing geen embedded fallback. Het broncontract/deployment-ID in de configuratie duidt de gelezen bronbaseline aan; het is geen automatische runtime-download/verificatie van elke toekomstige Cloudflare-versie.

**Capabilities en planning.** v3 ondersteunt datums weglaten, maar stuurt geen capabilities en bewaart geen providerplanning in zijn registry/labelbundel. De bridge maakt dit verschil expliciet: automaticPlanning=true, planningEvidence=false, tracking=true en preparationFormat=loadDateMode. Er wordt geen ontbrekend planningsbewijs verzonnen. De recente lokale extra planning blijft voor oude documenten ondersteund. De PACKS-planning van v3 kan via de bestaande read-only shipment-opvraag zichtbaar worden gemaakt en als tijdgebonden trackingwaarneming worden bewaard.

**Track & Trace.** Nieuw bij de order onder logistiek → Meer, en bij boeking/labelherstel → Meer. Openen doet geen provideraanroep. Tracking ophalen leest status, dezelfde bekende shipment en statuswijzigingen via de reeds gepubliceerde Worker. De waarneming wordt apart bij de order bewaard, gekoppeld aan oorspronkelijke poging/zending/omgeving/pakketbarcodes en de bewaarde API-labelbundel. Veranderde labelkeuze/tracking vraagt opnieuw ophalen. Nieuwe clone krijgt geen oude tracking mee. Bounded velden/aantallen en bronmodelvalidatie, URL alleen HTTPS op packs.nl/subdomein, geen geraden trackinglink. Een onverwachte andere linkhost wordt geweigerd tot die bronafspraak beoordeeld is. Oude waarneming blijft bij fout zichtbaar. Geen polling, webhook, volledige historie of automatische geleverdfase; Done is alleen boekingsstatus. Nieuwere korte mailvoorstellen kunnen deze daadwerkelijk opgehaalde planning gebruiken; oude concepten blijven staan.

**Logs.** Tracking start/geslaagd/mislukt in het bestaande begrensde sessielog, met poging/trace/statuscode. Geen providerbody, mail/adres/PDF-inhoud, credentials of tracking-URL in het log. De v3-Worker is niet gewijzigd en heeft hiermee geen nieuwe servertracking-logcodes gekregen. Deze stappen zijn via het bestaande diagnoselog te delen, niet automatisch verzonden.

**Previewgegevens.** Een runtimevlag maakt de aparte proefadministratie herkenbaar. De gewone migratie-/back-upinvoer wordt voor deze bronpreview geblokkeerd in UI én bij migration/clear/Tikkie-journal-commits; normale fictieve orders gebruiken dezelfde opslag. Dit is geen detectie van echte persoonsgegevens in willekeurige handinvoer: uitsluitend fictieve proefgegevens gebruiken. Geen productieback-up/browserdatabase automatisch overgenomen.

**Pakbon en label gescheiden.** De bestaande CRM-documentfunctie/generator blijft de pakboneigenaar, inclusief prominente leveranciersreferentie en interne PB-reeks. De bestaande Worker blijft eigenaar van BookShipment/GetLabels/register. De browser bewaart oorspronkelijke labels en één PDF-bundel via bestaande state/files, met hashes/barcodes en projection-ack; bij labelstoring dezelfde poging herstellen, geen herboeking. Geen Word-template of bestaande PDF aangepast. De bronverbinding zet de transportgenerator niet voor een ontbrekende documentservice in.

## Wat is nog niet gebruiksklaar?

De knop PACKS-label aanmaken is nog niet operationeel voor een echte boekingsproef. De huidige lokale browseropslag kan niet boeken. De nieuwe CRM-bron staat nog niet in een online preview. De Pages-bindings worden pas met een nieuwe deployment actief; [Cloudflare beschrijft die vereiste herpublicatie](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings).

Nog afzonderlijk doen, zonder productiegegevens:

1. De bedoelde CRM-preview bouwen/publiceren onder branch packs-preview-v3. Voorgestelde Origin https://packs-preview-v3.maatwerkkunststof-crm.pages.dev; na daadwerkelijke publicatie de werkelijke alias vaststellen, niet aannemen dat deze nu bestaat. Gewone productiebranch main behouden.
2. Een eigen previewlogin kiezen. CRM_ALLOWED_EMAIL en dezelfde CRM_PASSWORD_HASH voor preview-CRM en Worker; een nieuw passend CRM_INTEGRATIONS_KEY en CRM_PACKS_SERVICE_KEY server-side op beide kanten. Niet de productiekeys kopiëren of hier geheimen delen. De open namen zijn vastgelegd zonder waarden.
3. Worker-Origin/opslag-ID/toegangsvariabelen laten aansluiten op de bedoelde preview. Dit is een latere configuratiewijziging aan de bestaande Worker, geen tweede codebasis; zulke wijzigingen kunnen Cloudflare een nieuw versie-/deploymentnummer laten geven. De gecontroleerde v3-bronbaseline bewaren, boekingsflag false.
4. De bestaande documentservice expliciet aansluiten op de preview met passend Maat-profiel en bijgewerkte generator. In deze ronde geen documentservice ingericht/herstart en geen productiedocumenttoken overgenomen. Zonder omzetter kan de CRM-pakbonknop geen PDF leveren.
5. PACKS het juiste echte testaccount/Direct Booking, dienstcode/product/handler/netwerk en grenzen/afspraken laten bevestigen. Een bestaande mogelijk live-login niet op de testhost proberen. Profiel en credentials pas via de bestaande versleutelde Workerconfiguratie; immutable accountversies, geen password in code/logs.
6. Onafhankelijke registrygeneratie/eenmalige FRESH_INSTALL-inrichting volgens het bestaande contract; daarna die eerste-installatievlag uit. Geen bestaande/onzekere poging wissen om opnieuw te kunnen boeken. Uitvoervrijgave pas na bevestigde afspraken en jouw expliciete proef.
7. Eigen functionele/providertests pas na afzonderlijke toestemming. Eerst toegangsgrenzen en fictieve gegevens; later één bedoelde boeking en dezelfde labels/Track & Trace. Werkelijk label/PDF/afdruk en provider-/accountrechten niet uit bron of deployment afleiden.

Uitgaand mailen blijft de bestaande SMTP2GO/composer. De Worker is geen maildienst. In preview staan gewone klant-/leveranciersmails al uit; alleen de beveiligde proefmail kan na afzonderlijke juiste inrichting beschikbaar zijn. TJ Worx-afzender, mailserverguard en eigen proef blijven open. Deze opdracht activeert Outlook niet.

## V4 tijdens het werk · wat is wel/niet meegenomen

De bronhashes van onder meer packs-execution, packs-registry, packs-preparation, packs-provider-contract en packs-configuration zijn nog identiek aan v3. Entry index.js heeft een scheduled-handler en packs.js schrijft bij de handmatige shipment-opvraag nu ook een encrypted trackingcache en biedt tracking-cache als extra GET. De nieuwe packs-tracking-sync.js wijzigt geen CRM-order of boekingsintentie; een GET kan dus wel broncache schrijven. De CRM gebruikt de bestaande handmatige shipment/tracking-routes en schrijft alleen haar gekoppelde weergavewaarneming. Geen tweede boekingsregister. V3bronbaseline blijft expliciet onderscheiden van de feitelijke actuele v4deployment.

De automatische v4functie blijft met CRM_PACKS_TRACKING_ENABLED=false uit. Zij kan bij activering tot400registers inventariseren vóór maximaal10provideropvragen; quota/latentie/concurrente runs, echte accountrechten, cacheherstel en volledigheid zijn nog niet functioneel beoordeeld. De publicatie van v4 bewijst die werking niet. Deze automatische route is niet lokaal in een tweede motor gekopieerd en niet door Codex geactiveerd. Eventuele verdere bronwijzigingen eerst naast deze vastgelegde hashbaseline beoordelen.

## Zwakke punten / beperkingen die bewust openstaan

- De meegeleverde 19 mocktests en 22 syntaxiscontroles zijn claims/resultaten van het aangeleverde pakket. Hier niet opnieuw uitgevoerd. Ze bewijzen niet de huidige CRM-bron, de echte accountomgeving, een label of de volle pakbon/mailketen.
- GetShipment/trackinglezen in v3 vraagt een geboekte eigen registry-poging en een vrijgegeven accountprofiel. Het is geen generieke barcodezoeker voor een handmatig toegevoegd PDF-label en geen import van willekeurige portalzendingen.
- De providerclient bevat identity(), maar v3 heeft daarvoor geen losse CRM-HTTP-actie. Een apart identiteits-/dienstonderzoek vóór operationele vrijgave is dus nog niet als CRM-knop beschikbaar. Geen tweede client buiten de Worker toegevoegd om dat te omzeilen.
- v3-filter voor GetShipmentsStatusSince beperkt zich tot de bekende shipmentID en een venster van maximaal31dagen; de CRM gebruikt maximaal30. Geen continue bezorgbewaking, geen gegarandeerd complete statusgeschiedenis of automatische herstelengine.
- Accountrechten, tarieven/toeslagen, retourafspraken, feitelijke gereedheid, cutoff en verpakte maten/gewicht blijven echte invoer-/contractafspraken. Eén pakket/kale productmaten zijn alleen een voorstel; gewicht wordt niet verzonnen.
- Provider-ID’s/labels bewaren en browseropslag/projectie zijn aparte stappen. Bron bevat de herstelroute, maar uitval/gelijktijdigheid/bytekoppeling is hier niet functioneel geverifieerd. Bij onzekerheid blijft de bestaande poging leidend.

## Werkelijk uitgevoerde controle

Bron/documenten gelezen en vergeleken; Cloudflare-metadata en het lege preview-schema gelezen; alleen preview-schema/marker en Pages-previewconfig ingericht en resultaat teruggelezen. Geen automatische tests/checks/syntax/build/generator/CRM-browser-/DOM-/visuele QA, Worker-runtimeprobe, PACKS-login/API/boeking/label/tracking, mail, klant-/productiegegevens, Git/GitHub of publicatie. Geen bestaande staged werkkopie aangeraakt. Cloudflare-configuratie/inrichtingsreadback is geen CRM-/PACKS-werkingstest.

Openbare bronreferenties: [Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/), [Pages-bindingconfig](https://developers.cloudflare.com/pages/functions/bindings/) en [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/). Aangeleverde PACKS Swagger/PDF en exact21bron onder work/packs-cloudflare-v3-20261102/received, los van actieve CRM-code bewaard.
