# Overdracht voor de andere AI: Outlook-leeskoppeling

Bereid een Microsoft Entra-appregistratie voor om info@bouwmarktxl.nl via Microsoft Graph alleen te lezen.

1. Controleer eerst of dit een echte Microsoft365-mailbox is, of Outlook alleen als IMAPclient wordt gebruikt, en of het een eigen of gedeelde mailbox is. Een gedeelde mailbox vraagt een aangepaste toegang; niet zomaar iets anders aanmelden.
2. Maak een Web-appregistratie: Maatwerkkunststof CRM – leveranciersmail. Gebruik voor deze zakelijke mailbox de passende organisatietenant.
3. Web-terugkeeradres exact: https://crm.maatwerkkunststof.nl/api/crm/supplier-mail/callback
4. Delegated permissions: User.Read en Mail.Read. Blijvende toegang via offline_access. GEEN Mail.Send of Mail.ReadWrite; uitgaand gebruikt de CRM een aparte SMTP2GO-route.
5. Noteer Tenant ID, Client ID en de vervaldatum van het client secret. De secretwaarde alleen beveiligd bewaren voor de serverinstallatie, niet in chat/openbare bestanden/GitHub. De benodigde servernamen zijn CRM_OUTLOOK_TENANT_ID, CRM_OUTLOOK_CLIENT_ID en secret CRM_OUTLOOK_CLIENT_SECRET.
6. Geen mailbox verhuizen, Outlookinstellingen vervangen, doorstuurregels instellen of bestaande apps/consent verwijderen. Geen berichten versturen/wijzigen of onbeperkte inboxexport doen.

De CRM-bouwer sluit de server op dezelfde bedoelde Maatomgeving aan en begeleidt daarna de Microsoft-aanmelding/consent. Alleen mails van noreply@kunststofbaas.nl selecteren; het Mail.Read-recht zelf geldt voor de aangemelde mailbox en is niet technisch tot die ene afzender beperkt. Originele PDF als controleerbaar voorstel bij de juiste order, geen automatische kosten/betaling. De koppeling is momenteel NIET actief.

Je hoeft geen TJWorx-mailbox aan te maken. Voor uitgaande pakbon/labelmail is info@bouwmarktxl.nl het voorstel, met eigen afzenderverificatie in de bestaande verzenddienst. Dit staat los van deze alleenlezen Microsoft-toegang.
