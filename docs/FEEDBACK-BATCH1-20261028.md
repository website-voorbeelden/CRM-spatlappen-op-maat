# Feedback28oktober — batch 1: aanvragen en voortgang

Status: lokaal brongebouwd, **Jouw controle**. Geen functioneel of visueel akkoord. Batch2 en batch3 zijn nog gepland. Bouwtaak: `feedback28-batch1-orders`. Deze batch betreft de twee nieuwe aanvraag-/bevestigingspunten uit DRIE-FEEDBACKBATCHES-20261028.md; oudere opmaakbatches blijven behouden.

## Aanvraaggegevens als productvoorstel

Bij een bestaande order zonder producten biedt het orderoverzicht **Product uit aanvraag maken**. Diezelfde actie staat in Aanvraaggegevens controleren. De bestaande ordereditor opent met bekende aanvraagwaarden als voorstel. Ook de nog niet opgeslagen invoer uit het aanvulformulier gaat mee. Pas expliciet Opslaan voegt het product toe. Openen en annuleren schrijven geen product; opnieuw openen na opslaan stelt geen extra product voor. Bestaande producten blijven via hun gewone editor bewerkbaar en worden niet uit aanvraaggegevens overschreven.

De gedeelde pure helper shared/inquiry-product-proposal.js bepaalt alleen de voorgestelde velden. Aantal, breedte, hoogte en waar van toepassing materiaal/dikte/vorm/diameters worden overgenomen. Overige kenmerken blijven leesbaar in Specificaties. Een numeriek aantal drukkleuren wordt als drukkleuren voorgesteld; vrije bedrukkingstekst blijft tekst. Niet nodig-velden worden niet als productwaarde voorgesteld. Geen maat, aantal, prijs, akkoord of ontvangst raden. Ontbrekende verkoop-/inkoopprijs blijft onbekend; de gebruiker vult een geldig aantal in vóór bewaren. De bestaande producteditor vereist gehele millimeters; eventuele decimale aanvraagmaten worden niet stil afgerond.

Een ontbrekende breedte of hoogte wist de wel bekende andere maat niet. Gedeeltelijke maten blijven ook bij later bewerken behouden. Beide maten onbekend blijft de bestaande expliciete Onbekend-keuze; deze aanvinken wist beide productmaten. De oorspronkelijke aanvraagwaarden blijven afzonderlijk bewaard; productopslag synchroniseert die niet stilzwijgend.

admin/inquiry-ui.js bewaart de bestaande vluchtige velddelta/vinkjes en hervat na opslaan of annuleren. Validatie gebeurt vóór het aanvulformulier vervangen wordt. Aanvraag-/klantbasis wordt bij overstappen bewaakt; de bestaande hele-ordervergelijking binnen mergeStoredState bewaakt productopslag. Bij conflict blijft het huidige formulier met invoer beschikbaar. admin/orders/workspace.js gebruikt een WeakMap uitsluitend voor de voorgestelde rij tijdens de dialoog, zodat extra kenmerken/herkomst niet verloren gaan. Geen nieuwe businessstore, draftdatabase of schema.

Geldige herkomst wordt uit opgeslagen aanvraagwaarden of actuele formulierbindingen meegenomen: automatisch lichtpaars, AI/interpretatie donkerpaars. Een handmatige afwijking houdt geen ongeldige bronmarkering. De bestaande default-bron duidt het automatisch voorinvullen aan waar geen oudere bron beschikbaar is; geen historische AI-bron verzinnen. Bestaande provenancebronkeys en servercontract blijven gelijk.

## Orderbevestiging als alternatief voor offerte

De gedeelde voortgangsstap in shared/order-progress.js heet **Offerte / bevestiging**. Een bekende verzenddatum of het bestaande bevestigings-mailfasebewijs kan deze stap voldoen, zoals het bestaande offertebewijs dat al kon. Een werkelijk geregistreerde bevestiging geeft Orderbevestiging verstuurd. Er hoeft daarvoor geen aparte offerte verzonden te worden. De bestaande tab/key/handlers blijven gelijk.

Een document dat alleen klaarstaat geeft Bevestiging staat klaar, niet verstuurd. De bestaande geaccepteerde SMTP-verzendregistratie telt als verzendbewijs; dit is geen garantie dat een mail is afgeleverd of gelezen. Bij mailbewijs is de feitelijke verzendregistratie afzonderlijk van de reviewkeuze over de fase. Een handmatige fase zonder mailbewijs telt volgens dezelfde bestaande reviewregels als offertebewijs. Er wordt geen offerteverzenddatum of nieuwe activiteit gefabriceerd. Akkoord, betaling, vrijgave, productie en levering houden hun eigen voorwaarden en feiten.

## Nog door Philippe te controleren

- Beide bedrijven: lege aanvraag met volledige en gedeeltelijke gegevens; aantal onbekend; één maat bekend; vrije bedrukkingstekst versus 0 of meer drukkleuren; Maatmateriaal/dikte/rond/gat.
- Aanvullen → Product uit aanvraag maken met onbewaarde wijzigingen, bewust leegmaken en Niet nodig; annuleren en herhaald uitstappen; terugkeerfocus/invoer behouden. Ongeldige invoer corrigeren in hetzelfde formulier.
- Opslaan en later opnieuw bewerken, zonder dubbele regel; bestaande afwijkende producten/ontwerpvarianten/goedkeuring/prijzen behouden; gelijktijdig gewijzigde aanvraag/klant/order niet overschrijven.
- Alleen klaargezette offerte of bevestiging blijft onverstuurd; werkelijk geregistreerde offerte en bevestiging voldoen elk dezelfde stap. Onzekere/afgewezen verzending zonder verzendregistratie blijft onverstuurd. Bestaande oudere fase-reviewgevallen behouden hun betekenis.
- Desktop/mobiel, bronkleuren en verdere normale orderbediening.

Alleen bron gelezen/bewerkt en bouwadministratie uitgevoerd. Geen tests, automatische checks, syntaxchecks, builds, browser-/DOMcontrole, documentrender, provider-/mail-/betaalactie, klantdataonderzoek, herstart of publicatie. Cacheverwijzingen van gewijzigde schermen/voortgang/bouwtaken bijgewerkt. Feedback niet automatisch afgehandeld; bestaande gebruikersstatus/opmerkingen/klantgegevens blijven behouden. Geen GitHubpush of livelevering.
