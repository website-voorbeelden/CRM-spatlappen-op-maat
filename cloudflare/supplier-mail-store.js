import {createOutlookConnection,outlookEnvironment} from './outlook-connection.js?v=supplier-batches35-20261101';
import {outlookGraph,outlookGraphUrl} from './outlook-http.js?v=supplier-batches35-20261101';
import {integrationError as fail,sha256,hex} from './integration-store.js';
import {supplierMailSender,supplierMailFacts,supplierMailDay} from '../shared/supplier-mail-intake.js?v=supplier-batches35-20261101';
const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const byteHash=async bytes=>hex(await crypto.subtle.digest('SHA-256',bytes));
const sourceName=key=>'supplier-outlook-source-'+key;
const indexName=identity=>'supplier-outlook-index-'+identity;
const cursorName=identity=>'supplier-outlook-cursor-'+identity;
const graphId=value=>typeof value==='string'&&value.length>0&&value.length<=2000;
const publicRow=r=>({key:r.key,subject:r.subject,receivedAt:r.receivedAt,references:r.references,ownNumbers:r.ownNumbers,files:r.files.map(({id,name,size,sha256})=>({id,name,size,sha256})),issues:r.issues,mimeAvailable:!!r.mime});
export function createSupplierMailStore(env){
 const connection=createOutlookConnection(env),store=connection.store;
 async function current(){const access=await connection.access();return {...access,index:await store.read(indexName(access.connection.identity))};}
 async function source(key){
  if(!hash(key))throw fail('Kies een geldige leveranciersmail.');
  const {connection:active}=await connection.identity();if(!active)throw fail('Koppel eerst je BouwmarktXL-mailbox.',409);
  const record=await store.read(sourceName(key));if(record.value?.identity!==active.identity)throw fail('Dit bericht hoort niet bij de huidige mailbox.',404);return record;
 }
 async function list(){
  const {connection:active}=await connection.identity();if(!active)return {rows:[],connected:false};
  const index=await store.read(indexName(active.identity)),cursor=await store.read(cursorName(active.identity)),rows=[];
  for(const key of (index.value?.keys||[]).slice(-250).reverse()){const cached=index.value?.rows?.[key];if(cached){rows.push(cached);continue;}const record=await store.read(sourceName(key));if(record.value?.identity===active.identity&&!record.value.archived)rows.push(publicRow(record.value));}
  return {connected:true,rows,lastCompletedAt:cursor.value?.lastCompletedAt||'',morePending:!!cursor.value?.nextLink};
 }
 async function details(key){const record=await source(key);return {...publicRow(record.value),sender:supplierMailSender,text:record.value.text,readOnly:true};}
 async function download(key,fileId){
  const record=await source(key),r=record.value,file=fileId==='original'?r.mime:r.files.find(f=>f.id===fileId);if(!file)throw fail('Het oorspronkelijke mailbestand is niet beschikbaar.',404);
  const object=await env.CRM_FILES.get(file.objectKey);if(!object||object.size!==file.size)throw fail('Het bewaarde mailbestand ontbreekt of wijkt af.',409);
  // Check the complete original before returning it, never re-fetch a link from mail text.
  const bytes=new Uint8Array(await object.arrayBuffer());if(bytes.length!==file.size||await byteHash(bytes)!==file.sha256)throw fail('Het oorspronkelijke mailbewijs wijkt af.',409);
  return {bytes,name:file.name,type:fileId==='original'?'message/rfc822':'application/pdf'};
 }
 async function archive(key){return store.exclusive('supplier-outlook-sync',async()=>{
  const record=await source(key),r=record.value;
  const index=await store.read(indexName(r.identity));if(index.value?.keys.includes(key)){const rows={...index.value.rows};delete rows[key];await store.write(indexName(r.identity),{keys:index.value.keys.filter(k=>k!==key),rows},index.version);}
  if(!r.archived)await store.write(sourceName(key),{...r,archived:true},record.version);
  return {archived:true};
 });}
 async function sync(){return store.exclusive('supplier-outlook-sync',async()=>{
  const {token,connection:active,index:opened}=await current();const start=Date.now(),keys=[...(opened.value?.keys||[])],indexRows={...opened.value?.rows};let indexVersion=opened.version;
  if(keys.length>=250)throw fail('De mailwachtrij is vol. Verwerk of archiveer eerst berichten; er is niets gewist.',409);
  const cursor=await store.read(cursorName(active.identity));let cursorVersion=cursor.version;
  const checkpoint=cursor.value?.since===active.since?cursor.value:null,previous=checkpoint?.lastCompletedAt,lower=Date.parse(active.since+'T00:00:00Z')-86400000,overlap=new Date(previous?Math.max(lower,Date.parse(previous)-7*86400000):lower).toISOString();
  const first=new URL('https://graph.microsoft.com/v1.0/me/messages');first.search=new URLSearchParams({'$select':'id,from,subject,receivedDateTime,hasAttachments','$filter':"receivedDateTime ge "+overlap+" and from/emailAddress/address eq '"+supplierMailSender+"'",'$orderby':'receivedDateTime asc','$top':'10'}).toString();
  let next=checkpoint?.nextLink||first.href,windowStartedAt=checkpoint?.windowStartedAt||new Date().toISOString(),added=0,processed=0;
  // The cursor advances only after every item on that page is durable. A retry
  // revisits immutable IDs and reuses their original evidence instead of costs.
  // One new source per invocation keeps external calls bounded even when a
  // message contains four PDFs. Explicit UI sync can request several chunks.
  while(next&&processed<10&&Date.now()-start<65000){
   const pagePath=new URL(outlookGraphUrl(next)).pathname;if(!['/v1.0/me/messages','/v1.0/users/'+encodeURIComponent(active.graphId)+'/messages'].includes(pagePath))throw fail('De bewaarde Microsoft-paginakoppeling is ongeldig.',409);
   const page=await outlookGraph(token,next);if(!Array.isArray(page.value)||page.value.length>100)throw fail('Microsoft gaf geen begrensde berichtenlijst.',502);
   for(const message of page.value){
    if(keys.length>=250||added>=1||Date.now()-start>=65000){await store.write(cursorName(active.identity),{since:active.since,nextLink:next,windowStartedAt,lastCompletedAt:previous||''},cursorVersion);return {added,processed,morePending:true};}
    if(!graphId(message?.id))throw fail('Een Microsoft-bericht mist een bruikbare identiteit.',502);processed++;
    if(String(message.from?.emailAddress?.address||'').toLowerCase()!==supplierMailSender)continue;
    const received=supplierMailDay(message.receivedDateTime);if(!received)throw fail('Een leveranciersbericht mist een geldige ontvangstdatum.',502);if(received<active.since)continue;
    if(!message.hasAttachments&&!/bestell|order|factuur|pakbon/i.test(message.subject||''))continue;
    const key=await sha256(active.identity+'|'+message.id);if(keys.includes(key))continue;const known=await store.read(sourceName(key));let value=known.value;
    if(!value)value=await capture(token,active,key,message);
    if(!value||value.archived||keys.includes(key))continue;
    keys.push(key);indexRows[key]=publicRow(value);const saved=await store.write(indexName(active.identity),{keys:[...keys],rows:indexRows},indexVersion);indexVersion=saved.version;added++;
   }
   next=page['@odata.nextLink']||'';if(next&&(typeof next!=='string'||next.length>20000||!['/v1.0/me/messages','/v1.0/users/'+encodeURIComponent(active.graphId)+'/messages'].includes(new URL(outlookGraphUrl(next)).pathname)))throw fail('Microsoft gaf een onbruikbare vervolgpagina.',502);
   const value={since:active.since,nextLink:next,windowStartedAt:next?windowStartedAt:'',lastCompletedAt:next?previous||'':windowStartedAt};
   const saved=await store.write(cursorName(active.identity),value,cursorVersion);cursorVersion=saved.version;
  }
  return {added,processed,morePending:!!next};
 });}
 async function capture(token,active,key,message,previous=null){
  const path='me/messages/'+encodeURIComponent(message.id),record=previous?.value?{...structuredClone(previous.value),issues:[]}:{key,identity:active.identity,messageId:message.id,subject:String(message.subject||'').slice(0,300),receivedAt:String(message.receivedDateTime||'').slice(0,40),references:[],ownNumbers:[],text:'',files:[],mime:null,issues:[],archived:false};
  try{
   const full=await outlookGraph(token,path+'?$select=id,from,subject,body,receivedDateTime');if(full.id!==message.id)throw fail('De mailidentiteit is gewijzigd.',409);
   const facts=supplierMailFacts(full);if(record.text&&record.text!==facts.text)throw fail('De brontekst is veranderd. Bewaarde originelen worden niet overschreven.',409);Object.assign(record,{subject:facts.subject,text:facts.text,references:facts.references,ownNumbers:facts.ownNumbers});
   const attachments=await outlookGraph(token,path+'/attachments?$select=id,name,contentType,size,isInline');if(!Array.isArray(attachments.value)||attachments['@odata.nextLink'])throw fail('De bijlagenlijst vraagt handmatige controle.',409);
   const pdfs=attachments.value.filter(f=>!f.isInline&&/\.pdf$/i.test(f.name||'')&&f['@odata.type']==='#microsoft.graph.fileAttachment');
   if(!pdfs.length&&!facts.references.length)return null;
   if(pdfs.length>4)throw fail('Meer dan vier PDF-bijlagen: download en controleer deze mail handmatig.',409);
   if(!record.mime)try{const bytes=await outlookGraph(token,path+'/$value',25000000,{binary:true});if(bytes.length<10)throw fail('Leeg mailorigineel.',409);const sha=await byteHash(bytes),objectKey='supplier-mail/maatwerkkunststof/'+key+'/original-'+sha+'.eml';await env.CRM_FILES.put(objectKey,bytes,{httpMetadata:{contentType:'message/rfc822'}});record.mime={name:'Leveranciersmail_'+key.slice(0,12)+'.eml',objectKey,size:bytes.length,sha256:sha};}catch{record.issues.push('Originele mail kon niet volledig worden bewaard; controleer het bericht in Outlook.');}
   for(const pdf of pdfs){
    try{
     if(!graphId(pdf.id)||!Number.isSafeInteger(pdf.size)||pdf.size<5||pdf.size>15000000||pdf.name.length>240)throw fail('De PDF-omvang of naam valt buiten de invoergrens.',413);
     const storedId=await sha256(pdf.id),known=record.files.find(f=>f.id===storedId);if(known){if(known.size!==pdf.size||known.name!==pdf.name)throw fail('Een eerder bewaarde bijlage is veranderd.',409);continue;}
     const bytes=await outlookGraph(token,path+'/attachments/'+encodeURIComponent(pdf.id)+'/$value',15000000,{binary:true});if(bytes.length!==pdf.size||new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw fail('De bijlage is geen volledige PDF.',409);
     const sha=await byteHash(bytes),id=await sha256(pdf.id),objectKey='supplier-mail/maatwerkkunststof/'+key+'/'+id+'-'+sha+'.pdf';await env.CRM_FILES.put(objectKey,bytes,{httpMetadata:{contentType:'application/pdf'},customMetadata:{sha256:sha}});record.files.push({id,name:pdf.name,size:bytes.length,sha256:sha,objectKey});
    }catch{record.issues.push('Een factuur-PDF kon niet worden bewaard. Download die bijlage zelf uit Outlook.');}
   }
  }catch{record.issues.push('Bericht niet volledig verwerkt. Download en importeer het origineel zelf; er zijn geen kosten aangemaakt.');}
  await store.write(sourceName(key),record,previous?.version||'');return record;
 }
 async function retry(key){return store.exclusive('supplier-outlook-sync',async()=>{const old=await source(key);if(old.value.archived||!graphId(old.value.messageId))throw fail('Dit bericht kan niet opnieuw worden opgehaald.',409);const {token,connection:active}=await connection.access();const value=await capture(token,active,key,{id:old.value.messageId},old),row=publicRow(value||old.value),index=await store.read(indexName(active.identity));if(index.value?.keys.includes(key))await store.write(indexName(active.identity),{...index.value,rows:{...index.value.rows,[key]:row}},index.version);return row;});}
 return {list,details,download,archive,sync,retry};
}
export async function syncSupplierMailbox(env){
 if(env.CRM_OUTLOOK_AUTO_SYNC!=='true')return {disabled:true};await outlookEnvironment(env);return createSupplierMailStore(env).sync();
}
