# PACKS batch 1 — invoer en controleoverzicht

31 oktober 2026. Vervolg op `maat-packs31-batch1`, uitsluitend Maatwerkkunststof/Kunststofbaas. Lokaal brongebouwd, status Jouw controle. Geen nieuwe uitvoering of activering van PACKS.

## Gewijzigde bediening

Het controleoverzicht toont het aantal ontbrekende punten en het eerste punt. De volledige lijst staat onder **Alle controlepunten bekijken en aanvullen**. Elk punt opent de voorbereiding bij het bijbehorende veld; gesloten adres-/datumonderdelen gaan daarbij open via de bestaande formulierbegeleiding. De hoofdactie bij een onvolledige voorbereiding is **Ontbrekende gegevens aanvullen**. Een bestaand actueel handmatig label behoudt de bestaande vervolgstap naar de bestelling.

Een wijziging wist alleen de bijbehorende eerder gegeven bevestiging. Een korte melding benoemt welke controle opnieuw nodig is; opnieuw bevestigen verwijdert die melding. Alle overige invoer en nog geldige bevestigingen blijven staan.

| Gewijzigde gegevens | Opnieuw bevestigen |
|---|---|
| Pakket toevoegen/weghalen, buitenmaten of gewicht | Pakketten |
| Afleveradres, transportretouradres of afleverinstructie | Adressen en afleverinstructie |
| Afhaaladres | Adressen én gereedheid op die locatie |
| Gereeddatum, afhaaldatum of gewenste bezorgdatum | Gereedheid en datums |
| Onbekend toekomstig veld | Alle drie uit voorzorg |

Bij elke bovenstaande gegevenswijziging vervalt ook een eventueel al aangevinkte hercontrole van een eerder label. De bestaande fysieke labelbasis blijft bepalen of het label werkelijk verouderd is; checkbox-, bron- of bewaarmetadata maken op zichzelf een label niet oud. **Morgen opnieuw voorstellen** met dezelfde datum verandert alleen de herkomstmarkering en wist geen controles. Bij een andere datum vervalt de datum-/gereedheidscontrole.

Een gewijzigde orderbasis of leveranciersreferentie blijft een volledige nieuwe vergelijking vragen. Bewaarde pakket-/adresinvoer blijft beschikbaar; de drie oude bevestigingen worden dan niet als actueel overgenomen. Opslag blijft via de bestaande volledige order-/klant-/inkoop-/voorbereidingsvergelijking en state-transactie lopen. Geen nieuwe zakelijke velden, migratie of opslagkanaal.

## Zelf controleren — nog niet uitgevoerd

- Vul een voorbereiding gedeeltelijk in, bewaar en kies een ontbrekend pakketveld vanuit het overzicht. Controleer de focus en behoud van alle invoer.
- Kies een ontbrekend afhaal-/retourveld en een datumveld in een gesloten onderdeel; controleer of het juiste onderdeel opent.
- Vink de drie controles aan. Wijzig gewicht, afleveradres, afhaaladres en datum elk afzonderlijk en vergelijk met de tabel hierboven. Controleer ook pakket toevoegen/weghalen en afleverinstructie.
- Bevestig een vervallen controle opnieuw; controleer of de bijbehorende melding verdwijnt. Herhaal morgen als die datum al staat ingevuld: overige controles blijven staan.
- Bij een bestaand label: wijzig fysieke waarden en controleer de aparte labelhercontrole en het niet meer actueel meetellen van het oude label na bewaren. Oude bestanden en mails moeten bewaard blijven.
- Bij ongeldige invoer of een inmiddels gewijzigde order: controleer de foutmelding en behoud van invoer. Een gewijzigde orderbasis blijft de volledige vergelijking vragen.

Dit is een gebruikerslijst, geen uitgevoerde test. Philippe heeft de voorgestelde automatische tests expliciet geweigerd. Geen nieuwe testbestanden toegevoegd of bestaande tests uitgevoerd in deze vervolgronde.

## Grenzen

Keuzes en advies over echte buitenmaten, werkelijk gewicht inclusief verpakking, aantal pakketten, dagelijkse afhaalronde, gereedheid en transportretour staan bij de voorbereiding en in [vier vervolgbatches](PACKS-VIER-VERVOLGBATCHES-20261031.md). Geen massa, verpakkingstoeslag, vervoersdienst of tarief geraden.

Echte providerclient/boekuitvoering/GetLabels/bestandsprojectie, operationele inrichting en PK-contractbevestigingen blijven open. Batch 2 blijft gedeeltelijk/lokaal; de aparte online proefomgeving bestaat nog niet. Batch 3 en 4 blijven open. AI-order aanpassen is een afzonderlijke open taak.

Alleen bron/documentatie gelezen, vergeleken en bewerkt en bouwvoortgang via `scripts/build-task.mjs` vastgelegd. Geen automatische tests/checks/syntaxchecks/builds/generator/browser-QA, runtimeactie, netwerk-/account-/boek-/label-/mailactie, zakelijke datamutatie, Gitwijziging, upload of publicatie. CSS ongewijzigd; bestaande formulier- en focusbediening hergebruikt. Cacheketen van deze UI en bouwtaken vernieuwd naar `packs-batch1-control-20261031`. Bestaande klantgegevens, bestanden, wijzigingen en staging behouden. Geen live- of volledige werkingsclaim.
