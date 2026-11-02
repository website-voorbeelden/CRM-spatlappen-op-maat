import {integrationError} from './integration-store.js';
import {validatePacksProviderProfile} from '../shared/packs-provider-contract.js?v=packs-workflow-20261102';
import {packsId} from '../shared/packs-preparation.js?v=packs-worker-v3-20261102';

export function createPacksConfiguration(env,store){
 const indexKey='packs-configuration',versionKey=version=>'packs-config-'+version;
 function release(profile){return env.CRM_COMPANY_ID==='maatwerkkunststof'&&!!env.CRM_FILES?.get&&!!env.CRM_FILES?.put&&env.CRM_PACKS_EXECUTION_ENABLED==='true'&&env.CRM_PACKS_RELEASE_ID===profile.version&&env.CRM_RELEASE_ENV===(profile.environment==='live'?'production':'preview')&&env.CRM_PACKS_ENVIRONMENT===profile.environment&&packsId(env.CRM_PACKS_REGISTRY_GENERATION)&&env.CRM_PACKS_TRIAL_ONLY!=='true'&&env.CRM_LOCAL_DEV!=='true'&&!env.CRM_LOCAL_SERVICES;}
 async function load(version){
  const index=await store.read(indexKey),selected=version||index.value?.activeVersion;
  if(!packsId(selected))throw integrationError('Stel eerst het PACKS-account en de bevestigde dienst in.',423);
  const record=await store.read(versionKey(selected)),value=record.value;
  if(!value||value.schemaVersion!==1||value.profile?.version!==selected)throw integrationError('De oorspronkelijke PACKS-accountversie ontbreekt. Niet opnieuw boeken.',423);
  validatePacksProviderProfile(value.profile);return {index,record,value};
 }
 async function status(){
  const index=await store.read(indexKey);if(!index.value)return {configured:false,indexVersion:index.version,enabled:false,blockers:['PACKS-account en bevestigd dienstprofiel nog niet ingesteld.']};
  const {value}=await load(),p=value.profile,blockers=[];
  if(env.CRM_PACKS_EXECUTION_ENABLED!=='true')blockers.push('Servervrijgave voor PACKS staat uit.');
  if(env.CRM_PACKS_RELEASE_ID!==p.version)blockers.push('De ingestelde accountversie is nog niet als serverrelease vrijgegeven.');
  if(env.CRM_RELEASE_ENV!==(p.environment==='live'?'production':'preview')||env.CRM_PACKS_ENVIRONMENT!==p.environment)blockers.push('Serveromgeving en accountomgeving verschillen.');
  if(!packsId(env.CRM_PACKS_REGISTRY_GENERATION))blockers.push('Onafhankelijke registergeneratie ontbreekt.');
  if(!env.CRM_FILES?.get||!env.CRM_FILES?.put)blockers.push('Privébestandsopslag voor de originele labels ontbreekt.');
  return {configured:true,indexVersion:index.version,enabled:release(p),profile:p,credentialPresent:true,blockers};
 }
 async function save(input){
  if(!input||Object.keys(input).some(k=>!['profile','credentials','expectedVersion','confirmed'].includes(k))||input.confirmed!==true)throw integrationError('Controleer het account en de PACKS-afspraken.');
  if(typeof JSON.stringify(input.profile)!=='string'||JSON.stringify(input.profile).length>30000)throw integrationError('Het PACKS-profiel is te groot.');const profile=structuredClone(input.profile);validatePacksProviderProfile(profile);
  const index=await store.read(indexKey);if(index.version!==input.expectedVersion)throw integrationError('De PACKS-inrichting is intussen gewijzigd.',409);
  if(env.CRM_RELEASE_ENV!==(profile.environment==='live'?'production':'preview')||env.CRM_PACKS_TRIAL_ONLY==='true'||env.CRM_LOCAL_DEV==='true'||env.CRM_LOCAL_SERVICES)throw integrationError('Gebruik de afzonderlijke juiste serveromgeving voor dit account.',403);
  const credentials=input.credentials;if(!credentials||Object.keys(credentials).some(k=>!['username','password','clientId','clientSecret','scope'].includes(k))||['username','password','clientId','clientSecret','scope'].some(k=>typeof credentials[k]!=='string'||!credentials[k]||credentials[k].length>4096||/[\x00-\x1f\x7f]/.test(credentials[k])))throw integrationError('Vul de serveraccountgegevens in; deze komen niet in het log.');
  await store.exclusive('packs-configure',async()=>{
   const latest=await store.read(indexKey);if(latest.version!==index.version)throw integrationError('De inrichting is gewijzigd. Bewaar onder een nieuwe versie.',409);
   const existing=await store.read(versionKey(profile.version));
   const value={schemaVersion:1,profile,credentials:{...credentials,accountKey:profile.accountKey,configVersion:profile.version}};
   if(existing.value&&JSON.stringify(existing.value)!==JSON.stringify(value))throw integrationError('Een bestaande accountversie mag niet worden overschreven; kies een nieuwe versie voor herstelbehoud.',409);
   if(!existing.value)await store.write(versionKey(profile.version),value,existing.version);
   await store.write(indexKey,{schemaVersion:1,activeVersion:profile.version},latest.version);
  });return status();
 }
 async function credentials(profile){const {value}=await load(profile.version);if(JSON.stringify(value.profile)!==JSON.stringify(profile))throw integrationError('De accountbasis is gewijzigd.',409);return value.credentials;}
 async function loadProfileForAuthorization(version){return (await load(version)).value.profile;}
 async function authorizeOperation({operation,profile}){
  const index=await store.read(indexKey);if(!packsId(index.value?.activeVersion))return false;const active=await loadProfileForAuthorization(index.value.activeVersion);
  if(!release(active)||active.environment!==profile.environment)return false;const guard=await store.read('packs-'+profile.environment+'-guard');if(guard.value?.generation!==env.CRM_PACKS_REGISTRY_GENERATION||guard.value?.state!=='active')return false;
  return operation==='labels'||index.value.activeVersion===profile.version;
 }
 return {status,save,loadProfile:async version=>(await load(version)).value.profile,resolveCredentials:credentials,authorizeOperation};
}
