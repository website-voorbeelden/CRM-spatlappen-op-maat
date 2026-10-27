# Toegang en bedrijfsopslag

Actualisering27oktober2026: beide CRM’s zijn volgens de bestaande overdracht gepubliceerd; de laatste gerichte formulierrelease voor beide staat op26oktober. Zie OVERDRACHT.md voor het publicatiebewijs. De oudere uitspraak dat Maatwerkkunststof alleen lokaal bestaat was achterhaald. Dit is geen nieuwe live beschikbaarheids-/accountcontrole. Nieuw bronwerk is niet daardoor gepubliceerd.

Beide lokale ontwikkelversies zijn alleen op127.0.0.1 bereikbaar en hebben geen echte accountregistratie of login; localhost rechtstreeks openbaar maken hoort niet bij deze inrichting. Online vereist de code HTTPS, de ingestelde login en een eigen bedrijfsidentiteit/opslag. Updates aan code vervangen de klantdatabase niet; een code-rollback herstelt geen gegevens. Geen accounts, wachtwoorden of providerconfiguratie geopend of gewijzigd tijdens deze actualisering.

## Historische inrichting Maatwerkkunststof — geen opdracht om opnieuw in te richten

De onderstaande inrichtingsstappen zijn achtergrond bij de bestaande installatie, geen actuele melding dat resources nog ontbreken. Actuele configuratie uitsluitend gericht bekijken bij een geautoriseerde beheer-/releaseopdracht; geen nieuwe bedrijfsopslag over bestaande heen aanmaken.

### Oorspronkelijke inrichtingstekst

Momenteel ondersteunt de online code één vooraf ingestelde login per bedrijfsinstallatie, geen losse gebruikersregistratie. Kies een eigen login-e-mailadres en lang uniek wachtwoord; stuur dat wachtwoord niet in een chat. Configureer CRM_ALLOWED_EMAIL en de bijbehorende wachtwoordhash als serverinstellingen in de eigen Cloudflare-installatie. De huidige code maakt willekeurige sessies aan en bewaart daarvan alleen een hash in de eigen database. Wachtwoord in deze code: PBKDF2-SHA256, 100000 rondes, willekeurige salt. Vul de eigen productievelden in deploy/targets.json pas in wanneer eigen D1, private R2 en URL zijn aangemaakt. Geen Spatlappen-database, bucket, wachtwoord of betaal-/mailcredentials kopiëren. De bedrijfsguard moet verkeerd gekoppelde opslag weigeren.

De oorspronkelijke lokale Maatwerkkunststof-basis had de eigen rekentool en pakbon zonder logo; document-/publicatievervolg staat gedateerd in OVERDRACHT.md. Meerdere medewerkers met persoonlijke accounts/rollen en tweestapsverificatie moeten apart worden gebouwd of met een geschikte toegangsvoorziening ingericht.

## Aanwezige maatregelen en resterend werk

Aanwezig: beschermde API-routes, verplichte HTTPS online, wachtwoordhash, loginlimieten, willekeurige sessies met HttpOnly/SameSite/Secure cookies en beperkte levensduur, herkomstcontrole bij wijzigingen, bedrijfscontrole op opslag, private backend-credentials en bestandscontrole. Dit beperkt aanvallen, maar sluit ze niet uit.

Open vóór publicatie: MFA/passkeys of passende extra toegangslaag, review van wachtwoordhash en daadwerkelijke Cloudflare-runtimecompatibiliteit, uitgebreidere CSP, review van afhankelijkheden, hosting/proxyconfiguratie en herstel/back-ups. De huidige CSP beperkt base-uri/object-src/frame-ancestors maar blokkeert niet alle ongewenste scripts. Geen volledige penetratietest uitgevoerd en geen garantie dat alle kwetsbaarheden gevonden zijn. Ook zonder je wachtwoord kunnen softwarefouten, gestolen sessies, malware of verkeerde hostinginstellingen een risico zijn.

OWASP adviseert voor PBKDF2-SHA256 minimaal 600000 rondes: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html . Verhoog dit niet blind: huidige hashformatter en Cloudflare-runtime moeten compatibel blijven; test en migreer met behoud van toegang. MFA: https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html .

Dit document is een codecontrole en voorbereidingslijst. Er zijn geen live accounts, Cloudflare-resources of credentials gewijzigd.
