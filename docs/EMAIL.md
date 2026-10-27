# Gmail online: waarom een andere JSON? — 17 oktober 2026

Je blijft gewoon in je browser op de normale CRM-URL werken. Het verschil zit in de aanmeldroute: de lokale server gebruikt een Desktop-app-client (`installed`), de online server een Web-app-client (`web`). Maak een aparte Web-app-client in hetzelfde Google-project; verwijder je Desktop-client niet.

1. Open Google Cloud → Google Auth Platform → Clients → Nieuwe client → Web-app.
2. Voeg exact de terugkeer-URL uit het CRM toe. Op de huidige live URL is dat `https://spatlappen-crm.pages.dev/__local/assistant/gmail-callback`.
3. Download die Web-app JSON en upload/plak die bij Instellingen & back-up → Gmail-inbox. Vul je Gmail-account in en kies Google-instellingen opslaan.
4. Klik Gmail koppelen en rond zelf de Google-toestemming af.

De instelhulp en het paarse CRM-tabbladicoon staan live in release spatlappen-branding-gmail-20261017. De onderliggende Gmail-koppeling was al aanwezig; deze release verandert de uitleg. Er is geen clientbestand of Google-toestemming namens de gebruiker ingevoerd. Bij een ander CRM-domein moet de exact daar getoonde callback afzonderlijk geregistreerd zijn. De officiële [Web-server OAuth-uitleg](https://developers.google.com/identity/protocols/oauth2/web-server) beschrijft deze client- en redirect-inrichting.

# Online Spatlappen: mailinstellingen hersteld — 16 oktober 2026

De online installatie op https://spatlappen-crm.pages.dev/admin/#settings ondersteunt nu Gmail lezen en afzonderlijk SMTP2GO voor uitgaande mail. Gmail-inbox en E-mail & facturen staan bovenaan Instellingen & back-up. In de mailbox staat een directe link Gmail instellen. Lokale instellingen zijn niet naar de cloud gekopieerd: stel elke provider eenmalig online in. Maatwerkkunststof blijft lokaal.

**Gmail:** maak in je bestaande Google-project een OAuth-client van type Web-app. Voeg exact `https://spatlappen-crm.pages.dev/__local/assistant/gmail-callback` toe als geautoriseerde redirect-URI. Download de Web-app JSON, vul je Gmail-account in het online CRM in, upload/plak de JSON en sla op. Klik Gmail koppelen en open de getoonde Google-inlogpagina in dezelfde browser waarin je in het CRM bent ingelogd. Geef zelf alleen leestoestemming. De lokale Desktop-app JSON is hiervoor niet bruikbaar. Bij een eigen domein moet ook de redirect-URI voor dat domein expliciet in Google en in de opgeslagen configuratie kloppen.

Een extern Google-project met Audience/Doelgroep op Testing kan na zeven dagen opnieuw toestemming vragen. Naar In production/Publiceren gaan is een aparte keuze in Google Auth Platform; dat bewijst op zichzelf geen Google-verificatie. Er is bij deze CRM-update geen Google-project, doelgroep of toestemming gewijzigd. Bronnen: [Web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [Gmail-scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Google-doelgroep](https://support.google.com/cloud/answer/15549945).

**SMTP2GO:** vul de eigen API-sleutel en geverifieerde afzender uitsluitend in het online CRM in. De bestaande preview, aparte verzendbevestiging en bewuste keuze Klantverzending inschakelen blijven gelden. Er is tijdens ontwikkeling/publicatie geen echte testmail of klantmail verstuurd. De Gmail-koppeling verstuurt niets en verandert geen labels/berichten. Een SMTP2GO-mail verschijnt niet automatisch in Gmail Verzonden.

**Opslag:** cloudflare/gmail.js en cloudflare/mail.js gebruiken shared bedrijfsregels en integration-store.js. Providerconfiguratie, OAuth-verifiers/tokens en mailjournal zijn met AES-GCM versleuteld in aparte D1-tabellen. De unieke sleutel CRM_INTEGRATIONS_KEY staat als Pages-secret buiten de database en code. Niet vervangen/verwijderen bij een volgende publicatie: bestaande providerinstellingen worden anders onleesbaar. Gewone CRM-back-ups bevatten bewust geen providercredentials. Zowel databaseback-up als deze serversecret moeten beheerd behouden blijven; sleutelwaarden nooit in chat of GitHub. Bestaande login, D1, R2 en providersecrets zijn behouden.

De nieuwe routes vereisen de bestaande CRM-login, matching Origin en JSON bij wijzigingen. OAuth heeft PKCE, eenmalige state, sessie-/bedrijf-/configbinding en gecontroleerd mailboxadres. SMTP2GO gebruikt dezelfde bevestigings-/herhaalregels als lokaal, met een D1-lease voor gelijktijdige verzoeken. Providerfouten worden niet automatisch opnieuw verzonden. Status toont uitsluitend publieke instellingen. Details/tests in OVERDRACHT.md.

# SMTP2GO: facturen handmatig mailen

Gmail-uitbreiding is nu technisch voorbereid met een aparte backendbevestigingspoort; schrijftoegang en de Gmail-verzendadapter blijven uit. Er worden nog geen extra OAuth-rechten gevraagd. Zie [Gmail-toestemming en beveiliging](GMAIL-TOESTEMMING.md).

## Rechtstreeks vanuit de order versturen

De hoofdactie in E-mail voorbereiden is **Voorbeeld bekijken →**. Daarna toont hetzelfde venster de volledige mail, afzender, antwoordadres en PDF-bijlage, met **Versturen naar …**. Alleen die tweede klik biedt de mail werkelijk aan SMTP2GO aan. Concept opslaan voor later is een extra optie, geen verplichte tussenstap. De oorspronkelijke orderpagina en het tabblad blijven actief. Bericht aanpassen en annuleren van het voorbeeld keren terug naar dezelfde mail, inclusief tekst, ontvanger, bijlage, gekozen template, invulvelden en verzoek-ID.

Ontbrekende SMTP2GO-inrichting of uitgeschakelde klantverzending geeft **Hier e-mail instellen en terug naar mijn bericht**. De bestaande instellingen openen boven de mail, met de invoer in geheugen. Na compleet opslaan of teruggaan verschijnt dezelfde mail opnieuw. Geen navigatie naar het algemene instellingen-tabblad, geen automatisch versturen, geen API-sleutel in concept/back-up. De sleutel wordt gewist uit het invoerveld voordat het instellingenvenster sluit. Terwijl opslaan loopt kan dat venster niet worden gesloten. Een expliciete extra toestemmingskeuze zoals klantverzending wordt nooit automatisch aangevinkt.

## Gmail-gesprekken en Verzonden

De Gmail-koppeling en SMTP2GO zijn afzonderlijke functies. Een SMTP2GO-afzender of Cloudflare-doorsturing koppelt het Gmail-account niet automatisch aan dit CRM. Na de aparte Gmail-koppeling kun je bij een order een gesprek uit Gmail kiezen, de berichten controleren en dat gesprek bewust aan de order koppelen. Nieuwe Gmail-berichten worden op jouw verzoek opgehaald. De antwoordknop kiest het laatst beschikbare ontvangen bericht; de oorspronkelijke bericht-ID wordt waar beschikbaar als In-Reply-To en References meegestuurd. Je kunt de geadresseerde en tekst nog controleren vóór verzending. De CRM-versie van de mail blijft bij die order en dat gesprek.

Verzenden gebeurt nu rechtstreeks via de SMTP2GO-API. De Gmail-OAuth-koppeling heeft uitsluitend gmail.readonly en voert geen messages.send/messages.insert of andere schrijfactie in Gmail uit. Daarom verschijnt een CRM-verzending niet automatisch in jouw Gmail-map Verzonden, ook als dezelfde alias in Gmail bekend is. Ontvangen antwoorden komen via het ingestelde Reply-To en je bestaande routing binnen; haal ze daarna handmatig op om de CRM-kopie bij te werken. Bij gebruik van Gmail zelf via de webinterface bewaart Gmail zijn eigen verzonden mail; dat is een andere verzendroute dan het CRM.

Een latere Gmail-verzendroute of functie voor een bewaarde verzonden kopie moet apart worden gebouwd, met passende extra Google-toestemming en alias-/gesprekscontrole. Gmail kan berichten die via Gmail zijn verzonden of passend ingevoegd als SENT bewaren: https://developers.google.com/workspace/gmail/api/guides/labels . Verzend- en gespreksvereisten: https://developers.google.com/workspace/gmail/api/guides/sending . Dit is hier nog niet geïmplementeerd. SMTP2GO accepteert een mail voordat aflevering zeker is; de CRM-status aangeboden blijft dus geen afleverbevestiging.

Deze koppeling werkt voorlopig in de lokale CRM-versies. Je stelt haar eenmaal per bedrijf in op deze Mac; ChatGPT/Gmail-login is daarvoor niet nodig. De bestaande Gmail-SMTP-gebruikers worden niet gewijzigd. Bij latere cloudpublicatie moet de serverconfiguratie eenmalig afzonderlijk worden ingesteld. Privéinstellingen worden nooit met code naar GitHub gekopieerd.

## SMTP2GO instellen

1. Open Sending → Verified Senders. Controleer het domein spatlappenopmaat.nl; gebruik maatwerkkunststof.nl voor de andere CRM-versie. Als een domein al geverifieerd is, hoef je de CRM-alias niet apart te verifiëren. Is het domein nog niet geverifieerd, voeg uitsluitend de door SMTP2GO getoonde CNAME-records toe bij je DNS-provider.
2. Open Sending → API Keys → Add API Key. Maak een aparte sleutel, bijvoorbeeld CRM Spatlappen lokaal. Geef alleen de permissie /email/send; voor de andere bedrijfsversie een aparte sleutel.
3. Zet Open Tracking en Click Tracking uit. Gebruik status Allowed voor een echte testmail naar je eigen adres. Sandboxed verwerkt berichten maar levert ze niet af; ze verschijnen als Rejected in de activiteit en tellen nog mee in de verzendlimiet. Schakel geen marketingfooter in voor factuurmails.
4. Voer de sleutel uitsluitend in het lokale CRM in: Instellingen & back-up → E-mail & facturen. Deel hem niet in chat of GitHub.
5. Afzender voor Spatlappen: facturen@spatlappenopmaat.nl. Antwoorden naar: info@spatlappenopmaat.nl. Eigen testadres kan ook info@spatlappenopmaat.nl zijn. Vul voor Maatwerkkunststof zelf het juiste ontvangst-/antwoordadres in.
6. Klik Instellingen opslaan en Testmail naar mezelf. Controleer je inbox/spam en SMTP2GO Reports → Activity. Zet daarna in het CRM Klantverzending inschakelen aan en sla opnieuw op. Dit staat standaard uit.

SMTP2GO zorgt voor uitgaande verzending en maakt geen ontvangende mailbox aan. Wil je ook rechtstreeks mail ontvangen op facturen@spatlappenopmaat.nl, richt die alias bij je bestaande mailontvangst/doorsturing in. Een bestaand info-adres als Reply-To zorgt dat antwoorden daar binnenkomen. Het CRM biedt e-mail direct via de API aan; een bericht wordt daardoor niet automatisch in de map Verzonden van Gmail opgeslagen. Gebruik het CRM-verzendlog en SMTP2GO Activity.

Een geverifieerd domein mag volgens SMTP2GO vanaf geldige adressen van dat domein verzenden. De gratis variant ondersteunt maximaal vijf geverifieerde afzenders (domeinen en losse adressen samen); met twee geverifieerde bedrijfsdomeinen hoef je extra aliassen niet apart als sender te tellen. Dit is geen toezegging over gratis mailboxen of doorsturing. SMTP2GO-verzendlimieten blijven gelden en worden gedeeld met het bestaande Gmail-gebruik. De CRM-interface ondersteunt per bedrijf één standaardafzender plus maximaal zeven extra adressen van hetzelfde domein. Kies een standaardadres voor facturen uit deze adressen; bij ieder bericht kun je zelf een andere toegestane afzender kiezen. Een andere bedrijfskoppeling heeft eigen instellingen en sleutel.

## Factuur versturen

Registreer een ontvangen betaling en maak de gewenste PDF-factuur bij de order. Open bij de PDF E-mail voorbereiden. Controleer ontvanger, onderwerp, tekst en bijlage. Klik Voorbeeld & versturen. Het volgende scherm toont Van, Antwoorden naar, Aan, Onderwerp, bericht en PDF-bijlage. Alleen de aparte knop Versturen naar … biedt de mail aan SMTP2GO aan. Concept opslaan, betaling registreren, navigeren en de AI versturen niets automatisch.

Je kunt één opgeslagen PDF-factuur, offerte, proforma, orderbevestiging of pakbon van maximaal 2 MB uit dezelfde order versturen. Een tekstbericht/betaallink zonder bijlage kan ook; het voorbeeld vermeldt dan expliciet Geen bijlage. Geen Word-bestand, volledige back-up of verborgen dossierinhoud wordt meegestuurd. Klanten met een apart factuuradres krijgen standaard de factuurmail; anders hun gewone e-mailadres. De gekozen ontvanger kan vóór het voorbeeld worden aangepast.

## Status en herhalen

Aangeboden aan SMTP2GO betekent dat de provider de aanvraag heeft geaccepteerd, niet dat de ontvanger de mail heeft ontvangen. Voor afleveringen/bounces/afwijzingen gebruik je Reports → Activity. Er is nog geen publieke webhook voor bezorgstatus gekoppeld aan localhost.

Dezelfde aanvraag-ID wordt niet nogmaals aangeboden bij dubbelklikken of herhalen na een herstart. De ID blijft bij het concept bewaard; het serverjournal blijft buiten de browser staan. Bij onzeker resultaat (bijvoorbeeld een onderbroken verbinding) wordt dezelfde ID geblokkeerd: eerst SMTP2GO Activity controleren. Een nieuw concept kan een nieuwe verzending veroorzaken. Een bewust opnieuw verstuurde mail is geen correctie of intrekking van een eerdere mail.

## Technische grenzen

Mailroutes gebruiken de bestaande beveiligde lokale proxy met interne sleutel, host-, oorsprong- en bedrijfscontrole. De gekozen afzender moet in de toegestane serverconfiguratie staan; een verwijderde alias of gewijzigde naam/Reply-To na het voorbeeld blokkeert verzending. Dossier, bijlagemetadata en PDF-bytes worden opnieuw gecontroleerd vóór versturen. Geen automatische retries naar SMTP2GO. HTTP 200 wordt gecontroleerd op succeeded/failed en email_id.

Sleutel in .local/mail/<bedrijf>/config.json: privémappen 700, bestand 600. Status retourneert uitsluitend publieke instellingen en of een sleutel bestaat. De sleutel wordt nooit aan de AI, browserdatabase, back-up, mailjournal of codepakket toegevoegd. Het journal bewaart alleen ontvanger, onderwerp, dossier-/document-ID, aanvraag-ID, status, provider-ID en een inhoudshash; geen PDF of berichttekst. Browserconcepten bewaren wel de door de gebruiker opgestelde tekst, zoals de bestaande conceptfunctie. De AI heeft alleen crm.propose_email voor een tekstvoorstel bij een bestaand dossier, zonder ontvanger-/afzender-/bijlagevelden. Er is geen AI-verzendtool. Openen ter controle leidt naar het gewone mailformulier; de gebruiker kiest daarna preview en verzending.

tests/email-service.mjs test fictieve provider-antwoorden, eigen testadres, alias/antwoordadres, PDF-validatie, bevestiging/voorbeeld, onzekere resultaten, dubbelklikken/herstart en bedrijfsafscheiding. Geen echte SMTP2GO-aanvraag of klantmail in automatische tests. Een echte eigen testmail moet de gebruiker nog uitvoeren na het invoeren van zijn sleutel.

Bronnen: [API-sleutels](https://support.smtp2go.com/hc/en-gb/articles/20733554340249-API-Keys), [Afzenderverificatie](https://support.smtp2go.com/hc/en-gb/articles/9150216032537-Verified-Senders-Sender-Domain-vs-Single-Sender-Emails), [Verzenden](https://developers.smtp2go.com/reference/send-standard-email), [PDF-bijlagen](https://developers.smtp2go.com/docs/adding-attachments), [Sandboxmodus](https://support.smtp2go.com/hc/en-gb/articles/29736421853337-Sandbox-Mode).

## Verbeterde bediening

Extra afzenderadressen staan in Instellingen & back-up, één per regel. Standaardafzender voor facturen moet bij deze adressen of de hoofdafzender staan. Eigen handtekening wordt in nieuwe standaardteksten gebruikt; bestaande conceptteksten worden niet automatisch vervangen. Opnieuw standaardtekst invullen vraagt bevestiging als je de tekst hebt aangepast. Alleen bij een volledig betaalde order met bekende prijzen vermeldt de nieuwe factuurtekst dat de betaling ontvangen is.

De order krijgt een knop Factuur mailen voor de nieuwste PDF-factuur, of Factuur maken als deze ontbreekt. In de mailhistorie zie je concepten en aangeboden/geweigerde/onzekere aanvragen met ontvanger en tijd. Bestaande aangeboden berichten blijven in de historie staan als je ze hergebruikt. Concept opslaan behoudt de aanvraag-ID, ook na herladen. Het serverjournal biedt extra bescherming, onafhankelijk van browserback-ups en Stap terug.

Het voorbeeld heeft Bericht aanpassen en PDF controleren. De PDF-knop downloadt de exact gekozen bijlage; hij verstuurt niets. Bij een reeds aangeboden PDF aan dezelfde ontvanger moet je bewust opnieuw versturen aanvinken. De server controleert dit ook bij een nieuwe aanvraag-ID. Een onzeker/pending resultaat voor die PDF blokkeert ook nieuwe IDs: SMTP2GO Activity controleren blijft noodzakelijk; geen automatische statuswebhook of herstelactie toegevoegd. Als de server dezelfde aanvraag al had geaccepteerd maar de browserstatus niet is bijgewerkt, kan dezelfde ongewijzigde aanvraag de status herstellen zonder een tweede provider-aanvraag.

Afzender, onderwerp, tekst en bijlage worden altijd in het voorbeeld getoond. Navigeren, betaling registreren, standaardtekst invullen en concept opslaan verzenden geen mail. Een wijziging van bijlage waarschuwt om tekst en onderwerp te controleren. Instellingswijzigingen moeten worden opgeslagen vóór de eigen testmailknop beschikbaar is.

Ontbrekende gegevens hebben nu invulhulp. Bij een document kan Verzendprijs invullen direct het korte prijsformulier openen; 0 wordt alleen bewust gekozen voor afhalen/gratis verzending. Na opslaan of annuleren kom je terug naar het document en blijven aangepaste teksten in dit tabblad bewaard. Verkoopprijzen invullen opent de ordereditor bij de ontbrekende prijs. Bij ontbrekende SMTP2GO-configuratie bewaart E-mailinstellingen openen eerst het concept en brengt je naar de sleutel of klantverzending-schakelaar. Gegevens worden uitsluitend na expliciet opslaan aangepast; dit maakt geen factuur of verzending automatisch.

Ook e-mailinstellingen en de berichtvelden gebruiken gedeelde invulhulp: ongeldige velden krijgen een korte uitleg naast de invoer en bij opslaan een klikbare lijst. De melding richt zich op de ontvanger, onderwerp, tekst of het betreffende instellingsveld. Reeds ingevulde gegevens blijven in het open formulier staan; een correctie verstuurt geen bericht.


## Templates en standaardtekst bewaren

Instellingen & back-up → Mailtemplates & standaardteksten bevat de standaardmails voor factuur, betaalde factuur, offerte, proforma, orderbevestiging, pakbon en algemeen bericht. Aanpassen bewaart een bedrijfsgebonden versie voor toekomstige berichten. Factuur en Factuur na betaling zijn afzonderlijke standaarden; de automatische keuze voor betaalde facturen blijft gebaseerd op volledig geregistreerde betaling en bekende prijzen. Bestaande concepten en eerder aangeboden mails blijven ongewijzigd. Standaard herstellen verwijdert de eigen aanpassing. Nieuwe template maakt een eigen standaardmail; er staan alvast voorbeelden voor ontbrekend aantal, materiaal, afmetingen en ontwerp/logo.

In E-mail voorbereiden kies je een template en klik je op Template invullen. Dit vervangt na bevestiging onderwerp en tekst, niet ontvanger of bijlage. Variabelen zoals {{contact}}, {{klant}}, {{order}}, {{document}} en {{handtekening}} worden uit het dossier ingevuld. Eigen variabelen zoals {{materiaal}} krijgen invulvelden. Ontbrekende variabelen blokkeren invullen; achtergebleven variabelen blokkeren zowel preview/concept als de serververzending. Met Deze tekst als template bewaren open je een editor en kom je na opslaan of annuleren terug bij je oorspronkelijke mail met ontvanger, inhoud en aanvraag-ID behouden. Vervang klantgebonden waarden in die editor door variabelen als ze voortaan dynamisch moeten zijn.

Templates staan in de bestaande CRM-state, per bedrijfsopslag, en gaan mee in volledige back-ups. De bibliotheek ondersteunt maximaal 100 eigen/aangepaste templates. Correcties lezen en combineren de actuele state; een gelijktijdig gewijzigde template wordt niet overschreven.

## Mailoverzicht en klantdossier

Menu E-mail toont bewaarde Gmail-mails en concepten. Klanten → klant → E-mail combineert de eigen klantberichten met de mails uit alle orders. Nieuwe mail werkt ook zonder order. Bij een order is Nieuwe mail / gegevens opvragen beschikbaar; een nieuwe losse mail of antwoord krijgt niet automatisch een PDF of betaallink. Alle verzendingen blijven concept → gecontroleerd voorbeeld → expliciet Versturen. Ontvanger, afzender, onderwerp en bericht zijn aanpasbaar.

Ontvangen mail kun je lezen en een antwoord voorbereiden. Een geldige oorspronkelijke Message-ID wordt als In-Reply-To/References meegestuurd via SMTP2GO. De uiteindelijke groepering in een gesprek hangt af van de ontvangende mailclient. SMTP2GO-mails worden bij het CRM-dossier bewaard, maar deze koppeling voegt ze niet aan Gmail Verzonden toe. Gmail heeft alleen leestoegang; dat voorkomt extra schrijf-/verzendbevoegdheden. Voor opgemaakte mails zonder tekstdeel toont het CRM alleen het korte voorbeeld met een melding. Volledige HTML, afbeeldingen en bijlagen bekijk je in Gmail; ze worden niet geladen of geïmporteerd.

## Gmail eenmalig koppelen (lokaal)

De gebruiker heeft een eigen Gmail-account per bedrijf. Daarom heeft elk CRM een aparte koppeling en wordt het ingelogde Gmail-account vergeleken met het ingestelde account. Een verkeerd gekozen account wordt geweigerd. De bestaande Cloudflare Email Routing en Gmail-afzenders hoeven hiervoor niet aangepast te worden. Cloudflare Email Workers zouden nieuwe inkomende mails kunnen verwerken en doorsturen, maar lezen niet vanzelf je bestaande Gmail-archief. Gmail als bron sluit daarom beter aan op bestaande én nieuwe mail.

1. Open [Google Cloud Console](https://console.cloud.google.com/) in je gewone browser. Maak een eigen project, bijvoorbeeld CRM-mail.
2. Schakel in APIs & Services → Library de Gmail API in.
3. Stel Google Auth Platform → Branding/Audience in voor je eigen gebruik. Bij een extern project in Testing voeg je beide Gmail-accounts als testgebruikers toe. Gebruik geen serviceaccount of Gmail-wachtwoord.
4. Maak onder Clients een OAuth-client van het type Desktop-app en download de JSON. Eén client kan voor beide accounts worden gebruikt; het CRM bewaart instellingen/toestemming apart per bedrijf.
5. Open in het betreffende CRM Instellingen & back-up → Gmail-inbox → Eenmalige Google-inrichting. Vul het echte Gmail-account in (de Gmail-inbox die jouw bedrijfsadres ontvangt, niet zomaar de facturenalias) en kies de gedownloade JSON. Klik Google-instellingen opslaan. De JSON wordt daarna uit het formulier gewist.
6. Klik Gmail koppelen en daarna Google-inlogpagina openen. Gebruik Safari/Chrome als Google de ingebouwde browser weigert. Kies het juiste account en geef de gevraagde Gmail-leestoestemming. Het lokale terugkeeradres wordt automatisch gemaakt op 127.0.0.1; bij een Desktop-client hoef je geen publieke CRM-URL in te richten.
7. Ga terug naar menu E-mail en klik Mails ophalen. Herhaal de koppeling vanuit het andere bedrijfs-CRM voor zijn eigen account.

Bij een extern Google-project in Testing verloopt de offline-toestemming voor deze scope na zeven dagen; opnieuw koppelen kan dan nodig zijn. Voor langdurig gebruik moeten de Google-projectstatus en toepasselijke persoonlijke/interne gebruiks- of verificatieregels worden gecontroleerd. Deze lokale voorbereiding bevestigt niet dat jouw echte Google-project of account de koppeling al heeft toegestaan. De huidige tokenopslag is alleen lokaal; voor een publieke/cloudversie zijn andere OAuth-client/redirect- en privéserverinstellingen nodig.

## Gmail-mails ophalen en bewaren

Ophalen gebeurt alleen met de knop. Kies 7/30/90 dagen of één jaar; er worden maximaal 20 berichten per pagina opgehaald, met Volgende 20 voor verdere pagina’s. Spam en prullenbak zijn uitgesloten; ook in Gmail verstuurde mails kunnen voorkomen. De lijst haalt headers/voorbeelden op. Lezen & koppelen haalt de tekst van één gekozen mail op. Ophalen verandert Gmail niet en bewaart nog niets bij een klant.

Bij klant bewaren vereist een expliciete dossierkeuze. Alleen een uniek exact e-mailadres levert een voorstel; meerdere matches of geen match vereisen eigen selectie. Een order is optioneel en moet bij de gekozen klant horen. Dubbele imports van dezelfde Gmail-ID en mailbox leveren de bestaande koppeling terug. Er wordt maximaal 30.000 tekens tekst per mail opgeslagen, met een melding bij afkorting. Er kunnen maximaal 5.000 mails in de CRM-state worden bewaard. Het algemene overzicht toont de 100 nieuwste berichten; per klant staat de eigen historie. Dit is een dossierarchief, geen volledige Gmail-mirror. Gmail blijft de plek voor alle mail en bijlagen.

Gmail-koppeling verbreken verwijdert de lokale toegang, niet de mailbox of bewaarde dossiermails. Voor volledige intrekking van de Google-toestemming gebruik je je Google-accountinstellingen. Gmail-tekst, concepten en templates gaan niet automatisch naar de AI. Bewaarde dossiermails staan wél in de gewone CRM-back-up; behandel die zoals andere klantgegevens.

Privéconfiguratie en tokens staan per bedrijf in .local/gmail/<bedrijf>/oauth.json en connection.json, mappen 700/bestanden 600. Clientsecret/access-/refresh-tokens komen niet in publieke status, AI-aanvragen, browseropslag, back-ups of builds. Alleen officiële Google OAuth- en Gmail-endpoints, PKCE/state met tien minuten geldigheid, accountcontrole en read-only API-operaties. Geen Gmail-schrijfaanvragen, achtergrondpolling, automatische dossierkoppeling of live Cloudflare-wijzigingen.

Controles: tests/mail-templates.mjs (templatewijzigingen/variabelen/conflicten, klantmatching/deduplicatie, back-upbehoud en AI-uitsluiting), tests/gmail-service.mjs (fictieve OAuth/Gmail-antwoorden en beschermde lokale routes), tests/email-service.mjs (klant zonder order, antwoordheaders, templateblokkade en expliciete preview). Tijdelijke DOM-test controleerde werkelijke composer/editorbediening, concept/ID-behoud bij opslaan én annuleren, antwoord zonder onbedoelde bijlage/link en handmatige Gmail-import. Er is geen echte Gmail-inbox gelezen, Google-project aangemaakt of klantmail verzonden door de agent.

Bronnen: [Gmail-scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Desktop OAuth en PKCE](https://developers.google.com/identity/protocols/oauth2/native-app), [Google-tokenverloop](https://developers.google.com/identity/protocols/oauth2/), [Cloudflare inkomende mail/doorsturen](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/), [SMTP2GO custom headers](https://developers.smtp2go.com/reference/send-standard-email).


## E-mail bij een specifieke order

Iedere order heeft nu een tabblad E-mail. Dit toont gesprekken die bewust aan die order gekoppeld zijn, met binnengekomen Gmail-mails, in Gmail verstuurde mails en de CRM-antwoorden/concepten op tijdvolgorde. Mails uit een algemeen klantdossier of een andere order verschijnen niet vanzelf hier. Onderwerpen alleen worden niet gebruikt om gesprekken samen te voegen; Gmail-mailbox plus echte thread-ID of de eigen CRM-gespreks-ID bepaalt de groep.

- Nieuwe mail opent een leeg nieuw bericht zonder automatische PDF/betaallink. Templates blijven beschikbaar.
- Bewaard gesprek koppelen kiest een al opgeslagen Gmail-gesprek van dezelfde klant. Daarna controleer je het dossier. Als het gesprek eerder bij een ander dossier stond, vereist verplaatsen een extra bevestiging. Er komt geen tweede kopie van de mailtekst.
- Gesprek uit Gmail kiezen haalt pas na je klik een lijst op. Gesprek bekijken haalt de complete thread op. Gesprek bewaren koppelt de berichten na jouw bevestiging aan deze order.
- Gesprek openen toont afzonderlijke mails, oudste bovenaan; de nieuwste staat uitgeklapt. Antwoord voorbereiden kan bij ieder ontvangen bericht of via de knop voor het nieuwste ontvangen bericht. Ontvanger en Re:-onderwerp zijn voorgesteld; het mailvoorbeeld en aparte verzendbevestiging blijven verplicht. Antwoorden bewaren Gmail-mailbox/thread-ID en oorspronkelijke Message-ID, zodat ze lokaal bij hetzelfde gesprek verschijnen. SMTP2GO vult Gmail Verzonden niet aan.
- Nieuwe Gmail-berichten ophalen doet een nieuwe read-only aanvraag. Het volgende scherm toont hoeveel nieuwe berichten er zijn; pas Gesprek bewaren schrijft ze bij de order. Bestaande kopieën worden niet overschreven of gedupliceerd. Een gelijktijdig gewijzigde koppeling blokkeert opslaan.
- CRM-kopie van Gmail-gesprek verwijderen verwijdert uitsluitend de geïmporteerde Gmail-kopieën en hun koppeling uit het CRM. Gmail wordt niet gewijzigd; CRM-concepten/verzendhistorie/betalingen blijven bewaard. Binnen de bestaande grenzen kan Stap terug de lokale wijziging herstellen.

Bij het verplaatsen van een gesprek blijven oudere CRM-berichten in hun oorspronkelijke opslagdossier. Zij kunnen als onderdeel van het gekoppelde gesprek zichtbaar zijn bij de nieuwe order, met het oorspronkelijke dossier aangeduid. Origineel bericht openen bewerkt dat oorspronkelijke bericht; een nieuw antwoord op een ontvangen mail gaat naar de huidige order. Andere klanten blijven gescheiden.

Gmail-thread ophalen is begrensd tot 100 berichten en maximaal 5 MB providerrespons, met maximaal 30.000 tekens opgeslagen tekst per bericht. Spam/prullenbak in de thread zijn uitgesloten en worden gemeld. Te grote threads worden geweigerd zonder gedeeltelijke opslag; kies dan losse mails of gebruik Gmail. HTML wordt niet weergegeven en externe afbeeldingen/bestandsbijlagen worden niet naar de CRM-opslag gekopieerd. Volledige mail en bestanden blijven in Gmail.

## Grootte van het mailarchief

De meter bij E-mail en het ordertabblad toont het bedrijfsgebonden mailarchief: geïmporteerde tekst/metadata, CRM-concepten en verzendhistorie, plus threadkoppelingen. De app heeft een bewuste limiet van 10.000.000 UTF-8-bytes (10 MB) en maximaal 5.000 geïmporteerde berichten. Deze grens beschermt de bestaande inrichting waarin de CRM-state bij wijzigingen als geheel wordt geladen/bewaard; het is niet de totale capaciteit van Cloudflare D1 of van je browser. Nieuwe imports en concept-/previewopslag controleren de grens vóór de transactie wordt vastgelegd. Een gefaalde opslag wijzigt geen deel van een gesprek. Vastleggen van een reeds uitgevoerde externe verzending mag nooit op deze appgrens stranden.

Op localhost is de opslag nog bedrijfsgebonden browseropslag. De actuele quota van de browser en de gebruikte/vrije ruimte van de live Cloudflare-database zijn in deze wijziging niet gemeten. Cloudflare vermeldt voor D1 maximaal 500 MB per database op Free, en 10 GB op Workers Paid. Het huidige cloud-CRM begrenst opslagverzoeken bovendien op 32 MB en herschrijft de gedeelde state in stukken; databasecapaciteit alleen is daarom geen garantie voor een vlotte volledige mailbox. Voor veel grotere mailarchieven moeten mailtekst en metadata afzonderlijk en op aanvraag geladen worden (eigen D1-records, grote bijlagen in privé-R2 of Gmail). Deze lokale wijziging voert geen cloudmigratie uit en verhoogt niet blind de bestaande payloadlimiet.

Controles: tests/order-mail.mjs controleert het werkelijke ordertabblad, tijdvolgorde, CRM-antwoorden in threads, order-/klantisolatie, verplaatsen met bevestiging, conflicten, deduplicatie/bijwerken, UTF-8-bytebegrenzing zonder gedeeltelijke wijziging en het behouden van verzendhistorie/betalingen bij verwijderen van kopieën. Gmail-servicetests oefenen de nieuwe read-only threadroute met fictieve Google-antwoorden. Tijdelijke DOM-fixture controleerde koppelen → thread openen → antwoordconcept bij de juiste order → handmatig bijwerken met aparte opslag → CRM-kopie verwijderen. Geen fysieke browsercontrole, echte Gmail-inbox of klantmail door de agent gebruikt.

Bronnen: [Gmail threads ophalen](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.threads/get), [Cloudflare D1-opslaggrenzen](https://developers.cloudflare.com/d1/platform/limits/).


## Een document verwijderen

Een aangemaakt document verschijnt als één kaart met PDF- en Word-downloads. Open Bestanden beheren voor PDF verwijderen of Word verwijderen; bij losse uploads staat Verwijderen bij het bestand. Het volgende scherm toont het bestand en het dossier; vink Ik wil dit bestand verwijderen aan en bevestig met Bestand verwijderen. Je verwijdert één bestand per keer. PDF en Word blijven afzonderlijke bestanden in de opslag. Orders, geregistreerde betalingen en gebruikte documentnummers blijven bestaan. Bij een algemeen klantdocument vermeldt het scherm dat het bestand ook uit de gekoppelde orderoverzichten verdwijnt.

Een document verwijderen trekt een verzonden mail of betaallink niet in. Mailhistorie blijft bewaard. Als je een mail met de verwijderde bijlage opnieuw opent, kies je een andere PDF of bevestig je bewust dat je de tekst hebt gecontroleerd en zonder bijlage verdergaat. Concept opslaan of voorbeeld openen kan de bijlage daardoor niet ongemerkt weglaten.

Stap terug kan de verwijderde metadata en oorspronkelijke bestandsbytes in hetzelfde tabblad herstellen binnen de bestaande bewaargrenzen (20 stappen/16 MB). Na herladen, grotere wijzigingen of een bestand dat al ontbrak, is dit geen vervanging voor een back-up. In de cloud verwijdert de optie de CRM-verwijzing/bestandsindex; fysieke opruiming van ongebruikte R2-objecten is niet aan deze functie toegevoegd. Er zijn geen echte documenten door de agent verwijderd tijdens het testen.
# Templates en betaallink direct in de mailvoorbereiding (14 oktober 2026)

De mailvoorbereiding toont de gekozen template en **Template bewerken**. Een gewone factuur en een factuur na betaling hebben elk hun eigen template. De bewerkknop opent de opgeslagen template met haar variabelen; opslaan keert terug naar dezelfde nog niet opgeslagen mail. Onderwerp, bericht, ontvanger en bijlage worden behouden. Kies **Template invullen** om de bijgewerkte template bewust op die mail toe te passen. Ook een nieuwe template kun je hier bewaren.

Een nieuwe of hernoemde template mag niet dezelfde naam hebben als een andere template (ook niet met andere hoofdletters of extra spaties). Dan verschijnt **Template bestaat al**, met **Andere naam kiezen** of **Bestaande template vervangen**. Vervangen vraagt expliciete bevestiging. Dubbele eigen teksten met die naam worden daarbij samengevoegd naar de bestaande template; bij een ingebouwde naam blijft het oorspronkelijke standaard-ID behouden. Bestaande dubbele teksten worden niet stil gewist: in de keuzelijst worden standaard/eigen teksten onderscheiden, en je kunt ze bewust samenvoegen vanuit de editor. Concepten en verstuurde mails blijven behouden. Twee verschillende vaste template-ID’s kunnen niet met elkaar worden samengevoegd; kies dan een andere naam. Wijzigingen vanuit een ander tabblad blokkeren verouderd overschrijven.

Bij de betaallink van een ordermail staat **+ Betaallink maken**. Je mail blijft tijdelijk in geheugen terwijl je de link voorbereidt. Kies het openstaande orderbedrag, een percentage van document-/ordertotaal (bijvoorbeeld 70%) of een eigen bedrag. Een financiële bijlage wordt aan het verzoek gekoppeld; bij andere bijlagen hoort het verzoek bij de order. Het aanmaakformulier maakt pas na **Tikkie aanmaken** een werkelijk betaalverzoek. Bestaande providercontrole/idempotentie en bevestiging bij een bedrag boven het restant blijven actief. Er wordt geen klantmail verstuurd.

Na aanmaken of annuleren kom je terug bij je mail. Een gemaakte link is geselecteerd; **Link in bericht zetten** voegt hem toe zonder je tekst te vervangen. Herhaald invoegen voegt dezelfde URL niet nogmaals toe. Ongeldige/verlopen links worden niet ingevoegd. Bij een fout tijdens voorbereiden keert het mailformulier terug met de fout bij de keuzelijst. Een teruggevonden link uit het lokale providerjournaal wordt hersteld zonder een tweede verzoek te maken. Klantmails zonder gekozen order kunnen geen ongebonden betaallink maken; gebruik de mailvoorbereiding van de betreffende order.


## Minder zoeken bij mailen

Factuur mailen staat direct in elke order. De nieuwste factuur-PDF gaat naar het mailformulier; ontbreekt hij, maak de Spatlappen-factuur of voeg voor Maatwerk de eigen PDF toe en ga terug. In de mail staat ook een factuurmaakknop als er nog geen factuur-PDF beschikbaar is. E-mail hier instellen opent SMTP-instellingen boven het levende mailformulier; terugkeer ververst de toegestane afzenders zonder de tekst te vervangen. Verlopen/ontbrekende betaallinks bieden een nabije maakactie. Lege bewaarde Gmail-gesprekken bieden direct Gesprek uit Gmail kiezen of Nieuwe mail bij deze order. Mail controleren & verder bij een AI-voorstel verstuurt niets. Zie [mobiele bediening en invulhulp](MOBIEL-EN-INVULHULP.md) voor gebruikersstappen en grenzen.

## Google-JSON kiezen zonder formulierverlies

Het instellingenformulier blijft behouden wanneer de bestandskiezer de focus teruggeeft, tijdens het inlezen, en zolang er onopgeslagen invoer is. Ook een reeds gestarte externe gegevensrefresh controleert dit opnieuw voordat hij het scherm zou vervangen. Deze bescherming wordt via de gedeelde formulierhulp toegepast; opgeslagen SMTP-instellingen worden daarna weer als schoon gemarkeerd. Bij navigatie naar een andere pagina worden uitgestelde gegevensupdates hervat. Alleen vlaggen worden bijgehouden, geen kopieën van wachtwoorden, JSON of sleutels.

Na kiezen verschijnt JSON inlezen en daarna Desktop-app JSON ingelezen. De Gmail-koppelknop wacht tot de wijzigingen expliciet zijn opgeslagen. Foutieve JSON, een Web-app-client, een ander Google-bestand of een bestand boven 20 kB geven direct invulhulp. Een nieuwere bestandskeuze of handmatige JSON-invoer wint van een eerder lopende leesactie. Een verwijderd formulier ontvangt geen laat leesresultaat. De gedeelde formatvalidator wordt ook door de backend gebruikt; foutmeldingen bevatten geen inhoud van de credentials.

Kiezen slaat nog niets op en meldt niet aan bij Google. Google-instellingen opslaan blijft de afzonderlijke gebruikersactie, gevolgd door Gmail koppelen. Leesscopes en Gmail-actiegoedkeuring zijn ongewijzigd. Regressiontests: tests/gmail-upload.mjs en work/assistant-dom-test/gmail-upload-check.mjs (fictieve DOM/client/provider, inclusief bestandkiezer-focus, formulierbehoud, asynchrone races, foutbestanden en secretwissen na expliciet opslaan).

### Opslagbevestiging naast de knop

Na succesvol opslaan verschijnt onder de opslaanknop een groene bevestiging met Gmail koppelen als aparte vervolgstap. De geheime JSON/file wordt alleen na succes leeggemaakt; de instellingen blijven op de Mac opgeslagen. Bij een mislukte aanvraag verschijnt een foutblok en blijft de invoer uitsluitend in het levende formulier staan voor een handmatige retry (niet in browseropslag/back-ups/logs). Een al opgeslagen client krijgt ook na herladen de melding dat opnieuw uploaden niet nodig is. Opslaan en Gmail aanmelden zijn verschillende stappen: client configured=true betekent niet connected=true. Google-inloglinks verschijnen bij de vervolgstap en vervallen uit de UI als je de invoer weer wijzigt; geen automatische Google-aanvraag bij opslaan. Een late oorspronkelijke statusresponse overschrijft de nieuwe opslagstatus niet.

## Mailwerkplek en formulieraanvragen — 14 oktober 2026

E-mail en het ordertabblad gebruiken nu de gedeelde gesprek-/antwoordwerkplek. Direct antwoorden, ontvangsttekst, ontbrekende gegevens, inline preview, nieuwe berichten bewaren en handmatige/optionele automatische aanvraagintake staan beschreven in [Mailwerkplek](MAIL-WERKPLEK.md). De oudere losse-threaddialoog blijft als fallback voor configuraties zonder de nieuwe werkplek beschikbaar. Automatisch klaarzetten staat standaard uit en betreft uitsluitend geverifieerde nieuwe Maatwerkkunststof-formulieraanvragen na inschakelen. Nooit automatisch versturen. Gmail-scopes blijven readonly en Gmail-acties blijven technisch uitgeschakeld.

## HTML-handtekening uploaden — oorspronkelijke bediening, 17 oktober 2026

**Actuele uitbreiding van 21 oktober:** zie [Handtekeningen en AI-uitleg](MAIL-HANDTEKENINGEN.md) voor de huidige limieten, meerdere afbeeldingen, varianten per afzender en expliciete mailkeuze. De oudere beschrijving hieronder is historisch.

Open Instellingen & back-up → E-mail & facturen → HTML-handtekening uploaden. Kies een `.html`- of `.htm`-bestand (maximaal 100 kB). Controleer het getoonde voorbeeld en de automatisch ingevulde gewone tekst, en klik Instellingen opslaan. De HTML-bron kun je onder HTML aanpassen bewerken. HTML-handtekening verwijderen schakelt na opslaan terug naar de gewone teksthandtekening.

Tabellen, inline letter-/kleur-/randopmaak, links en HTTPS-afbeeldingen worden ondersteund. PNG/JPEG/GIF-data-afbeeldingen kunnen in de HTML zitten; ondersteuning verschilt per mailprogramma. Afbeeldingen via `file:` of `cid:` uit een andere e-mail hebben geen bruikbaar los bestand en worden niet meegenomen. Scripts, formulieren, externe stylesheets, style-blokken en actieve inhoud worden verwijderd. Dit is een email-HTML-subset, geen willekeurige webpagina.

Nieuwe CRM-mails met ingestelde HTML bevatten zowel `html_body` als `text_body`. De gewone mailtekst blijft bewerkbaar; de bestaande teksthandtekening wordt op zijn plek vervangen door HTML. Ontbreekt die tekst in het bericht, dan wordt de handtekening onderaan toegevoegd en komt de tekstfallback ook in de tekstversie. Het verzendvoorbeeld gebruikt dezelfde opbouw als de server. Een na het voorbeeld gewijzigde HTML-handtekening blokkeert verzending totdat je opnieuw controleert. Een upload of opslaan verstuurt niets; de bestaande testmail-/klantverzendknoppen blijven aparte handelingen.

Dit werkt via de bestaande CRM/SMTP2GO-verzendroute, ook voor antwoorden vanuit het CRM; Gmail-accountinstellingen en de handtekening in Gmail zelf worden niet gewijzigd. Lokaal beschikbaar bij beide bedrijven, nog niet gepubliceerd. Geen echte afleverproef uitgevoerd.

## Aankomstconcepten — lokaal, 18 oktober 2026

Bij een werkelijk ontvangen Spatlappen-batch staat per gekoppelde order Aankomstmail voorbereiden. Het voorstel gebruikt huidige prijzen/ontvangsten en de expliciete leverwijze. Onbekende bedragen blijven een afstemmingsvraag. Eén ondubbelzinnig passend bewaard gesprek wordt voorgesteld; bij meerdere blijft de bestaande gesprekskeuze beschikbaar. De knop opent alleen de composer. Opslaan en versturen blijven afzonderlijke bestaande acties. Geen automatisch verzendmoment, dubbele verzendkosten of echte mailactie door bekijken.

## Formuliermetadata en spam — 23 oktober 2026

Philippe meldt mogelijke spam bij antwoorden rechtstreeks vanuit Gmail, niet vanuit het CRM. Lokale websitecode zet automatische ID/herkomst/interne-testregels nu in technische headers buiten HTML/platte tekst; CRM leest ze met behoud oude bodyfallback en bestaande bedrijfs-/afzendercontrole. Geen Gmail-/SMTP2GO-/DNSinstellingen of echte mails gewijzigd. Nieuwe versie nog niet gepubliceerd; oude ontvangen mails houden hun footer. Spamoorzaak onbekend; Delivered is serverontvangst, geen inboxbewijs. Spam-events zijn teruggekoppelde klachten waar beschikbaar, geen algemene meting van automatische spamplaatsing. Zie FORMULIERMAIL-EN-SPAM.md voor bronverdeling, publieke DNS-waarneming, domeinverificatie en releasevolgorde.

## Footerafbeeldingen tegenover losse Gmail-bijlagen — 27 oktober 2026

Philippe wil bestanden uit de footer niet als losse Gmail-bestanden. Nog verduidelijken of hij Gmail zelf, het CRM-mailoverzicht of beide bedoelt; geen echte voorbeeldmail/headers/config bekeken. Bronbevinding: gmailMessage behandelde ieder MIME-onderdeel met filename als bijlage. Nieuwe shared/gmail-body.js gebruikt dezelfde classificatie bij bericht-/gesprekslezen en de bijlagedownloadroute: image/* met Content-Disposition inline is berichtopmaak; zonder disposition alleen uitsluiten als Content-ID werkelijk in een img-src of ondersteunde HTML-achtergrondverwijzing voorkomt. Explicit attachment blijft een losse bijlage, ook bij afbeeldingen/Content-ID. Onbekende of andere disposition, alleen een naam/kleine omvang/Content-ID is onvoldoende om te verbergen. PDF/Word/overige echte bijlagen behouden. Enkel passieve HTMLtekst inspecteren, geen DOM, externe fetch of afbeeldingsbytes ophalen. Bestaande diepte20/bijlagelimieten/account-/spam-/trashcontroles behouden.

Herkenbare ingesloten afbeeldingen verschijnen na nieuw ophalen met de nieuwe dienstcode niet in de gewone CRM-bijlagenlijst en kunnen ook niet via een oude partId alsnog als dossierbestand worden gedownload/bewaard. Gmail-origineel en de handtekening blijven intact. Geen automatische verwijdering van bestaande dossierbestanden, oude archiefsnapshots of bijlagemetadata: hun oorspronkelijke MIMEheaders ontbreken in de CRM-kopie. Bestaande threadimport bewaart eerdere berichtinhoud/metadata; dit is geen migratie of opschoonactie. Oude CRM-kopie kan daarom nog de oude lijst tonen, vers opgehaald gesprek gebruikt nieuwe herkenning.

Verzendbron al correct gescheiden: shared/mail-signature.js geeft data-afbeeldingen als inlines met cid-verwijzing, shared/mail-service.js stuurt die als SMTP2GO inlines, afzonderlijk van echte attachments. Dit ongewijzigd behouden; geen footerweghalen, geen automatische externe afbeeldinghosting, geen gevoelige configuratie uitlezen. Inline bytes blijven technisch deel van het mailbericht; de presentatie in Gmail zelf is hiermee niet bewezen/hersteld. Als de melding Gmail zelf betreft, is één betreffende oorspronkelijke mail als .eml nodig om de daadwerkelijk geleverde headers/opbouw te beoordelen; de losse logobestanden alleen verklaren dat niet. Alternatief extern HTTPS-hosting is geen uitgevoerde of afgesproken wijziging.

Beide dienstadapters gebruiken de gedeelde parser. Alleen lokale bronaanpassing: draaiende Node-dienst heeft codeherstart nodig, geen herstart uitgevoerd; online aparte expliciete publicatie nodig. Geen tests, checks, syntaxchecks, builds, browser-/DOMuitlezing, Gmaillezing/-mutatie, proefzending, provideractie of publicatie. Bouwlog via scripts/build-task.mjs bij mail-workspace-reform-20261019 doing/local: concrete CRM-bronfix aanwezig, eigen controle en precieze Gmailmelding open. Philippe controleert zelf nieuwe volledige berichten/threads met inline logo, echte foto als attachment, factuur-PDF, oude/ontbrekende headers en oude snapshot/partId. Geen native-Gmail-oplossing of daadwerkelijke aflevering claimen.

Bronnen voor het contract: [SMTP2GO inlines en attachments](https://developers.smtp2go.com/reference/send-standard-email), [Gmail MessagePart](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages), [Content-Disposition RFC2183](https://www.rfc-editor.org/rfc/rfc2183.html) en [CID RFC2392](https://www.rfc-editor.org/rfc/rfc2392.html). Alleen openbare documentatie gelezen; geen provideroproep met credentials.

## Verduidelijking en lokale dienst geladen — 27 oktober 2026

Philippe bevestigt: de footerbestanden staan in het CRM-mailoverzicht, niet Gmail zelf. Geen bestanden of .eml nodig voor deze melding. De bestaande gedeelde MIMEbronfix past daarbij. De eerder door Codex gestarte Spatlappen-dienst beëindigd en opnieuw gestart met npm run dev; lokale loopback-bind vereiste de bestaande sandboxuitzondering. Nieuwe sessie66031 meldt lokale assistentdienst en http://localhost:3010/admin/. Dit is uitsluitend opstartuitvoer, geen functionele controle. Geen browser/tab herladen of Gmail-/mailrequest door Codex. Maatdienst niet gestart; gedeelde bron blijft voor beide bedrijven.

De nieuwe code is hiermee in de lokale Spatmaildienst geladen. Philippe bewaart eventuele invoer en gebruikt zelf Gesprek bijwerken om opnieuw de volledige Gmailstructuur op te halen. Oude opgeslagen archiefkopieën/bijlagemetadata en eerder bewaarde dossierbestanden blijven ongewijzigd; geen stille migratie of verwijdering. Ook een als echte attachment gemarkeerde afbeelding blijft een bijlage, geen logo-/naamheuristiek. Handtekeninginhoud en echte documenten behouden.

Bronnotitie via scripts/build-task.mjs review/local bij mail-workspace-reform-20261019: verduidelijking en herstart klaar, eigen controle blijft open. Geen tests/checks/syntaxchecks/builds/browser-QA/Gmaillezing/-mutatie/proefzending/publicatie. Native Gmailbeoordeling is voor deze gebruikersmelding niet nodig; eerdere vraag daarover is hiermee gesloten. Geen opgeslagen gebruikersstatus/feedback gewijzigd.
