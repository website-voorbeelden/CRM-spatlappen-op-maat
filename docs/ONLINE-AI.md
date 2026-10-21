# Nieuwe hoofdkeuze — 21 oktober 2026

Gebruiker kiest online CRM met AI via de eigen laptop, zonder serverhuur. Zie [LAPTOP-AI.md](LAPTOP-AI.md). De VM-route hieronder blijft een optioneel alternatief; er is geen server besteld. Lokale bron voor de laptopbrug gebouwd, niet getest/gepubliceerd.

# Persoonlijke online AI voor beide CRM’s

20 oktober 2026 — bron gebouwd, niet geactiveerd, gepubliceerd of getest. Philippe test zelf; geen tests, checks, build, browser-QA of proefgeneraties uitgevoerd. Er is nog geen eigen VPS gekozen of besteld. De bestaande lokale verbinding is niet gelezen, gekopieerd of gewijzigd.

## Gekozen inrichting

Eén online CRM-bron voor beide bedrijven, bestaande afzonderlijke Cloudflare-opslag, één persoonlijke AI-dienst op een eigen VM. De bestaande assistentbediening en antwoordhulp gebruiken dezelfde engine lokaal en online. Geen desktop-app die per computer bijgewerkt moet worden, geen tweede klantenadministratie.

Browser → ingelogde eigen CRM-API → HTTPS → persoonlijke AI-dienst → OpenAI. De browser krijgt geen dienstsleutel, refresh-token of OpenAI-token. De AI-dienst bezit geen Cloudflare-, Gmail-, SMTP2GO- of betaalcredentials. Hij kan uitsluitend antwoorden/voorstellen leveren; niet zelfstandig gegevens opslaan of provideracties uitvoeren. Beide bedrijven hebben verschillende dienstsleutels. Eén eigenaar met één ChatGPT-account; dit is geen gedeelde abonnementsdienst voor externe gebruikers.

## Gebruik in het CRM

Agent opent ook online het bestaande paneel, met modellen, contextkeuze, geschiedenis in het huidige tabblad en stopknop. Bij een ontbrekende aansluiting staan instellingen/uitleg in het paneel; er is geen schijnlogin die de lokale aanmelding automatisch online zou maken. Context kopiëren/importeren blijft via de mailhulp en bestaande AI-export beschikbaar.

Antwoordhulp per gesprek kan na activering rechtstreeks tekst voorstellen. Overnemen verandert alleen het concept; mailversturen blijft een afzonderlijke handeling met bestaande preview. De dienst bevat geen Gmail- of SMTP-uitvoerder. Het eerdere lokale microfoonpad blijft lokaal; online gebruikt expliciet gestart dicteren de browserspraakdienst indien beschikbaar, anders typen/systeemdicteren. Geen belofte dat dit dezelfde spraaksoftware als ChatGPT is; de browser kan audio naar zijn eigen provider sturen.

Gewone AI-dossierwijzigingen: voorstel → Voorstel controleren → apart venster met exacte wijzigingen → verplicht toestemmingsvakje → Opslaan. De backend laadt zelf de centrale bedrijfsgegevens; een browser kan geen alternatieve database of bedrijf meegeven. Een gegenereerd voorstel wordt opnieuw gevalideerd en versleuteld opgeslagen, gebonden aan bedrijf en CRM-sessie. Bij de review geeft de server een hashgebonden eenmalig bruikbare bevestiging voor twee minuten uit. Zonder deze review, expliciete bevestiging en juiste herkomst voert de goedkeuringsroute niets uit. Voorstellen verlopen na 30 minuten. Een gewijzigde centrale revisie blokkeert overschrijven; vraag dan een nieuw voorstel. Annuleren vóór bevestiging slaat niets op.

De bestaande CRM-commitroute bewaart wijzigingen met dezelfde validatie, bestandsreferenties en revisiecontrole. Een vaste commit-ID voorkomt dubbel uitvoeren bij een verloren antwoord. Open hetzelfde voorstel opnieuw om de status op te halen als opslag onzeker is. De AI-engine heeft geen tool om de review- of goedkeuringsroute aan te roepen. Dit vervangt niet de bestaande beveiliging tegen een gestolen CRM-sessie of scriptinjectie.

Alleen de bestaande beperkte klant-/orderacties zijn voorstelbaar. Geen verwijderen, betalingen, e-mailacties of accountbeheer via de dienst. Herkende specificaties en mailvoorstellen blijven via de bestaande handmatige CRM-formulieren lopen.

## Aanmelding: eigen ChatGPT-plan

Officiële OpenAI Docs:

- [Self-hosted VMs](https://developers.openai.com/siwc/token-sharing-open-source/self-hosted-vms): lokaal aanmelden met dezelfde toolregistratie, beschermd overzetten via SSH, eigen stabiel VM-host-ID behouden en vernieuwen op de VM.
- [Token sharing voor open-source/local tools](https://developers.openai.com/siwc/token-sharing-open-source): toepassingsgebied en providerrechten. Een algemene commerciële hosted app kan aanvullende toelating vereisen; deze persoonlijke VM-opzet is geen toestemming om abonnementen aan andere gebruikers beschikbaar te stellen.

Toegang/toestemming voor dit hulpmiddel moet bij activering daadwerkelijk door OpenAI worden verleend. Plus garandeert geen onbeperkt gebruik of toelating voor iedere servervorm. Geen stil alternatief met betaalde API-sleutel. De bestaande engine gebruikt `stream:true` en `store:false`. Hostingkosten zijn afzonderlijk en zijn nog niet vastgesteld of gemaakt.

## Bestanden

| Bestand | Rol |
|---|---|
| assistant/host/server.mjs | Afgebakende Node-dienst, bedrijfsauthenticatie, beperkte acties, stop en gelijktijdigheidsgrens |
| assistant/host/start.mjs | Expliciete serverstart via operatoromgeving |
| assistant/host/setup-account.mjs | Eenmalige interactieve aanmelding op eigen computer, nieuwe privémap |
| assistant/host/import-account.mjs | Expliciete VM-import van één verse registratie, identiteitscontrole, eigen host-ID |
| assistant/host/Dockerfile + Dockerfile.dockerignore | Alleen publieke code; privésleutels/accountmappen blijven buiten buildcontext/image |
| assistant/host/compose.yaml | Loopbackpoort, persistent privévolume, geen root, alleen-lezen image |
| cloudflare/assistant.js | Eigen CRM-sessie, bedrijfsbron, versleuteld voorstel, review en bevestigde commit |
| admin/assistant/online-plan.js | Bestaande formulierbediening voor expliciete review en toestemming |

De dienst is één proces. Een tweede schrijver naar dezelfde tokenmap is verboden; runtime.lock blokkeert dubbel starten en accountimport tijdens gebruik. De dienst deelt geen gespreksgeheugen tussen bedrijven. Per bedrijf één chat tegelijk; de persoonlijke dienst verwerkt daarnaast maximaal één chat voor beide samen. Geen gespreks-/audio-logbestanden. Alleen openstaande wijzigingsvoorstellen komen tijdelijk in bestaande versleutelde integrations-opslag; vragen/antwoorden blijven in het tabblad. Verlopen voorstelrijen kunnen tot opruimen blijven bestaan: geen automatische retentie-opruimer geïmplementeerd.

## Activeren — pas na keuze en opdracht van Philippe

Dit zijn operatorinstructies; ze zijn niet uitgevoerd. Geen productiegegevens migreren of bestaande secrets vervangen. Gebruik een eigen VM met SSH, Docker Compose en een TLS-reverseproxy. Alleen 443 publiek naar de dienst; poort3040 blijft loopback. DNS/TLS/serveraankoop en kosten eerst concreet laten goedkeuren. Houd account- en operatorbestanden buiten de repository. Geen klantback-up naar deze server kopiëren.

1. Maak op de VM twee private mappen voor accountopslag en tijdelijke import. De container draait als UID/GID1000: geef uitsluitend de bedoelde operator/container toegang (map0700, accountbestand0600). Kies bijvoorbeeld `/srv/crm-agent/account` en `/srv/crm-agent/incoming`.
2. Maak twee verschillende willekeurige dienstsleutels van 32 bytes/64 kleine hextekens, bijvoorbeeld ieder afzonderlijk met `openssl rand -hex 32`. Plak ze uitsluitend in de private operatoromgeving en later het eigen Cloudflare-secret, nooit chat/Git/browserconfig. Maak een operatorbestand met mode0600 buiten het project:

```dotenv
CRM_AGENT_DATA_PATH=/srv/crm-agent/account
CRM_AGENT_SPATLAPPEN_TOKEN=<eigen-64-hex-sleutel-voor-spatlappen>
CRM_AGENT_MAATWERKKUNSTSTOF_TOKEN=<andere-64-hex-sleutel-voor-maatwerkkunststof>
```

3. Op je eigen computer, vanuit de projectmap, start een verse, afzonderlijke aanmelding. Onderstaand pad is een voorbeeld; kies een nieuwe privémap buiten de bron:

```sh
node assistant/host/setup-account.mjs /absoluut/prive/nieuwe-crm-server-aanmelding
```

Open de getoonde OpenAI-link zelf en geef toestemming. Het proces luistert alleen tijdelijk op127.0.0.1 en schrijft één beschermde connection.json. Geen bestaande CRM-/Codex-auth openen of kopiëren. Een ontbrekende toestemming is geen geslaagde aansluiting. Bij mislukken opnieuw beginnen met een nieuwe privémap.

4. Zet alleen die nieuwe connection.json via SSH over naar de tijdelijke importmap op de VM. Zet eigenaar/leesrechten zodat alleen de operator en bedoelde containergebruiker het bestand kunnen lezen (0600). Start de oude laptopaanmeldsessie niet als tweede AI-runtime. De VM wordt hierna de enige schrijver/vernieuwer van deze registratie.
5. Vanuit de projectmap op de VM, bouw de afgebakende image en importeer voordat de dienst start. Vervang operatorpad en importpad door de werkelijk gekozen private locaties:

```sh
docker compose --env-file /srv/crm-agent/operator.env -f assistant/host/compose.yaml build agent
docker compose --env-file /srv/crm-agent/operator.env -f assistant/host/compose.yaml run --rm --no-deps -v /srv/crm-agent/incoming:/incoming:ro agent node assistant/host/import-account.mjs /incoming/connection.json
docker compose --env-file /srv/crm-agent/operator.env -f assistant/host/compose.yaml up -d agent
```

Import valideert de verse identiteit met OpenAI-JWKS, neemt uitsluitend het gekozen account over en behoudt/genereert een apart stabiel VM-host-ID. Dit doet geen proefgeneratie. Bij een bestaande actieve VM-aanmelding stopt de import; alleen bewust vervangen met `--replace` en gestopte dienst. Stop bij weigering, deel geen tokeninhoud. Ruim tijdelijke transferkopieën na succesvolle import bewust op; private back-up apart beveiligen.

6. Zet een eigen HTTPS-hostnaam achter een reverseproxy naar127.0.0.1:3040, zonder logging van Authorization/body. Host/service accepteert alleen `/invoke` met de bedrijfssleutel; `/health` bevat geen accountstatus of gegevens. Proxy moet antwoorden van circa115seconden kunnen doorlaten. Geen doorverwijzingen of publieke browser-CORS. TLS/certificaten, firewall en herstel na VM-reboot zijn nog operatorwerk, geen onderdeel van de gebouwde CRM-code.
7. In ieder eigen Cloudflare-project: `CRM_AGENT_SERVICE_URL` = HTTPS-origin zonder pad/query; `CRM_AGENT_SERVICE_TOKEN` = uitsluitend de bijbehorende bedrijfssleutel. Bestaande `CRM_INTEGRATIONS_KEY`, CRM-auth en D1-tabellen `crm_integrations`/`crm_service_leases` zijn vereist. Maak hiervoor geen nieuwe klanten-DB; vervang geen bestaande integratiesleutel (anders worden bestaande koppelingen onleesbaar). Controleer eventuele ontbrekende infrastructuur eerst met de eigenaar, voer geen automatische migratie uit.
8. Publiceer pas op expliciete opdracht een gerichte CRM-release met de nieuwe browserbestanden en Worker. Deze bronmap bevat ook ander ongepubliceerd werk: niet blind alles uitrollen. Gebruiker controleert daarna zelf verbinding/modeltoegang, beide bedrijfsprofielen en de gewenste voorstellen. Geen automatische echte klantmutatie als proef.

## Updates en herstel

CRM-code, AI-image en privéaccountvolume zijn gescheiden. Een code-update verandert geen Cloudflare-klantenbestanden, wist de database niet en importeert niet opnieuw. Behoud de bestaande persistent accountmap, het VM-host-ID, operatorbestanden en de CRM-integratiesleutel. Maak vooraf een beschermde back-up daarvan; geen credentials in een normale bronback-up.

Stop de AI-dienst netjes, werk uitsluitend code/image bij, start met hetzelfde volume. De server vernieuwt het account zelf zolang de provider dit toestaat. Alleen bij werkelijk ingetrokken/verlopen herstelaanmelding de verse aanmeld-/importprocedure herhalen; niet bij elke update. Een vorige image kan met hetzelfde volume teruggezet worden, maar zet geen oude tokenback-up terug over nieuwere vernieuwde tokens.

Na een harde crash kan runtime.lock achterblijven. Compose start bewust niet eindeloos opnieuw. Controleer eerst dat alle oude processen/containers die deze map gebruiken gestopt zijn; verwijder uitsluitend de achtergebleven lock en start dan opnieuw. Verwijder nooit connection.json om een startfout te omzeilen. Een automatische reboot-/lockherstelstrategie is nog niet gebouwd; verkoop dit niet als beheerde dienst zonder onderhoud.

De implementatie is niet functioneel gecontroleerd volgens de afspraak om geen tests/build/browser-QA uit te voeren. Activering, gebruikerscontrole en retentie/operationeel beheer blijven open; geen claim dat de online assistent al werkt.
