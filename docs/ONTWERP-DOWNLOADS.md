# Aanvulling — 26 oktober 2026: varianten en definitieve keuze

Bij producten met ontwerpvarianten gebruikt de gewone leveranciers-PDF de actuele definitieve keuze. Een ontbrekende of door wijziging vervallen keuze stopt die route; voorstel-PDF en PNG staan onder Meer van de betreffende variant. De downloadmodule vergelijkt ook de daadwerkelijk opgeslagen maat/aantal met het huidige product en herleest de bron na generatie. Zie [Batch1](BATCH1-ONTWERPVARIANTEN-20261026.md). Alleen lokale bron, zonder tests/downloadproeven/build/browser-QA/publicatie; Philippe controleert zelf. De oude tekst hieronder over één gekoppeld ontwerp is hiermee aangevuld.

# Direct downloaden van een opgeslagen ontwerp

Lokale bron, 21 oktober 2026, Spatlappen. Geen tests, syntaxchecks, builds, browser-QA, echte ontwerpen, downloads of providerproeven uitgevoerd. Philippe controleert zelf. Nog niet opnieuw gepusht/gepubliceerd na de eerdere main-commit cb21b055.

## Bediening

In de ontwerptool bij Bewaarde ontwerpen staan naast Openen twee acties: **Preview PNG** en **Vector-PDF**. Deze lezen het gekozen bewaarde ontwerp. Een onbewaard ontwerp in het oorspronkelijke tabblad wordt niet geopend, vervangen of opgeslagen.

Bij een product in het CRM staan dezelfde downloads onder **Opgeslagen ontwerp**, met de bewaardatum. De PNG gebruikt het gekoppelde opgeslagen previewbestand als de metadata bij precies dit product hoort; ontbreekt die koppeling, dan kan de downloadtab de PNG opnieuw maken uit het opgeslagen ontwerp. Vector-PDF leverancier gebruikt altijd het interne ontwerpbestand van de gekozen productregel. Losse geüploade of oudere goedgekeurde afbeeldingen zijn geen bron voor deze PDF; goedkeuring blijft een afzonderlijke registratie.

De downloadtab toont voortgang en daarna een downloadlink. Er wordt geprobeerd de download te starten; als de browser dat tegenhoudt, blijft de link zichtbaar. Bij fout blijft de uitleg staan met **Opgeslagen ontwerp bekijken / aanpassen**. Een link die naar een product verwijst, opent dat productontwerp; een losse ontwerp-ID opent het betreffende bewaarde ontwerp.

## Dezelfde export, geen nieuwe betaalde dienst

PNG gebruikt `createPreviewPngBlob`; de leveranciers-PDF gebruikt `makeArtworkPdfBlob` en de bestaande lokale vectorbibliotheken/lettertypen. Geen externe converter, betaalde export-API of AI-aanroep. Geen nieuwe hostinginrichting. De aparte tab gebruikt dezelfde HTML/layout voor de PNG-maatvoering, maar houdt de editor onzichtbaar en inert. Normale editorinitialisatie, feedback, sneltoetsen, gebruikstellers en overdrachtsbediening worden niet gestart. Geen iframe of versoepeling van framebeveiliging.

De PDF blijft vector op ware grootte, zonder achtergrond; tekst wordt contouren. De bestaande controles weigeren rasterlogo's, ongeschikte SVG-effecten, ontbrekende vectorlettertypen, foutieve paginamaten of een raster-PDF. Er wordt niet automatisch gevectoriseerd of een vervangend lettertype gekozen voor de vector-PDF. De snelle download is geen nieuwe leveranciersgoedkeuring of garantie op drukgeschiktheid.

## Alleen de bewaarde versie

De downloadmodus slaat niets op. Zij leest alleen het gekozen ontwerp, bij een CRM-product de bestaande productbinding. Huidige maten/een expliciet opgeslagen aantal die afwijken van de productregel blokkeren de export; de gebruiker moet de juiste versie eerst bewust bewaren. Een vroeger leeg ontwerpaantal wordt niet ingevuld uit de actuele order.

Na generatie wordt de bron opnieuw gelezen. Gewijzigd ontwerp of gewijzigde productbinding betekent stoppen, geen oud bestand presenteren als nieuwste versie. Tijdelijke blob-/file-logo's en niet ingebedde bronnen worden geweigerd. PNG-logo's worden vóór generatie ingelezen; de gedeelde previewrenderer stopt nu ook bij een onleesbaar logo in plaats van het stil weg te laten. De gewone PNG-download gebruikt diezelfde foutafhandeling.

Downloadmodus heeft een wachttijdgrens en voorkomt een late automatische download na die grens. Maatwerkkunststof krijgt geen ontwerpdownloadknoppen en de downloadmodus weigert een andere bedrijfsopslag. Logo's, ontwerpinhoud en klantgegevens worden niet in de download-URL geplaatst: alleen de bestaande ontwerp-/product-ID's en opslagmodus.

## Vindplaatsen en open controle

- `admin/designs/download-links.js`: URLs naar een gekozen opgeslagen ontwerp of orderproduct.
- `admin/designs/editor/saved-download.js`: aparte downloadmodus, bron-/maatcontrole en bestaand exportpad.
- `boot.js`, `runtime.js`, `bootstrap.js`: downloadstart apart van normale editorinitialisatie/bediening.
- `storage-and-integration.js`: knoppen bij bewaarde ontwerpen.
- `admin/products/images.js`: knoppen bij het actuele opgeslagen productontwerp.

Gebruikercontrole open: lokale en centrale opgeslagen ontwerpen, PNG/PDF op desktop/mobiel, behoud onbewaard werk, raster/lettertype-/bronfouten, productwijziging tijdens export en handmatige download wanneer automatisch starten wordt tegengehouden. Geen echte bestanden als automatische QA openen. Publicatie apart uitvoeren.
