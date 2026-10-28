# Aanvulling — ordercellen openen dossier, 28 oktober 2026

In de gewone Aanvragen & orders-tabel opent een primaire klik op een gewone cel dezelfde order als de bestaande dossierlink. Ook bij filteren/sorteren/opnieuw renderen. admin/orders/list-navigation.js is één bij opstart geïnstalleerde gedelegeerde featurehandler; volgt de actuele echte a.order-list-link via click(), zodat dezelfde bestaande link-/routebediening gebruikt wordt. Geen eigen hash-/dossierkopie of businesswrites. orderListMarkup blijft presentatie en table-guides blijft uitsluitend aanwijzen.

Eigen links, knoppen, invoer, labels, details/summary, contenteditable en interactieve rollen worden niet overgenomen. Prijs & inkoop en de inkooplink blijven dus eigen acties. Niet-primaire/modifierklikken, al afgehandelde/busy/inert-events en actieve tekstselectie worden overgeslagen. De bestaande echte dossierlink blijft de toetsenbord-/nieuw-tabroute; geen extra tabindex/rol op tabelrijen. Alleen gewone primaire celklik uitgebreid. Centrale pointer bij echte orderrijen; zebra/kruis/hover behouden. Prijsvergelijkingskaarten en andere tabellen ongewijzigd.

Lokaal bronwerk voor beide bedrijven. Eigen controle open: alle vijf cellen, filter/sort/lege lijst, tekstselectie, muis/touch/keyboard, faseacties/labels, details/inkooplink, modifiers/middelklik en gewone ordernavigatie. Geen tests/checks/syntaxchecks/builds/browser-/DOMcontrole, klantdata-/provideractie, herstart/tabreload, GitHubpush of publicatie. Bouwlog via scripts/build-task.mjs, review/local; opgeslagen gebruikersstatus/feedback/data behouden.

# Duidelijke rijen, kolommen en keuzes — 28 oktober 2026

Philippe vraagt meer zebra-afwisseling en een kruis van de actieve rij/kolom om gegevens beter te kunnen volgen. Dit verfijnt de bestaande blauw/neutrale CRM-indeling; geen terugkeer naar een algemeen groen spreadsheetthema. Paars blijft uitsluitend herkomst. Nieuwe opdracht: voorlopig niets naar GitHub pushen, geen livepublicatie.

## Gedeelde presentatie

De bestaande sheet-alt- en row-hover-tokens in het enige :root-blok hebben een beter zichtbare lichte grijze en blauwe waarde. Tabellen, klant-/takenlijsten, mailregister en bestaande dropdown-/zoekresultaatrijen gebruiken die centrale basis. Hele rijen reageren op hover en focus binnen de rij. Geselecteerde mail blijft afzonderlijk herkenbaar; bron-/statusmarkeringen behouden hun eigen betekenis.

workspace/table-guides.js installeert eenmalig gedelegeerde pointer-/focushandlers via de bestaande workspace-installatie. Alleen tijdelijke klassen op bestaande UI-cellen/rijen: rij, bijbehorende logische kolom inclusief kop en actueel veld met duidelijke binnenrand. Geen waarden/focus/sortering/selectie/records wijzigen, geen preventDefault of extra klikactie, geen opslag/providerpoll. Tast-/toetsenbordfocus werkt zonder afhankelijke muishover. Verlaten van tabel/window wist de pointermarkering; terugkeer gebruikt werkelijke focus. Nieuwe shellrenders stapelen geen handlers op.

Kolomposities houden rekening met colSpan en rowSpan per rijgroep. Een samengevoegde actieve cel kiest niet willekeurig één kolom. Op klein scherm (bestaande gestapelde tabelindeling) alleen rij/celmarkering; een kolomlijn zou daar misleidend zijn. Documentinhoud/mailinhoud/contenteditable en expliciete data-table-guides=off uitgesloten. In dialogs alleen UI-tabellen binnen tablewrap meenemen. Geen styling of wijziging van de gegenereerde pakbon/PDF/Word/mailinhoud.

Gewone select-elementen blijven native: duidelijk focuskader, afwisseling en geselecteerde optie waar het platform dit ondersteunt. De browser/het besturingssysteem kan de popupkleuren zelf bepalen. Geen tweede custom dropdown, gewijzigde keyboardbediening of fictieve tabelkolommen in een éénkolomskeuzelijst.

## Pakbon en controle

Philippe stuurt later zelf een nieuwe Word-template. Huidige pakbontemplate/generator/bestaande bestanden nu ongewijzigd; geen eigen vervangend ontwerp verzinnen. De templateverwerking blijft open totdat dat bestand beschikbaar is.

Alleen bronlezing/bewerking en bouwadministratie; geen automatische tests/checks/syntaxchecks/builds, browser-/DOMcontrole, contrastmeting, template-/PDF-render, provider-/data-/mail-/betaal-/pushactie, herstart, GitHubupload of livepublicatie. Klantgegevens/IDs/bedrijven/CAS/voorkeuren/bestaande wijzigingen/gebruikersstatus/feedback behouden. Eigen controle beide bedrijven/desktop/mobiel/toetsenbord, sorteren/filteren/opnieuw geschilderde tabellen, samengevoegde cellen, selected/disabled/bronmarkering, menu-/selectgedrag en open invoer blijft open.
