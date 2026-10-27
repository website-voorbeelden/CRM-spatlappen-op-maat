import {notificationCron} from '../shared/notification-schedule.js';
// Explicit operator command; never called by dev startup, build or CI.
// Uses the existing Wrangler login. It never reads existing secret values.
import {spawnSync} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile,cp} from 'node:fs/promises';
import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {experimental_readRawConfig} from 'wrangler';
import {buildPages} from './build-pages.mjs';
import {preparePagesDeploy} from './pages-staging.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),args=process.argv.slice(2),target=args.find(value=>['both','spatlappen','maatwerkkunststof'].includes(value));
if(!target)throw Error('Kies expliciet both, spatlappen of maatwerkkunststof. Standaard wordt alleen het plan getoond; --apply voert uit.');
const ids=target==='both'?['spatlappen','maatwerkkunststof']:[target],targets=JSON.parse(await readFile(path.join(root,'deploy/targets.json'),'utf8'));
const plan=ids.map(company=>{const t=targets[company].production;if(!t.project||!t.databaseId||!t.bucket||!t.publicUrl)throw Error('Publicatiedoel ontbreekt.');return {company,project:t.project,databaseId:t.databaseId,bucket:t.bucket,origin:t.publicUrl,worker:'crm-notifications-'+company,interval:notificationCron,paymentPolling:'niet ingeschakeld door deze opdracht',deviceConsent:'uitsluitend door Philippe op de telefoon'};});
if(!args.includes('--apply')){console.log(JSON.stringify({mode:'plan-only',plan,actions:['bestaande productieconfig en bedrijfsidentiteit lezen','stoppen als meldingssleutels al bestaan; nooit stil roteren','D1 Time Travel-herstelpunt vastleggen','alleen additieve migratie0005','nieuwe aparte push- en jobkeys per bedrijf, niet tonen','bestaande CRM-code publiceren met behoud van overige instellingen','eigen meldingenworker per bedrijf; geen echte providerbetaalcontrole','toesteltoestemming blijft nodig'],tests:'geen tests, syntaxchecks of browser-QA'},null,2));process.exit(0);}
const work=await mkdtemp(path.join(tmpdir(),'crm-notifications-activation-')),release='crm-analytics-notifications-20261024',journal={startedAt:new Date().toISOString(),release,privateRecoveryDirectory:work,companies:[],phase:'preflight'};
const record=async()=>writeFile(path.join(work,'result.json'),JSON.stringify(journal,null,2),{mode:0o600});
function cli(parameters,{cwd=root,input,sensitive=false}={}){
 const result=spawnSync(process.execPath,[path.join(root,'node_modules/wrangler/bin/wrangler.js'),...parameters],{cwd,input,encoding:'utf8',timeout:240000,env:{...process.env,NO_COLOR:'1',WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:path.join(work,'wrangler.log')}});
 if(result.status!==0)throw Error('Cloudflare-stap '+parameters.slice(0,3).join(' ')+' is niet bevestigd. Stop; bekijk het beschermde herstelverslag voordat je opnieuw activeert.');
 if(!sensitive)return result.stdout;
}
try{
 // Preflight every company before creating any secret, table or deployment.
 const entries=[];
 for(const item of plan){
  const dir=path.join(work,item.company);await mkdir(dir,{mode:0o700});
  cli(['pages','download','config',item.project],{cwd:dir});
  const {rawConfig}=experimental_readRawConfig({config:path.join(dir,'wrangler.toml')}),production=rawConfig.env?.production;
  if(rawConfig.name!==item.project||production?.vars?.CRM_COMPANY_ID!==item.company||production?.vars?.CRM_PUBLIC_URL!==item.origin||production?.d1_databases?.find(d=>d.binding==='DB')?.database_id!==item.databaseId||production?.r2_buckets?.find(b=>b.binding==='CRM_FILES')?.bucket_name!==item.bucket)throw Error('Doel, bedrijf of opslag wijkt af; niets activeren.');
  const secrets=cli(['pages','secret','list','--project-name',item.project]).replace(/\x1b\[[0-9;]*m/g,'');
  if(!secrets.includes('The \"production\" environment of your Pages project \"'+item.project+'\"'))throw Error('De productie-secretlijst is niet eenduidig; gestopt.');
  if(/(?:^|\s)(?:CRM_PUSH_PRIVATE_JWK|CRM_NOTIFICATION_JOB_KEY):/m.test(secrets))throw Error('Meldingssleutels bestaan al voor '+item.company+'. Deze opdracht roteert geen bestaande sleutels; controleer eerst de eerdere activering.');
  const {env,...common}=rawConfig;
  const config={...common,...production,vars:{...production.vars,CRM_RELEASE:release,CRM_PUSH_ENABLED:'true',CRM_PUSH_SUBJECT:'mailto:info@'+new URL(item.origin).hostname.replace(/^crm\./,''),CRM_PAYMENT_POLL_ENABLED:production.vars.CRM_PAYMENT_POLL_ENABLED||'false'},r2_buckets:production.r2_buckets.map(bucket=>({...bucket,jurisdiction:'eu'}))};
  const configFile=path.join(dir,'preflight.jsonc');await writeFile(configFile,JSON.stringify(config,null,2),{mode:0o600});
  const identity=JSON.parse(cli(['d1','execute','DB','--remote','--config',configFile,'--command','SELECT company_id FROM crm_company_identity WHERE id=1','--json']));
  if(identity[0]?.results?.[0]?.company_id!==item.company)throw Error('Database-identiteit wijkt af; niets activeren.');
  const previous=JSON.parse(cli(['pages','deployment','list','--project-name',item.project,'--environment','production','--json']));
  if(!Array.isArray(previous)||previous[0]?.Branch!=='main')throw Error('Productiebranch of vorig herstelpunt ontbreekt.');
  const pair=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),privateJwk=JSON.stringify(pair.privateKey.export({format:'jwk'})),jobKey=randomBytes(32).toString('hex');
  // Recovery only for this newly generated key pair. Never published as assets.
  await writeFile(path.join(dir,'new-notification-keys.json'),JSON.stringify({CRM_PUSH_PRIVATE_JWK:privateJwk,CRM_NOTIFICATION_JOB_KEY:jobKey}),{mode:0o600});
  const saved={company:item.company,project:item.project,previousDeployment:previous[0].Id,phase:'prepared',paymentPolling:config.vars.CRM_PAYMENT_POLL_ENABLED==='true'};journal.companies.push(saved);
  const buildDir=await buildPages({companyId:item.company,outDir:'dist/notifications-'+item.company+'-20261024',release,includeCostingV2:item.company==='maatwerkkunststof'});
  const stage=await preparePagesDeploy({root,buildDir,destination:path.join(dir,'pages'),config});
  const worker=path.join(dir,'worker');await mkdir(worker,{mode:0o700});await cp(path.join(root,'workers/notifications/index.js'),path.join(worker,'index.js'));
  const workerConfig={name:item.worker,main:'index.js',compatibility_date:'2026-10-23',triggers:{crons:[]},vars:{CRM_NOTIFICATION_TARGET:item.origin+'/api/crm/notifications/run'}};
  await writeFile(path.join(worker,'wrangler.jsonc'),JSON.stringify(workerConfig,null,2));
  entries.push({item,dir,configFile,stage,worker,workerConfig,privateJwk,jobKey,saved});console.log(item.company+': publicatie voorbereid; geen bestaande secrets geopend.');
 }
 await record();
 for(const entry of entries){
  const {item,dir,configFile,stage,worker,workerConfig,privateJwk,jobKey,saved}=entry;
  await writeFile(path.join(dir,'bookmark-before.json'),cli(['d1','time-travel','info','DB','--config',configFile,'--json']),{mode:0o600});
  cli(['d1','execute','DB','--remote','--config',configFile,'--file',path.join(root,'migrations/0005_notifications.sql'),'--yes']);saved.phase='migration-applied';await record();
  cli(['pages','secret','put','CRM_PUSH_PRIVATE_JWK','--project-name',item.project],{input:privateJwk,sensitive:true});
  cli(['pages','secret','put','CRM_NOTIFICATION_JOB_KEY','--project-name',item.project],{input:jobKey,sensitive:true});saved.phase='pages-secrets-created';await record();
  cli(['deploy'],{cwd:worker}); // No cron until Pages and its job secret are ready.
  cli(['secret','put','CRM_NOTIFICATION_JOB_KEY'],{cwd:worker,input:jobKey,sensitive:true});saved.phase='worker-prepared-without-cron';await record();
  const output=cli(['pages','deploy','public','--project-name',item.project,'--branch','main','--commit-message','CRM vervolgwerk en betalingsmeldingen'],{cwd:stage});
  saved.deployment=output.match(/https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.pages\.dev/)?.[0]||null;saved.phase='pages-published';await record();
  workerConfig.triggers.crons=[notificationCron];await writeFile(path.join(worker,'wrangler.jsonc'),JSON.stringify(workerConfig,null,2));cli(['deploy'],{cwd:worker});
  saved.phase='server-activated-device-consent-needed';
  const target=targets[item.company].production;target.pushEnabled=true;target.pushSubject='mailto:info@'+new URL(item.origin).hostname.replace(/^crm\./,'');if(item.company==='maatwerkkunststof')target.costingV2=true;
  await writeFile(path.join(root,'deploy/targets.json'),JSON.stringify(targets,null,2)+'\n');await record();console.log(item.company+': server ingericht en CRM gepubliceerd. Zet meldingen zelf aan op je telefoon.');
 }
 journal.phase='complete';journal.completedAt=new Date().toISOString();await record();console.log('Activeringsverslag (privé, bevat herstelverwijzingen): '+path.join(work,'result.json'));
}catch(error){journal.phase='stopped';journal.stoppedAt=new Date().toISOString();journal.error=error.message;await record();console.error(error.message+' Beschermd verslag: '+path.join(work,'result.json'));process.exitCode=1;}
