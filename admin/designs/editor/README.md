# Spatlap-editor: vindplaatsen en laadvolgorde

De vaste ingang blijft `/spatlap-preview.html`. De HTML bevat de schermstructuur; code/opmaak staan hier. Bestaande URL’s, hashontwerpen, lokale ontwerp-ID’s en `window.SpatlapPreview` blijven hetzelfde.

| Bestand | Taak |
|---|---|
| editor.css | Bestaande opmaak, responsive regels, selectie, laadscherm |
| boot.js | Vroeg laadscherm en herstelknop |
| vector-editing.js | SVG-onderdelen bewerken en kleur/positie terugzetten |
| history-and-feedback.js | Undo/redo, actiestatus, toast |
| selection-and-controls.js | Selectiestatus, bediening en viewporthelpers |
| import-and-vectorize.js | Logo/PDF-invoer, sanitizing, bijsnijden/vectorhelpers |
| text-and-objects.js | Tekst-/objecthelpers, kopiëren/dupliceren en selectielijsten |
| layout-and-preview.js | Renderen, hulplijnen, plaatsing, maat- en hoogtereferentiehelpers |
| export.js | Canvas/SVG/PDF/PNG en vormpaden |
| storage-and-integration.js | Ontwerpcontract, URL/query/hash, opslag en CRM-koppeling |
| runtime.js | Gedeelde status initialiseren, eventhandlers aansluiten en init starten |
| bootstrap.js | ES-modules voor kleur, clipboard/overdracht, gebruikstellers, feedback en sneltoetsen aansluiten |

## Bewust behouden contract

Helperbestanden zijn klassieke scripts met functiedeclaraties. Ze worden allemaal vóór runtime.js geladen. Ze voeren bij laden geen ontwerpacties uit. runtime.js initialiseert de bestaande gedeelde bindings en handlers in de oorspronkelijke volgorde. bootstrap.js is het laatste ES-module-entrypoint. Dit is een bronopsplitsing met gedeelde status, nog geen volledige afhankelijkheidsinjectie of geïsoleerd modulesysteem. Zet deze scripts dus niet los op async/defer en verander hun volgorde niet ongemerkt.

Dynamische imports naar de bestaande CRM-opslag zijn aangepast aan de nieuwe bestandslocatie. Fetch-/deel-URL’s blijven op de document-URL gebaseerd. De klassieke vectorbibliotheken in de projectroot blijven bestaan voor compatibele URL’s. Gedeelde geometrie/kleur-/overdrachtsregels staan in shared/; kleurdialoog, overdracht en sneltoetsen blijven in admin/designs/.

Nieuwe code hoort bij het passende bestand of een expliciete module onder admin/designs/. Voeg geen grote inline scripts aan HTML toe. Bij verdere ontkoppeling eerst een helder status-/actiecontract maken; niet ongemerkt een tweede kopie van state of opslag introduceren.

De gewone bedrijfsbuild kopieert admin/ en neemt deze bestanden automatisch mee. Deze wijziging is alleen lokaal; geen build/test/browser-QA uitgevoerd op verzoek van gebruiker. De gepubliceerde versie is niet gewijzigd.
