// Provider credentials stay in Cloudflare Secrets. An uncertain POST is never retried.
const BASES=new Set(['https://api.abnamro.com/v2/tikkie','https://api-sandbox.abnamro.com/v2/tikkie']);
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const uuid=value=>{if(typeof value!=='string'||!UUID.test(value))fail('Kies een geldige order of betaallink.');return value.toLowerCase();};
const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export const tikkieReady=env=>Boolean(env.DB&&env.TIKKIE_API_KEY&&env.TIKKIE_APP_TOKEN&&BASES.has(env.TIKKIE_BASE_URL||'https://api.abnamro.com/v2/tikkie'));
function identity(payload){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))fail('Ongeldig Tikkie-verzoek.');
  const id=uuid(payload.requestId),orderId=uuid(payload.orderId),documentId=payload.documentId?uuid(payload.documentId):'';
  const description=typeof payload.description==='string'?payload.description.trim():'';
  if(!Number.isSafeInteger(payload.amountInCents)||payload.amountInCents<1||payload.amountInCents>2147483647||!description||[...description].length>35||/[\x00-\x1f]/.test(description)||!date(payload.expiryDate))fail('Controleer bedrag, omschrijving en vervaldatum.');
  return {id,value:{orderId,documentId,body:{amountInCents:payload.amountInCents,description,expiryDate:payload.expiryDate,referenceId:'CRM'+id.replaceAll('-','')}}};
}
const uncertain='Tikkie heeft nog geen zeker antwoord gegeven. Controleer je Tikkie-portaal; we maken geen tweede link aan.';
async function provider(env,path,method='GET',body,{timeout=25000}={}){
  return fetch((env.TIKKIE_BASE_URL||'https://api.abnamro.com/v2/tikkie')+path,{method,headers:{'API-Key':env.TIKKIE_API_KEY,'X-App-Token':env.TIKKIE_APP_TOKEN,'Content-Type':'application/json',Accept:'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(timeout),redirect:'manual'});
}
async function create(env,payload){
  const {id,value}=identity(payload),encoded=JSON.stringify(value);
  const old=await env.DB.prepare('SELECT * FROM crm_tikkie_requests WHERE id=?').bind(id).first();
  if(old){
    if(old.identity!==encoded)fail('Dit verzoek is al met andere gegevens gebruikt. Open Betaallink maken opnieuw.',409);
    if(old.result)return JSON.parse(old.result);
    if(old.status==='pending')fail(uncertain,409);
    fail('Tikkie heeft dit verzoek geweigerd. Open Betaallink maken opnieuw.',409);
  }
  if(value.body.expiryDate<=new Date().toISOString().slice(0,10))fail('Kies een toekomstige vervaldatum.');
  if(!tikkieReady(env))fail('De online Tikkie-koppeling is nog niet ingesteld.',503);
  // Durable intent and the unique pending-order index win before any external call.
  const inserted=await env.DB.prepare('INSERT OR IGNORE INTO crm_tikkie_requests(id,order_id,identity,status,created_at) VALUES(?,?,?,\'pending\',?) RETURNING id').bind(id,value.orderId,encoded,new Date().toISOString()).all();
  if(!inserted.results.length)fail(uncertain,409);
  try{
    const response=await provider(env,'/paymentrequests','POST',value.body);
    if(response.status>=400&&response.status<500){
      await env.DB.prepare("UPDATE crm_tikkie_requests SET status='rejected' WHERE id=? AND status='pending'").bind(id).run();
      fail(response.status===401||response.status===403?'Tikkie weigert de toegang. Controleer de API-key en app-token.':'Tikkie heeft het verzoek geweigerd. Controleer bedrag en limieten in je Tikkie-portaal.',400);
    }
    if(response.status!==201)fail(uncertain,503);
    const result=await response.json(),url=new URL(result.url);
    if(url.protocol!=='https:'||url.hostname!=='tikkie.me'||typeof result.paymentRequestToken!=='string'||!result.paymentRequestToken||result.paymentRequestToken.length>250)fail(uncertain,503);
    const link={id,documentId:value.documentId,...value.body,url:result.url,paymentRequestToken:result.paymentRequestToken,status:result.status||'OPEN',createdAt:result.createdDateTime||new Date().toISOString()};
    await env.DB.prepare("UPDATE crm_tikkie_requests SET status='created',result=? WHERE id=? AND status='pending'").bind(JSON.stringify(link),id).run();
    return link;
  }catch(error){if(error.status)throw error;fail(uncertain,503);}
}
async function requests(env,orderId){
  const {results}=await env.DB.prepare('SELECT status,result FROM crm_tikkie_requests WHERE order_id=? ORDER BY created_at,id').bind(uuid(orderId)).all();
  return {links:results.filter(r=>r.result).map(r=>JSON.parse(r.result)),pending:results.some(r=>r.status==='pending')};
}
export async function checkTikkiePayments(env,payload,{maxPages=100,requestTimeoutMs=25000}={}){
  if(!tikkieReady(env))fail('De online Tikkie-koppeling is nog niet ingesteld.',503);
  const saved=await requests(env,payload.orderId),linkId=payload.linkId?uuid(payload.linkId):null;
  const links=saved.links.filter(link=>!linkId||link.id===linkId);
  if(!links.length)fail('Geen opgeslagen Tikkie-betaallink voor deze order. Neem bij de migratie ook de Tikkie-historie mee.');
  const get=async path=>{const response=await provider(env,path,'GET',undefined,{timeout:requestTimeoutMs});if(!response.ok)fail('De Tikkie-betalingen konden niet worden opgehaald. Bestaande betalingen blijven behouden.',503);return response.json();};
  const checked=[];
  try{
    for(const link of links){
      const path='/paymentrequests/'+encodeURIComponent(link.paymentRequestToken),details=await get(path),payments=[],seen=new Set();
      if(typeof details.status!=='string')fail('Tikkie gaf een onvolledig antwoord.',503);
      let complete=false;
      for(let page=0;page<maxPages;page++){
        const data=await get(path+'/payments?pageNumber='+page+'&pageSize=50');
        if(!Array.isArray(data.payments))fail('Tikkie gaf een onvolledig antwoord.',503);
        for(const row of data.payments){
          if(typeof row.paymentToken!=='string'||!row.paymentToken||!Number.isSafeInteger(row.amountInCents)||row.amountInCents<=0||typeof row.createdDateTime!=='string'||!Number.isFinite(Date.parse(row.createdDateTime)))fail('Tikkie gaf een onvolledige betaling. Bestaande betalingen blijven behouden.',503);
          if(!seen.has(row.paymentToken)){seen.add(row.paymentToken);payments.push({paymentToken:row.paymentToken,amountInCents:row.amountInCents,createdAt:row.createdDateTime,description:row.description||''});}
        }
        if(data.payments.length<50||Number.isSafeInteger(data.totalElementCount)&&payments.length>=data.totalElementCount){complete=true;break;}
      }
      if(!complete)fail('Te veel betalingen om in één keer te controleren.',503);
      checked.push({...link,status:details.status,payments,paidInCents:payments.reduce((total,p)=>total+p.amountInCents,0),checkedAt:new Date().toISOString()});
    }
    // Store only after every provider response passed validation.
    await env.DB.batch(checked.map(link=>env.DB.prepare('UPDATE crm_tikkie_requests SET result=? WHERE id=?').bind(JSON.stringify(link),link.id)));
    return {links:checked};
  }catch(error){if(error.status)throw error;fail('Tikkie controleren lukt niet. Bestaande betalingen blijven behouden.',503);}
}
export async function exportJournal(db){
  const {results}=await db.prepare('SELECT * FROM crm_tikkie_requests ORDER BY created_at,id').all();
  return Object.fromEntries(results.map(row=>[row.id,{...JSON.parse(row.identity),state:row.status,...(row.result?{result:JSON.parse(row.result)}:{})}]));
}
export function validateJournal(journal){
  if(!journal||typeof journal!=='object'||Array.isArray(journal)||Object.keys(journal).length>5000)fail('Ongeldige Tikkie-historie.');
  const pending=new Set();
  return Object.entries(journal).map(([id,record])=>{
    const {value}=identity({requestId:id,orderId:record?.orderId,documentId:record?.documentId,...record?.body});
    if(!['pending','created','rejected'].includes(record.state)||record.body.referenceId!==value.body.referenceId||record.orderId!==value.orderId||(record.documentId||'')!==value.documentId)fail('Ongeldige Tikkie-historie.');
    if(record.state==='pending'){if(pending.has(value.orderId))fail('Dubbele onzekere Tikkie-verzoeken.');pending.add(value.orderId);}
    if(record.state==='created'){
      const link=record.result;
      if(!link||link.id!==id||link.amountInCents!==value.body.amountInCents||typeof link.paymentRequestToken!=='string'||!link.paymentRequestToken||link.paymentRequestToken.length>250||typeof link.url!=='string'||!/^https:\/\/tikkie\.me\//.test(link.url)||!Number.isFinite(Date.parse(link.createdAt)))fail('Ongeldige opgeslagen Tikkie-betaallink.');
    }else if(record.result)fail('Ongeldige Tikkie-status.');
    const result=record.result?JSON.stringify(record.result):null;
    if(result&&new TextEncoder().encode(result).length>60000)fail('Tikkie-historie is te groot per betaallink.');
    return {id:uuid(id),orderId:value.orderId,identity:JSON.stringify(value),status:record.state,result,createdAt:record.result?.createdAt||new Date().toISOString()};
  });
}
export async function handleTikkie({request,env}){
  try{
    const url=new URL(request.url),path=url.pathname;
    if(!env.DB)fail('De betaalhistorie is niet beschikbaar.',503);
    if(request.method==='GET'&&path==='/__local/tikkie/requests')return Response.json(await requests(env,url.searchParams.get('orderId')));
    if(request.method==='GET'&&path==='/__local/tikkie/journal')return Response.json(await exportJournal(env.DB));
    if(request.method!=='POST'||!['/__local/tikkie/create','/__local/tikkie/check'].includes(path))fail('Onbekend Tikkie-verzoek.',404);
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))fail('JSON verwacht.',415);
    const raw=await request.text();if(raw.length>10000)fail('Tikkie-verzoek is te groot.',413);
    const payload=JSON.parse(raw);
    return Response.json(path.endsWith('/create')?await create(env,payload):await checkTikkiePayments(env,payload));
  }catch(error){return Response.json({error:error.status?error.message:error instanceof SyntaxError?'Ongeldige JSON.':'De Tikkie-opslag is niet beschikbaar. Er is geen nieuw verzoek bevestigd.'},{status:error.status||503});}
}
