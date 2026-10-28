# Feedback28oktober — batch 2: inkoop, betaalde btw en AI-invoer

Status: lokaal brongebouwd, **Jouw controle**. Geen functioneel/visueel akkoord, GitHubpush of livelevering. Bouwtaak `feedback28-batch2-purchases`. Batch1 blijft review/local; batch3 is nog gepland. Dit betreft uitsluitend de twee nieuwe inkoopmeldingen uit DRIE-FEEDBACKBATCHES-20261028.md.

## Waar te vinden

- Inkoopbestelling → Facturen & betalingen → **Factuur / offerte toevoegen → Invullen met AI**. Prompt kopiëren, document zelf in eigen AI-chat toevoegen, JSON plakken, Voorstel invullen en daarna gegevens controleren/bewaren. De originele bijlage zelf kiezen in hetzelfde formulier.
- Bij een opgeslagen leveranciersfactuur: **Meer → Btw vastleggen / bekijken** opent de bestaande btw-boeking of de bron. Een offerte/pro forma krijgt deze factuuractie niet.
- Inkoopbestelling → Kosten & zending of Facturen & betalingen: **Betaalde btw & invoerbewijs** toont gekoppelde boekingen. Btw / invoerbewijs vastleggen opent de bestaande btw-editor met de zending en Invoerbewijs als wijzigbaar voorstel. Bekijken / aanvullen opent dezelfde boeking; bewijs via het rustige Bewijs-menu. Ook zichtbaar bij Analytics → Btw → Bronnen & boekingen, met teruglink naar de zending.

## Betaalde btw blijft apart

Er is één gezaghebbend register: state.vatLedger. Geen tweede btw-totaal op de zending of leveranciersfactuur. Optionele velden op een bestaande boeking zijn purchaseId en paidVat {amountCents,date,reference}. Het betaalde bedrag is gehele EUR-centen; leeg blijft onbekend, expliciet nul is mogelijk. De referentie verwijst naar het btw-betaalbewijs. Eén boeking kan het aantoonbare totaal van meerdere betaalmomenten tonen: leg de specificatie bij bewijs vast en gebruik de laatste betaaldatum. Geen afzonderlijk bank-/betaalmutatieregister of automatische deelbetalingsverdeling toegevoegd.

De btw-editor bewaart bronbestand of externe bewijsverwijzing en gebruikt de bestaande bron-/revisie-/bestandsopslag en controles. Bij positieve betaalde btw moeten voor gecontroleerd opnemen datum/referentie aanwezig zijn, de bronregels ten minste die btw bevatten en het type inkoop/invoer zijn. Een kopie/credit is geen extra betaalde btw. Concepten kunnen onvolledig blijven; onbekend stelsel wordt niet geraden. Betaald bedrag is metadata: verandert geen leverancierssaldo, productkostprijs of btw-aftrek. De bestaande fiscale rubricering/controle blijft nodig voor kwartaalvoorbereiding. Dit is geen fiscale beoordeling of aangifte.

De gedeelde validator bewaakt de nieuwe optionele velden. Oude boekingen en vaste voorbereidingen blijven geldig; geen migratie. CSV bevat zending en betaalde-btw-metadata; JSON/back-up bewaart die in de bestaande boeking. CSV herhaalt deze boekingsmetadata per btw-regel, dus die metadatakolom niet over alle regels optellen.

## Eén leveranciersbron met bijlagen

Een leverancierrecord en zijn via ownerId/invoiceId gekoppelde originele uploads worden voortaan als één btw-bron aangeboden. Bijlagen staan bij die bron. Offertes/proforma’s worden niet via hun uploads als nieuwe factuurbron aangeboden. Bestaande actieve file:-boekingen blijven met dezelfde sleutel/signatuur bewaard en zichtbaar; de leverancierbron verwijst ernaar als alias en de bediening opent die bestaande boeking. Geen automatische omzetting, verwijdering of hernummering. Een oude file:-boeking bij een offerte krijgt een controlepunt, geen stil akkoord. De oude leverancierssignatuur is behouden, zodat alleen een andere bronpresentatie geen historische boeking onnodig veroudert.

Aliassen voorkomen een nieuwe tweede leveranciersboeking en dubbele onverwerkt-melding voor een reeds vertegenwoordigde bron. Dit is geen volledige administratie-/bankreconciliatie. Reeds historisch dubbel vastgelegde bronnen of een onder een andere handmatige bron geboekt document vragen eigen controle; bestaande identiteit-/kopiecontroles blijven gelden.

## AI-documentvoorstel, geen automatische administratie

admin/purchases/document-ai.js hergebruikt de bestaande JSON-parser en leveranciersnormalisatie. Het afgebakende formaat crm-supplier-document versie1 is gebonden aan actief bedrijf en zending. Alleen actuele leveranciersproducten uit deze zending staan in de prompt; geen andere bedrijfsdatabase. Maximaal200.000tekens/100regels, begrensde tekstvelden, expliciete EUR/eenheid/positief geheel aantal/centen/datum. Onbekende datum/totaal wordt niet geraamd. Een documenttotaal blijft apart van de excl.-btw-productregels. Niet-productkosten blijven ongekoppeld en vragen eigen kostentoerekening.

Regelkoppelingen worden opnieuw aan huidige producten/orderreferentie/maten en fysieke aantallen getoetst. Onzekere/verkeerde koppeling wordt leeg met uitleg, zodat de gebruiker kiest. Paar betekent twee fysieke stuks. Geen automatische matching, nieuwe order/zending, betaalregistratie, btw-aftrek, kostenverdeling of productie-/transportstatus. Extra velden zoals payments worden geweigerd. Andere valuta wordt niet stil omgerekend. Een verkeerd bedrijf/zending/ongeldig antwoord laat JSON en bestaande invoer staan.

Invullen blijft in hetzelfde formulier: eigen gewijzigde kopvelden en geselecteerde bestanden blijven behouden. Zodra er inkoopregels staan wordt een nieuw AI-voorstel vóór wijzigingen tegengehouden; bestaande regels niet vervangen of onbedoeld aan een tweede document koppelen. Na het eerste voorstel corrigeer je de velden zelf. AI-waarden donkerpaars met bronuitleg, expliciet opgetelde bedragen lichtpaars; handmatige afwijking verliest de bronmarkering. Prompt en JSON staan alleen in dialooggeheugen en worden niet als privébrowserdraft of document opgeslagen. Alleen Opslaan schrijft het gecontroleerde document.

De oorspronkelijke algemene AI-inkooproute blijft bestaan met zijn eerdere bredere scope; deze nieuwe documenthulp registreert zelf geen betaling en verandert die oudere route niet in een betalingsvrije route. De inkoopregels hebben dezelfde bestaande hoeveelheid-/kostentoerekening. Een offerte die overgaat in een definitieve factuur voor dezelfde stuks bewerk je als bestaand document; het systeem leidt geen automatische vervanging af en telt twee gekoppelde documenten nog als twee hoeveelheden.

## Formulier- en opslagbescherming

De gewone leveranciereditor is uit batch-workspace gehaald naar purchases/supplier-document-form.js. Bestaande handlers/context blijven; regels houden hun bestaande IDs, extra kenmerken en rekentoolkoppeling. Hoofdvenster/centrale CSS hergebruikt, geen losse stylesheet. Gedeelde supplierInvoiceBasis bewaakt de geopende zending en gekoppelde productbasis. De algemene AI-route bewaakt ook de beschikbare ongekoppelde producten. Leveranciersbetalingscorrectie krijgt dezelfde basisguard. Onverwachte relevante wijzigingen blokkeren opslaan met invoer/bijlagen behouden; een fout bij de bestaande state/files-CAS krijgt nu een leesbare melding. Onverwante mail/activiteiten/klantontvangsten zitten niet in de formulierbasis. De bestaande gehele-snapshotvergelijking bij de atomische state/files-opslag blijft behouden.

Nieuwe leveranciersbijlagen maximaal20,15MBperbestand/30MBsamen; grootte/aantal vóór bestandsopslag begrensd. Bestaande bijlagen blijven staan. Btw-bewijs blijft via de bestaande15MB PDF/PNG/JPG-route. Geen upload/render/provideractie uitgevoerd tijdens implementatie. De btw-editor controleert naast de boekingrevisie ook de actuele bron vóór bewaren. Met of zonder bestand blijft alles binnen dezelfde bestaande transactie-/bedrijfstoegang.

## Nog door Philippe te controleren

- Beide bedrijven: juiste zending, leveranciersfactuurbron, afzonderlijk invoerbewijs, bedrag onbekend/0/positief, datum en referentie, bijlage/extern bewijs, concept versus gecontroleerd en correctiehistorie.
- Betaalde btw verandert geen kostprijs/saldo/aftrek vanzelf; kwartalen/CSV/JSON/back-up blijven aansluiten. Datum/referentie ontbreekt, bedrag groter dan bron-btw, kopie/credit of verkeerde zending geeft controlepunt. Bestaande onbekende inrichting behouden.
- Factuur met meerdere uploads verschijnt eenmaal. Oude file:-boekingen behouden/opnieuw openen; offerteuploads geen nieuwe factuurbron; ontbrekend bestand en gewijzigde bron niet stil goedkeuren. Historische dubbelen zelf beoordelen.
- Nieuwe offerte/factuur via AI, JSON-codeblok, verkeerde versie/velden/bedrijf/zending/valuta, centen versus euro, stuk/paar, onbekende prijs/datum/totaal, te veel regels/tekst en niet-passende productmatch.
- Eigen kopinvoer/leegmaken, bestaande regels, tweemaal Voorstel invullen en vooraf gekozen bestand blijven behouden. AI-kleuren en handmatige afwijking, correcte som en onbekend documenttotaal, zelf uploaden, annulerings-/busygedrag en foutfocus.
- Opslaan, weer bewerken met bestaande regel-IDs/rekentoolkoppeling, maximale aantallen/bytes, gedeeltelijke hoeveelheid en dubbele documentreferentie. Relevante wijziging tijdens open formulier en wijziging tussen lezen/bewaren mag geen nieuwere gegevens overschrijven.
- Offerte → factuur voor dezelfde stuks via bestaand document bewerken; bestaande kostentoerekening niet verdubbelen. De oude algemene AI-route en leveranciersbetalingscorrectie blijven bruikbaar. Desktop/mobiel en beide bedrijven.

Alleen handmatige bronlezing/bewerking en bouwadministratie. Geen tests, automatische checks/syntaxchecks/builds, browser-/DOMcontrole, render, echte klantdata-/provider-/mail-/betaalactie, herstart, GitHubpush of livepublicatie. Feedback/gebruikersstatus niet automatisch afgehandeld. Bronreview is geen functioneel/visueel akkoord; batch3 en overige historische restscope blijven open.
