# Spatlap Preview Tool

Dit is een zelfstandige kopie van de previewtool, zonder bestanden van de bedrijfswebsite of het offerteformulier.

## Bestanden

- `spatlap-preview.html` — de complete editor en interface.
- `spatlap-preview-imagetracer.js` — de lokale PNG/JPG-naar-vectorfunctie (ImageTracer, Unlicense; licentietekst staat in het bestand).
- `docs/spatlap-preview-integratie.md` — het ontwerpformaat en de koppelpunten voor een toekomstig CRM.

Zet deze bestanden in dezelfde structuur in de hoofdmap van je nieuwe GitHub-repository. `spatlap-preview.html` laadt het JavaScript-bestand via een relatief pad. Voor lettertypes en bepaalde PDF-functies gebruikt de tool externe diensten; daarvoor is internet nodig.

De toekomstige CRM-opslag, inloggen, Cloudflare D1/R2 en API-sleutels zitten **niet** in deze kopie. Geheime sleutels horen later uitsluitend op de server.

## Bestaande online URL

De huidige URL op `website-voorbeelden.github.io/spatlappen-op-maat/` blijft uit de bestaande website-repository komen. Deze kopie uploaden naar een nieuwe repository verhuist die URL niet automatisch. Laat de bestaande bestanden daar staan totdat je een nieuwe hosting-URL hebt gekozen en oude links hebt opgevangen.

Ontwerpen die alleen lokaal in je browser zijn bewaard, verhuizen niet automatisch naar een andere URL. Nieuwe wijzigingen aan de oude websitekopie worden ook niet automatisch naar deze nieuwe repository gekopieerd.
