# Batch 2 — eenvoudiger inkoop, invoer-btw en transport

31 oktober 2026. Alleen lokaal brongebouwd voor eigen controle, gedeeld voor Spatlappen op Maat en Maatwerkkunststof. Bestaande invoer-btw uit29oktober eerst vergeleken, niet opnieuw als ontbrekende databasefunctie gebouwd. Batch1wijzigingen, klant-/order-/inkoopgegevens, bestanden/templates en Git-staging behouden.

Gebruiker heeft tussentijds de publicatiekeuze beantwoord: **Alles lokaal houden**. Geen open publicatiegoedkeuring meer afwachten of opnieuw vragen; er is nu geen upload-/liveopdracht. De twee geïsoleerde orderherstelkandidaten blijven ongewijzigd op schijf.

## Bediening

Inkoop → bestelling → Kosten & zending → **Inkoopkosten aanpassen**. Dit opent een afzonderlijk formulier, zonder de klantorderselectie, leveranciercontacten of status/planning opnieuw te moeten invullen. Op andere inkooptabs staat dezelfde actie onder Meer; Facturen & betalingen toont ook de btw-/uitgavenuitsplitsing met een ingang naar dit formulier.

Formulier: transport en overige gezamenlijke kosten, betaalde invoer-btw/aftrek/betalingsbron/bewijsreferentie. Invoerrechten en verdeelsleutel staan bij aanvullende opties; onbekende invoerrechten zijn ook in het controleoverzicht zichtbaar. De enige hoofdactie is Kosten opslaan. Een leesbaar controleoverzicht wordt uit de huidige formulierinvoer afgeleid; dit schrijft niets totdat de gebruiker bewaart.

Transportbasis is nu een expliciete keuze: Nog controleren / Nee, productprijzen zonder transport / Ja, al inbegrepen. De eerdere checkbox maakte onbekend bij opslaan onbedoeld false. Dezelfde keuze wordt door het gewone zendingformulier en beide AI-formulierroutes gebruikt. Positief transport zonder bekende basis houdt kostprijs/marge voorlopig. Een betaling inclusief transport bepaalt de productprijsbasis niet.

Het volledige zendingsformulier blijft beschikbaar voor leverancier/planning/koppelingen, met kosten standaard ingeklapt. Generieke transport-/oppervlaktelabels gelden voor beide bedrijven. Geen nieuwe CSS; bestaande centrale formulier-, details-, fout- en overzichtsregels gebruikt.

## Kosten, btw en uitgaand geld

Nieuwe gedeelde pure purchase-cost-overview projecteert dezelfde purchaseInfo als de ordermarge; geen tweede opgeslagen financieel totaal. Het scherm toont productkosten vóór en na eventuele transportcorrectie, transport één keer, invoerrechten, overige en benoemde kosten, niet-terugvorderbare invoer-btw en totale bekende kostprijs. Kosten bij individuele klantorders (zoals bezorging) blijven daarvan afzonderlijk zichtbaar bij die orders.

- Terugvorderbaar: invoer-btw buiten de kostprijs/marge; apart zichtbaar als terugvorderbaar bedrag en wel in de uitgaande geldbasis.
- Niet terugvorderbaar: invoer-btw eenmaal in de kostprijs, niet nogmaals bij het bedrag bij volledige betaling.
- Aftrekbaarheid onbekend: ingevoerde btw apart en marge voorlopig. Bij bekende overige componenten kan de uitgaande geldbasis wel bekend zijn; cash-out hangt niet af van die keuze.
- Btw leeg: onbekend, geen bewezen €0. Ook artikel-/orderkostenuitsplitsingen tonen de ontbrekende btw-basis nu als onbekend. Expliciet nul blijft geldig.
- Geen leveranciersdocumenten/betalingsbasis: niet automatisch €0 als bevestigde betaalbasis optellen bij invoer-btw.
- Berekende invoerrechten blijven een schatting, ook in de nieuwe totaallabels.

Geregistreerde leveranciersbetalingen plus invoer-btw blijven een **gedeeltelijk betaald overzicht**: importVatIncludedInSupplierPayments bepaalt of de btw al in de geregistreerde leverancierbetalingen zit. Onbekende overlap of een inbegrepen btw-bedrag groter dan die betalingen blijft Nog afstemmen. Externe bank-/inklarings-/bezorgbetalingen kunnen nog ontbreken. Dit is geen volledig kasboek; dat blijft scope van batches3/5. Het uitgaande bedrag bij volledige betaling is een kostenbasis, geen vaststelling dat die kosten betaald zijn.

Transportcorrectie en gezamenlijke kosten gebruiken nu dezelfde bestaande allocateCents-helper als artikelkosten. Dezelfde verdeelsleutels en grootste-restmethode behouden; onbruikbare/onnauwkeurige verdeelbasis wordt geweigerd in plaats van een restcent stil te laten verdwijnen. Geen oorspronkelijke productprijs/factuur/betaalbedrag herschrijven.

## Bestaande JSON/opslag/AI-keten

| Onderdeel | Bron en aansluiting |
|---|---|
| Velden en validatie | shared/purchase-import-costs.js: importVat EUR-centen, optionele nullable booleans en bewijsreferentie. Oude ontbrekende velden blijven geldig. Fouten dragen nu waar toepasselijk hun veldnaam voor gerichte formulierhulp. |
| Database en back-up | Bestaande volledige purchase-records in state/main; de opslagfacade serialiseert bestaande records als JSON. Geen extra SQL-kolom, aparte bedrijfsdatabase of migratie nodig. State-/restorevalidatie behoudt de bestaande importregels. Geen echte opslag/herstelproef uitgevoerd. |
| Hele leveranciersimport | admin/ai-import.js: velden in prompt/normalisatie; admin/inquiries/ai-import-flow.js: controleformulier en purchaseDraft naar persistSupplierInvoice. Null/ongewijzigd behoudt bij voorstel bestaande velden; expliciet false/nul blijft geldig. |
| Document binnen zending | admin/purchases/document-ai.js + supplier-document-form.js: prompt/JSON → controleerbaar voorstel → readImportCostFields → purchaseDraft → bestaande state/files-opslag met bron-/product-/revisiebewaking. |
| Beide AI-prompts | Onbekend tegenover expliciet nul en transportbasis verduidelijkt. Documentprompt vereist version1; hele leveranciersimport weigert een onbekende expliciete versie en houdt oudere antwoorden zonder version bruikbaar. |
| Marge en artikelen | purchaseInfo/allocatedCost → economics; terugvorderbare btw niet als kosten. Kostenuitsplitsingen gebruiken dezelfde btw-bekendheidsregel. |
| Btw-register | Bestaande vatLedger en bewijs/kwartaalbediening blijven eigenaar. De nieuwe kostenbediening maakt geen aangifteboeking, betaling of automatische ledger-reconciliatie. |

Het nieuwe kostenformulier bewaart uitsluitend de kosten-/verdeelvelden en hun bestaande herkomst. Het bewaakt actuele zending én product-/koppelingbasis binnen mergeStoredState. Wijzigingen door een andere tab/dienst blokkeren opslaan met invoerbehoud; geen gehele oude snapshot terugzetten. Geen nieuwe leveranciersbetaling of factuur door Kosten opslaan. Ongewijzigde herkomst wordt weergegeven op de Nederlandse veldwaarde; bij opslaan alleen passende herkomst opnieuw ondertekend voor de opgeslagen centen/booleans. Handmatig afwijkende waarden krijgen geen verzonnen AI-bron.

## Ertürk — rekenbasis voor eigen controle

Deze bedragen zijn uitsluitend een uitwerking van het aangeleverde voorbeeld; niet ingevoerd of functioneel uitgevoerd. Aannames: geen overige ontbrekende kosten/invoerrechten, volledig bekende productkosten en geen afzonderlijk benoemde dubbelen. Nul alleen zelf kiezen als die aanname werkelijk klopt.

| Productkosten vóór correctie | Transport | Transportbasis | Overige kosten | Betaalde invoer-btw | Kostprijs bij terugvorderbare btw | Geldbasis bij volledige betaling |
|---|---|---|---|---|---|---|
| €590,00 | €350,00 | Nee, apart | €135,50 | €336,21 | €1.075,50 | €1.411,71 |
| €940,00 | €350,00 | Ja, inbegrepen | €135,50 | €336,21 | €1.075,50 | €1.411,71 |

De €135,50 is bankkosten €24 + inklaring €79,50 + administratie €32. Een geregistreerde leveranciersbetaling van €940 wordt niet opnieuw een kostenpost. Met apart betaalde invoer-btw is leveranciersbetalingen + invoer-btw €1.276,21; de externe €135,50 is daarmee nog niet als betaling geregistreerd. Bij btw die al in de leveranciersbetalingen zit, wordt deze niet opnieuw bij het betaalde totaal opgeteld. Niet-terugvorderbaar geeft in hetzelfde volledige voorbeeld €1.411,71 kostprijs én geldbasis, geen tweemaal btw.

## Eigen controle en grenzen

Open: beide bedrijven; nieuw formulier en bewaren/heropenen, komma/punt/nul/false/leeg, annuleren/fouten/conflicten/twee tabs, bestaand groot zendingformulier en beide AI-routes inclusief bijlagen/herkomst, productkosten €590 tegenover €940 en betaalbedrag onaangetast, verdeling/afronding/lokale producten, terugvorderbaar/niet/onbekend/bewijs, kosten-/artikel-/Analyticsaansluiting en back-up/restore. De twee voorbeeldregels kunnen als eigen vergelijkingsbasis dienen; geen werkingsgarantie.

Oude lege velden zijn niet gemigreerd en kunnen nu extra controlepunten opleveren. Batches3–5 blijven open voor bedrijfskosten/volledig kasoverzicht, factuurscan/matching en overboekingen naar jezelf. Geen aangeleverde Kunststofbaas-facturen geopend; geen fiscale beoordeling/aangifte. Alleen bronvergelijking/bewerking en bouwadministratie, geen tests/checks/syntaxchecks/build/generator/browser-/DOM-/visuele controle of runtimeactie, provider/mail/betaling, migratie, zakelijke data-/bestandsmutatie, Git-/indexwijziging/upload/publicatie. Taak crm-finance31-batch2 review/local via scripts/build-task.mjs. Jouw controle blijft open.
