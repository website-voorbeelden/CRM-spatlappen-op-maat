# Gedeelde CRM-basis — lokaal ontwikkelen

**Start hier:** [projectwijzer](docs/README.md) · [ontwikkelplan](docs/plan/ROADMAP.md) · [architectuur en mappen](docs/plan/ARCHITECTUUR.md) · [UX-afspraken](docs/UX-WERKPLEK.md). Toekomstige bouwers beginnen bij [AGENTS.md](AGENTS.md) en de nieuwste wijziging bovenaan [OVERDRACHT.md](OVERDRACHT.md). Het plan is ook leesbaar in beide CRM’s onder **Beheer → Ontwikkelplan**.

Deze versie is opgebouwd uit het bestaande Spatlappen-CRM. De twee bedrijfsversies gebruiken dezelfde CRM-code, met eigen bedrijfsinstellingen, lokale opslag en producttools.

**Spatlappen is op 16 oktober 2026 bijgewerkt in het bestaande Cloudflare Pages-project:** https://spatlappen-crm.pages.dev/admin/. Maatwerkkunststof blijft lokaal. De bestaande D1-gegevens, R2-bestanden en login zijn behouden en gecontroleerd. Er is rechtstreeks met Wrangler gepubliceerd vanuit een vastgelegde bronkopie; GitHub en Render zijn niet bijgewerkt. Zie [publicatie en herstel](docs/PUBLICEREN-SPATLAPPEN.md).

## Openen

- Spatlappen op maat: http://localhost:3010/admin/
- Maatwerkkunststof: http://localhost:3011/admin/

Beide servers starten met `npm run dev:both` of op de Mac met `Start-beide-CRMs.command`. Node.js 24 en Python 3 zijn nodig. Voor gewone lokale ontwikkeling zijn geen Cloudflare-credentials of extra Node-pakketten nodig.

De oorspronkelijke lokale CRM op poort 3000 blijft apart. De nieuwe ontwikkelversies gebruiken browseropslag op hun eigen poort: ze tonen niet vanzelf bestaande online of oorspronkelijke lokale klantgegevens. Gebruik dezelfde hostname (`localhost`) en browser om terug te keren naar je lokale invoer. Voor je belangrijke lokale invoer wilt bewaren, download een volledige back-up in het CRM.

Wijzigingen aan gedeelde broncode worden voor beide versies beschikbaar na herladen. Python-serverwijzigingen vereisen herstart; de browserdatabase blijft bestaan. Stop de servers met Ctrl+C en start ze opnieuw. Verwijder geen browsergegevens om een code-update te testen.

## Mobiele bediening en invulhulp

Beide bedrijfsversies hebben een mobiel menu, schermvullende AI-chat, grotere tikvlakken en een directe **Factuur mailen**-knop in de order. Bij ontbrekende records, berekeningen, facturen, mailinstellingen of betaallinks staan nabijgelegen maak-/invulacties; je keert terug met je eerdere invoer. Zie [mobiele bediening en gedeeld UX-patroon](docs/MOBIEL-EN-INVULHULP.md). Gebruik buiten huis vereist nog een beveiligde online koppeling met de nu lokale hulpdienst en opslag.

## Lokale ChatGPT-assistent

Open **Assistent** in het menu van één van de twee CRM-versies. Beide gebruiken dezelfde lokale ChatGPT-koppeling, met afzonderlijke bedrijfsdossiers. Inloggen en toestemming geven gebeurt via **Continue with ChatGPT**; een API-sleutel is niet nodig. Je kiest uit de modellen die je account daadwerkelijk beschikbaar stelt.

Open hem ook vanaf andere CRM-pagina’s via Assistent bovenaan het zijmenu of ⌘/Ctrl + O. Het paneel en je concept blijven bij navigeren beschikbaar. Bij een geopende klant/order kan diens identiteit worden meegestuurd. ⌘/Ctrl + P start/stopt praten. Op desktop verstuurt Enter je vraag; Shift + Enter maakt een nieuwe regel. Op mobiel maakt Enter een nieuwe regel en verstuur je met de knop. Onder het tandwiel stel je eigen sneltoetsen in of schakel je ze uit. Model, microfoonkeuze en uitleg staan onder het tandwiel in de chat. Assistent en Feedback melden staan apart in het zijmenu.

De assistent kan korte bedrijfsoverzichten geven, notities toevoegen met behoud van oude tekst, klanten/orders zoeken, klantgegevens aanpassen en een nieuwe klant met gekoppelde order voorbereiden. Elk voorstel toont de wijzigingen en wordt pas opgeslagen nadat je op **Voorstel opslaan** klikt. Bij tussentijdse wijzigingen of een verlopen voorstel wordt niets overschreven. Bestaande producten/prijzen, betalingen, verwijderen, ontwerpen/calculaties en e-mails versturen vallen buiten deze assistentversie. De AI kan wel een tekstvoorstel maken via **Mail controleren & verder**; de normale mailpreview en aparte verzendknop blijven nodig.

Dicteren gebruikt op deze Mac een geïnstalleerde lokale Whisper-herkenner: klik op Praten, spreek en klik op Stop praten. De geluidsmeter toont de invoer; controleer de tekst en verstuur zelf. Tijdelijke audio blijft op deze Mac en wordt na herkenning verwijderd. Herkennen gebruikt geen ChatGPT-tokens. De runtime in `.local/speech-runtime/` bij code-updates behouden; die is niet onderdeel van een GitHub-upload. Zonder lokale runtime biedt de interface waar mogelijk browserdicteren, waarbij de browserdienst audio naar zijn provider kan sturen.

Stop antwoord onderbreekt een aanvraag. Na fouten kun je expliciet opnieuw proberen. Onder het gesprek staan tijd, stappen en gemelde tokens; de teller is geen volledige weergave van je Plus-limiet en bevat geen verbruik van mislukte/gestopte aanvragen. Modelkeuze en dossiercontextvoorkeur worden lokaal onthouden.

Dit betreft lokale browsergegevens. Je online Cloudflare-database is nog niet aangesloten. Je vraag en opgezochte, beperkte dossierteksten gaan naar OpenAI; bestanden, ontwerpen, calculatie-invoer en betaalprovider-tokens zijn uitgesloten. Gesprekken worden alleen gedurende deze browsersessie in het geheugen gehouden. Ze staan niet in CRM-back-ups.

De persoonlijke koppeling blijft op deze Mac in afgeschermde `.local/chatgpt-assistant/`-opslag. Deze map mag nooit worden gedeeld of op GitHub gezet. Gewone code-updates verwijderen de koppeling en browsergegevens niet. **Loskoppelen** beëindigt lokale toegang en probeert de OpenAI-toestemming in te trekken.

Gebruik telt mee voor je ChatGPT-plan en diens limieten. Deze lokale Plus-koppeling is geen afgeronde aansluiting voor een online Cloudflare-app. Zie [ASSISTENT.md](docs/ASSISTENT.md) voor gebruik, grenzen en officiële documentatie.

## Tools

Nieuw: [Gmail-beveiliging voorbereiden](docs/GMAIL-TOESTEMMING.md) en [offertewerkplek met optionele rekentoolkoppeling](docs/KOSTPRIJS-OFFERTES.md). Gmail-wijzigingen blijven uit; nieuwe losse berekeningen zijn voorlopig browseropslag met eigen export.

Spatlappen houdt de bestaande ontwerptool. Open die vanuit de productregel om een ontwerp en voorbeeld bij die regel te bewaren.

Maatwerkkunststof gebruikt de opgegeven Rekentool (zie `tools/costing/SOURCE.md` voor bron en exact commit). Open de calculator vanuit een productregel. Bewaren legt alle calculatorinvoer, tarieven, leverancier, versie en historische uitkomst bij dat product vast. Eerder opgeslagen prijzen worden niet automatisch opnieuw berekend bij openen.

Een calculatorberekening hoort momenteel bij **één CRM-productregel**. Het aantal en de afmetingen moeten overeenkomen met het CRM. Losse berekeningen mogen wel meerdere stukken bevatten, maar zijn niet direct als één CRM-product op te slaan. Meerdere producten krijgen ieder een eigen CRM-regel.

Prijzen worden uitsluitend overgenomen als je de betreffende optie aanvinkt. De directe productkostprijs sluit transport, invoerrechten en overige kosten uit; beheer die afzonderlijk in de CRM-order/inkoop om dubbel tellen te voorkomen. Verkoopprijzen worden niet automatisch overgenomen bij een order met één pakketprijs. Kostprijzen uit leveranciersfacturen kunnen niet door de calculator worden vervangen.

## Documenten en betalingen

Order- en klantdocumenten staan in één bibliotheek met twee categorieën naast elkaar op brede schermen (één op smalle schermen). Bij ieder vak staat een maakknop waar dat documenttype voor het bedrijf is ingericht; bovenaan staat Document maken. Vanuit een klant met meerdere orders kies je expliciet de order. Bestanden uploaden en slepen blijven mogelijk voor algemene klantbestanden of een gekozen order. Leveranciersbestanden krijgen geen klantdocumentgenerator.

Versleep de categorieën via de handgreep met drie streepjes. Klikken op die handgreep biedt Naar voren/Naar achteren; pijltjestoetsen, Home en End werken ook. De volgorde wordt per bedrijf in localStorage van deze browser bewaard, los van dossiers/back-ups en inlogaccounts. Standaardvolgorde herstelt de oorspronkelijke indeling. Bij geblokkeerde browseropslag blijft de wijziging tijdelijk in dit tabblad en geeft het overzicht dat aan. Categorieën verslepen verplaatst geen bestanden en blijft gescheiden van bestanden uploaden.

Preview opent een leesvenster zonder download of documentgeneratie: PDF-pagina’s met bladeren/zoomen, afbeeldingen en gewone tekst/CSV/JSON. De Word-versie van een gemaakt document gebruikt het bijbehorende PDF-voorbeeld als de generatie-identiteit exact overeenkomt; losse Word-bestanden zonder PDF hebben alleen Download. PDF’s tot10MB/200pagina’s worden per gekozen pagina als PNG getoond via de bestaande omzetter; afbeeldingen tot20MB en tekst tot1MB. HTML/JS wordt niet als webpagina weergegeven. Bekijkfouten laten de downloadoptie staan. Tijdelijke bestanden en afbeelding-URL’s worden opgeruimd, sluiten annuleert de browseraanvraag en late antwoorden komen niet in een ander venster terecht. De lokale preview werkt voor beide bedrijven; de online convertercode is voorbereid maar hier niet gepubliceerd.

PDF en Word van hetzelfde generatie-event verschijnen als één kaart, met beide downloadknoppen en één PDF-mailactie. De tellers tellen deze kaart als één document. Nieuwste documenten staan eerst. Bestanden beheren toont de echte bestandsnamen, categorieën, afzonderlijke verwijderknoppen en eventueel een betaallinkactie. Er worden geen bestanden gewist of samengevoegd in de opslag: alleen dezelfde owner/type/nummer/generationId/categorie met unieke formaten wordt gegroepeerd. Losse uploads, oudere documenten zonder aantoonbare generatie-identiteit en afzonderlijke versies blijven apart. Betaallinks en mailhistorie staan bij Betalingen en E-mail, zodat de documentenpagina gericht blijft op documenten.

De Spatlappen-Wordtemplates zijn behouden. Lokale Word/PDF-generatie vereist een lokaal documentruntime-bestand; op deze Mac is uitsluitend de bestaande configuratie met uitvoerbare programmabestanden overgenomen, geen betaal- of logincredentials. Deze lokale configuratie staat in `.local/` en hoort nooit op GitHub.

Beide bedrijven hebben een pakbon via Order → Documenten → Pakbon maken. Controleer bestelde/geleverde aantallen, afleveradres en klanttekst. Voorbeeld reserveert geen nummer; opslaan bewaart PDF en Word samen met een eigen PB-nummerreeks. De pakbon bevat geen bedragen of betaalinformatie en vereist geen bekende verkoop-/verzendprijzen. Hij verandert de orderstatus of geregistreerde betalingen niet. Spatlappen gebruikt de aangeleverde Word-opmaak met logo; Maatwerkkunststof gebruikt de eigen bedrijfsnaam/website zonder logo. Geleverde aantallen gelden per pakbon; controleer eerdere pakbonnen bij deelleveringen.

Maatwerkkunststof heeft nog eigen factuur-/offerte-/orderbevestigingtemplates en betaalconfiguratie nodig. De lokale server laat voorlopig uitsluitend de eigen pakbon omzetten; andere documenttypen en betaalroutes blijven geblokkeerd. Hij valt niet terug op Spatlappen-templates of betaalcredentials. De calculator en algemene CRM-functies werken lokaal wel.

Er zijn geen Tikkie-sleutels of klantback-ups overgenomen. Maak geen echte betaalverzoeken als test.

## Onderhoud

Langere gebruikersacties tonen na 500 ms een kleine laadbalk onderaan: onder meer CRM laden, formulieren opslaan, documenten/voorbeelden maken, uploads/downloadvoorbereiding, back-ups, mail/Gmail, betalingen controleren, Stap terug en AI/spraakherkenning. De balk toont de actieve stap en beweegt zolang de echte actie loopt; er wordt geen percentage of resterende tijd verzonnen. Snelle acties en controles op de achtergrond tonen niets. Bij afronding verdwijnt de balk; bestaande foutmeldingen blijven bij de actie staan. Op de betrokken knoppen/formulieren voorkomt de bestaande of aanvullende busy-guard dubbelklikken. Er zijn geen automatische herhalingen of wijzigingen aan provider-aanvragen toegevoegd.

- `admin/`: gedeelde CRM-interface en opslagadapter.
- `shared/companies.js`: bedrijfsprofielen en toolkeuze.
- `shared/state-validation.js`: gedeelde controle van bedrijfsvelden/ID's.
- `tools/costing/`: rekentool en koppeling naar de orderregel.
- `deploy/targets.json`: afzonderlijke publieke opslaginstellingen voor toekomstig publiceren; onbekende doelen blijven leeg.
- `scripts/release.mjs`: toekomstige gecontroleerde publicatie, nu niet uitgevoerd.
- `migrations/0003_company_identity.sql`: toevoegende bedrijfsregistratie; wijzigt/verwijdert geen bestaande dossiers.

De bekende HTML-injectie in dynamische formulierlabels is verholpen. Productmaten en geneste IDs worden voortaan op de server en bij back-upimport gecontroleerd. Onveilige bestaande invoer wordt afgewezen, niet stil verwijderd; als dat bij echte legacy-invoer gebeurt, eerst gericht onderzoeken en omzetten met back-up. Niet handmatig de database wissen.

Nog niet toegevoegd: MFA/persoonlijke accounts, volledige CSP voor uitvoerbare scripts en automatische R2-opruiming. De aanpassing aan loginlimieten voorkomt alleen dat onbekende e-mailadressen de gezamenlijke accountteller verhogen; het probleem van gerichte accountblokkering is niet volledig opgelost.

## Controles

`npm run check` voert JavaScript-syntaxcontrole, bestaande CRM-tests, nieuwe gegevensbehoud-/bedrijfsisolatie-/calculatiekoppelingtests, assistent- en gesimuleerde OAuth-/streamingtests, 43 oorspronkelijke rekentooltests en beide bedrijfsbuilds uit. Geen browser, productiegegevens of echte providerverzoeken.

De lokale pagina's, juiste toolroutes en blokkering van verkeerde tools/hostnamen zijn via HTTP gecontroleerd. De gebruiker controleert de interface zelf; er is geen browsercontrole uitgevoerd.

## Later pas publiceren

Gebruik voorlopig de localhost-versies. Pas publiceren nadat de gebruiker daar opdracht voor geeft.

De GitHub-workflows liggen lokaal klaar. Een push controleert de code; publiceren is een afzonderlijke handmatige actie. Dit schakelt niet automatisch de bestaande Cloudflare- of Render-auto-deployinstellingen uit. Controleer die apart voordat deze code aan een bestaande live repository wordt gekoppeld/gepusht.

`npm run release:plan -- --environment production` toont ontbrekende instellingen zonder externe aanvragen of wijzigingen. De Spatlappen-productie-D1/R2/projectidentiteiten zijn vastgezet op de bestaande waarden. Nieuwe bedrijfs- en testopslag moet eerst afzonderlijk worden ingericht. Testopslag mag nooit productieopslag delen.

De toekomstige releasecontrole verifieert gekozen bindings, controleert beide bedrijfsbuilds, registreert bedrijf, bewaart D1-herstelpunten en publiceert met dezelfde Git-versie. Dat is geen volledige R2-back-up en een code-rollback herstelt geen gewijzigde data. Bestanden blijven bij gewone code-updates in dezelfde R2-opslag staan; klantgegevens worden niet opnieuw geïmporteerd.

Een toekomstige release naar beide projecten is niet atomair. `.local/release/last-release.json` houdt bij welke publicatie geslaagd of mislukt is. Bij gedeeltelijk slagen de status onderzoeken; niet blind beide databases terugzetten.

Voor een codepakket zonder privéconfiguratie: `npm run prepare:github`. Dat maakt uitsluitend lokaal `.local/github-upload`, zonder iets te uploaden. De oude V1-overdracht staat als historische context in `docs/OVERDRACHT-V1.md`.


Feedback voor ontwikkeling staat lokaal in een vaste privémap buiten de codeversie (`~/Documents/Codex/CRM-feedback`), gescheiden per bedrijf. Zie [FEEDBACK.md](FEEDBACK.md) voor herstel, meenemen naar een volgende versie/computer en de veilige afhandelwerkwijze. De online feedbackopslag is voorlopig behouden. Huidige accountinrichting en resterende beveiligingspunten: [docs/ACCOUNTS-EN-BEVEILIGING.md](docs/ACCOUNTS-EN-BEVEILIGING.md).

AI prompt en export voor een eigen AI-chat: zie [docs/AI-IMPORT-EXPORT.md](docs/AI-IMPORT-EXPORT.md). De knop Exporteren voor AI staat op iedere CRM-pagina; kies bij een order desgewenst het hele klantdossier.
