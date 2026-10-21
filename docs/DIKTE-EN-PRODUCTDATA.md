# Dikte op documenten en in productdata

Lokale bronverbetering 21 oktober 2026, Maatwerkkunststof. Geen tests, syntaxchecks, builds, browser-QA, providerproeven of publicatie uitgevoerd. Philippe controleert zelf. Geen bestaande klant-/order-/documentgegevens gewijzigd tijdens bouwen.

## Oorzaak en afspraak

Dikte bestond al als apart veld op de productregel en in de calculator-/AI-koppelingen. De gedeelde functie voor publieke uitvoeringsdetails gaf voor Maat echter een lege lijst terug. De documentmaker nam alleen een vrije omschrijving en detailtekst over; daardoor gingen het aparte materiaal-/dikteveld niet automatisch naar de offerte.

De bron blijft **Dikte (mm) per product** (`order.items[].thickness`), numeriek en positief, met decimalen. Materiaal blijft `order.items[].material`. Geen parsing uit oude PDF’s, vrijblijvende klanttekst of interne notities en geen dikte uit één product kopiëren naar andere producten. Onbekend blijft onbekend, niet0mm.

Bij nieuwe Maat-offertes, orderbevestigingen, proforma’s en facturen is bekende dikte nodig. De order/aanvraag zelf mag nog onvolledig blijven. In het documentformulier verschijnt bij ontbrekende dikte een directe invulknop. Die opent de gewone orderbewerking bij de eerste ontbrekende productdikte; na bewaren/annuleren terug naar het document, met gewijzigde documenttekst behouden. Voor pakbonnen geldt de diktecontrole voor producten waarvan geleverd aantal groter dan0 is; de invulhulp staat daar eveneens. De bestaande gezamenlijke Spatlappen-pakbonroute is niet naar Maat uitgebreid.

## Op de offerte, factuur en pakbon

Bekend materiaal en dikte gaan als vaste publieke regels mee, bijvoorbeeld `Materiaal: POM` en `Dikte: 12 mm`. Ze staan naast maatvoering en de vrij bewerkbare klanttekst. Vaste materiaal-/diktelabels in extra tekst vervangen de gestructureerde bron niet: het bekende productveld blijft leidend. Interne specificaties, inkoopprijzen, leveranciersinformatie en notities worden niet extra overgenomen.

Per product wordt tevens een gestructureerde momentopname `material` en `thickness` bewaard in `document.generated.payload.items[]`. De bekende Word/PDF-opmaak krijgt de tekst via de **bestaande dynamische detailregels** (`item_n_detail_m` bij offerte/orderbevestiging; item_details/item_notes bij factuur en pakbon). Er is geen nieuwe losse Word-placeholder of andere template-upload nodig voor de standaardtemplates. De positie van de detailregel varieert met de aanwezige maatvoering; een vaste regelindex is geen dikteveld.

De converter gebruikt de bestaande details-array en hoeft hiervoor niet te veranderen. Geen DOCX-templatebestanden aangepast. Werkelijke Word/PDF-weergave is nog door Philippe te controleren; geen renderproef uitgevoerd.

Oude PDF/Word-bestanden worden niet herschreven. In een bewaarde revisie blijven historische details en bekende gestructureerde metadata behouden. **Producten en bedragen uit huidige order laden** blijft de expliciete route om een oude offerte bij te werken met actuele productgegevens, gevolgd door controle en een nieuwe versie. Nieuwe vaste technische gegevens mogen niet onbedoeld verdwijnen door het leegmaken van de extra tekst. Een documentaanpassing verandert het productveld op de order niet.

## Zoeken en analyseren

Aanvragen & orders → Meer filters heeft bij Maat **Materiaal** en **Dikte (mm)**. Materiaal vergelijkt de volledige naam zonder hoofdletter-/witruimteverschil; geen gegokte materiaalsynoniemen. Dikte vergelijkt in mm, onafhankelijk van de bestaande speling voor breedte/hoogte/aantal. Filters moeten op dezelfde productregel passen. Prijzen vergelijken neemt materiaal/dikte van het gekozen Maat-product mee. Vrij zoeken kent ook de gestructureerde velden.

Analytics → Financiën → **Materialen & diktes** toont binnen de bestaande periodefilter (aanvraagdatum, inclusief archief):

- Aantal afzonderlijke dossiers met die dikte.
- Aantal productregels, zodat meerdere producten in één order niet als één product verdwijnen.
- Som van bekende geregistreerde stuks; ontbrekende aantallen apart.
- Materiaalkeuze en doorklik naar de betreffende dossiers.

De volgorde is op aantallen dossiers, vervolgens productregels. Dit zijn **geregistreerde aanvragen/orders**, geen bewezen verkochte of geleverde stuks. Geen orderomzet/marge over verschillende diktes verdubbelen. Onbekende/ongeldige dikte is een aparte groep. Dossiers zonder productregels worden apart genoemd en niet tot een veronderstelde dikte gemaakt. Een dikte die alleen in vrije tekst of algemene aanvraaggegevens staat, telt pas als productdikte nadat die bewust op de juiste productregel is ingevuld.

Deze tabel gebruikt actuele productvelden, niet alle ooit gemaakte offertes als losse verkopen. Er is geen voorraadinkoop-/leveringsstatistiek, materiaalaliascatalogus, automatische gegevensreparatie of getraind model toegevoegd. AI-export kende de productvelden materiaal/dikte al en behoudt ze.

## Vindplaatsen

shared/product-specifications.js: canonieke dikte, publieke metadata en verplichte documentdetails. shared/product-metrics.js: pure telling per dikte. admin/documents/: formulier, invulhulp, payload en brongetrouwe revisie. admin/analytics/product-metrics.js: compacte Maat-analyse; dossier-search en appfilters voor de doorklik. Eén gedeelde codebasis; Spatlappen houdt zijn bestaande uitvoeringsdetails en heeft geen nieuwe dikteplicht of Maat-analyse.
