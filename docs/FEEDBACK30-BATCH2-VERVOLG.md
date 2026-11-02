# Batch 2 verder uitgewerkt — 30 oktober 2026, lokaal

Gebruiker vraagt batch2: Websitegebruik en financiële cijfers. Nieuwste overdracht, twee vaste privéfeedbacktags en bestaande bron vergeleken. Batch1vervolg, overige batches, invoer-btw, Kunststofbaas/pakbonreferentie, templates, klantgegevens/bestanden en bestaande Git-werkkopie/index behouden.

## Dagreeksen daadwerkelijk kiezen

Vergelijking heeft afzonderlijke keuzes voor bezoeken, scroll75, begonnen, verzendpoging en exact ontvangen formulier. Zelfde aantalschaal, eigen kleur, legenda en dagtabel. Zonder selectie een gerichte instructie; geen fout/lege actie. Een gewone kaartklik verlaat de vergelijking en toont de gevraagde enkele meetwaarde. Selectie alleen in schermgeheugen, geen zakelijke opslag of nieuwe tracking.

Ontbrekende dagrijen worden nu ook ná de eerste gemeten dag onbekend gehouden. Een eerste bezoek bewijst geen doorlopende meetdekking. Geobserveerde bezoekrijen met nul formulierstappen blijven wel echte geregistreerde nullen. Zonder bezoekrij geen nulbezoeken/actieve tijd/conversie verzinnen. Reeksen lopen niet door onbekende dagen heen. Een ontvangen-aanvraagrij zonder bezoekrij kan apart een bekend aanvraaggetal tonen. Bij een gemeten bezoekdag zonder aanvraagrij betekent nul: geen geregistreerde aanvragen op die dag, niet alle ongemeten bezoekers kennen. Oudere backend zonder vereiste dagkolom blijft expliciet niet beschikbaar. Eerste/laatste rolling dag kunnen onvolledig zijn.

Bestaande periode/pagina/uitsluiting/abort-/revisiebewaking en vorige rapportweergave bij fetchfout blijven. Lokale onbereikbaarheid krijgt uitleg plus een handmatig te openen link naar het juiste live bedrijfs-CRM; geen automatische productie-/accountfetch of kopie van live bezoekdata in browseropslag. Lokale CRM-aanvragen blijven een afzonderlijke bron.

## Verkoop, kasstroom, verwachtingen

shared/financial-sales-scope.js is de gedeelde pure ontvangstselectie voor beide bedrijven. Alleen huidige geldige, positieve geregistreerde ontvangsten tot en met vandaag bewijzen betaling/aanbetaling. Quote, factuur, betaallink of fase telt niet als ontvangst. Ongeldige centbedragen/kalenderdatums/toekomstige ontvangsten komen bij Ontvangsten controleren; die dossiers worden niet stil als verkoop of onbetaalde offerte geboekt. De bestaande records worden niet aangepast. Werkelijk ontvangen geld telt alleen geldige ontvangsten binnen de ontvangstdatumperiode; bij problemen heet de kaart expliciet Geldige ontvangsten.

Verkoop/marge/grafiek/klant-/materiaaloverzicht gebruiken hetzelfde geselecteerde ordercohort op orderdatum, inclusief archief. Het is de volledige orderwaarde excl. btw zodra een geldige ontvangst bestaat, niet alleen het aanbetaalde bedrag en geen fiscale factuuromzet. De jaarlijkse periode eindigt vandaag. Ontvangen geld blijft incl. btw op ontvangstdatum, onafhankelijk van orderdatum. Er is geen margepercentage zonder positieve verkoopbasis. Onbetaalde aanvragen/offertes met bekende/onbekende prijs staan apart.

Het historische saldovak over alle prijsafspraken is nu benoemd als Verwachte klantbedragen, inclusief offertes zonder ontvangst; geen factuurdebiteurenlijst. Geen bedragen, betalingsregels, btw, inkoopkosten of fiscale boekingen opnieuw gedefinieerd. Producttabeluitleg noemt het werkelijk getoonde betaalde ordercohort; aantallen zijn geregistreerd, geen geleverd-/fiscale-omzetclaim.

## Maatwebsite: eigen meetkoppeling in bron voorbereid

De lokale Maatwebsitebron staat apart van dit CRM. Nieuwe ingest/SDK/schema en de bestaande offerte-/consent-/publieke HTML-bron lokaal uitgebreid, behoud van bestaande wijzigingen. Volledige technische vindplaatsen en activeringsgrenzen: [MAAT-WEBSITEGEBRUIK](MAAT-WEBSITEGEBRUIK.md). De gedeelde CRM-rapportcode blijft voor beide bedrijven; geen tweede CRM of Spatdata als Maatbron. De Spatlappen-websitebron is alleen als bestaand contract gelezen en niet gewijzigd.

Nieuwe Maat-API accepteert alleen vaste sitepagina’s/categorieën/numerieke tellers, same-origin, beperkt berichtvolume/omvang, productiehost en alle expliciete configuratievlaggen. Eén willekeurig bezoeknummer per pagina in geheugen; geen vaste bezoekeridentiteit, input-/bestandsnamen of raw URL’s in de meetdatabase. Actieve tijd stopt bij achtergrond/idle; scroll/formulier-/klik-/foutcategorieën passen bij het bestaande CRM-rapport. Nieuwe expliciete crmUsage-keuze: een oude GA4-acceptatie start deze meting niet. Weigeren/intrekken/andere tab/GPC stopt toekomstige bezoekwrites. Bestaande formulier- en GA4-route blijven bruikbaar. Instellingen na gemaakte keuze bereikbaar, HTML-toelichting/privacytekst bijgewerkt.

Alleen succesvolle bestaande interne Resend-acceptatie levert een ontvangen-aanvraagrecord. Aanvraag-ID in interne tekst/HTML sluit aan op bestaande gedeelde CRM-herkenning. Alleen met passende nieuwe toestemming het exacte bezoeknummer koppelen; zonder toestemming alleen geaccepteerde aanvraag tellen. Honeypot/validatiefout/mislukte mail geen ontvangen registratie. Meet-/opruimfout maakt een al geaccepteerde aanvraag niet onterecht mislukt. Geen echte mailaanvraag uitgevoerd. Uploadgrenzen, bestanden, ontvangers en optionele klantbevestiging behouden.

Voor wijziging bronkopieën privé in work/feedback-20261030/website-before-batch2. Geen credentials geopend of gewijzigd, geen database/schema aangemaakt/toegepast, geen gebouwd _site vervangen. De laatste bekende Maatconfig miste eigen binding/sitekenmerk; liveconfig is nu niet opnieuw opgehaald. Read-only GitHubrepositorymetadata toont een oudere push dan de gebruikte lokale websitebron; dit bewijst geen actuele productiebron. Voor publiceren eerst actuele website-/Cloudflarebron vergelijken en alle bestaande wijzigingen behouden.

## Wat nog openstaat

- Eigen Maat-meetdatabase kiezen/maken en uitsluitend daar het schema toepassen.
- Website én Maat-CRM aan dezelfde eigen meetdatabase binden, bedrijfs-/sitevlaggen expliciet activeren; nooit de Spatlappen- of CRM-businessdatabase gebruiken.
- Afzonderlijke website- en CRM-publicatie na expliciete opdracht. Bestaande secrets/bindings/beheerkeuzes behouden.
- Philippecontrole van grafiekkeuzes/ontbrekende dagen/focus/kleinscherm, juiste ontvangstcohorten/datums/bedragen en beide bedrijven. Meting/nieuwe toestemming/afwijzen/intrekken/andere tab/uitsluiting, formulierfouten/werkelijk ontvangen aanvraag/CRM-IDkoppeling zijn nog niet functioneel of live beoordeeld. Echte aanvragen/providerproeven alleen na expliciete toestemming.

## Administratie en grenzen

feedback30-batch2 blijft doing/local wegens ontbrekende echte meetinrichting/activering en publicatie. Twee bestaande privédevelopmenttags aangevuld, gebruikersstatus/afhandeling onveranderd; Maatmeetaansluiting is daarnaast een expliciete gebruikersopdracht zonder verzonnen Melding-ID. Append-only bronnotitie via scripts/build-task.mjs opgeslagen en teruggelezen. Catalogus/documentatie/cacheketen feedback30-batch2 bijgewerkt zonder generator. Geen wijzigingen aan klant-/order-/betaal-/documentgegevens of bestaande bestanden door de bouwer.

Alleen bron-/SQL-/HTML-/documentvergelijking en bewerking, GitHubmetadata read-only, privéfeedback-/bouwadministratie. Geen tests/checks/syntaxchecks/builds/Functionscompile/browser-/DOM-/visuele QA/HTTP-/meet-/formulier-/mail-/betaalproef, runtimeherstart, migratie, databaseaanmaak, account-/secretactivering, Gitwijziging/GitHubupload of publicatie. Brongebouwd is geen foutloosheidsclaim; Websitegebruik voor Maat is nog niet bewezen live hersteld.
