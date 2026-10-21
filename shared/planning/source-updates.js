// Bouwvoortgang vanuit code. Beheer via scripts/build-task.mjs; geen klantgegevens.
export const sourceUpdates = [
  {
    "id": "inquiry-form-source-20261021",
    "taskId": "request-recognition-next",
    "companies": [
      "spatlappen",
      "maatwerkkunststof"
    ],
    "at": "2026-10-21T09:37:15.254859+00:00",
    "author": "Codex · bronlog 21 oktober",
    "delivery": "local",
    "status": "doing",
    "note": "Deelstap formulierherkenning lokaal: aparte bedrijfsafzenders behouden, Product begrensd vóór Aantal, eigen bronpagina bewaren/compact tonen, twee witte kunststof blokken en postfixdikte herkennen, HTML-entiteiten passief decoderen. Materiaal/dikte naar Maat-productvelden; onzekere meerdere producten niet mengen. Geen echte klant-/ordergegevens gewijzigd, verwerking niet ingeschakeld. Hele taak blijft open voor aparte productregels en gerichte ontbrekende-gegevensflow. Zie docs/AANVRAAGHERKENNING.md.",
    "evidence": "Alleen bron gelezen/bewerkt en roadmapdocument gegenereerd. Geen tests/syntaxchecks/build/browser-QA/providerproeven/publicatie; Philippe test zelf. Bedoeld voorbeeld: aantal2, POM, wit, breedte70/hoogte95/dikte12mm. Schroefafstand blijft mailtekst. Werkelijke MIME niet onderzocht."
  },
  {
    "id": "build-source-log-20261021",
    "taskId": "build-task-board",
    "companies": [
      "spatlappen",
      "maatwerkkunststof"
    ],
    "at": "2026-10-21T09:37:15.254859+00:00",
    "author": "Codex · bronlog 21 oktober",
    "delivery": "local",
    "status": "review",
    "note": "Op expliciete gebruikerscorrectie geen handmatige UI-bouwlogs meer. Append-only bronnotities via scripts/build-task.mjs en shared/planning/source-updates.js, stabiele IDs, lock en atomair schrijven. Gedeelde baseline/projectie toont bedrijfseigen bronnotities naast oude opmerkingen, met label Broncode, zoekfunctie en AI-export. Bestaande opgeslagen status blijft leidend; geen automatische DB-mutatie. AGENTS/BOUWTAKEN bijgewerkt. Nieuwe route wacht op eigen gebruikerscontrole; historische afgeronde gebruikersrecords niet heropend.",
    "evidence": "CLI alleen gebruikt voor echte projectnotities, geen functionele tests/build/browser-QA of database/provideractie. Bron gelezen. Eerdere handmatige Maat-notitie van deze run blijft als historie; Spat niet handmatig opgeslagen."
  },
  {
    "id": "direct-purchase-20261021",
    "taskId": "consistent-workspace",
    "companies": [
      "maatwerkkunststof"
    ],
    "at": "2026-10-21T09:50:52.310898+00:00",
    "author": "Codex · inkoop bij order 21 oktober",
    "status": "doing",
    "delivery": "local",
    "note": "Maat-Inkoop & marge compact gemaakt: leverancier en bestelreferentie direct op losse order, per-stukinkoop en eigen kosten, leveranciersfactuur toevoegen met preview/download/verwijderen. Geen verplichte aparte inkoop. Bestaande inkoop met precies één klantorder via hetzelfde formulier, eigen kostenscope behouden; multiorder blijft gezamenlijk. Nieuwste order/purchase en relatie opnieuw controleren in één state/files-transactie. Factuurfiles met interne supplierDocument-rol onder Overige, geen klantfactuur/betaallink, btw alleen ongeclassificeerde bron. Calculator/gezamenlijke koppeling rustiger onder extra onderdelen. Zie docs/INKOOP-BIJ-ORDER.md; hele werkplektaak blijft open.",
    "evidence": "Bron gelezen en lokaal aangepast. Geen tests, syntaxchecks, builds, functionele browser-QA, providerproeven, echte klant-/order-/betaal-/mailmutaties of publicatie. Philippe controleert zelf. Geen OCR of automatische kost-/betaal-/btw-boeking. Leveranciersbetalingenreconciliatie, meerdere leveranciers en voorraad/deellevering niet uitgebreid. Bouwlog uitsluitend via code."
  },
  {
    "id": "money-basis-20261021",
    "taskId": "consistent-workspace",
    "companies": [
      "spatlappen",
      "maatwerkkunststof"
    ],
    "at": "2026-10-21T09:59:59.486251+00:00",
    "author": "Codex · bedragbasis 21 oktober",
    "status": "doing",
    "delivery": "local",
    "note": "Presentatie gedeeld: verkoop/kosten/marge primair excl. btw, klantontvangsten/betaallinks/saldo incl. btw apart. Nieuwe gedeelde basislabels en orderheadercomponent; lijst primair netto met bruto betaalinfo, betalingsopbouw net → btw → bruto, Analytics resultaat en ontvangen geld in aparte vakken. Invoer-/correctielabels en dashboard/orderkaart gelijkgetrokken. Historische leveranciersdocument-btw-basis niet gokken: documentbedrag/overgemaakt met uitleg. Geen bedrag- of formulerecalculatie. Zie docs/BEDRAGEN-EN-BTW.md. Hele werkplektaak blijft open.",
    "evidence": "Alleen bron gelezen/bewerkt, documentatie/bronlog en roadmapgeneratie. Geen tests/syntaxchecks/build/browser-QA/providerproeven/echte financiële mutaties/publicatie. Philippe controleert zelf. Geen btw-splitsing van bankontvangsten, geen wijziging bestaande facturen of supplier betaaldata. Legacy leveranciers-btw-splitsing/reconciliatie blijft vervolgwerk."
  },
  {
    "id": "product-thickness-20261021",
    "taskId": "product-thickness-20261021",
    "companies": [
      "maatwerkkunststof"
    ],
    "at": "2026-10-21T10:15:30.496994+00:00",
    "author": "Codex · productdikte 21 oktober",
    "status": "review",
    "delivery": "local",
    "note": "Oorzaak: customerExecutionDetails gaf voor Maat een lege lijst terug ondanks bestaand productveld thickness. Materiaal/dikte nu vaste publieke documentdetails en gestructureerde snapshot per product bij nieuwe offerte/orderbevestiging/proforma/factuur/pakbon. Geen nieuwe Wordtemplate nodig: bestaande dynamische detailregels. Ontbrekende dikte met directe order-invulhulp en terugkeer/invoerbehoud; aanvraag zelf mag onvolledig blijven. Revisies bewaren bronmetadata; actuele producten bewust laden. Maat-Analytics Materialen & diktes plus materiaal/exacte mm-filters en doorklik toegevoegd, onbekend apart, telling dossiers/regels/geregistreerde stuks zonder financiële dubbeltelling. Zie docs/DIKTE-EN-PRODUCTDATA.md.",
    "evidence": "Alleen broninspectie/-bewerking en administratie via code. Geen tests, syntaxchecks, builds, browser-QA, Word/PDF-renderproef, provideracties, echte dossier-/documentmutaties of publicatie. Philippe controleert zelf. Geen oude PDF/tekst naar cijfers gemigreerd; productveld blijft bron. Bestaande interne/Spat-notities niet naar Maat-documenten gekopieerd."
  },
  {
    "id": "invoice-payment-status-20261021",
    "taskId": "invoice-payment-status-20261021",
    "companies": [
      "spatlappen",
      "maatwerkkunststof"
    ],
    "at": "2026-10-21T10:24:29.588891+00:00",
    "author": "Codex · factuur-betaalstand",
    "status": "review",
    "delivery": "local",
    "note": "Gedeelde factuurconverter met Nog niet voldaan / Aanbetaling voldaan / Voldaan, lange stempels twee gecentreerde regels en automatisch groeiende cel. Documentkaart toont uitsluitend bewaarde betaalstand bij aanmaken, percentage en ontvangen/open incl. btw; onbekende snapshot niet invullen met actuele order. Bestaande PDF/Word-groepering behouden, melding bij opnieuw maken volledige orderfactuur. Bestaande bestanden intact. Geen aparte deel-/restfacturen of wijziging boekingen; eigen controle en publicatie open.",
    "evidence": "Bron en repository-template-XML gelezen, bronwijzigingen doorgevoerd. Geen tests, syntaxchecks, builds, browser-QA, documentrenderproeven, echte dossiers/provideracties of publicatie uitgevoerd volgens gebruikersafspraak. Lokale generator start per verzoek, geen serverherstart nodig."
  },
  {
    "id": "delivery-map-20261021",
    "taskId": "delivery-map-20261021",
    "companies": [
      "spatlappen",
      "maatwerkkunststof"
    ],
    "at": "2026-10-21T10:40:49.666878+00:00",
    "author": "Codex · orderkaart en bezorgroute",
    "status": "review",
    "delivery": "local",
    "note": "Orderkaart als uitvoeringswerkplek: standaard In productie, fysieke order-/batchvoortgang, filters fase/levering/leverwijze/zoektekst en volledige orderlijst incl. onbekende locaties. Kiezen batch toont alle fases, directe kaartlink vanuit batchorders. Optionele tabblad-routeschets met vertrek, retour, orderkeuze en stopvolgorde; Google Maps-URL’s per klik en in delen zonder stops afkappen. Geen optimale route of wegafstand/tijd berekend. Bestaande kostenvergelijking blijft apart. Ontbrekende leverafspraak direct bewerken, adres via bestaande ordertab, actuele gegevenscontrole bij linkklik. Geen order-/voorraad-/betaal-/Gmailmutaties of externe adresopvraag tijdens bouwen. Gebruikercontrole/publicatie open.",
    "evidence": "Bestaande implementatie en recente bronwijzigingen gelezen, bewerkte bron handmatig nagelezen; officiële Google Maps URL-documentatie geraadpleegd zonder klantadressen. Geen tests, syntaxchecks, builds, browser-QA, providerproeven of publicatie uitgevoerd volgens gebruikersafspraak. Bouwlog uitsluitend via code."
  }
];
