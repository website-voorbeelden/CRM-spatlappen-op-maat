> Vervolg27oktober: [open punten verder gebouwd](OPEN-PUNTEN-VERVOLG-20261027.md). Nieuwe vectorsegmentatie, optioneel plaatsingsleren, automatische vrijgave en Google-routeadapter vervangen een deel van de hieronder historische restpunten. Nog geen tests of publicatie.

# Batch 4 — mail, labels en aansluiting op de feedback

26 oktober 2026. Hervat na chatreset bij batch3; batch3-cacheverwijzingen bijgewerkt en bestaande bronnotities teruggelezen. Dit is lokaal bronwerk voor beide bedrijven. Geen tests, checks, syntaxchecks, builds, browser-QA, echte mail-/Gmail-/betaal-/klantacties, GitHubpush of publicatie. Philippe controleert zelf. Bestaande data, wijzigingen en opgeslagen gebruikersstatus behouden.

## Wat verder is afgewerkt

- Dezelfde rustige berichtkaders in de mailbox en het orderdossier, gelijke randen zonder dikke gekleurde linkerstrip. Ontvangen/verstuurd/concept en werkelijke verzendstatus blijven in de kop leesbaar. Alleen de berichtkop krijgt de scheidingslijn; geneste geciteerde tekst krijgt niet dezelfde berichtkopopmaak.
- Gesprekslabels hebben een eigen kader en ruimte. Behandeld is de zichtbare actie; de extra labels, uitleg en Gmail-/fase-instellingen staan bij Meer. De opties klappen binnen de pagina uit in plaats van in een smal zwevend menu. Bestaande labelnamen en betekenissen behouden, op smalle schermen kan tekst doorlopen.
- Een CRM-labelsave blokkeert uitsluitend de eigen CRM-labelbediening. De vorige lus zette ook Gmail-knoppen op enabled na afloop, zelfs als Gmail lezen nog bezig was. Onafhankelijke bediening houdt nu haar eigen busy-status; Gmailreview heeft bovendien een eigen dubbele-klikguard.
- Labelconflict levert de actuele labels uit de afgewezen transactie terug aan de weergave. De gebruiker kan dezelfde keuze opnieuw maken met een nieuwe vergelijkingsbasis, zonder gesprek opnieuw te openen of antwoordtekst te verliezen. Geen stil overschrijven of automatische herhaling. De tijdelijke weergavebasis is geen tweede CRM-opslag; de echte save leest en vergelijkt opnieuw in de bestaande transactie.
- Late labelresultaten mogen een opnieuw gemounte labelstrook niet overschrijven. Gmailreview gebruikt vaste mailbox-/threadwaarden, negeert resultaten voor een verlaten paneel en biedt geen fase-overname na een gewijzigde order-klantrelatie. Alleen een bewuste klik leest Gmail; geen nieuwe rechten of automatische wijzigingen.
- Gesprek bijwerken bewaart de actuele antwoordvelden pas na het ophalen. Daardoor blijft ook tekst die tijdens de aanvraag is getypt behouden. Een ander formulier, andere selectie, ander scherm of nog openstaand venster/busy-actie wordt niet door het oude resultaat vervangen. Focus, tekstselectie en scroll worden waar mogelijk hersteld.
- Een hervat antwoord houdt zijn oorspronkelijke Message-ID/References na een nieuwer bericht of templatebewerking. De vorige snelle composer koos bij heropbouw opnieuw het nieuwste bericht als antwoordbron. Templates en vragenvoorstellen houden nu ook bij een puur CRM-gesprek het bestaande reply-onderwerp. Ontvanger of inhoudelijk onderwerp veranderd: vóór ieder gebruik van de velden opnieuw controleren en als nieuw bericht voorbereiden.
- Tijdens daadwerkelijk concept opslaan/preview voorbereiden is het antwoordformulier inert/busy. Fouten geven het formulier en de velden terug; de bestaande preview en aparte verzendknop blijven leidend. Een late templatecallback vervangt geen ander geopende antwoordformulier.

## Gelezen bestaande routes

De overige feedback is aangesloten op de bestaande privé-ID-matrix en de bronroutes voor orderaanvraag, contact, betaalregistratie/correctie, ontvangsten op facturen, productafbeeldingen, productievrijgave/verkoopfase en routekosten. De eerdere implementaties zijn behouden. Deze bronlezing is geen functionele proef en bewijst geen actuele online status.

| Feedbackthema | Bestaande bron en grens |
|---|---|
| WhatsApp-aanvraag zonder prijs of akkoord | Orderformulier noemt Aanvraagdatum, prijzen mogen onbekend zijn. Product-/klantgegevens blijven nodig voor de bestaande bewaarroutes. |
| Contact en factuurmail nabij order/mail | Gedeelde contacteditor en veldvergelijking; ontvanger alleen bewust overnemen. |
| Bedragen, percentagevoorstel en correcties | Komma/punt via bestaande invoer, standaard50%-voorstel, saldoherlezing met invoerbehoud, correctie met reden/historie/herstel. Geen echte betaling gewist. |
| Factuurvervolg en ontvangsten kiezen | Bestaande maak→preview→mailvoorbereiding; ontvangsten standaard geselecteerd, expliciet leeg blijft leeg. Geen document of mail in deze ronde gemaakt. |
| Productafbeelding/lege vakken | Hoofdafbeelding kiezen en bestaande verwijderroute; zonder afbeelding geen leeg beeldvak, upload beschikbaar. Varianten uit batch1 blijven beschermd. |
| Route en kosten | Bestaande filter-/batchkeuze, routelinks en kostenvergelijking op eigen aannames. Geen automatische wegafstand, rijtijd of routeoptimalisatie. |

## Eerlijk open, niet als opgelost markeren

- Alle bediening, mobiel gedrag en echte mailontvangst/-threading moeten door Philippe gecontroleerd worden. Er is geen actuele online feedback- of bouwlogexport opgehaald; deze ronde gebruikt het aangeleverde bestand en het lokale bronlog.
- Productievrijgave is nu een bewuste bevestiging na de afgesproken aanbetaling, actuele ontwerpgoedkeuring en complete gegevens. De feedbackwens om de fase volledig automatisch bij50% te laten doorgaan is daarmee niet letterlijk volledig gebouwd. De oude70%-melding is vervangen door de nieuwste50%-afspraak. Deze ronde verandert geen vrijgave-/betaalregels.
- Alleen een PDF of betaallink maken geldt niet automatisch als bewezen verzending. Externe verzending kan expliciet worden geregistreerd. De wensen om uitsluitend door aanmaken al Wacht op betaling te zetten of een verzendherinnering te laten verdwijnen zijn dus niet volledig automatisch doorgevoerd. Geen historische verzendfeiten verzinnen.
- Onbekend en expliciet gratis/€0 blijven verschillend. Historische nulprijzen worden niet massaal herschreven.
- Kostenpercentages volgen de werkelijk ingevulde kosten. Materiaal/bewerking uitsplitsen uit één ongedeelde leveranciersprijs kan niet zonder aanvullende gegevens; per-productregels zijn niet de volledige gedeelde kostprijs.
- Automatische bankherkenning is geen nieuwe functie. Eerder gepubliceerde Tikkie-/meldingsinstellingen zijn niet opnieuw geactiveerd of beproefd. Toestelontvangst blijft gebruikerscontrole.
- Batch3: volledige topologische kleursegmentatie, automatisch plaatsingsleren en gelijke fysieke randuitkomst tussen alle renderers blijven open.

## Zelf controleren

1. Beide CRM’s: mailbox en ordermail, ontvangen/verstuurd/concept, lange tekst, bijlagen, geciteerde tekst, desktop en mobiel.
2. Labels: Meer open/dicht, behandeld terugdraaien, andere labels en fout/conflict. Houd een onbewaard antwoord staan; controleer behoud. Bij Gmail lezen en gelijktijdig label bewaren mag lezen niet opnieuw aanklikbaar worden vóór afloop.
3. Typ tijdens Gesprek bijwerken door. Controleer tekst/cursor en het oorspronkelijke antwoordbericht, ook na nieuw ontvangen mail en templatebewerking. Een gewijzigde ontvanger/onderwerp moet Nieuw bericht worden. Bij een open contact-/templatevenster mag een late refresh de oudermail niet vervangen.
4. Concept opslaan/fout en preview/terug; antwoord en bijlagen behouden. Preview is geen verzendopdracht; voer echte verzending alleen zelf bewust uit.
5. Controleer de bestaande order-/contact-/betaal-/document-/routebediening met een eigen proeforder. Dit zijn open gebruikersscenario’s, geen geslaagde tests.

## Bronnen en administratie

admin/mail/mail.css, admin/mail/thread-labels.js, admin/mail/gmail-label-review.js, shared/mail-thread-labels.js en admin/mail-workspace.js. Cacheketen batch4-crm-20261026; klassieke editorvolgorde uit batch3 behouden. Bouwvoortgang via scripts/build-task.mjs bij feedback4-crm-20261026, review/local. Geen feedbackstatus of opgeslagen gebruikersstatus gewijzigd;47 lokale meldingen blijven behouden, geen claim dat alle47 zijn opgelost.
