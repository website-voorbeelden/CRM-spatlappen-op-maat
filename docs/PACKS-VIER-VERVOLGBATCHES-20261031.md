> Latere bronronde1november: uitvoeringsbatch3 review/local, nieuwe maat-packs-operation-20261101 review/local; HTTP/UI/configuratie/projector/bundel/logs aangesloten in bron. Hoofdtaak en operationele/proef-/batch2/4-inrichting blijven open. Geen tests/provider-/dataactie/publicatie. Zie PACKS-BOEKEN-EN-LOGS-20261101.md.

# PACKS — vier vervolgbatches, proefmail en eigen controle

31 oktober 2026. Alleen Maatwerkkunststof/Kunststofbaas. Deze indeling vervolgt de eerdere vier PACKS-batches; die worden niet als voltooid herschreven. Bouwstand, gebruikerscontrole en lokaal/live blijven afzonderlijk. Een nieuwe wens of aanwezig bronbestand is geen geslaagde werkingstest.

> Expliciete keuze31oktober op de twee voorgestelde offline testbestanden: **Nee, ik controleer het zelf.** Niet uitgevoerd; deze bronwijzigingen en online proefgrenzen zijn nog niet functioneel beoordeeld.

## Vier concrete taken

| Batch / vaste taak-ID | Werk | Huidige bouwstand | Omgeving / jouw controle |
|---|---|---|---|
| 1 — maat-packs31-batch1 | Zwakke punten, actuele documentatie en keuzes bij pakket/adressen/datums | Bronreview/advies en gerichte veldfocus/controlebehoud lokaal uitgewerkt; eerdere PR01–PR05 behouden | Alleen lokaal; waarden/bediening nog door Philippe controleren |
| 2 — maat-packs31-batch2 | Generieke proefmail met de twee actuele bijlagen; afzonderlijke online proefomgeving | Proefmail-/ontvanger-/server-/proefbeleidsbron en eigen cloudconcept-/bestandsvergelijking lokaal gebouwd, aparte configuratievoorbereiding | Gedeeltelijk; helpers niet herstart, geen online resources/URL, geen functionele proef |
| 3 — maat-packs31-batch3 | Werkelijke PACKS-adapter, contractgebonden validatie, boeken en labelherstel | Client/contractmapping/interne boek-/GetLabels-bron gedeeltelijk gebouwd; bestandsprojectie/inrichting/aansluiting open | Niet actief/lokaal; account/dienst/contract en afgesproken verificatie open |
| 4 — maat-packs31-batch4 | Vergelijking lokaal/online, jouw eindcontrole, eerste bedoelde echte zending en publicatie | Readonly eindcontrole/rapportvergelijking en finale bijlagebevestigingen lokaal brongebouwd; ingebruikname open | Niet uitgevoerd/beoordeeld; geen publicatie, boeking of verzonden mail |

Hoofdtaak blijft `maat-kunststofbaas-fulfilment-20261029`, doing/local. AI-order aanpassen zoals importeren blijft aparte open taak; deze ronde geeft PACKS voorrang zoals gevraagd. Alle bestaande klantgegevens, bestanden, andere bronwijzigingen en Git-index behouden.

Batch1-vervolg: ontbrekende controlepunten openen rechtstreeks het juiste invoerveld. Waardewijzigingen vragen alleen de relevante bevestiging opnieuw; gewijzigde afhaallocatie vraagt ook gereedheid en fysieke wijzigingen blijven eerdere labelcontrole laten vervallen. Zie [bediening en nog uit te voeren eigen controle](PACKS-BATCH1-CONTROLE-20261031.md). Alleen bronwerk, niet getest of gepubliceerd.

Batch2-vervolg: online servercontrole tegen eigen opgeslagen proefconcept en beide oorspronkelijke PDF-bestanden, revisiehercontrole vóór dispatch, aparte finale bijlagebevestigingen en gescheiden herhaalbewaking. Eigen Pages-configuratiebron met vier bindingsvergelijkingen klaargezet, niet uitgevoerd. Zie [proefcontrole en open online inrichting](PACKS-BATCH2-PROEFCONTROLE-20261031.md). Geen nieuwe tests; batch2 blijft gedeeltelijk/lokaal.

Batch3-vervolg: serverclient/pure contractmapping/interne éénmalige poginguitvoering en labelopvraag lokaal gebouwd, niet aangesloten op HTTP/UI of geactiveerd. Bestaande handmatige labels blokkeren nieuwe boeking. Credential-/profiel-/operationele inrichting en PDF-/state/files-projectie nog open. Zie [uitvoeringsbron en concrete resttaken](PACKS-BATCH3-UITVOERBRON-20261031.md). Geen tests/provideractie; batch3 doing/local.

Batch4-vervolg: readonly eindcontrole met originele PDF-viewers en begrensde controlerapportvergelijking voor dezelfde order. Geen verschillen is geen bewijs van gelijke code/config of geslaagde werking. Finale bijlagebevestigingen nu ook gewone leveranciersmail. Zie [eigen controle en eerlijke open eindstand](PACKS-BATCH4-EIGEN-CONTROLE-20261031.md). Gebruikersbeoordeling, operationele restbouw, online inrichting en publicatie blijven open; batch4 doing/local.

## Belangrijkste zwakke punten

| Risico | Vereiste bescherming / advies | Wat nog niet bewezen is |
|---|---|---|
| Productmaat is geen pakketmaat, gewicht/verpakking onbekend | Werkelijke verpakte buitenmaten in cm en massa inclusief verpakking in kg. Bare productmaten alleen herkenbaar startvoorstel; geen verzonnen gewicht of toeslag. | Werkelijke verpakking bij iedere bestelling moet de gebruiker/leverancier nog controleren. |
| Morgen gekozen maar order niet gereed | Datumvoorstel Nederland, zelf aanpasbaar; gereedheid los bevestigen, weekend/feestdagen/ronde/cutoff controleren. Geen extra Pickup. | Standaard1–3werkdagen is geen gereedmelding of boekingsgarantie. |
| Onbekend account/dienst/tarieven/retourafspraken | PK-register en actuele accountproductregels, bevestigd retouradres, geen actieve defaults raden. | Direct Booking, kostenvrij testaccount, exacte dienst/limieten/tarief/lookup-/herstelcontract nog niet volledig bevestigd. |
| Dubbele boeking na timeout/herstart | Duurzame intentie vóór dispatch, geen automatische BookShipment-retry, bekende provider-ID's behouden; label herstellen met GetLabels voor dezelfde zending. | Interne dispatch-/GetLabels-bron bestaat, maar is niet aangesloten of geverifieerd. Bestandsprojectie/inrichting open; historische tests bewijzen geen volledige keten. |
| Oud label of oude pakbon als actuele bijlage | PR01/02: revisie behoudt leveranciersbasis, vaste bestemming/referentie, verouderde voorbereiding maakt label niet actueel. | Barcode-/meer-colli-inhoud wordt niet uit de handmatige PDF geverifieerd. |
| Zelfmail wordt per ongeluk leveranciersopdracht | Apart doel supplier-trial, servergepind testTo, PROEF-onderwerp/bericht, twee PDF's, geen cc/bcc of replyketen, aparte zichtbare proefstatus. | Echte aflevering nog niet geprobeerd; bestaande SMTP-afzender moet geconfigureerd/geautoriseerd zijn. |
| Lokale proef zegt niets over Cloudflare/D1/R2 | Dezelfde generieke code, aparte online proefinstallatie met eigen DB/bucket/login/sleutel, proefidentiteit in beide opslagdiensten en expliciet providerbeleid. | Er bestaat nog geen nieuwe online proef-URL of ingerichte database/bucket. Source en voorbereidingspakket zijn geen hosting. |
| Een knop ziet er gebouwd uit maar werkt niet | Bron gevolgd; nieuwe fout-/commitgrenzen aangescherpt, capabilitycontrole bij een oudere mailhelper, invoerbehoud en duidelijke redenen bij ontbrekende bijlagen. | Nieuwe knoppen, runtime-/D1-/PDF-/mail-/browserketen niet getest. Oude29tests gelden eerdere bron. |

Het door PACKS beschreven vervallen zonder scan is geen algemene financiële testgarantie. De doorgestuurde mail noemt circa1,5dag na gewenste bezorgdatum en voorwaarden; Pickup wordt volgens die mail altijd belast. Een echte benodigde boeking bewust uitvoeren, niet een speculatieve boeking als gratis test gebruiken.

## Keuzes bij de order

| Gegeven | Keuzes voor Philippe | Advies |
|---|---|---|
| Aantal pakketten | Eén voorstel houden of werkelijk meerdere pakketregels toevoegen | Volg de echte verpakking van Kunststofbaas; leid dit niet uit alleen het productaantal af. |
| Buitenmaten | Zelf verpakt meten; bekende productmaten alleen als startpunt | Werkelijke verpakking inclusief bescherming en uitstekende delen meten. |
| Gewicht | Zelf wegen of werkelijk verpakt gewicht van leverancier gebruiken | Wegen inclusief verpakking; geen materiaaldichtheid/verpakkingsgewicht raden. |
| Afhalen | Voorgestelde datum aanpassen; gereedheid afzonderlijk controleren | Meegaan met bestaande dagelijkse ronde; geen extra Pickup. |
| Retour | Met Kunststofbaas afgesproken transportretouradres invullen | Kunststofbaas is nog een gebruikersvoorstel, geen ontvangen leverancierakkoord. |
| Eerste mail | Proef naar eigen gekozen adres of later echte leveranciersmail | Eerst beide bijlagen naar eigen controleadres en zelf bekijken. Echte bestaande labels blijven echte labels. |
| Proefomgeving | Lokaal bronopbouw; daarna eigen online proefinstallatie | Daarna online controleren vanwege andere opslag, authenticatie, document-/maildiensten en netwerkfouten. Eerste echte boeking in de dagelijkse omgeving na vereiste verificatie. |

Er is geen hardcoded aanvraag/ordernummer. De gebruiker opent zelf iedere geschikte order. De hoofdknop volgt de volgende stap; in de proefomgeving komt bij complete bijlagen de proefmail vooraan. Er wordt geen actieve knop Verzendlabel aanmaken getoond die in werkelijkheid geen label kan boeken.

## Gebouwde proefmailroute

Order → Bestelling/Verzending voorbereiden → actuele bestelling/gekozen label/pakbon → Meer → Proefmail met label en pakbon. In de afzonderlijke proefomgeving wordt die proefmail de hoofdactie zodra de twee bijlagen beschikbaar zijn. Onbeschikbaar heeft een concrete reden.

1. Actuele order, leveranciernummer, aflevergegevens en beide bestandsnamen tonen, plus bekende pakketwaarden of expliciet onbekend. Deze waarden worden niet uit een label-PDF gelezen.
2. Eigen proefadres invoeren/bevestigen. Geen automatische supplier-/klantadreskeuze. Gekozen adres wordt na bewuste bevestiging hetzelfde testTo als gewone CRM-testmail; geen afzender-/leveranciersadres-/klantverzendtoestemming wijzigen.
3. Server bewaart alleen dat adres onder bestaande versleutelde configuratie/lock/CAS, met vergelijking van de vorige testTo. Herhaling van dezelfde reeds bewaarde keuze is onschadelijk. De gebruiker kan later bewust een ander proefadres kiezen.
4. Nieuwe proefmail met vaste waarschuwing en twee oorspronkelijke actuele PDF's. Aan staat vast op dat gekozen adres; bericht/afzender/handtekening blijven binnen bestaande keuzes. Verplichte proefherkenning behouden. Geen losse upload/drop/extra bijlage in de leverancierscompositie.
5. Bestaande volledige preview toont Van, Antwoorden naar, Aan, inhoud en beide bestandsnamen/voorbeeldknoppen. Pas de laatste knop Versturen biedt een echte mail aan. De server verlangt nog steeds exact dezelfde testTo, geldige twee PDF's, juiste Maat-bedrijf en actuele afzender-/handtekeninginstellingen. Kunststofbaas-domein is geen proefadres; dezelfde vastgelegde leverancierontvanger wordt in het dossier geweigerd.
6. Eigen request-ID/journal houdt geaccepteerd, onzeker en afgewezen apart. Onzeker niet automatisch opnieuw aanbieden; bewuste herverzending van dezelfde PDF blijft apart bevestigd. Proefmail heeft apart doel en actuele proefstatus; normale leveranciersmail en klant-/betaal-/fysieke fases worden er niet door afgehandeld.

De proefmail is een ECHTE mail met bestaande bestanden, geen fictieve PACKS-boeking en geen nieuw proeflabel. Zonder label en pakbon nog niet beschikbaar. Gewoon mailen naar een ander adres annuleert een bestaande vervoerdersboeking niet. Er is geen mail door de bouwer verstuurd en geen proefadres actief ingesteld.

Lokale mailhelper/Python-route/CRM én online Functions/API moeten de nieuwe bron laden. Ontbrekende capability geeft een expliciete melding; nooit terugvallen op gewone leveranciersmail. Helpers hier niet gestart/herstart.

## Afzonderlijke online proefinstallatie

Voorbereidingspakket: `work/packs-preview-20261031/`. Geen project/database/bucket/secret aangemaakt, geen build/migratie uitgevoerd, geen proef-URL gepubliceerd. Releaseplan bevat bewust ontbrekende resource-IDs/omgeving-ID en publishReady=false; dit is geen deploybare, goedgekeurde release.

Serverstand CRM_PACKS_TRIAL_ONLY=true, CRM_RELEASE_ENV=preview en eigen unieke CRM_PACKS_TRIAL_ID. Alleen Maat, normale login, geen lokale bypass/proxy. De database moet een overeenkomende crm_packs_trial_identity hebben en de eigen bucket een gelijk-ID-marker. Ontbrekend/anders blokkeert alle API-/service-/authenticatieroutes, ook loginopslag. Voorziening van alleen de juiste bedrijfsnaam is onvoldoende bewijs van een aparte proefopslag; nieuwe resource-IDs vooraf vergelijken met beide productie-installaties.

Centrale HTTP-grens laat uitsluitend basisopslag/bestanden, voorbereidingsreview, Word/PDF en de mailroutes door. Alle andere provider-/betaal-/Gmail-/AI-/notificatie-/marketingroutes uit. Mailhandler laat in deze stand alleen supplier-trial door; normale mail blijft ook bij verkeerde frontendkeuze uit. Proefdoel blijft beschermd door ontvanger- en bestandsvalidatie. Geen PACKS/Tikkie/Gmail/AI-secrets of notificatieworker voor de proef. De eigen SMTP-/documentservice-inrichting blijft nodig en hoort bij een afzonderlijk beoordeelde publicatie.

Dit is bronbeveiliging, nog geen uitgevoerde integratie-/isolatieproef. Een operator die zelf verkeerde productie-resources met proefmarkers voorziet doorbreekt de voorbereidingsprocedure; daarom vooraf resourcevergelijking en eigen beoordeling, geen blind uitrollen van een voorbeeldconfig.

## Documentatie en werkelijk uitgevoerd

Aangeleverde PDF v2.4.3 opnieuw op omgeving, Direct Booking, datumkeuze, productlimieten, labels/herstel en troubleshooting gelezen. Openbare documentatie/Swagger op31oktober opnieuw via GET opgehaald, zonder account/login of operationele API. De Swagger meldt nog v9.0.0.0; bronvergelijking vond alleen gewijzigde voorbeelddatums, geen gewijzigde relevante schema-/veldcontracten. Voorbeeldcodes, nuldefaults en dynamische voorbeelddatums worden geen accountinstellingen.

- [Officiële online documentatie](https://packsonlineapp.packs.nl/docs/index.html)
- [Openbare Swagger](https://packsonlineapp.packs.nl/swagger/v1/swagger.json)
- [Eerdere bronreview PR01–PR05](PACKS-BRONREVIEW-20261030.md)
- [Contract/PK-register](PACKS-KOPPELING.md)

Uitsluitend bron-/documentatievergelijking/bewerking, publieke GET-bronnen en bouwadministratie. Nieuwe fictieve regressiegevallen klaargezet voor proefdoel/ontvanger/bedrijf/PDF-/herhaal-/timeout-/stream-/proefbindingsgrenzen, NIET uitgevoerd. Geen nieuwe automatische tests/checks/syntaxchecks/builds/browser-/DOM-/visuele QA, converter-/mail-/boek-/label-/betaal-/accountactie, runtimeherstart, cloudresourceaanmaak/migratie, Gitwijziging/GitHubupload/publicatie of echte zakelijke data-/bestandsmutatie. Het woord testomgeving is geen automatische toestemming om zelf een testronde te starten. Philippe controleert en beslist over concrete waarden/acties. Geen waterdichtheids-/volledige-keten-/liveclaim.
