# Supplier-mail worker — installatiebron, niet actief

Alleen Maatwerkkunststof. Lees ../../docs/KUNSTSTOFBAAS-BATCH3-20261101.md. Geen tests/deploy uitgevoerd. De voorbeeldconfig heeft geen actief schema en activering staat uit.

Maak later bewust een aparte Microsoft Web-app met delegated User.Read en Mail.Read, refresh via offline_access, callback `<CRM_PUBLIC_URL>/api/crm/supplier-mail/callback`. Geen Mail.Send of Mail.ReadWrite. Gebruik geen Gmail-app of Codex-connectortoken. Configuratie: CRM_OUTLOOK_CLIENT_ID, CRM_OUTLOOK_TENANT_ID (organisatietenant of expliciet organizations), secret CRM_OUTLOOK_CLIENT_SECRET. Verwachte mailbox is de afgesproken BouwmarktXL-mailbox; een gedeelde mailbox vraagt een afzonderlijk passende inrichting, niet raden.

CRM en scheduled worker moeten dezelfde bedoelde CRM-D1/R2, CRM_INTEGRATIONS_KEY, CRM_OUTLOOK_STORAGE_ID, CRM_RELEASE_ENV en publiek CRM-adres gebruiken. Pas install/storage-marker.sql alleen bewust in die omgeving toe en leg één nieuwe opslagidentiteit vast. Gebruik nooit productieopslag achter previewlabels. Er is hier niets toegepast of aangemaakt.

Eerst eigen controle via het normale ingelogde CRM: Koppel mailbox, vanafdatum, Microsoft-aanmelding, Mails ophalen, origineel bekijken, factuurvoorstel openen. Dit schrijft geen kosten. Pas na die beoordeling kunnen het gewenste cronrooster en CRM_OUTLOOK_AUTO_SYNC=true worden ingesteld; CRM_OUTLOOK_SUPPLIER_ENABLED=true is eveneens vereist. Onbekend/config ontbreekt blijft dicht. Geen voorbeeldcron of secrets ingevuld.

Providerlezen en staging zijn de enige automatische acties. Nooit mail verplaatsen/markeren/versturen of kosten/betalingen/PACKS boeken. Bestaande bron-PDF accepteren blijft bij de gewone financiële eigenaar. Bij logs uitsluitend tellers/stapcodes; geen token/body/PDF/adres of ruwe Microsoft-fout loggen.

Elke synchronisatie verwerkt maximaal één nieuwe bron (maximaal vier PDF’s). De expliciete CRM-klik kan maximaal zes stappen ophalen; cron doet één stap per run. Kies later bewust frequentie/hostinglimieten. Opnieuw koppelen en CRM-leestoegang loskoppelen staan bij Meer. Microsoft-consent intrekken blijft apart. Geen functietest of scheduler actief.
