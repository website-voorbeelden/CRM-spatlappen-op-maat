// Run explicitly on your own computer; uses a fresh, separate account directory.
// Never imports Codex auth or the existing local CRM connection.
import {createServer} from 'node:http';
import path from 'node:path';
import {mkdir,lstat} from 'node:fs/promises';
import {ChatGPTConnection} from '../chatgpt-auth.mjs';
const directory=process.argv[2];if(!directory)throw Error('Gebruik: node assistant/host/setup-account.mjs /eigen/prive/nieuwe-accountmap');
try{await lstat(directory);throw Error('Kies een nieuwe map. Een bestaande verbinding wordt niet vervangen.');}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(directory,{recursive:true,mode:0o700});
const connection=await new ChatGPTConnection(directory).init();let finished=false,timeout;
const server=createServer(async(req,res)=>{
 if(req.headers.host!=='127.0.0.1:'+server.address().port){res.writeHead(403);res.end();return;}
 const url=new URL(req.url,'http://127.0.0.1');if(url.pathname!=='/auth/callback'||req.method!=='GET'){res.writeHead(404);res.end();return;}
 try{await connection.finish(url.searchParams);finished=true;res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});res.end(connection.status().sharing?'ChatGPT gekoppeld. Sluit dit tabblad en volg de serverinstructies.':'Ingelogd, maar toestemming voor AI-gebruik ontbreekt. Begin opnieuw.');console.log('Aanmelding afgerond. Beschermd accountbestand: '+path.join(directory,'connection.json'));server.close();clearTimeout(timeout);}
 catch{res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end('Aanmelding niet afgerond. Begin opnieuw met een nieuwe map.');}
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const {url}=await connection.start({redirectUri:'http://127.0.0.1:'+server.address().port+'/auth/callback',returnUrl:'http://127.0.0.1/'});
console.log('Open deze OpenAI-aanmelding zelf in je browser en geef toestemming voor je ChatGPT-plan:\n'+url);
timeout=setTimeout(()=>{if(!finished){connection.cancel();server.close();console.error('Aanmelding verlopen. Begin opnieuw.');}},300000);
