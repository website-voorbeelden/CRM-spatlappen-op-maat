> Historische implementatie, niet meer leidend. Philippe heeft verduidelijkt dat deze brede Exceltoepassing niet zijn bedoeling was. De laag is vervangen door [Exact Online als opmaakreferentie](EXACT-REFERENTIE-20261027.md). Oude bronnotities en IDs blijven historie; geen gebruikersacceptatie van deze Excelrichting claimen.

# Vlakke CRM-weergave in Excel-stijl — 27 oktober 2026

Opdracht van Philippe: minder kaders, meer tabellen en grijze vlakken, de CRM-werkplek in Excel-stijl. Deze keuze vervangt de eerdere ronde kaart-/mailkaderstijl. Alleen lokaal, gedeeld voor Spatlappen op Maat en Maatwerkkunststof.

## Wat gewijzigd is

- Neutrale grijze werkbalken en kopregels, witte cellen, dunne scheidingslijnen, afwisselende rijen en een groen actie-/selectieaccent. Compactere systeemlettertypen en vrijwel rechte hoeken; minder kaartafstand en geen gewone kaartschaduwen.
- Lichte compacte zijbalk, werkbladachtige tabbladen, cijferoverzicht met aaneengesloten kolommen, tabelcellen en rijgewijze order-/klantgegevens. De bestaande statusbetekenis en herkenbare waarschuwingen blijven zichtbaar.
- E-mail: brede gesprekslijst boven het geopende gesprek in plaats van de smalle kaartkolom naast het gesprek. Vaste kolommen Contact/dossier, Onderwerp, Aandacht en Bijgewerkt; bestaande sortering en filters blijven. De hele rij blijft een gewone toetsenbordbedienbare knop, met zichtbare selectie en aria-pressed. Geen nagebootst bewerkbaar spreadsheet of ARIA-grid.
- Berichten: vaste grijze regel met status, Van, Aan en datum; witte leesinhoud eronder. Geen losse afgeronde berichtenkaders. Oudere berichten/quotes behouden hun bestaande uitklapgedrag. Bijlagen worden compacte rijen. Labels een vlakke beheerregel, antwoordformulier grijze veldgroepen.
- Klanten en de takenwerkvoorraad hebben zichtbare kolomkoppen. Taken staan met dossier, vervolgstap, prioriteit/wachttijd en actie in vaste kolommen. De bestaande volgorde, eerste zes taken, Meer en acties blijven leidend.
- Documenten, inkoop, voorraad, formulieren en de andere CRM-overzichten gebruiken dezelfde vlakke centrale opmaak. Bestaande documentindeling/dichtheid en andere voorkeuren niet gereset.
- Voor smallere schermen staan registervelden onder elkaar; mail behoudt bestaande gesprek/terug-bediening en de ordergebonden gesprekskiezer. Tekst blijft leesbaar en velden behouden de bestaande mobiele aanraakmaten. Deze opmaak is niet op toestellen bekeken of bewezen.

## Code en grenzen

Centrale werkplekopmaak in admin/style.css; maildetails volgens de bestaande expliciete uitzondering in admin/mail/mail.css. Presentatie-/kolommarkup in admin/mail-workspace.js, admin/customers/views.js en admin/workspace/task-list.js. Geen nieuwe stylesheet of pakket, externe fontdownload, extra instelling of permanente hoofdknop. Geen appContext-/opslag-/bedrijfsregels aangepast. De nieuwe koppen en roosters gebruiken bestaande data, geen opgeslagen spreadsheetcellen.

Mailtekst, templates, replyheaders, afzenders, ontvangers, verzendtoestemming, dossier-/variant-/betaalgegevens en transacties niet veranderd. Bestaande mailSeed/invoer-/focus-/verversingsguards en data-attributen voor bediening behouden. Geen concept opgeslagen of echte mail-/Gmailactie uitgevoerd. Deze ronde gaat over de CRM-weergave; de losse ontwerpcanvas, rekentool en geproduceerde PDF-/maildocumenten hebben hun eigen afgebakende opmaak en zijn niet als CRM-werkbladcellen verbouwd.

Cacheverwijzingen voor CSS en de gewijzigde importketen bijgewerkt naar excel-style-20261027. De bestaande lokale server levert de bronbestanden; geen herstart/publicatie nodig voor deze statische wijzigingen. Philippe herlaadt zelf nadat eventuele invoer bewaard is.

## Nog door Philippe te beoordelen

Dit is bronwerk, geen visueel bewezen resultaat. Bekijk e-mail op localhost:3010/admin/#mail, daarna aanvragen/orders, klanten, Overzicht, documenten en formulieren. Beoordeel kolombreedte, dichtheid, leesbaarheid en lange onderwerpen/adressen; selecteer een gesprek en controleer antwoord-/filterbehoud, Meer, bijlagen, eerdere berichten, concept/voorbeeld en mobiel. Beide bedrijfsprofielen beoordelen. Bestaande technische open taken rond login-/back-upherstel en gelijktijdigheid blijven open.

Geen tests, checks, syntaxchecks, builds, browser-QA, browser-/DOMuitlezing, schermafbeeldingen of echte klant-/mail-/Gmail-/betaalacties uitgevoerd. Geen GitHubpush/publicatie. Bouwlog via scripts/build-task.mjs met review/local voor deze afgebakende stijlwijziging, bredere consistent-workspace gedeeltelijk open. Bestaande opgeslagen gebruikersstatus/feedbackhistorie niet overschreven.
