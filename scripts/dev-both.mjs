import {randomBytes} from 'node:crypto';
import {startAssistantServer} from '../assistant/server.mjs';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const selected=process.argv[2]||'both';if(!['both','spatlappen','maatwerkkunststof'].includes(selected))throw Error('Onbekend bedrijf.');
const companyIds=selected==='both'?['spatlappen','maatwerkkunststof']:[selected];
const ports=[Number(process.env.CRM_SPATLAPPEN_PORT||3010),Number(process.env.CRM_KUNSTSTOF_PORT||3011)];
if(ports[0]===ports[1])throw Error('De twee CRM-versies hebben aparte poorten nodig.');
for(const port of companyIds.map(id=>ports[id==='spatlappen'?0:1]))await new Promise((resolve,reject)=>{const probe=createServer();probe.once('error',error=>reject(Error(error.code==='EADDRINUSE'?'Poort '+port+' is bezet. Stop de bestaande nieuwe CRM-server of kies een andere poort.':'Lokale poort '+port+' openen lukt niet: '+error.code)));probe.listen(port,'127.0.0.1',()=>probe.close(resolve));});
const assistantKey=randomBytes(32).toString('hex');
const helper=await startAssistantServer({key:assistantKey,directory:'.local/chatgpt-assistant',port:Number(process.env.CRM_ASSISTANT_PORT||3030)});
console.log('Lokale Plus-assistentdienst gestart. Inloggen gebeurt via de CRM-pagina.');
const children=companyIds.map(company=>spawn(process.execPath,['scripts/dev-company.mjs',company],{stdio:'inherit',env:{...process.env,CRM_PORT:String(ports[company==='spatlappen'?0:1]),CRM_ASSISTANT_KEY:assistantKey,CRM_ASSISTANT_PORT:String(helper.port)}}));
let stopping=false;function stop(){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');helper.close();}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,stop);
for(const child of children)child.on('exit',code=>{if(!stopping){process.exitCode=code||1;stop();}});
