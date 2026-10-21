# Actuele CRM-koppeling — 17 oktober 2026

De preview is al gekoppeld aan CRM-producten. De historische beschrijving hieronder van een later in te vullen generieke adapter betekent niet dat productopslag nog ontbreekt. De huidige automatische productroute gebruikt `admin/product-designs.js` via de bestaande `admin/cloud-storage.js`-facade.

- Los openen: `http://localhost:3010/spatlap-preview.html`.
- Dossiergekoppeld openen: bij de productregel **Ontwerp openen**; `productDesignUrl` maakt orderId/itemId/maten/aantal en zo nodig storage=cloud klaar.
- Bewaren bij product: ontwerp-JSON + PNG + actuele maat/aantal in één bestaande transactie. De editor gebruikt cm; CRM hele mm. Bestaande versie-/producthandtekening, goedgekeurde voorbeelden en gekoppelde leveranciersaantallen beschermen.
- Meerdere A/B-ontwerpen bij dezelfde maat is **taak27, nog niet gebouwd**. Huidige opslag heeft één bewerkbaar productontwerp; vervanggedrag niet als alternatiefbeheer presenteren.
- Hoofdbron: `spatlap-preview.html`, vector-editor/export/imagetracer ernaast. Uitgebreide startcontext: [docs/PROJECTCONTEXT.md](docs/PROJECTCONTEXT.md).

De oudere publieke export/import-API en formaatbeschrijving blijven hieronder staan als integratieachtergrond. Bij afwijkingen is de actuele broncode leidend; verander opgeslagen formaten niet zonder compatibiliteitscontrole.

---

# Spatlap Preview Tool koppelen aan een CRM

De tool blijft zelfstandig werken. Lokale opslag, bestaande `#design=`-links en de huidige downloads gebruiken hun bestaande werkwijze. Het CRM kan later de functies hieronder gebruiken zonder de ontwerplogica aan te passen.

## Publieke koppeling

Na het laden van `spatlap-preview.html` is `window.SpatlapPreview` beschikbaar. Wacht eerst op `await window.SpatlapPreview.ready`.

| Functie | Doel |
| --- | --- |
| `exportDesign()` | Geeft een volledig JSON-ontwerp terug, inclusief teksten, logo's en posities. |
| `importDesign(document)` | Laadt zo'n ontwerp volledig terug. Geeft een Promise terug. |
| `setContext({customerId, orderId, designId})` | Zet de CRM-identificaties als metadata; dit verleent geen toegang. |
| `getContext()` | Leest die metadata. |
| `createPreviewPngBlob()` | Maakt een PNG-preview zonder download of klembordactie. |
| `setStorageAdapter({save, load})` | Verbindt later de beveiligde CRM-opslag. |
| `saveToStorage()` | Roept `save(document, previewPngBlob)` aan. |
| `loadFromStorage(designId)` | Roept `load(designId, context)` aan en laadt het resultaat in de editor. |

De adapterfuncties zijn nu **niet** ingevuld. Het CRM levert die later. Ze moeten via een beveiligde backend werken. Zet geen API-sleutels, R2-gegevens of databasegegevens in deze pagina. Een `customerId` of `orderId` in de browser is alleen een aanwijzing; de backend moet de gebruiker en de koppeling met de bestelling zelf controleren.

## Ontwerpformaat v1

```json
{
  "format": "spatlap-preview-design",
  "version": 1,
  "context": {
    "customerId": "klant-id-of-null",
    "orderId": "bestelling-id-of-null",
    "designId": "ontwerp-id-of-null"
  },
  "design": {
    "flap": {},
    "holes": {},
    "logos": [],
    "texts": [],
    "ui": {}
  }
}
```

`flap`, `holes`, `logos`, `texts` en `ui` bevatten de actuele editorgegevens. Een logo bevat nu gewoonlijk een `data:`-URL of SVG-inhoud. Daardoor is het ontwerp opnieuw te openen, maar de JSON kan groot worden. De toekomstige adapter kan logo's in R2 zetten en in het ontwerp vervangen door duurzame, toegankelijke URL's. Tijdelijke `blob:`- en `file:`-URL's worden bij export geweigerd.

De oude korte sleutelvelden in `#design=`-links en lokale ontwerpen blijven werken. Het nieuwe v1-formaat is bedoeld voor de centrale uitwisseling. Bij een toekomstige formaatwijziging moet een migratie worden toegevoegd in plaats van oude ontwerpen stilzwijgend te veranderen.

## Gebruik vanuit een later CRM

```js
const preview = window.SpatlapPreview;
await preview.ready;

preview.setContext({customerId: 'klant-123', orderId: 'order-456', designId: null});
const document = preview.exportDesign();
const png = await preview.createPreviewPngBlob();

// Een CRM-adapter levert later de echte, geautoriseerde backend-aanroepen.
preview.setStorageAdapter({
  save: async (document, previewPngBlob) => { /* opslaan via CRM-backend */ },
  load: async (designId, context) => { /* v1-document ophalen via CRM-backend */ }
});
```

De huidige URL-parameters zoals `w`, `h`, `qty`, `color` en `holes` kunnen een nieuw ontwerp alvast invullen. Voor direct aanroepen van `window.SpatlapPreview` moet het CRM op dezelfde browser-origin draaien of de preview als pagina op diezelfde origin aanbieden. Bij verschillende origins is later een expliciete, gecontroleerde berichtenkoppeling nodig.

Dit is alleen de koppelgrens. Database, inloggen, autorisatie, bestandsupload en CRM-schermen worden later gebouwd.
