# Betaalstand op facturen

Lokale bronwijziging 21 oktober 2026, gedeeld voor beide bedrijven. Philippe controleert zelf. Geen tests, syntaxchecks, builds, browser-QA, documentrenderproeven, provideracties, publicatie of wijzigingen aan echte dossiers/bestanden uitgevoerd.

## Stempel bij aanmaken

De converter gebruikt `paidAmount` uit het documentverzoek en het eigen brutototaal van dat document:

| Betaalstand | Stempel |
| --- | --- |
| Niets ontvangen, positief totaal | NOG NIET / VOLDAAN |
| Meer dan nul, minder dan totaal | AANBETALING / VOLDAAN |
| Minimaal het volledige positieve totaal | VOLDAAN |
| Totaal nul | GEEN BEDRAG / TE VOLDOEN |
| Ontvangstbedrag ontbreekt | BETAALSTATUS / ONBEKEND |

De slash betekent een vaste regelafbreking. De bestaande kaderrand en breedte blijven behouden, gecentreerd 12pt met compacte automatische regelafstand. De stempelcel heeft geen vaste rijhoogte of verbod op omloop; twee regels mogen de cel hoger maken. Templatebestanden zelf zijn niet bewerkt. De lokale converter start per verzoek opnieuw, dus er is voor dit bronwerk geen serverherstart nodig. De online documentdienst krijgt deze wijziging pas na een afzonderlijke publicatie.

Alle werkelijk geregistreerde orderontvangsten bepalen de stempel. De optionele selectie van ontvangsten voor de factuurtoelichting verandert de betaalstatus niet. AANBETALING VOLDAAN betekent hier dat een deel van de volledige orderfactuur is ontvangen; het bevestigt geen afgesproken productie- of aanbetalingsdrempel. Productievrijgave blijft haar eigen regel volgen.

## Documentenoverzicht

`shared/invoice-payment-status.js` projecteert uitsluitend `document.generated.payload`: artikelen/pakketprijs, verzending, btw en `paidAmount`. Btw op positieve centbedragen met decimale half-up-afronding zoals de converter. Geen actuele orderontvangsten invullen bij oude bestanden. Het percentage wordt op één decimaal naar beneden begrensd, zodat een open cent niet als100% wordt aangeduid; een heel klein positief deel heet <0,1%. Bij overbetaling staat100% plus het meerdere als afzonderlijk bedrag. Een nultotaal krijgt geen percentage.

Iedere gegenereerde factuurkaart toont een compacte betaalstatus, percentage, ontvangen/totaal en eventueel open/meer ontvangen, met **Betaalstand bij aanmaken**. Deze getallen zijn incl. btw. Ontbrekende of onbruikbare bronbedragen geven **Betaalstand niet bewaard**, niet een afgeleide status uit huidige betalingen. Dit is informatie over de bewaarde betaalstand, geen bewijs dat een historische PDF al de nieuwe stempelopmaak bevat.

Bestaande nummer-/generatiegroepering blijft leidend. PDF en Word van dezelfde factuur staan samen; klantdocumenten blijven via de bestaande orderbronlink te onderscheiden. Bij meerdere facturen staat korte vergelijkhulp in het factuurvak. Uploads zonder gegenereerde bron krijgen geen geraden betaalbadge. Bestaande documenten worden niet herschreven.

## Meerdere facturen zijn geen deelbetalingsadministratie

De bestaande factuurmaker maakt steeds een **nieuw nummer voor de volledige orderwaarde**. Bij eerdere facturen verschijnt daarom een melding met de bestaande nummers en het verschil met een losse aanbetalings-/restfactuur. Opnieuw versturen kan via de bestaande documentkaart. Dit werk wijzigt geen factuurnummers, btw-bronnen, betaaltoerekening of financiële boekingen en introduceert geen deel-/restfacturen of correcties onder hetzelfde nummer. Een afzonderlijke betrouwbare route voor een nieuwe betaalweergave van dezelfde uitgegeven factuur blijft eventueel vervolgwerk; daarvoor niet ongemerkt meerdere volledige facturen uitreiken.

Gebruikercontrole open: onbetaald/deel/volledig in beide profielen, lange stempeltekst in Word/PDF, nul/overbetaling en oude bestanden met ontbrekende bron. Geen visuele pasvormclaim op basis van een niet uitgevoerde renderproef.

## Batch2 — 23 oktober 2026

Ontvangsten vermelden heeft teller, geselecteerd bedrag en alles/niets; expliciet lege selectie na herstel behouden. Dit wijzigt de bestaande paidAmount/betaalstempel niet. Knop Factuur mailen nu op de bestaande router aangesloten; ontbrekende factuur maakt ook Maat met eigen generator vóór mailvoorbereiding. Geen oude factuur aangepast, geen ontvangst aan een individuele factuur toegewezen, geen echte verzending. Zie BETALINGEN-EN-DOCUMENTEN.md; niet getest of gepubliceerd.
