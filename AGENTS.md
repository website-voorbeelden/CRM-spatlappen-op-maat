# Begin hier — gedeelde CRM-basis

Deze map bevat één CRM met twee bedrijfsprofielen. De instructies van de gebruiker gaan voor. Werk standaard lokaal; publiceren, echte mails versturen en Gmail wijzigen vereisen een expliciete opdracht. Behoud bestaande wijzigingen en gegevens.

## Leesroute

1. Lees het nieuwste gedeelte bovenaan `OVERDRACHT.md` voor actuele wijzigingen en testresultaten. Dit is een historisch werklog, geen backlog.
2. Bij werk aan de Spatlappen-ontwerptool lees eerst `admin/designs/editor/README.md` voor bestandsverdeling/laadvolgorde en lees ook `docs/SPATLAP-ONTWERP-UX.md` en Bouwtaken35–41. Lees `docs/UX-WERKPLEK.md`: Documenten is het UX-voorbeeld; één hoofdactie, overige keuzes bij Meer, invoer behouden en ontbrekende gegevens dichtbij laten aanvullen.
3. Lees `docs/PROJECTCONTEXT.md` voor de samengevoegde gebruikerswensen, laatste correcties, preview-startpunt en verwijzingen naar alle werkprocessen. Lees daarna `docs/README.md` en `docs/plan/ARCHITECTUUR.md` voor vindplaatsen en verantwoordelijkheden.
4. Lees `docs/plan/ROADMAP.md` voor de taakcatalogus (bron `shared/planning/roadmap.js`). Open ook Beheer → Bouwtaken (`#development`) in het juiste CRM voor actuele voortgang en opmerkingen, of lees een actuele bouwlogexport. Zie `docs/BOUWTAKEN.md`. Een roadmap-item is geen automatische opdracht om alles te bouwen.


## Nieuwste gebruikersafspraak — 18 oktober 2026

Philippe test zelf. Vanaf deze afspraak geen browser-QA, automatische tests, check- of buildrondes uitvoeren tenzij hij daar opnieuw expliciet om vraagt. Wijzigingen wel zorgvuldig doorvoeren en documenteren; vertel wat gewijzigd is zonder testclaims. Deze expliciete gebruikersafspraak gaat voor de oudere controle-instructies hieronder.

## Btw-afspraken — 19 oktober 2026

Spatlappen en Maatwerkkunststof hebben aparte btw-administraties. Het gebruikte stelsel weet Philippe nog niet: laat dit instelbaar op Nog vaststellen, niet raden of live invullen. Voor de btw-berekeningen is opnieuw expliciet bevestigd: geen automatische tests uitvoeren, Philippe test zelf. Fictieve testfixtures mogen klaarstaan maar zijn niet uitgevoerd. Lees docs/BTW-VOORBEREIDING.md vóór uitbreiding; voorbereiden is niet indienen.

## Bouwlog via code — expliciete gebruikersafspraak 21 oktober 2026

Geen bouwtaken meer handmatig invullen via browserformulieren. Noteer bouwwerk via `node scripts/build-task.mjs add /pad/naar/bouwnotitie.json`; contract in docs/BOUWTAKEN.md. Het append-only bronlog shared/planning/source-updates.js wordt bij beide bedrijven in de UI getoond en reist met de code mee. Bestaande opgeslagen gebruikersstatus en opmerkingen blijven leidend; bronupdates wijzigen geen browser-/cloudrecords. Deze afspraak vervangt oudere instructies hieronder om het bouwlog via de UI bij te werken. Lees bestaande bronupdates en beschikbare overdracht, laat gedeeltelijk werk open en vermeld ontbrekende gebruikerscontrole eerlijk.

## Bouwafspraken

- Bouwtakenafspraak 21 oktober: begin bij Te bouwen vóór nieuwe uitbreidingen. Gebouwd maar nog door Philippe te controleren hoort bij Jouw controle; volledig afgeronde taken verdwijnen uit de werkvoorraad naar Afgerond. Geen taken/IDs/historie wissen om de lijst korter te maken. Werk catalogus én actueel bouwlog bij, behoud bestaande gebruikersstatus en laat gedeeltelijk werk open met concrete resterende scope. Afgerond bouwen, eigen gebruikerscontrole en publicatie zijn afzonderlijke zaken.

- Gemeenschappelijke code voor beide bedrijven. Gebruik `shared/companies.js` voor bedrijfsverschillen; maak geen tweede CRM-kopie.
- UX-voorkeur gebruiker: less is more voor de hele tool. Alleen taakgerichte hoofdacties zichtbaar; overige functies in Meer/Extra opties of gesloten onderdelen. Calculator: rechthoek zonder gaten als nieuw stuk; aantal/materiaal/dikte/maten en leverancierstarieven/plaatmaten direct zichtbaar. Vierkant/Rond/Mangat en gaten bij Extra opties, nesting onderaan. Ronde gaten via boutcirkel, X/Y alleen als extra. Lees de laatste correctie in docs/UX-WERKPLEK.md vóór verdere UI-uitbreiding.
- Lees voor wijzigingen in app.js eerst `admin/workspace/ARCHITECTURE.md`: featurefactories gebruiken dezelfde actuele centrale status en transacties. Nieuwe scherm-/formuliercode hoort bij de betreffende feature.
- CRM-opmaak staat centraal in admin/style.css. Gebruik de bestaande kleurvariabelen en tab-/knopklassen; definieer tekstkleur én achtergrond voor hover/focus/selected. Donkere tekst op lichte vlakken, lichte tekst alleen op expliciet donkere vlakken. Geen nieuwe losse featurestylesheets of inline presentatieregels in de CRM-shell. Losse ontwerptool, calculator en mail-HTML hebben hun eigen afgebakende opmaak.
- De CRM-shell installeert installFormEditProtection voor alle formulieren. Gebruik busy/inert tijdens echte async acties, behoud invoer bij fouten en roep markFormClean pas na bevestigde opslag aan (of sluit/vervang het formulier). Bewaar geen credentials/veldwaarden als browserdraft om refresh te voorkomen.
- Nieuwe werkplekcode hoort bij `admin/workspace/`. Nieuwe onderdelen krijgen een eigen map onder `admin/` zodra er echt een onderdeel wordt uitgehaald. Laat bestaande imports/URL’s intact totdat hun vervanging gecontroleerd is.
- Houd pure bedrijfsregels in `shared/`, browserbediening in `admin/`, diensten/credentials op de server. Laat de bestaande opslagfacade en transacties leidend. Planinformatie is geen klant- of orderdata.
- `.local/` bevat privéconfiguratie en lokale runtimes. Niet meenemen in documentatie, tests, publicatie of opschoonacties. Verwijder geen browserdatabase, bestanden of werkversies om een test te laten slagen.
- `tools/costing/` is de beschermde V1. Uitgebreidere vorm/CAD-functionaliteit staat in `tools/costing-v2/`. V2 is lokaal en wordt nog niet door de gewone bedrijfsbuild geleverd. Verander dat alleen als onderdeel van een expliciet gecontroleerde releasewijziging.
- Bewaar bestaande record-ID’s, bedrijfsafscheiding, eenheden en versie-/conflictcontroles. Een layoutwijziging mag geen financiële gegevens, documentinhoud of dossierstatus wijzigen.
- Geen verzonnen materiaalprijzen, leveranciersclaims of actieve koppelingen. Ontbrekend is onbekend, niet nul. Een automation-plan activeert niets; echte mail/Gmail-acties blijven expliciet.

## Afronden

- Voer gerichte tests uit voor gewijzigd gedrag en `npm run check` voor gedeelde code; die controleert ook beide bedrijfsbuilds en gebruikt fictieve dienstfixtures. Geen echte providers of klantmutaties in QA.
- Controleer gewijzigde schermen in eigen browsertabs voor beide bedrijven en mobiel waar relevant. Herlaad geen tab met invoer van de gebruiker.
- Werk de relevante UX-/architectuurafspraak bij. Wijzig planning in `shared/planning/roadmap.js`, genereer `docs/plan/ROADMAP.md` met `npm run plan` en leg relevante beslissingen vast in `docs/plan/BESLUITEN.md`.
- Werk de betreffende CRM-bouwtaak bij onder je eigen bouwernaam: resultaat, werkelijk uitgevoerde tests, beperkingen en resterend werk. Lees het opgeslagen resultaat terug. Status en publicatie zijn apart; markeer alleen afgerond als vereist werk klaar is. Is het juiste CRM niet toegankelijk, meld dat en geef een overdrachtsnotitie; beweer niet dat de taak is afgevinkt.
- Zet de concrete wijziging, grenzen en werkelijk uitgevoerde tests bovenaan `OVERDRACHT.md`. Verwar een geslaagde build niet met een publicatie of een fysieke productieproef.

## Mailherziening — 19 oktober 2026

Gebruiker heeft voor mail expliciet een eigen afgebakend stylesheet toegestaan: admin/mail/mail.css, naast de centrale CRMstijl. Geen stijlen buiten mail/attachment-dialog laten lekken. Eerst mail herstellen, AI-assistent vindbaar maken staat daarna in roadmap. Lees docs/MAIL-HERZIENING.md. Geen echte mails/Gmailmutaties en geen tests/build/browser-QA uitvoeren; gebruiker test zelf. Gmail blijft readonly, SMTP2GO verzendt na expliciete gebruikersklik. Aanvraagformuliermelding aan beheerder bestaat doorgaans niet in de mailbox van de klant; correcte replyheaders zijn geen garantie van een bestaande klantthread.
