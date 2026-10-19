import {readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildPages} from './build-pages.mjs';
import {verifyTargets,targetConfig,verifyExistingBindings} from './release-config.mjs';
import {preparePagesDeploy} from './pages-staging.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const target=option('--target','both'),environment=option('--environment','preview');
if(!['both','spatlappen','maatwerkkunststof'].includes(target))throw Error('Onbekend bedrijf.');
const companyIds=target==='both'?['spatlappen','maatwerkkunststof']:[target];
const config=verifyTargets(JSON.parse(await readFile('deploy/targets.json','utf8')));
const git=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
const release=git.status===0?git.stdout.trim():'2.0.0-local';
const plans=[];let incomplete=false;
for(const id of companyIds){try{plans.push({id,t:config[id][environment],wrangler:targetConfig(config,id,environment,release)});console.log(id+' · '+environment+' · configuratie compleet');}catch(error){incomplete=true;console.log(error.message);}}
if(!args.includes('--deploy')){console.log('Alleen plan; geen externe aanvragen, publicaties of databasewijzigingen.');process.exit(0);}
if(incomplete)throw Error('Eerst alle gekozen omgevingen configureren. Er is niets gepubliceerd.');
if(git.status!==0||spawnSync('git',['status','--porcelain'],{encoding:'utf8'}).stdout.trim())throw Error('Publiceer uitsluitend een vastgelegde, schone Git-versie.');
const check=spawnSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});if(check.status!==0)throw Error('Controles mislukt; niets gepubliceerd.');
const token=process.env.CLOUDFLARE_API_TOKEN;if(!token)throw Error('Publicatietoken ontbreekt.');
const api=async endpoint=>{const response=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.accountId+endpoint,{headers:{Authorization:'Bearer '+token}});const data=await response.json();if(!response.ok||!data.success)throw Error('Cloudflare-configuratie kan niet worden gecontroleerd.');return data.result;};
// All project/storage checks happen before the first mutation, for both companies.
for(const p of plans){const project=await api('/pages/projects/'+p.t.project);verifyExistingBindings(project,p.t,environment);if(project.production_branch!=='main')throw Error('Productiebranch wijkt af van main. Publicatie geblokkeerd.');const db=await api('/d1/database/'+p.t.databaseId);if(db.name!==p.t.database)throw Error('Database-ID en naam wijken af.');}
const tmp='.local/release';await mkdir(tmp,{recursive:true});
const wrangler=path.join(root,'node_modules/wrangler/bin/wrangler.js');
function run(args,json=false,cwd=root){const result=spawnSync(process.execPath,[wrangler,...args],{cwd,encoding:json?'utf8':undefined,stdio:json?'pipe':'inherit',env:{...process.env,CLOUDFLARE_ACCOUNT_ID:config.accountId,WRANGLER_SEND_METRICS:'false'}});if(result.status!==0)throw Error('Cloudflare-opdracht mislukt. Bekijk de publicatiestatus voordat je herhaalt.');return json?JSON.parse(result.stdout):null;}
const settingsFiles=[];
try {
 for(const p of plans){p.file='.release-'+p.id+'.jsonc';settingsFiles.push(p.file);await writeFile(p.file,JSON.stringify(p.wrangler,null,2));
  // Inspect the identity BEFORE applying any migration. Missing table means first registration.
  const tables=run(['d1','execute',p.t.database,'--remote','--config',p.file,'--command',"SELECT name FROM sqlite_master WHERE type='table' AND name='crm_company_identity'",'--json'],true);
  if(tables[0]?.results?.length){const rows=run(['d1','execute',p.t.database,'--remote','--config',p.file,'--command','SELECT company_id FROM crm_company_identity WHERE id=1','--json'],true);if(rows[0]?.results?.[0]?.company_id&&rows[0].results[0].company_id!==p.id)throw Error('Database geregistreerd voor ander bedrijf.');}
 }
 // Bookmark preserves database state; do not reset or import any business data.
 for(const p of plans){const bookmark=run(['d1','time-travel','info',p.t.database,'--config',p.file,'--json'],true);await writeFile(path.join(tmp,p.id+'-'+Date.now()+'-bookmark.json'),JSON.stringify(bookmark));}
 for(const p of plans){run(['d1','migrations','apply',p.t.database,'--remote','--config',p.file]);run(['d1','execute',p.t.database,'--remote','--config',p.file,'--command',"INSERT OR IGNORE INTO crm_company_identity(id,company_id) VALUES(1,'"+p.id+"')"]);}
 const results=[];
 for(const p of plans){try {const buildDir=await buildPages({companyId:p.id,outDir:'dist/'+p.id,release});const stage=await preparePagesDeploy({root,buildDir,destination:path.join(root,tmp,'pages-'+p.id+'-'+Date.now()),config:p.wrangler});run(['pages','deploy','public','--project-name',p.t.project,'--branch',environment==='production'?'main':'crm-test','--commit-hash',release],false,stage);results.push({company:p.id,release,environment,status:'published'});}catch(error){results.push({company:p.id,release,environment,status:'failed'});await writeFile(path.join(tmp,'last-release.json'),JSON.stringify(results,null,2));throw error;}await writeFile(path.join(tmp,'last-release.json'),JSON.stringify(results,null,2));}
 console.log('Beide gekozen publicaties voltooid. Status: .local/release/last-release.json');
}finally{for(const file of settingsFiles)await rm(file,{force:true});}
