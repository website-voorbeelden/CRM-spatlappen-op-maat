import {confirmReportDevice} from './report-device.js?v=weekly-report-push-20261027';
import {notificationIntervalMinutes,notificationHeartbeatGraceSeconds} from '../../shared/notification-schedule.js?v=cost-control-20261024';
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const iphone=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const supported=()=>('serviceWorker' in navigator)&&('PushManager' in window)&&('Notification' in window);
const unbase64=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4)),c=>c.charCodeAt(0));
const deviceId=async sub=>sub?[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(sub.endpoint)))].map(n=>n.toString(16).padStart(2,'0')).join(''):'';
function paymentDeliveryText(delivery){
 if(!delivery)return '';
 if(!delivery.available)return 'De bezorgstatus van betaalmeldingen kon niet worden gelezen. Dit zegt niets over de betaling zelf.';
 const latest=delivery.latest;
 if(!latest)return 'Geen betaalmelding gevonden in de afgelopen zeven dagen sinds deze apparaatkoppeling. Een opgeslagen betaling is geen bewijs dat er een telefoonmelding is klaargezet.';
 const date=new Date(latest.createdAt).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'});
 const labels={accepted:'door de pushdienst geaccepteerd; dit bevestigt geen weergave op je telefoon',pending:latest.attempts?'aanbieden nog niet gelukt; wacht op een volgende poging':'wacht op de eerste bezorgpoging',failed:'aanbieden mislukt; er volgt voor deze melding geen nieuwe poging',cancelled:'geannuleerd; de betaling of apparaatkoppeling voldeed bij bezorging niet meer aan de voorwaarden',expired:'bezorgtermijn verstreken; er volgt voor deze melding geen nieuwe poging','not-prepared':'melding aangemaakt; bezorging op dit apparaat nog niet klaargezet'};
 return 'Laatste betaalmelding ('+date+'): '+(labels[latest.status]||'bezorgstatus onbekend')+'.';
}
export function createMobileNotifications({company,runtime}){
 let status=null,error='',notice='',phase='',busy=false,subscribed=false,browserSubscription=null,deferredInstall=null,mounted=null,refreshSequence=0;
 const online=()=>runtime.mode==='cloud'&&!runtime.local&&!runtime.offlineReview&&location.protocol==='https:';
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;if(mounted)paint(mounted);});
 window.addEventListener('appinstalled',()=>{deferredInstall=null;notice='Het CRM is geïnstalleerd. Open het via het icoon op je beginscherm.';if(mounted)paint(mounted);});
 async function api(action,body){
  let response;try{response=await fetch('/api/crm/notifications/'+action,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},cache:'no-store',signal:AbortSignal.timeout(20000),...(body?{body:JSON.stringify({...body,companyId:company.id})}:{})});}catch{throw Error('De verbinding is onderbroken. Haal de status opnieuw op voordat je verdergaat.');}
  const data=await response.json().catch(()=>({error:'De server gaf geen bruikbare meldingenstatus. Probeer opnieuw.'}));
  if(response.status===401)throw Error('Je CRM-login is verlopen. Meld je opnieuw aan en herstel daarna de koppeling op dit apparaat.');
  if(!response.ok)throw Error(data.error||'Meldingen instellen lukt niet.');return data;
 }
 function markup(){
  return `<section class="panel mobile-notifications-panel" data-mobile-notifications><h2>Telefoon & meldingen</h2><p>Tikkiecontrole en meldingen voor betalingen en vrijdagrapporten op je telefoon. Je laptop hoeft niet open te blijven.</p><div class="mobile-notification-status" data-mobile-notification-status role="status" aria-live="polite">${online()?'Meldingenstatus ophalen…':'Open hiervoor de online CRM-versie op je telefoon.'}</div><p class="form-help" data-mobile-payment-status></p><ol class="mobile-notification-steps"><li data-mobile-step="install"></li><li data-mobile-step="server"></li><li data-mobile-step="device"></li></ol><div class="actions"><button type="button" data-mobile-notify="install">Op beginscherm zetten</button>${online()?'<button class="primary" type="button" data-mobile-notify="enable" disabled>Meldingen aanzetten</button><button type="button" data-mobile-notify="disable" hidden>Meldingen op dit apparaat uitzetten</button>':''}</div><p class="form-help" data-mobile-install-help>iPhone: open de online CRM-link in Safari, kies Delen → Zet op beginscherm en open daarna dat icoon. Android: kies Installeren of Toevoegen aan startscherm in het browsermenu.</p><p class="form-help" data-mobile-notification-notice role="status"></p><details class="form-details"><summary>Status & uitleg</summary><p data-mobile-server-status></p>${online()?'<button type="button" data-mobile-notify="refresh">Status opnieuw ophalen</button>':''}<p class="form-help">Toestemming geldt per apparaat en bedrijf. Geen klantnaam, bedrag of rapportcijfers op je vergrendelscherm. Vrijdagrapporten vragen een aangezette planning bij Analytics → Rapporten; aantikken opent de juiste editie. Op toestellen die actieknoppen ondersteunen verschijnt Rapport bekijken. Je bevestigt zelf elke factuur of mail. Bij een actieve zakelijke Tikkie-koppeling controleert de server elke vijftien minuten een volgende groep CRM-betaallinks en registreert bewezen ontvangsten. Bij veel links of storingen duurt een volledige ronde langer. Gewone bankoverschrijvingen registreer je zelf; zelf ingevoerde betalingen geven geen telefoonmelding. Handmatig Tikkie controleren blijft beschikbaar; nieuwe providerontvangsten kunnen wel worden gemeld.</p><p class="form-help">Bij uitloggen of verlopen login stopt de server met sturen. Meld je opnieuw aan en kies Koppeling herstellen. Uitzetten verwijdert de serverkoppeling én het browserabonnement; browsertoestemming beheer je via je telefooninstellingen. Een al aangeboden melding kan nog later binnenkomen.</p></details></section>`;
 }
 function paint(root){
  const box=root.querySelector('[data-mobile-notifications]');if(!box)return;
  const canPush=supported(),installed=standalone(),permission=canPush?Notification.permission:'unsupported';
  let message=phase||error;
  if(!message)message=!online()?'Gebruik de beveiligde online CRM-link. Localhost op je telefoon verwijst naar de telefoon zelf.':iphone()&&!installed?'Zet het CRM eerst op je beginscherm en open het via dat icoon.':!canPush?'Deze browser ondersteunt geen pushmeldingen. Gebruik een actuele telefoonbrowser.':permission==='denied'?'Meldingen zijn geblokkeerd. Sta ze toe in je browser- of telefooninstellingen en haal de status opnieuw op.':!status?'Haal de status op om te zien of de server klaarstaat.':!status.ready?status.reason||'De serverinrichting is nog niet compleet.':subscribed&&browserSubscription&&permission==='granted'?status.backgroundHealthy?'Dit apparaat is aangemeld voor telefoonmeldingen.':'Dit apparaat is aangemeld. De achtergrondcontrole is nog niet recent bevestigd.':status.requiresReconnect||browserSubscription?'Er staat nog een browserkoppeling. Herstel die voor je huidige login, of zet meldingen op dit apparaat uit.':'De server staat klaar. Je kunt telefoonmeldingen aanzetten.';
  box.querySelector('[data-mobile-notification-status]').textContent=message;
  box.querySelector('[data-mobile-notification-notice]').textContent=notice;
  box.querySelector('[data-mobile-payment-status]').textContent=!status?'':status.paymentPolling?'Automatische Tikkiecontrole staat aan: elke vijftien minuten een controleronde, ook met gesloten CRM. Telefoonmeldingen vragen daarnaast jouw toesteltoestemming.':status.paymentPollingEnabled?'Automatische Tikkiecontrole is aangezet, maar de zakelijke Tikkie-koppeling is niet compleet.':'Automatische Tikkiecontrole staat nog uit. Je telefoon aanmelden zet deze servercontrole niet zelf aan.';
  const step=(name,done,text)=>{const el=box.querySelector('[data-mobile-step='+name+']');el.dataset.complete=String(done);el.textContent=(done?'✓ ':'○ ')+text;};
  step('install',installed,installed?'CRM geopend als app':'CRM op je beginscherm zetten');
  step('server',!!status?.ready,status?.ready?'Serverinrichting aanwezig':'Online meldingenserver inrichten');
  step('device',!!(subscribed&&browserSubscription&&permission==='granted'),subscribed&&browserSubscription&&permission==='granted'?'Dit apparaat is gekoppeld':'Dit apparaat toestemming geven en koppelen');
  const details=[status?.paymentPolling&&status.lastPaymentCheckAt?'Laatste volledige Tikkieronde: '+new Date(status.lastPaymentCheckAt).toLocaleString('nl-NL')+'.':'',status?.lastCheckedAt?'Laatste servercontrole: '+new Date(status.lastCheckedAt).toLocaleString('nl-NL')+'.':status?.ready?'De achtergrondtaak heeft zich nog niet gemeld.':'',status?.ready&&!status.backgroundHealthy?'Er is geen geslaagde controle in de afgelopen '+(status.backgroundGraceMinutes||notificationHeartbeatGraceSeconds/60)+' minuten bevestigd. Controleer de achtergrondtaak voordat je op meldingen vertrouwt.':'',status?.lastError||'',status?.deliveryIssues?'Een of meer meldingen konden niet worden aangeboden. Dit is geen bewijs van aflevering op je telefoon.':'',status?.ready?(status.paymentPolling?'Automatische Tikkiecontrole: elke '+(status.paymentPollingIntervalMinutes||notificationIntervalMinutes)+' minuten een controleronde. Maximaal twee links per ronde; bij meer links duurt het langer.' : status.paymentPollingEnabled?'Automatische Tikkiecontrole staat aan, maar de zakelijke Tikkie-koppeling ontbreekt of is niet compleet.':'Automatische Tikkiecontrole staat uit. Nieuwe ontvangsten via de knop Tikkie controleren kunnen wel worden gemeld. Zelf ingevoerde betalingen geven geen telefoonmelding.'):''];
  details.push(paymentDeliveryText(status?.paymentDelivery));
  if(subscribed&&!status?.reportCapable)details.push('Dit apparaat is gekoppeld voor betalingsmeldingen. Werk de app via de knop hierboven bij voor vrijdagrapporten.');
  box.querySelector('[data-mobile-server-status]').textContent=details.filter(Boolean).join(' ')||'De serverstatus wordt hier getoond zodra de online koppeling beschikbaar is.';
  for(const button of box.querySelectorAll('button'))button.disabled=busy;
  const installButton=box.querySelector('[data-mobile-notify=install]');installButton.hidden=installed;
  const enable=box.querySelector('[data-mobile-notify=enable]'),disable=box.querySelector('[data-mobile-notify=disable]');
  if(enable){enable.hidden=!!(subscribed&&browserSubscription&&permission==='granted'&&status?.reportCapable);enable.disabled=busy||!canPush||(iphone()&&!installed)||permission==='denied'||!status?.ready;enable.textContent=subscribed&&!status?.reportCapable?'App bijwerken voor rapportmeldingen':status?.requiresReconnect||browserSubscription?'Koppeling herstellen':'Meldingen aanzetten';}
  if(disable){disable.hidden=!browserSubscription&&!subscribed;disable.disabled=busy;}
  box.setAttribute('aria-busy',String(busy||!!phase));
 }
 async function refresh(root){
  const sequence=++refreshSequence;
  const registration=await navigator.serviceWorker?.getRegistration('/'),sub=await registration?.pushManager?.getSubscription();
  if(sequence===refreshSequence)browserSubscription=sub||null;
  const device=await deviceId(sub),result=await api('status'+(device?'?device='+device:''));
  if(sequence!==refreshSequence)return;
  browserSubscription=sub||null;status=result;subscribed=!!result.subscribed;paint(root);
 }
 function progress(message){phase=message;if(mounted)paint(mounted);}
 async function waitForWorker(){
  const reg=await navigator.serviceWorker.register('/crm-offline-sw.js',{scope:'/',updateViaCache:'none'});
  await reg.update();
  let timeout;
  const ready=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('De app wordt nog voorbereid. Probeer het aanzetten zo opnieuw.')),90000);})]).finally(()=>clearTimeout(timeout));
  if(ready.scope!==reg.scope)throw Error('De meldingenservice hoort niet bij deze app.');
  const updating=reg.installing||reg.waiting;
  if(updating&&updating.state!=='activated')await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{updating.removeEventListener('statechange',changed);reject(Error('De app-update is nog niet klaar. Probeer het aanzetten zo opnieuw.'));},90000);
   function changed(){if(updating.state==='activated'||updating.state==='redundant'){clearTimeout(timer);updating.removeEventListener('statechange',changed);if(updating.state==='activated')resolve();else reject(Error('De app-update kon niet worden voorbereid. Probeer opnieuw.'));}}
   updating.addEventListener('statechange',changed);changed();
  });
  return ready;
 }
 async function removeBrowserSubscription(sub,registration){
  if(!sub)return;
  try{await sub.unsubscribe();}catch{throw Error('De serverkoppeling is uit, maar de browserkoppeling kon nog niet worden verwijderd. Probeer Uitzetten opnieuw.');}
  browserSubscription=await registration.pushManager.getSubscription();
  if(browserSubscription)throw Error('De serverkoppeling is uit, maar de browserkoppeling kon nog niet worden verwijderd. Probeer Uitzetten opnieuw.');
 }
 async function enable(){
  // Permission starts in the actual click handler, before any awaited request.
  const permissionPromise=Notification.requestPermission();progress('Wachten op je toestemming…');
  if(await permissionPromise!=='granted')throw Error('Geef toestemming voor meldingen op dit apparaat.');
  progress('CRM op dit apparaat voorbereiden…');const ready=await waitForWorker();
  let sub=await ready.pushManager.getSubscription();browserSubscription=sub;
  if(sub){const key=sub.options.applicationServerKey,expected=unbase64(status.publicKey);if(key&&Array.from(new Uint8Array(key)).join(',')!==Array.from(expected).join(',')){
   progress('Oude koppeling vervangen…');await api('unsubscribe',{endpoint:sub.endpoint});subscribed=false;await removeBrowserSubscription(sub,ready);sub=null;
  }}
  progress('Browserkoppeling maken…');sub??=await ready.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:unbase64(status.publicKey)});browserSubscription=sub;
  progress('Koppeling op de server bevestigen…');await api('subscribe',{subscription:sub.toJSON()});subscribed=true;
  progress('Rapportmeldingen op dit apparaat voorbereiden…');
  const reportCapable=await confirmReportDevice(ready,{companyId:company.id}).catch(()=>false);
  status={...status,requiresReconnect:false,reportCapable};notice=reportCapable?'Dit apparaat is gekoppeld voor betalingen en geplande vrijdagrapporten. Dit bevestigt nog geen aflevering.':'Betalingsmeldingen zijn gekoppeld. De rapportupdate is nog niet bevestigd; kies App bijwerken voor rapportmeldingen om opnieuw te proberen.';
 }
 async function disable(){
  progress('Meldingen op de server uitzetten…');const reg=await navigator.serviceWorker.getRegistration('/'),sub=await reg?.pushManager?.getSubscription();
  if(!sub)throw Error('De browserkoppeling is niet meer beschikbaar. Haal de status opnieuw op.');
  browserSubscription=sub;
  // Keep the browser endpoint available when server revocation fails. Retrying
  // can then finish revocation instead of leaving an invisible server device.
  await api('unsubscribe',{endpoint:sub.endpoint});subscribed=false;if(status)status={...status,subscribed:false,requiresReconnect:false};
  progress('Browserkoppeling verwijderen…');await removeBrowserSubscription(sub,reg);
  notice='Telefoonmeldingen staan op dit apparaat uit. Je CRM-gegevens blijven behouden.';
 }
 function install(root){
  const box=root.querySelector('[data-mobile-notifications]');if(!box)return;mounted=root;paint(root);
  box.addEventListener('click',async event=>{
   const action=event.target.closest('[data-mobile-notify]')?.dataset.mobileNotify;if(!action||busy)return;
   busy=true;error='';notice='';++refreshSequence;paint(root);
   try{
    if(action==='install'){
     if(deferredInstall){await deferredInstall.prompt();const choice=await deferredInstall.userChoice;deferredInstall=null;notice=choice.outcome==='accepted'?'Open het CRM via het icoon op je beginscherm.':'Installeren geannuleerd. Je kunt het later opnieuw proberen.';}
     else{box.querySelector('[data-mobile-install-help]').scrollIntoView({block:'nearest'});notice='Gebruik de stappen hierboven in het browsermenu.';}
    }else if(action==='enable')await enable();
    else if(action==='disable')await disable();
    else{progress('Status ophalen…');await refresh(root);}
   }catch(problem){error=problem.message||'Meldingen instellen lukt niet.';}
   finally{busy=false;phase='';paint(mounted||root);}
  });
  if(online()&&!busy){const sequence=refreshSequence+1;progress('Meldingenstatus ophalen…');void refresh(root).catch(problem=>{if(sequence===refreshSequence)error=problem.message;}).finally(()=>{if(sequence===refreshSequence){phase='';if(mounted)paint(mounted);}});}
 }
 return {markup,install};
}
