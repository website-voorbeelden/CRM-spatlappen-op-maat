# Aanvraaggegevens uit een e-mail

Open E-mail, kies een ontvangen gesprek dat nog geen order heeft en klik **Aanvraag herkennen**. De tekst van dat geopende bericht wordt lokaal gelezen. Er vindt bij deze herkenning geen AI-aanroep plaats; eventuele Gmail-ophaalacties blijven onderdeel van de bestaande mailbediening.

De controle toont vooraf ingevulde velden en **Nog nodig voor een passende offerte**. Je kunt ontbrekende productspecificaties later aanvullen en alvast een aanvraagconcept bewaren. Klantnaam en één geldig e-mailadres zijn nodig om het juiste dossier te maken of te hergebruiken. Controleer de waarden, vink de bevestiging aan en kies **Gecontroleerde aanvraag bewaren**. Daarna staat de aanvraag met de mailkopie bij de order. De bestaande knop Gegevens opvragen kan ontbrekende informatie vervolgens als mailtekst voorbereiden; versturen blijft apart.

Een eenduidig bestaand klantadres (ook factuurmail) wordt hergebruikt. De bestaande klantvelden blijven behouden. Bij meerdere klanten met hetzelfde adres moet je eerst bewust koppelen; bij een gearchiveerde klant eerst het dossier controleren/herstellen. De bron en CRM-koppeling worden opnieuw gecontroleerd bij opslaan. Hetzelfde bericht nogmaals verwerken maakt geen tweede aanvraag.

## Welke structuren worden herkend?

- Veldnamen met een dubbele punt: Bedrijf/Bedrijfsnaam, Naam/Contactpersoon, E-mail, Telefoon/Tel en Product/Onderdeel.
- Eén e-mailadres uit een gelabeld veld, anders Reply-To of afzender. Verschil tussen afzender en Reply-To geeft een waarschuwing. Een afzendernaam kan als voorlopig klant-/contactnaamvoorstel dienen; controle blijft nodig.
- Aantal met een label of woorden zoals `20 stuks`, `20 platen`, `20 pakkingen` en `twee witte kunststof blokken`. Nederlandse telwoorden één t/m twintig worden beperkt herkend bij bekende productwoorden; dit is geen algemene taalinterpretatie. Eén gelijk aantal in het tabelveld én in de berichttekst telt niet als twee producten. Meerdere aantallen in de berichttekst, verschillende aantallen of een keuze/bereik vragen controle.
- Materiaalnamen uit de huidige beperkte herkenningslijst, bijvoorbeeld PVC, HDPE, POM, PMMA, EPDM, SBR, NBR en rubber. Dit zijn tekstwaarden, geen gekoppelde materiaalcatalogus of leverancierstarieven.
- Gelabelde maten met mm/cm/m, zoals `Dikte: 3 mm` en `Buitendiameter: 10 cm`; ook `20 cm breed, 10 cm lang, 3 mm dik` en `200 × 100 mm`. Omrekening gebeurt naar mm.
- Expliciet ‘zonder middengat’ geeft gatdiameter 0. Onbekend is een leeg veld.

Voorbeeld:

```text
Bedrijf: Voorbeeld BV
Contactpersoon: Jan Voorbeeld
Telefoon: +31 20 1234567
Aantal: 20
Materiaal: PVC
Breedte: 20 cm
Hoogte: 10 cm
```

Dit levert een klantvoorstel en 20 rechthoekige delen van 200 × 100 mm op. De dikte ontbreekt en blijft zichtbaar als vraag. Het bedrag wordt niet geschat.

## Grenzen

Tegenstrijdige waarden blijven leeg met een melding. Meerdere aantallen/productregels worden niet tot één samengestelde productbeschrijving gemengd; vul één product bewust in en werk andere productregels via de normale ordereditor uit. Maten zonder eenheid en een drietal zoals `200 × 100 × 3 mm` worden niet stil als breedte/hoogte/dikte geïnterpreteerd. Geciteerde mailhistorie wordt waar herkend overgeslagen. Niet elk mailprogramma markeert historie hetzelfde: controleer de getoonde bron.

De huidige stap leest geen bijlagen of CAD, vult geen adressen/bedragen/betalingen in en verandert geen bestaande order. Bij een al gekoppelde order blijft de bestaande AI-route voor specificaties beschikbaar. Daar behouden null/onbekende AI-velden de al bekende waarden; het voorstel toont bron en ontbrekende informatie.

## Hoe toekomstige voorbeelden toevoegen

Dit is herkenning met vaste regels, geen getraind of zelflerend model. Voeg een geanonimiseerde aanvraag aan `tests/request-recognition.mjs` toe met de verwachte waarden én onbekenden. Breid pas daarna `shared/request-recognition.js` uit. Test ook de tegenvoorbeelden: andere eenheid, twee producten, meerdere e-mailadressen, afwijzing/ontkenning en oude geciteerde antwoorden. Bewaar geen echte klantmail als trainings- of testbestand.

De UI staat in `admin/inquiries/request-intake.js`; de bestaande mailwerkplek roept deze via `inquiryUI.intake` aan. De bevestigde bewaaractie gebruikt `createInquiry` en `saveInboxThread` in één actuele CRM-transactie. Herkomst `mailRecognition` blijft alleen zichtbaar zolang de waarde niet handmatig is veranderd. De automatische afzenderregels voor bekende websiteformulieren blijven gescheiden en zijn niet nieuw ingeschakeld.

## Maatwerkkunststof-formulier — lokale aanvulling 21 oktober 2026

Afzender `aanvragen@tjworx.nl`, onderwerp begint met `Nieuwe offerteaanvraag:` en ontvanger bij Maatwerkkunststof. Spatlappen behoudt `noreply@spatlappenopmaat.nl` met zijn bestaande onderwerp-/ontvangerregel. Een zichtbare afzendernaam alleen bewijst niets: automatische intake vereist ook bestaande expliciete inschakeling, een nieuwe ontvangstdatum, een door Gmail geverifieerde afzender en eenduidige gegevens. Oudere mails blijven handmatig controleren. Deze wijziging schakelt niets in en verwerkt geen bestaande mails opnieuw.

Het tabelveld Product eindigt nu ook vóór Aantal. `Aantal: Niet ingevuld` wordt niet als nul of onderdeel van de productnaam opgeslagen. Pagina wordt bij nieuwe herkende formulieraanvragen als `inquirySourcePage` bewaard; uitsluitend een pad of HTTPS-URL van de eigen bedrijfswebsite, als passieve bronvermelding. Bij bestaande aanvragen kan de weergave de pagina readonly uit de bewaarde bron tonen. Geen backfill/migratie. Onder Aanvraaggegevens → Herkomst aanvraag staan product en pagina compact bij elkaar; de pagina staat ook in de intakecontrole. Campagnegegevens/UTM en schroefinstructies blijven in de mailtekst, geen aparte campagne-integratie uit deze stap.

Voorbeeld zonder klantgegevens: Product Kunststof blokken op maat; Aantal Niet ingevuld; Pagina /kunststof-blokken-op-maat/; tekst ‘twee witte kunststof blokken POM, 9.5 cm hoog, 7.0 cm breed, 1.2 cm dik, schroefafstand 6.1 cm’. Bedoelde voorstellen: aantal2, POM, wit, breedte70mm, hoogte95mm, dikte12mm. De schroefafstand61mm blijft in de oorspronkelijke beschrijving: niet als gatdiameter, gatpositie of tekening afleiden. De extra bijlage wordt hiermee niet gelezen. Materiaal/dikte worden bij een nieuwe Maat-productregel ook in de betreffende productvelden gezet, met bronmarkering bij herkenning; prijzen blijven onbekend.

`&#xA;`/`&#xA0;` en andere ondersteunde HTML-entiteiten worden ook uit de platte mailtekst passief gedecodeerd. HTML blijft tekst: geen ingevoegde uitvoerbare mail-HTML. Gedeelde aantallen-/kleurherkenning voor automatische formulierintake en handmatige herkenning. Bij mogelijk meerdere producten/materialen blijven de automatische productspecificaties leeg en is controle nodig, in plaats van eerste waarden door elkaar overnemen. Bestaande klantvelden en dubbelverwerkingscontrole blijven behouden.

Alleen bronwerk: geen tests, syntaxchecks, builds, functionele browser-QA, echte providerproeven of publicatie uitgevoerd; Philippe test zelf. Werkelijke MIME-indeling van de aangeleverde mail niet onderzocht. Eerst dit voorbeeld gebruiken; alleen als echte herkenning nog afwijkt is geanonimiseerde ruwe HTML/MIME nodig. Meerdere losse producten betrouwbaar uit elkaar halen blijft een open bouwtaak.
