> Nieuwste correctie: de dichte fase-/geldregel vervangen door drie grotere gegevens voor betaling, wachttijd met startbasis en uitvoering/levering. Geen bedrag/marge of dubbele fases in de kop; uitgebreide fasebediening via Meer. Zie [Order in één oogopslag](ORDER-IN-EEN-OOGOPSLAG.md). Bestaand Maatvoorbeeld met toestemming voor/na bekeken, Meer/disclosure open/dicht; andere betaalgevallen/mobiel/beide bedrijven blijven open. Alleen lokaal, geen automatische tests/builds of publicatie. De oudere kopbeschrijving hieronder is historie.

# Rustiger dossier: indeling verder uitgewerkt

27 oktober 2026. Philippe vindt de Exact-geïnspireerde preview nog onvoldoende uitgewerkt en vraagt verder te optimaliseren. Alleen lokaal bronwerk. De huidige CRM-preview is niet door Codex geopend, uitgelezen of visueel beoordeeld. Dit is geen claim dat het resultaat gelijk is aan Exact of door de gebruiker goedgekeurd is.

## Wat is aangepast?

- Eén samenhangende witte dossierkop met klant, ordernummer, datum en betaalstatus. Fase en bedragdetails delen een compacte contextstrook; de dubbele orderverwijzing in de broodkruimel is weg. Fases & voortgang en Bedragen & marge blijven gesloten op aanvraag beschikbaar. Openen geeft de volledige breedte aan de uitgebreide inhoud.
- Tabs blijven op één horizontaal scrollbare regel, met44pxbediening. Na de bestaande shellrerender wordt alleen de horizontale tabstrip verschoven om de actieve tab zichtbaar te houden; geen focuswissel of paginascroll door die helper. IDs, tabrollen, rovingtabindex en bestaande klik-/pijltjestoets-/Home-/Endhandlers blijven.
- De volgende hoofdactie is opgenomen bovenin het productwerkvlak. Geen apart groot actiekader. Aanvraagtekorten, legacy mailfasereview en actieve automatische-fasewaarschuwing blijven zichtbaar. Toelichting, historie en bestaande Gmailcontroles zitten onder Meer → Toelichting & historie. Menu begrensd met eigen scroll voor lange historie.
- Producten zijn regels met dunne scheiding, zonder een extra productkader binnen het werkvlak. Aantal/maten/bedrukking of materiaal/dikte/productieroute staan in gelabelde kolommen vóór de ontwerpbeelden. Verkoop/stukprijs/regelbedrag en bekende of onbekende inkoop blijven zichtbaar, exclusief btw. Geen rekenregel of vastgelegd bedrag gewijzigd.
- De dubbele productknop Bewerken is weg als producten bestaan; Order bewerken staat al in de kop. Bij geen producten blijft Product toevoegen direct beschikbaar. Ontwerp-/calculatorlink, prijs aanvullen, uploads, vergelijken en alle bestaande variant-/goedkeurings-/downloadacties blijven.
- Aanvraaggegevens, planning en klant/notities delen rechts één dossiergedeelte met scheidingen. Op smalle schermen volgt dit onder het productwerkvlak. Notities zijn direct leesbaar na het openen van Klant & notities, zonder extra binnenste uitklapper. Planning-te-laat en andere bestaande waarschuwingen blijven herkenbaar.
- Systeemlettertype bovenaan de gedeelde CSS; kleuren blijven bestaande blauw/neutraal en bronpaars. Oude vervallen productregels verwijderd, nieuwe regels bij de eigen componentregels in dezelfde stylesheet.

## Bronverdeling en onderhoud

`admin/orders/header.js` is een pure presentatiehelper en de smalle tabstriphelper; geen eigen state/factory/API. `workspace.js` composeert dezelfde live context. `overview.js` presenteert producten en dossierdetails; `sales-funnel.js` behoudt dezelfde readiness/next-keuze en data-acties. `admin/style.css` blijft de enige actieve CRM-stylesheet. Losse editor, calculator, PDF-/mailinhoud en bewaar-/financiële-/fase-/CASlogica zijn niet gewijzigd.

Concreet oud onderhoudsprobleem: drie globale `aside`-regels omvatten ook inhoudsblokken, met menuhoogte100vh, stickypositionering en scroll. Deze regels zijn nu beperkt tot `.shell>aside`, het echte hoofdmenu. Daardoor krijgt het nieuwe dossierzijgedeelte niet per ongeluk de navigatiegeometrie; ook het bestaande Analytics-signalenblok is geen hoofdmenu. Geen nieuwe reset/!important tegen zulke erfregels geplakt.

De bestaande volledige shellrender kan gesloten/open native details opnieuw opbouwen. Dit is geen nieuwe bewaarfaciliteit voor detailsvoorkeuren. Bestaande dialogen, inline drafts, form/editguards, bron-/conflictmeldingen, huidige routes en transacties blijven leidend. De header toont dezelfde financiële uitkomsten en onbekend/provisioneelbetekenis als eerder; nieuwe layout verricht geen opslag/matching of provideractie.

## Eigen beoordeling blijft open

Philippe beoordeelt desktop en mobiel voor beide bedrijven: lange klant-/productteksten, lege aanvraag en meerdere producten, bekende/onbekende en pakketprijzen, open bedrag-/fasestappen, horizontale tabs en toetsenbord, Meer/historie/Gmailconflict, aanvraag-/planning-/klant-/notitie-editor, ontbrekende gegevens en late planning. Ook ontwerpvarianten, definitieve keuze, uploads en bestaande documenten-/mail-/betalingen-/website-tabs blijven eigen controlepunten. Geen tests, checks, syntaxchecks, builds, browser-/DOMcontrole of contrastmetingen uitgevoerd. Geen echte klant-/betaal-/ontwerpdata/private config bekeken/gewijzigd, serviceherstart/tabreload, GitHubpush of publicatie. Opmaaktaak en compactoverzicht review/local; bredere werkplek doing/local. Geen volledige CSSaudit of visueel/functioneel bewijs claimen.
