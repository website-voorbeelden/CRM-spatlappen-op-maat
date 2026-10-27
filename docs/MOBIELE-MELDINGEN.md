# Nieuw27oktober — CRM-ontvangstmelding en bezorgstatus

Een automatisch geregistreerde betaling leidde in het CRM nog niet tot een melding: snapshotrefresh had geen betaalobserver. Nu lokaal `admin/payments/notifications.js`: tijdens geopende sessie nieuwe positieve recente Tikkie-providerontvangst in bestaand klein meldingsvak, met bedrag, huidige CRM-klant/order en Bekijken. Onafhankelijk van telefoonopt-in. Bestaande betaal-ID/correctievoorouders voorkomen herhaalde ontvangst bij correctie/herstel; eigen invoer en expliciete imports stil. Initieel geladen historie wordt stil onthouden, geen inhaalnotificaties bij herladen of blijvend ongelezen meldingenregister. Een geopende/onbewaarde invoer behoudt bestaande refresh-/doorklikbescherming.

Pure `shared/payment-notifications.js` deelt server/clientbronherkenning en bestaand7dagen/+5minvenster; geen gok op omschrijving. Observer leest alleen gecommitte actuele snapshots; geen provideractie of financiële mutatie. DOMpresentatie later dan snapshotacceptatie, vóór tonen en Bekijken actuele ontvangst/order/bedrag opnieuw toetsen. Bestaande CSS/meldingsqueue per bedrijf; geen nieuwe timer, stylesheet of browserdataopslag.

Telefoon & meldingen → Status & uitleg krijgt lokaal de status van een recente betaalmelding voor precies dit aangemelde apparaat/sessie: wacht op eerste poging, retry, geaccepteerd door pushdienst, mislukt, geannuleerd, verlopen of nog niet klaargezet. Alleen laatste7dagen/sinds huidige apparaatregistratie. Geen identiteit/bedragen/endpoint/keys naar UI, geen extra push/poll. Onleesbaar blijft onbekend. Geaccepteerd bevestigt geen weergave op telefoon. Geen melding gevonden bevestigt geen oorzaak: event kan buiten venster vallen, vóór aanmelden zijn ontstaan of niet zijn aangemaakt. Andere apparaatstatus is niet zichtbaar.

De gemiste concrete telefoonmelding is niet onderzocht/opgelost verklaard: geen live betaal-/toestel-/event-/bezorgdata gelezen of pushproef gedaan. Mogelijke sessie-/opt-in-/transportoorzaak alleen met actuele status vast te stellen. Alleen bron lokaal, niets gepubliceerd/gekoppeld/geactiveerd/getest; Philippe controleert later beide bedrijven, voor- en achtergrondontvangst, handmatig stil, correctie/herstel, oude historie en echte telefoonbezorging. Brede mobile-notifications-taak blijft doing.

# Nieuw27oktober — vrijdagrapport in CRM met telefoonmelding

Philippe kiest CRM + telefoonmelding + Rapport bekijken. Nu lokaal in bron: opgeslagen vrijdageditie, aparte versleutelde outbox/capabilityregistratie en veilige exacte editie-link. Geen rapportcijfers op het vergrendelscherm. Native actieknop alleen waar ondersteund; aantikken opent dezelfde editie met gewone login in nieuw venster. App moet het nieuwe berichttype via handshake bevestigen, zodat oude workers het niet als betaling tonen. Via Telefoon & meldingen de bestaande knop Meldingen aanzetten/App bijwerken voor rapportmeldingen; geen nieuwe permissionprompt bij alleen status lezen. Rapportplanning wordt apart bewust bewaard; geen e-mail.

Betaalpush blijft uitsluitend nieuwe Tikkie-providerontvangsten, zelf bedragen invoeren blijft stil. Bedrijfs-/sessie-/wachtwoord-/sleutel-/apparaatversieguards gemeenschappelijk in push-devices.js. Rapportpush heeft eigen event/24uurretry/TTL/checkpoint, geen betalingstabellen of businessstate. Geen SQLmigratie/keyrotatie/extra Worker nodig. Zie [Vrijdagrapporten](VRIJDAGRAPPORTEN.md). Alleen lokale bron, niets actief ingesteld/verstuurd of gepubliceerd, geen tests/browsercontrole. Telefoonappupdate en eigen controle beide bedrijven blijven open.

# Correctie 27 oktober 2026 — zelf invoeren geeft geen telefoonpush

Philippe krijgt ook push wanneer hij zelf een betaling registreert en wil dat niet. Lokaal aangepast voor beide bedrijven: cloudflare/notifications.js laat alleen providerontvangsten toe met source tikkie én een niet-lege tikkie:externalId, zoals de bestaande gedeelde Tikkie-import opslaat. Zelf een bedrag invoeren, ook een handmatig ingevoerde Tikkie-omschrijving, levert geen push. De knop Tikkie controleren haalt wel echte providerontvangsten op en blijft voor nieuwe ontvangsten meldingsgerechtigd, net als achtergrondpolling.

Dezelfde regel geldt bij het aanmaken van het event en vóór iedere nieuwe bezorgpoging. Oude nog wachtende handmatige events worden bij behandeling alleen voor die pending bezorging cancelled; events/geziene IDs blijven als historie, betalingen en orderdata blijven onaangetast. Geen SQLmigratie, wachtrijopschoonactie, configuratie-/opt-inwijziging of extra providerverzoek. Bestaande baseline/recentheids-/bedrijfs-/sessie-/dedup-/leasegrenzen blijven. Een al eerder aan de pushdienst aangeboden melding is niet terug te roepen.

Dit is uitsluitend lokale bron. Bestaande server/kwartierpolling is eerder online geactiveerd, maar deze correctie is nog niet gepubliceerd. Geen tests, checks, builds, browsercontrole of echte push-/providerproef uitgevoerd. Philippe controleert later zelf handmatige registratie zonder push, nieuwe Tikkieontvangst met push en pending/retry voor beide bedrijven. Bredere meldingsoorten en gebruikerscontrole blijven open. Oudere passages hieronder over meldingen bij handmatig invoeren zijn vervangen.

> Nieuwste correctie24oktober: Philippe vraagt minder achtergrondwerk vanwege Cloudflarekosten. Interval naar15minuten voor beide CRM’s; actuele uitvoerstatus bovenaan OVERDRACHT.md. Oude vijfminutenpassages beschrijven de vorige stand. Bron shared/notification-schedule.js, uitleg docs/CLOUDFLARE-KOSTEN.md.

> Actueel24oktober: automatische Tikkiecontrole voor beide online CRM’s aangezet en gepubliceerd als crm-tikkie-polling-20261024. Vereiste productiesecretnamen/bedrijfsbindingen/tabelnamen vooraf bevestigd, geen sleutelwaarden gelezen. Nog geen fysieke ontvangst-/pushcontrole; geen tests of handmatige providerproef. Zie nieuwste OVERDRACHT.md. Oudere uit/preparatiepassages zijn historische momentopnamen.

> Vervolg24oktober op verzoek automatische betaalcontrole: vijfminutenpolling in plaats van uurpauze na ronde; zie AUTOMATISCHE-TIKKIECONTROLE.md en actuele uitvoerstatus bovenaan OVERDRACHT.md. De oudere uitspraak dat polling bewust uit blijft betreft de vorige release. Geen algemene bankkoppeling.

> Actueel24oktober: beide CRM’s gepubliceerd als crm-analytics-notifications-20261024; servermeldingen actief na expliciete toestemming. Automatische betaalprovidercontrole uit. Toestelopt-in en fysieke gebruikerscontrole nog nodig. Geen functionele tests uitgevoerd. Zie bovenaan OVERDRACHT.md; oudere lokaal/geen-activeringpassages zijn historische momentopnamen.

## Vervolg 24 oktober 2026

Actuele bronwijzigingen en grenzen: docs/VERVOLGWERK-2026-10-24.md (vanaf projectroot). Nieuwste publicatiestatus staat bovenaan OVERDRACHT.md. Oudere uitspraken over alleen lokaal/ontbrekende customdomeinen zijn hieronder historische momentopnamen. Geen functionele tests door Codex uitgevoerd; Philippe controleert zelf.

# Mobiele webapp en betalingsmeldingen

23 oktober 2026. Lokale bronimplementatie voor beide bedrijven. **Niet online geactiveerd, niet gepubliceerd en niet functioneel getest.** Philippe test zelf; geen tests, syntaxchecks, builds, browser-QA, echte provideracties of database-migraties uitgevoerd. Er zijn geen sleutels gegenereerd of bestaande configuraties geopend.

## Door gebruiker opgegeven doelen — 23 oktober 2026

- Spatlappen: https://crm.spatlappenopmaat.nl/admin/#dashboard
- Maatwerkkunststof: https://crm.maatwerkkunststof.nl/admin/#dashboard
- Telefoon: iPhone.

Dit is de ontvangen gebruikersinformatie, geen externe controle of activering. Deze gegevens niet opnieuw opvragen. Bijbehorende cloudbindings, sleutels/configuratie, release en toestemming op de telefoon blijven afzonderlijk nodig. Er zijn geen accounts/toegangen of providerinstellingen gewijzigd.

## Bediening na online activering

Instellingen → Telefoon & meldingen (`#settings/mobile`). Installatieuitleg, serverstatus, expliciete toestemming en aan/uit per apparaat. Geen toestemming bij het laden van de pagina. De knop vraagt toestemming binnen de directe klik. Status laat zien of de serverinrichting ontbreekt; een browserabonnement alleen is geen bevestigde serverkoppeling. Na een verlopen login opnieuw aanmelden voor meldingen.

De manifestbuild levert bedrijfsnaam/kleuren en192/512-PNGs, met het felgroene vierkant voor Maatwerkkunststof. Op iPhone/iPad iOS16.4+ eerst via Safari delen naar beginscherm en het icoon openen; daarna toestemming. Android gebruikt de beschikbare installatieknop of browsermenu. Geen App Store-app of afzonderlijke codeversie. Zie [WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) en [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). Lokale ontwikkelserver krijgt het manifest na een bewuste herstart; push is in lokale/offline/previewmodus uit.

Melding: **Betaling geregistreerd**, met algemene tekst zonder naam, bedrag, e-mail of financiële details. Tik opent het gekoppelde ordertabblad Betalingen in een nieuwe app/browserwindow, zodat bestaande onopgeslagen invoer niet wordt vervangen. Normale CRM-login blijft vereist. Geen automatische factuur, mail, productie- of Gmail-labelactie. Handmatig geregistreerde ontvangst krijgt `registeredAt`; dit is het registratiemoment, niet een verzonnen bankontvangstdatum.

## Serverroute en bewuste grenzen

- Nieuwe additive migratie `0005_notifications.sql`: apparaten, event/outbox, bezorgpogingen, geziene betalings-IDs en taakstatus. Geen oude CRM-records/bestanden vervangen. Geziene IDs blijven als deduphistorie; events en bezorgpogingen na7dagen opgeruimd, verlopen loginapparaten verwijderd.
- `cloudflare/notifications.js` scant uitsluitend de eigen canonieke bedrijfsstaat. Eerste scan neemt bestaande ontvangsten stil als uitgangspunt. Nieuwe positieve Tikkie-providerontvangsten worden daarna éénmaal in de outbox gezet als er een geldig recent registratie-/providerontvangstmoment is (max7dagen, geen historische bulkalerts). Import/herstel met dezelfde payment-ID blijft gededupliceerd; een import met nieuwe IDs, geldige Tikkie-herkomst en recent tijdstip kan als nieuwe providerregistratie gelden. Handmatige of onbekende herkomst geeft geen push. Een oude ontvangst zonder tijdstip krijgt geen gegokte melding.
- Hetzelfde event wordt alleen aangeboden aan apparaten die al waren aangemeld. Geen oude meldingen bij een nieuwe telefoon. Devices gekoppeld aan echte `crm_sessions`; loginverval, wachtwoordwijziging of logout stopt nieuwe verzending. Al geaccepteerde push kan nog later aankomen; het openen blijft beschermd. Uitschrijven stopt ook het browserabonnement.
- Bezorglog registreert uitsluitend acceptatie door de pushdienst, geen bewijs van aflevering op telefoon, gelezen melding of gegarandeerde eenmaligheid. Leases, back-off, event-ID, Push Topic en notificatietag beperken dubbelen. Max8pogingen, max24uur aanbieden; apparaat dat offline staat of meldingen/Focus blokkeert kan de melding missen. Geen exact realtimeclaim.
- Alleen HTTPS-eindpunten van ondersteunde Apple/Google/Mozilla/Windows-pushhosts. Geen willekeurige webhook/URL/redirect, geen gevoelige payload. Native WebCrypto: ECDH/HKDF/AES-GCM [RFC8291](https://www.rfc-editor.org/rfc/rfc8291.html), VAPID ES256 [RFC8292](https://www.rfc-editor.org/rfc/rfc8292.html). Geen extra tracking- of pushmarketingdienst.
- De bestaande rootserviceworker wordt uitgebreid; geen concurrerende registratie en geen wijziging aan de offline beschermingsregels. Een offlinekopie vergeten schrijft niet langer de gedeelde worker uit zolang er nog een pushabonnement is. Aanzetten wacht op activatie van een lopende workerupdate. Push verandert geen bedrijfssnapshot op het toestel.

## Betalingen ophalen zonder open laptop

Een aparte kleine Worker per bedrijf roept de beperkte Pages-jobroute aan. Bron `workers/notifications/index.js`, voorbeeldconfig naast dat bestand. De Worker heeft geen publiek actie-endpoint of directe DB-binding. Pages controleert een apart64-hexgeheim, exact eigen CRM-origin, echte bedrijfsidentiteit/auth-inrichting, productie en expliciete featureflag. Alleen deze route mag de normale browser-Origin/logincontrole omzeilen. De rest van de API houdt bestaande bescherming. Preview/lokaal blijven uit.

Cronvoorstel elke5minuten. De uitbox en nieuwe CRM-registraties worden per ronde behandeld. Optioneel Tikkie automatisch controleren: een ronde langs actuele betaallinks, maximaal2links per job en2providerpagina’s per link, met korte timeouts. Na een complete ronde volgt een uur pauze. Daardoor is de vertraging afhankelijk van aantal links en storingen; het is geen directe betaalwebhook. Links ouder dan7dagen na verval en reeds gesloten/verlopen links vallen buiten achtergrondcontrole; handmatige knop blijft beschikbaar voor oudere/uitzonderlijke controle. Er is geen algemene bankkoppeling: gewone overboekingen registreert Philippe zelf.

Alleen bestaande serverjournal-links worden opgevraagd, geen betaalverzoeken gemaakt. `shared/tikkie-payments.js` hergebruikt de bestaande import-/correctie-dedup uit de UI; oude exports blijven beschikbaar. Alleen nieuwe bewezen ontvangsten leiden via bestaande validatie en CAS tot een centrale statecommit. Bij conflict verse state lezen en beperkt opnieuw proberen. Alleen checken schrijft geen nieuwe activiteit of businesssnapshot; providerjournal en taakstatus mogen wel wijzigen. Eén providerfout blokkeert de andere geselecteerde link niet. De volgende ronde probeert opnieuw. Geen provideractie tijdens dit bouwwerk uitgevoerd.

## Nog uit te voeren voor activering

Dit is een concrete release-inrichting, geen reeds uitgevoerde stap. Geen hele oude lokale bron blind publiceren: er staat ook ander onuitgebracht werk in deze map.

1. Bovenstaande gebruikers-URLs gebruiken en hun bedrijfsgebonden Pages/DB-doelen vaststellen; geen Spat-opslag voor Maat gebruiken. Een aparte gecontroleerde release van frontend, servercode en serviceworker voorbereiden. Gebruikerscontrole vóór livegebruik staat open.
2. Additieve migratie0005 in iedere bedoelde bedrijfsdatabase toepassen via de bestaande releaseprocedure, met normale backup/identitycontrole. Geen bestaande tabellen wissen of opnieuw importeren.
3. Per bedrijf expliciet `node scripts/notification-keys.mjs spatlappen` of `... maatwerkkunststof` uitvoeren. Dat maakt met0600 nieuwe bestanden onder `.local/notification-setup` en weigert overschrijven. Tool niet uitgevoerd. Private waarden alleen in Cloudflare Secrets plakken, nooit in chat of GitHub.
4. Eigen Pages-secrets: `CRM_PUSH_PRIVATE_JWK` en `CRM_NOTIFICATION_JOB_KEY` uit het betreffende nieuwe bestand. Eigen variabelen: `CRM_PUSH_SUBJECT=mailto:<eigen-beheeradres>`, exacte `CRM_PUBLIC_URL`, `CRM_PUSH_ENABLED=true`, `CRM_RELEASE_ENV=production`. Voor automatische Tikkie-ontvangst daarnaast expliciet `CRM_PAYMENT_POLL_ENABLED=true` en de reeds bestaande echte Tikkieconfiguratie behouden. Geen andere scopes nodig. In releaseconfig passen de optionele booleans `pushEnabled`/`paymentPolling`; standaard beidefalse, preview altijdfalse.
5. Afzonderlijke Worker per bedrijf configureren en publiceren met eigen Pages `/api/crm/notifications/run`-doel en uitsluitend diens `CRM_NOTIFICATION_JOB_KEY` als secret; vijfminutencron. [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/). Deze Worker wordt niet automatisch door de gewone Pages-release gepubliceerd.
6. Philippe opent de online versie op telefoon, installeert en kiest Betalingsmeldingen aanzetten. Toestemming kan uitsluitend op zijn telefoon worden gegeven. Controleer met een bewust gekozen fictieve/testomgeving volgens apart afgesproken controle; geen echte providerbetaling als bouwtest starten. De huidige flags blokkeren preview; een testharnas moet expliciet gescheiden blijven.

Activering/publicatie, devicecontrole, VAPIDtransport, SQL/CAS/lease-/timeout-/restorepaden en werkelijke push op iOS/Android staan open. Dit document is geen bewijs van werkende productie of kostenloosheid; cron, D1 en overige hosting vallen onder het eigen Cloudflareplan. Geen betaald abonnement aangezet.

## Aanvulling batch1 — 23 oktober 2026

De eerste serverbevestigde toestelregistratie wacht op baseline onder dezelfde controllease. Een betaling na geslaagde opt-in kan daardoor niet stil in de eerste cronbaseline verdwijnen. Gelijktijdige initialisatie geeft een herhaalbare fout in plaats van een schijnbaar geslaagde registratie. Wachtende bezorging wordt alleen voor de huidige geldige sessieapparaten geselecteerd; oude password-/sessieversies blokkeren het venster met eerste wachtrijregels niet. Algemene mislukte bezorging zichtbaar in instellingen, zonder dossierinhoud. Dit is lokale bronhardening; activering en toestelcontrole hierboven blijven open.

De schermtoetsenbordhelper staat nu in admin/workspace/viewport.js en wordt door zowel mobile-ui als feedback in de editor geïnstalleerd; geen parallelle listeners per formulier.

## Batch1 verder afgemaakt — 23 oktober 2026

Instellingen toont drie stappen (beginscherm, server, apparaat) met één hoofdactie. Herstellen bij een oude browser-/loginsessiekoppeling en voortgang tijdens toestemming, appvoorbereiding en serverbevestiging. Geen globale laadmelding. Het statusdetail is gesloten; geen recente geslaagde taakcontrole (vijftien minuten), providerproblemen en bezorgissues worden herkenbaar gemeld. Een groene apparaatkoppeling bewijst geen daadwerkelijke aflevering. Geen terugkerende statuspoll toegevoegd.

Uitzetten bevestigt eerst serverrevocatie en verwijdert daarna het browserabonnement. Bij serverfout blijft de endpoint alleen in het bestaande browserabonnement beschikbaar voor opnieuw proberen; geen endpoint/keys in localStorage of nieuwe logs. Bij lokaal opruimprobleem zegt de melding uitdrukkelijk dat de serverkoppeling al uit staat. Revocatie blijft mogelijk met uitgeschakelde featureflag/ontbrekende VAPIDconfig en na opnieuw inloggen van hetzelfde bedrijfsaccount. Dit is uitsluitend de eigen bedrijfseigen endpoint; geen device-zoek/opsom-API. De huidige autharchitectuur heeft één allowed account per bedrijf. Bij toekomstige multiuser-toegang moet deze eigenaarcontrole opnieuw worden ontworpen.

Server weigert nieuwe subscription zolang de beveiligde jobconfiguratie ontbreekt. Voor de apparaatlimiet verwijdert hij verlopen/verouderde sessiekoppelingen; een nieuwe sessie of nieuwe browsersleutel begint een nieuwe meldingenperiode. Vlak vóór iedere pushaanbieding worden endpointkoppeling, sleutels, actuele sessie/wachtwoordversie/email en verloopdatum opnieuw gelezen. Een al gestart providerverzoek is niet terug te roepen. Bestaande auth/Origin/bedrijfsbinding en event-/leasegrenzen behouden. Geen extra SQLmigratie of providerscope voor dit vervolg.

Mobiel menu slaat onzichtbare focusdoelen over en ruimt zijn navigatielistener op. Standalone editorfeedback gebruikt nu ook daadwerkelijk viewporthoogte/offset en16px-invoer boven het schermtoetsenbord, naast de gedeelde focushelper.

Status: uitsluitend lokale bron, cachebatch1-mobile-20261023. Geen tests/syntaxchecks/build/browser-QA of echte provider-/klantmutaties uitgevoerd. Online links en toesteltype gevraagd; nog onbeantwoord bij vastleggen. Geen sleutels/configuraties aangemaakt/geopend, geen publicatie of online activering. Deze gebruikersgegevens en een afzonderlijke gecontroleerde release/toesteltoestemming blijven nodig.
