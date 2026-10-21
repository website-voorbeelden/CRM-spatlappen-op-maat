# Online aanvulling — 16 oktober 2026

Online Spatlappen heeft nu een werkende serveradapter voor uitsluitend gmail.readonly. Deze vraagt geen Gmail-schrijf-/verzendrechten. Instellen via Instellingen & back-up → Gmail-inbox; Web-app-client, vaste HTTPS-callback en eigen Google-aanmelding zijn nodig. Lokale Desktop-client/toestemming blijven apart. Zie docs/EMAIL.md voor de precieze stappen. De hieronder beschreven uitbreidingspoort voor Gmail-schrijven blijft lokaal, uitgeschakeld en buiten de online adapter.

# Gmail-beheer: voorbereiding, geen geactiveerde schrijftoegang

De bestaande aanmelding vraagt nog uitsluitend `gmail.readonly`. SMTP2GO, afzenders, replies, factuurmails en opgeslagen gesprekken blijven hun huidige route gebruiken. Er is geen nieuwe Google-toestemming gevraagd en geen Gmail-verzendadapter geïnstalleerd. De ingebouwde AI heeft nog geen Gmail-tools. De nieuwe voorstelroutes zijn infrastructuur voor een volgende expliciet aangevraagde uitbreiding, geen claim dat de AI nu Gmail kan beheren.

## Toestemming vóór elke wijziging

`shared/gmail-capabilities.js` bevat vaste acties en de minimaal benodigde scope: verzenden/antwoorden, concepten, bericht-/gesprekslabels, prullenbak/herstellen, labelbeheer, filters en beperkte instellingen. Er bestaat geen algemene HTTP/Gmail-requesttool. Inhoud wordt gecontroleerd en beperkt, met afwijzing van onbekende velden, raw MIME, willekeurige URL’s en massale permanente verwijdering.

`assistant/gmail-actions.mjs` behandelt voorstel → menselijke controle → bevestiging. De backend bindt ieder voorstel aan bedrijf, lokale sessie, mailbox, Google-verbinding, inhoud en verloopdatum. Alleen de aparte reviewroute geeft een kort geldige willekeurige nonce af. Die nonce staat niet in de voorstellenlijst, AI-tools, CRM-state of back-ups. `confirmed:true`, een andere inhoud/nonce/sessie, een herhaalde bevestiging of een gewijzigd account geeft geen toestemming. Een gevoelige actie zoals versturen/prullenbak/label verwijderen vereist bovendien de exacte getypte bevestiging. Kritieke instellingen blijven geblokkeerd zolang aanvullende identiteitscontrole ontbreekt.

De productieconstructie installeert **geen executor**. Ook als een Google-token meer rechten bevat, blijft de uitvoering uit. Controle afronden registreert `reviewed-only` en voert niets uit, ook niet later. Voorstellen staan maximaal tien minuten in servergeheugen, reviewnonces maximaal twee minuten; herstart verwijdert ze. De privéjournalbestanden bevatten alleen actie, hash, tijd en status, zonder berichttekst, ontvangers of tokens. Er wordt geen automatische retry uitgevoerd.

Een toekomstige vaste adapter moet door dezelfde bevestigingspoort lopen. De poort controleert dan opnieuw de daadwerkelijke scopes en de actuele bronmail/instelling, en schrijft een uitvoeringsintentie vóór provider-I/O. Parallel bevestigen kan slechts één uitvoering starten. Een onzekere uitkomst blijft geblokkeerd; controle in Gmail is dan nodig. Testadapters gebruiken uitsluitend fictieve gegevens. De API biedt geen activatieveld of route waarmee een client/model de ontbrekende productieadapter kan inschakelen.

## Vertrouwensgrens

De modelomgeving krijgt geen review-/confirm-/configuratie-/SMTP-tools, geen interne bearer en geen willekeurige netwerktool. Een tekstuele AI-bevestiging kan daarom geen backendbevestiging geven. De lokale proxy controleert Host/Origin/contenttype/methode, kiest zelf het bedrijf en gebruikt een privé-interne sleutel. De helper bindt review/confirm aan de bedrijfspoort en leidt zelf de sessie af, niet uit JSON van een model.

`channel: human` is een interne aanduiding voor die aparte CRM-route; het is geen cryptografisch bewijs dat een fysiek persoon heeft geklikt. Een aangetaste browser/zelfde-origin script of lokaal proces met de geheime interne sleutel valt buiten deze grens. Vóór online activatie zijn een geauthenticeerde gebruiker/sessie, sessierotatie, CSRF-controle, extra herauthenticatie voor kritieke instellingen, opslaglimieten/journalbeleid en een afzonderlijk beoordeelde vaste Gmail-adapter nodig. Geef nooit de menselijke bevestigingsroutes of hun geheimen aan een AI-netwerktool.

## Google-rechten later gericht activeren

Vraag rechten pas aan voor functies die worden geactiveerd, niet alle scopes tegelijk. `gmail.send` voor verzenden; `gmail.compose` voor conceptbeheer/verzenden; `gmail.modify` voor mailwijzigingen zonder permanente verwijdering; `gmail.labels` voor labelbeheer; `gmail.settings.basic` voor basisinstellingen. Huidige tokenbestanden blijven privé per bedrijf; een nieuwe accountkoppeling of gewijzigd rechtenpakket maakt oude voorstellen ongeldig.

Volledige `https://mail.google.com/`-toegang is vooral nodig voor direct permanent verwijderen buiten de prullenbak. Deze functie blijft geblokkeerd. `gmail.settings.sharing` voor onder andere delegatie/gevoelig delen werkt niet als gewone persoonlijke Gmail-OAuth-scope: Google beperkt dit tot Workspace-serviceaccounts met domain-wide delegation. Daarom is “alles binnen Gmail” niet letterlijk beschikbaar met een persoonlijk Gmail-account. Doorsturen, delegatie en afzenders wijzigen zijn in deze voorbereiding geblokkeerd.

Bij publieke/cloudactivatie moeten de Google-client, redirectroutes, toepasselijke scopeverificatie en privéserveropslag opnieuw worden ingericht. De lokale voorbereiding activeert geen online rechten.

Officiële bron: [Gmail OAuth-scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).

Tests: `tests/gmail-actions.mjs`, `tests/gmail-service.mjs` en bestaande SMTP2GO-tests. Geen echte Google- of SMTP2GO-verzendingen.
