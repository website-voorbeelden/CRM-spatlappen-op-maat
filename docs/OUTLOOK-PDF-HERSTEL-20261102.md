# Outlook PDF-herstel — 2 november 2026

Gebruiker ziet vier opgehaalde bevestigingen met een PDF-bewaarfout en geen eenduidige ordermatch. OAuth/mailtekst/nummerherkenning werken daarmee voor die bronnen; PDF-bewaring niet als geslaagd beschouwen.

## Gevonden oorzaak

Eén van de precies genoemde bronmails met de gekoppelde Outlook-connector gelezen; geen algemene inboxexport. Metadata van de oorspronkelijke fileAttachment meldt308737bytes. Dezelfde bijlage kon via de connector als rawbestand worden opgehaald: werkelijk308403bytes, %PDF-1.7-header en afsluitende %%EOF. De oude vergelijking bytes.length===attachment.size wees deze bron ten onrechte als onvolledig af. Dit is bron-/documentonderzoek, geen testronde van de gewijzigde CRM-code. Eerste beperkte netwerkpoging kreeg geenHTTPantwoord; via netwerktoegang originele bronHTTP200. Tijdelijke afgeschermde downloadverwijzing daarna verwijderd; geen factuur/PDF/ruwe mail/toegangsURL/ID in openbare bron.

Correctie: Graph-metadata apart bewaren als optionele providerSize; size en sha256 zijn van de werkelijk ontvangen bytes. HTTP-download blijft begrensd en volledig lezen verplicht; opgegeven Content-Length wordt voor niet-gecodeerde responses vergeleken met werkelijk ontvangen bytes. Bij gecomprimeerde responses is de header geen maat voor uitgepakte bytes. PDF-header en eindmarkering vereist, werkelijke omvang/hash opnieuw gecontroleerd bij downloaden. Geen PDF-conversie/hergeneratie of versoepeling van oorspronkelijke bronhashbewaking. Herhaalde opslag vergelijkt providerSize (oude records: size) met de provider en behoudt originelen.

Bij fouten meldt de rij nu de stap (gegevens/download/PDF-header/PDF-einde/opslag) en eventueel veilige Microsoft-HTTPstatus. Geen rawproviderfout, tokens of mailtekst. De bestaande retryknop staat direct zichtbaar als PDF opnieuw ophalen; bestaande mislukte bronnen niet wissen of opnieuw financieel importeren. Open Wachtrij bekijken en kies per betreffende mail PDF opnieuw ophalen. Een gewone sync slaat reeds bekende bronIDs over en herhaalt oude fouten niet onbeperkt automatisch.

## Orderkoppeling

Alleen aantallen/aanwezigheid in de bestaande online CRM-orderbron gelezen: geen Kunststofbaas-bestelreferenties opgeslagen. Daarom nog geen nummermatch. Niet automatisch lokale browserdata naar productie kopiëren en niet gokken op productprijs, klantadres of een oud pakbonnummer. Exacte leveranciers-/interne referenties en conflictgrenzen blijven ongewijzigd. De UI onderscheidt geen match van meerdere matches en toont ook zonder PDF een link naar Orders om het juiste bestelnummer zelf bij de order te bewaren.

## Grenzen

Geen tests/checks/browser-/DOM-/visueleQA, geen gewijzigde CRM-retry uitgevoerd door bouwer, geen mailboxmutatie of financiële/order-/betaalmutatie. Alleen bestaande bron gelezen en code/docvergelijking. Publicatie wordt afzonderlijk vastgelegd; eigen controle van de nieuwe retry en PDF blijft open. Bestaande wijzigingen/berichten/bestanden/OAuth/scheduler/PACKSvrijgave behouden. Uitgaande Graph-mail niet aangepast.
