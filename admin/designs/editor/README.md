> Nieuwe feedbackronde28oktober: handmatig SVG/raster bijsnijden, contourkleur, directe bovenstrook, logo-drop/grotere maatstappen, orderteruglink en nieuwe-variant-save. Klassieke helpervolgorde behouden; variant-CAS bij product-designs beperkt tot eigen variant/maat/klant. Zie docs/FEEDBACK-VERVOLG-20261028.md voor grenzen/eigen controle. Geen tests/build/browsercontrole.

> Feedbackbatch3,28oktober: selectiebalk-CSS nu één eigenaar met wrap op beschikbare breedte; latere nowrap/shrink:0-conflictregels verwijderd. Knoppen en maatgroep begrensd/omlopend; desktopcanvas kan bij te weinig hoogte scrollen. Bestaande bar.offsetHeight/fitPreviewFrame/render/resize en scriptvolgorde ongewijzigd. Dit vervangt de oudere afspraak één rij tot480px waar die uitloop geeft. Zie ../../../docs/FEEDBACK-BATCH3-20261028.md (projectroot/docs). Geen tests/build/browsercontrole; eigen MacBook-/dropdown-/canvascontrole open.

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

## Downloadmodus voor bewaarde ontwerpen — 21 oktober 2026

`designExport=png|pdf` met `savedDesign` of `orderId`/`itemId` opent een aparte downloadtab. Boot houdt de editor verborgen; runtime start initDesign niet en bootstrap kiest saved-download.js in plaats van normale bediening. Layout en bestaande exportfuncties blijven beschikbaar voor dezelfde PNG/vector-PDF. Geen opslag of wijziging aan het oorspronkelijke tabblad. Downloadmodule gebruikt klassieke helpers en runtimebindings; normale scriptvolgorde behouden. Nieuwe directe links in ../download-links.js. Bron-/maat-/versiecontrole, fonts/embeddedbronnen en bestaande vectorblokkades blijven verplicht. Geen iframe of framebeleidwijziging. Alleen lokaal, eigen gebruikerscontrole open.

## Feedbackbatch 23 oktober 2026

selection-and-controls bezit artworkRotation/artworkTransform, spiegel-/kwartslagacties, horizontaal/verticaal balanceren en automatisch paneelopenen. layout-and-preview gebruikt dezelfde objecttransformaties; tight ink alleen voor ongedraaide enkele regel, anders conservatief frame. runtime bezit live textarea/undo per sessie. text-and-objects levert fontgalerij en gesloten AIuitleg voor eigen font als SVGcontouren. SVGpiece-API selectAt/scaleBy zit in de bestaande vector-editor; vector-editing transformeert de oorsprongdelta bij reframe. Geen nieuwe scriptloader.

Objectvelden rotation (0/90/180/270) en flipX lopen mee in compacte opslag/undo/portable whitelist, canvas-PNG en vectorwrapper. Meerdere tekstregels gebruiken dezelfde lineheight1, centrering en uitlijning. Export weigert ongeldige transform/fallbackfont; nieuwe lokale echte fonts hebben herkomst/licenties in print-assets/EXTRA-FONTS-20261023.md. Geen willekeurige TTFimport. Script-/stylesheetcacheketen four-batches-20261023, volgorde onveranderd. Bronwerk niet functioneel/export-/productiegetest; Philippe controleert zelf. Zie docs/VIER-BATCHES-2026-10-23.md.

## Batch4 vervolg — 23 oktober 2026

Gedraaide logo’s: vrij breedte/hoogte schalen volgt zichtbare schermassen; de lokale w/h-as wordt bij90/270° verwisseld. Links/boven/randuitlijning en passend maken gebruiken gedraaide kaderafmetingen, ratio blijft lokaal. Meerregelige en gedraaide tekst wordt verticaal geplaatst met het bestaande gemeten kader, niet alleen de fontgrootte. Geen nieuwe geometrie-export of opslagvelden.

Live tekstbewerking: een andere historyactie en undo/redo beëindigen de tekstgroep; verder typen begint opnieuw. Zijbalk schrijft dezelfde textarea-inhoud niet onnodig terug en past de hoogte ook bij herhaalde selecties aan. Fontgalerij houdt een tijdelijk hover-/focusvoorbeeld, inclusief één echte dikte, ook als document.fonts.ready later afloopt. Vertrek/keuze/sluiten herstelt het gekozen font; hover wijzigt geen artwork.

Klassieke laadvolgorde en bestaande vector-/rasterblokkades behouden; cache batch4-editor-20261023. Geen tests, syntaxchecks, browser-QA of export-/productieproef; Philippe controleert zelf. Publicatie apart vastgelegd.

## Bronlezing en integriteit — 26 oktober 2026

Zie docs/EDITOR-BRONLEZING-20261026.md voor feedbackmatrix, vijf lokaal gecorrigeerde fouten en open grenzen. allSelectedRefs levert alleen bestaande objecten. Undo/redo herstelt artwork en primaire selectie, beëindigt tijdelijke groep/vector-/referentiemodus. Rijverwijderen en nieuwe tekst/logo wissen eerst de oude groep. offsetArtworkCenter (selection-and-controls) zet lokale cm-delta om met dezelfde rotatie/spiegelvolgorde als preview en export; SVG/rastercrop en vectorreframe delen die helper. Bestand vervangen behoudt rotation/flipX. Productsave toetst actuele order-klantrelatie binnen de bestaande transactie. Klassieke scriptvolgorde blijft behouden; cache editor-review-20261026. Geen tests/checks/build/browser-QA/publicatie uitgevoerd; gebruikercontrole open.

## Vier delen26oktober

Nieuwe klassieke helpers font-tools.js (tijdelijke fontpreview, ingebedde eigen fonts, gerichte tekst-DOM), logo-colors.js (palet en tijdelijke vectorprojectie), outline-tools.js (selectierand/schermfilter) en placement-tools.js (verdeling/expliciete lokale geometrievoorkeur). Alle geladen vóór runtime; geen aparte state/opslagfacade. custom-shortcuts.js via bootstrap als module. Font-/vectorvoorbeelden wijzigen de echte artworkstaat pas bij kiezen/toepassen; exports lezen die echte staat. Eigen fontbytes staan in ui.customFonts, bounded codec en OpenType-export; geen externefontURLs. cloneState deelt onveranderlijke fontstrings voor history. Productmetadata/variantschema in shared/product-design-variants.js; productDesigns schrijft JSON+PNG in bestaande transactie, bewaart oudere revisies en toetst finale versie/maat/aantal. Geen tests/checks/build/browserQA/publicatie; zie docs/VIER-DELEN-20261026.md.

## Batch2 afronding — 26 oktober 2026

font-tools beheert tijdelijke hover en ongebruikte eigen fonts; selectie/history/nieuw ontwerp beëindigen hover. FontFacecache deelt pending/ready registraties; PNG/productsave vraagt eigen glyphdekking aan dezelfde contourparser. Fontimport registreert pas na actuele UIkeuze; identieke bytes hergebruiken bestaand descriptor. Copy/paste weigert ID/bytesconflict vóór mutatie. Tekstinput vervangt niet meer de volledige selectie-/referentiebediening; geen prestatiemeting. custom-shortcuts-installer vóór vaste shortcuts-installer om opnemen in capture te beschermen; klassieke scriptvolgorde ongewijzigd. Desktopsplit begint boven950px en reserveert ruimte voor de onderopties. Kopie-openactie behoudt na bevestigde opslag altijd de link. Zie docs/BATCH2-TEKST-EN-BEDIENING-20261026.md; alleen lokaal, geen tests/checks/build/browserQA/publicatie.

## Batch3 afronding — 26 oktober 2026

vector-islands.js is een nieuwe klassieke helper vóór logo-colors.js, alle helpers vóór runtime behouden. Expliciete bounds-clustering van gesloten gevulde subpaden; originele curves/gaten/fillregels, geen rasterhertekening of volledige topologie. logo-colors bewaart alpha en herbindt objectinstanties na undo. Vectorpreview gebruikt volledige logo/flap/settingsbasis met pauze/busyguards; undo/stoppen beëindigen oude resultaten, apply maakt geen nieuw grof voorbeeld. Vectorexport outline heeft bronveiligheidsgrenzen en schaalcompensatie; geen gelijkheidsgarantie voor alle contouren van preview/PNG/PDF. Previewfilters worden opgeruimd. placement-tools past alleen toegestane geometrie toe, versie2 lijstvolgorde naast legacypositievolgorde, opslagbasisguard en inline lijstherstel. Zie docs/BATCH3-LOGO-KLEUR-PLAATSING-20261026.md; geen tests/checks/build/browserQA/publicatie.

## Vervolg open punten — 27 oktober 2026

vector-islands laadt de lokaal gebundelde Paper.js0.12.18 alleen na de expliciete segmentactie. SVGgebied/unie, gaten en verbonden segmenten, eigen project opruimen; geen remoteSVG/rastertrace. Opaque naastliggende paden kunnen samen; transparante geometrie apart en clip/lijn/verloop overslaan. placement-tools heeft opt-in leren van compacte geometrie na geslaagde save via rememberPlacementAfterSave(record.payload), max20 en geen artwork/klantdata. Toepassen blijft expliciet met undo. vector-editing pijlrichting gebruikt inverse objectrotatie/spiegeling. Klassieke helpervolgorde intact; geen tests/build/browserQA/publicatie. Zie docs/OPEN-PUNTEN-VERVOLG-20261027.md.
