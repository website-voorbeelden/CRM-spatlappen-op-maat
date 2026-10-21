# Publieke appinformatie voor Google OAuth

Op18oktober2026 openbare pagina’s voor Spatlappen CRM aangemaakt op crm.spatlappenopmaat.nl: / (homepage), /privacy en /terms. Bron public-info/. Uitsluitend deze routes en robots.txt zijn via middleware publiek voor GET/HEAD; CRM/API/OAuth-callback houden bestaande authenticatie. Public-info wordt alleen bij Spatlappen-build geplaatst. Login krijgt links naar uitleg/privacy/voorwaarden. Meta+X-Robots-Tag noindex,follow; robots laat publieke pagina’s crawlbaar zodat noindex en Googlebeoordeling kunnen werken. Geen garantie dat zoekmachines noindex meteen verwerken, geen beveiliging door robots.

Privacy volgt huidige gmail.readonly, encrypted tokenstore, verbinding verbreken zonder automatische dossierverwijdering, expliciete AI-opdrachten en optionele Search Console/Analytics. Geen fictieve bewaartermijn, Googlegoedkeuring of auditcertificering claimen. Contact voorlopig het bekende zakelijke beheeradres; zorg dat dit overeenkomt met het supportadres in Google Auth Platform.

Nog instellen/controleren door eigenaar in Google Auth Platform:
- Appnaam consistent: Spatlappen CRM (of pagina’s aanpassen aan werkelijke consentnaam).
- Apphome https://crm.spatlappenopmaat.nl/ ; privacy https://crm.spatlappenopmaat.nl/privacy ; voorwaarden https://crm.spatlappenopmaat.nl/terms .
- Authorized domain spatlappenopmaat.nl en eigendomsverificatie Search Console door eigenaar/editor van Google Cloud-project.
- Webclient redirect exact https://crm.spatlappenopmaat.nl/__local/assistant/gmail-callback .
- Werkelijke scopes aangeven: Gmail gmail.readonly; alleen bij aparte marketingkoppeling webmasters.readonly/analytics.readonly.
- Alleen benodigde scopes, juiste support/developercontact, branding publiceren en indien nodig verificatiecentrum met scopeuitleg/demovideo. Geen Googlecredentials of instellingen door agent gewijzigd.
- Gmail readonly is restricted; serververwerking kan securityassessment/CASA vereisen. Persoonlijk gebruik/weinig bekende gebruikers kan een verificatie-uitzondering zijn; geen goedkeuringsgarantie of onnodige appopenstelling.

Bronnen geraadpleegd18oktober2026:
https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification
https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
https://developers.google.com/workspace/workspace-api-user-data-developer-policy
