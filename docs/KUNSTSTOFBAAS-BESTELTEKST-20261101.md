> Nieuwste afspraak1november: leveranciersnummer voorop, eigen CRM-referentie aanvullend. De nieuwe standaard gebruikt leveranciersreferentie en verwijst naar pakbon/label voor aflevering; bestaande eigen teksten/templates niet migreren. {{onze_referentie}} is niet meer verplicht wanneer {{leveranciersreferentie}} aanwezig is. Zie KUNSTSTOFBAAS-LOGISTIEK-20261101.md. Alleen lokaal, geen tests/publicatie.

# Kunststofbaas — bestelbeschrijving en standaardtekst aanpassen

1 november 2026. Alleen Maatwerkkunststof, lokaal brongebouwd voor eigen controle. Geen tests/checks/syntaxchecks/builds/browsercontrole uitgevoerd. Geen echte order, kosten, documenten, mails of instellingen gewijzigd door Codex. Geen publicatie of runtimeherstart.

## Gebruiken

Bewaar eerst je open invoer en ververs de lokale CRM-pagina. Open **Order → Kunststofbaas → Beschrijving voor Kunststofbaas · aanpassen of kopiëren**.

- **Beschrijving voor deze order aanpassen** opent een tekstformulier. Wijzig de hele beschrijving, controleer hem en bewaar. Deze eigen tekst geldt uitsluitend voor dit dossier en blijft bij opnieuw openen behouden. Je kunt de gecontroleerde tekst ook eerst kopiëren zonder hem al te bewaren; het formulier blijft dan open.
- **Meer → Standaardtekst aanpassen** opent de standaard met een voorbeeld voor de huidige order. Dit geldt voor volgende automatisch opgebouwde voorstellen bij Maatwerkkunststof. Eigen orderteksten en bestaande mails/documenten blijven behouden. Een nog niet als eigen tekst bewaard voorstel volgt dus ook de aangepaste standaard wanneer het opnieuw wordt opgebouwd.
- In het eigen tekstformulier kan **Actueel standaardvoorstel invullen** de invoer na een bewuste vervangbevestiging opnieuw opbouwen. Bewaren blijft afzonderlijk. Met de afzonderlijke wiskeuze en Bewaren verwijder je de eigen afwijking en volgt deze order weer de standaard. De template-editor kan eveneens de oorspronkelijke standaard in het formulier zetten; ook dat wordt pas na Bewaren actief.

De oude bestelbevestigingsdialoog toont dezelfde gekozen beschrijving. Bewerken gebeurt via de bovenstaande eigen werkplek; je hoeft daarvoor geen bestelling als geplaatst te bevestigen. Nieuwe gewone leveranciersmailvoorstellen gebruiken de gekozen tekst. Een bestaand concept blijft zoals het is, ook wanneer je de standaard of ordertekst later wijzigt.

## Nieuwe standaard

Het bekende Kunststofbaas-bestelnummer en onze CRM-referentie staan bovenaan, daarna producten en afleveradres. Productregels noemen alleen bekende gegevens: werkelijk aantal uit de order, omschrijving, materiaal, dikte, buitenmaat, specificaties en waar van toepassing een verwijzing naar berekening/tekening. Geen materiaal, aantal, naam of adres raden uit een algemene productnaam. Geen automatische specificatieherkenning uit een losse calculatie toegevoegd.

Interne meldingen zoals Materiaal nog controleren en Afleveradres nog invullen staan apart als waarschuwing in het CRM en gaan niet als zulke placeholderteksten in het standaardvoorstel mee. Ontbrekende brongegevens blijven zichtbaar. Bij ontbreken eerst de order aanvullen of een eigen tekst expliciet beoordelen; de gewone kopieerknop weigert een ongecontroleerd incompleet standaardvoorstel als die product-/adresvariabelen in de template gebruikt worden. Een bewust korte template met uitsluitend referenties vraagt geen product-/adrescontrole voor die kopie. Dat is geen bewijs dat handmatige tekst inhoudelijk klopt: de gebruiker controleert die zelf.

Een beschrijvingswijziging vult geen materiaal, dikte, aantal of afleveradres in de echte order aan. Pakbon-/PACKS-/bestelvalidatie blijft die werkelijke ordervelden gebruiken. Tekst is geen bestelling, verzending, betaling of financiële bron.

## Variabelen

| Veld | Inhoud |
|---|---|
| `{{onze_referentie}}` | Maatwerkkunststof order # gevolgd door ons nummer; verplicht in de standaard |
| `{{leveranciersreferentie}}` | Kunststofbaas bestelling met bekend nummer; anders leeg |
| `{{producten}}` | Bekende productregels met aantallen en specificaties |
| `{{afleveradres}}` | Bekende ontvanger, adres en land |
| `{{afleverinstructies}}` | Bekende afleverinstructies; anders leeg |

Alleen deze eenvoudige invulvelden, geen HTML/evaluatie/AI-instructies of berekeningen. Onbekende/kapotte dubbele accolades worden geweigerd. De eigen ordertekst moet onze #ordernummerreferentie behouden. Template maximaal10.000tekens, samengestelde/eigen tekst maximaal24.000; ruimte voor de overige tekst van een mail van maximaal30.000tekens. Geen stil afkappen. Een te lang of onbruikbaar standaardresultaat wordt als tekstprobleem bij deze werkplek gemeld; de standaard blijft daar bereikbaar om te corrigeren.

## Bewaren en wijzigingen bewaken

Pure shared/supplier-order-text beheert standaard, invulvelden, korte producttekst, waarschuwingen en bronbasis. De bestaande supplierOrderDescription-helper verwijst daarnaar. Lazy admin/orders/supplier-description werkt vanuit actuele context, zonder opslag/state-read bij constructie. De ordertab composeert deze eigenaar; geen tweede losse beschrijvingeditor in de shell of aparte stylesheet.

Optionele state.supplierOrderTextTemplate {text,updatedAt} en order.supplierOrderText {text,basis,updatedAt} in de bestaande bedrijfsstaat/back-up, geen migratie/nieuwe datastore. Zowel centrale statevalidatie als deze lokale mutatieroute valideren de nieuwe velden. Maat-bedrijfs-/beschikbaarheidsgrens, verse merge/CAS op relevante order-/tekst-/templatebasis, kopiëren vergelijkt eveneens een opnieuw gelezen opslagbasis, herhalen met gelijk resultaat geen extra activiteit. Invoer blijft staan bij conflicten; een na commit mislukte notificatie met aantoonbaar eigen opgeslagen tekst geeft geen nieuwe-opslagclaim/replay. Geen uitgebreide tekstversiehistorie toegevoegd; terug naar standaard is een bewuste wijziging met bestaande activiteit.

Gewijzigde order-/leveranciersreferentie/producten/calculatie/klant/adres kunnen een bewaarde eigen tekst oud maken. Die tekst blijft behouden en vraagt herbeoordeling vóór kopiëren/nieuwe mail; niet stil vervangen. Alleen leverwijze veranderen naar Verzenden maakt de beschrijving niet oud. De bestaande fysieke fulfilmentbasis blijft ongewijzigd: alleen de beschrijving/template aanpassen maakt actuele labels of pakbonnen niet ongeldig. Werkelijke product-/adres-/nummerwijzigingen behouden de bestaande fysieke hercontrole.

Een orderkopie neemt de eigen dossierbeschrijving niet mee. Samenvoegen van een bronorder met eigen tekst blijft expliciet geblokkeerd; de tekst verdwijnt niet. Een bewaarde tekst bij het blijvende dossier vraagt na veranderde producten hercontrole. Sessie-Stap terug blijft voor deze niet-financiële tekstwijziging de bestaande gewone eigenaar; volledige back-up bevat beide optionele velden. Standaardgegenereerde invoer is als templatebron lichtpaars, eigen wijzigingen blijven handmatig.

## Nog open

Taak maat-supplier-text-20261101 review/local. Philippe beoordeelt zelf opbouw, eigen tekst/standaard/terugzetten, kopieerfallback, ontbrekende ordergegevens, bronwijzigingen/twee tabs, bewaarfouten, nieuwe versus bestaande mails, orderkopie en back-up. Geen functioneel/visueel akkoord of waterdichtheidsclaim. Eerdere factuurlink-/PACKS-/feedbackscope en hun open gebruikerscontrole/inrichting blijven behouden. Geen Git/index/upload/livepublicatie.
