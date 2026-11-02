# Kunststofbaas batch 2 — planning, pakbonkop en aansluiting

1 november 2026. Alleen lokale bron; geen tests/checks/builds/browser-QA/provideractie/publicatie. De operationele proefomgeving/accountvrijgave blijven open. Dit document maakt de gedeeltelijke status concreet; bron is geen geslaagde boekingsproef.

## Gebouwd

- Nieuwe voorbereidingen kiezen standaard PACKS-planning. Beide datumvelden ontbreken dan werkelijk in het BookShipment-verzoek; geen null, leeg datumveld of verborgen morgenvoorkeur. Is de bestelling later klaar, kies dan Zelf een datum kiezen. Een eigen afhaaldatum is controleerbaar, met optionele gereed-/bezorgdatum. De gereedheidsbevestiging past bij de gekozen modus; automatisch plannen is geen bewijs dat het pakket klaarstaat.
- Oude voorbereidingen zonder planningMode blijven exact een eigen-datumvoorbereiding. Hun oude labelbasis blijft gelijk; geen bestaande dossiers/labels/concepten omgeschreven. Wisselen van modus wijzigt de fysieke basis en vraagt opnieuw controle. Verborgen datums kunnen niet ongemerkt toch worden verzonden. In het formulier blijven ze tijdelijk staan bij terugschakelen vóór bewaren.
- Voorgesteld afhaal- en transportretouradres komt uit het eerder door gebruiker opgegeven Kunststofbaas-adres. Geen PACKS-accountadres of retourakkoord verzonnen. Controle en contractvrijgave blijven nodig. Geen gewicht/verpakkingsmarge/dienstlimiet/tarief geraden.
- Payload, vaste registryaanvraag, antwoordbinding, labelherstel en oorspronkelijke labelbundel ondersteunen de datumkeuze. Nieuwe bevestigde boekingen bewaren eventuele door PACKS teruggegeven planning apart; ontbrekend blijft onbekend. Datum met tijdzone wordt naar de Nederlandse kalenderdag omgezet. Verkeerde of tegenstrijdige datum is geen geldige planning. Eigen aangevraagde datum blijft streng aan het antwoord gebonden.
- Provider-ID’s blijven vóór labels duurzaam bewaard. Een labelstoring/onzeker resultaat geeft geen nieuwe poging vrij. Planning hoort bij dezelfde poging, verhuist mee met de bijbehorende labelbundel en wordt bij de centrale opslagbevestiging vergeleken. Oude boekingen krijgen geen verzonnen planning achteraf.
- Boekingsscherm, eigen eindcontrole/rapport en nieuwe gewone mailvoorstellen onderscheiden gewenste datum en door PACKS geplande datum. De voorbereiding gaat via de hoofdknop naar de bestaande boekingscontrole, zonder via een handmatig-labeluploadformulier te worden geleid. Lokaal blijft werkelijk boeken geblokkeerd.
- Nieuwe Maat-pakbonnen met expliciet Kunststofbaas-nummer tonen dat nummer in de bestaande packing_slip_number-plek. Op de bronstandaard wordt die regel 16pt vet. Eigen templates houden hun eigen typografie en hun bestaande invulveld. De PB-reeks, payload.number, bestandsidentiteit en revisiehistorie blijven intern apart; Spatlappen en bestaande documenten ongewijzigd. Nieuw expliciet supplier_order_reference is bij gekoppelde revisies beschermd.
- De browser vraagt een terugmelding van de documentservice over het weergegeven nummer. Een oude omzetter wordt niet stil geaccepteerd als leverancierpakbon met prominente referentie. Beide onderdelen moeten dus samen worden bijgewerkt. Geen DOCX-bronbestand of eigen template gewijzigd.
- De centrale PACKS-status vermeldt ondersteuning voor automatische planning. Een oude dienst zonder deze ondersteuning geeft bij de nieuwe automatische keuze geen boekingsvrijgave vanuit de browser.

## Nog nodig

Een afgezonderde online preview-CRM met eigen D1/R2/sessie/integratiesleutel en de private testdienst met dezelfde opslagidentiteit en sessievoorwaarden. Geen van die resources/secrets/migraties is nu aangemaakt of gewijzigd. De bestaande configuratievoorbeelden zijn bron en installatie-instructies, geen geactiveerde omgeving. De gebruiker heeft uitsluitend lokale bouw gevraagd.

API-account/testrechten/Direct Booking, daadwerkelijk dienstproduct en grenzen/maatformule/tarieven, retourafspraak en kalender-/gereedheidsafspraken moeten bevestigd zijn vóór vrijgave. Ontbrekend blijft geblokkeerd; niet met de ontvangen mogelijk live-login in een testhost proberen. De gebruiker wil vragen hierover later.

Daarna eigen praktijkcontrole van pakketwaarden/adressen/nummer, eerste bedoelde boeking, oorspronkelijke labels/pakbon en mail. Geen automatische tests uitgevoerd of vrijgave afgeleid uit de bronreview. Publicatie, PACKS-uitvoering en mailverzending blijven afzonderlijke handelingen.

## Bestanden

De bestaande eigenaarsrollen blijven: shared/packs-preparation en packs-provider-contract, cloudflare/packs-registry/execution/handler, shared/packs-label-projection en de orderbediening. shared/kunststofbaas bevat alleen de bekende leveranciersvoorstellen. document-generator.py wijzigt de presentatie pas bij expliciete leverancierreferentie; admin/documents bewaakt de bestaande nummer-/revisie-/templatebasis. Geen tweede boekingsregister of financiële eigenaar.
