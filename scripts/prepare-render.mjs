import {mkdir,cp,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'.local/render-deploy');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
// A separate small repository can host just this conversion service. No customer
// records, backups, local imports, Tikkie credentials or password hash are copied.
for(const file of ['document-generator.py','.dockerignore','render.yaml','document-service/Dockerfile','document-service/server.py','document-service/runtime.json','document-service/templates/invoice.docx','document-service/templates/order-confirmation.docx','document-service/templates/packing-slip.docx','document-service/templates/maatwerkkunststof/packing-slip.docx']){
  await mkdir(path.dirname(path.join(out,file)),{recursive:true});await cp(path.join(root,file),path.join(out,file));
}
await writeFile(path.join(out,'README.md'),'# Spatlappen CRM — Word/PDF\n\nRender Web Service, Docker, Free. Gebruik render.yaml of document-service/Dockerfile. Stel CRM_DOCUMENT_SERVICE_TOKEN in als geheim; de waarde staat apart in de lokale render-secrets.env. Deze map bevat alleen de converter en lege bedrijfstemplates, geen klantgegevens of sleutels.\n');
console.log('Render-pakket klaar in .local/render-deploy. Secrets staan apart en worden niet meegekopieerd.');
