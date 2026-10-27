> Nieuwste correctie24oktober: Philippe vraagt minder achtergrondwerk vanwege Cloudflarekosten. Interval naar15minuten voor beide CRM’s; actuele uitvoerstatus bovenaan OVERDRACHT.md. Oude vijfminutenpassages beschrijven de vorige stand. Bron shared/notification-schedule.js, uitleg docs/CLOUDFLARE-KOSTEN.md.

> Actueel24oktober: automatische Tikkiecontrole voor beide online CRM’s aangezet en gepubliceerd als crm-tikkie-polling-20261024. Vereiste productiesecretnamen/bedrijfsbindingen/tabelnamen vooraf bevestigd, geen sleutelwaarden gelezen. Nog geen fysieke ontvangst-/pushcontrole; geen tests of handmatige providerproef. Zie nieuwste OVERDRACHT.md. Oudere uit/preparatiepassages zijn historische momentopnamen.

# Automatische Tikkiecontrole — 24 oktober 2026

Philippe vraagt om automatisch controleren elke X minuten in plaats van de handmatige knop nodig te hebben. De eerdere publicatie zette alleen push/cron aan en hield betaalpolling uit. Nu vijfminutenrondes voorbereiden en, met aanwezige zakelijke Tikkie-inrichting, activeren voor beide bestaande online CRM’s. Gewone bankoverschrijvingen vallen buiten de Tikkie-API; daarvoor geen nieuwe banktoegang of matching gebouwd.

## Werking

De bestaande eigen vijfminutenworker roept dezelfde beveiligde meldingenjob aan. Laptop of CRM-tab hoeft niet open te staan. CRM_PAYMENT_POLL_ENABLED is expliciet per bedrijfsproductie. Na een volledige ronde geen uurpauze meer: vijfminutenvensters, afgestemd op de cronklok zodat enkele seconden uitvoeringsverschil niet telkens een beurt overslaan.

Maximaal twee opgeslagen CRM-betaallinks per job, maximaal twee providerbetaalpagina’s per link en bestaande zes-seconden-timeouts. Met meer links gaat de volgende job verder via de bestaande cursor; een volledige ronde kan dus langer duren. Alleen links in het bestaande tijdvenster (tot zeven dagen na verval), geen vrij zoeken in alle banktransacties. Handmatige controle blijft voor uitzonderingen/oudere links en grote betaalpagina’s bestaan. Geen gegarandeerde realtimelevering.

Alleen eigen zakelijke Tikkie-GETs: status en ontvangsten. Geen nieuwe betaallinks, terugbetalingen, uitbetalingen of mails. Alleen gevalideerde ontvangsten via bestaande applyTikkiePayments en centrale CAS; bestaande externe ID’s en bewuste verwijdercorrecties voorkomen herimport. Bij ontbrekende configuratie geen stil succes. Een net gesloten/verlopen link met een eerder bij de provider opgehaalde maar nog niet in CRM geregistreerde ontvangst blijft voor verificatie in aanmerking komen. De lokale cache geldt daarbij NIET als nieuw betaalbewijs: opnieuw bij Tikkie opvragen, valideren en pas dan registreren. Dit herstelt de onderbreking tussen opslaan providerantwoord en centrale CRM-commit zonder een nieuw claimschema of importeerstroom.

Na registratie dezelfde meldingenoutbox/dedup. Push alleen voor geldig aangemelde apparaten/sessies; apparaat aanmelden staat los van providercontrole. Geen gewone bankdetectie, automatische factuur-/mail-/Gmailactie. Ontvangst van push op iPhone vraagt eigen beginscherminstallatie/toestelconsent en gebruikerscontrole.

Instellingen → Telefoon & meldingen toont de status van automatische Tikkiecontrole direct. Details tonen serverheartbeat en laatst afgeronde volledige Tikkieronde afzonderlijk. De handmatige betaalknop blijft beschikbaar.

## Inrichting en uitschakelen

scripts/configure-payment-polling.mjs both toont zonder extra vlag alleen plan. --inspect leest verse eigen productieconfig, alleen bestaande secretnamen, DBidentiteit en benodigde tabelnamen; geen providerproef of betaal-/klantrecords lezen. --apply bereidt beide pakketten voor, behoudt alle bindingen/vars behalve expliciete pollingflag/bronrelease, en publiceert dezelfde projecten/main. Geen migratie, nieuwe secrets, sleutelrotatie, cronwijziging of brede credentialswijziging. Beide live bases en bestaande TIKKIE_API_KEY/TIKKIE_APP_TOKEN plus meldingensleutelnamen vooraf vereist; waarden niet openen/afdrukken. Bestaande Wrangler-login alleen door de reguliere CLI.

Na bevestigde publicatie target.paymentPolling vastleggen zodat volgende releases de keuze behouden. --disable --apply kan providerpolling later uitschakelen, met behoud van meldingen voor nieuwe providerontvangsten via de knop Tikkie controleren; zelf bedragen invoeren geeft volgens de correctie27oktober geen push. Bij gedeeltelijke fout stoppen en beschermd uitvoerverslag bekijken; niet blind beide opnieuw publiceren. Geen providerjob handmatig als bouwtest triggeren: de bestaande cron start het geautoriseerde bedrijfsgedrag na activering.

Geen automatische tests, syntaxchecks, browser-QA, controlebuilds, echte betaling of handmatige providerproef uitgevoerd. Alleen noodzakelijke publicatieverpakking/compilatie bij activering. Online resultaat afzonderlijk bovenaan OVERDRACHT.md en in bronlog vastleggen. Aanwezigheid van secretnamen is geen bewezen geldigheid van de providerkoppeling of eerste geslaagde ontvangst.

APIbasis: https://developer.abnamro.com/api-products/tikkie/reference-documentation . Tikkie ondersteunt GET-betaaldetails en notificatieabonnementen. Nieuw notificatieabonnement niet zomaar activeren: volgens de documentatie vervangt dat het bestaande abonnement voor dezelfde toepassing. Deze uitbreiding gebruikt de bestaande GET-adapter; geen webhookregistratie of bestaande providerabonnementen wijzigen.
