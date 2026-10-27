# Vervolg open punten uit batch3 en4 — 27 oktober 2026

Opdracht: doorgaand bouwen aan de nog open fixes. Bronwerk gestart26oktober, voortgezet27oktober in tijdzone Asia/Makassar. De gebruiker koos Google Maps en gaf aan dat adressen naar de routedienst mogen. Geen toestemming voor publicatie, tests of betaalde Google-activering afleiden uit die keuze.

Alleen lokale bronwijzigingen. Geen tests, checks, syntaxchecks, builds, browser-QA, proefontwerpen/-documenten, echte route-/mail-/Gmail-/betaalacties, GitHubpush of publicatie. Bestaande klant-/order-/ontwerpbestanden, bedragen, historie, bedrijfsafscheiding en opgeslagen gebruikersstatus behouden. Geen actuele online bouwlog/feedback uitgelezen of feedback afgehandeld gemarkeerd.

## Automatische productievrijgave bij de afgesproken aanbetaling

Spatlappen krijgt nu vanzelf de fase Productie vrijgegeven zodra de afgesproken aanbetaling is ontvangen (standaard50%), product-/verzendprijzen bekend zijn, specificaties compleet zijn en de actuele ontwerpkeuze akkoord is. Onbekende verzendprijs is ook bij oude records geen expliciet gratis verzending. De berekende fase loopt via dezelfde gedeelde salesFunnel naar voortgang, werkvoorraad en vervolgstappen; rendering schrijft geen orderdatum, betaling of fysieke uitvoering. Bestaande orders die al aan alle voorwaarden voldoen kunnen daardoor na het laden meteen als vrijgegeven verschijnen, zonder gegevensmigratie.

Na een betaalcorrectie, andere productmaat of vervallen ontwerpgoedkeuring kan de automatische vrijgave weer wegvallen. Bestaande handmatig geregistreerde historie wordt niet gewist; ongeldige actuele voorwaarden krijgen hulp. Gratis teststukken houden een bewuste eigen vrijgaveroute. Maatwerkkunststof behoudt zijn eigen fasecontract en krijgt geen Spatlappen-vrijgave. Gewone oude Gmail-/handmatige fasebasissen blijven ongewijzigd zolang geen nieuwe automatische workflowvoorwaarde aanwezig is.

Het aanbetalingspercentage kan apart worden aangepast zonder een fictieve vrijgavedatum te registreren. Een afwijkend bedrag op de laatste betaallink blijft zichtbaar. Een werkelijke productiestart mag na de geldige automatische vrijgave worden geregistreerd; de extra verplichte vrijgaveklik vervalt. Bestellen, productiestart, verzending en aflevering blijven echte afzonderlijke handelingen.

## Document gereed en wachten op betaling

Bij Spatlappen zetten een bestaande orderbevestiging-PDF en een bruikbare aangemaakte betaallink de voorbereidende fase op Wacht op betaling als nog geld openstaat. Een berekende fase voegt geen verzenddatum, SMTP-resultaat of communicatiebewijs toe. Een aanwezige factuur-PDF voldoet aan de factuurstap in de Spatlappen-werkvoorraad; er blijft niet uitsluitend door ontbrekende verzendregistratie een dwingende Factuur mailen-taak terugkomen. Mailen en externe verzending registreren blijven bereikbaar. Maat behoudt zijn bestaande document-/verzendvoorwaarden.

## SVG-kleursegmenten met vectorberekeningen

De oude begrenzingsvak-groepering is vervangen door de lokaal gebundelde Paper.js0.12.18. Alleen een bewuste klik op Losse eilanden herkennen laadt die bibliotheek. Het logo gaat niet naar een externe dienst en wordt niet naar pixels overgetekend. Gevulde paden worden via vectorgebiedbewerkingen opgesplitst; kruisingen en de nonzero/evenodd-vulregel worden verwerkt. Gaten horen bij hun kleinste omsluitende buitencontour, een gevuld eiland binnen een gat kan een apart segment worden. Overlappende kaders zijn geen reden meer om losliggende vormen samen te houden.

Opeenvolgende ondoorzichtige vormen met dezelfde kleur en dezelfde ouderlaag kunnen verenigd worden, zodat één verbonden kleurdeel ook over meerdere oorspronkelijke paden bewerkbaar wordt. Er worden geen vormen over anders gekleurde tussenlagen heen verplaatst. Transparante vormen worden afzonderlijk opgesplitst met hun verf-/alpha-instellingen behouden, niet met andere transparante objecten verenigd. Bestaande transformaties worden in de nieuwe vectorcoördinaten verwerkt; spatlap-/logokader blijft gelijk. Eén undo en de oorspronkelijke logoback-up blijven beschikbaar. Ander geselecteerd logo of gewijzigde bron/spatlap tijdens verwerking wordt geweigerd.

Ondersteunde invoer is gesloten/impliciet gesloten gevulde vectorgeometrie. Lijnen, verlopen, clip-uitsnedes en geneste SVG-tekenvlakken worden niet ongemerkt naar onbetrouwbare segmenten omgezet. Andere gekleurde tussenlagen worden niet herschikt. Max512brononderdelen,1500curves per bronvorm,6000in totaal en10000uitkomstcurves; meer dan512segmenten weigeren. Booleaanse vectoroperaties gebruiken eindige numerieke precisie en kunnen boogcommando’s naar Béziercurves omzetten. Geen claim van byte-identieke paden, onbeperkte Illustrator-compatibiliteit of fysiek bewezen drukcontouren.

Een tweede bronfout is hersteld: pijltjestoetsen voor een los SVG-deel volgen nu de zichtbare schermrichting bij een gedraaid/gespiegeld logo, gelijk aan slepen.

## Optioneel leren van bewaarde plaatsingen

Onder Plaatsing staat Leren van bewaarde plaatsingen, standaard uit. Na aanzetten wordt uitsluitend na een geslaagde ontwerp-save een geometriepatroon bijgewerkt: maat, vorm, typen/aantallen, posities, formaten, kwartslag/spiegeling, gebruiksteller en tijd. Geen tekstinhoud, fontbytes, logo’s, klant-/order-/documentIDs of prijzen. Geen leren bij iedere sleepbeweging en geen leren na een geweigerde save. Alleen browservoorkeuren, geen centrale zakelijke store.

Max20geleerde patronen; veelgebruikte en recente patronen krijgen voorrang. Zelfde vorm en typen/aantallen, verhouding binnen5%; plaatsing schaalt naar de huidige maat, huidige logo-aspectratio blijft behouden. Onpassende logoformaten weigeren. Een voorstel wordt pas na bevestiging toegepast met één undo; inhoud/font/kleur blijven gelijk. Uitzetten en wissen staan erbij; benoemde handmatige indelingen zijn een aparte lijst en blijven behouden. Als uitzetten niet kan worden opgeslagen, stopt leren in elk geval in dit tabblad met uitleg. Onleesbare leergegevens kunnen via expliciet wissen/resetten worden hersteld zonder ontwerpen of benoemde voorkeuren te wissen. Tekst kan door andere inhoud optisch meer ruimte vragen: zichtbare pasvorm door Philippe controleren.

## Google Maps-routeberekening en kosten

De routeplanner bij beide bedrijven heeft een aparte gesloten Google Maps-sectie. Op een bewuste Berekenen-klik worden het vertrekadres en1–25gekozen afleveradressen naar de vaste Google Routes API gestuurd. De bestaande Maps-routelinks blijven beschikbaar. Zonder koppeling opent de invulhulp bij dezelfde route; API-sleutel blijft alleen in het bestaande beveiligde serverpad. Het configuratieformulier behoudt zijn eigen DOM en invoer bij filterheropbouw, fouten en conflicten; geen sleutel in browseropslag of publieke bron.

Afstand, rijtijd zonder actuele verkeersdrukte, optionele terugrit en een optioneel gunstiger stopvolgordevoorstel. Bij een enkele reis blijft het laatste gekozen adres het eindpunt. Volgorde alleen bewust toepassen; onbekende/ongeschikte/verborgen stops worden niet stil meegerekend. Gewijzigde selectie/gegevens tijdens ophalen maakt het resultaat ongeldig. Geen automatische achtergrondpolling, routeboekingen of leverregistraties. Laad-/losbeperkingen, verkeer en tijdvensters zijn niet in deze basis verwerkt; geen wiskundig optimale volledige bezorgplanning claimen.

Aflevertijd per gekozen order is een eigen invulwaarde, niet geraden. Na invullen kunnen kilometers en rij-/aflevertijd bewust naar de bestaande kostenvergelijking worden overgenomen; bestaande waarden vervangen vraagt bevestiging en eigen tarieven/pakketkosten blijven staan. Zonder aflevertijd toont het CRM wel de opgehaalde wegafstand/rijtijd, maar vult het geen fictieve totale werktijd in.

Serveradapter gedeeld door cloudflare/google-routes.js en assistant/google-routes.mjs. Alleen vaste HTTPS-host, redirect niet volgen,25seconden timeout, begrensde invoer en gevalideerde uitkomst/permutatie. Sleutelconfiguratie met versiecontrole; cloud versleuteld in bestaande integrationStore, lokaal in afgeschermde bestanden per bedrijf. Geen nieuwe migratie, Gmail-/Google-accountscope of klantdatabase. Services zijn in deze ronde niet herstart; voor lokaal gebruik de nieuwe servercode laden. Online vereist later een expliciete publicatie.

**Nog nodig voor echte berekening:** een eigen Google-project met Routes API en API-sleutel. Google vereist een sleutel en gekoppelde facturering; volgordeoptimalisatie kan duurder zijn dan een gewone route. Er is geen Google-project, abonnement, budget, sleutel of API in deze ronde geactiveerd. De aanwezigheid van nieuwe code is geen bewezen verbinding.

## Bronnen en dependency

- [Google Routes: routeaanvraag](https://developers.google.com/maps/documentation/routes/compute_route_directions) en [API-inrichting](https://developers.google.com/maps/documentation/routes/get-api-key).
- [Google Routes: stopvolgorde](https://developers.google.com/maps/documentation/routes/opt-way): indexpermutatie en hogere prijs van optimalisatie.
- [Paper.js PathItem](https://paperjs.org/reference/pathitem/) voor booleaanse vectoroperaties. Vaste distributie uit https://registry.npmjs.org/paper/-/paper-0.12.18.tgz; MIT-licentie lokaal in admin/designs/vendor/LICENSE.paper.txt en copyrightheader behouden. Alleen uitgepakt/bron gelezen, geen npm-installatie, lifecycle, build of uitvoering van de bibliotheek.

## Controle door Philippe en open grenzen

Deze scenario’s zijn niet uitgevoerd:49/50%-grens, eigen percentage, gratis teststuk, prijs/ontwerpwijziging en betaalcorrectie; Wacht op betaling na document/link en aanwezige factuur zonder verzendclaim; SVG met gaten, eiland-in-gat, overlappende kaders, kruisingen, naastliggende paden, alpha, rotatie/spiegeling, undo/bewaren/export; leren aan/uit, mislukte save, heropenen, vergelijkbare maat, afwijkende logo-aspectratio en reset; Google-keyopslaan/conflict/fout, retour/eenrichtingsroute, laat resultaat, volgordevoorstel, geen aflevertijd en kostenovername/annuleren bij beide bedrijven.

Google-activering/sleutel, gebruikerscontrole en fysieke uitvoer/drukcontrole blijven open. Willekeurige SVG-effecten blijven buiten de ondersteunde invoer en verborgen materiaal-/bewerkingskosten vereisen echte aanvullende gegevens. De eerdere brede labels complexe segmentatie/automatisch leren/automatische vrijgave/routeafstand niet gebouwd zijn voor de hierboven beschreven scope achterhaald. Niet automatisch alle47meldingen als opgelost markeren.
