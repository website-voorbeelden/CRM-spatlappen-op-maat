import {spawn} from 'node:child_process';
import {copyFile,mkdir,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildPages} from './build-pages.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
await mkdir('.wrangler/logs',{recursive:true});
try{await access('.dev.vars');}catch{await copyFile('.dev.vars.example','.dev.vars');}
const env={...process.env,WRANGLER_LOG_PATH:path.join(root,'.wrangler/logs/local.log'),WRANGLER_SEND_METRICS:'false'};
const wrangler=path.join(root,'node_modules/wrangler/bin/wrangler.js');
const persist=process.env.CRM_TEST_STORAGE||'.wrangler/state';
function run(args){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,[wrangler,...args],{env,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Lokale Wrangler-opdracht mislukt: '+code)));});}
await buildPages();
// Always --local: the real EU database remains untouched.
await run(['d1','migrations','apply','spatlappen-crm','--local','--persist-to',persist]);
const child=spawn(process.execPath,[wrangler,'pages','dev','dist','--ip','127.0.0.1','--port',process.env.CRM_CLOUD_PORT||'8788','--persist-to',persist],{env,stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code||0));
