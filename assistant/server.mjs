import {createLocalGoogleRoutes} from './google-routes.mjs';
import {createBrowserBridge} from './browser-bridge.mjs';
import {createServer} from 'node:http';
import {timingSafeEqual,createHmac} from 'node:crypto';
import {ChatGPTConnection} from './chatgpt-auth.mjs';
import {runAssistant} from './engine.mjs';
import {createLocalSpeech} from './local-speech.mjs';
import {createSpeechDiagnostics} from './speech-diagnostics.mjs';
import {createMailService} from './mail-service.mjs';
import {createGmailService} from './gmail-service.mjs';
import {createGmailActions} from './gmail-actions.mjs';
import {createFeedbackService} from './feedback-service.mjs';
const companies=new Set(['spatlappen','maatwerkkunststof']);
const equals=(a,b)=>typeof a==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function body(req){let size=0,parts=[];for await(const chunk of req){size+=chunk.length;if(size>(req.url?.startsWith('/mail-send')?15_000_000:4_000_000))throw Object.assign(Error('Te veel gegevens. Verklein de vraag of lokale dataset.'),{status:413});parts.push(chunk);}try{return JSON.parse(Buffer.concat(parts).toString()||'{}');}catch{throw Error('Ongeldige aanvraag.');}}
export async function startAssistantServer({key,directory,port=3030,connection:provided,speech:providedSpeech,mailDirectory,gmailDirectory,feedbackDirectory,fetchImpl=globalThis.fetch}){
 if(typeof key!=='string'||key.length<40)throw Error('Lokale assistentsleutel ontbreekt.');
 const shutdown=new AbortController();
 const speechDiagnostics=createSpeechDiagnostics();
 const feedback=createFeedbackService(feedbackDirectory);
 const network=(url,options={})=>fetchImpl(url,{...options,signal:AbortSignal.any([options.signal,shutdown.signal].filter(Boolean))});
 const routes=createLocalGoogleRoutes(directory?directory+'/../routes':'.local/routes',{fetcher:network});
 const mail=await createMailService(mailDirectory||(directory?directory+'/../mail':'.local/mail'),{fetchImpl:network});
 const gmail=await createGmailService(gmailDirectory||(directory?directory+'/../gmail':'.local/gmail'),{fetchImpl:network});
 // No Gmail executor is installed. OAuth grants alone cannot enable writes.
 const gmailActions=createGmailActions({directory:(gmailDirectory||(directory?directory+'/../gmail':'.local/gmail'))+'/actions',getIdentity:company=>gmail.permissionIdentity(company)});
 const speech=providedSpeech||await createLocalSpeech('.local/speech-runtime');
 const connection=provided||await new ChatGPTConnection(directory,{fetchImpl:network}).init();let activeRequest=false,activeJob=null;const cancelled=new Map();
 const bridge=await createBrowserBridge({directory:'.local/browser-bridge',connection,signal:shutdown.signal,run:async(input,signal)=>{if(activeRequest)throw Object.assign(Error('De assistent verwerkt al een vraag. Probeer zo opnieuw.'),{status:409});activeRequest=true;try{return await runAssistant({connection,companyId:input.companyId,state:input.state,message:input.message,history:input.history,model:input.model,context:input.context,task:input.task,mailContext:input.mailContext,guidance:input.guidance,requestId:input.requestId,signal,fetchImpl:network});}finally{activeRequest=false;}}});
 const server=createServer(async(req,res)=>{
  const json=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  let url;try{url=new URL(req.url,'http://127.0.0.1');}catch{return json({error:'Ongeldige route.'},400);}
  const actualPort=server.address().port;
  if(req.headers.host!=='127.0.0.1:'+actualPort)return json({error:'Onbekende lokale host.'},403);
  if(await bridge.handle(req,res,url,body))return;
  if(url.pathname==='/auth/callback'&&req.method==='GET'){
   let returnUrl=connection.pending?.returnUrl||'http://localhost:3010/admin/#assistant';
   try{const result=await connection.finish(url.searchParams);bridge.invalidate();returnUrl=result.returnUrl;res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'});res.end('<!doctype html><html lang="nl"><title>ChatGPT verbonden</title><body style="font-family:system-ui;padding:32px"><h1>ChatGPT gekoppeld</h1><p>Je kunt terug naar het CRM. Je Plus-gebruik blijft binnen de limieten van je abonnement.</p><a href="'+escape(returnUrl)+'">Terug naar de assistent</a></body></html>');}
   catch(e){res.writeHead(e.status||400,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'});res.end('<!doctype html><html lang="nl"><title>ChatGPT koppelen</title><body style="font-family:system-ui;padding:32px"><h1>Koppelen niet afgerond</h1><p>'+escape(e.message)+'</p><a href="'+escape(returnUrl)+'">Terug naar CRM</a></body></html>');}return;
  }
  if(url.pathname==='/gmail/callback'&&req.method==='GET'){
   try{const result=await gmail.finish(url.searchParams);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'});res.end('<!doctype html><html lang="nl"><title>Gmail gekoppeld</title><body style="font-family:system-ui;padding:32px"><h1>Gmail gekoppeld</h1><p>Ga terug naar het CRM. Verkoopfaselabels werken pas na afzonderlijke activering; mail versturen blijft via SMTP2GO.</p><a href="'+escape(result.returnUrl)+'">Terug naar CRM</a></body></html>');}
   catch(e){res.writeHead(400,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'});res.end('<!doctype html><html lang="nl"><title>Gmail koppelen</title><body style="font-family:system-ui;padding:32px"><h1>Koppelen niet afgerond</h1><p>'+escape(e.message)+'</p><p>Ga terug naar het CRM om opnieuw te koppelen.</p></body></html>');}return;
  }
  if(!equals(req.headers.authorization,'Bearer '+key))return json({error:'Geen toegang tot de lokale assistent.'},403);
  const companyId=req.headers['x-crm-company'];if(!companies.has(companyId))return json({error:'Onbekend bedrijf.'},403);
  if(['/login','/logout','/select'].includes(url.pathname))bridge.invalidate();
  if(url.pathname.startsWith('/route-')){try{
   const action=url.pathname.slice('/route-'.length),service=routes(companyId);
   if(action==='status'&&req.method==='GET')return json(await service.status());
   if(['configure','compute'].includes(action)&&req.method==='POST')return json(await service[action](await body(req)));
   return json({error:'Onbekende routeroute.'},404);
  }catch(error){return json({error:error.message||'Route verwerken lukt niet.'},error.status||400);}}
  if(url.pathname.startsWith('/feedback-')){try{
   if(url.pathname==='/feedback-list'&&req.method==='GET')return json({reports:await feedback.list(companyId)});
   if(url.pathname==='/feedback-create'&&req.method==='POST')return json(await feedback.create(companyId,await body(req)));
   if(url.pathname==='/feedback-import'&&req.method==='POST')return json(await feedback.import(companyId,(await body(req)).reports));
   if(url.pathname==='/feedback-status'&&req.method==='POST')return json(await feedback.status(companyId,await body(req)));
   return json({error:'Onbekende feedbackroute.'},404);
  }catch(e){return json({error:e.message||'Feedback verwerken lukt niet.'},e.status||400);}}
  if(url.pathname.startsWith('/gmail-')){try{
   if(url.pathname.startsWith('/gmail-actions-')){
    const origin=req.headers['x-crm-origin'];if(origin!=='http://localhost:'+(companyId==='spatlappen'?'3010':'3011')+'/')throw Error('Onbekende bevestigingssessie.');
    const context={session:createHmac('sha256',key).update(companyId+'|'+origin).digest('hex'),channel:'human'};
    if(url.pathname==='/gmail-actions-capabilities'&&req.method==='GET')return json(gmailActions.capabilities());
    if(url.pathname==='/gmail-actions-list'&&req.method==='GET')return json({proposals:gmailActions.list(companyId,context)});
    if(req.method==='POST'){const input=await body(req),action=url.pathname.replace('/gmail-actions-','');if(['propose','review','confirm','cancel'].includes(action))return json(await gmailActions[action](companyId,input,{...context,channel:action==='propose'?'proposal':'human'}));}
    return json({error:'Onbekende Gmail-voorstelroute.'},404);
   }
   if(url.pathname==='/gmail-phase-auto-status'&&req.method==='GET')return json(await gmail.phaseAuto(companyId,'status'));
   if(['/gmail-phase-auto-configure','/gmail-phase-auto-sync'].includes(url.pathname)&&req.method==='POST'){
    const origin=req.headers['x-crm-origin'];if(origin!=='http://localhost:'+(companyId==='spatlappen'?'3010':'3011')+'/')throw Error('Onbekende bevestigingssessie.');
    const input=await body(req),configure=url.pathname.endsWith('-configure');
    if(configure&&input.enabled===true&&req.headers['x-crm-gmail-confirm']!=='phase-auto-settings')throw Error('Bevestig eerst automatische faselabels.');
    if(input.confirmation&& !configure&&req.headers['x-crm-gmail-confirm']!=='phase-auto-resolution')throw Error('Bevestig eerst de conflictoplossing.');
    return json(await gmail.phaseAuto(companyId,configure?'configure':'sync',input));
   }
   if(url.pathname==='/gmail-status'&&req.method==='GET')return json(await gmail.status(companyId));
   if(url.pathname==='/gmail-configure'&&req.method==='POST')return json(await gmail.configure(companyId,await body(req)));
   if(url.pathname==='/gmail-login'&&req.method==='POST')return json(await gmail.start(companyId,{origin:req.headers['x-crm-origin'],redirectUri:'http://127.0.0.1:'+actualPort+'/gmail/callback',enablePhaseLabels:(await body(req)).enablePhaseLabels===true}));
   if(url.pathname==='/gmail-disconnect'&&req.method==='POST')return json(await gmail.disconnect(companyId));
   if(url.pathname==='/gmail-list'&&req.method==='POST')return json(await gmail.list(companyId,await body(req)));
   if(['/gmail-phase-review','/gmail-phase-apply'].includes(url.pathname)&&req.method==='POST'){
    const origin=req.headers['x-crm-origin'];if(origin!=='http://localhost:'+(companyId==='spatlappen'?'3010':'3011')+'/')throw Error('Onbekende bevestigingssessie.');
    if(url.pathname==='/gmail-phase-apply'&&req.headers['x-crm-gmail-confirm']!=='phase-labels')throw Error('Expliciete gebruikersbevestiging ontbreekt.');
    const session=createHmac('sha256',key).update(companyId+'|'+origin).digest('hex');return json(await gmail.phaseSync(companyId,session,url.pathname.endsWith('-review')?'review':'apply',await body(req)));
   }
   if(url.pathname==='/gmail-labels'&&req.method==='POST')return json(await gmail.labels(companyId,await body(req)));
   if(url.pathname==='/gmail-thread'&&req.method==='POST')return json(await gmail.thread(companyId,await body(req)));
   if(url.pathname==='/gmail-attachment'&&req.method==='POST')return json(await gmail.attachment(companyId,await body(req)));
   if(url.pathname==='/gmail-message'&&req.method==='POST')return json(await gmail.message(companyId,await body(req)));
   return json({error:'Onbekende Gmail-route.'},404);
  }catch(e){return json({error:e.message||'Gmail verwerken lukt niet.',...(['expectedAccount','credentials'].includes(e.field)?{field:e.field}:{})},400);}}
  if(url.pathname.startsWith('/mail-')){try{
   if(url.pathname==='/mail-status'&&req.method==='GET')return json(await mail.status(companyId));
   if(url.pathname==='/mail-journal'&&req.method==='GET')return json(await mail.journal(companyId));
   if(url.pathname==='/mail-configure'&&req.method==='POST')return json(await mail.configure(companyId,await body(req)));
   if(url.pathname==='/mail-send'&&req.method==='POST')return json(await mail.send(companyId,await body(req)));
   return json({error:'Onbekende e-mailroute.'},404);
  }catch(e){return json({error:e.message||'E-mail verwerken lukt niet.',...(['rejected','uncertain'].includes(e.mailStatus)?{mailStatus:e.mailStatus}:{}),...(['senderName','sender','replyTo','testTo','apiKey','aliases','invoiceSender','signature'].includes(e.field)?{field:e.field}:{})},400);}}
  if(url.pathname==='/speech-status'&&req.method==='GET')return json(speech.status());
  if(url.pathname==='/speech-diagnostics'&&req.method==='GET')return json(speechDiagnostics.read(companyId));
  if(url.pathname==='/speech-report'&&req.method==='POST'){try{return json(speechDiagnostics.report(companyId,await body(req)));}catch{return json({error:'Ongeldige microfoondiagnose.'},400);}}
  if(url.pathname==='/transcribe'&&req.method==='POST'){try{const input=await body(req);return json(await speech.transcribe(input.wavBase64,{signal:shutdown.signal}));}catch(e){return json({error:e.message||'Opname verwerken lukt niet.'},400);}}
  if(url.pathname==='/status'&&req.method==='GET')return json(connection.status());
  if(connection.pending&&connection.pending.expiresAt>Date.now()&&['/chat','/models','/select'].includes(url.pathname))return json({error:'Rond de ChatGPT-aanmelding eerst af of annuleer die.'},409);
  if(url.pathname==='/stop'&&req.method==='POST'){
   try{const input=await body(req);if(typeof input.requestId!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(input.requestId))return json({error:'Ongeldige aanvraag-ID.'},400);
    for(const [id,expires] of cancelled)if(expires<Date.now())cancelled.delete(id);
    if(cancelled.size>=100)cancelled.delete(cancelled.keys().next().value);cancelled.set(companyId+'/'+input.requestId,Date.now()+60000);
    if(activeJob?.companyId===companyId&&activeJob.id===input.requestId)activeJob.controller.abort();return json({stopped:true});
   }catch{return json({error:'Stoppen kon niet worden bevestigd.'},400);}
  }
  if(activeRequest)return json({error:'De assistent verwerkt al een aanvraag. Probeer zo opnieuw.'},409);
  activeRequest=true;
  try{
   if(url.pathname==='/models'&&req.method==='GET')return json({models:await connection.models()});
   if(req.method!=='POST')return json({error:'Onbekende aanvraag.'},404);
   const input=await body(req);
   if(url.pathname==='/login'){
    const origin=new URL(req.headers['x-crm-origin']);if(origin.protocol!=='http:'||origin.hostname!=='localhost'||!/^\d+$/.test(origin.port)||origin.pathname!=='/')throw Error('Ongeldige lokale CRM-herkomst.');
    return json(await connection.start({redirectUri:'http://127.0.0.1:'+actualPort+'/auth/callback',returnUrl:origin.origin+'/admin/#assistant',newAccount:input.newAccount===true}));
   }
   if(url.pathname==='/cancel'){connection.cancel();return json(connection.status());}
   if(url.pathname==='/select')return json(await connection.select(input.profileId));
   if(url.pathname==='/logout')return json(await connection.logout());
   if(url.pathname==='/chat'){
    if(input.companyId!==companyId)throw Error('Deze vraag hoort bij een ander bedrijf.');
    if(typeof input.requestId!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(input.requestId))throw Error('Ongeldige aanvraag-ID. Herlaad de CRM-pagina.');
    if((cancelled.get(companyId+'/'+input.requestId)||0)>Date.now())throw Object.assign(Error('Aanvraag gestopt. Er is niets opgeslagen.'),{status:409});
    const controller=new AbortController();activeJob={id:input.requestId,companyId,controller};
    return json(await runAssistant({connection,companyId,state:input.state,message:input.message,history:input.history,model:input.model,context:input.context,task:input.task,mailContext:input.mailContext,guidance:input.guidance,requestId:input.requestId,signal:controller.signal,fetchImpl:network}));
   }
   return json({error:'Onbekende aanvraag.'},404);
  }catch(e){return json({error:e.status?e.message:e.message?.startsWith('fetch')||e.name==='TimeoutError'?'De koppeling reageert niet. Er is niets opgeslagen.':e.name==='AbortError'?'Aanvraag gestopt. Er is niets opgeslagen.':e.message||'De assistent kon de aanvraag niet afronden.'},e.status||400);}
  finally{activeRequest=false;activeJob=null;}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 return {server,connection,port:server.address().port,close:()=>new Promise(resolve=>{shutdown.abort();server.close(resolve);server.closeAllConnections();})};
}
