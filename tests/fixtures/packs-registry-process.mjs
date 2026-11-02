// Only invoked by packs-local.mjs against its own temporary fixture database.
globalThis.fetch=()=>{throw Error('Network disabled in PACKS fixture process');};
const {readFileSync}=await import('node:fs');
const {fixtureDatabase}=await import('./packs-local.mjs');
const {createPacksRegistry}=await import('../../cloudflare/packs-registry.js');
const input=JSON.parse(readFileSync(0,'utf8'));
const db=await fixtureDatabase(process.argv[2]);
try{const result=await createPacksRegistry(db.store,'test').claim('fixture-order',input);process.stdout.write(JSON.stringify(result));}
finally{db.sqlite.close();}
