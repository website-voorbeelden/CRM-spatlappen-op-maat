# Lokaal doorwerken tijdens de ontwikkeling — 17 oktober 2026

We blijven lokaal werken totdat Philippe tevreden is en expliciet om publicatie vraagt. Spatlappen: http://localhost:3010/admin/ ; Maatwerkkunststof: http://localhost:3011/admin/ . Gebruik dezelfde browser en poorten om de bestaande browseropslag terug te vinden. De lokale servers moeten op deze Mac blijven draaien; na herstart zo nodig `npm run dev:both` vanuit de projectmap. Geen wifi nodig voor de lokale pagina’s en browseropslag. Gmail, externe AI, Google-rapporten en andere externe diensten hebben wel internet nodig. Lokale documenten-/assistentdiensten kunnen daarnaast hun eigen lokale runtime nodig hebben.

De gewone lokale versie bewaart CRM-gegevens in deze browser. Dit is geen automatische synchronisatie met het live CRM. Maak regelmatig een back-up via het bestaande CRM; wis browsergegevens niet. Het lokale bedrijf, de online omgeving en de voorbereide offline kopie zijn afzonderlijke opslagplekken. De knoppen voor de voorbereide cloud-offlinekopie verschijnen alleen bij cloudopslag, niet standaard in deze lokale browseropslagversie.

De hieronder beschreven voorbereide offline routes horen bij de cloudversie. Volledige offline bewerking met dezelfde CRM-opmaak, bestanden en preview blijft taak20; de huidige reviewmodus ondersteunt rondkijken en feedback, de compacte werkplek ondersteunt beperkte dossierinvoer.

---

# Offline rondkijken en feedback bewaren

De nieuwe **Offline-modus** gebruikt de gewone CRM-opmaak op dezelfde URL. Je kunt klaargezette klant- en ordergegevens bekijken, zoeken en feedback bewaren. Dossiers zijn in deze modus alleen-lezen. Mail, AI-diensten, betalingen, bestanden, documentvoorbeelden en de ontwerptool zijn niet offline meegenomen.

## Voor vertrek

1. Open je gewone online Spatlappen-CRM op https://spatlappen-crm.pages.dev/admin/ en log in. Herlaad na de update eenmaal als je geen knop ziet.
2. Klik onderaan de zijbalk **Offline-modus**. Wacht tot dezelfde CRM-pagina opent met de paarse melding **Offline-modus** en een eindtijd. Op mobiel staat de knop in Menu. Gebruik je eigen apparaat, dezelfde gewone browser en hetzelfde domein.
3. Zet even de verbinding uit en herlaad om te controleren. Een tab die alleen online openstaat is niet genoeg.

## Tijdens de reis

Klik **Feedback melden**, kies een plek of **Algemene melding**, schrijf je opmerking en klik **Melding bewaren**. De melding staat dan bij Feedback met **Nog niet online**. Tijdens typen wordt ook een concept bewaard; wacht op **Concept op dit apparaat bewaard**. Na opnieuw openen van de feedbackknop komt het concept terug. Een concept is nog geen definitieve feedbackmelding.

Offline toegang geldt 24 uur na de laatste online controle; de eindtijd staat in beeld. Je feedback en concept blijven na die tijd bewaard, maar je moet eerst weer online aanmelden. Wis geen browsergegevens en gebruik geen privévenster. Browseropslag blijft afhankelijk van beschikbare ruimte; we vragen blijvende opslag maar kunnen die niet afdwingen. **Download meldingen** geeft een extra Markdown-kopie.

## Terug met internet

Klik in de paarse strook **Terug online & feedback overzetten**. Klik op de feedbackpagina **… offline meldingen overzetten**. Alleen deze nieuwe meldingen worden toegevoegd aan de actuele centrale feedbacklijst. Klanten, orders, betalingen en bestaande meldingen worden niet vervangen. Een verloren bevestiging maakt bij opnieuw proberen geen dubbele melding. Een online gewijzigde melding wordt niet overschreven.

Offline kopie en feedback zijn gebonden aan dit bedrijf, domein en de eigen aanmelding. Een andere aanmelding krijgt de bestaande kopie niet te zien en vervangt haar niet. Uitloggen vergrendelt de kopie. De normale centrale CloudDatabase blijft iedere online opslagactie bevestigen; er is geen algemene achtergrondqueue voor CRM-/provideracties.

## Oudere werkplek voor klantinvoer

De eerdere compacte offline werkplek blijft bereikbaar via **Klanten offline invullen**. Die is apart van bovenstaande modus en kan wél een beperkt aantal klant- en ordervelden wijzigen. De bestaande uitleg daarvan volgt hieronder.

---

# Offline op je normale CRM-URL

De offline werkplek gebruikt dezelfde website en browser als het online CRM. Er is geen localhostserver of installatie nodig. **Maak de werkplek vóór vertrek één keer met internet beschikbaar.** Alleen een open online tab is niet voldoende.

## Voor vertrek

1. Open je gewone Spatlappen-CRM en log in. Onder de zijbalk staat **Offline werken**. Rechtstreeks: https://spatlappen-crm.pages.dev/admin/offline/ . Gebruik steeds hetzelfde domein en dezelfde browser; een ander domein/browser heeft een eigen kopie.
2. Klik **Offline beschikbaar maken**. Wacht op **Gereed voor offline werken** en controleer de datum en je dossiers. Dit bewaart klant- en basisordergegevens op dit apparaat. Gebruik je eigen apparaat, geen privévenster.
3. Open de werkplek kort zonder verbinding en controleer of je klanten verschijnen. De gewone `/admin/`-URL opent bij een netwerkfout ook de offline werkplek als die voorbereid is.

## Wat kan?

- Nieuwe klanten toevoegen; contactgegevens, notities en gewone klantadressen aanvullen.
- Nieuwe orders voorbereiden bij een klant: producten, aantal, maten, materiaal en aanvraagtekst. Nummers worden pas bij synchroniseren toegewezen; onbekende prijzen blijven onbekend.
- Bij bestaande orders interne notities aanpassen. Producten, status en bedragen wijzig je online. Ordergebonden adressen wijzig je eveneens online om tegenstrijdige aflevergegevens te voorkomen.
- Lokaal bewaren en herladen zonder internet. Iedere wijziging vermeldt **nog niet online**.

Mail/Gmail, AI-diensten, betalingen, bestanden, ontwerpen, documentgeneratie en calculatorbewerking maken geen deel uit van deze offline werkplek. Er worden geen provideracties klaargezet of automatisch uitgevoerd.

## Met internet terug

Klik **Wijzigingen synchroniseren**. De werkplek haalt de actuele centrale gegevens op en past alleen jouw gewijzigde toegestane velden toe. Online betalingen, documenten, mails, productprijzen en overige gegevens blijven behouden. Bij hetzelfde veld dat online én offline is gewijzigd kies je welke waarde blijft. Als die online waarde daarna opnieuw verandert, moet je opnieuw vergelijken. Een verdwenen dossier wordt niet automatisch hersteld.

Controleer de melding **Gesynchroniseerd met je online CRM**. Open daarna Terug naar CRM. Een verloren netwerkbevestiging wordt via hetzelfde opslagnummer gecontroleerd voordat opnieuw wordt verstuurd. Geen blinde back-upimport: de algemene CRM-import vervangt gegevens en is geen synchronisatie.

## Bewaren en toegang

Offline toegang geldt 24 uur na online voorbereiding/aanmelding; de eindtijd staat in beeld. Daarna moet je online opnieuw inloggen. Je invoer blijft bewaard. Een online geweigerde sessie blokkeert de offline werkplek totdat je opnieuw bent aangemeld. Gegevens zijn gebonden aan domein, bedrijf, aanmelding en apparaat. Offline kan een ingetrokken online sessie niet direct worden vastgesteld; de maximale offline toegangstermijn begrenst dat.

Wis geen browsergegevens zolang wijzigingen nog niet gesynchroniseerd zijn. Browseropslag kan door een browser/OS worden verwijderd: de werkplek vraagt blijvende opslag, maar kan die niet afdwingen. Onder Offline kopie beheren kun je een reservekopie downloaden; die bevat klantgegevens en is **geen volledige/importeerbare CRM-back-up**. Verwijderen/uitloggen wordt bij niet gesynchroniseerd werk geblokkeerd; onbewaarde formulierinvoer krijgt een sluitwaarschuwing. Een andere tab kan bestaande invoer niet stil overschrijven.

## Bouwgrenzen

Browsercode: `admin/offline/`; pure projectie/veldvergelijking: `shared/offline-state.js`. Alleen zeven offline code-assets worden via een gegenereerde, op SHA-256 gecontroleerde serviceworkerbundel opgeslagen. Geen API-/auth-/bestandsresponses, sessiecookies of providerverzoeken in Cache Storage; geen achtergrondqueue voor POST-verzoeken. De normale CloudDatabase-transacties blijven centraal bevestigd en worden niet stiekem een offline opslagsysteem. De offline werkplek gebruikt een aparte IndexedDB-kopie en expliciete synchronisatie met de bestaande D1-versiecontrole.

Gedeeld gebouwd voor beide bedrijfsprofielen; alleen Spatlappen wordt in deze ronde gepubliceerd. Maatwerkkunststof/V2 blijven lokaal. Browserproeven gebruiken fictieve gegevens en een geïsoleerde server; een echte ingelogde browser moet de kopie nog zelf activeren.
