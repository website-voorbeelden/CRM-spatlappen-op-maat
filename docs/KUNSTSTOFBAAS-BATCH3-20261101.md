# Kunststofbaas batch 3 — Outlook-mail als controleerbare bron

1 november 2026. Lokaal brongebouwd, niet geactiveerd of functioneel getest. Geen mailbox-/accountinstelling aangepast, geen mail verstuurd, geen cloudresource/migratie/secret aangemaakt. Gebruiker heeft ook batches4/5 opgedragen; deze integratie levert daarvoor bronmateriaal, geen automatische financiële boekingen.

## Werking in de bron

Bij Factuur & kosten staat Facturen uit Outlook. De bestaande BouwmarktXL-mailbox is het uitgangspunt; een ander ontvangstadres is niet nodig voor deze bron. Koppelen gebeurt later met een eigen Microsoft-app en beperkte gedelegeerde leesrechten. De Codex-mailboxconnector wordt niet naar het CRM gekopieerd en activeert deze koppeling niet.

De server gebruikt OAuth-codeflow met PKCE, eenmalige sessie-/bedrijf-/configgebonden aanmeldintentie en bewaart tokens versleuteld in de bestaande integrationsopslag. Vast Microsoft/Graphdomein, geen redirect van credentials naar andere hosts; scopes User.Read/Mail.Read/offline_access, geen Mail.Send/Mail.ReadWrite. De gekozen Microsoft-gebruiker moet werkelijk de verwachte mailbox zijn. Een gedeelde mailbox is niet ongemerkt dezelfde identiteit. Appsecret blijft serverinstelling. Lokale browseropslag kan niet stil een mailbox aanmelden of tokens bewaren.

De synchronisatie leest alleen de opgegeven leveranciersafzender via Microsoft, met een vanafdatum, stabiele hoofdlettergevoelige bericht-ID’s, hele vervolgpagina-URL’s binnen de eigen mailbox en een overlap met het laatst volledig verwerkte tijdvenster. Hij leest over de mailbox heen, zodat een verplaatsing uit Inbox niet meteen een tweede bericht of een gemiste leveranciersmap wordt. Verwijderde berichten kunnen volgens Microsoft ook in de berichtenlijst voorkomen; daaruit wordt geen nieuwe fysieke bestelling afgeleid. De cursor schuift pas na duurzaam bewaarde pagina-inhoud. Een veranderde begindatum herstart de zoekperiode zonder bestaand bewijs te wissen.

Originele MIME-mail en geschikte niet-inline PDF-bijlagen gaan naar private R2-bronopslag. Geen willekeurige factuurlinks uit mail volgen; geen HTML/script uitvoeren of mailtekst als opdracht behandelen. Metadata/tekst versleuteld in integrations, bronhashes en mailboxidentiteit houden de onderlinge koppeling vast. Download controleert oorspronkelijke omvang/hash. Geen CRM-order/betaling/kosten/documentreeks geschreven door de synchronisatie. Afzendertekst is geen bewijs van financiële juistheid; de gebruiker beoordeelt de factuur.

Een begrensde wachtrij toont voorstellen via hun volledige bestelnummer of ons expliciete ordernummer. Ontbrekend/meervoudig/tegenstrijdig blijft zichtbaar; er wordt geen order aangemaakt of leveranciersnummer stil opgeslagen. Een bron-PDF kan worden bekeken of via dezelfde bestaande factuurinvoer tot een bewerkbaar voorstel worden gelezen. Open factuurinvoer wordt niet vervangen; nummer/adres gebruiken hun bestaande opslaggrenzen. Een al bekende PDF verwijst naar de bestaande factuurcontrole. Gewone navigatie bewaakt nog steeds onbewaarde invoer, ook als mailknoppen leesacties mogen uitvoeren.

Netwerk-/toegangs-/bronfouten blijven per bericht zichtbaar. Een expliciete retry kan ontbrekende delen aanvullen; bestaande oorspronkelijke mail/PDF’s worden niet overschreven. Archiveren haalt alleen het bericht uit de CRM-wachtrij, niet uit Outlook en verwijdert geen bewijs of financiële registratie. De wachtrij stopt bij250 actieve bronnen; geen stille verwijdering om een limiet te halen. Maximaal4PDF’s/bericht,15MB/PDF,25MB MIME, begrensde tekst/antwoord/pagina-/tijdverwerking; grotere bronnen zelf downloaden/importeren.

Een serverstap bewaart maximaal één nieuwe mailbron en leest pagina’s van tien berichten. Bij onderbreking wordt dezelfde pagina hervat; eerder bewaarde immutable IDs worden overgeslagen. De klik Mails ophalen vraagt maximaal zes van die stappen, met een tijdgrens en zichtbare voortgang. De private scheduler doet één stap per ingestelde run; bij achterstand zijn dus meerdere runs nodig. De wachtrijlijst gebruikt een begrensde metadata-index, niet voor elk scherm opnieuw honderden bronopvragingen. Dit begrenst [Cloudflare-subrequests](https://developers.cloudflare.com/workers/platform/limits/); geen prestatie-/providerproef uitgevoerd. Kosten en limieten van de gekozen hosting blijven bij inrichting beoordelen.

Bij Meer kun je opnieuw koppelen/begindatum kiezen of de CRM-verbinding loskoppelen. Loskoppelen wist geen bewijs en trekt Microsoft-consent niet automatisch in. Een verlopen/toegang geweigerde koppeling vereist eigen heraanmelding; geen automatische loginpoging met een wachtwoord.

## Automatisch ophalen — nog afzonderlijk inrichten

workers/supplier-mail/index.js is een aparte scheduled bron met geen publieke ingest-API. Voorbeeld heeft lege cronlijst en beide activeringsvlaggen false. Het gebruikt dezelfde bedoelde CRM-D1/R2/integratiesleutel, plus een expliciete mailopslagmarker die bedrijf en preview/productie onderscheidt. De marker-SQL is alleen installatiebron, niet uitgevoerd. Het gewone authenticated CRM-API bezit koppelen/lijst/bronbestand en expliciete sync; geen tweede orderdatabase.

Nog nodig: Microsoft-appregistratie/redirect/consent en eventuele tenantbeheerderstoestemming, secrets/marker/bindings in de bedoelde afzonderlijke omgeving en daadwerkelijke userlogin. Daarna pas bewust het automatische schema inschakelen. Niet automatisch gekoppeld omdat er hier een Outlook-connector bestaat. Jouw praktijkcontrole, GitHub en publicatie blijven apart.

## Bronnen en grenzen

Microsoft beschrijft [codeflow/PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), [stabiele Outlook-ID’s](https://learn.microsoft.com/en-us/graph/outlook-immutable-id), [berichtenlijst en vervolgpagina’s](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0), [MIME-inhoud](https://learn.microsoft.com/en-us/graph/api/message-get?view=graph-rest-1.0) en [originele bijlagen](https://learn.microsoft.com/en-us/graph/api/attachment-get?view=graph-rest-1.0). Alleen openbare documentatie gelezen, geen Microsoft-login/provider- of tenantactie uitgevoerd.

Geen tests/checks/build/browser-/DOM-/visuele QA. Bronvergelijking is geen bewezen mailbox-/bijlage-/herstelketen. Kostenmatching/bronwisselbewaking staan in [batch4](KUNSTSTOFBAAS-BATCH4-20261101.md); uitgaande leveranciersmail/proef en open afzenderinrichting in [batch5](KUNSTSTOFBAAS-BATCH5-20261101.md). Bestaande CRM-gegevens, bestanden, eigen wijzigingen en oude staging behouden.
