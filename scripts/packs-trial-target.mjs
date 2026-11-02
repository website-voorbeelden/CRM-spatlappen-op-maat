import {targetConfig} from './release-config.mjs';

// Pure configuration preparation. No CLI entry, filesystem, credential, network,
// build, schema change or deployment. Resources still require separate setup.
export function packsTrialTargetConfig({target,existingTargets,release,environmentId}){
 const fail=message=>{throw Error('PACKS-proefomgeving: '+message);};
 const name=value=>typeof value==='string'&&/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(value);
 const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
 const origin=value=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&value===url.origin?url.origin:'';}catch{return '';}};
 if(!target||!['project','database','bucket'].every(key=>name(target[key]))||!uuid(target.databaseId))fail('vul de werkelijk nieuw aangemaakte project-, database- en bucketgegevens in.');
 if(typeof environmentId!=='string'||!/^packs-proef-[a-z0-9-]{8,80}$/.test(environmentId))fail('een eigen unieke proefidentiteit ontbreekt.');
 if(typeof release!=='string'||!/^[a-zA-Z0-9._-]{1,160}$/.test(release))fail('leg de exacte bronversie vast.');
 if(!Array.isArray(existingTargets)||existingTargets.length!==4)fail('vergelijk eerst met de vier bestaande bedrijfs-/test-/liveomgevingen.');
 const roles=new Set();
 for(const existing of existingTargets){
  const role=existing.companyId+'/'+existing.environment;
  if(!['spatlappen','maatwerkkunststof'].includes(existing.companyId)||!['production','preview'].includes(existing.environment)||roles.has(role)||!existing.project||!existing.bucket||!uuid(existing.databaseId))fail('de vergelijking met bestaande omgevingen is onvolledig.');
  roles.add(role);
  if(target.project.toLowerCase()===existing.project.toLowerCase()||target.databaseId.toLowerCase()===existing.databaseId.toLowerCase()||target.bucket.toLowerCase()===existing.bucket.toLowerCase())fail('de proef moet een eigen project, database én bestandsbucket krijgen.');
  if(target.publicUrl&&existing.publicUrl&&origin(target.publicUrl)===origin(existing.publicUrl))fail('de proef mag geen bestaande CRM-URL gebruiken.');
 }
 if(!origin(target.publicUrl)||new URL(target.publicUrl).hostname!==target.project+'.pages.dev')fail('gebruik de eigen HTTPS-hoofd-URL van het nieuwe Pages-project.');
 if(typeof target.allowedEmail!=='string'||target.allowedEmail.length>254||!/^[-A-Za-z0-9.!#$%&'*+/=?^_`{|}~]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(target.allowedEmail))fail('de eigen loginontvanger ontbreekt.');
 if(target.documentCompanyId!=='maatwerkkunststof'||!origin(target.documentServiceUrl)||!new URL(target.documentServiceUrl).hostname.endsWith('.onrender.com'))fail('leg de expliciete Maatwerkkunststof-documentservice vast.');
 const config=targetConfig({maatwerkkunststof:{preview:{...target,pushEnabled:false,paymentPolling:false}}},'maatwerkkunststof','preview',release);
 delete config.vars.TIKKIE_BASE_URL;
 delete config.vars.CRM_PUSH_SUBJECT;
 Object.assign(config.vars,{CRM_PACKS_TRIAL_ONLY:'true',CRM_PACKS_TRIAL_ID:environmentId,CRM_REQUIRE_LOGIN:'true',CRM_PUSH_ENABLED:'false',CRM_PAYMENT_POLL_ENABLED:'false'});
 return {
  status:'configuration-prepared-not-deployed',config,
  // The independent project's main branch uses Pages' production binding slot,
  // while the application explicitly remains a preview with trial-only policy.
  pagesBindingSlot:'production',branch:'main',
  requiredOwnSecrets:['CRM_PASSWORD_HASH','CRM_INTEGRATIONS_KEY','CRM_DOCUMENT_SERVICE_TOKEN'],
  requiredMarkers:{database:{table:'crm_packs_trial_identity',environmentId},bucketKey:'_packs-trial/'+environmentId},
  sourceReviewed:false,userReviewed:false,publishReady:false
 };
}
