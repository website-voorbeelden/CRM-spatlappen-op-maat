# PACKS batch 3 — gerichte lokale verificatie

30 oktober 2026. Philippe heeft expliciet toestemming gegeven voor **alleen gerichte lokale PACKS-tests met fictieve gegevens, zonder netwerk/providerlogin/boekingen/mail of eigen CRM-gegevens**. Geen toestemming voor browser-QA, brede projectchecks, builds, publicatie, echte Tikkie-acties of PACKS-testomgeving afgeleid.

## Uitgevoerd resultaat

Twee uitvoeringen van uitsluitend `node --test tests/packs-local.mjs`:

| Ronde | Tests | Geslaagd | Gefaald | Resultaat |
|---|---:|---:|---:|---|
| Eerste | 28 | 24 | 4 | Drie fouten door een ongeldige leverwijzecode in de leveranciersbron; één te strikte null-verwachting in de nieuwe test |
| Na correctie en extra regressie | 29 | 29 | 0 | Exitcode0, niets overgeslagen |

Geen verdere projecttests of builds gestart. Er is geen productiegeschiktheidsclaim. De providerclient/uitgaande boeking bestaat nog niet in deze bronversie; echte PACKS-testverificatie is daarom open.

## Gevonden en hersteld

De leveranciersbevestiging schreef `fulfilmentMethod='ship'`, terwijl de bestaande gedeelde leverwijzevalidatie alleen onder meer **`shipping`** voor Verzenden accepteert. Hierdoor werd bewaren via de volledige CRM-validator afgewezen; de PACKS-formulier-/serverguards verwachtten dezelfde onjuiste waarde.

Setter en bijbehorende guards in `shared/supplier-fulfilment.js`, `admin/orders/supplier-fulfilment.js`, `admin/orders/packs-preparation.js` en `cloudflare/packs.js` gebruiken nu de bestaande canonieke `shipping`. Een extra regressie legt een fictieve leveranciersbestelling vast vanuit Afhalen en controleert die door de echte gehele statevalidator. Geen bestaande order gemigreerd of anders ingevuld; er is geen legacyalias toegevoegd om foutieve opslag stil geldig te maken.

De vierde fout was alleen een testverwachting: een niet-gevonden label kan undefined zijn. De test controleert nu dat geen actueel label wordt teruggegeven, het oude document blijft bestaan en een nieuw mailvoorstel met dat oude label wordt geweigerd. Productgedrag hiervoor niet veranderd.

## Wat de tests bestrijken

- Voorstel uit één product, mm→cm, onbekend gewicht/null, geen gegokte pakketindeling bij meerdere stuks; onvolledig bewaren, ongeldige waarden en ongewenste sleutels.
- Eenvoudige Nederlandse adresinterpretatie met huisnummertoevoeging, te lange namen niet afkappen, buitenlandse straatvelden niet raden.
- Nederlandse datum rond middernacht, volgorde gereed/afhalen/bezorgen, fysiek complete invoer geeft nog steeds geen boekrecht.
- Labelbasis reageert op fysieke wijzigingen en negeert revisie/tijdstip/checkbox/herkomst. Ouder geselecteerd document blijft bewaard maar kan na fysieke wijziging geen nieuwe leveranciersmail rechtvaardigen.
- Oorspronkelijke order-/klantsignature, statevalidatie, geen prijs-/betaal-/verzendfeit door voorbereiding, Spatlappenweigering. Oudere records zonder nieuwe voorbereiding blijven geldig.
- JSON-roundtrip van fictieve state houdt de voorbereiding; orderkopie neemt de leveranciers-/PACKS-koppeling niet over. Dit is geen volledige proef van de echte back-upinterface of een databaseherstel.
- Ontbrekende registerguard blijft geblokkeerd, gelijktijdige CAS-claims leveren één intentie, andere request/config mag niet omzeilen, ciphertext bevat geen leesbaar adres, status geeft geen adres/actorhash.
- Verloren bevestiging van een reeds gecommitte registerwrite, onzekere intentie na een nieuwe service-instantie, behoud/verrijking van gedeeltelijke provider-ID's, bekende boeking niet terugzetten.
- Scheiding test/live/bedrijf en gewijzigde herstelgeneratie. Eén echte afzonderlijke Nodeproces schrijft een fictieve intentie in een eigen tijdelijke SQLitefile, stopt; een nieuw proces/adapter vindt de pending-intentie en weigert een nieuwe poging.
- HTTP-handler in geheugen: sessie/bedrijf/Origin, kapotte JSON, bodylimiet, onbekende acties, opgeslagen order/revisie. Book/labelherstel blijven geblokkeerd, ook met activerend ogende envflags; browser kan geen andere voorbereiding meesturen.

## Afzondering en grenzen

Alle fixtures staan in `tests/fixtures/packs-local.mjs`, met verzonnen personen/adressen/bedragen, example.invalid-mail en synthetische encryptiesleutel. SQLite is in-memory; alleen de herstartproef maakt een eigen `crm-packs-fixture-*`-map in de systeemtempmap en ruimt uitsluitend die eigen testmap op. Geen .local-config, echte database, account, klantbestand of browseropslag gelezen/gewijzigd.

Globale fetch is in test- en fixtureproces geblokkeerd; onverwachte fetch telt als fout. De test gebruikt Request/Response-objecten en roept de handler direct aan, zonder webserver. Geen PACKS-login, token, product-/labelopvraag, boeking, mail, betaling of Tikkie-koppeling uitgevoerd. Het bestaande integratieschema wordt uitsluitend in de lege fictieve SQLite-opslag geïnitialiseerd; geen echte migratie.

SQL/CAS en encryptie worden via de bestaande integration-store met een lokale SQLite-adapter beproefd. Dat is geen echte Cloudflare D1-/edge-/multi-regio-proef. De herstartproef bestrijkt intentieopslag, geen providerrequest dat tijdens een crash doorgaat. Er is geen verstreken externe lease, provider-timeout, GetLabels, meer-colli-PDF, echte bestandsprojectie, volledige back-uprestore of schermbediening beproefd. Die onderdelen blijven expliciet open.

## Status

Lokale verificatie van de huidige voorbereiding/registerbasis afgerond binnen deze afbakening. Volledige batch3 **gedeeltelijk/alleen lokaal**, hoofdtaak doing/local. De PK-contractantwoorden, concrete providerclient/uitvoering/herstel, gecontroleerde kostenvrije testomgeving, schermbeoordeling en afzonderlijke liveactivering blijven nodig. Bouwlog via scripts/build-task.mjs, geen feedback/gebruikersstatus afgehandeld. Cacheketen `packs-local-verified-20261030` voor de broncorrectie.

Los hiervan vroeg gebruiker naar bestaande live Tikkie-links. Alleen eerdere gepubliceerde bron en officiële openbare ABN AMRO-documentatie gelezen, buiten het testproces; geen Tikkie-betaalverzoek aangemaakt/betaald/opgevraagd en geen uitbetalingsrekening bevestigd. Dat onderzoek is geen PACKS-test of Tikkie-werkingstest. De aparte online-orderlijstherstelkandidaat blijft ongepubliceerd; de publicatievraag staat open.
