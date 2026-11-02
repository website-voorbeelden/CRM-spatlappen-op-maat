import {packsTrialOnly} from './packs-trial-policy.js';
import {authenticated} from './auth.js';
import {supplierDocumentLink} from '../shared/supplier-document-link.js?v=invoice-link-review-20261101';
const max=15*1024*1024;
export async function handleSupplierDocument({request,env}){
 const traceId=crypto.randomUUID(),json=(error,code,status)=>Response.json({error,code,traceId},{status,headers:{'Cache-Control':'no-store'}});
 try{
  if(!await authenticated(request,env))return json('Log opnieuw in om een leveranciersdocument op te halen.','login_required',401);
  if(env.CRM_COMPANY_ID!=='maatwerkkunststof')return json('Deze documentinvoer is alleen voor Maatwerkkunststof.','company',403);
  if(packsTrialOnly(env))return json('Kies in deze proefstand zelf de PDF; er wordt geen leverancierssite opgehaald.','offline',403);
  const own=new URL(request.url);if(request.method!=='POST'||request.headers.get('Origin')!==own.origin||request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json('Ongeldig documentverzoek.','request_invalid',403);
  const reader=request.body?.getReader();if(!reader)return json('Plak een documentlink.','link_invalid',400);let raw='',size=0;const decoder=new TextDecoder();
  try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>7000){await reader.cancel();return json('De documentlink is te lang.','link_invalid',413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
  let input;try{input=JSON.parse(raw);}catch{return json('Ongeldig documentverzoek.','request_invalid',400);}
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['url','kind'].includes(k))||!['','invoice','packing'].includes(input.kind||''))return json('Ongeldige documentkeuze.','request_invalid',400);
  const link=supplierDocumentLink(input.url,{kind:input.kind||''});let response;
  try{response=await fetch(link.url,{method:'GET',headers:{Accept:'application/pdf'},redirect:'manual',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(25000)});}catch{return json('Kunststofbaas is nu niet bereikbaar. Download de PDF zelf en kies het bestand in ditzelfde scherm.','download_failed',502);}
  if(!response.ok){await response.body?.cancel();return json('Kunststofbaas gaf geen toegankelijk document. Open de link bij Kunststofbaas, download de PDF en kies die hier.','document_access',424);}
  if(Number(response.headers.get('Content-Length'))>max){await response.body?.cancel();return json('De PDF is groter dan 15 MB.','document_size',413);}
  const stream=response.body?.getReader();if(!stream)return json('Geen PDF ontvangen.','document_access',424);const chunks=[];size=0;
  try{for(;;){const part=await stream.read();if(part.done)break;size+=part.value.byteLength;if(size>max){await stream.cancel();return json('De PDF is groter dan 15 MB.','document_size',413);}chunks.push(part.value);}}finally{stream.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  if(new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')return json('Geen PDF ontvangen. De link kan jouw Kunststofbaas-login vereisen of verlopen zijn. Download het document bij Kunststofbaas en kies de PDF hier.','document_access',424);
  return new Response(bytes,{headers:{'Content-Type':'application/pdf','Content-Length':String(size),'Content-Disposition':'attachment; filename="'+link.name+'"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-CRM-Supplier-Kind':link.documentKind,'X-CRM-Supplier-Order':link.orderReference,'X-CRM-Trace-ID':traceId}});
 }catch(error){return json(error.code==='link_invalid'||error.code==='document_kind'?error.message:'Het document kon niet worden opgehaald. Je huidige invoer blijft staan. Download de PDF zelf en kies die hier.',error.code==='link_invalid'||error.code==='document_kind'?error.code:'download_failed',error.status||502);}
}
