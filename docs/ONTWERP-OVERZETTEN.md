# Ontwerp overzetten — lokaal, versie 1

Onderaan de ontwerptool staat een gesloten onderdeel Ontwerp overzetten & veiligheidskopie. Het venster biedt een tekstveld, kopiëren, huidige ontwerp downloaden als JSON, bestand laden en expliciet openen als nieuwe kopie. Logo’s zitten in het bestand; een los laptopbestandspad is geen overdraagbaar ontwerp. Geen CRM-bewaaractie nodig. De herstelknop Ontwerpkopie in de actiemelding staat buiten het tijdens bewaren geblokkeerde werkgebied.

Ververs een bestaande tab met onbewaard werk niet om deze code te krijgen. Gebruik daar eerst de bestaande Deelbare kopie openen. Die opent het aanwezige ontwerp via de URL in een nieuwe tab zonder Bewaar. Bij erg grote ontwerpen kan een URL tegen browserlimieten lopen; de nieuwe JSON-download vermijdt die URL-route zodra de nieuwe code geladen is. Geen herstel uit een reeds gesloten/ververste onbewaarde tab beloofd.

## Klembord

⌘/Ctrl+C en X schrijven geselecteerde complete logo’s/teksten naar het systeemklembord. ⌘/Ctrl+V voegt ze met nieuwe IDs en een kleine positie-offset toe in een andere ontwerptab met deze code. Normale tekstvelden en tekstselectie behouden hun eigen copy/paste. Afbeeldingen plakken blijft beschikbaar. Volledige ontwerptekst op het klembord opent eerst het importvenster; vervangen gebeurt uitsluitend via de expliciete knop. Dit is nog geen import voor andere soorten CRM-tools.

## Contract voor latere CRM-koppeling

`shared/design-transfer.js` is de zuivere codec; `admin/designs/transfer.js` bestuurt alleen browserbediening. Volledig document: `{format:"spatlap-preview-design", version:1, name, context, design:{flap,holes,logos,texts,ui}}`. Selectie: `{format:"spatlap-preview-selection",version:1,items:[{type,data}]}`. Fysieke maten in cm, positiefracties conform bestaande ontwerptool. Embedded raster PNG/JPEG/WebP; SVG door bestaande sanitizer. Maximale tekstlengte 24 Mi tekens, invoerbestanden maximaal24MiB en maximaal400onderdelen. Onbekende versies worden geweigerd; ongeldige invoer wordt niet toegepast. Alleen bekende velden gaan mee.

`portableDesign` wist alle context-IDs. Later kan het CRM de gevalideerde kopie na expliciete klant/productkeuze via bestaande opslag/conflictcontroles bewaren met een nieuw ontwerp-ID. Geen bestaand ontwerp automatisch overschrijven op grond van een geïmporteerd ID. Deze ronde wijzigt geen CRM-opslagcode. Productgebonden tabs weigeren volledige import en verwijzen naar een losse tab. Een losse import maakt context en lokale bewaar-ID leeg en is ongedaan te maken voor de artworkinhoud. Naam/koppeling/URL zijn geen onderdeel van artwork-undo.

Kopiëren en downloaden blijven beschikbaar tijdens vastgelopen bewaren/laden. Import wordt dan geblokkeerd om races te voorkomen. Er is geen onbewezen succesmelding of geforceerde herhaling van een onzekere CRM-mutatie. De gemelde opslagfout zelf is nog niet gediagnosticeerd. Geen eigen tests, builds of browser-QA uitgevoerd, volgens gebruikersafspraak.
