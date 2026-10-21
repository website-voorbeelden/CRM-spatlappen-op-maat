# Handtekeningen met meerdere afbeeldingen en afzenders

Lokaal bronwerk van 21 oktober 2026 voor beide bedrijven. Geen functionele of visuele tests, builds, providerproeven of publicatie uitgevoerd; Philippe controleert zelf. Deze uitleg beschrijft de gebouwde bediening, geen bewezen aflevering in alle mailprogramma’s.

## Zes afbeeldingen: één indeling, zes bestanden

1. Open Instellingen → Verzenden → Handtekeningen en kies de gewenste handtekening.
2. Maak of laat één HTML-fragment maken met de volledige indeling. Upload het `.html`/`.htm`-bestand, of plak het onder HTML aanpassen. Een los logo is geen volledige indeling.
3. Voor lokale bestanden hoort ieder logo/icoon op een eigen `<img>`-vak, met een duidelijke `alt` zoals `logo.png`, `telefoon.png` of `linkedin.png`. De AI-uitleg geeft het exacte vakformaat. Oude lokale/cid-bronnen worden ook als ontbrekend vak behouden.
4. Kies de zes PNG/JPG/GIF-bestanden tegelijk. Controleer in de lijst welk bestand in welk vak terechtkomt en kies Afbeeldingen plaatsen. De bestandsvolgorde hoeft dus niet de indeling te bepalen. Een bestaande positie houdt breedte/hoogte/opmaak; kies Nieuwe afbeelding onderaan alleen als dat de bedoeling is.
5. Controleer het voorbeeld én de gewone tekstversie. Kies Instellingen opslaan. Bij een fout blijft de huidige invoer behouden; ontbrekende afbeeldingsbestanden moeten vóór opslag worden aangevuld of de lege vakken verwijderd.
6. Een testmail naar je eigen ingestelde testadres is een aparte bewuste klik. Die gebruikt de geselecteerde opgeslagen handtekening en gekozen eigen afzender. Een gewone klantmail blijft eerst via Voorbeeld & versturen lopen.

Bestaande echte HTTPS-bronnen kunnen ook; het CRM downloadt ze niet zelf. De ontvanger kan externe afbeeldingen blokkeren. Ingebedde uploads gaan via dezelfde bestaande MIME-inline/CID-opbouw naar SMTP2GO. Er worden geen Gmail-handtekeningen aangepast.

## Meerdere handtekeningen

De bestaande handtekening blijft Standaardhandtekening. Handtekening toevoegen maakt een extra benoemde variant, bijvoorbeeld Algemeen, Facturen of een persoon. Er zijn maximaal twaalf extra varianten. Iedere variant heeft eigen HTML en gewone tekst.

Onder Handtekening per afzender kies je voor ieder reeds ingesteld Van-adres een variant, de standaard of Geen handtekening. Een extra handtekening maakt geen nieuw afzenderadres aan en verifieert geen domein. Afzenderadressen stel je in dezelfde verzendinstellingen in. Opslaan bewaart het geheel.

In de volledige mailcomposer staan afwijkende keuzes bij Standaardteksten & extra opties. Het korte antwoordvenster heeft een ingeklapt onderdeel Handtekening. Standaard is Automatisch bij dit afzenderadres. Een expliciete keuze geldt voor deze mail en wordt met het concept bewaard. De uiteindelijke preview noemt de werkelijk gekozen handtekening. Het verwijderen van een variant vraagt bevestiging; gekoppelde afzenders vallen na opslaan terug op de standaard. Concepten die expliciet een verwijderde variant noemen moeten opnieuw een keuze krijgen.

Bekende bestaande teksthandtekeningen uit templates worden bij de uiteindelijke opbouw vervangen door de gekozen variant; HTML en tekstfallback komen niet als twee handtekeningen onder elkaar. De mailtekst blijft in het formulier bewerkbaar. Controleer eigen, afwijkende tekstafsluitingen zelf in het voorbeeld.

## Uitleg voor een andere AI

De knop ✦ Uitleg voor AI opent kopieerbare instructies met het toegestane HTML-subset, inline opmaak, afbeeldingsvakken, limieten en de actuele vaknamen. Dit is een kopieerfunctie, zonder AI-aanmelding, verzoek of tokenverbruik door het CRM.

Huidige handtekeningtekst en HTML meenemen staat standaard uit. Aanvinken neemt die inhoud mee als bronmateriaal; ingebedde afbeeldingsdata wordt vervangen door vakken om grote base64-blokken te vermijden. Lees de inhoud voordat je haar naar een andere AI plakt. SMTP2GO-sleutels, OAuth-gegevens en overige verbindingsinstellingen worden niet opgenomen. Losse afbeeldingen/screenshot/contactgegevens geef je zo nodig zelf aan die AI. De AI moet ontbrekende relevante gegevens eerst vragen en geen bedrijfsgegevens of URLs verzinnen.

Deze gedeelde kopieerhulp kan bij volgende functies worden hergebruikt. Zij is nu op de handtekeningeditor toegepast, niet automatisch bij elk CRM-veld.

## Grenzen en opslag

- Per handtekening: gewone tekst maximaal 2.000 tekens, HTML maximaal 500.000 tekens inclusief ingebedde afbeeldingen, maximaal twaalf afbeeldingsvakken.
- Per geüpload PNG/JPG/GIF-bestand maximaal 200 kB. Base64 neemt meer ruimte in dan het bestand: zes bestanden van elk 200 kB passen samen niet. Gebruik kleine logo’s/iconen, bijvoorbeeld 10–30 kB per stuk wanneer passend.
- De volledige bewaarset met standaard- en extra handtekeningen maximaal 800 kB JSON-inhoud; dit houdt ook de versleutelde cloudopslag begrensd. Hergebruik één variant voor meerdere afzenders waar passend.
- De bestaande beperkte HTML-sanitizer en iframepreview blijven leidend; scripts/actieve inhoud/unsupported opmaak worden niet ongefilterd doorgegeven.
- Varianten en adreskoppelingen staan bij de privéverzendconfiguratie per bedrijf, lokaal of in de bestaande versleutelde cloudintegratie. Niet in CRM-klantrecords of browserdrafts. Oude configuraties krijgen zonder migratie de standaardhandtekening als fallback.
- Een versie op de handtekeninginstellingen voorkomt overschrijven vanuit een verouderd formulier. De preview stuurt de geselecteerde ID en inhoud mee; de backend weigert verzending als die selectie, adreskoppeling of inhoud inmiddels is gewijzigd. Geen provideractie vóór de bestaande expliciete verzendbevestiging.
- Het instellingenformulier wacht op de bestaande configuratie. Bij ophaalfouten kan het opnieuw ophalen; er wordt niet met lege nog onbekende instellingen opgeslagen.

## Vindplaatsen en vervolg

`shared/mail-signature-profiles.js`: catalogus, afzenderkoppeling, selectie en gezamenlijke opbouw. `shared/mail-signature.js`: bestaande HTML-sanitizer en inlineverwerking. `shared/signature-ai-help.js`: kopieercontract. `admin/workspace/ai-help.js`: generiek kopieervenster. `admin/mail/signature-editor.js`: profielen, upload, vakken en instellingen. `admin/mail/signature-choice.js`: dezelfde mailkeuze in beide composers. `shared/mail-service.js`: servervalidatie en SMTP2GO-route. `cloudflare/mail.js`: begrensde configuratieaanvraag, bestaande sessie-/herkomstcontrole behouden.

Eigen controle door Philippe en een gerichte online release blijven open. Geen echte mails verstuurd, privéconfiguraties geopend of runtime-Bouwtaken afgevinkt tijdens bouwen. Bestaand ander lokaal werk niet als onderdeel hiervan publiceren.
