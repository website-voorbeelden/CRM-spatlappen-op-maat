# Online CRM met AI via je eigen laptop

21 oktober 2026 — lokaal bronwerk, nog geen onlinepublicatie of functionele controle. Volgens gebruikersafspraak geen tests, syntaxchecks, builds of browser-QA uitgevoerd. Geen echte klantdata, providerverzoeken, tokens of bestaande authconfig onderzocht. Geen hosting besteld of publiek netwerk geopend.

## Gekozen route

De persoonlijke VM is niet nodig voor deze variant. De online CRM-pagina communiceert via een klein lokaal koppelvenster met de bestaande hulpdienst op de Mac. Die gebruikt de bestaande ChatGPT-aanmelding en dezelfde AI-engine. De modellen draaien bij OpenAI; dit is geen offline taalmodel. Internet, eigen planrechten en gebruikslimieten blijven nodig. Geen betaalde API-fallback.

Er is geen publieke tunnel, lokale CORS-wildcard, extern bereikbare luisterpoort of browserextensie. De bestaande hulpdienst luistert uitsluitend op127.0.0.1. De browser opent op eigen klik een venster op127.0.0.1:3030/browser-bridge. Exacte postMessage-controle op bronvenster, afzenderorigin en bedrijf; targetOrigin staat nooit op sterretje. Alleen het lokale venster benadert de lokale API. De online pagina hoeft niet rechtstreeks via een cross-origin fetch naar localhost te praten. Browser-/popup-/openerbeleid kan dit nog blokkeren; daar is geen functionele browsercontrole voor uitgevoerd. Geen advies om browserbeveiliging uit te zetten.

Voorlopig toegestane aanvragers, exact en per bedrijf: https://spatlappen-crm.pages.dev en https://maatwerkkunststof-crm.pages.dev; daarnaast localhost3010/3011 voor de betreffende bedrijfscode. Geen willekeurige preview-hosts of customdomeinen. Een afwijkend echt CRM-adres moet bewust aan de vaste lijst worden toegevoegd; niet iets onbekends automatisch vertrouwen.

## Bediening

Agent heeft een zichtbare AI aan op deze laptop-schakelaar. Lokaal blijft de bestaande verbinding standaard aan; uitzetten wordt als niet-geheime voorkeur onthouden. Een online pagina begint na laden uit, omdat openen van het koppelvenster een eigen gebruikersklik vereist.

1. Start de lokale hulpdienst via de bestaande starter voor beide CRM’s.
2. Open het CRM en zet AI aan.
3. Online opent een koppelvenster dat het CRM-adres en bedrijf toont. Bevestig Deze browser koppelen. Geen wachtwoord/token kopiëren.
4. Laat dit venster open of minimaliseer het. ChatGPT lokaal instellen opent de bestaande lokale Agent-pagina als de accountaanmelding ontbreekt.
5. Kies de gewenste dossiercontext en stel een vraag. Antwoordhulp bij mail gebruikt dezelfde aan/uitverbinding.
6. AI uit verbreekt de tabverbinding, stopt de gekoppelde lopende vragen en blokkeert nieuwe aanvragen. Het CRM en de database blijven werken. Browser ontkoppelen trekt ook de onthouden toestemming voor dat bedrijf/adres/browser in. Het ChatGPT-account wordt daarmee niet uitgelogd.

De browsertoestemming is maximaal30dagen geldig: een private HttpOnly/SameSite-Strict cookie op de lokale origin plus een hashgebonden grant op de laptop. Die wordt alleen na de eigen lokale bevestigingsknop bewaard. De online site krijgt de cookie of het sessietoken niet. Het lokale venster houdt zijn tijdelijke sessietoken in geheugen en spreekt uitsluitend de afgebakende bridge-API aan. Een tabverbinding verloopt na8uur; opnieuw AI aan geeft een nieuwe sessie. Na herladen opnieuw op AI aan klikken; de toestemming wordt binnen die30dagen herkend zodat opnieuw toestaan normaal niet nodig is. Andere browsers/privévensters hebben hun eigen cookie. Cookies wissen of grantverlies vraagt opnieuw toestemming.

Iedere tab heeft een eigen koppelvenster. Sluiten van het CRM of het koppelvenster verbreekt die verbinding; andere bedrijven en tabbladen blijven apart. Browseruitval, harde sluiting of een al verstuurde providerrequest kan nog kort verbruik laten doorlopen; stoppen draait eerder AI-gebruik niet terug. De helper heeft voor AI maar één actieve generatie tegelijk. Een andere vraag krijgt een wachtmelding in plaats van een tweede generatie te starten.

## Welke gegevens gaan mee?

Standaard alleen het expliciet gekozen klant-/orderdossier, plus gekozen paginacontext en begrensde gespreksgeschiedenis. Een klantdossier kan diens orders bevatten. Buiten een dossier worden geen klantlijsten meegestuurd. Bedrijfsbrede dossiers meenemen is een aparte standaard-uit keuze voor zoeken/overzichten; wijzigen start een nieuw AI-gesprek. Een lege selectie wordt niet als leeg bedrijf uitgelegd.

De online laptop-context-route leest zelf de ingelogde bedrijfsstate en maakt de beperkte transportprojectie. Browsermeegestuurde snapshots bepalen de centrale bron niet. Bestanden, ontwerpen, credentials en betaalprovider-tokens blijven uitgesloten via de bestaande projectie. De replyhulp houdt zijn bestaande expliciete gesprek-/dossiercontext en verstuurt niet ineens de hele administratie. De lokale legacyroute past dezelfde beperkte dossierselectie toe. Geen ongevraagde AI-runs, mailboxscans of achtergrondanalyse toegevoegd.

De hulpdienst wordt niet door de AI-schakelaar beëindigd: lokale feedback, spraak en andere functies kunnen hem gebruiken. De brug verwerkt alleen status, modellen, chat, stop en eigen sessie verbreken/vergeten. Geen Gmail, SMTP2GO, betalingen, authselect/login/logout, bestandstoegang of generieke netwerkexecutor via deze brug.

## Opslaan blijft centraal en expliciet

De laptop maakt alleen voorstellen. Bij onlinegebruik levert de context-route de centrale revisie. Een lokaal AI-voorstel wordt via stage-local-plan aan de online API aangeboden, daar tegen de echte state, bestaande baseline, veldallowlist en revisie gevalideerd en opnieuw als servervoorstel opgebouwd. Geen document-/klantwijziging tijdens dit voorbereiden.

Daarna dezelfde online review/approve als de eerder gebouwde servervariant: exact servervoorstel, verplicht toestemmingsvakje, kort geldig reviewsleuteltje, eigen CRM-sessie/herkomst, revisiecheck en bestaande CAS-commit met deduplicatie. Geen AI-tool die deze bevestiging kan uitvoeren. Mailvoorstellen gaan eerst naar de bestaande composer/preview. Alleen jij verstuurt een mail; de lokale brug krijgt geen mailtoegang.

Bestaande hosted-agentcode blijft als optionele infrastructuur aanwezig, maar de browser schakelt niet stil over naar een server of API-billing. Hosted secrets zijn voor laptop-context/stage/review/approve niet vereist; bestaande veilige CRM-auth, integratiesleutel en integratietabellen wel. Geen database reset, migratie of herimport nodig bij een gewone code-update.

## Bestanden en activering

| Bron | Rol |
|---|---|
| assistant/browser-bridge.mjs | Afgebakende lokale pagina/API, consentcookie/grants, sessies, scoped chat/stop |
| assistant/server.mjs | Hergebruik bestaande account/engine, geen masterkey naar browser; gedeelde generatiegrens |
| admin/assistant/laptop-transport.js | Tabverbinding, aan/uit, popupcontrole, context/staging en gedeelde mailtransport |
| shared/assistant-laptop-context.js | Beperkte dossierprojectie |
| cloudflare/assistant.js | Authentieke centrale context en voorstelvalidatie vóór gewone menselijke review |

De nieuwe grantopslag staat uitsluitend in de private runtime-directory `.local/browser-bridge/grants.json` (directory0700/bestand0600). Bevat hashes en consentmetadata, geen ChatGPT-tokens of dossiers. Niet publiceren of direct als AI-opdracht uitlezen. De online pagina bewaart alleen een aan/uitvoorkeur als die relevant is, geen bridge-/ChatGPT-token. Geen bestaand authbestand kopiëren naar een ander proces.

De bestaande npm-start voor beide bedrijven start ook de brug. Niet tegelijk een tweede helper met dezelfde ChatGPT-accountmap starten. De eigen runtime is na deze bronwijziging herstart (startuitvoer hulpdienst en3010/3011); frontend zelf herladen nadat je invoer hebt opgeslagen. Starterstatus is geen functionele controle. Er zijn geen HTTP-/browser-/providerproeven gedaan.

Online gebruik vereist een gerichte release van de gewijzigde browsermodules/sharedmodules/Worker. Geen deploy uitgevoerd en geen hele WIP-map publiceren. De gebruiker had geen nieuwe server nodig; de vorige VM-instructies zijn een alternatief, niet de hoofdroute. Providerplanrechten/geslaagde aanmelding worden niet afgeleid van een zichtbare knop.

Nog open: eigen gebruikscontrole in de gekozen browser (popup, cookies, openerbeleid), onlinepublicatie, opnieuw aanmelden indien de lokale ChatGPT-toestemming ontbreekt. Ingebouwde browser kan dit anders behandelen dan Safari/Chrome. Geen algemene browsercompatibiliteits-, snelheids- of tokencorrectheidstest geclaimd. Er zijn geen nieuwe claims van onbeperkt Plus-gebruik. Geen automatische updatemechaniek voor de helper: code en accountdata blijven gescheiden, maar nieuwe backendcode vraagt een lokale herstart.

Bronnen: [MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), [MDN mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Mixed_content), [OpenAI plan usage](https://developers.openai.com/siwc/token-sharing-open-source). Toplevel navigatie en gecontroleerde venstercommunicatie worden gebruikt in plaats van een algemene cross-origin localhost-API voor publieke sites.
