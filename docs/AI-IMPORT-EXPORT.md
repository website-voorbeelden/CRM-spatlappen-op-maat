# Werken met een eigen AI-chat

## Gegevens uit e-mails of documenten invoeren

Gebruik AI prompt bij klanten, klantorders of leveranciersdocumenten. Kopieer die prompt naar je AI en voeg je broninformatie toe. De prompt vraagt eerst om verduidelijking wanneer essentiële informatie ontbreekt of bronnen elkaar tegenspreken. Bij een order gaat het bijvoorbeeld om aantal fysieke stuks, noodzakelijke productuitvoering/materialen, belangrijke maten, prijsafspraak, btw of onduidelijke echte betalingen. Optionele administratieve velden zoals een factuuradres of telefoonnummer houden het antwoord niet tegen. Je kunt expliciet toestaan dat relevante informatie voorlopig onbekend blijft.

Na die vragen hoort de AI één volledig JSON-blok met taal `json` te geven, zonder tekst buiten het blok of escape-tags. Het bestaande importformaat blijft hetzelfde: bedragen in EUR-centen, maten in mm, onbekende getallen null en onbekende tekst een lege string. Bronbestanden, betaalverzoeken en facturen gelden niet als bewijs van ontvangen geld. De prompt kan het gedrag van een externe AI sturen, maar biedt geen garantie: de CRM-parser en het controlescherm blijven controleren.

Je kunt het hele blok of alleen de JSON via de kopieerknop plakken. Klant, order en leverancier gebruiken dezelfde parser. Tekst rondom het blok, meerdere blokken, ongeldige JSON of een verkeerd formaat worden geweigerd met een aanwijzing bij het invoerveld. Controleer daarna de gegevens in het normale formulier; pas na jouw opslaan verandert het CRM. Een bewust onbekend veld kan nog nodig zijn voordat je de order werkelijk bewaart of een factuur maakt.

## Opgeslagen dossierinformatie meenemen

Bovenaan iedere CRM-pagina staat **Exporteren voor AI**. Bij een order kies je tussen deze order met de bijbehorende klant of het hele klantdossier met alle orders, inclusief archief. Bij een klant wordt het hele dossier gekozen. Bij een inkoopbestelling krijg je die zending en haar gekoppelde orders. Andere pagina’s delen hun bestaande paginacontext en eventuele getoonde dossierselectie; lijsten met meer dan twintig dossierverwijzingen worden expliciet als beperkt aangegeven. Een pagina-export is geen volledig bedrijfsarchief.

In het voorbeeld zie je de exacte JSON. Klantgegevens, producten, vastgelegde status/datum, adressen, betalingen, ontbrekende orderinformatie en documentnamen gaan mee. Interne notities en inkoopkosten kun je uitzetten. Bewaarde mailteksten worden alleen na aanvinken meegenomen en blijven binnen de gekozen dossierscope. Er wordt geen Gmail-ophaalactie uitgevoerd. Onbekende prijzen/verzendkosten worden niet als nul of als definitief saldo gepresenteerd.

Kies **Kopieer voor AI** en plak de context zelf in de gewenste chat, of kies **Download JSON**. Het CRM verstuurt de export niet naar een externe dienst. Bij geblokkeerde klembordtoegang wordt de JSON geselecteerd voor ⌘C/Ctrl+C. Bekijk de inhoud voordat je die zelf deelt.

Bijlagen, afbeeldingen, ontwerp-/calculatorinvoer, betaal-URL’s, providercredentials en niet-opgeslagen formulierwijzigingen worden niet opgenomen. Wil je een AI de inhoud van een PDF laten beoordelen, voeg dat document apart toe. De export heeft formaat `crm-ai-context`: bedoeld als leesbare context, niet om als nieuwe klant/order terug te importeren. Te grote exports worden geblokkeerd; kies dan één order of laat mailteksten weg. Exporteren wijzigt geen dossiers, betalingen, documentnummer of bestanden.
