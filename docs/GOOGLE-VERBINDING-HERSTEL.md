> Online gepubliceerd24oktober na nieuwe expliciete toestemming voor beide CRM’s en hun workers: crm-provider-transport-20261024. Kwartiercron en bestaande instellingen behouden. Geen echte Google-/pushproef of tests uitgevoerd; leestoegang nog niet bevestigd. Zie nieuwste OVERDRACHT.md en work/provider-transport-release-20261024.json.

# Google-verbindingsfout — 24 oktober 2026

Philippe meldt in het online Spatlappen-CRM Google & SEO: sleutel bewaard, maar Google is nu niet bereikbaar. Geen sleutel/configuratie/bewaarde mail of klantdata geopend. Alleen bron en officiële documentatie gelezen. Concrete oorzaak in de bron: marketing.provider zet redirect:error, wat de Cloudflare Workers-runtime niet ondersteunt. De constructor kan al een TypeError geven vóór een netwerkverzoek; de generieke catch vertaalde die naar Google niet bereikbaar.

Bron: https://developers.cloudflare.com/workers/runtime-apis/request/ , opties redirect. Alleen follow/manual ondersteund; error geeft TypeError, ook via fetch(url,init). Geen echte provider- of accountproef uitgevoerd, dus dit is bewijs van een bronfout, niet van de huidige Googlepropertyrechten.

## Herstel

cloudflare/marketing gebruikt manual, weigert expliciet3xx met veilige gebruikersmelding en volgt geen Location. Account/JWT/headers niet hergebruiken op een ander domein. Bestaande HTTP403/429-/propertyfoutbehandeling, vaste endpointselectie, readonly scopes, encryptie en bedrijfsgrenzen behouden. Cache transportVersion2 voorkomt dat een oud gecacht deelrapport de fix verbergt; geen bestaande settings/credentials/mails/dossiers herschrijven.

Dezelfde onondersteunde optie staat in cloudflare/web-push en workers/notifications. Beide aangepast naar manual: Worker weigert alle niet2xx, pushtransport geeft niet2xx terug aan bestaande retry/statuslogica. Ook daar geen Location volgen of Authorization doorgeven. Cron15minuten, pollingflag, pushkeys en apparaatkeuze behouden. Na eerdere CLI-publicaties was werkelijke verwerking nog niet getest; deze bronfout kan dus ook de actieve meldingenjob/push hebben geblokkeerd. Activeren/publiceren is geen bewezen functionele aflevering.

## Eigen controle door Philippe

Online Spatlappen → Analytics → Google & SEO → Vernieuwen. De bestaande serviceaccountsleutel hoeft voor dit bronherstel niet opnieuw geüpload. Als Google daarna HTTP403 meldt: Search Console API-activering en beperkte leesrechten op de exact gekozen property controleren. Dit is apart van Gmail-OAuth. Geen nieuwe toegang door Codex gevraagd/aangepast. Gedeelde code ook bij Maat, eigen configuratie behouden.

Geen tests, syntaxchecks, browser-QA, controlebuilds, echte Google-rapportopvraag/tokenuitwisseling, testpush of handmatige jobtrigger uitgevoerd. Publicatie alleen de noodzakelijke releaseverpakking; normale bestaande kwartiercron blijft de geautoriseerde bedrijfstaak. Werkelijk publicatieresultaat bovenaan OVERDRACHT.md, bronlog via CLI.
