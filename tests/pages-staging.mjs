import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {preparePagesDeploy} from '../scripts/pages-staging.mjs';
const temp=await mkdtemp(path.join(tmpdir(),'crm-pages-stage-'));
try{
 const root=path.join(temp,'source'),buildDir=path.join(root,'dist/spatlappen'),destination=path.join(temp,'stage');
 for(const name of ['functions','cloudflare','shared','admin','dist/spatlappen','.local'])await mkdir(path.join(root,name),{recursive:true});
 await writeFile(path.join(root,'wrangler.jsonc'),'ORIGINAL');await writeFile(path.join(root,'.local/private.env'),'DO NOT COPY');
 await writeFile(path.join(root,'functions/index.js'),'export const onRequest=()=>new Response("ok");');await writeFile(path.join(buildDir,'index.html'),'Public UI');await writeFile(path.join(buildDir,'private.sql'),'NO');
 const config={name:'spatlappen-crm',pages_build_output_dir:'./dist/spatlappen',vars:{CRM_COMPANY_ID:'spatlappen'},d1_databases:[{binding:'DB',database_id:'existing-db'}],r2_buckets:[{binding:'CRM_FILES',bucket_name:'existing-bucket'}]};
 assert.equal(await preparePagesDeploy({root,buildDir,destination,config}),destination);
 const staged=JSON.parse(await readFile(path.join(destination,'wrangler.jsonc'),'utf8'));assert.equal(staged.pages_build_output_dir,'./public');assert.deepEqual(staged.d1_databases,config.d1_databases);assert.deepEqual(staged.r2_buckets,config.r2_buckets);
 assert.equal(await readFile(path.join(destination,'public/index.html'),'utf8'),'Public UI');await access(path.join(destination,'functions/index.js'));
 await assert.rejects(access(path.join(destination,'.local')));await assert.rejects(access(path.join(destination,'public/private.sql')));assert.equal(await readFile(path.join(root,'wrangler.jsonc'),'utf8'),'ORIGINAL');
 await assert.rejects(preparePagesDeploy({root,buildDir,destination,config}),/EEXIST/);
 console.log('✓ Pages staging: standaard configuratiepad, bestaande bindings behouden, code/build gescheiden, geen privébestanden en oorspronkelijke configuratie ongewijzigd.');
}finally{await rm(temp,{recursive:true,force:true});}
