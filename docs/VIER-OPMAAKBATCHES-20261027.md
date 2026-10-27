# Vier opmaakbatches — 27 oktober 2026

Philippe vraagt verdere optimalisatie op te delen en geeft daarna achtereenvolgens opdracht voor batch1–4. Dit plan betreft de verdere CRM-opmaak na de eerdere dossierindelingsronde. De nieuwe batchnummers vervangen geen historische feedbackbatchnummers. Eén gedeelde bron voor beide bedrijven; gebruikerscontrole en publicatie staan los van bouwen. Bron-onlyafspraak blijft gelden.

| Batch | Scope | Stand |
|---|---|---|
| 1. Gedeelde basis en navigatie | Centrale type-/spacing-/controlbasis, zijbalk, bovenbalk en Meer-menu’s | Lokaal bronwerk klaar voor eigen controle; niet getest/gepubliceerd |
| 2. Aanvragen en orderdossiers | Kop/hoofdactie/producten/dossiergegevens verder verfijnen, tekorten en ontwerpvarianten duidelijk bereikbaar | Lokaal bronwerk klaar voor eigen controle; aanvullen/producten/varianten en hervatten na productbewerking, niet getest/gepubliceerd |
| 3. Overzichtslijsten en betalingen | Kolommen/bedragen/status/zoekfilters voor aanvragen/orders/klanten/betalingen | Lokaal bronwerk klaar voor eigen controle; lijsten/bedragen/status/actieve filters en betaalfocus verder uitgewerkt, niet getest/gepubliceerd |
| 4. Mail, documenten en afwerking | Mail/bericht/documentacties/formulieren laten aansluiten, bronlezing voor mobiele aansluiting | Lokaal bronwerk klaar voor eigen controle; mail/documenten/bijlagen/Maatvoorwaarden, modalbusy en vroege bestandsgrenzen verder uitgewerkt; niet getest/gepubliceerd |

## Batch1: wat staat nu lokaal in de bron?

Centrale tokens in `admin/style.css` voor kleine/UI/body/koptekst, tussenruimtes, control-/touchhoogte, zijbalkbreedte, paginagutter en menuschaduw. Dit zijn gewone CSSwaarden, geen nieuwe gebruikersinstellingen. De bestaande kleur-/herkomsttokens blijven leidend: blauw/neutraal voor bediening, lichtpaars automatisch, donkerpaars AI/interpretatie. Geen extra stylesheet of nieuwe gedateerde themalaag.

Gedeelde gewone knoppen/links-als-knop en invoer gebruiken dezelfde basis. Ontbrekende primaire focusparen toegevoegd, oude extra focus-/primair-hover-/download-/disabledregels verwijderd waar de actuele gemeenschappelijke eigenaar die overneemt. Desktopbasis36px, aanraak-/kleine schermen44px. Mobiele/coarse invoertekst16px behouden. Disabled/readonlywaarden expliciet leesbaar; nieuwe disabledregels veranderen geen veldwaarde of mogelijkheden. Componentuitzonderingen blijven bestaan: dit is geen claim van volledige CSSconsolidatie of gemeten contrast.

Navigatieopmaak gericht op `.shell>aside>nav`, met dezelfde routes, groepen, lokale iconen en bestaande per-bedrijfinklapvoorkeur. Oude algemene navregels en oude horizontale mobiele nav verwijderd; inhoudsnavigatie erft geen hoofdmenustijl. Actieve/hover/focuskleuren blijven gekoppeld. De bestaande mobiele schuifnavigatie en de huidige desktopinklapvorm zijn behouden, geen nieuw rail-/menumodel of opslag.

Bovenbalk: huidige module met bedrijfsnaam eronder, in plaats van een lange regel met slash. De vaste1150pxregel die context altijd een eigen volle rij gaf is weg. Zoeken kan in breedte meeschalen; de zichtbare zoektekst mag inkorten, de oorspronkelijke tekst blijft in de knop voor toegankelijkheid. Mobiel zonder toetsenbordsneltoetslabel. Bedrijfscontext staat al in de mobiele header. Bestaande zoek-/AI-exportactie, data-attributes, shortcuts en dialogs blijven. Horizontale hoofd-/toolbarpadding delen dezelfde gutter op28/20/14px; mobiele safe-area onderin behouden.

## Eén eigenaar voor Meer-menu’s

`admin/workspace/action-menus.js` wordt vanuit de bestaande `installSidebar` geïnstalleerd en bij shellvervanging opgeruimd. Alleen `details.quiet-menu` en `details.order-more`; gewone histories/filters/formdetails blijven native en krijgen geen sluitbeleid.

- Klik buiten het menu of op een menuactie sluit het menu; een door de betreffende actie geannuleerde klik wordt gerespecteerd.
- Een geopend ander menu sluit het vorige; geneste menu’s houden hun eigen voorouders open.
- Escape sluit het betreffende/diepste menu en focust de eigen summary. Niet alle samenvattingen achtereen focussen. Escape wordt niet van een geopend dialog overgenomen; buiten menus blijft het bestaande mobiele/dialoggedrag leidend.
- Geen nieuwe uitvoering van acties, formsubmit of API-/providerrequest. Velden en gewone uitklappers worden niet verwijderd of opnieuw gerenderd door deze controller. Geen extra timers/gegevensopslag/voorkeuren.

Beide menutypen delen één CSSblok: knop/arrow/openstate, dropdownpositie/breedte/schaduw, begrensde hoogte met scroll, tekstomloop, actie-/disabledkleuren en touchhoogte. De rode verwijderactie blijft herkenbaar. Oude order-more-/quiet-menu-/latere theme-dropdownblokken vervangen; geen !importantlaag erbij. Feature-specifieke positie-/indelingsuitzonderingen zijn niet blind verwijderd.

## Open eigen controle

Philippe beoordeelt beide bedrijven op desktop/mobiel: zijbalk open/ingeklapt/mobiel en voorkeur na eigen herladen; bovenbalk met lange namen, smalle breedte/zoekshortcut/AI-export; normale/primary/destructive/disabled/readonly/focus/hover; Meer in kop en product/mail/document, lange/geneste menu’s, openen/actie/buitenklik/Escape/focusterugkeer; gewone filters/historie en invoer blijven staan; open dialoog en mobiel Escape behouden eigen bediening. Geen providerproef nodig om de zichtbare basis te beoordelen.

Geen tests/checks/syntaxchecks/builds/browser-/DOMcontrole/contrastmetingen of echte provider-/betaal-/mail-/pushproef uitgevoerd. Geen runtime/private config/klantgegevens geopend/gewijzigd, serviceherstart/tabreload, GitHubpush/publicatie. Bouwlog append-only via scripts/build-task.mjs. Batch1 review/local, brede consistent-workspace doing/local, batches2–4 inmiddels bronreview/local; zie vervolg hieronder. Geen functioneel/visueel akkoord of volledige auditclaim.

## Vervolg: batches2–4

Alle drie aanvullend uitgevoerd op uitdrukkelijke batchopdrachten, bronwerk voor Jouw controle. Details/resultaten/grenzen en concrete gebruikerscontrole staan in [Batches2–4](BATCHES2-4-OPMAAK-20261027.md). De aangeleverde [algemene voorwaarden](ALGEMENE-VOORWAARDEN-BIJ-ORDER.md) uitsluitend bij Maatwerkkunststof. Kopiëren/slepen browserafhankelijk; downloaden en expliciet toevoegen aan CRM-mail beschikbaar. Geen tests/build/browsercontrole/publicatie of volledige auditclaim.
