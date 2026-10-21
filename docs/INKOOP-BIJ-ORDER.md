# Inkoop direct bij een Maatwerkkunststof-order

Lokaal gebouwd op 21 oktober 2026. Geen tests, syntaxchecks, builds, browser-QA, providerproeven of publicatie uitgevoerd; Philippe controleert zelf. Geen echte dossiergegevens gewijzigd tijdens het bouwen.

## Eén leverancier, één klantorder

Open de klantorder → **Inkoop & marge** → **Inkoop invullen**. Vul of kies een leveranciersnaam, een optionele bestelreferentie en de inkoopprijs per product/stuk exclusief btw. Een leverancier mag je gewoon typen; suggesties komen uit bestaande bedrijfsgegevens, er is geen verplicht apart leveranciersdossier. De verkoopprijs blijft behouden. Zonder bestaande koppeling wordt geen inkoopbestelling of batch aangemaakt.

Je kunt tegelijk een leveranciersfactuur toevoegen. Aanvoer/verzending/overige kosten en eventuele invoerrechten staan onder de bijbehorende extra opties. Bij losse inkoop telt aanvoer van de leverancier mee in het bestaande veld Overige eigen orderkosten: samen één bedrag, één keer in de marge. Benoemde extra kosten tellen apart; niet dubbel opnemen. Onbekend blijft leeg; expliciet0 betekent bewust geen kosten. Invoerrechten niet stil op0 zetten. Bekende gegevens blijven ingevuld.

Een bestaande inkoopbestelling met **precies één gekoppelde klantorder** kun je via hetzelfde compacte formulier bewerken. De bestelling blijft bestaan; leverancier, aanvoer en overige inkoopkosten blijven bij die inkoop. Eigen verzend-/overige orderkosten blijven op de order. Geen kopie, loskoppeling of verdeling over andere orders. Als er inmiddels een tweede order is gekoppeld, stopt bewaren en blijft invoer staan. Bij meerdere gekoppelde orders blijft de gezamenlijke route beschikbaar; gedeelde kosten niet stil als kosten van één order behandelen.

Een ongewijzigde berekende kostprijs behoudt zijn exacte berekening/bron. Alleen een bewust gewijzigde handmatige stukprijs vervangt die kostenbron; de calculatorlink/historie zelf wordt niet verwijderd. Aan echte gekoppelde leveranciersfactuurregels ontleende prijzen blijven beschermd. Wijzig die via de oorspronkelijke factuur; dit formulier verandert geen gefactureerde aantallen.

## Leveranciersfacturen bij de kosten

**Factuur toevoegen** bewaart alleen het bestand en optionele leverancier/factuurnummer/factuurdatum. Dit kan ook zonder alle kosten al te kennen. PDF, PNG, JPG en WebP tot15MB per bestand, maximaal10bestanden en50MB per opslag. Eén ingevoerde factuurdatum/-nummer geldt voor de geselecteerde bestanden; voeg verschillende facturen apart toe. De factuurdatum mag onbekend blijven; uploaddatum is geen aangenomen factuurdatum.

Bestanden staan met Preview/Download/Verwijderen direct bij Inkoop & marge en als duidelijk gemarkeerde Leveranciersfactuur onder Documenten → Overige documenten. Bestaande bestanden van een gekoppelde inkoop worden eveneens bereikbaar getoond, zonder ze te kopiëren. De normale documentverwijdering/controle op btw-bewijs blijft gelden. De typekeuze voor een gemarkeerde leveranciersfactuur wordt niet naar Klantfactuur omgezet.

Een upload leest geen factuurbedragen uit, verandert geen kosten/betalingen/voortgang en maakt geen leveranciersbetalingsregistratie. Vul de werkelijke inkoopprijs bewust in. Btw Bronnen & boekingen ziet een ongeclassificeerd bewijs met de opgegeven echte factuurdatum; geen btw-bedrag of aftrek wordt afgeleid en niets wordt automatisch geboekt. Geen fiscale bronfactuurregistratie met automatische prijs-/betaalreconciliatie uit deze stap.

Leveranciersfiles staan in categorie other met supplierDocument-metadata; geen gegenereerde klantfactuur. Ze krijgen geen klant-betaallink-/factuurmailactie. Ze worden niet standaard met klantfactuur meegestuurd. Expliciet zelf een bestand als mailbijlage kiezen blijft mogelijk.

## Overzicht

Marge en de compacte leverancierskaart komen vóór uitvoeringsregistratie en calculator. De calculator blijft bij de productregel bereikbaar en staat bij Kosten onder een gesloten onderdeel. Gezamenlijk inkopen is bij een losse order een extra optie. De bestaande fysieke voortgang registreer je apart bij Voortgang bijwerken: kosten invullen of een factuur bewaren betekent niet dat er werkelijk besteld, betaald of geleverd is.

## Techniek

- shared/direct-purchase.js: whitelist, prijs-/bronbehoud, documentenmeta en exclusieve inkoopprojectie.
- admin/orders/direct-purchase.js: live-contextfactory, compact formulier en bijlagen, één bestaande state/files-transactie met actuele order-/inkoopvergelijking en relatiecontrole. Andere actuele CRM-records blijven behouden, fout behoudt invoer, metadata en bestanden samen committen. Geen tweede datastore.
- orders/workspace.js composeert kaart en route; app.js alleen contextgetter documentFile en import/cache. Spatlappen houdt zijn bestaande route.
- Documentrol wordt gevalideerd; documentFile toont leverancier/ref/datum. Geen klantfactuurcategorisering of klantbetaalacties bij deze rol. vat-ledger leest alleen een ongeclassificeerde file-bron zonder bedragen/seed.
- Geen automatische data-migratie, bestaande records blijven behouden. Deelinkoop/meerdere leveranciers, OCR, reconciliatie met leverancierbetalingen en voorraadverdeling zijn afzonderlijk vervolgwerk.
