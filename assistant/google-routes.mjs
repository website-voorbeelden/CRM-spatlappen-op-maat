import {mkdir,readFile,writeFile,rename,chmod} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createGoogleRoutes} from '../cloudflare/google-routes-provider.js';
export function createLocalGoogleRoutes(directory,{fetcher}={}){
 const root=path.resolve(directory),services=new Map();
 return company=>{
  if(!['spatlappen','maatwerkkunststof'].includes(company))throw Error('Onbekend bedrijf.');
  if(services.has(company))return services.get(company);
  const folder=path.join(root,company),file=path.join(folder,'google-routes.json');let pending=Promise.resolve();
  const read=async()=>{try{return JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code==='ENOENT')return {version:'',value:null};throw Error('De Google Maps-instellingen kunnen niet worden geopend.');}};
  const write=async(value,expected)=>{if((await read()).version!==expected)throw Error('De koppeling is elders gewijzigd.');await mkdir(folder,{recursive:true,mode:0o700});await chmod(folder,0o700);const temp=file+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify({version:randomUUID(),value}),{mode:0o600});await rename(temp,file);};
  const exclusive=fn=>{const result=pending.catch(()=>{}).then(fn);pending=result;return result;};
  const service=createGoogleRoutes({read,write,exclusive,fetcher});services.set(company,service);return service;
 };
}
