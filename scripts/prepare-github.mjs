import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'.local/github-upload');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const assets=['admin','shared','assistant','tools','workers','cloudflare','functions','migrations','print-assets','tests','scripts','deploy','.github','docs','README.md','FEEDBACK.md','OVERDRACHT.md','CLOUDFLARE.md','document-service','document-generator.py','dev-server.py','tikkie_local.py','render.yaml','index.html','login.html','login.css','login.js','number-inputs.js','crm-runtime.json','spatlap-preview.html','spatlap-preview-imagetracer.js','spatlap-preview-vector-editor.js','spatlap-preview-vector-export.js','spatlap-preview-integratie.md','package.json','package-lock.json','wrangler.jsonc','.gitignore','.dockerignore','.dev.vars.example','Start-beide-CRMs.command'];
for(const asset of assets){await mkdir(path.dirname(path.join(out,asset)),{recursive:true});await cp(path.join(root,asset),path.join(out,asset),{recursive:true,filter:p=>!['__pycache__','.local','.git','node_modules','dist','.DS_Store'].includes(path.basename(p))&&!/\.(pyc|log|bak)$/.test(p)});}
await writeFile(path.join(out,'.crm-upload-package'),'Code-only package. No customer backups or credentials.\n');console.log('Codepakket lokaal voorbereid in .local/github-upload. Er is niets geüpload.');
