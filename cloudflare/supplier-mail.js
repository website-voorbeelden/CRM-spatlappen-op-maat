import {authenticated,sessionFingerprint} from './auth.js';
import {integrationError as fail} from './integration-store.js';
import {outlookBytes} from './outlook-http.js?v=supplier-batches35-20261101';
import {createOutlookConnection,outlookEnvironment} from './outlook-connection.js?v=supplier-batches35-20261101';
import {createSupplierMailStore} from './supplier-mail-store.js?v=supplier-batches35-20261101';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
function callbackPage(success){return new Response('<!doctype html><html lang="nl"><meta charset="utf-8"><title>Leveranciersmail</title><h1>'+ (success?'Outlook gekoppeld':'Outlook nog niet gekoppeld')+'</h1><p>'+(success?'Keer terug naar je open CRM-tab en haal de leveranciersmails op. Er zijn geen kosten of betalingen aangemaakt.':'De aanmelding is niet afgerond. Je bestaande gegevens zijn behouden. Begin opnieuw vanuit de Kunststofbaas-tab.')+'</p><a href="/admin/#orders">Orders openen</a></html>',{status:success?200:409,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'"}});}
export async function handleSupplierMail({request,env}){
 const url=new URL(request.url),action=url.pathname.replace(/^\/api\/crm\/supplier-mail\/?/,'');
 try{
  const user=await authenticated(request,env);if(!user||user.local)throw fail('Gebruik de afzonderlijk ingerichte online CRM-koppeling voor Outlook.',401);
  if(env.CRM_COMPANY_ID!=='maatwerkkunststof')throw fail('Deze leveranciersmail is alleen voor Maatwerkkunststof.',403);
  if(action==='status'&&request.method==='GET'){
   try{await outlookEnvironment(env);return json(await createOutlookConnection(env).status());}catch{return json({configured:false,connected:false,mailbox:'info@bouwmarktxl.nl',reason:'Outlook moet nog afzonderlijk aan dit CRM worden gekoppeld.'});}
  }
  const config=await outlookEnvironment(env);if(url.origin!==new URL(config.callback).origin)throw fail('Open de ingestelde CRM-URL.',403);
  if(action==='callback'&&request.method==='GET'){await createOutlookConnection(env).finish(url.searchParams,await sessionFingerprint(request,env));return callbackPage(true);}
  const mail=createSupplierMailStore(env);
  if(request.method==='GET'){
   if(action==='list')return json(await mail.list());
   if(action==='details')return json(await mail.details(url.searchParams.get('key')));
   if(action==='file'){
    const file=await mail.download(url.searchParams.get('key'),url.searchParams.get('file'));
    return new Response(file.bytes,{headers:{'Content-Type':file.type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.name),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
   }
  }
  if(request.method!=='POST'||request.headers.get('Origin')!==url.origin||request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw fail('Ongeldige leveranciersmailactie.',403);
  const raw=await outlookBytes(new Response(request.body),16000);let input;try{input=JSON.parse(new TextDecoder().decode(raw));}catch{throw fail('Ongeldige mailinvoer.');}
  if(!input||typeof input!=='object'||Array.isArray(input))throw fail('Ongeldige mailinvoer.');
  const allowed={connect:['since'],disconnect:['confirmed'],sync:[],archive:['key','confirmed'],retry:['key']}[action];if(!allowed||Object.keys(input).some(k=>!allowed.includes(k)))throw fail('Onbekende mailactie.');
  if(action==='connect')return json(await createOutlookConnection(env).start(await sessionFingerprint(request,env),input.since));
  if(action==='disconnect'){if(input.confirmed!==true)throw fail('Bevestig het loskoppelen.');return json(await createOutlookConnection(env).disconnect());}
  if(action==='sync')return json(await mail.sync());
  if(action==='archive'){if(input.confirmed!==true)throw fail('Bevestig het archiveren.');return json(await mail.archive(input.key));}
  if(action==='retry')return json(await mail.retry(input.key));
 }catch(error){if(action==='callback')return callbackPage(false);return json({error:error.status?error.message:'Leveranciersmail kon niet worden verwerkt. Je CRM-invoer is behouden.'},error.status||503);}
 return json({error:'Onbekende mailroute.'},404);
}
