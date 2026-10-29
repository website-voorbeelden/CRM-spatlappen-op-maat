> Batch1vervolg29oktober: gedeelde guard voor betaalstaat/aankomstmail, zoeken/filterterugkeer, expliciet nul/overbetaling/onbekend en gemengde-orderuitleg; onbekende artikelposten zichtbaar. Nieuwe optionele importVatIncludedInSupplierPayments voorkomt dubbel getelde betaalde btw; beide AI-/save-/back-uproutes aangesloten, gedeeltelijk AI-transportvoorstel pas volledig bij opslaan valideren. Zie docs/FEEDBACK29-BATCH1-VERVOLG.md (projectroot). Alleen lokaal bronwerk; geen tests/checks/build/browsercontrole/publicatie, eigen controle/Google-activering open.

# Invoer-btw bij inkoop — 29 oktober 2026

Lokaal brongebouwd voor eigen controle, vooral Spatlappen-importbestellingen; gedeelde code voor beide bedrijven. Geen tests, syntaxchecks, checks, builds, browser-/DOMcontrole of publicatie. Geen bestaande klant-/order-/inkoop-/btw-/betaalgegevens gewijzigd.

## Bediening en opslag

Inkoop → bestelling → Kosten & zending → Bedragen aanpassen (of Zending bewerken): betaalde invoer-btw, aftrekbaarheid (onbekend/ja/nee), invoer-/btw-/betaalbewijsreferentie en transportbasis. Dezelfde velden zijn bij Factuur/offerte toevoegen onder Gezamenlijke kosten beschikbaar. Geen nieuwe stylesheet.

Op het bestaande purchase-record: `importVat` als null of niet-negatieve gehele EUR-centen, `importVatRecoverable` als null/true/false, `importVatEvidence` als tekst (max2000), `freightIncludedInProductCosts` als optionele boolean. De bestaande state-/files-opslag, bedrijfsafscheiding, CAS en volledige back-up behouden alle velden; geen nieuwe SQL-kolom of aparte database nodig voor bestaande JSON-recordopslag. De gedeelde server-/restorevalidator controleert dezelfde velden. Oude records zonder deze velden blijven geldig; geen migratie, geen automatische btw-ledgerovername.

Beide AI-routes ondersteunen deze velden: Meer → AI prompt (volledige leveranciersimport) en Factuur/offerte toevoegen → Invullen met AI. Gegenereerde JSON, normalisatie, controleformulier en atomair opslaan sluiten aan. Onbekende/ontbrekende AI-waarden behouden bestaande zendingwaarden; expliciet false en nul blijven geldig. De documentroute bewaart eigen gewijzigde velden en bijlagen. Het voorstel vervangt zendingtotalen, telt ze niet per factuur op. Bestaande document-/productbasis- en transactieguards blijven behouden.

## Kosten en uitgaand geld

- `importVatRecoverable: true`: invoer-btw buiten product-/batch-/ordermarge, wel in uitgaande geldbasis.
- `false`: invoer-btw één keer als gezamenlijke kosten volgens dezelfde verdeelsleutel.
- Onbekend bij positief bedrag: btw apart, marge voorlopig met controlepunt. Geen automatische fiscale aftrekkeuze.
- Terugvorderbaar zonder bewijsreferentie: marge voorlopig en waarschuwing; dit is een kostenkeuze, geen fiscale goedkeuring. Bewijs moet via bestaande zendingdocumenten/btw-editor controleerbaar zijn; tekst alleen bewijst geen aftrek.
- Bekende uitgaven leverancier + invoer-btw = werkelijk geregistreerde leveranciersbetalingen plus apart ingevulde betaalde invoer-btw. Dit is expliciet geen volledig kasboek: externe kostenbetalingen kunnen ontbreken.
- Uitgaven bij volledige betaling = bekende inkoopkostprijs + btw die buiten de kostprijs staat. Dit gebruikt bekende kosten; het is geen bewijs dat alle bedragen betaald zijn. Ontbrekende kosten/bedragen blijven controlepunten. Geen btw-teruggaaf of gesimuleerde bankbetaling.

Het bestaande `vatLedger` blijft de fiscale bewijs-/kwartaaladministratie. De nieuwe zendingvelden maken geen aangifteboeking, bevestigen geen aftrekrecht en tellen ledger-bedragen niet nogmaals op. Controleer de aansluiting zelf; geen automatische reconciliatie of wijziging van historische boekingen.

## Transport in €940

Een betaling van €940 inclusief €350 transport is geen tweede kostenpost. Bij productregels samen €590 is freight35000 apart en het transportvinkje uit. Als gekoppelde productkostprijzen samen al €940 bevatten, kies freight35000 en `freightIncludedInProductCosts: true`: het inbegrepen bedrag wordt naar oorspronkelijke leveranciersproductwaarden in gehele centen uit de orderproductkosten gehaald en daarna via de bestaande gekozen transportverdeelsleutel één keer herverdeeld. Lokale productie valt buiten die correctie. Oorspronkelijke prijzen/factuurregels/betalingen worden niet herschreven. Een inbegrepen bedrag boven de gekoppelde bekende productbasis blokkeert opslag. Bij ontbrekende productkosten blijft de marge voorlopig. De alternatieve transportberekening vervangt één keer het vervoersdeel.

Voor de aangeleverde bedragen: freight35000, extraCosts13550 (2400+7950+3200), importVat33621 en importVatRecoverabletrue. Bijkomende kosten zonder btw €485,50; met betaalde invoer-btw €821,71. Bij volledig bekende productkosten €590, geen invoerrechten/andere kosten: kostprijs €1075,50 en uitgaande geldbasis €1411,71. Dit is een rekenvoorbeeld, geen ingevoerde klantdata of vastgesteld betaald totaal. Eventuele ontbrekende invoerrechten blijven onbekend.

## Eigen controle open

Opslaan/heropenen/back-up voor beide bedrijven; beide AI-routes en fout/invoer-/bijlagebehoud, nul/false/onbekend, bewijs, productregels €590 versus €940 inclusief transport, meerdere orders/verdeelsleutels/centafronding/lokale producten, marge bij orders/Analytics/batch, uitgaven versus werkelijk betaald, actuele wijzigingen/CAS en bestaande btw-boekingen. Geen functionele/visuele of fiscale goedkeuring. GitHubupload en livepublicatie apart.
