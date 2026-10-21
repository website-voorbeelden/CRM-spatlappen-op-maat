# Actuele online uitbreiding — 20 oktober 2026

Gekozen: online CRM plus persoonlijke AI-server met eigen ChatGPT-plan. Bronimplementatie en installatie in [ONLINE-AI.md](ONLINE-AI.md). Nog geen eigen server/activering/publicatie, geen tests uitgevoerd. Oudere uitspraken hieronder over uitsluitend lokale bediening beschrijven de vorige situatie; een lokale login blijft geen automatische online aansluiting.

# CRM-assistent lokaal gebruiken

1. Start beide CRM’s met Start-beide-CRMs.command.
2. Open http://localhost:3010/admin/#assistant of http://localhost:3011/admin/#assistant en herlaad na een code-update.
3. Verbind via Continue with ChatGPT als je nog niet bent gekoppeld. Log zelf in en geef toestemming voor gebruik van je ChatGPT-plan.
4. Kies een beschikbaar model en typ of dicteer je vraag. De modelkeuze wordt onthouden; er worden geen gesprekken of inlogtokens in die voorkeursinstelling opgeslagen.
5. Bekijk bij een wijziging alle velden onder Voorstel controleren. Voorstel opslaan past uitsluitend dat voorstel toe; Voorstel verwerpen verandert niets.

Voorbeelden:

- Zoek klant Janssen en toon de openstaande orders.
- Bereid uit onderstaande e-mail een nieuwe klant voor. Vraag ontbrekende gegevens na.
- Bereid een nieuwe klant Testbedrijf BV voor met een order voor twee producten, 600 × 350 mm, €50 per stuk exclusief 21% btw.
- Voeg aan de notities van order 3001 toe dat de klant vrijdag terugbelt.

## Vanaf elke CRM-pagina

Assistent en Feedback melden staan bovenaan het zijmenu, in aparte knoppen. Er liggen geen zwevende AI-/feedbackknoppen meer over elkaar. Gebruik Assistent of ⌘/Ctrl + O terwijl het CRM-tabblad actief is. De oude ⌘/Ctrl + Shift + K blijft als alternatief beschikbaar zolang je de standaardbindings gebruikt. Onder het tandwiel → Praten & toetsen kun je eigen sneltoetsen vastleggen, uitschakelen en herstellen; voorkeuren worden per bedrijf/browser bewaard. Het zijpaneel blijft open tijdens navigeren. Concepttekst, antwoorden en onverwerkte voorstellen blijven bij navigeren in het geheugen; herladen begint opnieuw. Sluit eerst een openstaand CRM-formulier voordat je een voorstel opslaat.

Bij een geopende klant of order staat de dossiernaam boven het gesprek. Geopend dossier gebruiken geeft alleen de gecontroleerde dossieridentiteit mee; de assistent zoekt benodigde feiten zelf op. Schakel dit uit als je over een andere klant/order wilt spreken. Op lijstpagina’s wordt geen willekeurig dossier geselecteerd.

⌘/Ctrl + P opent de chat en start praten, of stopt de lopende opname. Op desktop verstuurt Enter je tekst; Shift + Enter geeft een nieuwe regel. Op mobiel geeft Enter een nieuwe regel; tik op Vraag sturen. ⌘/Ctrl + Enter blijft ook beschikbaar. Escape stopt praten, sluit openstaande assistentinstellingen of sluit het paneel. Stop antwoord breekt de lopende aanvraag af; reeds gemaakt AI-gebruik wordt daardoor niet teruggedraaid. Bij een fout blijft je vraag staan en kun je expliciet Opnieuw proberen kiezen. Er worden geen automatische herhaalverzoeken uitgevoerd.

## Praten en voorlezen

Op deze Mac is lokale Whisper-spraakherkenning geïnstalleerd. Klik onder Praten op Microfoon kiezen, of open het tandwiel en kies onder Microfoon de invoer die je gebruikt. Een expliciete keuze wordt per bedrijf alleen in deze browser onthouden, ook na herladen. Een tijdelijk onvolledige apparatenlijst vervangt die keuze niet door Systeemstandaard. Klik op Praten, geef microfoontoestemming als daarom wordt gevraagd en spreek een korte zin. Na toestemming worden de apparaatnamen zichtbaar. Microfoons verversen haalt de lijst opnieuw op. De geluidsmeter reageert ook op zachtere stemmen; de melding onder de knop geeft aan of er daadwerkelijk geluid binnenkomt. Klik op Stop praten: daarna verschijnt de herkende tekst. Controleer namen, bedragen en aantallen en klik zelf op Versturen.

Bij Geen geluid opgenomen: kies expliciet de ingebouwde MacBook-microfoon of je aangesloten microfoon. Als die ook stil blijft, controleer microfoontoegang voor Codex en de gekozen invoer in de systeeminstellingen. Toestemming alleen betekent niet dat er geluidsgegevens binnenkomen. De opname gebruikt nu AudioWorklet waar beschikbaar, met een reservepad voor oudere browsers. Ontbrekende audioblokken, een gedempte/losgekoppelde microfoon en stilte krijgen afzonderlijke meldingen. Zachtere opnames worden vóór lokale herkenning versterkt.

Maximaal één minuut opnemen. Sluiten, wisselen van tabblad of herladen stopt de opname. De opname gaat uitsluitend naar de lokale hulpdienst op deze Mac, wordt herkend en vervolgens samen met tijdelijke transcriptiebestanden verwijderd. Hiervoor worden geen ChatGPT-tokens gebruikt. Alleen de later expliciet verstuurde vraag gebruikt de Plus-koppeling.

De lokale runtime staat in .local/speech-runtime/ en is uitgesloten van GitHub-pakketten en publieke routes. whisper.cpp v1.9.5 is lokaal gebouwd met de meertalige Whisper-base-gewichten (ongeveer 150 MB); de modeldownload is met SHA-256 gecontroleerd. Er is geen aparte betaalde spraak-API aangesloten. De bron en MIT-licentie staan vermeld in de lokale runtime. Bij gewone code-updates deze map behouden; een nieuwe Mac heeft een nieuwe passende runtime nodig.

Als de lokale runtime of audio-opname ontbreekt, wordt waar mogelijk browserdicteren aangeboden. Die browserdienst kan audio naar zijn eigen provider sturen; de interface geeft dat dan aan. Een browser zonder spraakondersteuning toont Spraakopties met systeemdicteren als alternatief. Een andere browser heeft zijn eigen lokale CRM-opslag.

Voorlezen gebruikt de stemvoorziening van je browser/computer, alleen na een klik op Voorlezen. Stop voorlezen beëindigt dit. Er worden daarvoor geen OpenAI-spraakaanvragen gedaan.

## Gebruik en snelheid

Onder het invoerveld opent Gebruik de duur, het aantal AI-stappen en de gemelde tokens van het laatste geslaagde antwoord. De tabbladteller telt uitsluitend gemelde tokens van geslaagde antwoorden; mislukte/gestopte aanvragen kunnen ook gebruik kosten en ontbreken daarin. ChatGPT Gebruik beheren blijft de plek om je daadwerkelijke planlimieten te bekijken.

De gespreksgeschiedenis die meegaat is beperkt tot de laatste acht berichten en maximaal 16.000 tekens samen. Nieuw gesprek laat die geschiedenis weg. Een bedrijfsoverzicht gebruikt get_summary met korte totalen, zodat niet alle dossiers hoeven te worden opgehaald. Notities toevoegen gebruikt append_notes en behoudt bestaande tekst. Bestanden, ontwerpen en betaalprovider-geheimen zijn al vóór de lokale aanvraag uit de overdracht weggelaten.

In fictieve tests met de gekoppelde Plus-verbinding kostte een notitievoorstel met drie AI-stappen 17,8 seconden en 3.772 gemelde tokens; een kort overzicht met twee stappen 12,2 seconden en 2.441 tokens. Dit zijn voorbeelden, geen vaste prijs of snelheid. Lokale herkenning van één synthetische Nederlandse zin duurde ongeveer 0,5 seconde op deze Mac. De gebruiker heeft daarna zelf bevestigd dat de geluidsmeter en echte microfooninvoer werken.

## Gegevens en updates

De twee CRM’s hebben eigen browseropslag. De assistent ziet uitsluitend de dossiers uit de CRM-versie waarin je de vraag stelt. Hij haalt niet vanzelf je bestaande online Cloudflare-gegevens op. Een back-upimport of een toekomstige beveiligde online koppeling moet afzonderlijk worden ingericht.

Een voorstel wordt maximaal 30 minuten bewaard, en alleen in het browsergeheugen. Na navigeren binnen het CRM kan het nog aanwezig zijn; na herladen is het weg. Een dossier dat intussen gewijzigd is blokkeert opslaan: vraag dan een nieuw voorstel. Stap terug is beschikbaar via de normale lokale CRM-functie. Maak regelmatig een volledige CRM-back-up.

Persoonlijke ChatGPT-toegang staat lokaal in .local/chatgpt-assistant/, apart van CRM-gegevens en broncode. Deze map is niet publiek bereikbaar en wordt uitgesloten van het GitHub-codepakket. Code updaten en servers herstarten wist geen klantgegevens of koppeling. Browsergegevens verwijderen of een andere hostname/browser gebruiken kan lokale dossiers wel onbereikbaar maken; werk daarom steeds via dezelfde localhost-adressen en browser.

Je vraag, recent gesprek en opgezochte tekstvelden gaan naar OpenAI. Bestanden, ontwerpen, calculatorinvoer en betaalprovider-tokens gaan niet mee via de CRM-tools. Tekst boven 10.000 tekens per veld wordt bij lezen verkort en mag niet via een assistentvoorstel worden vervangen. Gebruik voor zulke velden het normale CRM-formulier. Gesprekken worden niet lokaal op schijf of in CRM-back-ups opgeslagen. Store:false geldt voor aanvragen; dit is geen uitspraak over alle providerretentie.

## Eerste versie

Beschikbaar: klanten/orders lezen en zoeken, kort bedrijfsoverzicht, notities toevoegen met behoud van oude tekst, klanttekst aanpassen, nieuwe klant/order met één product voorstellen, bestaande ordernotities/status/datums voorstellen. Een voorstel kan maximaal tien wijzigingen bevatten. Btw, aantallen en bedragen worden gecontroleerd; geld gebruikt gehele centen. Bij limieten, netwerkfouten of onvolledige antwoorden wordt niets opgeslagen.

Nog niet beschikbaar: bestaande orderproducten/prijzen wijzigen, automatische betalingen, documenten/e-mails door de AI versturen, verwijderen, werken met ontwerp-/calculatiebestanden, automatische acties zonder menselijke controle en directe toegang tot de live database. De online bedrijfsapp gebruikt deze lokale Plus-hulpdienst niet.

## ChatGPT-toegang

De twee lokale versies delen één actieve ChatGPT-koppeling. Account toevoegen en de accountkeuze zijn beschikbaar; wisselen begint een nieuw gesprek. Gebruik telt mee binnen je ChatGPT-plan en wordt gedeeld met ander gebruik van je abonnement. Geen aparte API-sleutel nodig voor deze lokale aansluiting. Beschikbare modellen komen uit het actuele accountcatalogus; de volgorde van OpenAI blijft behouden.

Als toegang verloopt, vernieuwt de lokale hulpdienst die waar mogelijk. Anders krijg je de vraag opnieuw te verbinden. Loskoppelen verwijdert lokaal toegang en probeert OpenAI-toestemming in te trekken; bij een onzekere intrekking wordt dat aangegeven. Je kunt toestemming ook beheren in ChatGPT.

## Officiële OpenAI-documentatie

- [Registratie en inloggen](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)
- [Modellen en afgeronde streaming](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)
- [Beperkingen van de preview](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations)

## Controle

npm run check omvat CRM-, calculator- en assistenttests plus beide bedrijfsbuilds. De automatische tests gebruiken fictieve gegevens, gesimuleerde OpenAI-antwoorden, microfoon-/audiofixtures en een tijdelijke lokale server voor annulering. Ze openen geen browser en gebruiken geen echte microfoon. Aanvullend zijn de bediening en navigatie in een tijdelijke DOM-test gecontroleerd, en is de lokale herkenner getest met synthetische Nederlandse spraak. Aanvullend is de echte, door de gebruiker gekoppelde Plus-verbinding getest met uitsluitend fictieve klant/order-voorstellen, zonder browseropslag of echte cloudgegevens te veranderen. De gebruiker controleert zelf de interface.


Spraakbronnen: [whisper.cpp](https://github.com/ggml-org/whisper.cpp/releases/tag/v1.9.5), [modelrepository](https://huggingface.co/ggerganov/whisper.cpp). Modelhash: 60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe.


## Rustigere chatindeling

Het gesprek staat in één scrollgebied; de invoer blijft onderaan bereikbaar. Nieuwe chat en Instellingen staan in de kop. Account, model, microfoonkeuze, privacyuitleg en toetsenoverzicht zijn samengebracht onder Instellingen. Voorstellen staan direct bij het gesprek, met een aparte bevestiging. Op brede schermen krijgt de chat een eigen kolom naast het CRM; op kleinere schermen opent hij als paneel. Concepttekst en lopende aanvragen blijven bij navigeren behouden.

Op verzoek van de gebruiker zijn ⌘/Ctrl+O en ⌘/Ctrl+P gekozen. Ze nemen binnen het CRM de gebruikelijke openen-/afdrukfuncties over wanneer de toets het document bereikt. De gebruiker heeft bevestigd dat beide in zijn in-app browser werken. Het zijn geen systeembrede sneltoetsen. Knoppen en de alternatieve chattoets blijven beschikbaar wanneer een andere browser of hostapp een combinatie eerder opvangt.

Ontwerpinspiratie: [assistant-ui](https://github.com/assistant-ui/assistant-ui) en [sidekickcn](https://github.com/BankkRoll/sidekickcn). Alleen de indelingsprincipes zijn gebruikt; geen nieuwe externe AI-dienst, UI-framework of providercredentials toegevoegd.

Microfooncontrole van 13 oktober: de gebruiker meldde opnieuw een stille meter. De lokale herkenner verwerkt synthetische spraak nog in ongeveer 0,5 seconde; dat bewijst geen werkende fysieke invoer. Tijdelijke lokale diagnose houdt uitsluitend opnamefase, aantallen audiomonsters, signaalsterkte en de toestand van de audiocontext/invoer bij. Geen audio, transcript, apparaatnaam of hardware-ID in deze diagnose. Hoogstens tien sessies met twintig meetpunten, alleen in geheugen, verval na vijf minuten en afscheiding per bedrijf. De routes zijn alleen via de beveiligde lokale proxy bereikbaar. Microfoonvoorkeur bevat uitsluitend de gekozen browser-device-ID in lokale browseropslag en gaat niet naar OpenAI. Een verbindingsfout tijdens spraakcontrole kiest niet stilletjes de oude browserherkenner; Praten probeert opnieuw, met een controletermijn van vijf seconden. De praatknop wacht op deze controle zodat klikken tijdens opstarten niet de verkeerde herkenner start. Definitieve bevestiging van de echte microfoon blijft aan de gebruiker.

Paginacontext (13 oktober): alle CRM-pagina’s worden herkend: Overzicht, Analytics, Klantorders, Orderkaart, Inkoopbestellingen, Klanten, de bedrijfstool, Feedback, Instellingen & back-up en Assistent. Boven het gesprek staat de huidige pagina, inclusief het daadwerkelijke dossier-tabblad. Paginacontext gebruiken schakelt de context aan/uit; de voorkeur blijft in deze bedrijfsbrowser bewaard. Wat gaat mee? toont vooraf de beperkte inhoud. Wijzigingen in zoekfilters, weergave, periode of tabblad worden bij de volgende vraag bijgewerkt. Navigeren verstuurt niets automatisch. Per vraag blijft zichtbaar welke pagina als context is gebruikt; herhalen van een mislukte vraag behoudt haar oorspronkelijke context. Uitschakelen voorkomt nieuwe paginacontext, maar verwijdert geen eerdere gesprekstekst; Nieuw gesprek wist de gesprekshistorie.

Zoeklijsten delen actieve zoekfilters en aantallen, plus maximaal twintig dossierverwijzingen in dezelfde volgorde als de lijst; dit is expliciet een beperkte selectie bij grotere lijsten. Analytics deelt de op de pagina berekende kerncijfers en gekozen periode, inclusief het aantal orders met voorlopige kosten. Ontvangen betalingen gebruiken hun ontvangstdatum; orderomzet gebruikt de orderdatum. Te ontvangen/te betalen bedragen blijven over alle periodes, net zoals in de interface. Inkoop deelt uitsluitend referentie, getoonde kerncijfers en (op het ordertabblad) gekoppelde orderverwijzingen; geen extra schrijfbevoegdheid. Bestandsinhoud, ontwerpen/calculatorpayloads, credentials en openstaande formulierinvoer worden niet opgenomen. De losse ontwerp-/calculatortool in een ander tabblad wordt niet uitgelezen.

De backend controleert bedrijfsidentiteit en dossierverwijzingen opnieuw en beperkt pagina-, filter- en cijfervelden. Paginacontext wordt als brondata in een apart user-bericht vóór de vraag gezet en niet in de hogere applicatie-instructies. Dit volgt de officiële OpenAI-documentatie: https://developers.openai.com/api/docs/guides/prompt-engineering . Tests/assistant-page-context.mjs controleert beide bedrijven/alle pagina’s, tabbladen, privacy, limieten, uitgeschakelde context, ontbrekende dossiers en de promptplaatsing, zonder OpenAI-aanvragen. De tijdelijke DOM-test controleert navigatie, contextschakelaar, voorvertoning en contextbehoud bij herhalen.

Microfoontest: de gebruiker heeft na het laatste herstel bevestigd: Ja hij werkt. Dit bevestigt deze herstelronde.

De AI kan via crm.propose_email alleen mailtekst voorstellen bij een bestaande klant/order. Mail controleren & verder opent het normale mailformulier; opslaan en verzenden volgen uitsluitend jouw afzonderlijke bediening. Een veranderd/verlopen/ander-bedrijfsdossier wordt geweigerd. De AI leest geen sleutel, PDF, Gmail-inhoud of mailinstellingen en heeft geen verzend-/Gmailtools. Zie docs/EMAIL.md voor de lokale koppeling.

Mobiele bediening, mailvoorstellen en herbruikbare invulhulp: zie [MOBIEL-EN-INVULHULP.md](MOBIEL-EN-INVULHULP.md). Buiten huis vereist een aparte beveiligde online dienst; de huidige Plus-hulpdienst blijft lokaal.

## Sneller openen en aanvragen uit mail

De chatverbinding start zonder op de spraakdienst te wachten. Alleen Praten vraagt de spraakstatus op; een fout daarin houdt tekstchat niet tegen. Een geslaagde verbindingscontrole wordt 15 seconden hergebruikt bij herhaald openen/focus, met directe verversing bij accountwijzigingen. De modelcatalogus blijft binnen dezelfde verbinding behouden. Dit verkort de startbediening; de antwoordtijd van ChatGPT hangt nog van de vraag en provider af.

Bij een mail zonder order kun je Aanvraag herkennen gebruiken voor directe lokale veldherkenning. Zie [Aanvraagherkenning](AANVRAAGHERKENNING.md). De AI blijft beschikbaar voor inhoudelijke vragen en bestaande aanvraagvoorstellen. Die voorstellen tonen leesbare velden, bron en wat nog nodig is; onbekende velden wissen geen bekende aanvraaggegevens. Er is geen modeltraining of algemene automatische mailboxverwerking toegevoegd.
