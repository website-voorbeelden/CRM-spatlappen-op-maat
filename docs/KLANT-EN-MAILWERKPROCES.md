> Vervolg opmaakbatch4,27oktober: gedeelde openForm-guard bewaakt ook feature-inert/aria-busy bij annuleren/Escape/submit/aanvullen. Bijlagewerk geeft foutfocus pas na vrijgeven; tekst/selectie behouden, alleen actuele open composer kan beginnen. Geen nieuwe bedrijfsstate/draftstorage of provideractie. Zie BATCHES2-4-OPMAAK-20261027.md; lokale bron, eigen controle open, geen tests/publicatie.

# Klant, order en mailwerkproces — batch3, 23 oktober 2026

Lokaal bronwerk voor beide bedrijven. Geen tests/syntaxchecks/build/browser-QA, echte klant-/mail-/Gmailmutaties of publicatie uitgevoerd. Philippe controleert zelf. Bestaande document-, verzend-, toestemmings- en conflictregels blijven leidend.

## Contact aanpassen waar je werkt

Orderoverzicht en Levering gebruiken hetzelfde kleine contactvenster. De volledige klantpagina blijft bereikbaar maar is niet nodig om standaardnaam/contact/e-mail/telefoon/factuurmail aan te passen. Het venster noemt expliciet dat dit standaardgegevens voor alle orders van de klant zijn. Extra contactpersonen en de aparte ordercontactkeuze blijven behouden.

In de volledige mailcomposer staat Klantgegevens aanpassen naast de ontvanger. Het bestaande inline-taskvenster opent boven de werkelijke ouder-DOM. Annuleren of opslaan laat tekst, onderwerp, gekozen bestanden, DOMhandlers, gesprek en selectie intact; geen mailconcept opgeslagen als bijwerking. Bij een factuur krijgt factuurmail de focus. Na opslaan staat een expliciete Gebruik adres-knop als de klant-/factuurmail verschilt van de ontvanger. Geen stil wijzigen van een antwoordontvanger. Klikken op Gebruik adres doorloopt dezelfde normale recipient-/replycontrole als zelf typen.

shared/customer-contact valideert begrensde velden en e-mailvorm en past uitsluitend werkelijk gewijzigde standaardvelden toe. Laatst opgeslagen waarden van precies die velden moeten nog bij de geopende basis passen. Gelijktijdige veranderingen aan andere contactvelden blijven behouden. Gewijzigde order-klantrelatie of hetzelfde gewijzigde veld blokkeert. Bij conflict houdt het kindvenster de invoer; Terug vraagt bevestiging bij wijzigingen, de oudermail blijft behouden. Geen extra contactpersoon of nieuwe klant op een gok. Automatische herkomstmarkering van bestaande veldwaarden blijft via de bestaande helper.

## Templates zonder je mail te verlaten

De compacte templatekeuze met Tekst invullen en Template bewerken staat direct boven de berichttekst. Als nieuwe template bewaren zit bij Meer. Ontbrekende templatevariabelen verschijnen direct bij de keuze. De rest van de mailopties blijft gesloten.

Bij template bewerken/bewaren vanuit de mail of antwoordwerkplek opent de bestaande inline-task boven het huidige formulier. De oorspronkelijke ouder-DOM blijft staan. Naamconflict blijft in hetzelfde kindvenster: andere naam kiezen of bewust vervangen met bestaande bevestiging en transactiecontrole. Een returnfalse uit een inline save betekent nu bewust openhouden, gelijk aan de gewone openFormroute; busy/dirty worden normaal vrijgegeven/behouden.

Na opslaan worden uitsluitend templatekeuze/labels en benodigde variabelen in de volledige composer bijgewerkt; nog ingevulde variabelewaarden worden op sleutel behouden. Onderwerp, body, bijlagen en gesprek worden niet opnieuw opgebouwd of stil vervangen. De gebruiker kiest Tekst invullen en bevestigt vervanging om de bijgewerkte template in de huidige mail te gebruiken. Bij een bestaand antwoord blijft het gespreksonderwerp standaard behouden; bij een nieuw bericht vult de template ook het onderwerp. Kies eerst Nieuw bericht maken als je dat wilt. Instellingen houdt de bestaande gewone editorroute. De beperkte snelle antwoordwerkplek behoudt zijn bestaande snapshot/terugkeercallback; dit is geen nieuwe berichtopslag.

## Antwoord of nieuw bericht

De volledige composer behoudt een aparte, blijvende contextregel plus Nieuw bericht maken; het herschilderen verwijdert de knop niet meer. Een nieuwe gesprekkeuze kan altijd weer terug naar nieuw. Dropdownkeuzes worden met de actuele gekozen ontvanger opnieuw opgebouwd uit bewaarde gesprekken binnen hetzelfde dossier. Geen matching op alleen onderwerp en geen extra Gmailopvraag of scope.

Het bestaande antwoordanker blijft behouden bij alleen tekst-/templatebeheer, ook wanneer de laatste bewaarde mail intussen anders is. Als dit anker niet meer de nieuwste dropdownkeuze is, staat Huidig antwoord expliciet als keuze; geen stil overzetten op een andere mail. Nieuwe keuze uit de bewaarde lijst wordt op actuele relatie gecontroleerd. Ontvanger werkelijk veranderd of onderwerp buiten Re/Aw/Sv-equivalentie: reply-ID/References/Gmailthread/conversationcontext wissen, duidelijke melding Nieuw bericht. Ook programmatische formulierwijzigingen triggeren die controle; template invullen in antwoordmodus behoudt bewust het bestaande onderwerp. Geen vervalste klantthreadclaim voor de formuliermelding die alleen de beheerder ontving.

Preview en afzonderlijk Versturen blijven verplicht. SMTP2GO behouden, Gmailreadonly/-labelgates niet aangepast. Geen automatische ontvangstmail, opvolging of nieuwe klant/order door deze wijzigingen. Geen inbox-/spam-/aflevergarantie.

## Externe documentverzending

Bestaande expliciete handmatige PDFregistratie behouden. Nu ook order-klantrelatie tijdens registratie opnieuw beoordelen. Bij gelijke aanmaaktijd/datum volgt nieuwste PDF de bestaande invoegvolgorde, niet een willekeurige record-ID. Verplaatste documenten blijven hun geregistreerde soort behouden. Alleen het nieuwste document van die soort kan een dossiermijlpaal aanvullen; geen echte verzending of aanpassing van de PDFinhoud.

## Nog zelf controleren

Ordercontact opslaan/annuleren en gelijktijdige verschillende/dezelfde veldwijziging; mailcontactvenster met tekst/bijlagen en expliciete nieuwe ontvanger; template opslaan/annuleren/naamconflict/vervangen en daarna wel/niet invullen; reply↔nieuw, onderwerp/ontvanger, Re/Aw/Sv en een bestaand antwoord naast een nieuwer bewaard bericht; externe PDFregistratie na gewijzigde klantrelatie. Dit zijn open gebruiksscenario’s, geen uitgevoerde of geslaagde tests. Feedback blijft open, bronstatus review/local.
