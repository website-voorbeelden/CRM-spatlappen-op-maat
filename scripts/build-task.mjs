import {readFile,writeFile,rename,open,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {items} from '../shared/planning/roadmap.js';

// Append-only local source administration; no browser, database or provider.
const file=fileURLToPath(new URL('../shared/planning/source-updates.js',import.meta.url));
const header='// Bouwvoortgang vanuit code. Beheer via scripts/build-task.mjs; geen klantgegevens.\nexport const sourceUpdates = ';
const [command,inputPath]=process.argv.slice(2);
if(command!=='add'||!inputPath)throw Error('Gebruik: node scripts/build-task.mjs add /pad/naar/bouwnotitie.json');
const entry=JSON.parse(await readFile(inputPath,'utf8'));
if(!entry||typeof entry!=='object'||Array.isArray(entry))throw Error('Verwacht één bouwnotitie als JSON-object.');
const task=items.find(item=>item.id===entry.taskId),allowed=['id','taskId','companies','at','author','status','delivery','note','evidence'];
if(!task||Object.keys(entry).some(key=>!allowed.includes(key))||!Array.isArray(entry.companies)||!entry.companies.length||new Set(entry.companies).size!==entry.companies.length||entry.companies.some(company=>!task.companies.includes(company))||typeof entry.id!=='string'||!/^[a-zA-Z0-9._-]{1,160}$/.test(entry.id)||typeof entry.at!=='string'||!Number.isFinite(Date.parse(entry.at))||!['open','doing','blocked','review','done'].includes(entry.status)||!['unknown','local','live'].includes(entry.delivery))throw Error('Ongeldige bouwtaak, bedrijven, datum of status.');
for(const [key,max] of [['author',80],['note',6000],['evidence',4000]])if(typeof entry[key]!=='string'||entry[key].length>max||key==='author'&&!entry[key].trim())throw Error('Ongeldige '+key+'.');
if(!entry.note.trim()&&!entry.evidence.trim())throw Error('Noteer resultaat en/of beperking.');
let lock;
try{
 lock=await open(file+'.lock','wx');
 const original=await readFile(file,'utf8');
 if(!original.startsWith(header)||!original.trimEnd().endsWith(';'))throw Error('Onbekend bronformaat; niets gewijzigd.');
 const updates=JSON.parse(original.slice(header.length).trim().slice(0,-1));
 if(!Array.isArray(updates))throw Error('Ongeldig bronlog.');
 const existing=updates.find(update=>update.id===entry.id);
 if(existing){if(JSON.stringify(existing)!==JSON.stringify(entry))throw Error('Deze notitie-ID bestaat met andere inhoud. Voeg een correctie met een nieuwe ID toe.');process.stdout.write('Bouwnotitie stond al in de code.\n');}
 else{updates.push(entry);await writeFile(file+'.tmp',header+JSON.stringify(updates,null,2)+';\n');await rename(file+'.tmp',file);process.stdout.write('Bouwnotitie toegevoegd aan de code; geen database gewijzigd.\n');}
}finally{if(lock){await lock.close();await unlink(file+'.lock');}}
