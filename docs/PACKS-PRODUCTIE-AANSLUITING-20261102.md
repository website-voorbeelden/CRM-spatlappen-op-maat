# PACKS productieaansluiting — 2 november 2026

Gebruiker hervat expliciet en wil zelf de eerste echte verzending vanuit een online order kunnen boeken. Dit vervangt de eerdere pauze/publicatiestop voor deze aansluitopdracht. GitHub plus Maat-CRM en bijbehorende converteruitrol opgedragen. Geen toestemming voor algemene tests/checks/browser-QA of een door de bouwer aangemaakte zending. Alleen noodzakelijke publicatieverpakking/compilatie; de eigenlijke boekingsklik blijft bij Philippe.

## Werkelijk ingericht

Dezelfde Worker tjworx-packs-crm-test gebruikt nu production/live; de naam bevat historisch test maar de actieve bindings hebben expliciet productie-identiteit en de Maatproductie-D1/R2. Previewdatabase/bucket blijven onaangeroerd en bevatten geen overgenomen productieorders. Geen tweede onafhankelijke engine of registry. De ongepubliceerde previewbinding kan deze productieomgeving niet gebruiken: Origin, sleutel, environment en onafhankelijke marker worden gecontroleerd.

Uitgangspunt exact aangeleverde v3 plus werkelijk opgehaalde v4-wijzigingen: bestaande packs.js en trackingcache/scheduled-bron behouden. Kritieke null-of-ontbrekend nullable productvelden gecorrigeerd. Nieuwe beperkte accountdiagnose, besloten context en entry-aanpassing:25modules. Werkelijke modulebron/manifest staan privé bij work/maat-release-20261102/worker-live-source en worker-module-manifest.json. Dit pakket bewaart de v4engine; de bredere lokale packs.js is niet stil over de gepubliceerde motor gelegd. Trackingcron blijft uit.

D1-productie eerst bedrijf Maat vastgesteld en geen bestaande PACKS-integratieregisters aangetroffen. Alleen crm_packs_service_identity met één productieopslagmarker toegevoegd, geen klant-, order-, factuur-, betaal- of documentrecords gewijzigd. Vorige codepublicaties en D1 Time Travel-bookmark vastgelegd. Geen bestaande marker/reset/restore uitgevoerd.

Twee nieuwe servergeheimen op Worker: interne servicekey en het al door gebruiker verstrekte API-account voor readonly accountdiagnose. Pagesproduction heeft alleen dezelfde nieuwe servicekey erbij; previewgeheimen bleven leeg, andere bestaande secrets behouden. Wachtwoorden/tokens niet in publieke bron/browser/logs/documentatie. Een eerste CLI-opdracht stopte vóór upload omdat hij een bovenliggende Pagesconfig vond; herhaald met expliciet Workerprofiel geslaagd.

Bestaande CRM_PASSWORD_HASH en CRM_INTEGRATIONS_KEY zijn niet uitgelezen/geroteerd of als nieuwe Cloudflare-secret gekopieerd. De echte CRM-authenticatie gebeurt eerst in Pages. Vervolgens krijgt alleen dezelfde private Service Binding een kortlevende AES-GCM-context, gebonden aan volledige request-URL/methode/bodyhash/bedrijf/omgeving/opslagmarker/tijd. Worker ontsleutelt uitsluitend binnen die request, controleert de echte CRM-sessie opnieuw en gebruikt dezelfde bestaande encryptiesleutel voor de bestaande integratiestore. Geen globale request-state, publieke provisioningsroute of tweede opslag. Een ontbrekende/foute/verlopen context stopt. Geen browserveld kan dit contextobject instellen.

De vaste nieuwe account-identity/account-products-POSTs doen alleen OAuth+Identity of GetProductInfo op eigen klik, met echte auth/Origin/confirmedtrue/bodygrens en geschoonde foutstatus/JSON. Hiervoor is nog geen boekingsprofiel nodig. Lokale helpers blijven lokaal; de online UI krijgt dezelfde twee leesknoppen via de private serverroute. Geen automatische provideropvraag bij openen van een order.

## Nog niet vrijgegeven

CRM_PACKS_EXECUTION_ENABLED=false, FRESH_INSTALL=false, releaseprofiel ontbreekt. Het boekingsregister is niet initialized en geen immutable bevestigd dienstprofiel aangemaakt. Deze bron/inrichting bewijst dus nog geen werkende boekingsknop of label. Er is GEEN echte shipment/label/tracking/mailuitvoering gedaan. Geen PK-verklaringen automatisch afgevinkt.

Philippe leverde PACKS-correspondentie: eigen account met afzonderlijke facturatie, dezelfde tarieven als Kunststofbaas, beide accounts op Moeskampweg6 en afhalen daar toegestaan. Hij bevestigt dagelijkse ronde. Die punten niet opnieuw laten opvragen. De genoemde lengte10–200cm, breedte10–50cm en gewicht0,2–15kg zijn zijn globale verwachting, geen maximale contractlimieten. De betekenis van productSizeMax350 en maximale zijden ontbreken nog. Niet aannemen dat iedere overschrijding altijd vóór boeking kosteloos wordt afgewezen; geen onbekende waarde als nul of bevestigd maximum opslaan. De normale bestaande preflight/profiel-/register-/onzekerresultaatgrenzen blijven intact.

## Outlook en verzending

Philippe heeft geen TJWorx-mailbox, wel het domein. BouwmarktXL is het voorstel voor uitgaande logistieke mail via bestaande SMTP2GO; verificatie/configuratie nog apart. Geen nieuwe mailbox nodig. Inkomende mailbox info@bouwmarktxl.nl: Microsoft Web-app, delegated User.Read/Mail.Read met offline_access, callback https://crm.maatwerkkunststof.nl/api/crm/supplier-mail/callback. Tenant/client-ID en client secret beveiligd aan server; geen Mail.Send/Mail.ReadWrite. Een gedeelde mailbox of Outlook als alleen IMAPclient eerst vaststellen; geen bestaande mailbox/regels wijzigen. Korte overdracht aan andere AI gegeven. Outlook nog niet gekoppeld of geactiveerd, geen mail verstuurd.

## Publicatiestand

Cloudflare Worker- en secretinrichting werkelijk toegepast. Actief na secrets: deployment <deployment-id>, versie21fe256b-9725-45a4-a8c8-3771f6ba49b4. GitHubbron fcfc7d4 en Maat Pagesproduction zijn inmiddels gepubliceerd; de documentservice meldt de passende packing-pb-reference-20261102-versie. Zie RELEASE-20261102.md voor de afzonderlijke publicatiebewijzen en de gecorrigeerde eerste upload. Dit is geen functionele eindcontrole. Bestaande Spatlappen-Pagesproductie niet herpubliceren; gedeelde documentservice behoudt Spatlappenvariant.

Geen automatische tests/checks/syntax/buildrondes buiten noodzakelijke uitrolverpakking, geen CRM-browser/DOM/visuele QA, klantdata-import/restore/opruiming/Git-indexwijziging, echte provideractie/boeking/label/mail/betaling. Metadata-/publicatiereadback is geen functionele eindcontrole of100%-claim. Vereiste gebruikerscontrole blijft open.
