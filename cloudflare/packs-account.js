import {authenticated} from './auth.js';
import {testPacksIdentity,readPacksProducts} from './packs-identity.js';
// Read-only account diagnostics, independent of shipment/profile release.
export async function handlePacksAccount({request,env}){
 const action=new URL(request.url).pathname.split('/').at(-1);if(!['account-identity','account-products'].includes(action))return null;
 const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(!await authenticated(request,env))return json({ok:false,error:{message:'Log opnieuw in om PACKS te gebruiken.'}},401);
 if(request.method!=='POST'||request.headers.get('Origin')!==env.CRM_PUBLIC_URL||request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json({ok:false,error:{message:'Gebruik de accountknop vanuit het CRM.'}},403);
 try{let raw='',size=0;const reader=request.body?.getReader();if(!reader)throw Error();const decoder=new TextDecoder();try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>1000){await reader.cancel();throw Error();}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
  const input=JSON.parse(raw);if(!input||Array.isArray(input)||Object.keys(input).length!==1||input.confirmed!==true)throw Error();
 }catch{return json({ok:false,error:{message:'Bevestig uitsluitend de accountopvraag.'}},400);}
 let credentials;try{credentials=JSON.parse(env.CRM_PACKS_API_ACCOUNT);}catch{return json({ok:false,error:{message:'Het API-account is nog niet beveiligd op de server ingesteld.'}},503);}
 const config={companyId:env.CRM_COMPANY_ID,environment:env.CRM_PACKS_ENVIRONMENT,credentials};
 return json(await (action==='account-identity'?testPacksIdentity:readPacksProducts)(config));
}
