Bron: https://github.com/website-voorbeelden/Rekentool
Commit: 2ea77feb588cd1cfe3c7130eb6f5c74bed5ceb36
De oorspronkelijke rekenkern is behouden. CRM-koppeling staat in crm-bridge.js en crm-storage.js.
Koersen uit de bron zijn historische richtkoersen, geen actuele automatische koersen.

Lokale CRM-uitbreiding 2026-10-14: losse offertewerkplek in quotes.html/quote-workspace.js, aparte browseropslag in quote-store.js, allowlists/historische feiten in quote-domain.js. Optionele verkoop-/inkoopkoppeling in admin/costing-links.js en shared/costing-link.js. Financiële formules behouden; kern exposeert nu per-regel directCost/supplierCost/ownWorkCost en UI geeft een invoerwijzigingssignaal zonder payload. Zie docs/KOSTPRIJS-OFFERTES.md voor grenzen/back-ups.

## Originele interface behouden — 14 oktober 2026

Vergeleken met website-voorbeelden/Rekentool op commit `2ea77feb588cd1cfe3c7130eb6f5c74bed5ceb36`. UPSTREAM.json bevat de originele checksums van alle 14 assetbestanden. Twaalf zijn bytegelijk. quote-calculator.js heeft uitsluitend de import/export/calculate-hook en wijzigingsevent; quote-calculator-core.js voegt uitsluitend drie kostenvelden toe aan bestaande resultaatregels voor correcte CRM-kostensplitsing. De originele formules, interface, stylesheet en overige resultaatvelden blijven behouden. Een checksumtest verwijdert de twee afgebakende adaptertoevoegingen en controleert dan eveneens de originele hashes.

index.html gebruikt de originele main en assetvolgorde. De algemene quote-workspace.css is verwijderd uit de calculatorpagina; de nieuwe crm-integration.css is uitsluitend op CRM-controls gericht. Bewaar-/koppelcontrols staan na de originele calculator, bereikbaar met een kleine link bovenaan. De aparte quotes.html blijft een beheerpagina voor bestaande berekeningen/leveranciers; aanmaken vanuit de CRM-picker opent nu rechtstreeks index.html. Bestaande bronkoppelingen, prijsbeveiligingen en expliciete sync zijn behouden. Een nieuwe iframe-berekening ontvangt uitsluitend de bestaande toegestane numerieke productcontext. Geen klantdata of automatisch orderopslaan.

## Orderoverdracht en CRM-bediening — 14 oktober 2026
De aparte CRM-balk staat nu vast boven de originele rekentool. Orderlinks behouden orderId/itemId én een eventuele quoteId. Opnieuw openen legt actuele aantallen/maten over bewaarde rekeninstellingen; materiaal/dikte en ronde specificaties gaan mee zonder klant/contactgegevens. Bestaande leveranciersinstellingen blijven behouden. Een totaalleveranciersofferte voor meerdere producten moet opnieuw voor het gekozen product worden ingevuld.

Uitkomst controleren & overnemen toont eerst een vergelijking. Na expliciete bevestiging worden gekozen productgegevens/kostprijs en eventueel verkoopprijs atomair opgeslagen, met conflictcontrole, bescherming van leveranciersfacturen en totaalprijzen. Daarna terug naar de orderkosten. Een bronofferte wordt niet stil gewijzigd. Dezelfde feedback- en lokale AI-componenten zijn beschikbaar; AI ontvangt uitsluitend beperkte rekenspecificaties als paginacontext en schrijft vanuit deze pagina geen CRM-orders.

## Inline vooraf invullen — 21 oktober 2026

De CRM-wrapper voor een nieuwe berekening krijgt nu aantal, decimale breedte/hoogte, materiaal en dikte uit de huidige productregel. shared/costing-inline-context.js begrenst dezelfde allowlist aan beide kanten van het bestaande same-origin/taaknonce-kanaal. Alleen bekende positieve waarden, geen klant/contact/omschrijving/prijzen/leveranciersmetadata; per-paar inkoop wordt aantal stuks. Oude waarden worden niet door ongeldige/ontbrekende velden gewist. Een bestaande quoteId blijft bij openen leidend; bestaande bewuste synchronisatieknoppen behouden. Geen Core/assets-wijziging, geen nieuwe tarieven of stil opslaan. Volledige V2-route blijft open; Philippe controleert zelf, geen tests/build/browserQA.
