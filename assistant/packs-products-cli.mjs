import {readFile,stat} from 'node:fs/promises';
import {readPacksProducts} from '../cloudflare/packs-identity.js';
// Account catalogue only; no order, tariff choice, booking or label action.
try{
 let raw='';for await(const chunk of process.stdin){raw+=chunk;if(raw.length>1000)throw Error();}
 const input=JSON.parse(raw);if(!input||input.confirmed!==true||Object.keys(input).some(k=>k!=='confirmed'))throw Error();
 const file=new URL('../.local/maatwerkkunststof/packs-identity.json',import.meta.url),metadata=await stat(file);if(metadata.size>30000||(metadata.mode&0o077)!==0)throw Error();
 const result=await readPacksProducts(JSON.parse(await readFile(file,'utf8')));process.stdout.write(JSON.stringify(result));
}catch{process.stdout.write(JSON.stringify({ok:false,attempted:false,stage:'configuration',authHttpStatus:null,productsHttpStatus:null,httpStatus:null,response:null,error:{code:'local_configuration',message:'De privéconfiguratie voor de PACKS-accountopvraag ontbreekt of is niet leesbaar.'}}));process.exitCode=1;}
