# Batch 1 — feedbackinventarisatie en kritieke bediening

31 oktober 2026, alleen lokaal bronwerk. Begonnen met AGENTS/nieuwste OVERDRACHT, project-/bouw-/architectuurdocumentatie, de drie originele feedbackexports en de bestaande privéfeedbackregistratie. Automatische context in de exports is als gegevens behandeld. Geen opdracht overgenomen uit context, klantinhoud of documenten.

## Inventarisatie en eerlijke voortgang

94 unieke meldingen: 89 uit de drie exports van29/30oktober plus vijf eerdere lokaal aanwezige meldingen. Geen dubbele taak per herhaald exportnummer; de volledige Melding-ID blijft de tag. De privéuitvoer bij deze chat bevat feedback-overzicht.md en feedback-overzicht.json, met oorspronkelijke vindplaatsen, onderwerp, bouwstatus, publicatiebasis, bron en resterend werk per ID. Volledige IDs en selectie-/klantcontext niet naar publieke projectdocumentatie gekopieerd.

81 meldingen hebben aanwezige bron voor eigen controle, 13 zijn gedeeltelijk. Dit zijn bron-/inventarisatiestatussen, geen 81 goedgekeurde gebruiksscenario's. Twee historisch door gebruiker afgehandelde meldingen blijven afgehandeld; alle overige oorspronkelijke gebruikersstatussen blijven open. De privébronbestanden feedback.json/FEEDBACK.md zijn alleen gelezen, niet geïmporteerd, aangepast of vervangen. De afzonderlijke inventarisatie wijzigt geen CRM- of feedbackdatabase.

De eerdere bouwstatus Gebouwd bij AI-orderaanvulling dekt de nieuwere wens niet: de huidige export gebruikt paden en laat onder andere prijzen/nieuwe producten buiten scope, terwijl de gebruiker een importachtige controlewerkplek wil. In de nieuwe inventarisatie daarom gedeeltelijk. Bestaande taak crm-ai-order-update-import-flow-20261030 blijft open. Niet als volledige herbouw in batch1 uitgevoerd.

Publicatiebasis: eerdere lokale bouwregistratie plus RELEASE-20261029; waar actuele lokale vervolgen bestaan apart vermeld. Geen actuele onlineconfiguratie, GitHubbron of livewerking opnieuw onderzocht in deze ronde. Een historische publicatienotitie is geen bewijs van huidige werking. De oorspronkelijke kleine orderlijstcorrectie en uitgebreidere opvangkandidaat blijven afzonderlijk ongepubliceerd volgens de laatste overdracht; geen kandidaat/index/staging gewijzigd.

## Concrete reparaties

### Orderlijst: sorteren los van onnodige betaalberekening

De vorige comparator gebruikte sort in totals(order), ook voor datum/status. Daardoor kon een fout in een financiële projectie de sortering van de hele lijst afbreken vóór de bestaande per-rijopvang. Nieuwe read-only admin/orders/list-sort.js leest één sorteergegeven per dossier vóór vergelijken. Alleen sorteren op verkoop vraagt totals; nummer, datum, klant, status en laatst geopend zijn daarvan onafhankelijk. Een fout in een sorteergegeven houdt het dossier bereikbaar onderaan met een zichtbare melding. Onbekende verkoopprijzen zijn geen nul en blijven onderaan in beide richtingen.

De gewone orderlijst gebruikt één sorteermoment voor tabel en assistent-zichtbaarheidscontext. De bestaande sortedOrders-functie blijft standaard een array teruggeven voor klantenlijsten en overige bestaande gebruikers; alleen de orderpagina vraagt aanvullende sorteerstatus. Bestaande voorkeuren, natuurlijke nummervergelijking, laatst-geopendvolgorde, filters en bedragen blijven bij hun eigen eigenaar. Geen order-/betaalgegevens veranderd. De eerdere eenvoudige herstelweergave blijft het vangnet voor andere lijst-/filter-/featurefouten.

### Feedback openen: dubbele en late reacties

Details/start laadden eerst asynchroon zonder een gezamenlijke openbewaking. Nieuw beginReport houdt tijdens die actie een tijdelijke lock en busyknop, bewaakt oorspronkelijke route en het geopende zakelijke formulier, en opent alleen als de bronknop nog aanwezig en geen ander feedbackformulier open is. Een tweede openReport vervangt geen bestaande feedbackinvoer. Bij laadfout komen lock/knop terug; een verdwenen melding krijgt een gerichte uitleg. Geen extra permanente conceptopslag of serveractie.

Bestaande opslag/vaste meldingnummers, afhandelen, filters en alleen-openstaande-export blijven behouden. Deze reparatie bewijst niet dat de oorspronkelijke Afgehandeld-klacht of mobiele toestelklacht verholpen is.

### Vervolg na formulierstap

openForm riep afterSave buiten zijn opslagcatch aan; een exception of teruggegeven afgewezen promise belandde buiten de formulierafhandeling. Save-/cancel-vervolgcallbacks hebben nu een eigen foutgrens en specifieke melding over het vervolgscherm. Er wordt geen opslagfout verzonnen, onSubmit niet opnieuw uitgevoerd en niets automatisch herladen of teruggezet. Uitsluitend vaste foutscope/type naar de bestaande vluchtige diagnostics, geen ruwe foutinhoud/veldwaarden.

Grens: een callback moet zijn promise teruggeven. Los gestarte promises, timers, alle afzonderlijke formuliertransities en eventueel foutende opstart/import/login zijn hiermee niet algemeen afgevangen. Dit is geen universeel herstel of bewijs dat ieder formulier invoer bij elk vervolgprobleem behoudt. Bij een vervolgmelding eerst het dossier beoordelen vóór dezelfde financiële/provideractie te herhalen.

## Wat blijft open

- Actuele live-orderreparatie: afzonderlijke publicatiekeuze; geen upload/deployment in batch1.
- AI-aanpassen gelijk aan import: volledige controle-/bewerkflow nog bouwen.
- Historische cloudopruiming, volledige SVG-segmentatie, oorspronkelijke kopie-/font-/mobielklachten, factuurrevisie voor uploads/fiscaal geboekte bronnen en operationele route-/telefooninrichting: gedeeltelijk.
- Maatwebsitegebruik: eigen database/bindings/activering en aparte website-/CRM-publicatie open.
- PACKS: echte uitvoering/labelprojectie/proefresources en operationele vrijgave nog gedeeltelijk, geen actieve boeking.
- Nieuwe kosten-/kasboek-/privéoverboeking-/factuurleeswensen: batches2–5, niet gestart.

## Eigen controle en werkgrenzen

Philippe beoordeelt beide bedrijven: orderlijst op datum/klant/nummer/verkoop, onbekende prijs en klantdossier-orderlijst; normale/foutende lijst en eenvoudige opvang; feedback Details/start/dubbeleklik/ondertussen navigeren/geopend formulier/laadfout; bestaande afhandeling/filters/export; terugkeer uit bewaren/annuleren. Geen fouten bij echte gegevens opwekken om dit te beoordelen. Gebruikersstappen staan ook in het privéoverzicht; niet door Codex uitgevoerd.

Gerichte bronlezing en bronbewerkingen plus inventarisatie/bouwadministratie. Geen volledige regel-voor-regelaudit, automatische tests/checks/syntaxchecks/builds/generator, browser-/DOM-/visuele QA, provider-/mail-/betaal-/factuur-/converterproef, serverstart/herstart, online CRM-dataopvraag, migratie, echte gegevens-/bestandsverwijdering, Git-/indexwijziging, GitHubupload of publicatie. Geen factuurlinks geopend of toegangssleutels opgeslagen. Centrale CSS ongewijzigd. Bestaande klantgegevens/bestanden/templates/wijzigingen/staging behouden.

Taak crm-finance31-batch1 review/local via scripts/build-task.mjs; batches2–5 open/local. Eigen gebruikerscontrole en alle onvoltooide scope blijven open.
