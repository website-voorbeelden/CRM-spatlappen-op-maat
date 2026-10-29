> Batch3vervolg29oktober: factuurrevisie bewaakt ook veranderende orderontvangsten; actieve btw-boeking blijft blokkeren. Eigen toelichting en geselecteerde ontvangstvermelding apart, actualiseren betaalstand alleen bewust. Eventueel geladen nieuw ordertarief bewaart passende actuele afwijkingsreden. Geen btw-boeking/correctie/aangifte gewijzigd; zie FEEDBACK29-BATCH3-VERVOLG.md. Lokaal, geen tests/conversie/browsercontrole/publicatie.

> Aanvulling29oktober: aparte purchase.importVat/importVatRecoverable en bewijsreferentie voor kosten-/uitgavenweergave; geen tweede fiscale boeking. Oudere uitspraak dat er geen btw-veld op de zending is, is hiermee vervangen. Bestaand vatLedger blijft de kwartaal-/bewijsadministratie. Zie INKOOP-INVOER-BTW.md; lokaal bronwerk, eigen controle open.

> Aanvulling28oktober: gekoppelde zending en werkelijk betaalde btw met datum/betaalbewijs in dezelfde boeking; vanuit inkoop terugvinden/bewerken. Meta-informatie verandert geen aftrek-/kwartaalsom of kostprijs. Leverancierrecord + uploads één bron; bestaande file:-boekingen als alias behouden, geen migratie. Historische offerteboekingen krijgen controlepunt. Zie FEEDBACK-BATCH2-20261028.md; lokale bronreview, eigen controle en publicatie open. Geen tests/checks/build/browsercontrole of fiscale beoordeling.

# Btw-voorbereiding per kwartaal

Lokale bron gebouwd op 19 oktober 2026. **Niet getest, gebouwd voor publicatie of gepubliceerd.** Philippe bevestigt op 19 oktober opnieuw dat hij zelf test. De fictieve proeven in tests/vat-ledger.mjs zijn alleen klaargezet en niet uitgevoerd.

## Afspraken met Philippe

- Spatlappen en Maatwerkkunststof hebben **aparte btw-administraties**. De werkplek gebruikt uitsluitend de actieve bedrijfsstaat. Geen samenvoeging of lezen van de andere database.
- Het gebruikte btw-stelsel is nog niet bekend. De inrichting blijft daarom **Nog vaststellen**; de software kiest geen factuur- of kasstelsel namens de ondernemer.
- Een voorbereiding is geen aangifteverzending. Geen fiscale beoordeling, providerkoppeling of wijzigingen bij de Belastingdienst.
- Bestaande orders, betalingen en documenten blijven behouden. Er is geen automatische gegevensmigratie uitgevoerd.

## Waar te vinden

Analytics → Btw (`#analytics/vat`), met vier onderdelen:

| Onderdeel | Route | Doel |
|---|---|---|
| Kwartaal voorbereiden | #analytics/vat/quarter | Gecontroleerde rubrieken, open controles en vaste voorbereidingskopie |
| Bronnen & boekingen | #analytics/vat/sources | Nieuwe bronnen controleren, concepten, correcties en bewijs |
| Afwijkende btw | #analytics/vat/exceptions | Bestaande ordercontrole met redenen/herbruikbare eigen redenen |
| Inrichting | #analytics/vat/settings | Ondernemer, btw-nummer, stelsel en artikel23 |

De oude ordercontrole filtert op aanvraagdatum. De kwartaalvoorbereiding gebruikt de **expliciet gecontroleerde btw-datum van de bronboeking**, niet de orderdatum. Het huidige kwartaal volgt de bedrijfskalender van de app; kies via Kwartaal kiezen een ander kwartaal.

## Bronroute

1. Gegenereerde definitieve klantfacturen komen als kandidaat uit hun bewaarde `generated.payload`, niet uit de actuele orderprijzen. PDF en Word van dezelfde factuur worden één bron. Twee verschillende gegenereerde bronnen bij hetzelfde order-/factuurnummer vormen een blokkade; er wordt niet zomaar één gekozen. Offertes, proforma’s, pakbonnen en ontwerpvoorbeelden worden niet als omzetfactuur geïmporteerd.
2. Bedrag en tarief uit een bewaarde factuur leveren een **voorstel** voor een boeking. 21% en9% krijgen een bijpassende voorstelrubriek; andere percentages blijven een expliciete keuze. Geen boeking telt zonder persoonlijke controle.
3. Geüploade facturen en echte leveranciersfactuurregistraties komen apart in de controlebak. Btw wordt niet geschat uit kosten, marge, landen of betalingen. Een leveranciersofferte is geen inkoopfactuur. Voor NL-aftrek/invoer wordt het echte bewijs ingevuld en gekoppeld.
4. Bij kasstelsel staan geregistreerde klantontvangsten klaar. Hun btw-splitsing moet exact aansluiten op de werkelijke ontvangst. Verkoopfacturen worden niet daarnaast automatisch omzet in hetzelfde overzicht.
5. In factuurstelsel blijven ontvangsten apart bereikbaar onder Andere bronnen / vooruitbetalingen. Vrijwillige vooruitbetalingen en andere uitzonderingen vragen een expliciete boeking/toelichting en aansluiting met latere facturatie; geen automatische verdeling of saldering over facturen.
6. Boekhoudgegevens buiten dit CRM kunnen handmatig met controleerbaar bewijs worden ingevoerd. Het programma haalt geen Exact-, bank- of Belastingdienstgegevens op.

## Boeken en bewijs

Een boeking bevat bronreferentie, tegenpartij, bron-/ontvangst-/btw-datum, optionele verklaring voor een afwijkend moment, kredietverwijzing, één of meer btw-regels en bewijs. Bedragen zijn EUR en gehele centen. De financiële bron is leidend; buitenlandse valuta moeten eerst aantoonbaar naar EUR zijn omgerekend. Er is geen valutaconversie-engine.

Bij een factuur met meerdere tarieven kunnen maximaal twintig regels in één boeking worden opgenomen. Eén bron kan maar één actieve boeking hebben. Een extra controle op documentnummer/tegenpartij/jaar voorkomt dubbele registratie onder een andere bronkey. Contante/ontvangstboekingen hebben hun eigen echte betaalbron; dubbeltelling met andere facturen wordt niet automatisch fiscaal opgelost.

Een extra kopie van een al gecontroleerd bewijs kan expliciet gekoppeld worden aan de oorspronkelijke boeking. Alleen nulbedragen buiten aangifte zijn dan geldig, met toelichting en hetzelfde documentnummer/tegenpartij. Kopieën van kopieën en ongeldige oorspronkelijke boekingen worden geweigerd. Geen origineel bronbestand hoeft hiervoor verwijderd te worden.

Een nieuw PDF/PNG/JPG-bronbestand (max15MB) en de boeking worden samen in de bestaande state/files-transactie bewaard. Bestaande bronbestanden blijven bij hun originele eigenaar; metadata verwijst ernaar. Een externe boekhoudmap/douanereferentie is ook mogelijk, mits controleerbaar ingevuld en de bron persoonlijk bevestigd is. Geen OCR, automatische bewijswaardering of uitlezen van echte documenten tijdens implementatie.

**Concept** is een echte aparte status: onvolledige of nog niet gecontroleerde boekingen tellen niet mee in het gecontroleerde deel. Kies Gecontroleerd opnemen en bevestig de relevante controles om de boeking mee te laten tellen. Wijzigen van bedragen/datum/classificatie wist de algemene bron-/periode-/aftrekvinkjes in het formulier. Bij een gewijzigde CRM-bron vervallen ook eerdere broncontroles bij heropenen.

## Rubrieken en rekenroute

Beschikbaar:1a,1b,1c,1d,1e,2a,3a,3b,3c,4a,4b,5b en Buiten deze Nederlandse aangifte. De gebruiker kiest de rubriek; klantland of een0%-order bepaalt die niet automatisch.1c is een bijzondere rubriek en geen verzamelplek voor buitenlandse btw. Vrijgesteld en buitenlandse btw worden niet automatisch als1e of5b behandeld.

- Verschuldigde btw: som van de gecontroleerde btw in1a/1b/1c/1d/2a/4a/4b.
- Voorbelasting: het expliciet ingevulde aftrekbare deel in2a/4a/4b/5b. Bij verlegde inkoop kan één regel dus beide kanten bevatten; die aftrek niet nogmaals als losse5b-regel boeken.
- Credits worden met positieve bronbedragen ingevoerd en met het creditkenmerk afgetrokken. Er is een verwijzing naar de oorspronkelijke factuur nodig. Dit maakt geen creditfactuur of bankterugbetaling.
- Nulrubrieken1e/3a/3b/3c hebben geen btw-bedrag. Buiten aangifte telt niet mee in verschuldigd/voorbelasting.
- Deel-aftrek is mogelijk: het aftrekbare bedrag mag niet groter zijn dan de bron-btw. Zakelijk gebruik/aftrekrecht blijft een bevestigde gebruikerscontrole.
- EU-leveringen vragen btw-ID, geldigheid, leverings-/dienstbewijs en ICP-controle. Uitvoer vraagt uitvoerbewijs.3c vraagt afzonderlijke controle van buitenlandse/OSS-verwerking.
- Invoer vraagt controle van bewijs en importeur. Invoer via4a met artikel23 vereist expliciet bevestigde vergunning en passend bewijs. Gewone betaalde invoer-btw kan met het eigen invoerbewijs als5b worden voorbereid. Een Turkse leveranciersprijs bewijst geen Nederlandse voorbelasting.

Dezelfde pure optelling wordt gebruikt voor het actuele overzicht en voor validatie van bewaarde voorbereidingen. Gemengde tarieven, credits en verlegde aftrek blijven in centen traceerbaar. Geen automatische euroafronding in de bronboekingen; bij overnemen in de aangifte de actuele afrondingsregels volgen.

## Kwartaalcontrole

Het overzicht toont het **gecontroleerde deel** zolang er open controles zijn. Geen definitieve nul-aangifte op basis van ontbrekende gegevens. Het bewaren van een gecontroleerde voorbereiding wordt geblokkeerd bij:

- onbekend stelsel/aangiftegrens of ontbrekende ondernemersnaam/btw-nummer;
- concepten/ongeldige boekingen in dit kwartaal;
- gewijzigde of ontbrekende bronnen/bewijsbestanden;
- onverwerkte bronnen uit het kwartaal;
- bronnen/boekingen zonder geldige datum, waarvan het kwartaal dus nog onbekend is;
- ontbrekende toepasselijke fiscale bewijscontroles.

Een bron in een verplaatst concept wordt niet stil uit het oorspronkelijke kwartaal weggefilterd: alleen een geldige gecontroleerde boeking vertegenwoordigt de bron. Voor bewaren is daarnaast expliciete bevestiging nodig dat de **hele btw-administratie** is opgenomen en aangesloten, inclusief overige boekhouding, privégebruik, vooruitbetalingen en correcties. Die bevestiging bewijst geen fiscale juistheid; er is geen volledige bank-/grootboekreconciliatie of automatische ICP/OSS-opgaaf.

## Bewaren, correcties en export

Bewaren maakt een vaste kopie van de gecontroleerde boekingen, inrichting, rubriektotalen en bronbasis. De UI overschrijft oudere voorbereidingen niet. Na wijzigingen wordt zichtbaar dat een eerdere voorbereiding niet meer op de huidige bronbasis aansluit. Dat is geen automatische suppletie en geen bewijs dat er eerder aangifte is gedaan. De bronbasis reageert conservatief ook op wijzigingen buiten het gekozen kwartaal.

Gecontroleerde boekingen wijzigen vraagt een nieuwe wijzigingsreden; vorige revisies blijven in de historie. Uit een actuele voorbereiding halen is apart bevestigd en gelogd; het bronstuk kan daarna weer onverwerkt zijn. Het algemene Stap terug maakt een wijziging in het btw-register niet ongedaan en wist bij zo’n wijziging de sessiegeschiedenis. Corrigeer via de btw-werkplek. Documenten en orders met actieve btw-/voorbereidingsverwijzingen worden via de normale verwijderbediening beschermd; archiveren blijft mogelijk. Dit is applicatiebescherming, geen onveranderlijk extern archief: een expliciete volledige back-uprestore of beheeractie kan de administratie vervangen.

Exports:

- Concept-CSV met alle kwartaalboekingen, met hun status en bronverwijzingen.
- Concept-JSON met controles en totalen.
- CSV en volledig JSON-dossier van een bewaarde voorbereiding, inclusief oude versies.

CSV-tekstvelden zijn tegen spreadsheetformules afgeschermd. Werkelijke negatieve creditbedragen blijven numeriek. Bronbestanden worden niet in CSV/JSON opgenomen; bewaar ze naast de export of download ze via de bronknoppen. Een download is geen aangifteverzending en geen gegarandeerd compleet accountantsdossier buiten de app.

## Techniek en grenzen

- `shared/vat-ledger.js`: bronprojectie, boekingen, validatie, controles, optelling en voorbereidingen.
- `shared/supplier-invoices.js`: bestaande pure bronselectie uit admin/purchases/costs.js verplaatst; oude export blijft compatibel.
- `admin/analytics/vat-quarter.js`: kwartaal-, bron- en inrichtingsschermen via bestaande live context.
- `admin/analytics/vat-entry.js`: formulier en atomair bewaren van boeking/bewijs.
- `admin/analytics/vat-layout.js`: gedeelde btw-navigatie; `vat.js` blijft de orderafwijkingencontrole.
- `state.vatLedger`: bestaand bedrijfsstate-record, geen nieuwe store/migratie. Bestaande back-ups nemen het veld mee; de gedeelde state-validator controleert aanwezige registers en opgeslagen totalen.

Grenzen:20k boekingen,20regels/20bewijsverwijzingen per boeking,100revisies per boeking en1000voorbereidingen, plus bestaande staat-/string-/uploadgroottelimieten van het CRM. Geen optimalisatie voor grote boekhoudvolumes. Niet ondersteund als automatische dienst: aangifte/ICP/OSS indienen, suppleties bepalen, VIES-opvragen, fiscale vergunningen controleren, grootboeksync, buitenlandse belastingteruggaaf, boeken in andere valuta en volledige kas/bankreconciliatie. Rubriekkeuze en uitzonderingen vragen passende boekhoudkundige/fiscale beoordeling vóór echt gebruik.

## Wat daadwerkelijk is uitgevoerd

Broncode en documentatie gewijzigd. **Geen tests, syntaxchecks, builds, browser-QA, publicatie, GitHubpush, echte gegevensmutaties of provider-/mail-/Gmailacties.** tests/vat-ledger.mjs bevat uitsluitend fictieve scenario’s en is niet uitgevoerd. Philippe heeft de weigering van automatisch testen opnieuw expliciet bevestigd. Runtime-bouwlog is niet bijgewerkt. Dit is lokale implementatie voor eigen beoordeling, geen gecontroleerde productie-release of goedgekeurde fiscale inrichting.

Gerichte gebruikerscontrole vóór echt gebruik: eigen stelsel vaststellen, ondernemersgegevens invullen, één gewone factuur, gemengde tarieven, een credit, NL-inkoop, een EU-uitzondering en invoerbewijs doorlopen; kopie niet dubbel tellen; concept niet laten meetellen; bewijsdate over kwartaalgrens; voorbereiding bewaren en daarna bron wijzigen; CSV/JSON naast de eigen boekhouding leggen. Gebruik daarvoor eerst fictieve administratie.

## Officiële bronnen (geraadpleegd 19 oktober 2026)

- [Factuurstelsel, uitzonderingen en vooruitbetalingen](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aangifte_doen_en_betalen/bereken_het_bedrag/hoe_berekent_u_het_btw_bedrag/factuurstelsel)
- [Kasstelsel](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aangifte_doen_en_betalen/bereken_het_bedrag/hoe_berekent_u_het_btw_bedrag/kasstelsel/)
- [Rubrieken uitgelegd door Belastingdienst, bijgewerkt21september2026](https://stichtingenvereniging.belastingdienst.nl/aangifte/aangifte-omzetbelasting/invullen-rubrieken/), algemene rubriekopbouw; specifieke stichtingsregels niet op deze bedrijven toegepast.
- [Btw-bedrag afronden](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/btw-bedrag_afronden)
- [Welke administratie nodig is](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/wat_administreert_u_voor_de_btw/)

De2025toelichtings-PDF uit zoekresultaten gaf bij directe raadpleging404 en is niet als actuele2026regels geïmplementeerd.
