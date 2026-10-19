import {cp,mkdir,readdir,rm,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {companyFor,companyIds} from '../shared/companies.js';
const root=fileURLToPath(new URL('../',import.meta.url));
export async function buildPages({companyId='spatlappen',outDir='dist',release=process.env.CRM_RELEASE||'2.0.0'}={}) {
 const company=companyFor(companyId),out=path.resolve(root,outDir);
 if(!out.startsWith(path.join(root,'dist')+path.sep)&&out!==path.join(root,'dist'))throw Error('Build-output moet binnen dist staan.');
 await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
 const assets=['admin','shared','print-assets','index.html','login.html','login.css','login.js','number-inputs.js'];
 assets.push(...(company.tool==='design'?['spatlap-preview.html','spatlap-preview-favicon.svg','spatlap-preview-imagetracer.js','spatlap-preview-vector-editor.js','spatlap-preview-vector-export.js']:['tools/costing']));
 for(const asset of assets){await mkdir(path.dirname(path.join(out,asset)),{recursive:true});await cp(path.join(root,asset),path.join(out,asset),{recursive:true,filter:source=>!path.basename(source).startsWith('.')&&!source.endsWith('.md')});}
 for(const file of ['admin/index.html','login.html']){const p=path.join(out,file);let s=await readFile(p,'utf8');s=s.replace('<span class="brand">spatlappen.</span>','<span class="brand">'+company.brand+'.</span>');s=s.replace('/admin/icons/spatlappen.svg','/admin/icons/'+companyId+'.svg');s=s.replace(/<title>.*?<\/title>/,'<title>'+company.name+' • CRM</title>');await writeFile(p,s);}
 if(companyId==='spatlappen'){
  for(const file of ['index.html','privacy.html','terms.html','robots.txt'])await cp(path.join(root,'public-info',file),path.join(out,file));
  const loginPath=path.join(out,'login.html');let login=await readFile(loginPath,'utf8');login=login.replace('</main>','<p><a href="/">Over de app</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Voorwaarden</a></p></main>');await writeFile(loginPath,login);
 }
 await writeFile(path.join(out,'crm-runtime.json'),JSON.stringify({mode:'cloud',companyId,release,localServices:false}));
 const offlineAssets=['/admin/offline/','/admin/offline/app.js','/admin/offline/workspace.css','/admin/offline/store.js','/admin/offline/client.js','/shared/offline-state.js','/shared/companies.js'];
 // Public code only. Business snapshots and feedback use separate IndexedDB transactions.
 const reviewAssets=['/admin/','/number-inputs.js','/admin/icons/'+companyId+'.svg'];
 async function collectReview(dir){for(const e of await readdir(path.join(out,dir),{withFileTypes:true})){const relative=dir+'/'+e.name;if(e.isDirectory())await collectReview(relative);else if(/\.(js|css)$/.test(e.name)&&!relative.endsWith('/worker-template.js'))reviewAssets.push('/'+relative);}}
 await collectReview('admin');await collectReview('shared');
 for(const asset of reviewAssets)if(!offlineAssets.includes(asset))offlineAssets.push(asset);
 const manifest=await Promise.all(offlineAssets.map(async p=>({path:p,sha256:createHash('sha256').update(await readFile(path.join(out,p.endsWith('/')?p+'index.html':p))).digest('hex')})));
 const offlineVersion=createHash('sha256').update(companyId+JSON.stringify(manifest)).digest('hex').slice(0,20);
 let worker=await readFile(path.join(root,'admin/offline/worker-template.js'),'utf8');worker=worker.replace('__CRM_OFFLINE_ASSETS__',JSON.stringify(manifest)).replace('__CRM_OFFLINE_VERSION__',JSON.stringify(offlineVersion));
 await writeFile(path.join(out,'crm-offline-sw.js'),worker);await rm(path.join(out,'admin/offline/worker-template.js'));
 await writeFile(path.join(out,'_routes.json'),JSON.stringify({version:1,include:['/*'],exclude:[]}));
 // CSP does not pretend to fix injection. Only block framing/plugins/base-URL abuse
 // here; stricter script-src requires separately validating the legacy editor.
 await writeFile(path.join(out,'_headers'),"/*\n  Cache-Control: no-store\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: same-origin\n  Content-Security-Policy: base-uri 'self'; object-src 'none'; frame-ancestors 'none'\n");
 const walk=async dir=>{for(const e of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else if(/(?:\.py|\.docx|\.pdf|\.env|\.sql|\.bak)$/.test(e.name)||['wrangler.jsonc','package.json'].includes(e.name))throw Error('Niet-publiek bestand in build: '+f);}};await walk(out);
 console.log('Build klaar: '+company.name+' · '+release);
 return out;
}
if(process.argv[1]===fileURLToPath(import.meta.url))for(const companyId of companyIds)await buildPages({companyId,outDir:'dist/'+companyId});
