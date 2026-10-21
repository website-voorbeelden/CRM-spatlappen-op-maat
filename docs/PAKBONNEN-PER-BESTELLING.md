# Pakbonnen per gezamenlijke bestelling

Lokaal gebouwd op 19 oktober 2026, niet getest of gepubliceerd.

## Gebruik

1. Open Inkoop, kies de Turkije-bestelling en het tabblad Pakbonnen.
2. Bekijk de waarschuwingen per order. Met Levergegevens of Documenten open je de bron om gegevens aan te vullen of een deellevering afzonderlijk voor te bereiden.
3. Alle pakbonnen downloaden… opent de controlelijst. Vink orders of afzonderlijke bestaande pakbonnen uit die niet meegaan.
4. Bevestig bij nieuwe pakbonnen de volledige levering van de getoonde leveranciersproducten. Bevestig apart als je ondanks waarschuwingen wilt doorgaan.
5. Pakbonnen downloaden maakt één PDF. Open die PDF en kies Afdrukken; de gewone printdialoog bepaalt papier, kopieën en enkel-/dubbelzijdig. Er worden geen lege scheidingspagina’s toegevoegd. Na afloop blijft een downloadknop beschikbaar.

## Documenten en gegevens

Bestaande PDF’s blijven exact opgeslagen; alleen de nieuwste revisie van elke afzonderlijke reeks gaat mee. Meerdere reeksen kunnen deelleveringen zijn en worden niet tot één willekeurige laatste pakbon teruggebracht. De controle waarschuwt voor afwijkende aantallen/omschrijving/adres en voor niet automatisch vergelijkbare uploads. Een eerder document wordt niet herschreven als het huidige dossier verschilt.

Een nieuwe pakbon gebruikt dezelfde bestaande Word/PDF-omzetter en PB-nummerreeks. Alleen leverancierproducten, geen lokale productregels. Geen prijzen/interne notities. Ontbrekende adressen kunnen na bevestiging worden afgedrukt met NIET INGEVULD; dat vult geen klantgegevens in. Voor afhalen staat Afhalen / Geen verzendadres. Zonder geldige aantallen/omschrijving of klant wordt geen nieuwe pakbon gemaakt. Nieuwe bestanden blijven PDF+Word per order. De gezamenlijke print-PDF is een tijdelijke download en geen extra documentreeks.

Alle conversies en samenvoeging vóór opslag. Nieuwe nummerreeks, documentrecords en bestanden gaan in één bestaande state/files-transactie met broncontrole. Geen wijziging aan order/product/leverafspraak/betaling/voorraad of status. Betalingen zijn onderdeel van de controlebasis, zodat een gewijzigde betalingswaarschuwing opnieuw bekeken wordt. Geen gedeeltelijke documentopslag bij mislukte generatie of samenvoeging. Verbindingsverlies bij de bestaande cloudcommit kan zoals andere opslagacties een onzekere ontvangstbevestiging geven; nooit blind opnieuw genereren.

## Mappen en grenzen

- shared/batch-packing-review.js: alleen-lezen selectie, hiaten, bronbasis en publiek pakbonpayload. De oudere shared/batch-packing.js blijft voor bestaande werkvoorraadtaken beschikbaar.
- admin/purchases/packing.js: controlevenster, voortgang, opslag via bestaande facade en download.
- admin/purchases/batch-workspace.js: eigen tabblad; app.js alleen installatie/context.
- shared/document-address.js: bestaande adresopsplitsing gedeeld met het individuele documentformulier, met behoud van export uit admin/documents/generation.js.
- admin/documents/merge-pdfs.js: zelf gehoste pdf-lib 1.17.1, MIT-licentie naast script in print-assets. Exacte pagina-inhoud wordt gekopieerd, geen screenshots/rasterisatie en geen PDF-inhoud naar een externe samenvoegdienst. Speciale interactieve PDF-functies vallen buiten de statische printbundel. API-bron: https://pdf-lib.js.org/docs/api/classes/pdfdocument#copypages.

Maximaal 50 orders, 100 PDF-bestanden, 80 MB bron-PDF’s en 500 pagina’s per bundel; bij grotere selectie meerdere bundels maken. Generatie van nieuwe pakbonnen vereist de bestaande bereikbare documentservice. In offline-review is deze schrijfroute niet beschikbaar. Geen provideracties uitgevoerd bij het bouwen.

Geen automatische tests, syntaxchecks, builds of browser-QA uitgevoerd op uitdrukkelijke gebruikersafspraak. Runtime-bouwlog niet gewijzigd. Alleen de broncatalogus, documentatie en overdracht bijgewerkt.
