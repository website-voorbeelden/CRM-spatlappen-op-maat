# Batch1 verder uitgewerkt — 29 oktober 2026

Alleen lokale bronuitwerking na de eerdere vijf-batchronde. Scope: zendingbetaaloverzicht, invoer-btw/AI-aansluiting en artikelkosten. Website-meetwaarden en Google-routeadapter vergeleken met bestaande bron: niet dubbel gebouwd. Geen tests, checks, syntaxchecks, builds, browser-/DOM-/visuele controle, provider-/route-/mail-/betaalproef, herstart, GitHubupload, publicatie of klantdata-/bestandsmutatie. Eigen gebruikerscontrole open.

## Klantbetalingen & levering

Inkoop → bestelling → Klantbetalingen & levering toont de hele gekoppelde ordercollectie, inclusief gemengde orders. Standaard de nog niet verzonden/afgeronde/gearchiveerde orders; afzonderlijke filters voor openstaand, geen restant, ontbrekende prijs/betaling, overbetaling en alle orders. Klant-/ordernummerzoekveld, zichtbare telling en eerst controlepunten/openstaande bedragen. Filter en zoekterm blijven alleen in het geheugen van deze bedrijfswerkplek bewaard bij terugkeren. Geen nieuwe database, browserdraft of bedrijfsoverschrijdende opslag.

De drie kerngegevens blijven expliciet het totaal voor de hele zending. Alleen complete prijsafspraken tellen mee bij openstaand; overbetalingen worden nooit gesaldeerd met andere klanten. Nulorder heet Geen betaling nodig, geen ontvangst. Dezelfde pure read-only balansguard voor lijst en aankomstmail vergt bekende product- én verzendprijs en controleert gehele centen, aantallen/prijsbasis en aansluiting met de geregistreerde ontvangsten. Onbekende verzending is geen gratis verzending, ongeldig is geen betaaldstatus.

Per rij één passende vervolgstap: bedragen controleren, productprijs invullen, verzendprijs aanvullen, aankomstmail voorbereiden of dossier/mail openen. De verzendprijsaanvulling gebruikt de bestaande beschermde editor met terugkeer naar de zending. Verstuurbaarheid en ontvanger controleer je in de gewone composer; geen automatische mail. Een zendingaankomst alleen bewijst niet dat lokale artikelen uit een gemengde order compleet zijn: het concept zegt dat expliciet. Reeds verzonden/geleverde orders krijgen geen nieuwe aankomstmail. Er is geen fysieke aankomst, compleetheid of leverdatum door de bouwer geregistreerd.

## Artikelkosten

De bestaande uitsplitsing draagt nu broncompleetheid per component mee. Onbekende inkoop, vervoer, invoerrechten, orderkosten of benoemde bedragen blijven zichtbaar als onbekend/voorlopig, ook bij een huidige numerieke bijdrage van nul. Gedeeltelijk bekende leverancierskosten blijven als gedeeltelijk bekend staan. Onbekende inkoopwaarde/oppervlakte voor verdeling geeft geen definitief artikelbedrag. Totaalverschil met de canonieke orderprojectie blijft een zichtbaar controlepunt.

Bekende componenten gebruiken de bestaande gehele-centenverdeling; per-stukprijs blijft alleen een afgeronde weergave. Lokale artikelen krijgen geen buitenlandse batchkosten toegerekend. Transport dat al in productprijzen zit wordt één keer gecorrigeerd; terugvorderbare invoer-btw blijft buiten marge. Geen bronprijzen, financiële regels, betalingsrecords of opgeslagen kostprijzen vervangen.

## Invoer-btw en betaald totaal

Nieuw optioneel zendingveld `importVatIncludedInSupplierPayments`: null/onbekend, false/apart betaald buiten leveranciersbetalingen, true/al inbegrepen in geregistreerde leveranciersbetalingen. Dit veld heeft alleen invloed op de weergave van uitgaand betaald geld, niet op kostprijs of aftrek. Bij positieve invoer-btw en onbekende overlap wordt geen opgeteld betaald totaal gepresenteerd. Bij true telt de invoer-btw niet nogmaals boven op de geregistreerde betalingen. Een inbegrepen btw-bedrag boven de leveranciersbetalingen geeft een controlepunt. Nul is expliciet vastgelegd; een ontbrekend btw-bedrag blijft onbekend.

UI, beide AI-prompts, JSON-normalisatie, review/voorinvulling, provenance, zendingwissel, opslag, back-up, gedeelde servervalidator en AI-export nemen het veld mee. Oude records worden niet gemigreerd. De kosten-/volledig-betaald-projectie en werkelijke leveranciersbetalingen blijven gescheiden. Geen automatische btw-boeking of aftrekrecht afgeleid. Bestaande importVat/importVatRecoverable/bewijs/freight-velden en alle eerdere wijzigingen behouden.

De AI-normalizer valideert een gedeeltelijk zendingvoorstel nu als voorstel: een expliciete transport-in-productbasis-keuze met freight=null kan bestaande zendinginvoer behouden. De volledige crossfield-/productbasiscontrole blijft vóór echte opslag op het samengestelde zendingrecord. Geen lege AI-waarde die bestaande bedragen wist.

## Nog open

Gebruiker beoordeelt beide bedrijven: onbekende/afwijkende/nul/overbetalingen, gemengde/lokale/afgeronde orders, filter/zoekterugkeer, concept/ontvanger/geen-verzendfeit, punt-/kommainvoer, ontbrekende artikelkosten/verdeelsleutels/centen, apart/al-inbegrepen/ongekende btw-betaalbron, beide AI-routes, invoer/bijlagen/CAS en back-up. Google Maps vraagt nog eigen sleutel/facturering/activering; er is geen configuratie uitgelezen, geactiveerd of opgevraagd. Automatische routeberekening blijft gedeeltelijk/open. Bestaande websitegrafieken worden in deze ronde niet functioneel beoordeeld. Bronbouw is geen gebruikersakkoord.
