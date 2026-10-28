> Laatste vergelijking28oktober: de nieuwe Maat-pakbon heeft dezelfde16invulvelden en tabelvorm (2/2/4kolommen, kop+één productrij) als de vorige. Afzonderlijk opmerkingenkopje wordt nu bij lege opmerkingen mee weggelaten; geen onjuiste belofte meer dat de gekozen template geen logo heeft. Spatlappen blijft ongewijzigd. Gebruiker verduidelijkt dat bevestigen bronvergelijking betekent, geen testronde. Kort daarvoor waren syntaxchecks app/templates/generated-forms geslaagd en werden de zes bestaande defaults door de validator geaccepteerd; oude document-revisions-test stopte op de achterhaalde verwachting dat Maatbevestigingen niet bewerkbaar zijn (regel20). Geen volledige geslaagde testclaim; na verduidelijking geen verdere tests/build/QA uitgevoerd. GitHubupload aangevraagd; live-uitrol apart.

> Correctie28oktober: de nieuwe neutrale TJ Worx-pakbon is uitsluitend voor Maatwerkkunststof. Aangeleverde CRM-template had een lege productvoorbeeldrij; lokaal aangevuld met de bestaande productvariabelen. Spatlappen behoudt zijn eerdere standaard. Footer PAGE/NUMPAGES behouden; niet gerenderd/getest. GitHub/publicatie van deze ronde nog open.

# Documenttemplates aanpassen

Via **Instellingen → Documenttemplates** zijn pakbon, factuur en de gezamenlijke offerte/orderbevestiging/proforma beschikbaar. Mailtemplates blijven op hun eigen tab.

1. Kies Aanpassen en download de huidige Word-template.
2. Bewerk logo, vaste tekst en opmaak in Word. Behoud invulvelden, inhoudsbesturingselementen en tabelrijen/-kolommen op hun plaats. De generator beheert documenttitel, herhaalde productregels, bedragen en bepaalde pagina-afstanden; dit is geen vrije Word-ontwerper.
3. Upload een .docx van maximaal400kB en bevestig het huidige bedrijf. Opslaan doet een begrensde structuurcontrole op de server en bewaart de nieuwe actieve keuze.
4. Open zelf een documentvoorbeeld bij een order voordat je de nieuwe opmaak gebruikt. Structuurcontrole is geen visuele/conversiegarantie.

Meer bevat downloaden van de actieve/standaardtemplate en terugzetten naar de standaard of een eerdere upload. Eerdere uploads blijven bestaan; maximaal10versies totaal per bedrijf. Identieke bytes voor hetzelfde type hergebruiken de eerdere versie. Bij de grens blokkeert een nieuwe upload; er wordt niets automatisch weggegooid. Versiearchivering/verwijderen is geen onderdeel van deze opdracht.

## Opslag en scheiding

Bedrijfsgebonden `state.documentTemplates` bewaart active-IDs en onveranderlijk via deze UI toegevoegde Word-versies (base64, naam, type, companyId, datum). De bestaande CRM-opslag/CAS en volledige back-up bewaren ze samen; geen nieuwe database of publieke template-uploadmap. Vervangen/terugzetten vergelijkt de oorspronkelijke actieve revisie binnen de bestaande actuele transactie. Geen mutatie aan klant-, order-, betaal- of eerdere documentbestanden.

Nieuwe documentgeneratie leest de actieve keuze via de live appContext-factory, stuurt uitsluitend de gekozen Word-bytes mee naar de bestaande converter en vergelijkt de revisie opnieuw vóór documentopslag. Gegenereerde metadata bewaart templateRevision; revisies gebruiken de huidige template en behouden hun oudere bestanden. Een formulier waarvan de actieve template intussen veranderde blokkeert opslag. Geen belofte dat een eerder voorbeeld na wijziging nog de actieve template toont.

De converter kiest het bedrijf vanuit de bestaande serverconfig/authenticatietoken. Een meegestuurde template moet datzelfde bedrijf hebben. Uploadcontrole en daadwerkelijke generatie valideren grootte, ZIP-pakket, XML, invulvelden en de specifieke tabelstructuur opnieuw. Geen extractie naar blijvende paden; gekozen bytes alleen in de tijdelijke renderwerkmap, bestaande standaarden blijven intact. Macro’s, ingesloten bestanden, actieve/externe documentinhoud en niet-ondersteunde Word-velden geweigerd. Gewone HTTPS/mailto-hyperlinks blijven mogelijk. Geen provider- of klantgegevens toegevoegd aan de templateactie.

## Opleverstatus

Alleen lokale bronuitwerking28oktober2026, geen tests/checks/syntaxchecks/build/browser-/DOMcontrole, generator/conversieproef, gegevensmutaties, GitHubpush of publicatie uitgevoerd. Bouwtaak review/local; Philippe beoordeelt zelf.

Deze uitbreiding vereist de bijbehorende CRM-code **én bijgewerkte documentservice** (`document-generator.py` en `document-service/server.py`). Een lokale Python-server heeft de aangepaste handler na herstart nodig; een cloudpreview gebruikt de aangesloten online converter en heeft daar een expliciete latere uitrol nodig. De UI weigert een oud serviceprotocol bij templatebeheer of aangepaste generatie in plaats van stil de standaardtemplate te gebruiken. Gewone documenten zonder override blijven met een oudere service werken. Er is in deze ronde geen service herstart of gepubliceerd; bestaand live CRM blijft gelijk.

Gebruikerscontrole open: beide bedrijven, alle drie templates, ongewijzigde/herbewerkte Word-upload, bestanden met gewijzigd logo, foutmeldingen zonder invoerverlies, terugzetten, eerdere documenten/volledige back-up en gelijktijdig wijzigen/genereren. Nieuwe pakbonopmaak van Philippe is nog niet aangeleverd of ingevuld.
