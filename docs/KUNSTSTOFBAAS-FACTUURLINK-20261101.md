> Nieuwe bron1november: twee werkelijk aangeleverde PDF’s read-only gelezen en visueel bekeken als documentbron; maanddatums/gescheiden koplabels, product/SKU/CNC/voettekstverzending aangevuld. De eerdere linktoegangsweigering blijft geldig, maar voorbeeld-PDF ontbreekt niet meer. Intern URL-order-ID blijkt geen volwaardig bestelnummer; dat niet als logistieke referentie overnemen. Zie KUNSTSTOFBAAS-LOGISTIEK-20261101.md. Geen applicatietest of factuurregistratie.

> Nieuwste bediening1november: [directe invoer](KUNSTSTOFBAAS-DIRECTE-INVOER-20261101.md) zet hetzelfde factuurformulier in de Kunststofbaas-tab. Link/PDF/bedragen direct zichtbaar; bronkeuze triggert lezen, financiële acceptatie blijft expliciet. Geen accountlogin of geslaagde linktoegang gebouwd/bewezen. Alleen bron/lokaal, geen tests/publicatie.

# Kunststofbaas-factuurlink en controleerbaar kostenvoorstel

1 november 2026. Lokaal brongebouwd, jouw controle open. Geen tests, syntaxchecks, builds, browsercontrole, CRM-recordmutaties, mail of publicatie uitgevoerd. De zes aangeleverde links zijn alleen als documentbron gelezen: alle zes gaven HTTP 200 met HTML en de tekst “Je hebt onvoldoende rechten voor deze pagina.” Er is geen PDF ontvangen; opmaak, bedragen en regels van deze facturen zijn niet beoordeeld. Dit is geen op de werkelijke Kunststofbaas-facturen afgestemde of bewezen herkenning.

## Bediening

1. Open bij Maatwerkkunststof de ordertab **Kunststofbaas** → **Factuurlink / PDF → kostenvoorstel**. De bestaande ingang bij Inkoop & marge blijft ook beschikbaar.
2. Kies **Kunststofbaas-link plakken**, plak één oorspronkelijke factuurlink en klik **Link ophalen & lezen**. Het CRM haalt alleen de PDF op; het maakt nog geen financiële registratie. Werkt de link alleen met jouw accountlogin of is hij verlopen, kies **Openen bij Kunststofbaas**, download de PDF in jouw eigen browser en kies **Zelf gedownloade PDF kiezen**. Daarna **PDF lezen & kosten voorstellen**. Jouw login wordt niet overgenomen.
3. Controleer het origineel, factuurnummer/datum, netto/btw/bruto, leveranciersbestelnummer en klantorders. Een nummer uit de downloadlink is afzonderlijk beschikbaar als bewuste voorstelactie; het is geen uitgelezen factuurgegeven en verandert niet het bestelnummer van de klantorder.
4. Herkenning gebruikt duidelijke koplabels en beschikbare tabelkolommen voor aantallen en hele nettoregelbedragen. CNC/frezen, opstart/instellen, verzending en overige expliciete bijkomende kosten krijgen aparte voorstelregels. Die kostenregels zijn geen extra fysieke productstuks. Productkoppelingen worden niet gegokt; kies ze zelf. Gedeelde kosten kunnen gezamenlijk of uitsluitend aan één betrokken order worden toegewezen.
5. Elk bedrag en elke regel blijft bewerkbaar. Controleer kortingen, bruto versus netto en of bewerkings-/transportkosten al in productregels of andere kostenbronnen zitten. De regels moeten in centen exact netto vormen en netto + btw moet exact bruto zijn. Aftrek blijft jouw keuze. Werkelijke betalingen zijn afzonderlijk en optioneel: een factuur is geen betaling.
6. Controleer elke regel en bevestig onderaan **Kosten accepteren & factuur bewaren**. Alleen deze stap gebruikt de bestaande factuur-/kosten-/bewijsopslag, versiecontrole, duplicaatbewaking en revisiehistorie. De eerdere bron blijft bij een aanpassing behouden. Geen tweede kasboek, nieuwe purchaseId of PACKS-handeling.

Een nieuw voorstel vervangt bestaande bedragen/regels alleen met de afzonderlijke vervangkeuze. Een mislukte download/tekstherkenning/opslag behoudt het formulier en de gekozen bestanden. De bronkeuze is expliciet; een bestand in een andere, verborgen bronkeuze wordt niet stil gebruikt. Bij bestaande facturen begint de bronkeuze bij hun opgeslagen PDF.

## Pakbon en andere documenten

**Controledocument toevoegen** biedt dezelfde link-/PDF-keuze. De gewone leverancierspakbonlink moet het werkelijke documenttype packing-slip hebben. Een gebruikersaccountbevestiging of andere URL valt buiten deze downloader. Orderbevestigingen kunnen nog als eigen PDF worden gekozen.

Dit formulier bewaart alleen documentbewijs en vergelijkt tekstaanwijzingen met de order. Geen kosten, betalingen, bestelling of verzending worden daar geregistreerd. Een als pakbon/bevestiging gemarkeerd document blijft uitgesloten van de factuurinvoer. Een factuur die als controledocument is opgeslagen kan bewust via de afzonderlijke factuurinvoer als bestaande PDF worden gekozen. Typekeuze of URL is geen bewijs van juiste inhoud: bekijk de werkelijke PDF.

## Importfeedback

In **Importfeedback · wat werd goed of fout gelezen?** kun je herkenning als kloppend of onjuist beoordelen en een melding klaarzetten. Het gewone feedbackformulier komt boven je factuurformulier; je kosteninvoer blijft erachter staan. Pas **Melding bewaren** bewaart feedback met de bestaande Melding-ID/status. Niets wordt automatisch afgehandeld.

Het vluchtige verslag onderscheidt link ophalen/ontvangen/mislukt, PDF-tekst gelezen/mislukt, voorstel ingevuld/niet ingevuld, bewust behouden eigen invoer, handmatige aanpassing en geaccepteerde opslag. Downloadfouten tonen waar beschikbaar een vaste reden en trace-ID. Per sessie maximaal 30 gebeurtenissen en 20 factuurregistraties in geheugen. Dit is geen duurzame of volledige financiële audit; het verdwijnt bij herladen. Download het verslag of bewaar expliciet een feedbackmelding.

Standaard alleen vaste stappen/aantallen, geen factuurwaarden. Met jouw afzonderlijke keuze ook voorgestelde en huidige bedragen plus maximaal 20 regels, zonder interne klant-/order-ID's, toegangslink, ruwe tekst of PDF. Omschrijvingen kunnen persoonsgegevens bevatten. Het feedbackformulier bevat een begrensd JSON-uittreksel; het downloadverslag is afzonderlijk beschikbaar. Feedback helpt bij volgende bronverbeteringen, maar traint geen automatisch financieel model en verandert geen toekomstige bedragen zonder jouw controle.

## Bron en beveiligingsgrenzen

- Alleen het vaste HTTPS-documentadres van kunststofbaas.nl / www.kunststofbaas.nl, één numeriek ordernummer en bekende parameters/documenttypen. Geen willekeurige URL's, redirects, login-cookies, referer of andere accounts.
- URL/toegangssleutel blijven tijdelijk in het formulier/verzoek. Na succesvolle download wordt het URL-veld gewist. Geen opname in factuurrecord, bestandsnaam, herkomst, AI-prompt of importverslag vanuit dit URL-veld. Fouten bevatten vaste tekst, geen providerantwoord of ruwe URL.
- Serververzoek alleen Maatwerkkunststof en eigen Origin/JSON, cloud met bestaande login. Offline/mailproefstand haalt geen leveranciersdocument op. Begrensd verzoek en PDF maximaal 15 MB, PDF-header, downloadtimeout. Header/omvang zijn geen volledige PDF-inhoudsvalidatie. Er is geen permanente downloadcache.
- admin/documents/supplier-link beheert de bediening; shared/supplier-document-link valideert de URL. cloudflare/supplier-document en supplier_document_local.py halen alleen bytes op. Geen financiële state/files-schrijfroute in deze downloaders.
- PDF-tekst/kolommen worden pas op jouw klik gelezen met de bestaande vastgezette PDF.js-lezer. Daarvoor moet de bibliotheek kunnen laden. Geen documentupload naar een AI door het CRM. Een eigen AI-prompt kopieer je zelf; daarvoor blijft dezelfde expliciete JSON-controle gelden.
- shared/supplier-invoice-recognition levert uitsluitend voorstellen bovenop de bestaande headerherkenning. shared/supplier-invoice-intake blijft eigenaar van financiële validatie en opslagprojecties. Geen migratie/historische herberekening.

## Beperkingen en nog te beoordelen

Geen OCR voor scans, automatische credit-/valuta-/negatieve-kortingverwerking, product-/materiaal-/maatmatch of fiscale aftrekvaststelling. Onduidelijke kolommen/regelafbrekingen/meerdere bedragen blijven handwerk of de bestaande eigen-AI-route. CNC/opstart moeten werkelijk exclusieve nettokosten zijn; herkenning weet niet of ze al in een productprijs zitten. Kortingen verdeel je handmatig over de bijbehorende regels. Productie-/verzend-/PACKS-status veranderen niet door dit voorstel.

Een daadwerkelijk gedownloade voorbeeldfactuur, liefst ook één met CNC/opstart, ontbreekt nog om de leverancieropmaak gericht naast de herkenning te leggen. Geen van de zes aangeleverde facturen is door Codex verwerkt of als kosten bewaard. Jouw eigen controle omvat herkenning, invoerbehoud, bronwissels, bijlagen, dubbele facturen, bedragen/koppelingen/aftrek/betalingen, twee tabs, foutmeldingen, feedback en back-up. Spatlappen mag deze Maat-functie niet aanbieden. Gebruikersacceptatie en livepublicatie blijven open.

## Lokale activering

Er is geen server herstart of browser ververst door Codex. Nieuwe lokale downloadroute vereist herstart van de lokale CRM-server. Bewaar/sluit eerst open invoer; dubbelklik daarna in de projectmap op **Herstart-beide-CRMs.command**, ververs de lokale pagina en open het formulier opnieuw. Deze optionele launcher herstart uitsluitend zijn eigen geverifieerde eerdere startproces. Een onbekende bezette poort wordt niet gestopt; sluit dan bewust je bestaande startterminal en gebruik de gewone startknop. Geen gegevensopslag wordt gewist. De launcher zelf is niet uitgevoerd of functioneel beoordeeld.

Bouwtaak maat-invoice-link-20261101: review/local voor de bron. Bestaande financiële batches, feedbackstatussen, gedeeltelijke PACKS-inrichting/proeven en publicatiescope behouden. Centrale CSS ongewijzigd.
