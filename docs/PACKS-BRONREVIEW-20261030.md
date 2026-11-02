> Vervolg31oktober: vier nieuwe afgebakende taken, generieke proefmail met actuele twee bijlagen en gekozen proefadres, aparte online proefstand/inrichting voorbereid. Geen runtime-/hosting-/mail-/boekingsproef of publicatie. [Stand, risico’s en vier batches](PACKS-VIER-VERVOLGBATCHES-20261031.md).

# PACKS — gerichte bronreview en herstel

30 oktober 2026. Uitsluitend broncode/templates/documentatie vergeleken en lokaal bewerkt. Geen functionele testronde, geen browser-QA, geen converter/provider of echte gegevens gebruikt. Hoofdtaak `maat-kunststofbaas-fulfilment-20261029` blijft doing/local; geen publicatie of complete werkende koppeling claimen.

## Concrete bevindingen

| Punt | Bevinding in bron | Lokaal aangepast | Stand |
|---|---|---|---|
| PR-01 Pakbon aanpassen | appendDocumentRevision liet generated.supplierFulfilment weg. De nieuwere versie sloot de oude versie uit, terwijl de nieuwe niet meer als leverancierspakbon herkenbaar was. | De oorspronkelijke bestel-/referentiebasis blijft op PDF en Word bewaard. Adres, eigen ordernummer en klantreferentie blijven bij revisie aan diezelfde bron gekoppeld. Leveranciersnummer in opmerkingen behouden als het niet in klantreferentie staat. Zowel voor voorbeeld als atomaire opslag bewaakt. | Brongebouwd/lokaal; niet getest |
| PR-02 Label bij oude voorbereiding | Na een opnieuw bevestigde order kon labelupload nog de oude pakketvoorbereiding als labelbasis gebruiken. | Gedeelde supplierLabelMetadata bewaakt actuele basis/referentie/leverwijze bij openen én in de opslagtransactie. Bestaande labels met zo'n oude voorbereiding tellen niet als actueel mailvoorstel. Oude bestanden/keuze blijven bestaan. Zonder voorbereiding blijft de handmatige bestaande labelroute mogelijk. | Brongebouwd/lokaal; niet getest |
| PR-03 Schermfout na geslaagde opslag | Verversen/downloaden/terugopenen konden na commit een fout geven alsof opnieuw opgeslagen moest worden. | Leverancierslabel, bestelformulier, voorbereiding, pakbon en documentrevisie onderscheiden bewaarde gegevens van een mislukte vervolgweergave/download. Succesvolle opslag niet door een opvolgfout als mislukte opslag aanbieden. | Brongebouwd/lokaal; niet getest |
| PR-04 Duidelijke volgende stap | Controleoverzicht bleef alleen Voorbereiding aanpassen als hoofdactie aanbieden, ook bij complete voorbereiding. | Compleet zonder label: Label uit PACKS toevoegen. Met actueel label: Verder met bestelling. Onvolledig: Voorbereiding aanpassen. Andere keuzes bij Meer; geen boekknop. | Brongebouwd/lokaal; niet getest |
| PR-05 Registerblokkade tijdens opslag | Een registerclaim las de vrijgave vóór asynchroon opslaan en kon daarna toestemming teruggeven terwijl de guard al was veranderd. | Na duurzame intentie guard/generation opnieuw lezen. Bij wijziging blokkeren met behoud van pending-bewijs. Een toekomstige providerdispatcher moet vlak vóór dispatch opnieuw config/guard/order controleren; deze toevoeging bewijst geen volledige racevrije providerketen. | Interne basis aangescherpt/lokaal; niet getest |

Bij PR-01 geldt: tekst, geleverd aantal en gewone opmerkingen blijven bewerkbaar. Voor een andere bestemming of referentiekeuze een nieuwe pakbon via de bestelstroom maken. Oude opgeslagen documenten/mails worden niet herschreven, ook niet door deze bronwijziging. Een oude bronbasis wordt bij revisie nooit automatisch tot de huidige orderbasis gepromoveerd. Een nieuwere gekoppelde PDF vervangt het oude mailvoorstel; een oud concept mag niet stil de nieuwe PDF krijgen.

## Verder in bron gevolgd

- Alleen Maatwerkkunststof/Kunststofbaas; losse geschikte order, geen Spatlappen, lokale productie of gezamenlijke inkoop met meerdere orders.
- Canonieke leverwijze shipping, eigen CRM-nummer tegenover leveranciernummer en bewuste pakbonklantreferentie. Geen gewijzigde prijzen, kosten, betalingen, productie-/verzend-/leverfeiten.
- Bestelbevestiging en voorbereiding gebruiken oorspronkelijke order-/klant-/inkoop-signature en centrale transacties; validatiefout/conflict behoudt invoer.
- Handmatig PDF-label: limiet4MB, PDF-header, state/files samen bewaren. Dit verifieert de echte barcode/meer-colli-inhoud niet. De gebruiker moet de oorspronkelijke labelinhoud controleren.
- Voorbereiding: mm→cm alleen bekend enkel product/aantal1, geen verzonnen kg/verpakking, Nederlandse datum/morgenvoorstel, geen extra Pickup, eigen gereedheidscontrole en onbekend retourakkoord behouden.
- Leveranciersmail vereist actuele pakbon-PDF plus precies één gekozen labelbijlage; apart leveranciersadres, geen klantbetaallink/funnelafleiding. Preview/uiteindelijke verzendknop en bestaand journal blijven leidend.
- Serverhandler heeft geen providerclient en weigert Book/recover-labels. Omgevingsvlaggen kunnen geen uitvoering inschakelen. Registerstatus blijft los van order-undo/back-up en geeft geen generieke herboekvrijgave.

Dit zijn bronbevindingen, geen uitgevoerde scenario's. Dat een formulierhandler of bewaking aanwezig is bewijst geen werkende browserbediening.

## Eerlijk open

Concrete providerclient/auth/token, accountdienst/productlimieten/payload/datumcontract, werkelijk boeken, GetLabels/PDF-/meer-colli-/bestandsprojectieherstel en operationele registerinrichting/reconciliatie nog bouwen. PK-contract en vrijgavevoorwaarden uit PACKS-KOPPELING/PACKS-BATCH4 blijven open. Labelinhoud, SMTP-aflevering, browserbediening en D1-gedrag niet beproefd. Exact TJ Worx-afzenderadres nog niet aangeleverd; geen mailbox-/afzenderinstelling gewijzigd.

Vier aanvullende fictieve regressiegevallen in tests/packs-local.mjs toegevoegd: oude voorbereiding/oud gekozen label, pakbonrevisie vanaf PDF én Word met nieuwe mailbijlage, geblokkeerde adres-/referentiewijziging/nummerverwijdering, guardwijziging tijdens claimopslag. Niet uitgevoerd. De drie vorige datumgevallen evenmin uitgevoerd. De historische29geslaagde batch3-tests gelden voor de eerdere bronversie.

## Vervolg voor het bredere CRM

Gebruiker vraagt een zorgvuldige verdere CRM-review en vooral AI-order aanpassen bijna hetzelfde als importeren, met aanvinkbare voorstellen. Eerst deze PACKS-review. Bestaande AI-aanvulling heeft een afwijkend changes/path-schema en een eigen tabel; die wens is afzonderlijk geregistreerd, niet als al gebouwd of gecontroleerd afgevinkt. Bestaande opgeslagen gegevens/IDs/bestanden en financiële bescherming behouden. De aparte onlineorderlijsthotfix blijft ongepubliceerd; deze review is geen toestemming voor GitHub/live.

Bouwlog via scripts/build-task.mjs, cache-importketen packs-source-review-20261030. Centrale CSS niet gewijzigd. Geen Git/index/releasekopie, klantgegevens of bestanden opgeschoond; uitsluitend bron-/document-/bouwadministratie.
