import {cp,mkdir,readdir,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const assets=['admin','print-assets','index.html','login.html','login.css','login.js','number-inputs.js','spatlap-preview.html','spatlap-preview-imagetracer.js','spatlap-preview-vector-editor.js','spatlap-preview-vector-export.js'];
export async function buildPages() {
  const out=path.join(root,'dist');await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
  for (const asset of assets) await cp(path.join(root,asset),path.join(out,asset),{recursive:true,filter:source=>!path.basename(source).startsWith('.')});
  // Public output is an allowlist. No Python, .local, credentials, Word templates,
  // configuration, customer imports, backups or development files are published.
  await writeFile(path.join(out,'crm-runtime.json'),JSON.stringify({mode:'cloud',localServices:false}));
  await writeFile(path.join(out,'_routes.json'),JSON.stringify({version:1,include:['/*'],exclude:[]}));
  await writeFile(path.join(out,'_headers'),'/*\n  Cache-Control: no-store\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: same-origin\n');
  const walk=async directory=>{for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await walk(file);else if(/(?:\.py|\.docx|\.pdf|\.env|\.sql|\.bak)$/.test(entry.name)||entry.name==='wrangler.jsonc'||entry.name==='package.json')throw Error('Privé- of bronbestand in de publicatiemap: '+file);}};
  await walk(out);console.log('Pages-build klaar: alleen publieke CRM- en editorbestanden.');
}
if (process.argv[1]===fileURLToPath(import.meta.url)) await buildPages();
