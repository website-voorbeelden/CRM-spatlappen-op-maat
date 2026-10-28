> Nieuw28oktober: [Word-documenttemplates aanpassen](DOCUMENTTEMPLATES.md), lokale bron; documentservice-uitrol en eigen controle open.

> Nieuwe ronde28oktober: [twaalf feedbackpunten](FEEDBACK-VERVOLG-20261028.md), brongebouwd; eigen controle open.

> 28 oktober: [Dubbelen herkennen en orders samenvoegen](DUBBELE-ORDERS.md), brongebouwd; gebruikerscontrole open.

Nieuw28oktober: [feedbackbatch3 — Websitegebruik en kleinere schermen](FEEDBACK-BATCH3-20261028.md), lokaal brongebouwd voor Jouw controle. Alle drie nieuwe batches uitgewerkt; eerdere restscope/eigen controle en publicatie blijven apart.

Nieuw28oktober: [feedbackbatch2 — inkoop, betaalde btw en AI-documentvoorstel](FEEDBACK-BATCH2-20261028.md), lokaal brongebouwd voor Jouw controle. Batch3 ook lokaal brongebouwd; niets naar GitHub of live.

Nieuw: [drie feedbackbatches28oktober](DRIE-FEEDBACKBATCHES-20261028.md) —6nieuwe meldingen,44bekende ongewijzigd. [Batch1 lokaal brongebouwd](FEEDBACK-BATCH1-20261028.md), eigen controle open; batch2 ook lokaal brongebouwd, batch3 ook lokaal brongebouwd.

Nieuw28oktober: [duidelijkere tabel- en keuzebediening](TABEL-BEDIENING.md), zebra en rij-/kolommarkering. Alleen lokaal; geen GitHubpush. Nieuwe Word-pakbontemplate volgt van Philippe.

Nieuw28oktober: [Startpagina](STARTPAGINA.md) met grote zoekbalk, recente orders/betalingen en menutegels. [Wachttijd](ORDER-IN-EEN-OOGOPSLAG.md) telt prominent vanaf eerste betaling of aanbetaling. Alleen lokaal; eigen controle/publicatie apart.

Nieuwste ronde: [Rustige werkplek door het CRM](RUSTIGE-WERKPLEK.md) — gedeelde kerngegevens, meer ruimte en details op verzoek. Lokaal; eigen controle/publicatie apart.

Nieuwste dossierkop: [Order in één oogopslag](ORDER-IN-EEN-OOGOPSLAG.md) — betaling, wachttijd en uitvoering/levering; fases via Meer. Bron lokaal, beperkte toegestane Maatweergave bekeken; eigen controle/publicatie apart.

Nieuw27oktober: [opmaakbatches2–4](BATCHES2-4-OPMAAK-20261027.md) en [algemene voorwaarden bij Maatorder/mail](ALGEMENE-VOORWAARDEN-BIJ-ORDER.md). Bron lokaal/review, gebruikerscontrole en publicatie apart.

- [Vier opmaakbatches](VIER-OPMAAKBATCHES-20261027.md) — batches1–4 lokaal brongebouwd voor eigen controle; nieuwste batch2aanvulling bij hervatten na productbewerking.

- [Verder uitgewerkte dossierindeling](DOSSIER-INDELING-20261027.md) — lokale bron, eigen visuele controle open.

# Projectwijzer

Dit is het startpunt voor de documentatie van beide CRM’s. De openbare nieuwe Exact Online-interface is de nieuwste opmaakreferentie; het doel is minder zoeken, minder dubbel invoeren en controle over kosten, marge en vervolgstappen.

## Wat is leidend?

| Vraag | Lees hier |
|---|---|
| Hele chat overdragen, bedoelingen en ideeën terugvinden | [Projectcontext voor volgende bouwers](PROJECTCONTEXT.md) — inclusief preview-pad, laatste correcties en vindkaart van alle werkprocessen |
| Nieuwe wensen van 17 oktober, volgorde en advies | [Taken in het ontwikkelplan](plan/ROADMAP.md), [online/offline, mail en overige afwegingen](plan/ADVIES-2026-10-17.md) |
| Afvinken, opmerkingen en overdracht voor AI | [Bouwtaken gebruiken](BOUWTAKEN.md) — status/log in het CRM, apart van klanttaken |
| Waar werken we naartoe, en wat komt eerst? | [Ontwikkelplan](plan/ROADMAP.md) — catalogus; actuele voortgang en opmerkingen via Beheer → Bouwtaken in het CRM |
| Waar hoort code, en hoe verbeteren we de mappen? | [Architectuur & mappen](plan/ARCHITECTUUR.md) |
| Hoe hoort een scherm te werken? | [UX-afspraken](UX-WERKPLEK.md) |
| Hoe ontwerpen we vervolgstappen en automatiseringen? | [Automatiseringen](plan/AUTOMATISERINGEN.md) |
| Waarom hebben we een keuze gemaakt? | [Besluiten](plan/BESLUITEN.md) |
| Hoe sluiten websitebezoek, aanvragen en CRM-conversie aan? | [Website-metingen](WEBSITE-METINGEN.md) — live Spatlappen, aparte meetdatabase |
| Kan ik tijdens een vlucht offline werken? | [Offline werken](OFFLINE-WERKEN.md) — voorbereide werkplek op normale URL met expliciete synchronisatie |
| Wat is het laatst veranderd en getest? | Bovenaan [OVERDRACHT.md](../OVERDRACHT.md) |
| Wat moet een volgende AI eerst weten? | [AGENTS.md](../AGENTS.md) |

De taakcatalogus heeft één bewerkbare bron: `shared/planning/roadmap.js`. Het CRM leest die rechtstreeks en combineert deze met de opgeslagen voortgang/opmerkingen in de aparte planning-verzameling per bedrijf. `npm run plan` maakt het leesbare Markdown-overzicht opnieuw. Het werklog blijft chronologisch en bestaande documentatie/links blijven geldig.

## Onderwerpen

[Betalingenoverzicht](BETALINGENOVERZICHT.md): ontvangen geld bij klant/order terugvinden, Tikkie-/zoekfilter en readonly Bijwerken; lokaal, eigen controle/publicatie open.

[Vrijdagrapporten](VRIJDAGRAPPORTEN.md): Google, websitegebruik en aanvraagconversie met grafieken en aandachtspunten; lokale rapport-/planningsbasis plus gekozen telefoonmelding en exacte editie-knop, appupdate/gebruikerscontrole/publicatie open.

[Gedeelde CRM-CSS](CRM-CSS.md) en [compact orderoverzicht/fasevoorstel](COMPACT-ORDEROVERZICHT.md): nieuwste onderhouds-/UXafspraak27oktober, lokale bron en eigen controle open.

[Exact Online als opmaakreferentie en maatwerkvergelijking](EXACT-REFERENTIE-20261027.md): nieuwste correctie op de te brede Exceltoepassing, lokale bronopmaak en concrete voorstellen naast bestaande functies. Eigen controle open.

[Standaard factuur- en bevestigingsmails](MAIL-HERZIENING.md#standaard-factuur--en-bevestigingsmails--27-oktober-2026): betaalde/open factuur, 70%/volledige betaling en behoud van eigen templates; lokaal, eigen controle open.

[Historische CRM-Excelrichting](EXCEL-STIJL-20261027.md): vervangen door de Exactreferentie; brede mail-/klant-/takenregisters en vlakke grijze werkbladen; lokaal, eigen controle open.

[Algemene codelezing en gerichte verbeteringen](ALGEMENE-CODELEZING-20261027.md): opslag/transacties, formulierherstel, dagelijkse dossieracties en variantkopieën; bronwerk lokaal, bredere herstel-/login-/conflictscope open.

[Open punten batch3/4 verder gebouwd](OPEN-PUNTEN-VERVOLG-20261027.md): vectorsegmenten, optioneel leren, automatische aanbetalingsfase en Google Maps-routes; lokaal, sleutel/activering en eigen controle apart.

[Batch4 mail en CRM](BATCH4-MAIL-EN-CRM-20261026.md): rustige gesprekslabels, behoud bij verversen/antwoord en concrete open feedbackgrenzen; lokaal, gebruikerscontrole open.

[Batch3 logo, kleur en plaatsing](BATCH3-LOGO-KLEUR-PLAATSING-20261026.md): palet/transparantie, begrensde eilandherkenning, tijdelijke vectorpreview, randveiligheid en voorkeuren; lokale bron en gebruikerscontrole open.

[Batch2 tekst en dagelijkse bediening](BATCH2-TEKST-EN-BEDIENING-20261026.md): fontvoorbeelden, import/beheer, kopiëren, sneltoetsen en scroll/zoom; lokale afronding, gebruikerscontrole open.

[Batch1 ontwerpvarianten](BATCH1-ONTWERPVARIANTEN-20261026.md): meerdere voorstellen en eerdere versies bij één product, definitieve keuze gebonden aan werkelijk opgeslagen maat; lokale afronding en gebruikerscontrole.

[Vier delen feedback26oktober](VIER-DELEN-20261026.md): productvarianten als prioriteit, fonts/editor, kleuren/randen/tijdelijk voorbeeld en rustige mail; lokaal en gebruikercontrole open.

[Spatlap-ontwerptool: bronlezing en vijf gerichte correcties](EDITOR-BRONLEZING-20261026.md): feedbackmatrix, concrete fouten, CRM-opslagroute en resterend werk; lokaal, gebruikercontrole open.

[Klant en mailwerkproces — batch3](KLANT-EN-MAILWERKPROCES.md): contact inline, templates bewerken met invoerbehoud en duidelijke reply-/nieuwkeuze; lokaal, gebruikercontrole open.

[Betalingen en documenten — batch2](BETALINGEN-EN-DOCUMENTEN.md): ontvangstpresets, conflict-/dubbelcontrole, factuurvervolg, selectie en kostenopbouw; lokaal, gebruikercontrole open.

[Vier feedbackbatches van23oktober](VIER-BATCHES-2026-10-23.md): concreet bronresultaat voor mobiel, betaling/documenten, contact/mailwerkproces en editor; eigen controle en online activering apart.

[Mobiele app en betalingsmeldingen](MOBIELE-MELDINGEN.md): installatie, per-apparaat toestemming en servercontrole. Servers eerder actief; correctie27oktober lokaal: handmatige betaalinvoer geen push, providerontvangsten wel. Eigen controle/publicatie van die correctie open.

[Dossierlijsten sorteren](DOSSIER-SORTERING.md): standaard laatst geopend, zichtbare eigen keuze en persoonlijke browseropslag voor beide bedrijven. Lokaal; gebruikercontrole open.

[Directe ontwerpdownloads](ONTWERP-DOWNLOADS.md): opgeslagen klantpreview en vector-PDF zonder editorbediening. Lokaal bronwerk, gebruikercontrole open.

[Orderkaart en bezorgroute](ORDERKAART-EN-BEZORGROUTE.md): standaard productie, filters per levering en zelf een route voorbereiden. Lokaal bronwerk, gebruikercontrole open.

[Factuur-betaalstand](FACTUUR-BETAALSTAND.md): onbetaald/aanbetaling/voldaan op nieuwe facturen en herkenbare historische betaalstand per document. Lokaal bronwerk, gebruikercontrole open.

[Ordervoortgang](ORDERVOORTGANG.md): klikbare stappen, eigen uitvoering en losse bestelling zonder verplichte gezamenlijke inkoop. Alleen lokaal bronwerk; gebruikercontrole open.

[Handtekeningen en AI-uitleg](MAIL-HANDTEKENINGEN.md): meerdere afbeeldingen, varianten per afzender en kopieerbaar HTML-contract. Alleen lokaal bronwerk; Philippe controleert zelf.

[AI via je eigen laptop](LAPTOP-AI.md): actuele hoofdkeuze voor online CRM zonder serverhuur, met browserkoppeling, aan/uit en centrale bevestiging. Alleen bron; onlinepublicatie en eigen gebruikscontrole nog open.

[Maatwerkkunststof-fases en mail-labels](MAAT-FASES-EN-LABELS.md): eigen00–08-menu, gesprekstags en beperkte Gmail-labelreview met aanvullende toestemming. Alleen bron; activering en gebruikerscontrole open.

[Persoonlijke online AI](ONLINE-AI.md): gekozen serveropzet, expliciete backendgoedkeuring, eigen ChatGPT-aanmelding en behoud bij updates. Bron gebouwd; server/activering en gebruikerscontrole nog open.

[Antwoordhulp per mailgesprek](ANTWOORDHULP.md): eigen instructies, geselecteerde context, lokale ChatGPT-generatie en handmatig kopiëren/importeren. Lokaal, gebruikercontrole open.

| Onderdeel | Documentatie |
|---|---|
| Btw per kwartaal, bewijs, credits en redenen | [Btw-voorbereiding](BTW-VOORBEREIDING.md), [orderafwijkingen](BTW-CONTROLE.md) — lokaal, niet getest/gepubliceerd; stelsel nog vaststellen |
| Aanvraag, order, volgende actie | [Verkoopfunnel](VERKOOPFUNNEL.md), [aanvraagherkenning uit mail](AANVRAAGHERKENNING.md) |
| Spatlap-preview en meerdere ontwerpvarianten | [Preview-startpunt en bewaarbeperkingen](PROJECTCONTEXT.md#spatlap-preview-startpunt-voor-een-aparte-chat), [integratiecontract](../spatlap-preview-integratie.md), taak27 in het ontwikkelplan |
| Tijdelijke Spatlappen-verkoopprijshulp | [Prijshulp en opslaggrens](TIJDELIJKE-PRIJSHULP.md) — lokale historische Erturk-indicatie, geen schatting opslaan |
| Calculator, leverancier en offertes | [Kostprijs & offertes](KOSTPRIJS-OFFERTES.md), [V2 bron en grenzen](../tools/costing-v2/SOURCE.md) |
| Zoeken, documentaanpassingen en vervolgstappen | [Werkplekafspraken](UX-WERKPLEK.md), [feedbackstatus](plan/FEEDBACK-SPATLAPPEN.md) |
| Documentvakken, mailwerkplek en schermbediening | [Werkplek](UX-WERKPLEK.md), [Mailwerkplek](MAIL-WERKPLEK.md), [Mobiel & invulhulp](MOBIEL-EN-INVULHULP.md) |
| AI-voorstellen, import en export | [Assistent](ASSISTENT.md), [AI import/export](AI-IMPORT-EXPORT.md), [Herkomst](HERKOMST.md) |
| Maildienst en Gmail | [E-mail](EMAIL.md), [Gmail-toestemming](GMAIL-TOESTEMMING.md) |
| Accounts en toegang | [Accounts & beveiliging](ACCOUNTS-EN-BEVEILIGING.md) |
| Spatlappen live bijwerken, controles en herstel | [Publicatie Spatlappen](PUBLICEREN-SPATLAPPEN.md) |
| Lokaal starten, builds en releasegereedschap | [Project-README](../README.md), [Cloudflare](../CLOUDFLARE.md) |

Oudere beschrijvingen kunnen eerdere keuzes bevatten. De actuele UX-afspraak, architectuurbesluiten en nieuwste overdracht gaan voor bij een tegenstrijdigheid; verwijder historische context niet stilzwijgend.


Actuele mailreparatie: zie EMAIL.md voor online Gmail/SMTP2GO en PUBLICEREN-SPATLAPPEN.md voor de gecontroleerde release. Gelezen gebruikersfeedback: plan/FEEDBACK-SPATLAPPEN.md; het CRM blijft de bron voor actuele status.

Spatlap-editor bronstructuur: admin/designs/editor/README.md. De HTML is alleen ingang en schermstructuur; geen nieuwe grote inline scripts toevoegen.

CRM-featuremappen en live-statecontract: admin/workspace/ARCHITECTURE.md. Nieuwe scherm-/formuliercode bij de betreffende feature, niet opnieuw aan app.js vastplakken.

- [Automatische Gmail ↔ CRM-verkoopfases](GMAIL-FASESYNCHRONISATIE.md): betekenisvolle workflowhandelingen, Gmail-wijzigingen, vaste toestemming en conflicten; lokaal bronwerk, niet geactiveerd/gepubliceerd.

- [Levertijd vanaf aanbetaling](LEVERTIJD-AANBETALING.md): percentage, echte ontvangst, planning en documentvoorstel.
- [Maat-eigen werkproces](MAAT-EIGEN-WERKPROCES.md): drukwerkbediening verwijderd uit Maat, technische bestanden en historie behouden.

- [Websitegegevens & ontvangen contact](WEBSITE-DOSSIER.md): lokale dossiertabs, meetbetekenissen, toestemmingsgrens en nog ontbrekende Maat-aansluiting.

- [Formuliermetadata en spamonderzoek](FORMULIERMAIL-EN-SPAM.md): schone geciteerde formuliermails, aanvraagkoppeling via headers en grenzen van spamdetectie.

- [Overdracht naar de AI van de Maat-website](OVERDRACHT-MAAT-WEBSITE-CRM.md): bekende repository, taakverdeling, headers, bestaande cookiebediening, multipagina-rapport en afspraken voor volgende updates.
