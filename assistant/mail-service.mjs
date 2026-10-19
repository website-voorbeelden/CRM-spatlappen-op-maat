import {mkdir,readFile,writeFile,rename,chmod} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {companyFor} from '../shared/companies.js';
import {createMailEngine} from '../shared/mail-service.js';
export async function createMailService(directory,{fetchImpl=globalThis.fetch}={}){
 const root=path.resolve(directory),locks=new Map();
 async function read(company,name){companyFor(company);try{return JSON.parse(await readFile(path.join(root,company,name+'.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw Error('De lokale e-mailinstellingen kunnen niet veilig worden geopend.');}}
 async function write(company,name,value){const folder=path.join(root,company);await mkdir(root,{recursive:true,mode:0o700});await chmod(root,0o700);await mkdir(folder,{recursive:true,mode:0o700});await chmod(folder,0o700);const file=path.join(folder,name+'.json'),temp=file+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(value),{mode:0o600});await rename(temp,file);await chmod(file,0o600);}
 function exclusive(company,fn){companyFor(company);const previous=locks.get(company)||Promise.resolve(),result=previous.catch(()=>{}).then(fn);locks.set(company,result);result.finally(()=>{if(locks.get(company)===result)locks.delete(company);}).catch(()=>{});return result;}
 return createMailEngine({read,write,exclusive,fetchImpl,digest:value=>createHash('sha256').update(value).digest('hex')});
}
