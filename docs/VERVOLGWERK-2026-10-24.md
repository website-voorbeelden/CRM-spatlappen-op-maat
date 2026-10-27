> Actueel24oktober: beide CRM’s gepubliceerd als crm-analytics-notifications-20261024; servermeldingen actief na expliciete toestemming. Automatische betaalprovidercontrole uit. Toestelopt-in en fysieke gebruikerscontrole nog nodig. Geen functionele tests uitgevoerd. Zie bovenaan OVERDRACHT.md; oudere lokaal/geen-activeringpassages zijn historische momentopnamen.

# Vervolg na de vier batches — 24 oktober 2026

Opdracht: de genoemde resterende werkpunten bouwen. Eén bron voor beide bedrijven, bestaande data en gebruikerswerk behouden. Philippe test zelf: geen tests, syntaxchecks, browser-QA of exportproeven. Publicatie en activering worden apart in OVERDRACHT vastgelegd.

## Aanvraag en productspecificaties

Handmatige Aanvraag herkennen toont één controle per product. shared/request-products.js herkent alleen expliciete Product/Artikel/Onderdeel-blokken of genummerde/bulletregels met aantallen en productwoorden, maximaal40. Geen gok op alinea’s. recognizeRequest leest elk blok afzonderlijk; materiaal/dikte/maten worden nooit tussen blokken gekopieerd. Je kunt handmatig een product toevoegen of een blok bewust uitvinken. Bronmail blijft beschikbaar. Eén onbekend productaantal kan als bestaand enkel aanvraagconcept; meerdere echte productregels vereisen ieder een bewust ingevuld aantal. Geen fictief aantal1, prijs of leverancier. Ook formuliermails met meerdere herkenbare blokken gaan door deze handmatige controle; automatische intake wordt niet uitgebreid of stil geactiveerd.

De transactie maakt één klantkoppeling/aanvraag/thread met aparte productregels en bestaande dedup/bron-/klant-/gesprekscontrole. Bestaande klantvelden blijven behouden. Maatwerkkunststof bewaart vorm/diameters/dikte/materiaal gestructureerd; bedragen blijven onbekend. Bronmarkering alleen bij een uniek passend productblok. Gewone enkelvoudige intake blijft bruikbaar.

De mailchecklist krijgt productgebonden sleutels veld@productID en noemt precies het product in de vraag. Basis bevat productnamen/maten, zodat een oude checklist niet stil bij gewijzigde producten geldt. Body/inleiding/afsluiting blijven bewerkbaar, bewaren per bedrijf/order blijft expliciet; geen verzending. Vrije complexe tekst en bijlagen worden niet door deze regelherkenning opgelost. Gebruikerscontrole open.

## Website-analytics

Hoofdrapport telt alle gemeten pagina’s, niet alleen home. Paginafilter bindt exact in SQL, koppelt bij een geselecteerde pagina uitsluitend leads met bijbehorend bezoek. Alle pagina’s bevat ook aanvragen zonder bezoektoestemming; labels leggen dit verschil uit. Testuitsluitingen werken via bestaande exacte IDs in alle perioden. Paginanamen hebben een begrensde veilige notatie, geen querystrings/e-mailvelden als filter. Vrijwillige feedback blijft sitebreed en wordt niet als paginafeedback voorgesteld. Dit maakt geen nieuwe meetdatabase, sessiecollector of tracking aan. Volledige doorlopende sessies en aansluiting op de Maatwebsite vereisen afstemming met de andere daar actieve AI; vraag staat bij Philippe. Eigen bedrijf/meetbinding blijven vereist, onbekend is geen nul.

## AI via laptop

shared/laptop-origins.js is de vaste gedeelde allowlist voor client en helper: de twee crm-customdomeinen plus eigen pages.dev en lokale origins, strikt per bedrijf. Geen wildcard/tunnel of toegang tot elkaars bedrijfsdomein. Bestaande popupbron-/origincontrole, browserbevestiging, sessieverval/ontkoppelen en cloudplanreview blijven leidend. Lokale hulpdienst opnieuw gestart omdat geen proces luisterde op3010/3011/3030. Startup is geen functionele AI-proef; Philippe koppelt vanuit de online Agent zelf. Geen providerinferentie of aanmelding uitgevoerd.

## Calculator V2

Dezelfde centrale opslagfacade nu bruikbaar voor order/klant; bedrijf, expliciete online runtime.features.costingV2 en niet-offline-review vereist. Bestaande prijs-/aantal-/factuur-/totaalprijs-/bronconflictguards behouden, overname blijft gecontroleerd. Cloudfeedback gebruikt bestaande feedbacktransactie; lokaal bestaande privédienst. Geen nieuwe dataopslag of eigen netwerkdatabase. V1 blijft ongewijzigd.

buildPages krijgt expliciete includeCostingV2-optie, standaardfalse, alleen Maat. Publieke runtime noemt capability alleen als assets zijn meegeleverd. Orderingangen lezen de runtime en bieden dan V2; originele V1 blijft apart bruikbaar. release ondersteunt --with-costing-v2 en de bewust vastgelegde targetcapability voor volgende updates. CAD/STEP/WASM en complexe productiegeometrie niet functioneel gecontroleerd. Dit is geen CAM-/productiegarantie.

## Telefoonmeldingen

scripts/activate-notifications.mjs toont standaard alleen het plan. --apply is een expliciete operatoractie: bestaande productieconfig/DBidentiteit, stoppen bij bestaande meldingssleutels (geen rotatie), beide bedrijven vóór eerste mutatie voorbereiden, D1-herstelpunt, uitsluitend migratie0005, eigen nieuwe VAPID/jobsecret per bedrijf, Pages met overige instellingen behouden, Worker eerst zonder cron, vervolgens secret/Pages en pas dan vijfminutencron. Sleutels alleen in procesgeheugen en beschermde tijdelijke herstelbestanden, nooit stdout of publiek pakket. Geen bestaande auth-/providerbestanden openen. Betalingspollflag blijft zoals eerder ingesteld; deze actie schakelt hem niet nieuw in. Nieuwe ontvangsten in CRM kunnen na toestelopt-in melden, geen automatische mail/factuur of productievrijgave.

De operatoractie registreert na succesvolle activering pushEnabled/pushSubject/costingV2 in de lokale doelconfig, zodat de normale releasehelper ze bij volgende updates behoudt. Bij gedeeltelijke fout stopt hij met een beschermd herstelverslag; niet blind opnieuw draaien of sleutels overschrijven. Phone opt-in blijft altijd van Philippe; geen echte testpush/providerbetaling uitgevoerd.

## Actuele uitvoerstatus

Lokale diensten gestart, planmodus van de installer uitgevoerd. Gecombineerde --apply-uitvoering vóór processtart geweigerd door automatische goedkeuringsreview wegens onvoldoende specifieke autorisatie voor de blijvende productieactivering. Expliciete gebruikersvraag staat open; geen workaround, geen cloudmigratie/secret/Worker/Pageswijziging. Deze ronde blijft lokaal, online nog vorige release. Een tweede vraag betreft afstemming van de websitecollector met de andere AI. Geen feedback afgehandeld gemarkeerd.
