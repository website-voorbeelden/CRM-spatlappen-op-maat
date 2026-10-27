import {notificationIntervalMinutes,notificationCron} from '../shared/notification-schedule.js';
// Explicit operator command, separate from dev startup. No provider test calls.
import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {experimental_readRawConfig} from 'wrangler';
import {buildPages} from './build-pages.mjs';
import {preparePagesDeploy} from './pages-staging.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),args=process.argv.slice(2),target=args.find(v=>['both','spatlappen','maatwerkkunststof'].includes(v));
if(!target)throw Error('Kies both, spatlappen of maatwerkkunststof. --inspect leest alleen de inrichting; --apply publiceert. --disable zet alleen de automatische betaalcontrole uit.');
const ids=target==='both'?['spatlappen','maatwerkkunststof']:[target],enabled=!args.includes('--disable'),release='crm-provider-transport-20261024';
if(!args.includes('--inspect')&&!args.includes('--apply')){console.log(JSON.stringify({mode:'plan-only',companies:ids,paymentPolling:enabled,intervalMinutes:notificationIntervalMinutes,actions:['eigen productieconfig/DBidentiteit en alleen secretnamen controleren','pushsleutels behouden, cron op gedeelde interval zetten','betaalcontroleflag, bronrelease en gedeelde cronfrequentie aanpassen','alleen bewezen Tikkie-ontvangsten automatisch registreren via bestaande dedup/CAS','geen betaallink, terugbetaling, mail of algemene bankkoppeling maken'],tests:'geen functionele tests of providerproef'},null,2));process.exit(0);}
const targets=JSON.parse(await readFile(path.join(root,'deploy/targets.json'),'utf8')),work=await mkdtemp(path.join(tmpdir(),'crm-payment-polling-')),journal={release,startedAt:new Date().toISOString(),phase:'preflight',paymentPolling:enabled,companies:[]};
const record=()=>writeFile(path.join(work,'result.json'),JSON.stringify(journal,null,2),{mode:0o600});
function cli(parameters,{cwd=root}={}){
 const result=spawnSync(process.execPath,[path.join(root,'node_modules/wrangler/bin/wrangler.js'),...parameters],{cwd,encoding:'utf8',timeout:240000,env:{...process.env,NO_COLOR:'1',WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:path.join(work,'wrangler.log')}});
 if(result.status!==0)throw Error('Cloudflare-stap '+parameters.slice(0,3).join(' ')+' niet bevestigd; niet blind herhalen.');
 return result.stdout;
}
try{
 const entries=[];
 for(const company of ids){
  const t=targets[company].production,dir=path.join(work,company);await mkdir(dir,{mode:0o700});
  cli(['pages','download','config',t.project],{cwd:dir});
  const {rawConfig}=experimental_readRawConfig({config:path.join(dir,'wrangler.toml')}),production=rawConfig.env?.production;
  if(rawConfig.name!==t.project||production?.vars?.CRM_COMPANY_ID!==company||production?.vars?.CRM_PUBLIC_URL!==t.publicUrl||production?.vars?.CRM_RELEASE_ENV!=='production'||production?.d1_databases?.find(d=>d.binding==='DB')?.database_id!==t.databaseId||production?.r2_buckets?.find(b=>b.binding==='CRM_FILES')?.bucket_name!==t.bucket)throw Error('Bedrijf of productieopslag wijkt af; niets publiceren.');
  const listed=cli(['pages','secret','list','--project-name',t.project]).replace(/\x1b\[[0-9;]*m/g,'');
  if(!listed.includes('The "production" environment of your Pages project "'+t.project+'"'))throw Error('Productie-secretlijst niet eenduidig.');
  const required=['TIKKIE_API_KEY','TIKKIE_APP_TOKEN','CRM_PUSH_PRIVATE_JWK','CRM_NOTIFICATION_JOB_KEY'],missing=required.filter(name=>!new RegExp('(?:^|\\s)'+name+':','m').test(listed));
  const providerLive=(production.vars.TIKKIE_BASE_URL||'https://api.abnamro.com/v2/tikkie')==='https://api.abnamro.com/v2/tikkie';
  const ready=!missing.length&&providerLive&&production.vars.CRM_PUSH_ENABLED==='true',saved={company,ready,missing,providerLive,previousPaymentPolling:production.vars.CRM_PAYMENT_POLL_ENABLED==='true',phase:'inspected'};journal.companies.push(saved);
  console.log(company+': '+(ready?'servervoorwaarden aanwezig (geen providerproef)':missing.length?'ontbrekende secretnamen: '+missing.join(', '):'live Tikkie-/meldingsinstelling ontbreekt'));
  const {env,...common}=rawConfig,config={...common,...production,r2_buckets:production.r2_buckets.map(b=>({...b,jurisdiction:'eu'})),vars:{...production.vars,CRM_RELEASE:release,CRM_PAYMENT_POLL_ENABLED:String(enabled)}};
  const configFile=path.join(dir,'preflight.jsonc');await writeFile(configFile,JSON.stringify(config,null,2),{mode:0o600});
  const identity=JSON.parse(cli(['d1','execute','DB','--remote','--config',configFile,'--command','SELECT company_id FROM crm_company_identity WHERE id=1','--json']));
  if(identity[0]?.results?.[0]?.company_id!==company)throw Error('Database-identiteit wijkt af.');
  const tables=JSON.parse(cli(['d1','execute','DB','--remote','--config',configFile,'--command',"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('crm_tikkie_requests','crm_notification_control')",'--json']));
  saved.tablesReady=tables[0]?.results?.length===2;if(!saved.tablesReady)saved.ready=false;
  const previous=JSON.parse(cli(['pages','deployment','list','--project-name',t.project,'--environment','production','--json']));
  if(previous[0]?.Branch!=='main')throw Error('Productiebranch of herstelpunt ontbreekt.');saved.previousDeployment=previous[0].Id;
  entries.push({company,t,dir,saved,config});
 }
 await record();
 if(!args.includes('--apply')){journal.phase='inspection-only';await record();console.log('Alleen inrichting gelezen; niets geactiveerd. Verslag: '+path.join(work,'result.json'));process.exit(0);}
 if(enabled&&entries.some(e=>!e.saved.ready))throw Error('Niet alle gekozen bedrijven hebben de vereiste online Tikkie-/meldingsinrichting. Niets gepubliceerd; ontbrekende koppeling eerst instellen.');
 // Prepare both packages before changing either production deployment.
 for(const e of entries){
  const buildDir=await buildPages({companyId:e.company,outDir:'dist/payment-polling-'+e.company+'-20261024',release,includeCostingV2:e.company==='maatwerkkunststof'&&e.t.costingV2===true});
  e.stage=await preparePagesDeploy({root,buildDir,destination:path.join(e.dir,'pages'),config:e.config});
  e.worker=path.join(e.dir,'worker');await mkdir(e.worker,{mode:0o700});
  await cp(path.join(root,'workers/notifications/index.js'),path.join(e.worker,'index.js'));
  await writeFile(path.join(e.worker,'wrangler.jsonc'),JSON.stringify({name:'crm-notifications-'+e.company,main:'index.js',compatibility_date:'2026-10-23',triggers:{crons:[notificationCron]},vars:{CRM_NOTIFICATION_TARGET:e.t.publicUrl+'/api/crm/notifications/run'}},null,2));
 }
 for(const e of entries){
  const output=cli(['pages','deploy','public','--project-name',e.t.project,'--branch','main','--commit-message','Herstel Cloudflare-providerverbindingen; kwartiercontrole behouden'],{cwd:e.stage});
  e.saved.deployment=output.match(/https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.pages\.dev/)?.[0]||null;e.saved.phase='pages-published';e.saved.paymentPolling=enabled;await record();
  cli(['deploy'],{cwd:e.worker}); // Existing Worker secret is retained; never put/rotate a key here.
  e.saved.phase='published';e.saved.notificationIntervalMinutes=notificationIntervalMinutes;e.saved.cron=notificationCron;
  targets[e.company].production.paymentPolling=enabled;await writeFile(path.join(root,'deploy/targets.json'),JSON.stringify(targets,null,2)+'\n');await record();
  console.log(e.company+': gepubliceerd, automatische Tikkiecontrole '+(enabled?'aan':'uit')+', achtergrondronde elke '+notificationIntervalMinutes+' minuten. Geen handmatige providerproef uitgevoerd.');
 }
 journal.phase='complete';journal.completedAt=new Date().toISOString();await record();console.log('Verslag: '+path.join(work,'result.json'));
}catch(error){journal.phase='stopped';journal.error=error.message;await record();console.error(error.message+' Verslag: '+path.join(work,'result.json'));process.exitCode=1;}
