> Aanvulling1november: de eerder ontbrekende HTTP/UI-/account-/actor-/release-/generatie- en originele-label-/meer-colli-projectiebron is lokaal aangesloten; ook staplogs en herstelcache. [Nieuwe bediening, grenzen en serverinrichting](PACKS-BOEKEN-EN-LOGS-20261101.md). Bronwerk review/local; geen tests/provideractie/publicatie. Werkelijke account/contract/proefinrichting en eigen controle blijven open; onderstaande31oktoberstand is historie.

# PACKS batch 3 — uitvoeringsbron en labelherstel

31 oktober 2026. `maat-packs31-batch3`: **gedeeltelijk gebouwd, lokaal**. Alleen Maatwerkkunststof/Kunststofbaas. Geen nieuwe tests uitgevoerd. Geen PACKS-login/token/productopvraag/boeking/GetLabels of publicatie uitgevoerd.

## Concrete bronstand

| Punt | Gebouwd | Nog open |
|---|---|---|
| B3-01 | Zuivere veldmapping met bevestigde account-/productidentiteit, actuele accountproductgeldigheid en landen/colli/gewicht/maatlimieten; gewone Shipment, cm/kg, eigen poging-ID en expliciete datumvorm | Werkelijke PK-contractwaarden/profiel invullen en beoordelen |
| B3-02 | Vaste gescheiden test-/livehosts, servercredentialresolver, URL-form-encoded tokenaanvraag, versleutelde gedeelde tokencache/lease, werkelijke expires_in met reserve, geen redirect/retry/livefallback | Credential-/profielopslag en daadwerkelijke serverinrichting/rotatie aansluiten |
| B3-03 | AccountKey en volledige vaste providerpayload optioneel in bestaande encrypted CAS-poging/fingerprint; pakket/adres/datum vergelijken met bewaarde voorbereiding | Geen operationele poging aangemaakt; behoud/herstel van integratieopslag nog inrichten |
| B3-04 | Interne executor: actuele serverbasis → login/productopvraag vóór claim → één duurzame pending-claim → account/order/guard opnieuw controleren → maximaal één BookShipment door de claimwinnaar | Authenticeerde HTTP-/UI-adapter en afzonderlijke vrijgave nog aansluiten |
| B3-05 | Provider-ID's bij herkenbaar antwoord eerst bewaren, ook gedeeltelijke antwoorden; controle op eigen referentie/adressen/datums/dienst/labeltekst/product/maten/gewicht en pakketidentiteit | Geen externe resultaat-/normalisatiecontractproef; onbekend blijft uncertain |
| B3-06 | GetLabels alleen voor dezelfde geboekte poging/accountversie; elk label exact koppelen aan shipment/item/barcode, Pdf/base64/header/omvang bewaken, alle pakketten nodig | Automatisch bewaren/selecteren via bestaande state/files-transactie en volledige meer-colli-PDF-bundel ontbreken nog |
| B3-07 | Bestaand handmatig PACKS-label voorkomt nieuwe API-boeking, ook als het nieuwe register leeg is; voor toekomstige boekactie aparte bevestiging dat niet elders handmatig geboekt is | Een buiten het CRM geboekte zending zonder bekend label kan de software niet zelfstandig ontdekken |
| B3-08 | Geen automatische herboeking, vervanging, annulering, betaal-/leverstatus of mail; bestaande bestanden en handmatige route behouden | Eigen gebruikerscontrole, toegestane verificatie en aparte publicatie/activering blijven open |

Deze code is een interne uitvoeringslaag, geen aangesloten werkende CRM-koppeling. `cloudflare/packs.js` blijft voorbereiding-only en importeert de client/executor niet. Publieke book/recover-labels weigeren nog met 423; er verschijnt geen actieve boekknop op grond van deze bronaanwezigheid. De nieuwe bron is niet aangeroepen. Een environmentflag geeft geen dispatchpad.

## Verdeling en contractgrenzen

- `shared/packs-provider-contract.js`: profiel/payload/pakketlimieten/datumomzetting en antwoord-/labelregels, zonder netwerk/geheimen/DOM.
- `cloudflare/packs-provider-client.js`: vaste OAuth/product/boek/labelpaden, begrensde responselezing, servercredentials en versleutelde tokenopslag via bestaande integration-store. Nooit ruwe providerfouten/credentials/body in publieke foutmeldingen.
- `cloudflare/packs-execution.js`: alleen interne dependency-injected uitvoering, met eigen autorisatiefunctie als verplichte vrijgavegrens. Bedrijf/omgeving/account/order/voorbereidingsbasis en register blijven leidend.
- `cloudflare/packs-registry.js`: bestaande CAS-basis uitgebreid met optionele accountKey/providerRequest en interne resolve voor dezelfde poging; geen publieke reset-/claim-/settleroute. Oud formaat blijft leesbaar, wordt niet stil herschreven of automatisch uitvoerbaar gemaakt.

Het lege `work/packs-provider-20261031/profile.example.json` heeft geen operationele waarden. PK-01..11 blijven feitelijk open; een string in een voorbeeldbestand is geen PACKS-toestemming. Profiel noemt geen accountgeheimen. Credentials worden door de toekomstige serverresolver apart aangeleverd en moeten dezelfde accountKey/configversie hebben. Voor labelherstel moet de oorspronkelijke versie beschikbaar blijven; geen oude credentials weghalen zolang herstel ervan afhankelijk is.

Actuele productinfo is aanvullend aan het bevestigde profiel. Een productnaam/ID/handler/netwerk moet eenduidig passen; bestemming en geldigheid moeten bruikbaar zijn. De strengste colli-/gewichtslimiet geldt. Per-as buitenmaten worden niet gedraaid. productSizeMax krijgt alleen betekenis met een expliciet bevestigde formule (langste zijde, som zijden, lengte plus omtrek of volume) en dezelfde maximumwaarde; geen formule uit de naam raden. Geen verzonnen materiaalgewicht, verpakkingstoeslag, transportprijs of automatische kostenboeking.

Datumformaat blijft een echte contractkeuze: date-only of Nederlandse middernacht met Europe/Amsterdam-offset. Er is geen tijdstip bedacht voor de echte afhaalronde; die API-serialisatie is geen afhaalafspraak. BookingStatus/printLabel zijn verplichte profielkeuzes, geen kostenvrije proefstand. Geen klantbericht/Track & Trace-optie verzinnen zolang PK-10 niet vastligt.

## Bijzondere fouten

Een bestaande poging blokkeert iedere nieuwe BookShipment, ook met ander request-ID, accountversie of verlopen lease. Een bestaande handmatige labelkeuze of PACKS-labeldocument bij de order blokkeert eveneens. Ook een oud label wordt niet als bewijs van annulering beschouwd. Nog niet in CRM zichtbare handmatige boekingen vragen expliciete gebruikerscontrole; de software gebruikt geen onvolledige GetShipments-zoekuitslag als vrijgavebewijs.

Na een geslaagde claim kan ook een wijziging vóór feitelijke dispatch de poging voor herstel blokkeren. Er wordt in deze versie geen nieuwe poging vrijgegeven. HTTP-fouten, onleesbaar antwoord, timeout en ontbrekende of afwijkende echo's zijn geen bewijs dat niets geboekt is. Herkenbare unieke provider-ID's/barcodes blijven als uncertain-bewijs bewaard; tegenstrijdige associaties geven geen bruikbaar label. De bewijsgrens is intern maximaal 200 antwoordregels, niet 200 te boeken pakketten. Meer dan die grens of een te grote/onleesbare response laat de oorspronkelijke blokkade bestaan en vraagt PACKS-onderzoek; niet alle IDs kunnen dan automatisch worden vastgelegd.

Het register bewaart de resultaatidentiteiten vóór labeldecodering of bestandsprojectie. Een verloren opslagbevestiging mag één herhaling van uitsluitend dezelfde monotone resultaatwrite krijgen; er wordt daarbij niet opnieuw ingelogd, opgehaald of geboekt. Bij blijvende opslagfout blijft de eerdere pending/uncertain blokkeren. Het externe bewijs is pas duurzaam bevestigd als de write werkelijk gelukt is; broncode garandeert geen herstel bij verlies van de hele integratiedatabase.

De antwoordcontrole is opzettelijk strikt: provider-normalisatie of ontbrekende referentie-/adres-/datum-/pakketvelden wordt niet als bewezen correcte boeking beschouwd. Dat vraagt echte contractbevestiging en later toegestane verificatie. Dit kan een bestaande echte boeking als uncertain laten staan; nooit automatisch opnieuw boeken om dat op te lossen.

GetLabels gebruikt mergeLabels=false en bekende shipment/item/barcodecombinaties, niet volgorde of alleen het eerste label. Iedere verwachte combinatie moet precies eenmaal voorkomen. Alleen originele Pdf-base64 met %PDF-header en samen maximaal 4 MB wordt aan de interne vervolgstap gegeven. Geen barcode- of PDF-pagina-inhoud geanalyseerd of visueel beoordeeld. Automatische meer-colli-samenvoeging/duurzame CRM-projectie is nog te bouwen. De privébytes komen niet in status-JSON of bouwlog; projection blijft pending.

## Wat nog gebouwd en geregeld moet worden

1. Bevestigde PACKS-/leverancierswaarden en echte accountrechten/test/live/DirectBooking/dienst/limieten/datum/retour/tarief/herstel vastleggen; eigen akkoord op werkelijke pakketwaarden blijft nodig.
2. Beveiligde profiel-/credentialopslag met versiebehoud, serveractor en autorisatie aansluiten; de huidige nieuwe factories leveren deze dependencies niet zelf.
3. Idempotente PDF-/bestandsprojector in de bestaande state/files-transactie, met volledige meer-colli-dekking, actuele orderbasis en behoud van eerdere labelkeuzes/bestanden. Dit is bouwwerk, geen vraag die Philippe technisch moet oplossen.
4. Volledig gecontroleerd boekingsvoorbeeld en aparte bewuste eindknop aansluiten aan een authenticeerde handler. Huidige handler blijft daarvoor uit; geen reserve-activering via env.
5. Register/retentie/reconciliatie operationeel inrichten. Vervolgens eigen controle en uitsluitend expliciet toegestane verificatie; nieuwe bron heeft geen geslaagde testclaim. Publicatie en eerste bedoelde echte boeking afzonderlijk.

Batch 3 is dus gedeeltelijk, niet alleen nog afhankelijk van antwoorden. Batch 2 online proefinstallatie bestaat ook nog niet. Batch 4 blijft open. AI-order aanpassen en de aparte ongepubliceerde onlineorderlijstfix vallen buiten deze wijziging.

## Bronnen en werkelijk uitgevoerd

De aangeleverde handleiding v2.4.3 is via de bestaande privétekst opnieuw geraadpleegd voor tokenhosts/formvelden/TTL/DirectBooking/datumgedrag. Actuele openbare Swagger opnieuw uitsluitend via GET opgehaald; webreader en lokale DNS faalden, openbare curl-opvraag met netwerkmachtiging lukte. Versie v9.0.0.0; alle schemas identiek aan de eerdere31oktober-snapshot. Moderne Swagger gebruikt `/api/Products/GetProductInfo`; het oudere korte pad uit de handleiding wordt niet geraden. Geen account/login of operationele API gebruikt.

[Openbare PACKS-Swagger](https://packsonlineapp.packs.nl/swagger/v1/swagger.json), [documentatie](https://packsonlineapp.packs.nl/docs/index.html). Publieke snapshot en aangeleverde handleiding blijven buiten de publieke projectbron; geen credentials/accountnamen/klantgegevens gekopieerd.

Alleen bron/documentatie gelezen/vergeleken en lokaal bewerkt, openbare documentatie-GET en bouwadministratie via `scripts/build-task.mjs`. Geen tests/checks/syntaxchecks/build/generator/browser-/DOM-/visuele QA, nieuwe tests toegevoegd, CRM-runtimeactie, PACKS-login/token/productopvraag/boeking/GetLabels, echte mail/betaling, cloudresourceaanmaak/migratie, zakelijke gegevens-/bestandsmutatie, Git-/indexwijziging/upload/publicatie. Historische29tests gelden eerdere bron. Gebruiker wees de nieuwe tests af en controleert zelf. Bestaande wijzigingen/data/bestanden/templates/staging behouden. CSS ongewijzigd; alleen bouwtaken-cachemetadata vernieuwd.
