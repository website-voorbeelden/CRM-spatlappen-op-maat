# Projectwijzer

Dit is het startpunt voor de documentatie van beide CRM’s. De documentenpagina is het visuele voorbeeld; het doel is minder zoeken, minder dubbel invoeren en controle over kosten, marge en vervolgstappen.

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
