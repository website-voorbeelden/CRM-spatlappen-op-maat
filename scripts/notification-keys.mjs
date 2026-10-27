// Explicit local setup utility. Not run by builds, tests, dev startup or publication.
import {mkdir,writeFile} from 'node:fs/promises';
import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const company=process.argv[2];if(!['spatlappen','maatwerkkunststof'].includes(company))throw Error('Kies expliciet spatlappen of maatwerkkunststof.');
const folder=fileURLToPath(new URL('../.local/notification-setup/',import.meta.url));
await mkdir(folder,{recursive:true,mode:0o700});
const file=path.join(folder,company+'.json'),pair=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=pair.privateKey.export({format:'jwk'});
await writeFile(file,JSON.stringify({CRM_PUSH_PRIVATE_JWK:JSON.stringify(jwk),CRM_NOTIFICATION_JOB_KEY:randomBytes(32).toString('hex')},null,2)+'\n',{flag:'wx',mode:0o600});
console.log('Nieuwe privésleutels uitsluitend lokaal bewaard in '+file+'. Niets gepubliceerd. Bestaande sleutels worden niet overschreven.');
console.log('Publieke applicatiesleutel: '+Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x,'base64url'),Buffer.from(jwk.y,'base64url')]).toString('base64url'));
