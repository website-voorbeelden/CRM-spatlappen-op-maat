# Antwoordhulp per mailgesprek

20 oktober 2026. Lokaal gebouwd voor beide bedrijven; niet getest of gepubliceerd. Philippe test zelf.

## Gebruik

Open E-mail of het mailtabblad van een order en kies een gesprek. Antwoordhulp staat bij het antwoordvak. Schrijf wat je wilt vertellen, laten uitzoeken of aanpassen. Een vervolgvraag gebruikt alleen de denksessie van hetzelfde bedrijf, gesprek en dossier.

Lokaal gebruikt Antwoord maken de bestaande ChatGPT-planverbinding van Agent. Het model komt uit de actuele accountcatalogus. Verbind bij Agent als die koppeling ontbreekt. Deze hulp heeft geen CRM-tools, schrijft geen dossiergegevens en kan geen mails versturen. Stop gebruikt dezelfde bestaande annulering als Agent. Een onvolledige antwoordstroom wordt niet als voorstel geaccepteerd.

Context kopiëren voor ChatGPT maakt een prompt met dezelfde geselecteerde context, je opdracht en begrensde denksessie. Open ChatGPT zelf, plak de prompt en plak het complete JSON-antwoord terug onder Antwoord uit ChatGPT inlezen. De meegegeven vraag-ID moet overeenkomen; zo wordt een antwoord van een ander gesprek niet per ongeluk geïmporteerd. Deze handmatige route is ook voor online voorbereid, maar nog niet gepubliceerd. Online is geen directe agentdienst toegevoegd.

Het voorstel toont antwoordtekst, aandachtspunten en eventuele vragen aan jou apart. Gebruik antwoord in concept vervangt uitsluitend de body van het huidige concept, met AI-herkomstmarkering. Aan/Van/onderwerp/replyheaders/bijlagen blijven staan. Voorbeeld en daadwerkelijke verzendbevestiging gebruiken de bestaande mailroute. Is je concept, de gekozen context, je instructie of de gekoppelde dossierinformatie sinds de aanvraag gewijzigd, dan wordt overnemen geblokkeerd en blijft je eigen antwoord behouden. Antwoord kopiëren blijft als bewuste handmatige route beschikbaar.

Ook een gesprek zonder klantkoppeling heeft antwoordhulp en kopieermogelijkheden. Eerst koppelen voordat je het antwoord in een CRM-concept gebruikt of instructies blijvend bewaart.

## Welke context gaat mee?

- Alleen de geladen Gmail-/bevestigd aangeboden CRM-berichten uit het geopende gesprek. Maximaal de nieuwste 40 berichten en 60.000 tekens mailtekst; per bericht maximaal 12.000 tekens. De context toont aantallen, weggelaten/ingekorte tekst en dat bijlagen niet gelezen zijn. Niet-geladen Gmail-mail wordt niet stil opgehaald.
- Huidig concept en zichtbare geadresseerde/afzender/onderwerp/reply versus nieuw. Concepten van andere gesprekken of andere niet-verstuurde concepten worden niet toegevoegd.
- Standaard de gekoppelde klantnaam/contact/e-mail en order met aantallen, maten, materiaal/dikte, verkoopprijzen, btw, bekende verzendprijs, geregistreerde datums, ontbrekende specificaties en dezelfde betaalprojectie als de verkoopfunnel. Gekozen ordercontactpersoon gaat voor het algemene contact. Geen andere klantorders.
- Interne klant-/ordernotities uitsluitend na een afzonderlijk vinkje. Inkoopprijzen, leverancierscalculaties, betaal-URLs/tokens, adressen, credentials en bijlagebytes ontbreken in deze projectie. Bestandsnamen zijn referenties, geen gelezen inhoud.
- Maximaal acht recente AI-/gebruikersberichten en 16.000 tekens denkhistorie. Dit staat apart van de maximaal 40 mailberichten. Wijzigen van de contextvinkjes begint voor volgende vragen zonder oude denkhistorie; een laat antwoord met de oude context gaat niet opnieuw mee.

Bekijk de exacte context onder Context & werkinstructies. Geen verzending naar OpenAI door alleen de mail te openen of context te bekijken. Alleen de expliciete Antwoord maken-klik stuurt de geselecteerde context; kopiëren gebruikt uitsluitend het klembord. Koppelstatus/modelcatalogus worden lokaal bij openen van de hulp opgevraagd.

## Bewaren en grenzen

Werkinstructies bij dit gesprek bewaren gebruikt de bestaande bedrijfsstate-transactie, met versievergelijking. Alleen eigen instructietekst, gesprekskey, dossier-ID en datum staan in state.mailReplyGuidance. Maximaal 1.000 gesprekken, 6.000 tekens per instructie; validatie aan serverkant. Lege tekst bewust bewaren verwijdert die instructie. Bewaarde instructies ophalen herstelt een gewijzigde versie na een conflict zonder je antwoordconcept te wissen. Geen mailteksten of AI-gesprekken worden hiervoor gedupliceerd in de database.

De denksessie zelf blijft in dit tabblad, ook bij interne navigatie; herladen sluit haar af. Concept opslaan is een aparte bestaande actie. Nieuwe denksessie wist alleen de AI-historie/het voorstel, niet je mailconcept of bewaarde instructies. Contextwijzigingen en een ander gekoppeld dossier krijgen een aparte geschiedenis. Dit is geen automatische training op de mailbox, achtergrondagent, volledige mailboxzoeker of bijlage-analyse.

Maatwerkkunststof heeft nog geen Gmail-/verzendconfiguratie; deze toevoeging stelt die providers niet in. Gmail blijft readonly. Geen nieuwe Google-scopes nodig voor deze conceptfunctie; er zijn geen OAuth-rechten/configuraties gewijzigd.

## Bestanden en contract

- admin/mail/reply-assistant.js: sessies, contextkeuzes, lokale aanvraag, kopiëren/import, review, instructies bewaren.
- admin/mail-workspace.js: kleine compositie in bestaande quickreply, met bestaande mailSeed en provenance.
- shared/mail-reply-assistant.js: allowlist/context, prompt, begrensde geschiedenis en voorstelparser.
- shared/mail-reply-engine.js: toolvrije lokale generatie met dezelfde bestaande ChatGPT-verbinding en afgeronde streaming.
- shared/assistant-engine.js: kiest expliciete task=mail-reply vóór de algemene dossieragent; geen algemene tools of volledige state in dit pad.
- assistant/server.mjs: bestaande authenticated chat-route, bedrijfskoppeling, request-ID en stopcontrole. Geen nieuwe publieke route of credentials.
- shared/state-validation.js: optionele instructielijst; bestaande dossiers zonder lijst blijven geldig.
- admin/mail/mail.css: uitsluitend afgebakende mailopmaak met expliciete tekst/achtergrondkleuren.

De bestaande accountcatalogus, store:false/stream:true en voltooiingscontrole volgen [officiële OpenAI-documentatie](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference). Er is geen API-sleutel of alternatieve betaalroute toegevoegd.

## Overdracht

Geen tests, browser-QA, proefgeneraties, mails, Gmailmutaties, builds of publicatie uitgevoerd. Alleen bronwijzigingen/documentgeneratie en lokale serverherstart om de dienst beschikbaar te maken. Werkende generatie/bediening is nog door Philippe te controleren. Ook geen klant-/order-/instructierecord namens gebruiker opgeslagen.
