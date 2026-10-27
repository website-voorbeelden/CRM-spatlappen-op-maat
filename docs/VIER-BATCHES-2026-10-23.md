# Beide CRM’s gepubliceerd — 24 oktober 2026 (Makassar)

Op expliciete gebruikersopdracht upload zodat online bruikbaar: release crm-batches-20261023 naar dezelfde Pages-projecten/productiebranch main. Spatlappen https://3bb30366.spatlappen-crm.pages.dev en Maat https://cc4f7305.maatwerkkunststof-crm.pages.dev; bestaande domeinen crm.spatlappenopmaat.nl en crm.maatwerkkunststof.nl. Wrangler meldt voor beide Deployment complete, Functions gebundeld en assets geüpload. Geen HTTP-/browser-/gebruikstest uitgevoerd, dus geen functionele livegarantie. Laatste bron van huidige CRM inclusief batches1–4 meegeleverd; geen wijziging aan afzonderlijke bedrijfswebsites of Render.

Verse remoteproductieconfig beide bedrijven vóór upload gedownload en bestaande bedrijf/publicURL/DB/R2 tegen bekende doelen getoetst als publicatievoorbereiding; alle bestaande vars/extraanalyticsbinding bewaard, alleen CRM_RELEASE gewijzigd. EU-R2binding behouden, bestaande secrets/login/providerconfig niet vervangen of geopend. D1 Time Travel-herstelpunten vóór upload vastgelegd, geen import/reset/restore/migratie en geen echte klant-/document-/mail-/betaalwijzigingen uitgevoerd. Push blijft niet geactiveerd: geen keys/Worker/cron/migratie/toestelregistratie uitgevoerd. Bestaande providerfeatures blijven hun expliciete gebruikersacties vereisen.

Noodzakelijke publieke verpakkingsbuild en Functionscompile voor upload uitgevoerd, geen tests/syntaxcheckrondes/browserQA/export-/productieproeven. Publicatie is geen gebruikerscontrole. Geen feedbackresolve, geen GitHubpush of Renderrelease. Vorige Spatdeployment2b848413-2aa0-4178-8d69-150ac4a3ad71 en Maat8cd42226-173c-44ae-a78f-d347910212e7 behouden als codeherstelpunten; terugzetten code is geen databaseherstel. Artefacten/bronhashmanifest/pakketten/resultaat onder work/batch4-release-20261023; herstelinfo onder private-backups niet delen/publiceren. Volledige bron blijft hier bewaard; buildbare private hoofdmap niet als site uploaden.

# Vier bouwbatches — 23 oktober 2026

Opdracht: zorgvuldig doorbouwen in vier opeenvolgende batches. Dit document beschrijft het lokale bronresultaat. Geen tests, syntaxchecks, builds, documentrenders of browser-QA uitgevoerd: Philippe test zelf volgens de afspraak van18oktober. Bronwerk, gebruikerscontrole en online activering zijn afzonderlijke stappen. Geen GitHubpush/publicatie, echte provideracties of wijzigingen aan klantgegevens gedaan. De35 exportmeldingen blijven in de privéfeedback; geen resolve uitgevoerd.

## 1. Mobiel en betalingsmeldingen

- Eén viewporthelper voor CRM-modals én feedback in de ontwerptool: actief veld binnen het eigen venster, rekening houden met schermtoetsenbord en viewportoffset. Bestaande menunavigatie en invoerbescherming behouden.
- Eerste succesvolle toestelregistratie wacht op een stille ontvangstbaseline. Zo valt een betaling na het inschakelen niet alsnog in de eerste cronbaseline.
- Bezorgwachtrij selecteert alleen de huidige geldige apparaten; oude sessies blokkeren de eerste wachtende meldingen niet. Instellingen toont een algemene bezorgfoutstatus zonder klantinhoud.
- Bestaande bron voor PWA, sessiegebonden opt-in, dedup/outbox en optionele begrensde Tikkiecontrole blijft leidend. Geen automatische factuur, mail of productievrijgave.

**Vervolg op opdracht “doe batch1”:** drie zichtbare inrichtingsstappen, herstelflow bij opnieuw inloggen, server-eerst uitschakelen met herhaalbare foutafhandeling, heartbeatwaarschuwing, actuele sessiecontrole vlak vóór push en mobiele editorfeedbackopmaak. Zie MOBIELE-MELDINGEN.md. Geen tests of activering uitgevoerd.

**Bekend uit gebruikersantwoord:** https://crm.spatlappenopmaat.nl/admin/ en https://crm.maatwerkkunststof.nl/admin/, iPhone. Niet extern gecontroleerd. **Open:** bijbehorende Pages/DB-doelen verifiëren, gecontroleerde release, sleutels/Worker/configuratie/migratie en toesteltoestemming. Meldingen zijn nog niet online actief. Andere meldingstypen blijven apart werk. Zie MOBIELE-MELDINGEN.md.

## 2. Betalingen en documenten

- Ontvangstformulier stelt bij een bekende onbetaalde order de afgesproken aanbetaling voor, standaard50%. Bedrag en percentage incl. btw, paars als rekensuggestie, vrij aanpasbaar. Opslaan gebruikt de actuele transactionele staat; geen vroege mutatie van de centrale schermstaat. Dubbelen met dezelfde ontvangst-ID worden geweigerd.
- Productievrijgave is bij een gedeeltelijke betaling ook zichtbaar en op Betalingen bereikbaar. De bestaande prijs-/ontwerp-/specificatievoorwaarden en aparte gebruikersbevestiging blijven. Een ontvangst bevestigt geen werkelijke productiestart.
- Documentpreview begint met een hele pagina passend in het venster, met zoom en opnieuw passend maken; download en paginabediening behouden.
- Bij ontbrekende verzendprijs staat leverwijze in hetzelfde invulvenster. Positieve prijs met nog onbekende leverwijze geeft paars voorstel Verzenden; bestaande afspraken en eigen keuzes blijven behouden. De gebruiker bevestigt beide samen en keert terug naar het document met invoer behouden. €0 blijft expliciet gratis; onbekend wordt niet globaal naar nul gemigreerd.
- Eerdere bron bevat al betaalcorrecties/verwijderen met reden en historie, komma/puntinvoer, factuurontvangsten kiezen (nu standaard geselecteerd) en benoemde kosten. Die zijn niet opnieuw gebouwd of getest.

**Vervolg op opdracht “doe batch2”:** betaalpresets en live saldo, dubbele/overmatige ontvangst met extra bevestiging, prijs-/betaalbasis opnieuw controleren en ophalen met invoerbehoud; rustiger verwijderen/corrigeren; factuurmailknop aangesloten en ook Maat via eigen generator; factuurontvangstteller/alles/niets; ingeklapte kostenbalken en directe kosten per product; previewretry. Details BETALINGEN-EN-DOCUMENTEN.md.

**Open:** eigen formulier-/toestelcontrole, financiële controle en online levering. Exportmeldingen over volledig automatische vrijgave zijn hiermee niet als uitgevoerd afgehandeld: geld, ontwerpgoedkeuring en daadwerkelijke productie blijven verschillende feiten.

## 3. Klant, dossier en mailwerkproces

- Contactgegevens en factuurmail zijn direct vanuit de order aanpasbaar in een klein venster. Alleen de gekozen contactvelden veranderen; klantkoppeling en gelijktijdige wijzigingen worden opnieuw gecontroleerd. Geen omweg via een andere klanttab.
- Documenten → Meer → Al buiten CRM verstuurd: expliciete datum plus bevestiging, bij het concrete offerte-/bevestiging-/factuur-PDF. Documentkaart toont zelf geregistreerde verzending; PDF en Word blijven gebundeld. Alleen het nieuwste document van die soort kan de dossiermijlpaal aanvullen. Registratie heeft een begrensd, gevalideerd gegevensmodel. Geen echte mail, aflever-/leesbewijs, wijziging van oude PDF of fysieke productie.
- Sidebarhover/focus heeft expliciete achtergrond én tekstkleur.
- Eerdere bron bevat aanvraagdatum zonder akkoordplicht, korte AI-productnaamregels, aparte factuurmail, bewerkbare mailtemplates, gesprekkeuze voor reply, klantnummerinstellingen, klantnaam voor ordercode, producthoofdafbeelding/verwijderen en verborgen lege afbeeldingvakken. Bestaande bron is geen bewijs dat de oude online versie deze al levert.

**Vervolg op opdracht “doe batch3”:** gedeelde standaardcontacteditor vanuit order en boven de mail met veldgerichte merge; expliciet klant-/factuuradres gebruiken; compacte templates boven de berichttekst, bewerken/bewaren in inlinevenster met werkelijke ouder-DOM behouden en naamconflict openhouden; replycontext/keuze consistent bij ontvanger-/onderwerpwijziging en templatebeheer; externe PDFregistratie klantrelatie en gelijke-datumvolgorde verbeterd. Zie KLANT-EN-MAILWERKPROCES.md.

**Open:** gebruikscontrole van reply/templateflow, online versieverschillen en eerdere bredere mail-/intakestappen. Een gemaakt document of ongebruikte betaallink bewijst geen verzonden betaalverzoek. Geen automatische externe mails/Gmailmutaties geactiveerd.

## 4. Spatlappen-ontwerptool

- Selectie opent het bijbehorende logo-/tekstpaneel. Nieuwe tekst neemt na bestaande tekst minder ruimte in; tekstvak vult de zijbalk en groeit mee.
- Enter maakt meerdere regels; bewerken gebeurt direct met undo per bewerksessie. Meerregelige opmaak loopt mee in canvas-PNG, vectorpaden, bewaren en overdracht.
- Horizontaal én verticaal tussen nabije randen centreren. Spiegelen en90° draaien rond het eigen midden, inclusief meerdere geselecteerde objecten; undo en opgeslagen transformaties blijven meegegeven. Vectoronderdeelbewerking eerst afronden.
- Tekstopmaak overnemen via de hoogtereferentie: font, grootte, gewicht, afstand en kleur; tekstinhoud/positie blijven behouden. Gewone hoogtevergelijking blijft apart.
- Dubbelklik op een SVG opent onderdeelbewerking en kiest het geraakte stuk; schalen met±10% naast bestaande kleur-/verplaats-/verwijderacties. Alleen echte bewerkbare SVG-geometrie, geen verzonnen vectorisatie van rasterbeelden.
- Fontvoorbeeld boven de keuze, langer tekstvoorbeeld en uitklapbare vergelijking met hover/focus vóór kiezen. Metal Mania, Rye en Germania One als lokale echte fonts met licentie/provenance; vaste echte dikte, geen kunstmatige vet-export.
- Gesloten hulp voor eigen lettertype met AI-uitleg: echt font naar zelfstandig SVG-contouren. Dit is geen willekeurige TTF/JSON-fontimport en contourtekst is later geen gewone bewerkbare tekst. Bestaande vectorcontrole weigert fallbackfonts/raster/effecten.
- Bestaande klassieke scriptvolgorde en CRM-opslaggrenzen behouden. Cacheversies bijgewerkt voor gewijzigde ingangen en helpers.

**Open:** Philippe controleert selectie, mobiel, echte logo-opbouw, undo/bewaren, PNG en vector-PDF. Een volledige fontbeheer-/TTFimportfunctie is niet gebouwd. Geen export- of productieproef uitgevoerd.

## Resterende grenzen

Geen enkele meerledige feedbackmelding is stil afgevinkt. Privé-uitvoerplan koppelt iedere export-ID aan bronresultaat of open vervolgwerk. Websitecollector, fiscale inrichting, WhatsApp, prijs-/routekostenraming, meerdere ontwerpvarianten en de volledige bredere roadmap zijn geen verborgen extra release binnen deze vier batches. De gebruiker kan die apart laten oppakken. Bestaand werk en historie blijven behouden.

## Batch4 vervolg — 23 oktober 2026

Gedraaide logo’s: vrij breedte/hoogte schalen volgt zichtbare schermassen; de lokale w/h-as wordt bij90/270° verwisseld. Links/boven/randuitlijning en passend maken gebruiken gedraaide kaderafmetingen, ratio blijft lokaal. Meerregelige en gedraaide tekst wordt verticaal geplaatst met het bestaande gemeten kader, niet alleen de fontgrootte. Geen nieuwe geometrie-export of opslagvelden.

Live tekstbewerking: een andere historyactie en undo/redo beëindigen de tekstgroep; verder typen begint opnieuw. Zijbalk schrijft dezelfde textarea-inhoud niet onnodig terug en past de hoogte ook bij herhaalde selecties aan. Fontgalerij houdt een tijdelijk hover-/focusvoorbeeld, inclusief één echte dikte, ook als document.fonts.ready later afloopt. Vertrek/keuze/sluiten herstelt het gekozen font; hover wijzigt geen artwork.

Klassieke laadvolgorde en bestaande vector-/rasterblokkades behouden; cache batch4-editor-20261023. Geen tests, syntaxchecks, browser-QA of export-/productieproef; Philippe controleert zelf. Publicatie apart vastgelegd.
