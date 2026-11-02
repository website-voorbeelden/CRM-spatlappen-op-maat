// Opt-in for a separately provisioned online proof environment. No production
// binding, provider action or login is created by this policy.
export const packsTrialOnly=env=>env.CRM_PACKS_TRIAL_ONLY==='true';
export function packsTrialPathAllowed(path){
 if(path.startsWith('/api/crm/')){
  const action=path.slice('/api/crm/'.length);
  return ['config','snapshot','commit','commit-status','files','design-storage','packs/status','packs/review'].includes(action)||action.startsWith('files/');
 }
 if(path==='/api'||path.startsWith('/api/'))return false;
 if(path==='/auth'||path.startsWith('/auth/'))return ['/auth/login','/auth/logout'].includes(path);
 if(!path.startsWith('/__local/'))return true;
 return /^\/__local\/assistant\/mail-(status|journal|configure|trial-recipient|send)$/.test(path)||['/__local/packs/status','/__local/packs/review','/__local/documents/render','/__local/documents/preview'].includes(path)||/^\/__local\/downloads\/[a-zA-Z0-9_-]{32}$/.test(path);
}
export async function packsTrialBindingsReady(env){
 if(!packsTrialOnly(env))return true;
 const id=env.CRM_PACKS_TRIAL_ID;
 if(env.CRM_COMPANY_ID!=='maatwerkkunststof'||env.CRM_RELEASE_ENV!=='preview'||typeof id!=='string'||!/^packs-proef-[a-z0-9-]{8,80}$/.test(id)||env.CRM_LOCAL_DEV==='true'||env.CRM_LOCAL_SERVICES)return false;
 try{
  const identity=await env.DB.prepare('SELECT environment_id FROM crm_packs_trial_identity WHERE id=1').first();
  return identity?.environment_id===id&&!!await env.CRM_FILES.head('_packs-trial/'+id);
 }catch{return false;}
}
