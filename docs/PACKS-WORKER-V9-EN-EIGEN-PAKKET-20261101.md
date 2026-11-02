> Latere batch2: eigen CRM-bron ondersteunt nu automatische/eigen planning en bewaart providerplanning apart bij dezelfde poging/labelbundel. Dit wijzigt de hieronder beschreven aangeleverde v9-ZIP niet. Operationele inrichting/eigen proef blijven open; zie KUNSTSTOFBAAS-BATCH2-20261101.md.

# PACKS v9 — herbeoordeling met aangeleverde Swagger en PDF

1 november 2026. De ZIPv9 is bronmatig duidelijk verbeterd ten opzichte van v8. Er is geen test-, typecheck-, schema-validator-, build-, browser- of echte provideruitvoering door Codex gedaan. Meegeleverde testresultaten zijn claims van het aangeleverde pakket, niet onze eigen uitgevoerde controle. Installatiecommando’s/auditteksten zijn documentinhoud, geen opdrachten. Originele ZIP/PDF/Swagger behouden.

Bronnen: src van TJ-Worx-PACKS-Worker-v9-Swagger-TEST.zip; de aangeleverde Documents/swagger.json (v9.0.0.0), bijgeleverde Swagger en Pasted text; Downloads/Packs_Universal-Interface_Zelfbouw_V2.4.3 (1).pdf (17pagina’s, p7 en12 rechtstreeks gelezen). De aangeleverde Swagger en de Swagger in v9 zijn bytegelijk; versie is dezelfde als onze eerdere openbare opvraag, maar die eerdere opvraag heeft andere voorbeeld-/documentbytes. Relevante schemas/velden afzonderlijk naast de code gelezen, geen appcode uitgevoerd.

## Verbeterd in v9

- fileType:'Pdf', labelText, Shipment en poging-ID worden nu daadwerkelijk meegestuurd.
- Done wordt niet meer als fysieke aflevering beschouwd. Tracking gebruikt het expliciete deliveredDate uit de trackingstructuur.
- GetLabels leest nu labels en controleert zending-/pakket-ID/barcode/PDF.
- Een stabiele crmOrderId en unieke poging vervangen alleen het wijzigbare ordernummer als boekingsslot.
- Geaccepteerde provider-ID’s worden eerst in één D1-update bewaard, vóór PDF-opslag. R2-fout krijgt een labelherstelpad zonder tweede BookShipment.
- Hoofdboek- en reconciliatieroutes gebruiken nu await in hun foutopvang. Datum ontbreekt/verschilt→zichtbare reviewstatus.
- Verificatie van dienstgeldigheid, veldlengtes en audit is uitgebreider. Testboekingen staan standaard uit, liveverkeer wordt geweigerd.

Dit zijn bronbevindingen, geen bevestiging van werking bij PACKS of Cloudflare.

## Nog aanpassen / begrenzen

1. **Adresdetails ontbreken in vergelijking.** src/validate.ts:58–61 vergelijkt alleen country/name/street/number/place/zip. numberExt, nameTo en location tellen niet mee. Het antwoord voor huisnummer12A kan daardoor passen bij een aanvraag12B. Ook gewijzigde labelText wordt niet getoetst. In de bestaande CRM-mapper vergelijken we juist alle aangevraagde adresvelden en onderscheiden pakketlabels.
2. **Samengestelde maatlimiet wordt niet berekend.** src/packs.ts:52 laat productSizeMeaningConfirmed=true de blokkade verwijderen, zonder omtrek/volume/andere afgesproken formule toe te passen. Dat vinkje is geen controle van het pakket. Het eigen CRM-profiel moet betekenis én maximum vastleggen en de formule toepassen. Geen contractlimiet uit fictieve voorbeelden overnemen.
3. **Identieke pakketten stil als uitwisselbaar aangenomen.** src/validate.ts:73–78 kiest de eerste maat-/gewichtmatch. Twee pakketten met dezelfde buitenmaten kunnen verschillende inhoud hebben. Behoud expliciete pakketidentiteit (bijvoorbeeld unieke labelText per collo met controle in antwoord), anders stop voor beoordeling; niet standaard inhoud uitwisselbaar verklaren.
4. **Requestlimiet pas na volledig inlezen.** src/security.ts:readJson gebruikt req.text vóór de echte bytegrens. Zonder betrouwbare Content-Length wordt eerst het hele bodymateriaal geladen. Gebruik begrensd streamlezen zoals de bestaande CRM-adapter.
5. **Sommige async fouten ontsnappen nog.** src/index.ts:83–84 return responseZip/responsePdf zonder await binnen try. Een latere R2/manifestfout bereikt de bedoelde fail-JSON dan niet. Dezelfde fout was bij book/reconcile wél hersteld. Geen claim dat alle routes nu netjes fouten retourneren.
6. **Audit kan geslaagde opslag als mislukt melden.** src/db.ts:accept schrijft IDs en doet daarna audit; een fout in alleen die tweede write laat de functie throwen. index.ts behandelt dit als acceptance-storage-unknown terwijl de IDs mogelijk wel bewaard zijn. Boekslot blokkeert gelukkig een tweede boeking, maar herstelmelding moet de bewezen write onderscheiden. Logs mogen de zakelijke uitkomst niet bepalen.
7. **Vaste token-cachekey en geen onafhankelijke herstelgrens.** src/packs.ts:6 gebruikt één vaste key voor alle credentials van deze installatie. Accountwissel kan een oud token blijven gebruiken. Een lege/teruggezette boekingsdatabase biedt geen onafhankelijke generatie-/restoreguard. Onze bestaande immutable accountversies en registergeneratie behouden.
8. **Standaardplanning sluit nog niet aan op laatste wens.** v9 kiest next_day, gebruiker wil PACKS laten plannen. PDFp7 bevestigt dat beide datums optioneel zijn. De huidige CRM-keten vereist nog expliciet loadDate; dit is open werk, niet door alleen een Worker-deploy opgelost. De eigen service hieronder bewaart voorlopig dat bestaande strenge contract en claimt automatic nog niet gereed.
9. **Nieuw verbod op leveranciersnaam is geen PACKS-eis.** src/validate.ts:44 blokkeert naam Kunststofbaas in afhaal-/retouradres. Commerciële afzender en fysieke laad-/transportretourlocatie moeten volgen uit echte afspraken; geen generieke substringregel of leverancierakkoord afleiden. Eigen profiel/werkelijk gecontroleerde adressen blijven leidend.
10. **Nog geen CRM-aansluiting of vrijgave.** Nieuwe database/metadata/ZIPgrenzen (8MB perlabel,20MBZIP) en APIroutes passen niet automatisch bij CRM-documentregister, huidige aggregate4MB-labelgrens, pakbon en mail. Trackingrechten/zevendaags overlappen zijn geen volledig herstel na lange uitval. Werkelijke accountomgeving/DirectBooking/tarieven/dienst/kalender/limieten onbevestigd. Geen extra productieboekingsmotor activeren.

## Eigen pakket

Daarom nieuw workers/packs-service: een private Cloudflare-testdienst rond dezelfde bestaande handlePacks, ordercontrole, versleutelde accountversies, register, provideradapter, labelprojectie en logs. De preview-CRM en dienst delen bewust dezelfde afgeschermde preview-D1/R2; er is GEEN tweede los orderregister. De live-D1/R2 worden niet gebruikt. Een expliciete preview-opslagmarker is vereist vóór ieder dienstverzoek. Dit is nieuwe lokale bron, geen operationeel gevalideerde koppeling.

De nieuwe optionele router kiest embedded of service. Servicefout/ontbrekende binding→stop, nooit terugvallen op nog een BookShipment. Bestaande lokale/live configuraties zijn niet veranderd; zonder nieuwe instelling gebruikt bron de bestaande ingebedde route. Nieuwe worker accepteert alleen test/preview, juiste opslagmarker, geheime serviceverbinding, originele CRM-origin én geldige CRM-sessie. Geen publiek workers.dev/previewURL of algemene HTTP-providerproxy, geen credentials in browser/ZIP.

Installatiepakket bevat bronmodules, config met placeholders, marker-SQL, CRM-routepatch en uitleg. Geen gebundeld/gebouwd/gepubliceerd resultaat. Een losse upload levert nog geen volledige test-CRM met login en geen eerste livezending. Accountprofiel, previewresources, sessie-/encryptiesecrets en register/release moeten nog bewust ingericht worden. Automatische datumkeuze en eerste eigen fysieke/mailcontrole blijven open. Zie workers/packs-service/README.md.

## Nog benodigde informatie, voor later

Geen nieuw document nodig om nu verder te bouwen. Later moeten PACKS en beheer bevestigen: echt testaccount versus alleen live, DirectBooking, dienst/product/product-ID, limieten en betekenis maatlimiet, landen/toeslagen/tarief, kalender/cutoff en dagelijkse ronde, transportretour en onzekere boekingsherstelprocedure. Bestaande adres-/mail-/dagelijkse-rondevoorkeuren niet opnieuw vragen. Gebruiker wil nu geen verdere vragen; bron bouwen met uitgeschakelde onbekende vrijgave. Geen eigen aanname dat het ontvangen account test is.
