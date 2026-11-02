# Outlook-leveranciersmail aansluiten — 2 november 2026

Op expliciete opdracht de aangemaakte zakelijke Microsoft365 User-mailbox info@bouwmarktxl.nl aansluiten. Tenant/client-id en secret uitsluitend op de server; secretwaarde, geheim-id en tokens niet in bron, documentatie of browser. De callback is https://crm.maatwerkkunststof.nl/api/crm/supplier-mail/callback.

## Bediening

Instellingen → Verzenden & handtekening bevat nu dezelfde leveranciersmailwachtrij als de Kunststofbaas-ordertab. Kies Mails ophalen, de gewenste begindatum en Koppel BouwmarktXL-mailbox. Open de aangeboden Microsoft-link, meld je aan als info@bouwmarktxl.nl en geef de gevraagde leestoegang. Keer na de callback terug en kies Mails ophalen. Bestaande tabinvoer niet verversen zonder bewaren.

De aanmeldcode/PKCE-verifier/state zijn eenmalig, verlopen na tien minuten en zijn gekoppeld aan CRM-sessie, bedrijf en actuele configuratie. Callback op GET werkt met de bestaande SameSite=Lax-sessie; geen nieuwe loginmethode of gedeelde-mailboxfallback. Alleen User.Read/Mail.Read/offline_access aangevraagd; geen .default. Een token met aanvullende scopes wordt geweigerd met gerichte melding, ook als eerder schrijf-/verzendrechten in Entra zijn toegevoegd. Die toestemmingen worden door deze integratie niet gebruikt of stil aangepast.

## Bronnen en controle

Vaste afzender noreply@kunststofbaas.nl. Originele mail en PDF-bijlagen in dezelfde private Maatopslag; tokens/mailmetadata met de bestaande integrationsleutel versleuteld. Alleen een nieuwe identiteitsmarker voor deze bestaande productieopslag, geen kopie naar preview en geen bestaande sleutels vervangen. Geen order, adres, kosten, betaling, leveranciernummer of PACKS-zending automatisch aanpassen.

Bestelnummermatch is een voorstel. Instellingen toont de bijbehorende orderlink, bij ontbrekend/tegenstrijdig nummer zelf kiezen. PDF bekijken of in de order dezelfde bestaande factuurinvoer openen; pas eigen acceptatie maakt kosten. Een bevestiging zonder PDF blijft met mailtekst en orderlink zichtbaar. Originele bronnen/deduplicatie/CAS behouden.

## Automatisch ophalen

De bestaande Maat-onderhoudswerker heeft al een schema van eenmaal per vijftien minuten. Een aparte waitUntil-taak vraagt uitsluitend de nieuwe afgeschermde supplier-mail/run-route aan, met het bestaande serverjobgeheim. Betalings-/meldingenwerk blijft ongewijzigd en heeft een onafhankelijke taak; een mailfout stopt die route niet. Geen tweede mailengine of nieuwe gedeelde opslag/secretkopie nodig. Alleen Maat productie, vaste canonical origin, bewuste auto-syncvlag en echte storage-identiteit toegestaan. Geen publieke ingest of browserauth-bypass voor andere routes.

Zonder Microsoft-aanmelding geen Graph-aanvraag of mailboxuitlezing. Na aanmelden geldt de gekozen begindatum. Iedere run bewaart maximaal één nieuwe mailbron (maximaal vier PDF’s); achterstand kost meerdere rondes. Zelf ophalen kan maximaal zes stappen uitvoeren. Bron-/bijlageproblemen blijven zichtbaar, laatste automatische poging/resultaat veilig in aparte integratiemetadata. Geen mail markeren, verplaatsen, verwijderen of versturen. Loskoppelen stopt nieuwe uitlezing; bewaarde bronnen blijven staan.

## Status

Bron zorgvuldig vergeleken, geen tests/checks/browser-QA of echte Microsoft-aanmelding/Graph-mailopvraag door de bouwer. Inrichting/publicatie en Microsoft-consent zijn afzonderlijke feiten; actuele deployments staan privé in work/outlook-connect-20261102. Gebruiker moet aanmelden en zelf de eerste voorstellen controleren. Uitgaande leveranciersmail is een afzonderlijke bestaande SMTP2GO-route, geen onderdeel van deze OAuth-toestemming.

Bronnen: [Microsoft codeflow/PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), [Graph berichtenlijst/filters](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0), [Microsoft scopes](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc). Alleen primaire documentatie geraadpleegd.
