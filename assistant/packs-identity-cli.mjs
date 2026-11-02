import {readFile,stat} from 'node:fs/promises';
import {testPacksIdentity} from '../cloudflare/packs-identity.js';
// Invoked locally with a small stdin confirmation. Credentials are never passed
// in argv, stdout, a browser form, CRM state, logs or an exported build artifact.
const file=new URL('../.local/maatwerkkunststof/packs-identity.json',import.meta.url);
try{
 let raw='';for await(const chunk of process.stdin){raw+=chunk;if(raw.length>1000)throw Error();}
 const input=JSON.parse(raw);if(!input||input.confirmed!==true||Object.keys(input).some(k=>k!=='confirmed'))throw Error();
 const metadata=await stat(file);if(metadata.size>30000||(metadata.mode&0o077)!==0)throw Error();
 const config=JSON.parse(await readFile(file,'utf8')),result=await testPacksIdentity(config);process.stdout.write(JSON.stringify(result));
}catch{
 process.stdout.write(JSON.stringify({ok:false,attempted:false,stage:'configuration',authHttpStatus:null,identityHttpStatus:null,httpStatus:null,response:null,error:{code:'local_configuration',message:'De lokale accounttestconfiguratie ontbreekt of heeft geen passende privébestandsrechten.'}}));
 process.exitCode=1;
}
