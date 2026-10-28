> Correctie28oktober: desktop inklappen had CSSconflict: de latere .shell>aside>nav-displayregel overschreef de eerdere verborgen navigatie. Eén geconsolideerde .shell.sidebar-collapsed-eigenaar, directe nav/kop/voet expliciet verborgen, intrinsieke eerste gridrij en begrensde compacte balk. Geen mail-/formulierherbouw, nieuwe JS of voorkeurswijziging. Mobiele menucontroller/breakpoint behouden. Alleen lokaal, geen tests/checks/build/browsercontrole/GitHubpush/publicatie; eigen controle open.

> Nieuw28oktober: beter zichtbare zebra en hele-rijhover/focus; gedeelde tijdelijke rij-/kolom-/celmarkering voor CRM-tabellen, native keuzelijsten/menu-/zoekkeuzes duidelijker. CSS uitsluitend centraal, bestaand blauw/neutraal en bronpaars behouden. Geen algemene Excelterugkeer of documentinhoud wijzigen. Voorlopig geen GitHubpush; gebruiker levert later zelf nieuwe Word-pakbontemplate, huidige pakbon behouden. Zie docs/TABEL-BEDIENING.md. Bron lokaal, geen tests/build/browsercontrole/publicatie; eigen controle open.

> Nieuwste algemene ronde27oktober: workspace/key-facts.js en de centrale workspace-key-facts/dossier-header-regels worden gedeeld door de werkplekken. Eén metricfont-token, ruimere rijen/koppen/oppervlakken en rustigere bestaande cijfergroepen. Geen extra sheet of gedateerde override. Tabonthulling via workspace/tab-visibility.js; zie [Rustige werkplek](RUSTIGE-WERKPLEK.md). Lokaal, gebruikerscontrole open.

> Nieuwste dossierkop27oktober: bestaande eigenaarsblok in admin/style.css herwerkt naar order-key-facts met drie leesbare gegevens en mobiele gelabelde rijen. Oude context-/geldregelregels verwijderd; fasegegevens alleen via Meer. Geen extra stylesheet of gedateerde overrides. Zie [Order in één oogopslag](ORDER-IN-EEN-OOGOPSLAG.md); beperkte toegestane Maatpreviewbeoordeling, geen brede QA/automatische tests/builds/publicatie.

> Vervolg27oktober: opmaakbatches2–4 nu brongebouwd/review lokaal. Aanvraagtekorten direct aanvullen, varianten/finale duidelijker, rustigere lijsten/bedragen/filters en mail/documentacties; centrale CSS-eigenaren, geen extra sheet. Alleen Maatwerkkunststof: aangeleverde voorwaarden bij order en mail, nooit automatisch meesturen. Zie [Batches2–4](BATCHES2-4-OPMAAK-20261027.md) en [Voorwaarden](ALGEMENE-VOORWAARDEN-BIJ-ORDER.md). Eigen beoordeling open; geen tests/checks/build/browser-/DOMcontrole/publicatie. Oudere geplande stand hieronder is historie.

> Opmaakbatch1,27oktober: centrale type/spacing/controlbasis, begrensde hoofdnavigatie, compacter gegroepeerde bovenbalk en één native Meer-menucontroller/-stijl. Batches2–4 gepland; huidige batch bronreview/local, geen tests/browsercontrole/publicatie. Zie [Vier opmaakbatches](VIER-OPMAAKBATCHES-20261027.md).

> Vervolg27oktober: dossier-/productregels bij bestaande eigenaren aangepast, oude simple-product(-values)-basisregels verwijderd. Menustijlen nooit op alle aside-elementen: uitsluitend .shell>aside voor navigatiegeometrie. De dossierkop en het aanvullende zijgedeelte zijn eigen oppervlakken. Systeemfont en bestaande kleur-/bronvariabelen, geen extra themalaag. Zie [Dossierindeling](DOSSIER-INDELING-20261027.md); alleen bron, eigen controle open.

# Gedeelde CRM-opmaak

Laatste gebruikersafspraak27oktober2026: houd gedeelde CSS op één centrale plek en voorkom aparte visuele oplossingen per scherm. Alleen lokaal bronwerk; geen tests/checks/builds/browsercontrole uitgevoerd. Philippe beoordeelt zelf.

## Eén actieve ingang

admin/index.html laadt uitsluitend admin/style.css. De bestaande mailopmaak is daarin opgenomen ná de eerdere hoofdregels, in dezelfde cascadevolgorde als de twee eerdere stylesheets. Geen CSS-importketen of buildstap nodig. admin/mail/mail.css blijft een leeg compatibiliteitspad, zoals workspace/workspace.css, search/search.css en analytics/analytics.css. Geen nieuwe regels in die stubs. De eerdere expliciete mailuitzondering is hiermee vervangen door de nieuwe centralisatieopdracht.

Losse ontwerptool, calculator, offline noodwerkplek, login en werkelijk gegenereerde mail-/PDF-inhoud blijven eigen oppervlakken. Hun data-/canvas-/documentkleuren zijn geen CRM-thema. Geen credentials of dossierinhoud in stijlvoorkeuren.

## Waar wijzigen?

| Gewenste wijziging | Eigenaar |
|---|---|
| Algemene tekst, vlakken, lijsten, selectie, formulier-/knopranden en hoeken | Eén :root-blok bovenaan admin/style.css |
| Lichtpaars automatisch en donkerpaars AI/interpretatie | De source-variabelen bovenaan en het gedeelde bronmarkeringsblok; uitleg HERKOMST.md |
| Gewone knoppen, invoer, focus/hover/disabled | Gedeelde controls in dezelfde stylesheet; gebruik bestaande klassen/states |
| Zijbalk, tabs, werkvlakken, tabellen | Gedeelde shell/surface/listregels in dezelfde stylesheet |
| Inklapbare compacte dossierdetails | Herbruikbare dossier-details-regels; onderdelen voegen alleen benodigde indeling toe |
| Meldingen voor mail/aanvragen en fases | Eén gedeeld workspace-notifications-blok met responsieve actie-indeling, bestaande knop-/kleurvariabelen; mail-notifications-selector alleen compatibiliteit |
| Vrijdagrapporten en daggrafiekvergelijking | Bestaande analyticsgrafiek/table-controls plus afgebakende weekly-regels in admin/style.css; blauw/grijs, geen losse stylesheet |
| Mailregister, composer, bijlagedialoog | Afgebakende mailselectors in dezelfde stylesheet, geen algemene tweede knoppen-/kleurenbasis |
| Dynamische breedte/positie bij werkelijke bedragen of documentzoom | Waarde vanuit JS toegestaan; vaste presentatie blijft in CSS |

Gebruik bestaande variabelen voor primaire tekst/achtergrond, hover, geselecteerde rij/filter, tabelscheidingen, disabled/readonly en randen. Radius-control en radius-surface zijn apart benoemd, zodat invoer en werkvlakken later gericht kunnen worden aangepast. Geen generieke kleuren via inline style toevoegen. Twee vaste AI-importpromptvelden delen nu ai-import-prompt in plaats van losse inline hoogtes (beide160px).

## Opschoning en grenzen

Vier verspreide :root-definities samengevoegd tot één actuele definitie. Gedeelde lettertype-/kleur-/radiusinstellingen bovenaan; veelgebruikte huidige kleurwaarden vervangen door gelijkwaardige variabelen. Identieke eerdere declaraties onder exact dezelfde selector en voorwaarden verwijderd. Geen verwijderen van andere-valuefallbacks, mediaquery’s of keyframes. Voor gewone knoppen/invoer/labels ook aantoonbaar door latere gemeenschappelijke regels vervangen eigenschappen opgeruimd. Opmaak uit de dichtgeschreven regels uitgeschreven voor bronleesbaarheid.

De volgorde van component-/responsive-regels blijft behouden; mediaregels niet globaal gesorteerd en specificity niet met layers/reset/extra !important veranderd. Er bestaan nog oudere componentuitzonderingen met verschillende selectors. Die zijn niet blind samengevoegd: een andere selector of breakpoint kan werkelijk een andere toestand bedienen. Dit is centralisatie van de actieve ingang, thema en gedeelde basis; geen claim dat iedere historische CSS-uitzondering of schermcombinatie conflictvrij is. Pas voortaan de bestaande eigenaarsregel aan, geen nieuwe gedateerde themalaag onderaan toevoegen.

Alleen bronbewerkingsscript gebruikt, niet als syntax-/functionele controle. Geen dependency geïnstalleerd, tests/checks/builds, browser-/DOMuitlezing of publicatie. Eigen controle bij beide bedrijven: menu/tabs, formulieren, hover/focus/disabled/readonly, herkomstkleuren, mail/Meer/bijlagen, lange waarden en mobiel. Oude bestanden/klantgegevens/ontwerpen en bedrijf-/CASgrenzen behouden.
