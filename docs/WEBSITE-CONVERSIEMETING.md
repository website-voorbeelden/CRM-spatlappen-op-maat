# Websitecode, sessies en conversiegegevens

Wens vastgelegd op 19 oktober 2026. Dit document is een concreet uitbreidingsontwerp, geen actieve trackingfunctie, publicatie of privacygoedkeuring.

## Waar de actuele code staat

Website: https://github.com/website-voorbeelden/spatlappen-op-maat . CRM: https://github.com/website-voorbeelden/CRM-spatlappen-op-maat . Dit blijven twee projecten met eigen publicatie; de website is niet in de CRM-repository overgezet.

Bewerkbare websitebron: <lokale-projectmap> . Hoofdpagina index.html, stijl site.css, formulier/oudere herkomsthulp site.js, optionele gedragsmeting analytics.js, contactroute functions/api/contact.js, publieke meetinvoer lib/analytics.js en functions/api/analytics.js. CRM-rapport cloudflare/site-analytics.js en admin/analytics/website.js.

De actuele live website is volgens het releasebewijs rechtstreeks via Cloudflare gepubliceerd; laatste release website-cookiebar-20261018, deployment f1c2aed4. GitHub is bij die publicaties niet gesynchroniseerd. Op 19 oktober alleen-lezen GitHubbron opgevraagd: index.html in website-repo aanwezig, analytics.js op defaultbranch niet gevonden (404); CRMREADME in andere repo aanwezig. Geen live websiteprobe of functionele test gedaan. Lokale websitecheckout staat op basis715a5d2 met onopgeslagen wijzigingen/nieuwe bestanden; niet blind resetten of vervangen door oude GitHubmain. Eerst bron, huidige remoteversie en gebruikte live release samenbrengen vóór een geautoriseerde Git-/Pagespublicatie. Geen secrets, meet-/klantdata of .local kopiëren. Publicatiebuild npm run build/output public plus bestaande Functions/lib en bindings behouden.

## Wat er nu daadwerkelijk is

- Gedragsdatabase: per paginalaad een willekeurig visit-ID alleen in geheugen, met toestemming; actieve tijd, scroll-/formuliervlaggen en contactklikken. Geen stabiel bezoeker-ID of echte doorlopende sessies. Het label paginabezoek is correct; unieke personen/sessies niet afleiden uit rijenaantal.
- De oudere site.js heeft eerste/laatste herkomst, eerste datum en een teller op localStorage/sessionStorage-niveau. Dat is geen goed gedefinieerde 30-minutensessie en geen servergevalideerde bezoekhistorie.
- Contactroute leest oudere herkomstvelden maar de huidige aanvraagmail geeft Herkomst en Aanvraag-ID door, niet een compleet sessieprofiel. De aparte site_leads-tabel bewaart aanvraag-ID, tijd, optioneel visit-ID en vaste broncategorie.
- CRM bewaart een exact herkend websiteLeadId bij een nieuwe aanvraag; algemene rapportage koppelt daarmee cohorten aan huidige offertestatus/volledige betaling. Nog geen individueel Conversie-tabblad met bezoektraject of betrouwbare sessies-tot-conversie.
- Cookiekeuze blijft nu lokaal. Er is nog geen centrale teller voor accepteren/weigeren. Een ontbrekende visit-koppeling is geen bewijs van weigering: ook blockers, ontbrekende keuze en meetfouten kunnen ontbreken veroorzaken.

Bronaandacht vóór uitbreiding: populateCampaignFields beschermt browseropslag met analyticsAllowed, maar vult enkele actuele URL-/herkomstvelden en de standaard session_count=1 ook zonder die toestemming. De server accepteert die aangeleverde velden los van analytics_consent. Dit mag niet als een betrouwbare toestemmingsgebonden sessiesnapshot worden hergebruikt. Consentpad voor alle optionele attributie eerst consistent maken; bij weigering/ontbrekende toestemming geen sessieteller1 als schijnbaar bekend feit, geen advertentie-ID of bezoekprofiel koppelen. Bestaande noodzakelijke contactverwerking/aanvraag-ID blijft werken.

## Gewenste meetbegrippen

| Metric | Voorstel en grenzen |
|---|---|
| Cookiekeuzes | Afzonderlijke dagtotalen accepteren/weigeren/intrekken, zonder bezoeker- of sessie-ID, klantkoppeling of herkomstprofiel. Dit zijn keuzes, geen unieke mensen. Beoordeel vooraf informatieplicht/grondslag en bewaarbeleid; geaggregeerd is geen automatische vrijstelling. |
| Unieke bezoekers | Alleen gemeten, toestemmende browsers per gekozen periode. Opaque first-party browser-ID na toestemming; geen claim unieke mensen of automatische herkenning over apparaten. Bij wissen/intrekken begint geen verborgen vervangende identiteit. |
| Sessies | Nieuw na 30 minuten inactiviteit; paginawisseling/herladen/tweede tab binnen de actieve sessie niet automatisch nieuw. Eén definitie voor browser, ingest en rapport; versie en meetbegin vastleggen. Sessies kunnen meerdere pagina’s bevatten. |
| Sessies tot aanvraag | Aantal daadwerkelijk gemeten sessies van dezelfde browser tot de door de contactserver geaccepteerde aanvraag. Bij aanvraag vastzetten met bron/periode en meetvolledigheid; niet later laten oplopen. Geen terugwerkend raden uit oude teller. |
| Tijd tot aanvraag | Gemeten eerste bezoek tot geaccepteerde aanvraag, met expliciet meetbegin. Onbekend of onvolledig als de werkelijke eerste bezoeken niet waargenomen zijn. |
| Aanvraag → order/betaald | Afzonderlijke zakelijke conversies uit het CRM. Aanvraag, offerte/akkoord en betaald niet door elkaar halen. Volledig betaald alleen met bekende totale prijs/verzending en werkelijk geregistreerde betalingen. Geen verkoop op basis van een klik, concept, nulprijs of stage alleen. |
| Sessies tot betaalde order | Alleen later toevoegen met nog geldige toestemming, aantoonbaar gekoppelde vervolgbezoeken en een betrouwbare betaalconversietijd. Dit is iets anders dan de vastgezette sessies tot aanvraag. Geen historische betaaldatum afleiden uit uitsluitend de huidige prijs/status; correcties/terugbetaling apart houden. |
| Bron en campagne | Eerste gemeten bron, laatste gemeten bron voor de aanvraag en bekende UTM-campagne. Direct of onbekend onderscheidbaar. Geen exact Google-zoekwoord per persoon uit Search Console suggereren. |
| Conversiepercentage | Expliciete noemer: gemeten sessies/browsers met toestemming. Alle ontvangen aanvragen en betalingen apart tonen; geen alle-aanvragen/gedeeltelijk-gemeten-bezoekers als volledig sitepercentage presenteren. |

Geen identificatie via fingerprint, IP-hash of e-mailadres als omweg. Sessies van andere apparaten, gewiste opslag, weigering of oudere ongemeten bezoeken blijven onbekend. Gedeeltelijk waargenomen sessies als 'minstens N gemeten sessies sinds [datum]' in plaats van exact N totaal. Geen retrospectieve historische sessies verzinnen.

## Tab Conversie bij klant en order

Ordertab: vaste aanvraag-IDkoppeling, bron/campagne waar toegestaan, meettoestemming/beschikbaarheid met reden, eerste gemeten bezoek, sessies tot aanvraag, tijd tot aanvraag en een korte tijdlijn aanvraag/offerte/akkoord/betaling met echte bronnen. Onbekende metrics blijven onbekend met korte uitleg. Geen extra financiële opslag of aanpassing van de order door de weergave.

Klanttab: overzicht van conversiegegevens van diens bestaande orders, met deduplicatie per aanvraag-ID. Eén klant kan meerdere aanvragen en apparaten hebben; niet alles als één browserprofiel samenvoegen. Geen verborgen automatische koppeling van anonieme bezoeken via e-mail of telefoon. WhatsApp/belklik blijft contactklik; een ontvangen aanvraag via die route pas koppelen met expliciete bron/referentie.

Gedrag en sessies blijven in de aparte meetdatabase. Alleen bestaande aanvraag-ID verbindt de aanvraag met het orderdossier. Individuele rapporten via beveiligde CRM-route die bedrijf en de bijbehorende order controleert; geen publieke leesroute of bezoeker-ID in normale zoekresultaten/AI-export. Betalingen blijven uitsluitend bestaande financiële records; de conversieweergave leest deze.

## Volgorde om te bouwen

1. Actuele websitebron veilig met de aparte website-repo samenbrengen als concrete reviewbare wijziging, zonder automatische publicatie. Publicatiestatus en bronstatus apart houden.
2. Eerst het bestaande toestemmingspad en onbekende oudere teller consequent behandelen. Geweigerde keuze mag geen gedrags-/campagneprofiel activeren. Privacy- en cookietekst moet de eventuele koppeling aan de ingediende aanvraag uitleggen; huidige tekst 'geen namen' betekent niet dat een later gekoppeld profiel anoniem is.
3. Versie2 van sessie-/bezoek-/aanvraagcontract, met opt-in browseridentiteit, 30-minutensessies, intrekken/wissen, begrensde opslag en migratie uitsluitend van de aparte meetdatabase. Bestaande rijen behouden als paginabezoeken; geen identiteiten terugvullen.
4. Server accepteert aanvraag en bewaart één bevroren meet-/herkomstsnapshot op het exacte lead-ID; retries/dubbele events/meer tabs/meer aanvragen worden afzonderlijk behandeld. Een meetfout veroorzaakt nooit een tweede mail of een mislukte goede aanvraag.
5. Eerst rapportages voor unieke gemeten browsers, sessies, sessies/tijd tot aanvraag en duidelijke dekking; daarna het individuele Conversie-tabblad en betaalconversies. Zo blijft duidelijk wat wel/niet waarneembaar is.
6. Vóór activeren: toestemming/infoteksten en bewaarbeleid passend maken. Gerichte tests/gebruikstest pas op expliciete gebruikersopdracht; gebruiker heeft zelf testen voorbehouden. Geen nieuwe meetdatabasevelden of tracking live zonder concrete releaseopdracht.

Bronnen voor toestemmingsontwerp: https://autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/heldere-en-misleidende-cookiebanners en https://autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/trackingcookies . Deze bronverwijzingen zijn geen claim dat de voorgestelde uitbreiding al juridisch beoordeeld of actief is.

## Eigen tests uitsluiten — lokale implementatie 19 oktober 2026

CRM state.analyticsExclusions bevat expliciete testadressen en aanvraag-ID’s. Adressen bepalen uitsluitend bekende klant/orders, geen koppeling van anonieme personen. De beschermde rapportageroute leest dezelfde bedrijfsstate en filtert exact de lead-ID’s én hun gekoppelde paginabezoeken vóór alle sommen, grafieken, vergelijkingen en cohorttellingen. Dossiers en meetbronnen blijven bewaard; uitsluiting verwijderen maakt historische bewaarde bronnen weer meetellend. Financiën/btw ongewijzigd. Nog niet geïmporteerde mail: exact Aanvraag-ID invoeren. Oude anonieme bezoeken/feedback niet te identificeren.

Website ?analytics=exclude zet een lokale boolean, include verwijdert deze. Geen stabiel bezoekers-ID. Bij geblokkeerde opslag alleen huidige tab en duidelijke melding. Interne browser stopt eigen gedragsposts en meetleadregistratie; aanvragen blijven via bestaande contactroute werken. Interne testmarkering in aanvraagmail voor normale CRM-intake. Geen effect op Search Console/GA4/Cloudflare Web Analytics. Website en CRM alleen lokaal gewijzigd; niet getest/gepubliceerd, echte instellingen niet ingevuld.

## Deelstap 21 oktober 2026

Zie WEBSITE-DOSSIER.md voor de nu lokaal gebouwde dossiertabs, expliciete contactregistratie, pagina→aanvraag en optionele stappenopslag. Dit vervangt de oude claim dat er nog helemaal geen dossiertab bestaat. Het bovenstaande volledige sessieontwerp blijft vervolgwerk; geen unieke browsers/sessies, live migratie of publicatie gebouwd/uitgevoerd. Oudere meetkeuze wordt niet stilzwijgend gebruikt voor persoonlijke bezoekdetails.
