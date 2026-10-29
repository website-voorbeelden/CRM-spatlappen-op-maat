# Batch 5 verder uitgewerkt — 29 oktober 2026

Meldingen 24, 35 en 41 zijn opnieuw met de bestaande bron, ontwerptooldocumentatie en bouwtaken 35–41 vergeleken. Varianten, kleurpalet, deelbewerking en Paper.js-gebiedsegmentatie bestonden al. De volledige Melding-ID blijft de vaste tag in de privématrix. Deze vervolgronde is alleen lokaal; de drie meldingen blijven gedeeltelijk en niet automatisch afgehandeld.

## Opruimen vooraf beoordelen

`shared/design-variant-cleanup.js` levert nu één read-only opruimplan voor bevestiging én uitvoering in de bestaande state/files-transactie. Het plan vermeldt verwijderbare varianten, hun revisieaantal, unieke bestanden en bekende bestandsomvang. Ontbrekende grootte wordt als minstens het bekende aantal KB getoond. De lijst toont ook welke voorstellen behouden blijven, met de reden: goedkeuringsbewijs, onbekende eigendom/bestandskoppeling of een andere dossier-, mail-, hoofdafbeelding- of variantverwijzing.

De definitieve variant moet een actuele productbasis en complete gekoppelde ontwerp-/previewmetadata hebben voordat andere varianten mogen verdwijnen. Het definitieve ontwerp en al zijn revisies blijven behouden. Gegenereerde documenten en huidige, vervallen of ingetrokken goedkeuringsbewijzen zijn beschermd. Alleen een geldige kalenderdatum telt als besteldatum. De opruimregel blijft opt-in per product; er is nergens een instelling aangezet.

De bevestiging maakt expliciet verschil tussen direct verwijderen bij een al bestelde order en een voorbeeldlijst zolang nog niet is besteld. Bij later bestellen geldt de dan actuele veilige lijst. De klant, besteldatum, het product, de relevante bestandsmetadata en de uitkomst van de referentiebeoordeling vormen de bevestigingsbasis. Verandert daar iets aan vóór Opslaan, dan weigert de transactie de oude keuze. Het formulier met de bevestiging blijft bij een opslagfout beschikbaar. Uitschakelen zet verwijderde bestanden niet terug.

De bestaande lokale transactie verwijdert bij opt-in de interne variantbestanden samen met hun CRM-verwijzingen. Andere browsers, volledige back-ups en losse opgeslagen ontwerpen blijven afzonderlijke kopieën. Een getoond aantal bytes is de bekende bestandsinhoud, geen meting van de totale browser-/schijf-/bucketomvang.

## Cloudbytes gericht vrijmaken

De eerder voorbereide tombstonewachtrij blijft afhankelijk van opslagmigratie 0006 en een afzonderlijke publicatie. Geen migratie, cloudactie of fysieke verwijdering uitgevoerd. Zonder inrichting blijft de bestaande opslag werken; de cloudopruimactie meldt dat de inrichting nog ontbreekt. Historische uploads die al vóór de wachtrij hun metadata verloren zijn, worden niet uit ouderdom of een bucketlijst geraden.

Bij toekomstige registratie wordt per onveranderlijke objectsleutel gecontroleerd dat iedere bestandskoppeling naar diezelfde bytes een bewezen verwijderbaar intern ontwerpbestand is. Een tweede koppeling naar bijvoorbeeld goedkeuringsbewijs kan niet via een wegwerpbare eerste koppeling alsnog verdwijnen. Onzekere eigendom, een bestaand manifest of een huidige verwijzing bewaart de bytes.

De opruimlijst leest werkplekrevisie, records, manifesten en maximaal twintig wachtrijobjecten in één consistente D1-batch. Ook verwijzingen buiten de hoofdstate worden opnieuw beoordeeld. Objecten die weer worden genoemd zijn uitgesloten en worden als behouden geteld. De lijst kan via Meer naar een volgende groep zonder verwijderen; zo blokkeren twintig behouden objecten de latere groepen niet. Een mislukte volgende-pagina-opvraag laat de eerdere bevestiging staan. Navigeren naar een andere groep vraagt een nieuwe expliciete verwijderkeuze.

Een POST is gebonden aan dezelfde pagina, objecten en werkplekrevisie. Claimcontrole gebeurt in een D1-batch; een veranderde basis geeft geen fysieke delete. Same-origin, JSON, bedrijfstoegang en de bestaande immutable-keyblokkade blijven gelden. Nieuwe records mogen ook niet alleen een inmiddels opgeruimde bestands-ID of objectsleutel terugbrengen. Dit wordt zowel vooraf als in de winnende CRM-CAS bewaakt. Een volledige bestandsback-up met echte inhoud kan wel onder een verse objectsleutel worden opgeslagen. Een oude verwijzing zonder inhoud is geen herstel.

R2-verwijderen en de definitieve D1-status blijven afzonderlijke stappen. Bij een onderbreking blijven de tombstones herstelbaar; opnieuw verwijderen gebruikt dezelfde sleutels. De bevestigde omvang is gebaseerd op de geregistreerde objectgrootte, niet op een voor/na-meting van de hele bucket. Er is in deze ronde geen opslagwinst gemeten of geclaimd.

## Verbonden SVG-kleursegmenten

De actie staat nog steeds onder Meer bij een kleur. Normaal een hele kleur aanpassen of verwijderen blijft direct beschikbaar; extra geometriebediening is optioneel. De bestaande deelkeuze, dubbelklik/selectie, verplaatsen, groter/kleiner, kleurwijziging, verwijderen, ongedaan en herstel van het oorspronkelijke vectorlogo zijn behouden.

Nieuw: bij een volledig ondoorzichtig éénkleurig logo zonder uitsnedes worden contouren ook over groepsgrenzen in dezelfde vectorruimte samengenomen. Daardoor kan een verbonden vlak uit meerdere getransformeerde groepen één deel worden. Bij meerkleurige of transparante logo’s worden geen tussenliggende anders gekleurde lagen verplaatst. Daar blijft samenvoegen beperkt tot naastliggende volledig ondoorzichtige lagen met dezelfde kleur; transparante vormen blijven afzonderlijk.

Eenvoudige vaste SVG-uitsnedes in userSpaceOnUse worden nu geometrisch toegepast vóór de segmentherkenning. De zichtbare oppervlakte wordt met vectorintersecties bepaald, inclusief clip-rule, gaten, meerdere clipvormen en reguliere transformaties. De uitvoer wordt naar het oorspronkelijke oudercoördinatenstelsel teruggebracht. Het segment bevat daarna de zichtbare contour, zonder de verborgen geometrie buiten de uitsnede. Clips bij de oorspronkelijke bovenliggende groep blijven op die groep gelden wanneer een deel later wordt verplaatst. De interface legt deze bewuste omzetting uit; ongedaan en het oorspronkelijke vectorlogo blijven de terugweg.

ObjectBoundingBox-uitsnedes, recursieve/verborgen/complexere clipconstructies, lijnen en geneste SVG-kaders blijven overgeslagen met een concrete reden. Gemengde kleur- en transparantielagen worden niet wereldwijd platgemaakt. Een andere kleur die over een vorm heen is geschilderd wordt niet als geometrische uitsnede geïnterpreteerd. Filters, maskers, raster en onbeperkte Illustrator-bewerking vallen buiten het bestaande veilige SVG-contract. Daarom blijven meldingen 35 en 41 gedeeltelijk.

Contouren en gaten blijven vector, met de bestaande eindige Paper.js-precisie. Grenzen blijven 512 uitvoeronderdelen, 1500 contourcurves per bronvorm, 6000 broncurves totaal en 10000 curves per tussenresultaat; extra clipwerk is begrensd op 32 vormen per clip en 64 clipbewerkingen. Geen rastertrace of nieuwe provider. Bibliotheekladen blijft op expliciet verzoek met herproberen bij laadfout. Tussen de bewerkingen wordt de actuele logo-/selectie-/spatlapbasis bewaakt; een gewijzigde basis stopt zonder toepassen. Eén geslaagde actie gebruikt de bestaande undo/origineelroute.

API-contract bron: de officiële [Paper.js PathItem-documentatie](https://paperjs.org/reference/pathitem/) voor unie, intersectie, vulregels en heroriënteren, naast de reeds lokaal gebundelde versie 0.12.18. Alleen documentatie gelezen; geen bibliotheek of SVG door de bouwer uitgevoerd.

## Registratie en open gebruikerscontrole

Klassieke laadvolgorde en gedeelde code behouden. Relevante editor-, app- en bouwloglaadversies bijgewerkt, zodat ook eerdere lokale bronnotities worden meegenomen. Geen nieuwe stylesheet of verspreide CRM-CSS; de bestaande centrale opmaak wordt hergebruikt. Bestaande financiële, documenttemplate-, order-, batch1–4- en editorwijzigingen zijn behouden. Git-werkkopie en index niet gewijzigd.

Bouwtaak feedback29-batch5 krijgt een aanvullende doing/local-notitie via scripts/build-task.mjs. Alleen de drie developmenttags en matrixregels van deze batch worden bijgewerkt. Open/Afgehandeld en afhandelnotities blijven leidend. Melding 24 blijft gedeeltelijk door historische onbekende cloudbytes en de nog niet uitgevoerde inrichting/publicatie; meldingen 35 en 41 door de beschreven SVG-grenzen. Gebruikerscontrole is een afzonderlijke open stap.

Geen tests, checks, syntaxchecks, builds, browser-/DOM-/visuele QA, render-/segmentatie-/export-/productieproef, prestatiemeting, provideractie, runtimeherstart, GitHubupload, publicatie, migratie of zakelijke data-/bestandsmutatie. Alleen handmatige bron-/documentlezing en bewerking, primaire API-documentatie en feedback-/bouwadministratie.

Eigen controle: opruimplan met huidige en toekomstige besteldatum, ontbrekende definitieve bestanden, goedkeurings-/mail-/hoofdafbeelding-/revisieverwijzingen, twee tabs en gewijzigde klant/product/metadata, bevestigen/annuleren/fout/invoerbehoud, lokale state/files-atomiciteit; na afzonderlijke inrichting cloudaliassen/referenties/meerdere groepen/CAS/claim/onderbreking/volledige back-up en behoud bij onzekerheid. SVG: gaten/evenodd/nonzero, draaiing/spiegeling/geneste groepen, éénkleurige verbindingen, meerkleurige tussenlagen, transparantie, vaste cliptransformaties en geweigerde constructies, selectie-/bronwissel, grenzen, ongedaan/herstel en latere PNG/PDF. Beide bedrijven en klein scherm/keyboard door Philippe te beoordelen.
