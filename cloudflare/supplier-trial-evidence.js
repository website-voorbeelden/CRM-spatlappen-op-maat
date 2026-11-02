import {assertSupplierMail} from '../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {integrationError} from './integration-store.js';

// Read the cloud's own committed dossier and original files. Browser-supplied
// state, filenames or PDF headers alone are not evidence of the right shipment.
export const verifyCloudSupplierTrial=(env,input)=>verifyCloudSupplierMessage(env,input,{trial:true});
export const verifyCloudSupplierDocument=(env,input)=>verifyCloudSupplierMessage(env,input,{trial:false});
async function verifyCloudSupplierMessage(env,input,{trial}){
 const changed=()=>integrationError('De CRM-gegevens of leveranciersbijlagen zijn gewijzigd. Open het mailvoorbeeld opnieuw; er is niets verstuurd.',409);
 if(env.CRM_COMPANY_ID!=='maatwerkkunststof'||!env.DB||!env.CRM_FILES)throw integrationError('De online controle van leveranciersbijlagen is nog niet ingericht.',503);
 const snapshot=await env.DB.batch([
  env.DB.prepare('SELECT revision FROM crm_workspace WHERE id=1'),
  env.DB.prepare("SELECT part,payload FROM crm_records WHERE store='state' AND record_key='main' ORDER BY part")
 ]);
 if(!snapshot[0]?.success||!snapshot[1]?.success||!Array.isArray(snapshot[0].results)||!Array.isArray(snapshot[1].results))throw changed();
 const revision=snapshot[0].results[0]?.revision,parts=snapshot[1].results;
 if(!Number.isSafeInteger(revision)||!parts.length||parts.some((row,index)=>row.part!==index||typeof row.payload!=='string'))throw changed();
 const raw=parts.map(row=>row.payload).join('');if(raw.length>32_000_000)throw changed();
 let state;try{state=JSON.parse(raw);}catch{throw changed();}
 const order=state?.orders?.find(row=>row.id===input.orderId),drafts=order?.emailDrafts?.filter(row=>row.mailRequestId===input.requestId)||[];
 if(!trial&&!drafts.some(d=>d.supplierFulfilmentMail)){
  if(input.supplierFulfilmentMail||state.documents?.find(d=>d.id===input.documentId)?.generated?.supplierFulfilment)throw changed();
  return null;
 }
 if(drafts.length!==1)throw changed();
 const draft=drafts[0],tag=draft.supplierFulfilmentMail;
 if(!tag||!!tag.trialRecipient!==trial||input.supplierFulfilmentMail&&JSON.stringify(input.supplierFulfilmentMail)!==JSON.stringify(tag)||!['draft','uncertain','accepted'].includes(draft.status)||order.customerId!==input.customerId||draft.to!==input.to||draft.subject!==input.subject||draft.body!==input.text||draft.documentId!==input.documentId||draft.sender!==input.expectedSender||(draft.signatureChoice||'')!==(input.signatureChoice||''))throw changed();
 if(input.attachments?.length!==1)throw changed();
 assertSupplierMail(state,order.id,draft,env.CRM_COMPANY_ID);
 const expected=[
  {id:tag.packingDocumentId,encoded:input.pdf,max:2_000_000},
  {id:tag.labelDocumentId,encoded:input.attachments?.[0],max:4_000_000}
 ];
 if(expected[0].id===expected[1].id)throw changed();
 const files=await env.DB.batch([
  env.DB.prepare('SELECT revision FROM crm_workspace WHERE id=1'),
  env.DB.prepare('SELECT id,object_key,size,type,sha256 FROM crm_files WHERE id IN (?,?)').bind(...expected.map(file=>file.id))
 ]);
 if(!files[0]?.success||!files[1]?.success||!Array.isArray(files[0].results)||!Array.isArray(files[1].results)||files[0].results[0]?.revision!==revision)throw changed();
 for(const file of expected){
  const metadata=state.documents?.find(row=>row.id===file.id&&row.ownerId===order.id),stored=files[1].results.find(row=>row.id===file.id);
  if(!metadata||!stored||metadata.type!=='application/pdf'||stored.type!=='application/pdf'||file.encoded?.filename!==metadata.name||typeof file.encoded?.fileblob!=='string'||!Number.isSafeInteger(stored.size)||stored.size<5||stored.size>file.max||!/^[a-f0-9]{64}$/.test(stored.sha256))throw changed();
  let binary;try{binary=atob(file.encoded.fileblob);}catch{throw changed();}
  if(binary.length!==stored.size||binary.slice(0,5)!=='%PDF-')throw changed();
  const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0)),hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',value))].map(value=>value.toString(16).padStart(2,'0')).join('');
  if(await hash(bytes)!==stored.sha256)throw changed();
  const object=await env.CRM_FILES.get(stored.object_key);
  if(!object||object.size!==stored.size)throw changed();
  if(await hash(await object.arrayBuffer())!==stored.sha256)throw changed();
 }
 // Repeat immediately before dispatch, after the pending mail intent is saved.
 // A changed workspace refuses the send, never silently substitutes new files.
 const recheck=async()=>{const current=await env.DB.prepare('SELECT revision FROM crm_workspace WHERE id=1').first();if(current?.revision!==revision)throw changed();};
 await recheck();return recheck;
}
