// One deployment per company. No public mutation endpoint, no customer data in logs.
export default {
 fetch(){return new Response('Not found',{status:404});},
 async scheduled(_event,env,context){
  context.waitUntil((async()=>{
   const url=new URL(env.CRM_NOTIFICATION_TARGET);
   if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/api/crm/notifications/run'||! /^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||''))throw Error('Notification worker configuration incomplete');
   const response=await fetch(url,{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+env.CRM_NOTIFICATION_JOB_KEY},signal:AbortSignal.timeout(120000)});
   await response.body?.cancel();if(!response.ok)throw Error('Notification worker could not complete: HTTP '+response.status);
  })());
 }
};
