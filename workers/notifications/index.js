// One deployment per company. No public mutation endpoint, no customer data in logs.
export default {
 fetch(){return new Response('Not found',{status:404});},
 async scheduled(_event,env,context){
  // Separate waitUntil tasks: supplier ingestion failure cannot stop payment
  // polling, and neither task inherits access tokens from the other.
  if(env.CRM_SUPPLIER_MAIL_JOB_ENABLED==='true')context.waitUntil((async()=>{
   const url=new URL(env.CRM_NOTIFICATION_TARGET);
   if(url.origin!=='https://crm.maatwerkkunststof.nl'||url.pathname!=='/api/crm/notifications/run'||url.username||url.password||url.search||url.hash||! /^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||''))throw Error('Supplier mail schedule configuration incomplete');
   url.pathname='/api/crm/supplier-mail/run';
   const response=await fetch(url,{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+env.CRM_NOTIFICATION_JOB_KEY},signal:AbortSignal.timeout(120000)});
   await response.body?.cancel();if(!response.ok)throw Error('Supplier mail schedule could not complete: HTTP '+response.status);
  })());
  context.waitUntil((async()=>{
   const url=new URL(env.CRM_NOTIFICATION_TARGET);
   if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/api/crm/notifications/run'||! /^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||''))throw Error('Notification worker configuration incomplete');
   const response=await fetch(url,{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+env.CRM_NOTIFICATION_JOB_KEY},signal:AbortSignal.timeout(120000)});
   await response.body?.cancel();if(!response.ok)throw Error('Notification worker could not complete: HTTP '+response.status);
  })());
 }
};
