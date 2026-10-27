> Batch3vervolg27oktober: omgekeerde periode markeert beide datumvelden en verbergt paginering tot herstel. Bij rijrefresh behoud van focus op dezelfde ontvangst/detail/link waar aanwezig, inclusief meerdere gelijke URLs; verdwenen rij gaat naar zoeken, overige invoer/dialogfocus ongemoeid. Geen nieuwe providerrequest of sorteer-/bedragwijziging. Zie BATCHES2-4-OPMAAK-20261027.md; bron lokaal, niet getest/gepubliceerd.

> Vervolg27oktober: nieuwe providerontvangsten tijdens geopende CRM-sessie geven lokaal ook een klein bericht met Bekijken; de lijst zelf maakt geen push. Telefoonbezorgstatus toegevoegd aan Telefoon & meldingen. Initieel geladen historie blijft stil; concrete gemiste telefoonmelding niet onderzocht. Zie [Mobiele meldingen](MOBIELE-MELDINGEN.md). Geen tests/publicatie.

# Centraal betalingenoverzicht — 27 oktober 2026

Philippe wil een apart tabblad omdat hij na een ontvangen Tikkie niet weet bij wie die hoort. Lokaal menu **Betalingen** onder Verkoop & relaties, route `#payments`, gedeeld voor beide bedrijven. De bestaande ordertab Betalingen blijft. Geen klant-/order-/betaal-/ontwerpgegevens of historische IDs veranderd; geen nieuwe bank- of provideractie.

## Wat je ziet

Een rustige lijst: ontvangstdatum/-tijd, klant bij de order, ordernummer, bedrag incl. btw, Tikkie/andere registratie en omschrijving. Klant/order klikken opent de bestaande ordertab Betalingen; daarnaast klantdossier. Nieuwste Nederlandse ontvangstdag eerst; echte providerstijdstippen in die dag boven registraties zonder tijd. Geen exact tijdstip verzinnen uit alleen een datum of invoermoment.

Zoeken op klant/contact/e-mail, order, bedrag of omschrijving. Bedragen met komma/punt/duizendtal/€ kunnen gevonden worden. Tikkie-filter direct; datum en alleen aandachtspunten onder Meer filters & uitleg, met actieve-filteraanduiding en Filters wissen.50 regels per pagina, paginaknopjes uitsluitend wanneer nodig. Archief wordt niet stil weggefilterd. Lange omschrijving kort in de rij, volledig onder Details; registratie-ID/tijd en correctieverwijzing daar, geen externe providerpaymenttokens in de lijst.

De klantnaam is afkomstig van de **huidig gekoppelde order/CRM-klant**, niet een bewezen naam van de rekeninghouder. De bestaande Tikkie-adapters bewaren token/bedrag/tijd/omschrijving en importeren bij de exacte order; zij bewaren geen aparte rekeninghoudernaam. Hier niets raden, geen nieuwe banktoegang of achteraf matching op alleen bedrag. Ontbrekende order/klant/naam/bedrag/datum expliciet als aandachtspunt. Bekende bronmetadata Tikkie herkenbaar, andere registraties kunnen handmatig of geïmporteerd zijn; niet alle oude bronloze records als bewezen handmatige bankbetaling labelen.

Alleen actuele state.payments tellen mee, geen tweede ledger, geen dedup/zelfcorrectie of betaalstatusafleiding. Verwijderde ontvangsten blijven in het bestaande ordercorrectielog; herstel/aanpassing op dezelfde bestaande route. Voormalige bedragen in correcties niet dubbel optellen. Onbekend bedrag niet0, totaal bij onveilige som of uitsluitend onbekende bedragen onbekend; gedeeltelijk bekende som als bekend deel. Dit is ontvangen geld incl. btw, geen omzet/marge. Leveranciersbetalingen blijven bij Inkoop; deze eerste tab is voor klantontvangsten.

## Bijwerken en invoerbehoud

Bijwerken gebruikt de bestaande read-only actuele state-ophaalroute, met expliciete foutterugmelding voor deze knop. Geen POST naar Tikkie, geen nieuwe providerjob/interval en geen push. De Tikkieachtergrondcontrole loopt apart; bij veel links kan een nieuwe betaling later in de CRM-opslag verschijnen. Ook geen gewone bankoverschrijvingen automatisch gedetecteerd.

Filters en pagina zijn uitsluitend sessie-/schermkeuzes. Iedere paint leest context.state opnieuw. Lijstonderdelen worden vervangen, zoek-/filtervelden blijven gemount en geopende betalingsdetails blijven waar mogelijk open. Bij externe refresh dezelfde werkplek hergebruiken; geen gekopieerde businessstate, nieuw localStorage/IndexedDB-record of draft. Tijdens navigatie/retry geen oude knop vast in busy laten staan. Bestaande bescherming voor open formulieren/dialogen, externalRefreshSeq en sessionUndo.observe blijven leidend. Bij fout/conflict oude lijst en invoer houden, geen succesmelding zonder werkelijk nieuwe uitlezing. Nieuwe optionele throwOnError/result in refreshExternalState laat bestaande achtergrondcallers stil zoals eerder; alleen handmatige knop toont de fout.

## Bronnen en eigenaarschap

shared/payment-overview.js: pure readonly join van actuele payments→orders→customers, zoeken, ontvangstdatum, sortering/aandacht en veilige som. Nieuwe arrays/indices, bestaande betaalobjecten niet wijzigen.

admin/payments/workspace.js: featurefactory met live context, DOM/filter/paginering en weergave. Constructor leest geen nog niet geïnitialiseerde apphelpers. app.js uitsluitend import/factory/getter/route en optionele refreshresultaat-/foutmodus; geen betalingspagina inline. Navigatie/iconen gemeenschappelijk, assistant-pagina alleen labeltoevoeging. Opmaak uitsluitend admin/style.css met bestaande tabel-/zoek-/knopbasis en beperkte eigen layoutregels; mobiele bestaande tabel-/zoekbreakpoints behouden. Geen paarse decoratie of tweede stylesheet.

## Eigen controle open

Alleen bron gelezen en gewijzigd, geen tests/checks/syntaxchecks/builds/browser-/DOMcontrole, provider-/betaal-/push-/mailproef of echte data-inspectie/mutatie. Niet gepubliceerd, geen serviceherstart of tabreload. Bouwtaak review/local via scripts/build-task.mjs; opgeslagen eigen status/feedback blijft behouden.

Philippe beoordeelt beide bedrijven/mobiel: nieuwste Tikkie/order/klant, bedrag-/naam-/referentiezoeken, filter/unknown/periode/DST, archief/correcties/ontbrekende koppeling, paginering en reset, focus/open details bij inkomende update, handmatig Bijwerken met netwerk-/loginfout/open formulier/navigatie. Publicatie apart op expliciet verzoek. De genoemde concrete ontvangen Tikkie is niet door Codex opgezocht of aan een naam toegeschreven; alleen broncode bekeken.
