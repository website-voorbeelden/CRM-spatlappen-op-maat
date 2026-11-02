import {spawn,execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,open,unlink,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import net from 'node:net';
const root=fileURLToPath(new URL('../',import.meta.url)),directory=path.join(root,'work/local-runtime');
await mkdir(directory,{recursive:true,mode:0o700});
const pidFile=path.join(directory,'servers.json'),lockFile=path.join(directory,'start.lock'),ports=[3010,3011];
const alive=pid=>{try{if(!Number.isSafeInteger(pid)||pid<=0)return false;process.kill(pid,0);return true;}catch(error){return error.code==='EPERM';}};
const listening=port=>new Promise(resolve=>{const socket=net.connect({host:'127.0.0.1',port});socket.setTimeout(400);socket.once('connect',()=>{socket.destroy();resolve(true);});socket.once('error',()=>resolve(false));socket.once('timeout',()=>{socket.destroy();resolve(false);});});
// Serialize double clicks. A stale launcher lock may be removed; only --restart stops our verified owner.
let lock;
for(let attempt=0;attempt<30&&!lock;attempt++){
 try{lock=await open(lockFile,'wx',0o600);}
 catch(error){if(error.code!=='EEXIST')throw error;try{const pid=Number(await readFile(lockFile,'utf8'));const age=Date.now()-(await stat(lockFile)).mtimeMs;const stale=Number.isSafeInteger(pid)&&pid>0?!alive(pid):age>30000;if(stale)await unlink(lockFile);}catch{}if(attempt===29)throw Error('CRM wordt al gestart. Wacht even en probeer daarna opnieuw.');await new Promise(resolve=>setTimeout(resolve,300));}
}
try{
 await lock.writeFile(String(process.pid));
 let owner;
 try{const saved=JSON.parse(await readFile(pidFile,'utf8'));if(saved.root===root&&alive(saved.pid)){const command=execFileSync('/bin/ps',['-p',String(saved.pid),'-o','command='],{encoding:'utf8'});const absolute=process.execPath+' '+path.join(root,'scripts/dev-both.mjs'),legacy=process.execPath+' scripts/dev-both.mjs';if([absolute,legacy].includes(command.trim()))owner=saved;}}catch{}
 if(owner&&process.argv.includes('--restart')){
  // Explicit user-operated restart of this launcher's verified own process.
  // Never kill an unknown port owner or alter the browser/CRM records.
  process.kill(owner.pid,'SIGTERM');
  for(let n=0;n<50;n++){if(!alive(owner.pid)&&!(await Promise.all(ports.map(listening))).some(Boolean))break;if(n===49)throw Error('De bekende CRM-start is nog niet afgesloten. Er is geen ander proces gestopt; probeer later opnieuw.');await new Promise(resolve=>setTimeout(resolve,200));}
  owner=null;
 }
 if(!owner){
  if((await Promise.all(ports.map(listening))).some(Boolean))throw Error('Een lokale CRM-poort is al bezet. Er is niets gestopt of vervangen. Gebruik de CRM die al draait, of sluit de bestaande startterminal bewust.');
  const log=await open(path.join(directory,'servers.log'),'a',0o600);
  try{const child=spawn(process.execPath,[path.join(root,'scripts/dev-both.mjs')],{cwd:root,env:{...process.env,CRM_SPATLAPPEN_PORT:'3010',CRM_KUNSTSTOF_PORT:'3011'},detached:true,stdio:['ignore',log.fd,log.fd]});await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});owner={pid:child.pid,root,startedAt:new Date().toISOString()};child.unref();await writeFile(pidFile,JSON.stringify(owner),{mode:0o600});}finally{await log.close();}
 }
 let ready=false;
 for(let n=0;n<40;n++){
  if(!alive(owner.pid))throw Error('De lokale start is gestopt. Details staan in work/local-runtime/servers.log; je gegevens zijn behouden.');
  if((await Promise.all(ports.map(listening))).every(Boolean)){ready=true;break;}
  await new Promise(resolve=>setTimeout(resolve,300));
 }
 if(!ready)throw Error('De lokale start duurt langer dan verwacht. Start niet opnieuw; bekijk de bestaande startterminal of het startlog.');
 console.log('Beide lokale CRM-servers zijn gestart. Geen functionele tests uitgevoerd.');
 if(process.argv.includes('--open'))spawn('/usr/bin/open',['http://localhost:3010/admin/','http://localhost:3011/admin/'],{stdio:'ignore'}).unref();
}finally{await lock.close();await unlink(lockFile);}
