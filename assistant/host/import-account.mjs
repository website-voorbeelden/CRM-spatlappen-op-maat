// Explicit operator action on the private VM after an SSH transfer of a fresh setup-account file.
import {readFile,writeFile,rename,chmod,lstat} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {validateIdToken,AUTH_ORIGIN,limitedJson} from '../chatgpt-auth.mjs';
import {lockAgentDirectory} from './server.mjs';
const source=process.argv[2],directory=process.env.CRM_AGENT_DATA_DIRECTORY;
if(!source||!directory)throw Error('Stel CRM_AGENT_DATA_DIRECTORY in en geef het via SSH overgezette accountbestand als argument.');
const stat=await lstat(source);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>250000||(stat.mode&0o077))throw Error('Gebruik een regulier privébestand (chmod 600), maximaal 250 kB.');
const data=JSON.parse(await readFile(source,'utf8')),p=data.profiles?.find(p=>p.id===data.activeId);
if(!p||typeof p.clientId!=='string'||!/^[-a-zA-Z0-9_.]{1,200}$/.test(p.clientId)||typeof p.id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(p.id)||!Number.isFinite(p.expiresAt)||p.clientId==='dynamic_agent_client'||!Array.isArray(p.scopes)||!['openid','chatgpt.tokens.use.direct','resource.invoke'].every(s=>p.scopes.includes(s))||typeof p.accessToken!=='string'||!p.accessToken||typeof p.refreshToken!=='string'||!p.refreshToken||p.expiresAt<=Date.now()+60000)throw Error('Maak eerst een verse, volledige ChatGPT-aanmelding met setup-account.mjs.');
// Fresh account validation; never log a JWT, token or the source JSON.
const response=await fetch(AUTH_ORIGIN+'/.well-known/jwks.json',{redirect:'manual',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Identiteitscontrole niet bereikbaar. Er is niets geïmporteerd.');
const claims=validateIdToken(p.idToken,await limitedJson(response),{clientId:p.clientId});
if(claims.sub!==p.subject||typeof claims.email==='string'&&claims.email!==p.email)throw Error('Accountidentiteit wijkt af. Er is niets geïmporteerd.');
const unlock=await lockAgentDirectory(directory);
try{
 const file=path.join(directory,'connection.json');let old;
 try{old=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(old?.profiles?.some(p=>p.accessToken)&&!process.argv.includes('--replace'))throw Error('Er is al een account verbonden. Alleen bewust vervangen met --replace terwijl de dienst gestopt is.');
 // A VM owns its own stable host ID; never copy the laptop's host ID.
 if(old?.hostId&&!/^urn:uuid:[a-f0-9-]{36}$/.test(old.hostId))throw Error('Het bestaande server-ID is ongeldig. Niet vervangen zonder beheerder.');
 const hostId=old?.hostId||'urn:uuid:'+randomUUID();
 const profile={id:p.id,clientId:p.clientId,subject:p.subject,email:p.email,idToken:p.idToken,accessToken:p.accessToken,refreshToken:p.refreshToken,scopes:p.scopes,expiresAt:p.expiresAt};
 const tmp=file+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify({hostId,profiles:[profile],activeId:profile.id}),{mode:0o600});await rename(tmp,file);await chmod(file,0o600);
 console.log('Eén account geïmporteerd. Het eigen host-ID is behouden. Start de persoonlijke AI-dienst; bewaar of verwijder het tijdelijke bronbestand zelf veilig.');
}finally{await unlock();}
