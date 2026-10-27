# Formuliermail herkennen en klantvelden uitlezen — 26 oktober 2026

Philippe levert één Spatlappen-formuliermail aan met juiste afzender/onderwerp, Naam/E-mail/Telefoon en een hoofdproduct plus bevestigingsset. Aan is nader bevestigd als de al toegestane Spatlappen-Gmailontvanger. De precieze fout kan dus niet aan dat adres worden toegeschreven. Geen echte Gmail-/CRMdata opgehaald, oorspronkelijke MIME niet beschikbaar, geen klantrecord of order aangepast.

Gevonden ontbrekende ondersteuning: gmailMessage gaf MIME-gecodeerde onderwerpregels door zonder RFC2047-decodering; prefixherkenning kan daardoor mislukken terwijl Gmail hetzelfde onderwerp leesbaar toont. decodeMailHeader ondersteunt B/Q, charset via TextDecoder, gevouwen aangrenzende woorden en verwijdert CR/LF/NUL uit resultaat. Ongeldige codering blijft passieve tekst en kan niet als instructie of HTML uitvoeren. Gmailadapter en candidateherkenning decoderen; dubbele decodering werkt alleen op nog aanwezige encoded words. Geen actor-/authheader of scope gewijzigd.

inquiryText ondersteunt oude gemengde echte en geserialiseerde regeleinden pas bij meerdere expliciete veldgrenzen. Leeg plain MIME laat HTMLfallback toe. Handmatige recognizeRequest gebruikt voor bekende formulierafzender/onderwerp dezelfde parseFormInquiry-klantvelden, ook als een ander controlepunt auto-intake blokkeert. Formuliersender wordt dan niet als klant-e-mail/naam gebruikt. Kandidaatselectie in gesprek en verklaring voor ontvangerblokkade zichtbaar; strikte isFormInquiry en alle DKIM/ontvanger/datum/opt-in/dedup/CAS-grenzen blijven voor automatische verwerking. Geen auto-aanmaak op alleen een kandidaat. Verschillende producten/aantallen blijven voor bewuste review; geen extra productregels of aantallen gegokt. Bestaande dossiers niet stil herschrijven.

Dit verhelpt aantoonbare bronkwetsbaarheden, maar is geen bevestigde diagnose van de exacte MIME/opslag van het aangeleverde echte bericht. Geen tests, syntaxchecks, browser-QA, controlebuilds of providerproeven uitgevoerd; Philippe controleert zelf.

## Websitefooter

De writerwijziging van23oktober stond lokaal, nog niet gepubliceerd. De CRM-headerlezer is al onderdeel van de vorige releases; alleen CRM publiceren verwijdert geen footer in website-uitgaande meldingen. Nieuwe websitekandidaat work/form-intake-release-20261026/website is gebaseerd op de bekende live17oktoberrelease42ddc1a7-8198-4979-9c3b-7a19ce9ed9bd. Alleen contactfunctie plus inquiry-metadata-helper aanpassen: HTML/plain zonder Herkomst/Aanvraag-ID, echte regeleinden, metadata in X-CRM-headers; server-side meettoestemming/interne test gate. Gewone afzender/ontvanger/Reply-To/bijlagen en dezelfde lead-ID behouden. Publieke assets/collector blijven uit diezelfde release; geen nieuwere volledige websitecheckout met onuitgebracht werk eroverheen zetten.

scripts/publish-form-intake.mjs maakt alleen plan zonder vlag. --inspect leest nieuwe productieconfig/IDs; --apply publiceert CRM-readers eerst en websitewriter alleen als huidige websitedeployment nog exact die bekende basis is, inclusief tweede guard onmiddellijk vóór upload. Bij andere/nieuwere website niet overschrijven; CRM-herstel kan wel uitgeleverd worden en website blijft duidelijk geblokkeerd voor afstemming. Secrets en bestaande DB/R2/bindingen/cron blijven behouden, geen migratie of echt formulierverzoek. Oude al ontvangen mails krijgen geen nieuwe body; verwijder zichtbaar technisch citaat bewust bij antwoorden indien nodig.

Vóór live publicatie expliciete toestemming nodig op grond van AGENTS.md; deze bronfase publiceert niets. Werkelijke uitvoerstatus bovenaan OVERDRACHT.md en bronlog. Geen website- of CRMherstel als al werkend/live claimen zonder uitvoerbewijs en eigen gebruikerscontrole.

## Publicatie-uitkomst

26 oktober: beide CRM-readers gepubliceerd als crm-form-intake-20261026. Website bewust niet gepubliceerd: actuele basis <deployment-id> wijkt af. Footerwijziging moet in actuele websitebron worden overgenomen; niet terugrollen naar de oude kandidaat. Uitvoerbewijs work/form-intake-release-20261026/publication.json. Gebruikerscontrole blijft open.

## Websiteblokkade opgeheven

Actueel cookiebar-releasepakket18oktober teruggevonden; dezelfde publieke assets behouden en uitsluitend contactwriter/helper vervangen. Website gepubliceerd op https://262c97db.spatlappen-op-maat.pages.dev (26oktober04:49UTC), verse config en dubbele productie-IDguard. Bewijs work/form-intake-release-20261026/website-publication.json. Geen echte mailproef of automatische tests; gebruikercontrole blijft open.
