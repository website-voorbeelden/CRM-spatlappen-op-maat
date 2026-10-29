# Batch 4 verder uitgewerkt — 29 oktober 2026

De 28 meldingen van batch 4 zijn vergeleken met de huidige editor, eerdere documentatie en bouwtaken 35–41. Veel bediening bestond al. Deze ronde richt zich op bewaren bij een product, maatvelden, previewzoom, fontvoorbeelden en Kopie openen. Eerdere code uit alle batches, klantgegevens, ontwerpen en bestanden zijn behouden. De volledige Melding-ID blijft de vaste tag in de privéadministratie.

## Ontwerp en order samen bewaren

De bestaande bevestiging bij een gewijzigde productmaat of een ander aantal blijft verplicht. Dezelfde gevalideerde millimeterbasis wordt nu gebruikt voor de bevestiging, de gewone bewaarronde en Bewaar als nieuwe variant. Een leeg ontwerpaantal blijft leeg en verandert het orderaantal niet. De bestaande toegestane maten zijn niet aangescherpt of gemigreerd.

De editor maakt de afronding naar gehele millimeters pas na de bevestiging zichtbaar. De JSON en het PNG-voorbeeld worden op diezelfde basis gemaakt. Bij annuleren, ongeldige invoer of mislukte opslag blijven de oorspronkelijk ingevoerde maat en het aantal beschikbaar. Na een mislukte bewaarpoging wordt het werkgebied ook weer bedienbaar als het opnieuw tekenen een fout geeft. Een melding aan andere tabs kan een al bevestigde opslag niet achteraf als mislukt presenteren.

Bewaar als nieuwe variant leest een verse productbinding, maar controleert nu eerst dat die nog bij de oorspronkelijke klant hoort. Een order die ondertussen aan een andere klant is gekoppeld wordt niet stil een nieuwe bestemming voor het nog geopende artwork. De gebruiker houdt het ontwerp in de tab en kan de juiste order opnieuw openen. Nieuwe variant-ID’s en namen blijven uit de bestaande route komen. Veranderde product- of variantbasis wordt bij het echte bewaren in de gezamenlijke state/files-transactie opnieuw geweigerd.

Een nieuw aantal mag niet onder de netto uitgegeven voorraad of onder gekoppelde aantallen op leveranciersdocumenten komen. De leverancierscontrole geldt ook wanneer de actuele kostprijs nog niet het label supplierInvoice heeft. Alleen regels van deze order en dit product tellen mee; een ontbrekende orderkoppeling moet eerst worden verduidelijkt. Het CRM maakt geen voorraadretour of wijziging aan een leveranciersdocument namens de gebruiker.

Voor kosten uit leveranciersdocumenten volgt de bekende gedeeltelijke of volledige basis de bestaande aantallen en prijzen. Bij een afwijkend aantal blijft de stukprijs onbekend; bij een volledig bekend passend aantal volgt die uit het bewaarde kostentotaal. Ongeldige prijs-/aantalgegevens blokkeren de aanpassing. Een oude berekende inkoopprijs wordt bij een gewijzigde productbasis niet als actuele calculatie behouden: die wordt onbekend en de oude berekening blijft beschikbaar om opnieuw te controleren. Handmatig ingevoerde prijzen en werkelijke betalingen worden niet overschreven.

De bevestiging legt uit dat varianten dezelfde productgegevens delen, de definitieve ontwerpkeuze vervalt en prijsafspraken/marges kunnen veranderen. Bestaande facturen, eerdere ontwerpbestanden en fysieke uitvoeringsdatums blijven historie. Automatische productievoorwaarden blijven afhankelijk van een geldige huidige ontwerpkeuze; een historische akkoorddatum is geen vervanging daarvan.

## Zoom en maatbediening

De bestaande grens van 3200% blijft. De zoomknoppen geven nu de minimale/maximale stand aan door te blokkeren bij 50% en 3200%. Muis-/trackpadzoom wordt per tekenframe gebundeld; meerdere gebeurtenissen worden niet elk met een volledige render uitgevoerd. Het laatste cursoranker blijft leidend. Directe zoom/reset wist een nog wachtend gebaar, zodat een oude stap niet achteraf terugkomt. Zoom bij selectie gebruikt de bestaande selectie-ankering, zoom met pointer de bestaande cursorbasis. Opgeslagen productmaten en exports veranderen niet door schermzoom.

De verticale plus/min rechts naast breedte en hoogte blijven staan. Klik geeft 0,1 cm, Shift+klik 1 cm; handmatig is 0,01 cm mogelijk, overeenkomstig de getoonde twee decimalen. De knoppen volgen de geblokkeerde toestand van hun veld, bijvoorbeeld tijdens bewerking van een los vectoronderdeel. Proportioneel schalen, vrij schalen van logo’s, tekstverhouding en één bestaande undo-actie blijven leidend.

Een lege of ongeldige selectieafmeting wordt niet meer meteen vervangen door de oude maat. Het veld blijft herkenbaar gemarkeerd met een melding bij de maatbediening. Er wordt dan niets geschaald. Herstellen of een andere selectie kiezen ruimt de foutmarkering op. Enter bevestigt via dezelfde route; een ongewijzigde maat maakt geen extra schaalstap. De wijzigingshandler verplaatst de focus niet tijdens het schalen, zodat bevestigen en het verlaten van het veld niet twee keer dezelfde schaalfactor kunnen toepassen. De bestaande wrapindeling en lage-schermhoogtebediening blijven behouden.

## Lettertypen vergelijken

De galerij heeft een aparte optie Alleen het lettertypevoorbeeld in HOOFDLETTERS. Dit verandert uitsluitend het voorbeeldvak, niet de eigen tekst of de export. De bestaande bewuste actie om de echte tekst naar hoofdletters om te zetten blijft daarvan gescheiden.

Hover/focusvergelijkingen worden per tekenframe gebundeld. Dezelfde fontkeuze wordt niet dubbel getekend door pointer én focus; fontlaadbeloften worden begrensd hergebruikt. Mislukte loads kunnen opnieuw worden geprobeerd. De bestaande actuele selectie-/object-/previewrevisie voorkomt dat een late fontload een nieuwere keuze overschrijft. Een dubbele directe voorbeeld-update is verwijderd.

Verlaten, sluiten, kiezen of Escape beëindigt een tijdelijk voorbeeld. Na kiezen gaat focus terug naar het fontveld; Escape keert terug naar de galerijkop. Bewaren beëindigt een tijdelijk fontvoorbeeld voordat artwork en PNG worden opgebouwd, zodat een onbesliste hover niet op een gekozen lettertype lijkt. Het artwork verandert pas door de bewuste fontkeuze. Hoofdlettervoorbeeld en de laadcache worden niet als nieuwe ontwerpgegevens opgeslagen.

De bestaande gebruikssortering, gebundelde lettertypen, begrensde TTF/OTF-import, fontbytes in de ontwerpdata, dekking-/exportcontrole en AI-uitleg voor SVG-contouren blijven behouden. Er zijn geen extra fonts gedownload of rechtenclaims toegevoegd. De gemelde traagheid is niet gemeten; minder dubbel werk in de bron is geen bewijs van een opgeloste klacht op de MacBook.

## Kopie openen en bestaande bediening

Melding 34 verwijst concreet naar Kopie openen. De eerdere opslagroute en bescherming van het oorspronkelijke ontwerp blijven behouden. De actie wacht nu ook op vrijgegeven bediening als een andere bewaar-/importactie bezig is. Pas na echte opslag verschijnt bovenaan een blijvende link Open bewaarde kopie, met dezelfde leesbare hover/focusbasis als de orderteruglink. Dit biedt een vindbare route als de browser een nieuwe tab blokkeert of de gereserveerde tab al is gesloten/gebruikt. Zo’n andere pagina wordt niet vervangen. De status maakt verschil tussen opgeslagen kopie en het openen van een tab. De header/preview wordt na het tonen van de link opnieuw passend gemaakt.

Deze kopie blijft bewust een los ontwerp; Bewaar als nieuwe variant is de aparte actie om bij dezelfde order te bewaren. De gebruiker krijgt geen nieuwe automatische klant-/orderkoppeling. De oorspronkelijke gebruikerssituatie is niet gereproduceerd: melding 34 blijft gedeeltelijk.

In bron vergeleken en behouden: dubbelklik/handmatig cropkader, SVG-/rasterbewaring en undo; directe klantpreview met bovenstrook; contourkleur/-dikte en fysieke exportbasis; logo-drop; vectorstatus uit opgeslagen gegevens; standaard Verbetering bij nieuwe feedback; uitlijnen met de actieve 3cm-strook; spiegelen/draaien; tijdelijke vectorprojectie; tekst-/logopaneel op selectie, meerregelige tekst en groeiend tekstvak; opmaak-/hoogteovername en horizontale/verticale balans. Geen van deze bestaande functies is door deze bronvergelijking gebruikersgoedgekeurd.

## Registratie en grenzen

De klassieke scriptvolgorde is behouden: helpers vóór runtime, bootstrap als laatste module. Alleen de bijbehorende laadversies zijn bijgewerkt, inclusief de huidige feedbackmodule. Opmaakwijzigingen horen bij de zelfstandige editor in diens bestaande editor.css; er is geen nieuwe CRM-stylesheet of gedupliceerde bedrijfsimplementatie toegevoegd. De centrale CRM-opmaak is ongemoeid gelaten.

Bouwtaak feedback29-batch4 krijgt een aanvullende review/local-notitie via scripts/build-task.mjs. Alleen de 28 bijbehorende developmenttags en matrixregels krijgen nieuwe bronbevindingen. Gebruikersstatus Open/Afgehandeld, afhandelnotities en andere batches blijven behouden. Meldingen 32 (traagheid), 34 (oorspronkelijke knopklacht) en 42 (mobiele invoer) blijven gedeeltelijk. Batch 5 met bredere SVG-segmentatie en fysieke opslagopruiming is in deze vervolgronde niet uitgevoerd.

Geen tests, checks, syntaxchecks, builds, browser-/DOM-/visuele QA, prestatiemeting, converter-/PNG-/PDF-/productieproef, runtimeherstart, provideractie, GitHubupload, publicatie, migratie of zakelijke data-/bestandsmutatie. Uitsluitend bron-/documentlezing en gerichte bewerking plus feedback-/bouwadministratie. Er is geen echt ontwerp door de bouwer geopend, geconverteerd, bewaard, verwijderd of gewijzigd. De Git-werkkopie en staging zijn behouden.

Eigen controle blijft open: meerdere tabs/varianten, oorspronkelijke klantbinding en gewijzigde ordermaat, normaal bewaren versus nieuwe variant, annuleren/opslagfout/invoerbehoud, millimeterafronding/PNG/JSON en leeg aantal, gekoppelde leverancierregels/voorraad en kostenbasis, vervallen definitieve keuze, 3200%/50%/cursor-/selectiezoom/trackpad/reset, maatveld/knoppen/Shift/Enter/undo/foutmarkering, fonthover/kiezen/hoofdlettervoorbeeld/import/opslag/export, kopie-popup/fallbacklink en klein scherm/mobiel/keyboard. De financiële en fysieke gevolgen worden door de gebruiker beoordeeld; geen volledige geslaagde controleclaim.
