import {companyFor} from '../shared/companies.js';
const original={databaseId:'883aa7f6-d9fa-4e6e-ae16-63e383edf901',bucket:'spatlappen-crm-files',project:'spatlappen-crm'};
export function verifyTargets(config) {
 if(!/^[a-f0-9]{32}$/.test(config.accountId||''))throw Error('Cloudflare-account ontbreekt.');
 const seen={databaseId:new Set(),bucket:new Set()};
 for(const companyId of ['spatlappen','maatwerkkunststof'])if(config[companyId]?.preview?.project!==config[companyId]?.production?.project)throw Error('Test en live moeten bij het eigen Pages-project horen.');
 for(const companyId of ['spatlappen','maatwerkkunststof'])for(const environment of ['production','preview']) {
  const t=config[companyId]?.[environment];if(!t)throw Error('Doelconfiguratie ontbreekt.');
  for(const key of ['databaseId','bucket'])if(t[key]){if(seen[key].has(t[key]))throw Error('Bedrijven/test/live mogen geen opslag delen: '+key);seen[key].add(t[key]);}
  if(companyId==='spatlappen'&&environment==='production')for(const key of ['databaseId','bucket','project'])if(t[key]!==original[key])throw Error('De bestaande Spatlappen-productieopslag of project mag niet worden vervangen.');
  if(companyId==='maatwerkkunststof'&&t.project==='spatlappen-crm')throw Error('Bedrijven mogen geen Pages-project delen.');
 }
 return config;
}
export function targetConfig(config,companyId,environment,release) {
 const company=companyFor(companyId),t=config[companyId]?.[environment];
 if(!['production','preview'].includes(environment)||!t)throw Error('Onbekende omgeving.');
 for(const key of ['project','database','databaseId','bucket','allowedEmail'])if(typeof t[key]!=='string'||!t[key])throw Error(company.name+' '+environment+': '+key+' moet eerst worden ingesteld.');
 if(!/^[a-f0-9-]{36}$/i.test(t.databaseId)||![t.project,t.database,t.bucket].every(v=>/^[a-zA-Z0-9_-]+$/.test(v)))throw Error('Ongeldige opslagconfiguratie.');
 if(t.documentServiceUrl&&t.documentCompanyId!==companyId)throw Error('De documentservice moet bij hetzelfde bedrijf horen.');
 return {name:t.project,pages_build_output_dir:'./dist/'+companyId,compatibility_date:'2026-10-09',
  d1_databases:[{binding:'DB',database_name:t.database,database_id:t.databaseId,migrations_dir:'migrations'}],
  r2_buckets:[{binding:'CRM_FILES',bucket_name:t.bucket,jurisdiction:'eu'}],
  vars:{CRM_COMPANY_ID:companyId,CRM_RELEASE:release,CRM_RELEASE_ENV:environment,CRM_ALLOWED_EMAIL:t.allowedEmail,CRM_PUBLIC_URL:t.publicUrl,
    CRM_DOCUMENT_SERVICE_URL:t.documentServiceUrl,CRM_DOCUMENT_COMPANY_ID:t.documentCompanyId,TIKKIE_BASE_URL:'https://api.abnamro.com/v2/tikkie'}};
}
export function verifyExistingBindings(project,target,environment) {
 const settings=project.deployment_configs?.[environment];
 if(!settings)throw Error('Bestaande Pages-omgeving ontbreekt. Eerst afzonderlijk inrichten.');
 if(settings.d1_databases?.DB?.id!==target.databaseId||settings.r2_buckets?.CRM_FILES?.name!==target.bucket)throw Error('Bestaande Pages-opslag wijkt af. Publicatie geblokkeerd; controleer de koppelingen.');
}
