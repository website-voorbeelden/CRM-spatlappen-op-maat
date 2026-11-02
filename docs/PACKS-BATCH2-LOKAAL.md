> Actuele aanvulling30oktober: gebruiker bevestigt dagelijkse afhaalronde zonder extra Pickup. Morgen is lokaal een aanpasbaar voorstel; gereedheid blijft apart en retour naar Kunststofbaas is nog een voorstel. Zie [dagelijkse ronde en datums](PACKS-DAGELIJKSE-RONDE-20261030.md). Geen nieuwe test-/liveclaim.

> Vervolg batch3,30oktober: afzonderlijk toegestane lokale tests vinden ship/shipping-aansluitfout; setter en guards nu canoniek shipping.29gerichte tests geslaagd; [afbakening en open verificatie](PACKS-BATCH3-LOKALE-VERIFICATIE.md). De oude vermeldingen Geen tests hieronder beschrijven batch2, niet het latere batch3-resultaat.

# PACKS batch 2 — lokale voorbereiding en serverbasis

30 oktober 2026. **Lokaal brongebouwd; gedeeltelijk. Eigen controle open.** Alleen Maatwerkkunststof/Kunststofbaas. Geen operationele PACKS-client, activering of test. Taak `maat-kunststofbaas-fulfilment-20261029` blijft doing/local. [Batch 1 en contracttags](PACKS-KOPPELING.md) blijven leidend voor open afspraken.

## Wat in deze ronde is gebouwd

Bij een actuele bevestigde leveranciersbestelling zonder actueel label is de hoofdactie nu **PACKS voorbereiden**. Er is één formulier voor pakketregels, gestructureerd afleveradres, afhaal-/transportretouradres, gereed-/afhaal-/bezorgdatum en controlekeuzes. Extra adresdelen en productbron staan onder gesloten onderdelen. Na bewaren volgt een controleoverzicht met concrete ontbrekende gegevens; aanpassen blijft mogelijk.

- Eén pakket is een voorstel. Pakketten toevoegen/weghalen bewaart overige invoer. De interne formuliergrens is20, geen bevestigde PACKS-toestemming.
- Alleen bij exact één product met aantal1 zijn bekende kale productmaten /10 als cm voorgesteld. Bescherming/stapeling/verpakkingsgewicht zijn niet verzonnen. Gewicht blijft onbekend. Bij meerdere producten geen onbewezen pakketindeling.
- Bekende contactnaam/telefoon/mail/land zijn rechtstreeks overgenomen waar ze passen. Alleen eenvoudige herkenbare Nederlandse adresopbouw is gesplitst als expliciete interpretatie. Geen land, huisnummertoevoeging of afgekorte naam raden. Te lange bron blijft in het oorspronkelijke orderadres zichtbaar, het losse veld wordt niet stil afgekapt.
- Overgenomen waarden lichtpaars, geïnterpreteerde adresdelen donkerpaars; bij handmatige wijziging verdwijnt die veldmarkering. Alle adresvelden blijven aanpasbaar zonder het orderadres te overschrijven.
- Afhaal-/retouradres worden niet als actieve accountafspraak ingevuld. Retour van onbestelbaar transport is apart van het maatwerk-klantretourbeleid. Bestaande privéafhaalinformatie is niet als publieke standaard/configuratie toegevoegd.
- Datums blijven leeg totdat bekend. Controleoverzicht gebruikt Europe/Amsterdam, markeert ontbrekend/verleden en afhalen vóór gereed/bezorgen vóór afhalen. Nog geen API-datumserialisatie: contractverschil date-time versus YYYY-MM-DD is open.
- Een onvolledige voorbereiding is te bewaren. Ongeldige getallen/adressen/datums worden geweigerd met invoerbehoud; nog onbekende waarden kunnen leeg blijven. Inputwijzigingen vragen opnieuw de drie controlebevestigingen.

De hoofdactie bewaart uitsluitend voorbereiding, geen bestel-/zending-/afhaal-/leverfeit, betaling, tarief, btw, marge, voorraadboeking of mail. Het controleoverzicht zegt niet dat een eerder buiten het CRM gemaakte zending niet bestaat. Open PK-01 t/m PK-11 en onbekende prijs blijven zichtbaar; nergens staat een bruikbare knop die suggereert nu al echt te boeken.

## Bestaande label, pakbon en mail

Een echt oorspronkelijk PACKS-PDF toevoegen blijft via **Meer → Echt PACKS-label toevoegen** beschikbaar, ook vanuit het controleoverzicht. De bestaande PDF-grens4MB, bestanden/state samen, actuele order-/klant-/inkoopbasis en expliciete labelcontrole blijven leidend. Met een actueel label gaat de bestaande stroom verder naar pakbon en leveranciersmail.

Nieuw optioneel `shippingLabel.preparationBasis` bindt het gekozen label aan de fysieke voorbereiding. Andere pakketmaten/gewichten/aantallen/adressen/datums/instructies maken een oud label ongeschikt als automatisch voorstel. Een eerste voorbereiding bij een al gekozen label vraagt ook bewuste hercontrole. Het formulier vraagt daarvoor expliciet bevestiging vóór bewaren. Het oorspronkelijke labeldocument/de gekozen ID en eerdere mails worden niet gewist of geannuleerd; een opnieuw gecontroleerd echt label kan via de bestaande upload worden toegevoegd. Een nieuwe documentversie krijgt een eigen ID en de eerdere bytes blijven bestaan.

Alleen opnieuw bewaren, een herkomstmarkering of een controlekeuze wijzigen verandert de fysieke basis niet. Oude orders zonder voorbereiding en labels zonder de nieuwe optionele metadata behouden hun eerdere gedrag. De pakbon-/klantreferentie, eigen CRM-nummer en Kunststofbaas-bestelnummer blijven afzonderlijk. Een ongeschikt label kan niet ongemerkt door de bestaande leveranciersmailbewaking heen; eerdere aangeboden mails worden niet door een nieuwe voorbereiding teruggeroepen.

## Opslag en conflictgrenzen

`order.supplierFulfilment.packsPreparation` is optioneel en schema1. Het bevat een eigen revisie, actuele orderbasis/leveranciersreferentie, tijdstip, 1–20 pakketregels, drie adresobjecten, datums/instructie, drie controlekeuzes en beperkte veldherkomst. Pakketmaten zijn cm, gewicht kg; null betekent onbekend. De gedeelde validator bewaakt sleutels, types, limieten, unieke pakket-ID's en datums.

Bewaren gebruikt dezelfde merge/CAS en de oorspronkelijke volledige order-/klant-/inkoop-signature. Een ander tabblad mag de oorspronkelijke basis niet stil vernieuwen. Bij mismatch blijft het formulier staan. Een bewaarde voorbereiding voor een oudere orderbasis blijft zichtbaar met oude invoer, huidige orderbron ernaast en een vereiste bewuste hercontrole; geen automatische migratie of herinterpretatie van oude records.

Voorbereiding reist met de bestaande volledige state/files-back-up. Orderkopiëren verwijdert de bestaande gehele supplierFulfilment-koppeling en daarmee ook deze voorbereiding. Er is geen browserdraft, extra zakelijke store of SQL-migratie. Het toekomstige externe boekingsregister hieronder is bewust geen deel van die gewone orderopslag.

## Serverbasis, nog zonder provideruitvoering

`cloudflare/packs.js` is aangesloten onder `/api/crm/packs/`. Eigen login, serverbedrijf Maat, Origin/JSON, vaste acties en begrensde streambody zijn verplicht. De handler bevat geen fetch/providerclient/tokenaanvraag en kan door geen environmentflag worden geactiveerd.

| Actie | Gebouwde bron |
|---|---|
| GET status | Geeft preparation-only, canBook=false en open contracttags; alleen bij expliciete order/omgeving eventueel bestaande versleutelde registerstatus lezen |
| POST review | Leest de echte cloudorder uit bestaande consistente snapshot, controleert bestel-/voorbereidingsversie en geeft dezelfde pure controlepunten terug; geen opslag/provider |
| POST book / recover-labels | Expliciet geblokkeerd, geen providerverzoek of registratie schrijven |
| Andere acties | Geweigerd, geen generieke URL-/config-/secretproxy |

De lokale UI gebruikt de pure gedeelde regels en bestaande browseropslag, zonder deze cloudroutes te hoeven aanroepen. `/__local/packs/` is in Functions expliciet afgevangen vóór proxy/documentfallback; zonder autoritatieve orderloader geen serverreview. De Python-localserver geeft op die gereserveerde route een expliciete geblokkeerde reactie in plaats van door te vallen naar document-/betaaldiensten. Die lokale serverbron is niet herstart of beproefd.

`cloudflare/packs-registry.js` bevat interne CAS-bouwstenen op bestaande encrypted integration-store:

- Scheiding per serverbedrijf/test/live/order, guard/generation vereist; geen automatische inrichting van een ontbrekend register.
- Eén duurzame poging met eigen poging-/request-ID, berekende fingerprint, configversie/actorhash en onveranderlijke gecontroleerde voorbereiding.
- pending wordt vóór een toekomstige dispatch opgeslagen. Dezelfde poging geeft de bekende status terug en is geen tweede dispatchclaim. Andere request-ID of gewijzigde config/basis omzeilt de blokkade niet.
- pending/uncertain kan naar uncertain of bekende booked-uitkomst. Bekende ID's mogen niet verdwijnen of worden overschreven. Geen TTL-/leasevrijgave, reset-, delete-, vervangings- of rejected-vrijgaveroute.
- Provider-ID's/pakket-ID's blijven los van ordernummer en leveranciersnummer; registerstatus geeft geen adrespayload, secrets of base64labels terug.
- Providerfeit en order-/labelprojectie zijn apart. Projectie blijft voor deze bronbasis pending: nog geen echte label-/bestandskoppeling vanuit de API gebouwd.

Dit is een **interne registerbasis, niet bewezen duplicatepreventie in een werkende providerketen**. Geen openbare route roept claim/settle aan. Er zijn geen registerrecords of guards aangemaakt. Voorlopig maximaal één poging per order/omgeving; nieuwe/vervangende zendingen en afwijzingsvrijgave wachten op herstelcontract en afzonderlijke implementatie. Rampenherstel van integratieopslag vereist een beoordeelde operationele reconciliatieprocedure; het guardrecord alleen bewijst geen volledigheid na herstel.

## Eerlijk open voor vervolg

1. PK-contractbevestigingen: juiste identiteit/test/live/DirectBooking, dienst/afhaalverantwoordelijkheid/retour, tarief/limiet/verpakking/gereedheid/datums, label-/timeout-/correctieprocedure en berichtkeuzes.
2. Concrete servercredential-/token- en providerclient, productlimietvalidatie, definitieve payload/datumserialisatie en laatste autoritatieve controle vóór dispatch. Geen voorbeeldcodes of productiekoppeling invullen om de gaten te vullen.
3. Volledige boekuitvoering en GetLabels-herstel, meer-colli-PDF-matching en bestand/projectieherstel met bewaard extern bewijs. Geen BookShipment-labelfallback.
4. Beoordeelde provisioning, retentie/back-up en herstel van het externe register; expliciete vervangings-/correctieprocedure.
5. Eigen beoordeling en afzonderlijk toegestane verificatie. Bronlezen vervangt geen tests en is geen bewijs van goed werkende knoppen, CAS/concurrency of veilige liveboekingen.

Alleen bron/documentatie vergeleken en bewerkt, administratie via scripts/build-task.mjs. Geen tests/checks/syntaxchecks/build/generator/browser-/DOM-/visuele QA, login/token/product-/zending-/label-API, mail/providerproef, runtimeherstart/start, migratie/GitHubupload/publicatie of klant-/order-/bestandmutatie door de bouwer. Bestaande eerdere wijzigingen/gegevens/templates/Git-index behouden. Batch3/4 zijn niet automatisch gestart.

## Vindplaatsen

- `shared/packs-preparation.js`: pure voorstel-/veld-/controle-/basisregels.
- `shared/supplier-fulfilment.js`: registratie binnen bestaande leverancierguard en label-/mailactualiteit.
- `admin/orders/packs-preparation.js`: formulier en controleoverzicht; bestaande supplier-factory blijft ingang.
- `cloudflare/packs.js` en `cloudflare/packs-registry.js`: beveiligde voorbereiding en ongeactiveerde registerbasis.
- `cloudflare/api.js`, `functions/__local/[[path]].js`, `dev-server.py`: expliciete routering/grenzen.
- `admin/style.css`: uitsluitend centrale pakketfieldsetopmaak; bestaande velden/knoppen/herkomstkleuren hergebruikt.
