# Maatwerkkunststof: verkoopfases en mail-labels

**Aanvulling 21 oktober:** [Automatische fasesynchronisatie](GMAIL-FASESYNCHRONISATIE.md) is nu als lokale bron toegevoegd na nieuwe gebruikersopdracht. Onderstaande individuele reviewroute blijft beschikbaar, maar is niet meer de enige voorbereide route. Nog geen activering, tests of publicatie.

20 oktober 2026. Alleen lokale bron gewijzigd; geen tests, syntaxchecks, build, browser-QA, echte Gmail-reads/-mutaties, klantmutaties, OAuth-aanmelding of publicatie uitgevoerd. Philippe test zelf. Bestaande gegevens zijn niet gemigreerd of overschreven.

## Bedrijfseigen fases

Maatwerkkunststof gebruikt het screenshot als uitgangspunt:

| Fase | Interne sleutel |
|---|---|
| 00 Nieuw | new |
| 01 Welkom | welcome |
| 02 Specificaties opvragen | specs |
| 03 Prijs kiezen | pricing |
| 04 Prijsindicatie verstuurd | indication |
| 05 Offerte verstuurd | quote |
| 06 Order ontvangen | received |
| 07 In uitvoering | production |
| 08 Afgerond | delivered |

De afgekorte labels02/04 zijn uit de screenshottekst aangevuld. Voor Gmail herkent de koppeling de bestaande nummering onder `Verkoopfase/00 …` t/m `Verkoopfase/08 …`, niet de exacte aangevulde tekst. Geen labellijst uit de echte mailbox opgehaald tijdens het bouwen.

Gedeelde code en bedrijfsprofiel, geen aparte CRM-kopie. Spatlappen behoudt zijn bestaande funnel. Maat toont de eigen namen in de sidebar, filters, overzicht, volgende actie, fasegeschiedenis en bovenaan het dossier. De oude ontwerpstatusdropdown is daar vervangen door de verkoopfasebediening. De belangrijkste voortgangsactie verwijst naar dezelfde funnel, geen verplichte ontwerpverzending/goedkeuring. De oude extra ontwerpdatums worden niet getoond in de Maat-tijdlijn. Orderlijst toont de oude ontwerpstatus niet dubbel; drukkleurenfilter is voor Maat verborgen.

De opgeslagen operationele status blijft voor compatibiliteit intact. Bestaande confirmation/paid/released-projecties vallen voor Maat onder06, met betaal- en vrijgavefeiten afzonderlijk behouden. Nieuwe received-registratie betekent geen verstuurde orderbevestiging en registreert geen betaling. Een fase kiezen omzeilt geen bestaande financiële of productievrijgavecontroles. Afgerond bevestigen archiveert via de bestaande flow. Oudere status-/productietransportvelden en overige schermen zijn geen volledige bedrijfseigen migratie; verdere aanpassingen blijven afzonderlijk werk.

## Labels bij één mailgesprek

Bij een gekoppeld gesprek staat Markeren als behandeld, omkeerbaar. Het compacte Labels-menu heeft Opvolgen, Prijs te hoog en Belachelijk hoge prijs. Deze markeringen zijn CRM-labels per bedrijf/dossier/gesprek, via bestaande versiegecontroleerde state-opslag; geen Gmail-gelezenstatus, fase, betaalfeit of automatische reactie. Geen mailconceptvervanging bij het bewaren. Behandeld blijft een handmatige markering; een later bericht wist deze niet automatisch en de bestaande nieuwe-berichtaandacht blijft leidend.

`shared/mail-thread-labels.js` levert vaste IDs/validatie/conflictcontrole. Optionele state.mailThreadLabels bewaart maximaal1000 labelrecords. Andere velden/transacties blijven intact. Geen nieuwe database. Labels geven geen automatische uitsluiting uit werkvoorraad of mailfilters.

## Gmail → CRM

In Labels → Huidige Gmail-labels bekijken leest de browser via de eigen bestaande serverkoppeling de catalogus en een verse thread. Geen automatische volledige mailboxscan. Alleen geldige gebruikerslabels worden getoond. Onder Verkoopfase/ herkent de parser00–08. Bij een afwijkende fase verschijnt een knop naar het bestaande faseformulier met de suggestie vooraf gekozen; expliciete bevestiging en financiële controles blijven nodig. Meerdere verkoopfaselabels worden als conflict aangeboden; niet willekeurig de hoogste kiezen. Andere Gmail-labels zijn geen verkoopfase. Deze route stelt ook geen betaling, orderbevestiging of levering vast op basis van mailtekst.

Wijzigingen die je rechtstreeks in Gmail maakt komen dus na opnieuw lezen als voorstel terug; geen stil achtergrondproces dat orders automatisch verplaatst. Geen massale historische import in deze ronde.

## CRM → Gmail

De gebruiker heeft expliciet aangegeven Gmail-fases ook te willen aanpassen na eigen CRM-fasewijzigingen of mailverzending. De faseformulieren en de bevestiging van het bestaande fasevoorstel na verstuurde mail hebben hiervoor een niet-vooraf-aangevinkte optie. Zonder die keuze blijft alleen de CRM-fase gewijzigd. In het gesprek staat ook Labels → CRM-fase naar Gmail bijwerken. Geen synclussen, geen AI die zichzelf toestemming geeft.

Na keuze wordt exact één gekoppeld gesprek gekozen. Bij meerdere koppelingen moet de gebruiker kiezen. De server leest actuele Gmail-labels en thread. Er moet precies één bestaand targetlabel voor de gekozen nummerfase zijn; ontbrekend/dubbel blokkeert, er wordt geen label verzonnen of automatisch aangemaakt. Voorbeeld: toevoegen Verkoopfase/05…, verwijderen uitsluitend andere bestaande Verkoopfase/00…08-labels van dat gesprek. Alle overige labels blijven staan; geen archiveren, gelezen markeren, spam/prullenbak wijzigen, mail verzenden of permanent verwijderen.

Een aparte review toont mailbox, onderwerp, target en te verwijderen labels. Verplicht toestemmingsvakje, serverreviewtoken en exacte bevestiging zijn nodig. Review is120seconden geldig, bedrijf-/sessie-/mailboxgebonden, met fingerprint van threadberichten, huidige labels/catalogus en accountregistratie. De applyroute leest dit opnieuw; wijzigingen blokkeren uitvoering. Cloud controleert daarnaast de echte centrale orderfase en bewaarde threadkoppeling vanuit D1; de browser is geen bron voor deze bedrijfsbinding. Lokaal is de order in browseropslag: de UI controleert fase/koppeling opnieuw, terwijl de dienst de expliciet gereviewde thread/labelactie en eigen mailbox afdwingt. Dit is geen claim dat de lokale hulpdienst IndexedDB kan lezen.

Cloud bewaart het voorstel versleuteld in bestaande integraties-opslag, met lease tegen dubbel uitvoeren. Lokaal is het kortstondig in de hulpdienst en verdwijnt bij herstart. Applying wordt vóór provideractie geregistreerd; bij een onzekere uitkomst geen blinde herhaling. Lees de labels opnieuw voor een nieuw gecontroleerd voorstel. Een bevestigde herhaling van hetzelfde servervoorstel voert geen tweede providerwijziging uit. Google biedt geen transactionele CAS samen met de CRM-database; er blijft een korte race tussen de laatste Google-read en threads.modify. Geen garantie van atomische synchronisatie van beide systemen.

De algemene GmailActions-executor blijft uit. Dit is uitsluitend een nieuwe afgebakende faselabelroute. Ook de online persoonlijke AI-server krijgt geen Gmail-token of toegang tot deze executor.

## Aanvullende toestemming

De bestaande aanmelding blijft standaard gmail.readonly. Alleen als de gebruiker vanuit de faselabelroute bewust voor de aanvullende Google-aanmelding kiest, vraagt die login readonly+gmail.modify. Google noemt modify breed lezen/wijzigen van e-mail; de API voor threadlabels vereist dit. De gebouwde uitvoerroute staat alleen de vaste verkoopfaselabelactie toe. Geen Gmail-send, instellingen-, filters-, delegatie- of permanente delete-route wordt hiermee actief.

Tot Google werkelijk toestemming verleent voert de applyroute niets uit. Annuleren behoudt de oude verbinding. Aanmelden vraagt de gebruiker zelf via de getoonde officiële Google-link; er zijn nu geen rechten of credentials aangepast. Bij een nieuwe toestemming opnieuw dezelfde gewenste actie controleren; geen eerdere voorstellen automatisch uitvoeren. Google OAuth-project moet de gevraagde scope toestaan; eventuele consent-/verificatie-inrichting is een aparte echte beheerhandeling, niet uitgevoerd.

Officiële bronnen: [labels.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.labels/list), [berichtlabel-IDs](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages), [threads.modify](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.threads/modify). De laatste bewerkt labels van alle berichten in de thread en vereist gmail.modify of volledige mailtoegang; hier wordt uitsluitend modify voorbereid.

## Activering en open punten

De lokale Pythonproxy en Nodehulpdienst zijn herstart voor de nieuwe routes; herlaad de frontend na bewaren van invoer. De eigen lokale diensten zijn na de bronwijziging herstart; de startuitvoer noemt3010/3011 en de hulpdienst. Geen functionele route-/browser-/providercontrole uitgevoerd; geen publicatie. Online vereist een gerichte release met behoud van de bestaande D1/R2/config; geen algemene WIP-publicatie.

Gebruiker controleert zelf: eigen Maatfase-menu, legacyorders onder06, terugkeer uit calculator, behoud van een mailconcept bij labelklik, gelijktijdige labelwijzigingen, conflicterende/oude Gmail-labels, gewenste aanvullende consent en de exacte review. Geen functionele voltooiing of live synccorrectheid geclaimd. Automatische backgroundsync, aanpasbare labelcatalogus, automatische heropening van behandeld en een bredere herziening van alle operationele status-/transportvelden blijven open. Runtime Bouwtaken niet bijgewerkt of afgevinkt.
