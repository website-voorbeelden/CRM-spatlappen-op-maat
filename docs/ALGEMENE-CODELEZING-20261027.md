# Algemene codelezing en gerichte verbeteringen — 27 oktober 2026

Alleen lokaal, voor beide bedrijven. Philippe test zelf: geen tests, checks, syntaxchecks, builds, browser-QA, providerproeven of publicatie uitgevoerd. Bestaande wijzigingen en klant-/ontwerpgegevens behouden; geen echte dossieracties uitgevoerd. Dit is een gerichte bronlezing van de centrale samenstelling, opslag, transacties, sessieherstel, formulieren en enkele dagelijkse dossieracties. Geen volledige beoordeling van ieder bestand, beveiliging of prestaties.

## Lokaal aangepast

| Onderdeel | Gevonden probleem en aanpassing |
|---|---|
| Cloudopslag | Een uitzondering in de voltooiingscallback kon na een geslaagde commit alsnog onerror/onabort oproepen. Voltooiing staat nu buiten de transactiefoutafhandeling; callbackfouten worden apart als browserfout gemeld. |
| Afbreken | Tijdens een bestandsupload kon een afgebroken transactie toch door naar commit. Afbreekmomenten vóór/na async werk en vóór commit toegevoegd; zodra commit verstuurd wordt kan abort geen terugdraaiing beloven. Reeds geüploade maar niet gekoppelde blobs kunnen achterblijven; niet automatisch opruimen. |
| Verouderde gegevens | De bestaande cloudbasisvergelijking geldt nu ook bij gerichte delete van eerder waargenomen records. Eigen eerdere writes/clear binnen dezelfde transactie tellen niet als externe wijziging. Dit is geen vervanging voor expliciete formulier-/recordversies. |
| Transactiehulpen | Nieuwe workspace/transactions.js breekt af bij een synchrone callbackfout; eerder konden al klaargezette writes toch voltooien. Per ongeluk async callbacks worden geweigerd. mergeStoredState bewaakt hetzelfde synchrone contract. |
| Formulieren | Ontbrekend foutvak wordt inline gemaakt, foutnotitie bij een los input-element wordt ernaast geplaatst en oude veldlisteners worden verwijderd. Centrale dialoog en afleveradres zijn inert tijdens bewaren; bij fouten wordt bediening vóór foutfocus hersteld. Geen nieuwe permanente knoppen of browserdraft met veldwaarden. |
| Dossieracties | Klantbewerking, orderkosten, notities, factuuradres, afleveradres, documentcategorie, dupliceren en archiveren/herstellen lezen de actuele transactie en vergelijken de relevante beginbasis. Ze wijzigen niet eerst de zichtbare centrale state. Klant en enige gekoppelde order worden samen opgeslagen; bij mislukken blijft de invoer in het formulier. Adresdraft bewaart zijn oorspronkelijke basis ook na opnieuw renderen. |
| Dupliceren met varianten | De oude kopieerroute verwijderde oude ontwerpvelden maar liet designVariants en de definitieve keuze staan. Dat verwijst naar bestanden van het oorspronkelijke product en kan validatie blokkeren. Nieuwe shared/order-copy.js wist deze verwijzingen en afgeleide inkooptoerekening uitsluitend in de nieuwe kopie. Originele varianten/revisies/bestanden blijven behouden. Ordernummer wordt uit de actuele transactie bepaald; bedrijfsgebonden beginfase blijft leidend. |
| Levensduur | Cloudrefresh ruimt ook focus-/conflictlisteners op en negeert late antwoorden na stoppen. Een vertraagd geopende browserdatabase wordt gesloten als het eerdere openen al geblokkeerd is afgewezen; versie-upgrade kan oude verbinding netjes sluiten. |

De oude generieke save()-route en contextgetter zijn verwijderd nadat de betrokken acties zijn overgezet. Archiveren/herstellen heeft eigen bediening onder admin/workspace/dossier-actions.js. Pure kopieregels staan in shared/. Geen tweede status, nieuwe bedrijfsdatabase of gegevensmigratie.

## Wat logisch is om te behouden

Eén bron met bedrijfsprofielen, pure gedeelde berekeningen en featurefactories met actuele context is een bruikbare basis. De cloudcommit gebruikt revisie plus unieke commit-ID, servervalidatie en bedrijfscontrole; verloren ontvangstbevestiging gebruikt dezelfde ID. Sessieterugzetten bewaart nummerreeksen en bewaakt de actuele gegevens. Deze bestaande grenzen zijn behouden. Bronlezing bewijst niet dat alle scenario’s functioneel werken.

## Nog open, met concrete gevolgen

1. **Herstel van lokale back-ups is niet één gezamenlijke transactie.** State/files, feedback, ontwerpen en planning zitten lokaal in verschillende databases/diensten. Een fout na het eerste onderdeel kan gedeeltelijk herstel betekenen. Vervolg: voorbereid herstelmanifest, duidelijke deelresultaten en hervatten/herstellen zonder bestaand werk te wissen. De huidige herstelroute is niet uitgevoerd of stil omgebouwd.
2. **Opnieuw aanmelden kan invoer verliezen.** cloudRequest verwijst bij 401 direct naar login. Vervolg: aanmelden naast een actief formulier kunnen doen, zonder veldwaarden/credentials als browserdraft te bewaren. Serverbeveiliging/sessielevensduur niet versoepelen. Deze route is deze ronde niet gewijzigd.
3. **Gelijktijdig werken blijft breder dan deze reparaties.** Cloudstate is één hoofdrecord; ook onafhankelijke dossierwijzigingen kunnen een revisieconflict geven. De centrale observed-map is geen afzonderlijke basis per open formulier. Lees-/merge-/versiepatronen van alle overige features, offline overname en expliciete volledige vervanging blijven te inventariseren. Gerichte transacties hierboven zijn geen claim van volledige meervoudige-sessieveiligheid.
4. **Samenstelling en geldinvoer kunnen verder worden vereenvoudigd.** app.js bevat nog veel gebeurtenisroutering en een brede context. Er zijn meerdere geld-/decimaalhulpen en financiële projecties. Volgende stap per concreet werkproces ontkoppelen en contracten afspreken; geen massale verplaatsing of wijziging aan bedragen/btw zonder gerichte scope. Geen aangetoonde rekenafwijking of prestatiemeting claimen.

De oude toegangsdocumentatie bevatte bovendien de inmiddels achterhaalde uitspraak dat Maatwerkkunststof nog niet online stond. De inleiding is gedateerd gecorrigeerd aan de hand van de bestaande overdracht/publicatieverslagen; geen live account-/configuratieonderzoek gedaan.

## Gebruikerscontrole blijft open

Voor beide bedrijven: klant met nul/één/meerdere orders bewerken, extra contactpersonen, afwijkend factuuradres en afleveradres, kosten/notities, documentcategorie en archiveren/herstellen. Laat een tweede sessie ondertussen hetzelfde dossier wijzigen: oude invoer mag de nieuwere wijziging niet overschrijven en moet bij afwijzing blijven staan. Beoordeel ook onafhankelijke dossierwijzigingen.

Bij Spatlappen: een order met A/B en meerdere revisies dupliceren. De nieuwe order moet zonder geleende ontwerpkeuze beginnen; de originele versies moeten ongewijzigd openen. Controleer daarna opnieuw gewone variantbewaring en definitieve keuze. Beoordeel opslagfouten, ongeldig klein formulier, afbreken tijdens upload en een verlopen login zelf. Geen van deze scenario’s door Codex uitgevoerd.

Bouwlog via scripts/build-task.mjs: afgebakende review bij crm-general-review-20261027, gedeeltelijk vervolg bij concurrent-work en variantcompatibiliteit bij feedback4-variants-20261026. Gebruikersstatus/feedbackhistorie niet gewijzigd. Cacheverwijzingen crm-code-review-20261027, geen serviceherstart of GitHubpush.
