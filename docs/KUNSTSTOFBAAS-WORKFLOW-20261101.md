> Nieuwste uitvoering1november: zie KUNSTSTOFBAAS-KORTE-WORKFLOW-20261101.md. Beschrijving nu exact alleen naam/adres/ons nummer; directe adresvelden; nummer → factuur → compacte producten → pakbon/label/mail lokaal brongebouwd. Onderstaande eerdere planstand is historie; volledige hoofdtaak/operationele PACKS-keten nog niet gereed.

> Latere bronverduidelijking1november: handleiding p.7 en actuele Swagger ondersteunen ontbrekende loadDate én deliveryDate (PACKS kiest standaardmomenten). De verplichte loadDate is onze huidige codebeperking. Automatic-planning is nog niet in CRM gebouwd; zie PACKS-WORKER-V8-REVIEW-20261101.md voor analyse aangeleverde worker en fouten.

# Kunststofbaas — gewenste werkvolgorde, 1 november 2026

Vastgelegde gebruikerswens; dit document is GEEN claim dat deze volledige indeling of koppeling al is gebouwd. Alleen Maatwerkkunststof. Eerst lokale opstart herstellen; daarna de door Philippe nog aan te leveren worker-code beoordelen en PACKS-aansluiting afmaken. Geen automatische tests, boekingen, mail of publicatie. Eerder bronwerk en eigen controle behouden.

## Volgorde vanuit de order

1. Klant heeft orderbevestiging ontvangen en betaald. Die feiten blijven de echte bestaande order-/betaalregistraties; tab openen leidt ze niet af.
2. Bovenaan, vóór de webshopbestelling: direct zichtbare kopieerbare bestelnotitie met ONZE orderreferentie en het werkelijke afleveradres van de klant. Bekende afleverinstructies erbij. Dit gaat in de opmerkingen bij Kunststofbaas, omdat hun webshopafleveradres niet gebruikt wordt. Eigen tekst eenvoudig aanpassen; als het echte adres onjuist is, de bestaande orderadresvelden corrigeren. Tekst aanpassen mag niet stil een ander adres voor label/pakbon achterlaten. Bestaande eigen teksten/templates behouden; geen automatische hernummering.
3. Philippe bestelt zelf op Kunststofbaas en vult daarna HUN volledige bestelnummer in het zichtbare veld. Geen intern order_ids uit URL als ordernummer gebruiken. Dit nummer blijft leidend voor alle verdere logistiek. Onze orderreferentie is aanvullend.
4. Factuur-PDF slepen/kiezen (link indien toegankelijk). Bewerkbaar voorstel voor materiaal, CNC, opstart, transport, btw en toerekening. Kosten pas na expliciete acceptatie bewaren. Kostprijs/marge uit dezelfde bestaande financiële bron tonen; onvolledigheid zichtbaar. Vergelijkbare aantallen/maten/materialen/orderreferentie ter controle tonen, afwijkingen niet automatisch wegwerken. Een leverancierspakbon blijft een controledocument en maakt geen kosten of betaling. Mail met PDF-bijlage rechtstreeks ontvangen/verwerken is een later idee, niet nu bouwen.
5. Afleveradres duidelijk in beeld, bestaande adrescorrectie beschikbaar. Onze pakbon genereren via de bestaande documentmaker. Gewenst: HUN bestelnummer prominent op de plek van het zichtbare pakbonnummer. Eigen PB-nummer/reeks, documentidentiteit, historie en revisies apart behouden; dit is een gevraagde documentwijziging die nog NIET in de template/datamapping is gebouwd. Alleen passende Kunststofbaas/Maat-pakbonnen, Spatlappen behouden. Bestaande documenten en eigen templates niet ongemerkt herschrijven.
6. PACKS-label aanmaken vanuit dezelfde order. Eerst voorgesteld aantal pakketten, verpakte buitenmaten en gewicht zelf accepteren of aanpassen. Geen verzonnen gewicht of productmaat gelijkstellen aan verpakte maat. Eenvoudige onzekerheidsuitleg; uitgebreide kleur-/vertrouwensscores zijn toekomstidee en geen huidige bouwopdracht.
7. Gebruiker wil standaard dat PACKS plant en optioneel klaar-over-aantal-dagen/gereeddatum kiezen. Technische grens nog uitzoeken met worker en PACKS-contract: huidige bron vereist loadDate (gewenste afhaling), deliveryDate is optioneel. Lege gewenste bezorgdatum is geen bewijs dat PACKS ook afhaaldatum kiest. Bestaande bron stelt morgen bewerkbaar voor; dat is geen bevestigde gereedheid/afhaling. Geen tijdstip verplicht maken zonder noodzaak, geen extra Pickup bij bestaande dagelijkse ronde. Niet onopgemerkt een verplichte providerwaarde weglaten of een leverbelofte doen.
8. Na geslaagde/teruggevonden boeking de originele pakbon en alle originele PACKS-labels bekijken/downloaden, eventuele opmerkingen tonen. Onzeker boekresultaat herstellen met dezelfde poging, geen nieuwe boeking uit een ontbrekend label. Preview is optioneel, oorspronkelijke bijlagen moeten beschikbaar blijven.
9. Mailvoorbeeld naar de leveranciersontvanger met exact de actuele pakbon en label(s). Gewenst onderwerp: **Pakbon <hun bestelnummer> - Order <ons ordernummer>**. Kort: hun nummer, onze order, afleveradres, productaantal en werkelijk opgegeven gereed-/afhaal-/gewenste bezorgdatum met duidelijke labels (geen planning verzinnen). Geen uitgebreide volledige producttekst nodig. Geconfigureerde TJ Worx-afzender kiezen/controleren. Laatste expliciete Versturen biedt de mail aan; provideracceptatie is geen bewijs van aflevering of fysieke verzending. Daarna duidelijke mailstatus en bij onzekerheid herstel, geen stil herverzenden.

## Stand van de bron

| Onderdeel | Stand | Levering |
| --- | --- | --- |
| Opstartfout door te vroege company-getter in invoerbewaking | Lokaal hersteld; Philippe bevestigt dat CRM weer opent, overige bediening/beide bedrijven open | Lokaal |
| Leveranciersnummer, factuurinvoer, bewerkbare kostenacceptatie | Eerder brongebouwd; niet opnieuw functioneel gecontroleerd | Lokaal |
| Pakbon/label/mailknoppen en beschermde onderliggende routes | Eerder gedeeltelijk brongebouwd; centrale inrichting en praktijkcontrole open | Lokaal |
| Exact nieuwe volgorde, bestelnotitie bovenaan en korte nieuwe mailopmaak | Gewenst vastgelegd; nog te bouwen | Niet live |
| Leveranciersnummer groot op plek pakbonnummer | Gewenst vastgelegd; nog te bouwen zonder PB-identiteit te wijzigen | Niet live |
| PACKS-planning zonder expliciete afhaaldatum | Nog contract/worker te beoordelen; huidige code vraagt loadDate | Niet geactiveerd |
| Facturen via inkomende leveranciersmail | Later idee, niet gebouwd | Niet live |

Zie PACKS-EERSTE-ZENDING-20261101.md voor resterende account-/dienst-/servervrijgave. Worker-code is nog niet ontvangen of beoordeeld. Geen volledige-keten-, live-, geslaagde-test- of waterdichtheidsclaim. Opgeslagen feedback-/gebruikersstatus niet afhandelen op basis van deze planning.
