> Aanvulling1november: [PDF-factuur slepen](KUNSTSTOFBAAS-PDF-SLEPEN-20261101.md) vanuit Finder/Downloads naar het zichtbare sleepvak. Bestandskiezer blijft beschikbaar; dezelfde lezer, invoerbehoud en financiële acceptatie. Automatisch inloggen is uitgesteld. Alleen lokaal bronwerk, geen tests/publicatie.

# Kunststofbaas — directe velden en PACKS-kopieertekst

1 november 2026. Lokaal brongebouwd, jouw controle open. Geen tests/checks/syntaxchecks/builds/generator/browsercontrole, runtimeherstart, echte recordwijzigingen of publicatie uitgevoerd. Alleen passende actieve Maatwerkkunststof-orders; gedeelde code/centrale CSS behouden.

## Wat je ziet

Bewaar eerst je open invoer en ververs de lokale pagina. Bij **Order → Kunststofbaas** staat het **Bestelnummer van Kunststofbaas** direct als invoerveld, zonder eerst een formulier te openen. Verlaat het veld of druk op Enter om te bewaren. De melding onderscheidt nog niet bewaard, bewaren, bewaard en fout. Geen opslaan per toetsaanslag of automatische bestelling. Het reeds bewaarde nummer terugzetten kan met de tijdelijke herstelknop of Escape. Een leeg gemaakt bestaand nummer wordt niet ongemerkt opgeslagen.

Hetzelfde bestaande order.supplierOrderReference blijft de bron. Na bewaren worden de zichtbare bestelregistratie, beschrijvingsvoorstel, documentcontrolemelding, label-/pakbonactualiteit en factuurkeuzes bijgewerkt, zonder de hele pagina opnieuw op te bouwen. Nieuwe pakbonnen en voorstellen gebruiken dit nummer via hun bestaande koppeling. Een eigen bewaarde beschrijving kan opnieuw controle vragen. Oude gegenereerde documenten, bewaarde concepten en verstuurde mails worden niet herschreven; gewijzigde referentie houdt de bestaande hercontrole voor bestelling/bijlagen.

**Tekst voor de PACKS-beschrijving** staat direct onder het nummer. De kopieerknop gebruikt de werkelijk opgeslagen eigen CRM-orderreferentie, bijvoorbeeld: Zie Maatwerkkunststof bestelling #3001. Het is een korte tekst om zelf in het PACKS-portaal te plakken. Geen boeking, providerreferentie, pakketwaarde of afleverinstructie wordt daarmee automatisch veranderd. Kopiëren leest de bron opnieuw; bij gewijzigd eigen nummer opnieuw openen, klembordfallback selecteert de tekst.

## Factuur direct op de pagina

De bestaande volledige factuurinvoer staat op dezelfde tab, zonder aparte openingsknop. URL en PDF-bestandskeuze staan beide zichtbaar. Een link wordt op veldverlaten/Enter opgehaald; een gekozen PDF wordt direct gelezen. Bij een beveiligde link kan nog steeds downloaden en zelf kiezen nodig zijn: automatisch inloggen bij Kunststofbaas is niet gebouwd. De zes eerder aangeleverde links gaven toegangsweigering; er is in deze ronde geen nieuwe factuur- of accountopvraag gedaan.

Bedragen en product-/kostenregels zijn op de pagina bewerkbaar. De huidige order is voorgeselecteerd; zoek om andere betrokken orders te vinden. CNC/opstart/verzending blijven aparte voorstellen en een bestaande invulling wordt alleen met de eerdere vervangkeuze vervangen. De actieve bron wordt benoemd; PDF lezen gebruikt bij aanwezigheid het gekozen bestand, Link opnieuw ophalen kiest de link. Niet-actieve linkinvoer kan de PDF-route niet met browser-URL-validatie blokkeren; werkelijk ophalen blijft streng servergevalideerd.

Alleen **Kosten accepteren & factuur bewaren** registreert de gecontroleerde factuur en kosten. De gewone factuurvalidator/bewijs/duplicaat/centen/order-/regel-/aftrek-/betaal-/CAS-/revisiecontrole blijft eigenaar. Factuurbedragen worden dus niet automatisch financieel bewaard terwijl je typt. Pakbonnen blijven controledocumenten. Eerder verwerkte facturen staan onder hun eigen onderdeel en worden via de bestaande revisieactie aangepast.

**Invoer wissen** leegt uitsluitend deze nog niet bewaarde factuurinvoer na jouw bevestiging en opent opnieuw een leeg formulier. Geen bewaarde facturen of bestanden worden verwijderd. Gekozen PDF/invoer blijven bij fouten staan. Importfeedback gebruikt de bestaande feedbacklijst en blijft bewust bewaren vragen.

## Bronverdeling en invoerbehoud

- admin/orders/supplier-inline beheert de bewaakte nummerwijziging op change/Enter met één lopende poging en actuele gehele order-/klant-/inkoopbasis. De bestaande pure recordSupplierReference en centrale setter blijven eigenaar; geen nieuw nummer- of betalingsveld.
- supplier-workspace maakt alleen de relevante leesweergaven opnieuw na bewaren. Het factuurformulier blijft bestaan met zijn gekozen bestand/bedragen.
- admin/purchases/invoice-intake heeft één formulierinhoud, lezer, voorstel- en financiële opslagcallback voor modal en inline. admin/workspace/inline-form gebruikt dezelfde formulierbegeleiding, validatie, busy/error/dirtybescherming. Geen tweede financiële flow/store of serverroute. Een fout bij het opbouwen van de factuurvelden heeft een eigen melding/heropenactie en laat de overige orderweergave beschikbaar; een vast diagnosebericht kan met bestaande feedback mee.
- Factuuractie/bewaren wacht op een lopende nummeropslag. Alleen wanneer de vorige gehele factuurbasis exact aansluit nadat de bewezen net gewijzigde order teruggezet wordt, mag deze eigen nummerwijziging de factuur-CASbasis bijwerken. Andere gelijktijdige klant/order/product/bewijs/kostenwijzigingen blijven conflict; bestaande invoer blijft staan. Nummerlabels en productselecties worden bijgewerkt zonder andere formulierwaarden over te nemen; eerdere controlevinkjes worden gewist.
- De herstelknop bij factuurinvoer gebruikt na opnieuw openen de nieuwe controller/basis. Private downloadlinks blijven uit opslag/verslagen. Tijdelijke PDF-viewer-URL wordt bij losgekoppeld formulier opgeruimd; late leesresultaten passen niet op een ander formulier toe.
- Gerichte invoerbewaking voor deze inline formulieren: pagina-acties/tab-/navigatie/hash/back en sluiten/herladen mogen onbewaarde invoer niet stil vervangen. Afronden of expliciet wissen blijft mogelijk; feedback, navigatiemenu openen en de korte PACKS-kopie blijven bruikbaar. Deze bewaking is beperkt tot de nieuwe Maat-invoer; geen brede CRM-navigatieherziening.

Nieuwe bron voor gekoppelde gegevens is niet automatisch inhoudelijk juist of functioneel bewezen. Numerieke/order-/document-/PACKSfeiten blijven hun eigen controles houden. Er is geen nieuwe documenttemplate, calculatie of accountinrichting gemaakt.

## Eigen controle blijft open

Taak maat-supplier-inline-20261101 review/local. Beoordeel nummer bewaren/fout/herstel/Enter, twee tabs en bronconflicten, open factuurinvoer behouden bij nummerwijziging, link/PDF/actieve bron/terugval, kosten accepteren versus typen, invoer wissen, feedback, navigatie/back/refresh, klembordfallback, huidige versus eerdere pakbon/mail en bedrijfsgrens. Geen tests of browserbeoordeling uitgevoerd; bouwstand is geen gebruikersacceptatie of livepublicatie. Eerdere onvoltooide PACKS-inrichting/proef en factuurlinktoegang blijven open.
