# Factuur-PDF slepen naar de Kunststofbaas-invoer

1 november 2026. Lokaal brongebouwd voor jouw controle. Geen tests/checks/syntaxchecks/build/generator/browser-/DOM-/visuele QA, runtimeherstart, werkelijke factuurregistraties of publicatie uitgevoerd.

## Gebruiken

Bewaar eerst open invoer en ververs de lokale CRM-pagina. Bij **Order → Kunststofbaas → Factuur van Kunststofbaas** staat het vak **Sleep je factuur-PDF hierheen**. Sleep één reeds gedownloade PDF vanuit Finder/Downloads in dit vak. Het vak licht op bij het slepen. De gekozen bestandsnaam wordt getoond; dezelfde bestaande tekstherkenning en het bewerkbare kostenvoorstel starten vervolgens. **Factuur-PDF kiezen** blijft als alternatief beschikbaar en werkt met het toetsenbord/de bestandskiezer.

Maximaal één PDF van15MB, naam maximaal240tekens en de bestaande strikte PDF-header. Een link, map, meerdere bestanden, leeg/te groot bestand of geen PDF wordt niet als nieuwe bron overgenomen. Eerst de factuur downloaden; slepen van een browserlink is geen PDF-bestandsimport. Een header bewijst niet dat de hele PDF leesbaar of inhoudelijk correct is. De bestaande PDF-lezer/controle blijft gelden, inclusief pagina-/tekstgrenzen en geen OCR voor scans.

## Bestaande invoer behouden

Een afgewezen drop vervangt de eerdere bron en formulierwaarden niet. Een geaccepteerde nieuwe PDF wordt als bron in dezelfde factuursessie gehouden; lezen kan nog mislukken en de PDF blijft dan voor eigen beoordeling in het formulier. Bestaande bedragen/regels worden alleen via de al aanwezige vervangkeuze overschreven. Na een bewuste nieuwe keuze via de bestandskiezer krijgt die gekozen bron voorrang. Er wordt geen kunstmatige FileList in het invoerveld geschreven.

Slepen leest alleen een voorstel. **Kosten accepteren & factuur bewaren** blijft de enige financiële opslagactie. Geen losse upload als algemeen orderdocument of automatische kosten/betaling. Alle eerdere bestand-/SHA-/bron-/CAS-/revisie-/btw-/betalingscontroles blijven bij de bestaande factuurinvoer. Importfeedback en de gekoppelde nummerinvoer blijven dezelfde eigenaar houden.

## Bron

admin/documents/invoice-drop beheert uitsluitend deze dropzone, bestands-/headercontrole en busy/actuele-formuliergrens. De drop/dragover-events worden lokaal afgehandeld en niet doorgegeven aan de algemene documentuploader in app.js. De bestaande uploader blijft ongewijzigd. Bij een lopende factuuractie wordt geen tweede drop gestart. Tijdens de korte headerlezing staat de formuliergrens op busy; een verdwenen/vervangen formulier krijgt geen late bronwijziging.

admin/purchases/invoice-intake houdt de geaccepteerde gedropte File in de eigen tijdelijke sessie en gebruikt dezelfde selectedProof, lezer, voorstel, vervangkeuze en opslagcallback als de bestandskiezer. Werkt in de directe ordertab en in de bestaande modalroute wanneer de bestandsbron zichtbaar is. Geen nieuwe database/schema/serverroute/provideractie. Opmaak alleen bij de bestaande CRM-componentregels in admin/style.css met gedeelde kleurvariabelen.

Automatisch inloggen bij Kunststofbaas is op expliciet gebruikersverzoek uitgesteld. Geen login of account-/netwerkonderzoek in deze ronde. Zelf downloaden en PDF importeren blijft de afgesproken route; eerder ontoegankelijke documentlinks worden niet als werkend voorgesteld.

## Open controle

Taak maat-invoice-drop-20261101 review/local. Eigen beoordeling slepen uit Finder/Downloads, highlight/actieve naam, kiezer daarna/drop daarna, verkeerd/meerdere/te grote bestanden, bestandsheader/leesfout, bestaande bedragen behouden, busy/twee acties, modal/inline/bronwissel, feedback en financiële acceptatie blijft open. Geen bewezen werking of gebruikersacceptatie uit alleen bronwerk; bestaande gegevens/bestanden/wijzigingen/staging/gebruikersstatus behouden. Niet live gepubliceerd.
