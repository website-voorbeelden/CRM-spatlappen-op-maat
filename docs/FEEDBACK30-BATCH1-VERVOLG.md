# Batch 1 verder uitgewerkt — 30 oktober 2026

Gebruiker vraagt batch1 van de vier nieuwe feedbackbatches. Nieuwste overdracht, drie bijbehorende privéfeedbacktags, bouwstatus en bron eerst vergeleken. Eerdere orderlijst-/verzendformulierfix, overige batches, Kunststofbaas, invoer-btw, templates, gegevens/bestanden en Git-werkkopie/index behouden. Geen herhaling van de eerdere serverstart: bestaande processen laten draaien.

## Feedback bewaren en opnieuw proberen

De CRM-dialoog maakte eerst bij iedere bewaaractie een nieuw ID. Daardoor kon een verloren bewaarrespons bij opnieuw klikken een tweede melding opleveren. Nu één vast ID/tijdstip per concept, ook in de bestaande offlinedraft. V2 houdt hetzelfde meldingsnummer en de aangewezen plek bij heropenen in dezelfde tab. Geen nieuwe permanente browserdraft voor gewone online invoer.

shared/feedback-submission.js vergelijkt uitsluitend oorspronkelijke indiening: ID, tijdstip, soort, opmerking, extra uitleg en context. Objectvolgorde is niet betekenisvol. Latere gebruikersstatus, afhandeling, updatedAt en bouwvoortgang tellen niet als een andere indiening en worden niet teruggezet. Zelfde ID met andere oorspronkelijke tekst/context blijft een conflict; expliciete knop om de huidige tekst als aparte melding te bewaren, geen stille overschrijving. Invoer blijft bij fouten staan. Formulier inert/busy tijdens echte opslag. Herstelvak heeft dezelfde begrensde scrollindeling, footer blijft een eigen rij in de bestaande dialoggrid.

Lokale client leest het ID vóór append en na een onzekere respons opnieuw. Daarmee kan de reeds draaiende oudere helper ook dezelfde reeds opgeslagen melding herkennen; herstart is hiervoor niet nodig. De nieuwe helperbron zelf accepteert eveneens alleen een inhoudelijk gelijke retry. Cloudappend en offline-overzetting gebruiken dezelfde inhoudvergelijking. De offlinewachtrij vergelijkt tevens eigenaar/bedrijf en overschrijft geen bestaande melding. Dit is geen onbeperkte autorisatie: bestaande runtime-/Origin-/bedrijf-/aanmeld-/CAS-/transactiegrenzen blijven gelden. Een andere inhoud of onbereikbare bevestiging is geen succesmelding.

Het mislukken van offlinedraftopruiming na een geslaagde opslag wordt apart genoemd; geen onterechte melding dat de feedback niet is bewaard. Het vaste ID voorkomt een tweede melding bij opnieuw openen van dat concept. Bestaande meldingen niet gemigreerd of afgehandeld.

## Concrete plek en foutcontext

admin/feedback-target.js is gedeelde bron voor controlenaam, doelkeuze en selector in CRM en V2. Geen inputwaarde uitlezen; data-action/IDs en calculator data-index/data-field maken herhaalde productknoppen te onderscheiden. Begrensd ouderpad met IDs/nth-of-type in plaats van alleen een dubbelzinnige knop op het hele scherm.

De laatst gemarkeerde plek blijft staan wanneer de aanwijzer naar de selectiebediening beweegt. Gemarkeerde plek kiezen is een expliciete uitweg voor uitgeschakelde controls die geen click-event geven. Pointerdown voert de onderliggende actie niet uit; native disabled/aria-disabled staat in diagnostics. Aanraken van een disabled control markeert die, daarna via selectiebediening kiezen. V2 heeft ook Annuleren/Escape, bewaart de bestaande invoer/plek in tabgeheugen en negeert een late helperload wanneer het formulier al is gesloten. Geen automatisch aanklikken, query uitvoeren of zakelijke gegevens wijzigen.

De bestaande beperkte vluchtige foutregistratie kan nu een bewust gemelde, opgevangen actie-exceptie meenemen. De verzendformulierhandler meldt zijn fout expliciet naast de normale toast. Niet alle server-/formulierfouten worden automatisch onderschept; geen netwerkbodies, consolelogging, veldinhoud of berekening toegevoegd. V2-feedbackdialoog/selectorbediening tellen niet als zakelijke klikacties. Berekeningshash blijft afgeschermd. Alleen bewaren met expliciete gebruikersactie.

## Macstarter

scripts/local-launch.mjs herkent het bekende eigen helpercommando nauwkeuriger, houdt de twee vaste lokale poorten aan, beschouwt EPERM niet als een dood proces en kan een oud leeg/ongeldig startslot na30seconden herstellen. Een geldig levende eigenaar wordt niet gestopt. Slotinhoud schrijven gebeurt binnen de opruimgrens. De klikbare Macapp maakt de privélogmap aan vóór het omleiden naar een logbestand. Een bezette onbekende poort leidt tot een melding, niet tot het afsluiten van een ander proces. Geen startproef of browseropenactie uitgevoerd in dit vervolg.

## Status en resterende beoordeling

feedback30-batch1 blijft review/local. Aanvullende append-only bronnotitie via scripts/build-task.mjs opgeslagen en teruggelezen; drie bestaande volledige privé-Melding-IDs behouden en alleen hun development-notitie aangevuld. Gebruikersstatus, afhandeling en zakelijke gegevens onveranderd. Nieuwe cacheketen feedback30-batch1, catalogus/documentatie aangevuld zonder generator.

Geen tests/checks/syntaxchecks/builds/browser-/DOM-/visuele QA, serverstart/herstart, provider-/mail-/betaal-/converterproef, Gitwijziging, GitHubupload of livepublicatie. Alleen bronvergelijking/bewerking en bouwadministratie. Philippe controleert zelf beide bedrijven, lokaal/cloud/offline, dubbeleklik/verloren respons/gewijzigde tekst, latere afhandeling/bouwtags, V2-heropenen/annuleren, disabled plek en klein scherm, bestaande orderlijst/verzendformulier en de Macstarter. Gebouwd is geen gebruikersakkoord; batches2–4 en hun open scope zijn niet in dit vervolg veranderd.
