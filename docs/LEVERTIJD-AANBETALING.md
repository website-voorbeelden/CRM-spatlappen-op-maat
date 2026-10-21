# Levertijd vanaf aanbetaling

21 oktober 2026, lokaal bronwerk voor beide bedrijven. Geen tests, syntaxcheck, build, browser-QA, provideractie of publicatie uitgevoerd. Philippe test zelf. Bestaande orders/afspraken zijn niet automatisch omgezet.

Order → Planning & levertijd → Aanpassen → Levertijd rekenen vanaf → Aanbetaling ontvangen. Ook beschikbaar bij Order bewerken en AI-importcontrole. Percentage wordt pas zichtbaar bij deze keuze, met 1–100% als bereik. Bestaand expliciet levertijdpercentage gaat voor, daarna de orderafspraak voor productievrijgave, anders 50% als zichtbaar bewerkbaar voorstel. De planning slaat bij deze keuze een eigen leadTimeDepositPercent op: geen wijziging van productievrijgavepercentage of betaalverzoek.

shared/lead-time.js berekent de datum waarop chronologisch opgetelde werkelijk ontvangen orderbetalingen het percentage van de actuele orderwaarde inclusief btw en verzending bereiken. Het hoeft niet één betaling te zijn. Betaallinks, facturen, Gmail-labels en productievrijgavedatum gelden niet als ontvangstbewijs. Correcties in betalingen worden bij de volgende projectie meegenomen. Ontbrekende prijs/verzending, nulwaarde of ongeldige ontvangstdatum geeft geen verzonnen startdatum. De planningskaart legt uit wat ontbreekt en biedt direct Betalingen controleren of Prijsgegevens aanvullen.

Het levervenster in weken start op die ontvangstdatum. Een vaste afgesproken vanaf-/uiterlijkdatum behoudt voorrang. Volledige betaling, aanvraagdatum en handmatige start blijven beschikbaar. Bestaande orderkeuzes/defaults blijven intact. In de planningskaart staat bij deze keuze ook de aanbetalingsdatum en wachttijd. Geen automatische productie- of faseovergang door een levertijdinstelling.

Nieuwe documentformulieren gebruiken de afgesproken planning als levertijdvoorstel, met behoud van eerder bewaarde documenttekst. Zonder planning blijft de bestaande 2–8 weken documentdefault staan. Reeds opgeslagen PDF/Word wordt niet aangepast. AI-import ondersteunt deposit + expliciet percentage en vraagt ontbrekend percentage na; AI-export/antwoordcontext neemt het gekozen percentage mee. Lokale import en bedrijfsstate valideren het nieuwe veld. Planningopslaan gebruikt een actuele transactie/conflictcontrole; invoer blijft bij fouten staan.

Lokaal herladen na bewaren van invoer; online vereist een gerichte release. Runtimebouwlog niet gewijzigd of als gevalideerd afgevinkt.
