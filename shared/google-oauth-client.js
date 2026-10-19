// Validate only the supported downloaded client format. Never echo credentials
// in errors; callers must keep the original JSON out of logs and CRM storage.
export function parseGoogleDesktopClient(text){
 const fail=message=>{throw Object.assign(Error(message),{field:'credentials'});};
 if(typeof text!=='string'||text.length>20000)fail('Gebruik de kleine OAuth-client JSON van Google (maximaal 20 kB).');
 let parsed;try{parsed=JSON.parse(text.replace(/^\uFEFF/,''));}catch{fail('Dit is geen geldige JSON. Kies het gedownloade Google OAuth-clientbestand.');}
 if(parsed?.web&&!parsed.installed)fail('Dit bestand hoort bij een Web-app. Maak in Google Cloud een OAuth-client van het type Desktop-app en download daarvan de JSON.');
 const client=parsed?.installed;
 if(!client||typeof client.client_id!=='string'||!/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/.test(client.client_id)||typeof client.client_secret!=='string'||!client.client_secret||client.client_secret.length>1000)fail('Gebruik een OAuth-client van het type Desktop-app. Dit is niet het juiste Google-clientbestand.');
 return {clientId:client.client_id,clientSecret:client.client_secret};
}

// The cloud callback is fixed by the server, never by the uploaded JSON.
export function parseGoogleWebClient(text,redirectUri){
 const fail=message=>{throw Object.assign(Error(message),{field:'credentials'});};
 if(typeof text!=='string'||text.length>20000)fail('Gebruik de kleine Google Web-app JSON (maximaal 20 kB).');
 let parsed;try{parsed=JSON.parse(text.replace(/^\uFEFF/,''));}catch{fail('Dit is geen geldige Google-client JSON.');}
 const client=parsed?.web;
 if(!client||parsed.installed)fail('Voor het online CRM heb je een OAuth-client van het type Web-app nodig. De Desktop-app JSON hoort bij de lokale versie.');
 if(typeof client.client_id!=='string'||!/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/.test(client.client_id)||typeof client.client_secret!=='string'||!client.client_secret||client.client_secret.length>1000)fail('Dit is geen geldige Google Web-app-client.');
 if(!Array.isArray(client.redirect_uris)||!client.redirect_uris.includes(redirectUri))fail('Voeg eerst de terugkeer-URL van dit CRM toe bij de Google Web-app-client en download de JSON opnieuw.');
 return {clientId:client.client_id,clientSecret:client.client_secret};
}
