> Batch3vervolg27oktober: gewone betaalstatus en orderstatusfilter delen shared/order-payment-status.js op bestaande bedragen. Geen bekende productprijs = Prijs nog onbekend; geen expliciet bekende verzending = Verzendprijs nog onbekend, inclusief historische ontbrekende flag. Geen definitief Betaald/overbetalinglabel of groene betaald-badge uit die onvolledige prijs. Geen wijziging aan werkelijke ontvangsten/sommen/BTW/sales-funnel-/mail-/productievrijgaveregels of migratie. Lokaal bronwerk; eigen controle open, geen tests/publicatie.

# Bedragen herkennen: excl. en incl. btw

Lokale presentatieverbetering voor beide bedrijven, 21 oktober 2026. Geen opgeslagen bedragen, berekeningen, btw-tarieven, documenten of betalingen gewijzigd. Geen tests, syntaxchecks, builds, browser-QA, providerproeven of publicatie; Philippe test zelf.

## Vaste afspraak

- Verkoop-/productprijzen, inkoopprijzen, overige kosten, orderomzet en marge: **excl. btw** als hoofdweergave.
- Klantbetalingen, betaalverzoeken, aanbetaling/restant en ordersaldo: **incl. btw**, het volledige bank-/Tikkiebedrag. Een ontvangst wordt niet eerst teruggerekend naar excl. btw of als omzet behandeld.
- Opbouw: bedrag excl. btw → btw apart → te betalen incl. btw. Gebruik uitsluitend het bestaande ordertarief en de bestaande totalen. Geen nieuw tarief, fiscale keuze of anders afronden.
- Onbekende prijs/verzending blijft onbekend/voorlopig. Geen definitief saldo of overbetaling uit een onvolledige prijsafspraak afleiden in de nieuwe samenvatting/lijst.
- Leveranciersdocumenten: oudere documenttotalen hebben geen vastgelegde btw-basis. Toon **documentbedrag zoals geregistreerd** en werkelijk overgemaakt; geen fictief excl.- of incl.-label en geen conversie van historische bedragen. Inkoopregels die de marge bepalen zijn als excl. btw gelabeld. Documenttotaal en betaalbedrag blijven eigen brongegevens. Volledige btw-splitsing/leveranciersreconciliatie is apart vervolgwerk.

## Wat je ziet

Bovenaan een order: Orderbedrag excl. btw en Marge excl. btw, met een apart betaalvak incl. btw voor totaal/ontvangen/openstaand en een link naar Betalingen. De orderlijst gebruikt Verkoop excl. btw als hoofd-/sorteerkolom (bestaande net-key), met incl.-totaal en bruto openstaand saldo op onderregels. Een oude opgeslagen sorteerkeuze wordt niet gemigreerd.

Bij Betalingen staan totaal te betalen, ontvangen en restant expliciet incl. btw. De naastgelegen kaart Van excl. naar incl. btw maakt de opbouw zichtbaar. De grafische verdeling staat dicht onder extra details; de tekstbedragen blijven direct zichtbaar. Ontvangst-/correctieformulieren en betaallinks benoemen de btw-basis; percentages blijven op het bestaande totaal incl. btw gebaseerd.

Inkoop & marge heeft expliciete excl.-koppen en invoerlabels. De eenvoudige Maat-inkoop hanteert dezelfde basis. Leveranciersdocumenten en overboekingen geven aan dat de document-btw-splitsing nog niet afzonderlijk is vastgelegd; automatisch optellen van inkoopregels voegt geen btw toe.

Analytics verdeelt de eerste cijfers in Verkoop & resultaat excl. btw en Ontvangen geld incl. btw. Debiteuren zijn klantbedragen incl. btw; crediteuren volgen geregistreerde document-/bankbedragen met onbekende document-btw-basis. De berekeningen en tijdvakselecties zijn ongewijzigd. Het dashboard noemt Te ontvangen incl. btw; klantdossiers hadden al passende labels. De orderkaart noemt expliciete basis bij getoonde bedragen.

## Implementatie en grenzen

Gedeelde presentatiehulp admin/workspace/money.js met vaste tekstlabels; orderheader in admin/orders/money-summary.js gebruikt uitsluitend bestaande totals/economics. Centrale CSS in admin/style.css, mobiele groepen stapelen. Geen tweede opslag, financieel rekenmodel of btw-uitsplitsing van ontvangen bedragen. Factuur/PDF/Word/mailinhoud en externe betaalacties blijven hun bestaande route gebruiken. Geautomatiseerde herkenning van verkeerd ingevoerde oude incl./excl.-kosten is niet toegevoegd; bedragen zijn niet herberekend of gemigreerd.

Philippe controleert de schermweergave zelf, ook afwijkende btw en onvolledige orders. Bronlog via code, volledige werkplektaak blijft open.
