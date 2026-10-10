import {cp,mkdir,readFile,readdir,rm,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.resolve(root,'../github-upload-crm');
const marker=path.join(out,'.crm-upload-package');
try{
  await access(out);
  // Only replace a package previously created by this script.
  await access(marker);
  await rm(out,{recursive:true});
}catch(error){if(error.code!=='ENOENT')throw error;try{await access(out);throw Error('De uploadmap bestaat al zonder pakketmarkering.');}catch(check){if(check.code!=='ENOENT')throw check;}}
await mkdir(out,{recursive:true});
const files=['admin','cloudflare','functions','migrations','print-assets','tests',
  'scripts/build-pages.mjs','scripts/cloud-dev.mjs','scripts/prepare-render.mjs','scripts/prepare-github.mjs','scripts/stage-order.py',
  'document-service/Dockerfile','document-service/server.py','document-service/runtime.json','document-service/README.md',
  'document-service/templates/invoice.docx','document-service/templates/order-confirmation.docx',
  'index.html','login.html','login.css','login.js','number-inputs.js','crm-runtime.json',
  'spatlap-preview.html','spatlap-preview-imagetracer.js','spatlap-preview-vector-editor.js','spatlap-preview-vector-export.js','spatlap-preview-integratie.md',
  'dev-server.py','document-generator.py','tikkie_local.py','package.json','package-lock.json','wrangler.jsonc','render.yaml','.gitignore','.dockerignore','.dev.vars.example'];
const safe=source=>!['.DS_Store','__pycache__','node_modules','.git','.local','.wrangler','work','dist'].includes(path.basename(source))&&!/\.(?:pyc|log|bak)$/.test(source);
for(const file of files){await mkdir(path.dirname(path.join(out,file)),{recursive:true});await cp(path.join(root,file),path.join(out,file),{recursive:true,filter:safe});}
await writeFile(path.join(out,'README.md'),`# Spatlappen CRM\n\nCRM voor klanten, klantorders, inkoopbestellingen, betalingen, ontwerpen en documenten.\n\n## Lokaal\n\nGebruik Node.js 24+ en Python 3. Start met \`npm install\` en \`npm run dev\`, daarna http://localhost:3000/admin/. Zonder privéconfiguratie zijn lokale Tikkie- en Word/PDF-functies niet ingesteld. Klantgegevens in de lokale browser staan los van GitHub.\n\n## Cloudflare\n\n\`npm run build\` maakt de publieke Pages-build in dist. De Functions gebruiken D1-binding DB en privé-R2-binding CRM_FILES. Schema's staan in migrations. Publiceer met Wrangler zodat de Functions meekomen. GitHub Pages is niet nodig. Configureer login- en Tikkie-secrets apart op de server; zonder wachtwoordhash blijft online toegang geblokkeerd. Alleen crm.spatlappenopmaat.nl is voor dit CRM bedoeld.\n\n## Render\n\nWord/PDF draait als afzonderlijke gratis Docker-service. Dockerfile: document-service/Dockerfile; context: .; healthcheck: /health. Zie document-service/README.md. Render en Cloudflare gebruiken hetzelfde geheime CRM_DOCUMENT_SERVICE_TOKEN; stel ook CRM_DOCUMENT_SERVICE_URL in Cloudflare in.\n\n## Gegevens\n\nDit repositorypakket bevat uitsluitend code, bibliotheken, fonts en lege bedrijfstemplates. Klantdata, uploads, back-ups, privéconfiguratie en secrets zijn uitgesloten. Migreer echte gegevens na beveiliging via Instellingen & back-up in het CRM. Download eerst een volledige back-up.\n\n## Controles zonder browser\n\n\`npm run test:backend\` en \`node tests/customer-documents.mjs\` en \`node tests/session-undo.mjs\`. Browsercontroles in test:cloud worden alleen op verzoek gestart.\n`);

let privateValues=[];
for(const file of ['cloudflare-secrets.json','tikkie.json']){
  try{privateValues.push(...Object.entries(JSON.parse(await readFile(path.join(root,'.local',file),'utf8'))).filter(([key,value])=>/HASH|TOKEN|KEY|api_key|app_token/.test(key)&&typeof value==='string'&&value.length>=16).map(([,value])=>value));}catch(error){if(error.code!=='ENOENT')throw error;}
}
let count=0;
async function verify(directory){for(const entry of await readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory())await verify(file);
  else{
    if(/backup|imports\.json|\.env$|\.dev\.vars$|\.pdf$|\.sqlite/.test(entry.name))throw Error('Privébestand in uploadpakket: '+entry.name);
    const bytes=await readFile(file);
    if(privateValues.some(value=>bytes.includes(value)))throw Error('Geheime waarde gevonden in uploadpakket: '+entry.name);
    count++;
  }
}}
await verify(out);await writeFile(marker,'Generated code-only upload package. Not a customer backup.\n');
console.log(`GitHub-uploadmap klaar: ${out}\n${count} gecontroleerde bestanden; geen klantback-ups of voorbereide secrets. Niets geüpload.`);
