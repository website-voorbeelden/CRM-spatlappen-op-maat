// Capability handshake only: never asks for notification permission, creates a
// subscription or triggers a push. An old worker must not receive report payloads.
export async function confirmReportDevice(registration,{companyId,fetcher=fetch}={}){
 const worker=registration?.active,subscription=await registration?.pushManager?.getSubscription();
 if(!worker||!subscription||typeof MessageChannel==='undefined')return false;
 const ready=await new Promise(resolve=>{
  const channel=new MessageChannel(),nonce=crypto.randomUUID();
  const finish=value=>{clearTimeout(timer);channel.port1.close();resolve(value);};
  const timer=setTimeout(()=>finish(false),4000);
  channel.port1.onmessage=event=>finish(event.data?.nonce===nonce&&event.data?.companyId===companyId&&event.data?.reportProtocol===1);
  try{worker.postMessage({type:'crm-report-capabilities',nonce},[channel.port2]);}catch{finish(false);}
 });
 if(!ready)return false;
 const response=await fetcher('/api/crm/notifications/report-device',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(15000),body:JSON.stringify({companyId,endpoint:subscription.endpoint,protocol:1})});
 const data=await response.json().catch(()=>null);
 return response.ok&&data?.reportCapable===true;
}
