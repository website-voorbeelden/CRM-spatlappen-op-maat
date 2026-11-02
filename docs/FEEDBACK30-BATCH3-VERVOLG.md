# Batch 3 verder uitgewerkt — 30 oktober 2026, lokaal

De zeven vaste privéfeedbacktags uit de vierbatchesronde vergeleken met huidige bron. Eerdere batches, Maatwebsitevoorbereiding, Kunststofbaas/pakbonreferentie, invoer-btw, templates, gegevens, bestanden en Git-werkkopie/index behouden. De oudere 29oktoberbatch3 is een andere ronde.

## Klant en order zoeken

admin/workspace/select-search.js blijft een gedeelde native keuzelijstfilter voor beide bedrijven. Zoeken selecteert niets anders. Een nieuwe klant die via de bestaande inline maakactie wordt toegevoegd, blijft ook na verder zoeken beschikbaar; de oude helper kende alleen de opties van de installatie en kon die nieuwe selectie verliezen. Opties worden nu per waarde bijgehouden, een eigenaar kan de toegestane keuzes expliciet vervangen. Bewust geselecteerde keuze buiten de zoekterm blijft staan met uitleg, nul matches geeft gerichte tekst. Enter in de zoekinvoer verplaatst focus naar de keuzelijst en bewaart het formulier niet; IME-compositie blijft met rust. Status is gekoppeld via aria-describedby. Geen extra dropdownbibliotheek, klantrecords of browseropslag.

## Voorraad bij de juiste klant en uitvoering

Bestaande klantzoeker/filter aangevuld met zoeken op ordernummer/product. Andere klant vervangt de volledige toegestane orderkeuze; oude uitgefilterde opties keren niet terug via de zoekhelper. Doelregel en pasvormbevestiging worden gewist; andere doelregel of voorraadartikel vervalt de bevestiging eveneens. Een doelregel begrenst het invulaantal tot het nog benodigde aantal, zonder de ingevulde hoeveelheid te veranderen. De bestaande voorraadtransactie controleert daarnaast actuele voorraad en behoefte.

Nieuwe pure shared/inventory.inventoryIssueBasis maakt een tijdelijke vergelijkingsbasis van oorspronkelijke klant, archiefkeuze en exacte productregel. De issueactie controleert die bij de bestaande actuele mergeStoredState-transactie, naast bestaande voorraadrevisie en actuele aantallen. Een klant-/productwijziging in een andere tab kan dus geen oude pasvormbevestiging gebruiken. Expliciete klantfilter wordt opnieuw vergeleken met de actuele orderklant. Fout laat invoer staan en vraagt opnieuw actuele uitvoering te controleren. Dit voegt geen stateveld/schema/migratie toe en schrijft geen basis in het voorraadlog. Oude aanroeproutes zonder optionele basis blijven compatibel. De bouwer heeft geen voorraad uitgegeven/ontvangen/gecorrigeerd.

## Inkoopfilter en toetsenbord

Inkoopbestelling/zending blijft onder Meer filters, met alle en nog-niet-gekoppelde keuzes. Opties op naam numeriek/alfabetisch geordend, leverancier en archief zichtbaar. Een geselecteerde bron die niet meer in de inkooplijst staat, krijgt een expliciete tijdelijke optie: filter blijft actief in plaats van onterecht Alle bestellingen te tonen. Bestaande filtering op order.purchaseId, vrije tekst op batchnaam/leverancier en andere klant/product/fase/datum/archiefcriteria behouden. Lookup per zoekprojectie één Map in plaats van per order een lineaire inkoopzoekactie. Na een filterwijziging keert focus terug op dezelfde filter; zoek-/ordergegevens blijven onveranderd.

## Verzendprijs en prijsopbouw

De bestaande actie bij Adres & levering blijft dezelfde gerepareerde shippingPriceForm-route gebruiken. Ook Meer bij Prijsopbouw & btw geeft nu direct Verzendprijs & leverwijze aanpassen, daarnaast Productprijzen aanpassen. Betaling registreren blijft hoofdactie. Formuliertitel, uitleg en opslaanknop passen nu bij levering/betaling/documentmaker, zonder onterecht altijd terugkeer naar een document te beloven. Nulprijsknop heet Geen verzendprijs en kiest geen afhalen/verzenden voor de gebruiker. Bestaande bewuste leverwijze en voorstel bij positieve prijs behouden.

Verzendprijsopslag bewaakt nu ook de oorspronkelijke orderklant, naast bestaande prijs-/leverwijzebasis en CAS; geen oude prijsafspraak op een intussen andere klant. Fout behoudt invoer. Bedragen/opslag/btw/eigen transportkosten niet opnieuw gedefinieerd. Producten/verzending/btw blijven zichtbaar met bedragen en percentages ten opzichte van volledig bekend positief klanttotaal. Bij een bekend nulbedrag geen lege proportiestrook of voorlopige procentclaim; ontbrekende prijzen blijven voorlopig/onbekend. Eigen kosten blijven onder Inkoop & marge.

## Al aanwezig en behouden

Mailwerkplek start al met recent/Nieuwste eerst, met geldige eigen opgeslagen sorteervoorkeur als leidend. Gespreksdatum wordt uit het laatste echte bericht als ISO-tijd opgebouwd; geen wijziging van sorteerlogica of bestaande voorkeur nodig. Dit is bronvergelijking, geen mailbox-/providerproef.

Centrale :root-brontokens zijn al middenpaars #7041a6 met witte tekst voor AI/interpretatie, lichtpaars voor automatische overname. De markeerregels gebruiken deze tokens. Geen nieuwe kleurlaag of CSS toegevoegd; geen contrastmeting/visuele claim. Uitsluitend admin/style.css blijft de CRM-eigenaar.

## Voortgang en grenzen

feedback30-batch3 review/local via aanvullende append-only notitie met scripts/build-task.mjs. Zeven privédevelopmentnotities aangevuld onder hun bestaande volledige Melding-ID; gebruikersstatus, afhandeling, updatedAt en andere meldingen behouden. Mail/kleur op bestaande bron vergeleken; gebruikersbeoordeling is geen automatisch gevolg van code. Nieuwe cacheketen feedback30-batch3; eerdere batch1/2code blijft aanwezig.

Alleen bron-/documentvergelijking en bewerking, privéfeedback- en bouwadministratie. Geen tests/checks/syntaxchecks/builds/generator/browser-/DOM-/visuele QA, voorraad-/document-/provider-/mail-/betaalproef, serverstart/herstart, migratie, Gitwijziging/GitHubupload of publicatie. Geen echte klant-/order-/betaal-/voorraad-/documentgegevens door bouwer gewijzigd. Eigen controle beide bedrijven: nieuwe/bestaande/inline klant, geen matches, selectie buiten zoekterm, Enter/keyboard/IME, voorraadklant/target/pasvorm/aantal en andere tab, gecombineerde filters/focus, verzendprijs positief/nul/bewuste leverwijze/conflict, onbekend/nul/positief betaalbedrag, mailvoorkeur en kleur/mobiel blijft open. Geen foutloosheids- of liveclaim.
