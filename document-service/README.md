# Gratis Word/PDF-dienst

Deze dienst vult dezelfde Word-templates als het lokale CRM. De vier documenttypes en de bestaande variabelen blijven werken. Documentgegevens worden via HTTPS en een geheime bearer-token doorgestuurd; de dienst heeft geen CRM-database of Tikkie-sleutels. Opgeslagen documenten blijven in Cloudflare R2.

## Render

Gebruik het kleine pakket uit `npm run prepare:render` voor een afzonderlijke GitHub-repository, of gebruik deze CRM-repository. Kies **Web Service → Docker → Free**, met `document-service/Dockerfile` en build context `.`. De Blueprint `render.yaml` bevat dezelfde instellingen. Er is geen database of betaalde disk nodig.

Stel `CRM_DOCUMENT_SERVICE_TOKEN` in als geheime omgevingsvariabele. Dezelfde waarde komt in Cloudflare Secrets. De lokale privéwaarde staat in `.local/render-secrets.env`; upload dat bestand niet naar GitHub. Zet na het starten de ontvangen `https://….onrender.com`-URL als `CRM_DOCUMENT_SERVICE_URL` in Cloudflare. `/health` moet 200 geven; alle conversie- en downloadroutes vereisen het geheime token.

Render Free gaat na stilstand slapen. De eerste conversie kan daardoor circa een minuut extra duren. De previewdownloads zitten maximaal één uur in een begrensde cache van 64 MB. Herstart of slaapstand kan die tijdelijke cache wissen; maak dan een nieuw voorbeeld. Definitief opgeslagen bestanden staan blijvend bij de order in R2.

De container gebruikt LibreOffice en de Arial-compatibele systeemfonts Arimo/Liberation. De originele Word-opmaak en templates blijven behouden, maar controleer na de eerste Render-deploy de PDF-opmaak met een voorbeeld. De container is lokaal niet gestart omdat Docker hier niet is geïnstalleerd; de HTTP-handler, conversie en downloads zijn wel met de aanwezige lokale LibreOffice-runtime gecontroleerd.

Er worden geen inhoud, secrets of privé-downloadtokens gelogd. Bij een ontbrekend token start de dienst niet. Conversies lopen één voor één; tijdelijke werkbestanden verdwijnen na elke omzetting.
