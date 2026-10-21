> Update19oktober2026: de kwartaalwerkplek is lokaal toegevoegd. Lees [Btw-voorbereiding](BTW-VOORBEREIDING.md) voor de bronboekingen, inrichting, controles en resterende grenzen. Deze pagina beschrijft de afzonderlijke orderafwijkingencontrole, nu onder #analytics/vat/exceptions. Geen tests/publicatie uitgevoerd; Philippe test zelf.

# Btw-controle en afwijkende tarieven

Lokaal gebouwd op 19 oktober 2026 voor beide bedrijfsprofielen, niet getest of gepubliceerd. Volledige btw-aangiftehulp is nog niet gebouwd.

## Waar vind je het?

Analytics → Btw-controle (`#analytics/vat`). Standaard staan alle orders met iets anders dan 21% of een onbekend/ongeldig percentage in beeld, ook archief. Je kunt kiezen voor Nog controleren of Alle btw-tarieven. De optionele kwartaalfilter gebruikt de **aanvraagdatum**; dit is geen aangiftetijdvakberekening. Onbekende datum valt alleen onder Alle periodes.

Per order: klant/dossier, huidig percentage, interne reden/toelichting, actuele orderbedragen (alleen bij bekende prijzen/verzending/btw), controlepunt en link naar de documentbibliotheek. Verdeling naar tarief en reden telt orders, geen aangifteomzet. Geen optelling van orderbedragen als belastingaangifte. De kaart Nog controleren telt ontbrekende/ongeldige redenen en tarieven binnen de periode.

Bij een bekend afwijkend percentage kun je Reden invullen/aanpassen direct openen. Deze actie verandert alleen de reden en eventuele herbruikbare redenlijst; percentage, prijzen en oude documenten blijven staan. Transactie vergelijkt het oorspronkelijke percentage en de oorspronkelijke reden opnieuw. Bij onbekend/ongeldig percentage ga je naar de bestaande orderbewerking.

## Invullen bij een order

Bij 21% blijft de extra sectie verborgen. Bij een ander percentage is de reden verplicht in het normale orderformulier en in Controleer klantorder van AI-import:

- Goederenlevering binnen de EU, uitvoer buiten de EU, btw verlegd en vrijgesteld zijn afzonderlijke keuzes bij 0%.
- Verlaagd tarief is een aparte keuze bij 9%.
- Buitenlandse btw en Eigen reden kunnen bij een ander percentage gebruikt worden.
- Een reden verandert het percentage niet. Een combinatie met een onverenigbaar percentage geeft een invulfout; geen automatische fiscale keuze op basis van klantland.
- Eigen reden (maximaal 160 tekens), expliciet Bewaar voor volgende keer en optionele toelichting/bewijsverwijzing (maximaal 1000 tekens). Alleen de korte reden komt in de herbruikbare dropdown; bewijs/klanttoelichting blijft bij deze order. Maximaal 100 eigen redenen, geen hoofdlettergevoelige dubbels.

De lijst staat in dezelfde bedrijfsstaat als orders en reist mee in centrale opslag/back-ups. Geen browser-only voorkeur of menging tussen beide bedrijfsadministraties. De eigen reden wordt pas herbruikbaar na geslaagde order-/redenopslag. Kiezen bewaart nog niets. Bestaande ordergegevens worden niet door een migratie aangevuld of herschreven. Bestaande afwijkingen zonder reden blijven geldig opgeslagen en krijgen een controlepunt; bij bewerken vraagt het formulier om de reden.

De algemene tool-assistent kan zelf geen redenkeuze bevestigen. Een nieuwe order met afwijkende btw via die route verwijst naar het normale orderformulier of de gecontroleerde AI-import. De bestaande aanvraagherkenning begint op de bestaande standaard 21% en bepaalt geen buitenlandse uitzondering.

## Documenten en fiscaliteit

De reden is intern; die wordt niet automatisch als klanttekst afgedrukt of naar de documentomzetter gestuurd. Bij nieuwe gegenereerde klantdocumenten bewaart metadata `generated.vatReason` een snapshot naast de al bestaande payload. Bestaande PDF/Word-bestanden blijven ongewijzigd; dit voegt geen ontbrekende wettelijke factuurvermelding toe. Controleer de factuurtekst en het onderliggende bewijs bij een uitzondering. Documentaanpassingen van bestaande offertes/bevestigingen hebben nog geen volledige fiscale historiek; facturen zijn in die revisie-editor niet bewerkbaar.

De Belastingdienst onderscheidt 21%, 9%, 0% en vrijstellingen en vraagt afzonderlijke registratie van verschillende tarieven. Een keuze in het CRM is geen bevestiging dat alle fiscale voorwaarden gelden. Voor een aangifte zijn onder meer het gebruikte stelsel, bronfacturen, ontvangen facturen, invoer, correcties en ICP nodig. Dit scherm leidt geen aangifterubrieken of terug te vragen btw af uit orders. Er wordt niets ingediend of naar de Belastingdienst verzonden.

Bronnen geraadpleegd op 19 oktober 2026:

- [Wat administreert u voor de btw?](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/wat_administreert_u_voor_de_btw/)
- [Btw-tarieven en vrijstellingen](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_berekenen_aan_uw_klanten/btw_berekenen/btw_tarief/)

## Techniek en grenzen

Pure classificatie/projectie: shared/vat-review.js. Gedeelde formuliervelden: admin/orders/vat-reason.js. Analytics-module: admin/analytics/vat.js via bestaande live context en shell. Gebruik van bestaande centrale stylesheet; geen extra stylesheets. Redenvelden zijn optioneel in het opslagmodel om bestaande administratie/back-ups niet te blokkeren; aanwezige nieuwe classificaties en herbruikbare lijst worden gevalideerd. De verplichte gebruikerskeuze zit in de genoemde bewaarformulieren. Geen volledige afdwinging voor oude clients/legacy-imports; die afwijkingen komen in de controlelijst.

Catalogustaak vat-exception-review beschrijft deze lokale stap. Taak23 vat-quarterly-assistance blijft open voor de volledige kwartaalvoorbereiding. Geen tests, syntaxchecks, builds, browser-QA, provideracties of echte gegevensmutaties uitgevoerd tijdens deze implementatie. Publicatie en runtime-bouwlog zijn niet gedaan.
