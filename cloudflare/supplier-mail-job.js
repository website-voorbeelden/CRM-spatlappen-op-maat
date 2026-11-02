import {authReady} from './auth.js';
import {createOutlookConnection} from './outlook-connection.js?v=outlook-connect-20261102';
import {syncSupplierMailbox} from './supplier-mail-store.js?v=outlook-pdf-size-20261102';

// Reuse only the existing Maat maintenance credential. This route can stage
// supplier sources, but has no order/cost/payment or Microsoft-write dependency.
export function validSupplierMailJob(request,env){
 if(env.CRM_COMPANY_ID!=='maatwerkkunststof'||env.CRM_RELEASE_ENV!=='production'||env.CRM_OUTLOOK_AUTO_SYNC!=='true'||!authReady(env)||request.method!=='POST'||! /^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||''))return false;
 try{const url=new URL(request.url);if(url.protocol!=='https:'||url.origin!==new URL(env.CRM_PUBLIC_URL).origin||url.pathname!=='/api/crm/supplier-mail/run'||url.search)return false;}catch{return false;}
 const given=request.headers.get('Authorization')||'',expected='Bearer '+env.CRM_NOTIFICATION_JOB_KEY;
 if(given.length!==expected.length)return false;let diff=0;for(let i=0;i<expected.length;i++)diff|=given.charCodeAt(i)^expected.charCodeAt(i);return diff===0;
}
export async function runSupplierMailJob(env){
 const connection=createOutlookConnection(env),status=await connection.status();
 if(!status.connected)return {connected:false,added:0};
 const previous=await connection.store.read('supplier-outlook-job-status');
 const attemptedAt=new Date().toISOString();
 try{
  const result=await syncSupplierMailbox(env);
  await connection.store.write('supplier-outlook-job-status',{attemptedAt,completedAt:new Date().toISOString(),added:result.added||0,morePending:!!result.morePending,error:''},previous.version);
  return {connected:true,added:result.added||0,morePending:!!result.morePending};
 }catch(error){
  const reason=error.status?String(error.message).slice(0,700):'Automatisch ophalen is niet gelukt. Probeer Mails ophalen in het CRM; bestaande bronnen zijn behouden.';
  try{await connection.store.write('supplier-outlook-job-status',{attemptedAt,error:reason},previous.version);}catch{}
  throw error;
 }
}
