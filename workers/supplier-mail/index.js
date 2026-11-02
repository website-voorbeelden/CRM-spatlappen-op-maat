import {syncSupplierMailbox} from '../../cloudflare/supplier-mail-store.js?v=supplier-batches35-20261101';
// No public mail-ingestion endpoint. Cron is separately configured and disabled
// in the example. Only private source staging; never order/cost/mail mutations.
export default {
 fetch(){return new Response('Not found',{status:404});},
 async scheduled(event,env){
  try{const result=await syncSupplierMailbox(env);console.log(JSON.stringify({event:'supplier_mail_sync',added:result.added||0,morePending:!!result.morePending,disabled:!!result.disabled}));}
  catch{console.log(JSON.stringify({event:'supplier_mail_sync_failed'}));}
 }
};
