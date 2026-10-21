# Mailherziening — 19 oktober 2026

Opdracht: mail eerst grondig hervormen; AI-assistent vindbaar maken daarna. Alleen lokaal, geen echte mails of Gmailwijzigingen, geen tests/build/browser-QA volgens geldende gebruikersafspraak. Publicatie en runtime-bouwlog blijven afzonderlijk.

## Gebruikersmeldingen en vereisten

- Factuur maakt onnodig PDF én Word. Standaard alleen PDF; Word expliciete extra optie. Oude documenten behouden.
- Antwoord op een nieuwe klantaanvraag kwam als nieuw bericht aan; antwoord bij factuur leek wel te werken. Re: op zichzelf is geen reply. Bron Message-ID, References en onderwerp/ontvanger moeten correct zijn; websiteformulier heeft noreply als technische From en klant als Reply-To. Bronmail is door klant zelf mogelijk nooit ontvangen: geen verkeerde garantie dat zijn mailbox een niet-bestaand origineel bevat.
- Mailweergave onoverzichtelijk; maak gesprekken, inkomend/uitgaand, bijlagen en relatie met dossier duidelijk. Technische SMTP2GO-tekst uit gewone werkflow; alleen verbindingsinstellingen/gerichte storingshulp.
- Bovenaan composer expliciet Antwoord in gesprek versus Nieuw bericht. Op oorspronkelijke klantmail antwoorden als dat aantoonbaar de juiste bron is; niet alleen op eerder zelf verstuurde mail. Veranderde ontvanger/onderwerp mag geen verborgen onjuiste reply behouden.
- Van-adres altijd zichtbaar. Gewone mail info@ als ingestelde hoofdafzender, factuur facturen@ als ingestelde factuurafzender; per mailsoort instelbaar. Niet stil laatste factuur/concept/bijlage als standaard voor nieuwe algemene mail hergebruiken. Per bericht overschrijven blijft mogelijk.
- Zelf bijlagen uploaden en kiezen; ontvangen bijlagen bekijken/downloaden en onder dossierdocumenten als E-mailbijlage bewaren. Geen Gmail labels/gelezenstatus aanpassen door lezen/downloaden.
- HTML-handtekening met afbeelding goed ondersteunen. HTTPS/data-afbeeldingen versus Gmail cid:/lokale bestanden onderscheiden; bij ontbrekend bronbestand duidelijke hulp en afbeeldingsimport. Niet zowel normale als HTML-handtekening onder elkaar zetten. Bestaande tekst niet automatisch wissen.
- Gmailachtige composer: gesprekstatus, Van/Aan/onderwerp, bericht, bijlagen, duidelijke hoofdactie. Templates/betaallinks/technische opties rustig onder Extra. Eigen mailstijl toegestaan, afgebakend en met leesbare hover-/focuskleuren.
- Gmail API verzenden is bespreekbaar; nieuwe scope pas als aantoonbaar nodig en expliciet ingesteld. SMTP kan correcte replyheaders verzenden; GmailthreadId is providerspecifiek en kan niet zomaar naar SMTP. Geen scope uitbreiden of OAuth wijzigen namens gebruiker zonder concrete noodzaak.
- AI-assistent onvindbaar: vastgelegd in roadmap assistant-discoverability-20261019, na mail.

## Werkstatus

Lokaal geïmplementeerd; niet uitgevoerd/getest/gepubliceerd. Echte afzenderinstellingen en bestaande mail-/klantdata zijn niet aangepast.

- Factuurformulier heeft Ook een bewerkbaar Word-bestand bewaren, standaard uit. Alleen PDF wordt opgeslagen/als preview aangeboden; renderpayload formats=[pdf]. Lokale en Render-omzetter laten Word-base64 en downloadcache weg. Het tijdelijke Word-document blijft de technische bron voor PDF-conversie met de bestaande template; geen grote rekentijdwinst beloven. Oude opgeslagen Word/PDF’s behouden.
- Composer hergebruikt geen willekeurig laatstgebruikt concept/factuur/betaallink voor een nieuwe mail. Document alleen expliciet gekozen; normale afzender uit configuratie, factuuradres bij expliciete factuur. Hoofdafzenderplaceholder/default bij nieuwe inrichting info@, bestaande configuratie blijft behouden. Per-soort instellingen question/quote/confirmation/proforma/packing. Bewuste afzenderkeuze blijft staan bij een bijlagewissel.
- Nieuwbericht/reply, Van/Aan/onderwerp bovenaan in uitgebreid formulier en snelle reactie. Bericht vóór bijlagen en extra opties. Templates en betaallinks achter Standaardteksten & extra opties. Zichtbare Bijlage toevoegen-knop bij snelle reactie. Afgebakend mail/mail.css op verzoek, centrale palette leesbaar. Geen runtime/screenshotclaim over nieuwe vormgeving.
- Replyhelper valideert RFC Message-ID tot998tekens, beperkt References-keten tot20 verwijzingen. Gmail leest References/In-Reply-To mee. Oorspronkelijke klant/formulier-Reply-To, klantdossiers én orders ondersteund. Quickreply gebruikt laatste bruikbare verzonden/ontvangen parent, concept bewaart context/References. Bewust Nieuw bericht wist context ook bij concept hervatten; gewijzigde ontvanger/onderwerp wordt zichtbaar nieuw of vraagt correctie. Nieuwe SMTPberichten krijgen deterministische eigen RFC Message-ID, naast provider-ID, voor volgende replies. Herhaalverzend-/onzekerheidsjournal en afzonderlijke verzendbevestiging behouden.
- Ontvangen bijlagen krijgen MIME-type/part-ID; cloud en lokale Gmail-dienst hebben authenticated readonly attachment-route. Route leest eerst oorspronkelijke bericht, controleert huidige mailbox/part, spam/trash/grootte, haalt uitsluitend die bijlage op; max4MB. Bekijken/downloaden en expliciet Bewaren bij dossier. Bewaren onder Overige documenten met E-mailbijlage-badge en deduplicatie op mailbox/bericht/part binnen dossier. Geen bulk automatisch downloaden van alle ontvangen attachments; gebruiker kiest zelf welke hij bewaart. Oude bewaarde mailmetadata zonder part-ID vraagt gesprek bijwerken.
- Eigen bestanden toevoegen of dossierbestanden kiezen: max5 extra,4MB per bestand,8MB samen; PDF/afbeeldingen/Word/Excel/tekst/CSV/ZIP. Bestanden direct via state+files-transactie bewaren, concept alleen IDs, geen grote base64 in mailarchief. Preview toont lijst/controleknoppen en vergelijkt metadata én bytes vóór verzenden. Server valideert opnieuw; requestlimiet15MB cloud/lokaal. Document-PDF gebruikt bestaande aparte2MBgrens. Ontbrekende bestanden nooit stil weglaten; verwijderingsreview herkent ook extra bijlagen.
- Eén samengestelde handtekening: bekende tekst-/templateafsluiting vervangen, plain alternatief en HTML niet onder elkaar. Ingesloten PNG/JPG/GIF upload tot200kB, signatureHTMLlimiet500k; provider inlines met cid, preview houdt data-image zodat dezelfde afbeelding zichtbaar kan zijn. Externe HTTPS-afbeeldingen blijven mogelijk. Gmail-cid/file:-verwijzingen zonder afbeeldingsbytes kunnen niet magisch worden hersteld: upload losse afbeelding in instellingen. Geen externe afbeeldingen namens gebruiker opgehaald.
- Verzendstatus gewone tekst zonder steeds providernaam; technische SMTP2GO-informatie blijft in verbindingsinstellingen en gerichte fout-/onzekerheidshulp. Gmail readonly, geen nieuwe scopes of SMTPprovider/Gmailaccountconfig namens gebruiker veranderd.

## Eigen controle door Philippe vóór publicatie

1. Factuur zonder Word-vink: één PDF in dossier; met vink beide bestanden. Oude Word blijft bereikbaar; nummerreeks/factuurpayload gelijk.
2. Nieuwe gewone mail opent zonder oude factuur/betaallink en gebruikt ingestelde hoofdafzender. Expliciete factuur gebruikt ingestelde factuurafzender. Zelf gekozen Van blijft na bijlagewissel. Per-mailsoort instellingen met bestaande geverifieerde alias kiezen.
3. Echte klantmail versus websiteformuliermelding onderscheiden; in beide UI duidelijk reply/nieuw. Controleer bronheaders van eigen gecontroleerde verzending en ontvangerthread, zonder aangenomen klantorigineel. Bewust nieuw en gewijzigde ontvanger/onderwerp mogen geen verborgen replyheaders meenemen.
4. PDF/PNG ontvangen bekijken/downloaden/bewaren; zichtbaar onder Overige documenten als E-mailbijlage. Herhaald bewaren geen tweede kopie bij hetzelfde dossier. Oud metadata eerst bijwerken. Mislukking mag getypt antwoord niet wissen.
5. Extra eigen bijlage upload, concept opslaan/heropenen, voorbeeld/terug, meerdere bestanden en ontbrekende bijlage. Geen bestand buiten gekozen dossier of stille overschrijding. Fout tijdens deelupload toont reeds bewaarde bestanden en laat overige invoer staan.
6. HTML met HTTPS-logo en ingesloten uploadlogo: één handtekening in preview en daadwerkelijk ontvangen mail. Oud Gmail-cid zonder bytes vraagt losse afbeelding. Geen automatische externe fetch of dubbele tekstafsluiting.
7. Onzeker verzendresultaat niet blind opnieuw aanbieden. Geen echte proeven door agent. Frontend, cloud-/lokale diensten én documentservice samen vrijgeven; alleen frontend publiceren maakt nieuwe backendroutes niet actief.

## Bronnen voor transportkeuzes

SMTP2GO ondersteunt custom_headers (waaronder Message-ID/References, uitgezonderd de MIME-beheerheaders), attachments en inlines: https://developers.smtp2go.com/reference/send-standard-email en https://developers.smtp2go.com/docs/adding-attachments . Google legt voor native Gmail-threads threadId, correcte In-Reply-To/References en gelijk onderwerp vast: https://developers.google.com/workspace/gmail/api/guides/threads . Deze broncontrole is geen provider-/afleverproef. SMTPberichten worden niet automatisch als Gmail Sent opgeslagen; daarvoor is een afzonderlijk Gmail-verzendpad met toestemming/inrichting nodig, nog niet gebouwd.

## Correctie afbeeldingpositie — 19 oktober 2026

De aangeleverde HTML verwijst naar JOUW-DOMEIN.NL en bevat al een img op breedte560 tussen naam/functie en milieutekst. De oude afbeeldingsknop plakte het logo buiten deze structuur op320px. Afbeeldingskeuze vervangt nu standaard een bestaand img-vak, met originele attributen en plaats; alleen expliciet Nieuwe afbeelding onderaan voegt een element toe. Meerdere img-vakken zijn afzonderlijk kiesbaar. Ongeldige lokale/cid/voorbeeldbron wordt als veilig leeg slot bewaard, zonder resourcefetch. Nog ontbrekende slotbestanden blokkeren bewaren/voorbereiden met gerichte melding. Afbeelding en HTML ook als compleet lokaal artefact samengevoegd, originele bestanden behouden. Niet getest/gepubliceerd; geen mails/settings namens gebruiker aangepast.


## Maillijst sorteren en filteren — 19 oktober

Sorteren zichtbaar (aandacht/nieuwste/oudste), laatste keuze lokaal per bedrijf. Meer filters combineert status, koppeling, bekende bijlagen en laatste-berichtdatums; zoekterm ook klantnaam. Alleen de lijst wordt vervangen. Gekozen gesprek buiten filter blijft open met melding. Datum+tijd in rij, ontbrekende datum onderaan. Gmail ophalen is uitsluitend providerperiode; oudere bewaarde mail blijft beschikbaar. Bijlagen/ongelezenstatus worden alleen beoordeeld op geladen metadata, geen volledigheidsclaim. Geen tests/browsercontrole of Gmailacties uitgevoerd; gebruikerscontrole open.


## Lokale bijlagenroute — 19 oktober, reparatie

Lokale Pythonproxy miste POST gmail-attachment in de whitelist: aanvraag werd vóór de Node/Gmailservice geblokkeerd. Toegevoegd met bestaande origin-/auth-/bedrijfscontroles, servers herstart. Ook base64urlvalidatie accepteert nu Google-minteken. Client onderscheidt route404/toegang/netwerk/ongeldige response en toont Bijlage ophalen. Geen bijlage gedownload/bewaard of browser-/automatische test uitgevoerd. gmail.readonly blijft voldoende volgens [Google attachments.get](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages.attachments/get). Optionele toekomstige Gmail-sendroute vraagt aparte implementatie en scope; geen nieuwe rechten toegevoegd.
