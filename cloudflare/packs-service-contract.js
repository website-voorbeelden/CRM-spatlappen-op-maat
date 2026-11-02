// Internal service contract. No provider calls or writes here.
export const packsServiceHeader='X-CRM-Packs-Service-Key';
export const packsServiceKey=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const error=()=>Object.assign(Error('De afzonderlijke PACKS-dienst is nog niet correct ingericht.'),{status:503});
export async function assertPacksServiceEnvironment(env){
 const deployment=(env.CRM_RELEASE_ENV==='preview'&&env.CRM_PACKS_ENVIRONMENT==='test')?'preview':(env.CRM_RELEASE_ENV==='production'&&env.CRM_PACKS_ENVIRONMENT==='live')?'production':null;
 if(env.CRM_COMPANY_ID!=='maatwerkkunststof'||!deployment||env.CRM_LOCAL_DEV==='true'||env.CRM_LOCAL_SERVICES||env.CRM_PACKS_TRIAL_ONLY==='true'||!packsServiceKey(env.CRM_PACKS_STORAGE_ID)||!env.DB)throw error();
 let identity;try{identity=await env.DB.prepare('SELECT company_id,environment,storage_id FROM crm_packs_service_identity WHERE id=1').first();}catch{throw error();}
 if(identity?.company_id!=='maatwerkkunststof'||identity.environment!==deployment||identity.storage_id!==env.CRM_PACKS_STORAGE_ID)throw error();
 const company=await env.DB.prepare('SELECT company_id FROM crm_company_identity WHERE id=1').first();if(company?.company_id!=='maatwerkkunststof')throw error();
}
export function packsServiceOrigin(request,env){
 try{const configured=new URL(env.CRM_PUBLIC_URL),actual=new URL(request.url);return configured.protocol==='https:'&&configured.origin===String(env.CRM_PUBLIC_URL).replace(/\/$/,'')&&actual.origin===configured.origin;}catch{return false;}
}
export async function verifyPacksServiceKey(request,env){
 const expected=env.CRM_PACKS_SERVICE_KEY,actual=request.headers.get(packsServiceHeader);
 if(!packsServiceKey(expected)||!packsServiceKey(actual))return false;
 const encode=new TextEncoder(),hash=async value=>crypto.subtle.digest('SHA-256',encode.encode(value));
 return crypto.subtle.timingSafeEqual(await hash(expected),await hash(actual));
}
