# Formuliermetadata buiten de mailtekst en spamonderzoek

23 oktober 2026. Lokale bronwijziging; geen tests, syntaxchecks, builds, browser-QA, echte mailproef, Gmailactie, providerconfiguratie-/DNSwijziging of publicatie uitgevoerd. Philippe test zelf. Openbare DNS alleen uitgelezen. Een verandering in broncode is geen wijziging van de live website.

## De melding van Philippe

Hij antwoordt nu rechtstreeks vanuit Gmail via zijn bestaande SMTP2GO-koppeling, nog niet vanuit het CRM. Een klant reageerde dagen niet en zei via WhatsApp dat het antwoord waarschijnlijk in spam stond. Dat is een vermoeden, geen bevestigde spamlocatie. De CRM-verzendcode heeft deze Gmail-antwoorden niet verstuurd. De formuliermelding wordt apart via Resend aan de beheerder verstuurd en gebruikt Reply-To van de aanvrager. Een klant heeft die oorspronkelijke technische melding doorgaans zelf niet ontvangen. Zonder exemplaar van het bij de klant ontvangen bericht is de precieze oorzaak niet vastgesteld.

## Nieuwe mailtekst en technische headers

De aparte Spatlappen-websitebron staat in `<lokale-projectmap>`. Bestaande lokale wijzigingen behouden, eigen AGENTS/AI.md gelezen. functions/api/contact.js verwijdert de automatisch toegevoegde Herkomst, Aanvraag-ID en Interne test uit zowel HTML als platte tekst. De gewone afsluiter blijft. Platte MIME-tekst gebruikt echte regeleinden. Ontvanger, afzender, Reply-To, onderwerp, bestaande bijlagen, toestemmingsgrens en Resend-verzendroute blijven hun bestaande functie houden.

Nieuwe lib/inquiry-metadata.js levert een beperkte headerverzameling via het gedocumenteerde Resend headers-object:

| Header | Inhoud |
|---|---|
| X-CRM-Form-Version | 1 |
| X-CRM-Lead-ID | servergegenereerde aanvraag-UUID |
| X-CRM-Source | vaste broncategorie, waaronder chatgpt en unknown |
| X-CRM-Internal | yes/no uit de bestaande interne-testmarkering |
| X-CRM-UTM-Source / Medium / Campaign | optioneel, URL-veilige UTF8-base64; begrensd op 100/100/150 tekens |

Geen onzichtbare HTML, extra bestand of trackingpixel. UTM-waarden gebruiken uitsluitend de bestaande, server-side toestemmingsgebonden formuliervelden; zonder meettoestemming of bij interne test leeg/onbekend. Geen extra contactgegevens of vrije berichttekst in headers. Headers zijn transportmetadata, geen geheim of autorisatie: via Origineel weergeven of een doorgestuurd volledig bronbestand kunnen ze worden ingezien. Normaal citeren gebruikt de mailtekst, waar onze nieuwe technische footer niet meer staat. Dit is geen garantie voor iedere mailclient of handmatig meegestuurde bronbestanden.

## CRM-lezer en behoud oude aanvragen

shared/inquiry-mail-metadata.js leest alleen de vaste headers, begrenst/valideert velden, decodeert campagnewaarden als passieve tekst en weigert dubbele/ongeldige metadata. Gedeelde gmailMessage leest ze bij volledige berichten; de bestaande metadata-opvraag in lokale en online Gmail-dienst vraagt dezelfde headers mee, zonder extra scopes of extra providerverzoeken. Geen provideractie uitgevoerd.

De aanvraagparser gebruikt headergegevens alleen binnen de bestaande bedrijfseigen formulierherkenning en Gmail-bevestigde ondertekende afzender. Een X-CRM-header alleen is geen bewijs en geeft geen CRM-toegang. Oude formuliermails met Aanvraag-ID en Interne test in de tekst blijven ondersteund. Verschillende header-/tekstnummers of ongeldige metadata blokkeren de automatische verwerking en vragen controle, geen gok. Bestaande ontvanger/sender/subject/datum/opt-in/dedup/CAS-grenzen blijven.

Nieuwe aanvraagorders bewaren exact websiteLeadId, compacte websiteAttribution en bestaande interne-testmarkering. Bij Websitegegevens staat Herkomst aanvraag met bron en beschikbare UTM-waarden achter een details-keuze. Orderduplicatie neemt deze herkomst niet over. Bestaande mails, concepten, orders, labels en dossiers zijn niet herschreven of opnieuw geïmporteerd. AI-antwoordhulp krijgt aanvullend de instructie technische formuliermetadata niet naar de klant te kopiëren; dit verzendt niets en vervangt geen gebruikerspreview.

## Ingebruikname en controle staan open

Eerst de nieuwe CRM/Gmail-lezer leveren (online backend en indien gebruikt lokale Gmail-helper na een bewuste herstart), daarna de nieuwe website-writer. Zo blijft de oudere bodyfallback in de overgang werken. Website en CRM blijven aparte repositories/releases. Geen nieuwe databasebinding of migratie nodig voor dit headercontract. De oudere optionele stappenmeting/migratie blijft een afzonderlijke afspraak, niet automatisch activeren.

Philippe moet nog controleren met fictieve provider/mailbronnen of eigen gecontroleerde proef: beide MIME-delen zonder footer, normale Reply-To/bijlage, headerdecodering inclusief Unicode/vouwing, oude bodyfallback, ontbrekende/dubbele/tegenstrijdige headers, ondertekende bedrijfseigen afzendergrens, automatische intake met behoud aanvraagnummer/bron/interne test, oude bewaarde dossiers en duplicatie. Deze controles zijn niet uitgevoerd. Oude reeds ontvangen formuliermails houden hun zichtbare footer; bij direct antwoorden in Gmail kan Philippe het geciteerde oude technische stuk handmatig weghalen. Dit bronwerk verwijdert het niet uit Gmail.

## Wat we over spam kunnen weten

SMTP2GO Reports → Activity toont o.a. aangeboden/verwerkte berichten, serveraflevering, bounces en afwijzingen. Delivered betekent dat de ontvangende server de mail heeft aangenomen, niet dat hij in de inbox staat. Een spam-event/complaint betekent een teruggekoppelde klacht waar beschikbaar, geen volledige meting van automatische spamfilters bij alle ontvangers. Geen klacht of bounce is daarom geen inboxbewijs; niet antwoorden evenmin een spammeting. Open tracking is ook geen betrouwbaar bewijs van inboxlocatie.

Een toekomstige webhook/Activity-koppeling kan providergebeurtenissen naar CRM brengen met geverifieerde bron, ontvanger-/message-IDkoppeling, dedup en behoud onzekerheid. Deze ronde geen webhook, extra API-rechten, trackinginstelling of automatische providerpolling gebouwd/geactiveerd. Gmail-verzendingen via dezelfde SMTP2GO-account kunnen in Activity staan; dit is niet beperkt tot de CRM-API-sleutel, maar account/filters/rechten bepalen welke gebeurtenissen zichtbaar zijn.

## Publieke DNS-waarneming, 23 oktober 2026

Alleen openbare DNS uitgelezen (dig), geen live instellingen geopend of gewijzigd. Root SPF vermeldt `include:_spf.mx.cloudflare.net ~all`; MX verwijst naar Cloudflare Email Routing; DMARC heeft p=quarantine met relaxed alignment. Dit is GEEN bewijs van een fout: SMTP2GO kan voor SPF een eigen retour-subdomein gebruiken en/of geldige uitgelijnde DKIM leveren. Alleen het root-SPF bekijken is onvoldoende. Niet zomaar een tweede SPF-record toevoegen, DMARC afzwakken of Cloudflare-routing verwijderen.

Praktische eerste controle: SMTP2GO Sending → Verified Senders → Sender domains, volledig spatlappenopmaat.nl geverifieerd, niet alleen een los sender-adres. De precieze records komen van de eigen SMTP2GO-domaininstelling; geen waarden of DKIM-selector raden. Dan bij één via Gmail/gebruikelijke alias verzonden mail aan een eigen andere mailbox de ontvangen SPF-/DKIM-/DMARC-resultaten bekijken. Dit kan authenticatie onderzoeken zonder een klant om toegang te vragen; ook een geslaagde test is geen garantie voor iedere andere ontvanger. Voor de exacte spamreden bij een klant is diens ontvangen bron/header of provideronderzoek nodig.

Primaire bronnen: [Resend custom headers](https://resend.com/docs/api-reference/emails/send-email), [SMTP2GO afgeleverd maar niet ontvangen](https://support.smtp2go.com/hc/en-gb/articles/12994054351513-Email-Delivered-But-Not-Received), [SMTP2GO domein versus los adres](https://support.smtp2go.com/hc/en-gb/articles/9150216032537-Verified-Senders-Sender-Domain-vs-Single-Sender-Emails), [SMTP2GO events](https://developers.smtp2go.com/docs/webhooks-overview), [Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=en). Geen conclusie dat de zichtbare footer de spam veroorzaakt of dat verwijderen ervan het probleem oplost.
