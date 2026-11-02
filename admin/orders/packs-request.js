export const packsOnline=context=>context.runtime.mode==='cloud'&&!context.runtime.local&&!context.runtime.localServices&&!context.runtime.packsTrialOnly&&!context.runtime.offlineReview;
// Shared CRM transport only; no provider host, credentials or booking retry.
export async function packsRequest(context,action,input,{query={}}={}){
 if(!packsOnline(context))throw Error('Deze werkplek gebruikt browseropslag of een afgeschermde proefstand. PACKS vraagt de afzonderlijk ingerichte centrale proefomgeving.');
 if(!/^[a-z-]+$/.test(action)||Object.keys(query).some(k=>k!=='since'))throw Error('Ongeldige PACKS-actie.');
 const isGet=typeof input==='string',search=isGet?'?'+new URLSearchParams({orderId:input,...query}):'';let response;
 try{response=await fetch('/api/crm/packs/'+action+search,{method:isGet?'GET':'POST',headers:isGet?{}:{'Content-Type':'application/json'},body:isGet?undefined:JSON.stringify(input),cache:'no-store',signal:AbortSignal.timeout(130000)});}catch{throw Error('Geen bevestigd serverantwoord. Controleer de bestaande poging via Status ophalen; boek niet opnieuw.');}
 const reader=response.body?.getReader();if(!reader)throw Error('Geen leesbaar PACKS-resultaat. Controleer dezelfde poging.');let raw='',size=0;const decoder=new TextDecoder();
 try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>12000000){await reader.cancel();throw Error('PACKS-antwoord is te groot. Onderzoek dezelfde poging, niet opnieuw boeken.');}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
 let result;try{result=JSON.parse(raw);}catch{throw Error('Geen leesbaar PACKS-resultaat. Controleer dezelfde poging.');}
 if(!result||typeof result!=='object'||Array.isArray(result))throw Error('Onverwacht PACKS-resultaat.');
 if(!response.ok)throw Object.assign(Error(result.error||'PACKS-stap niet afgerond.'),{traceId:result.traceId,httpStatus:response.status});return result;
}
