import assert from 'node:assert/strict';
import {CloudDatabase, blobDigest} from '../admin/cloud-storage.js';
import {createSessionUndo} from '../admin/session-undo.js';

// Exercise the real storage adapter against an in-memory API. No browser,
// localhost service, production API or actual customer data is touched.
const originalFetch = globalThis.fetch;
globalThis.window = {dispatchEvent() {}};
const empty = () => ({customers: [], orders: [], payments: [], documents: [], activities: [], purchases: []});
let server, fileReads;
function fixture(value = empty()) {
  server = {revision: 0, records: {state: value === undefined ? {} : {main: structuredClone(value)}, reports: {}, designs: {}}, files: new Map(), blobs: new Map(), fail: false};
  fileReads = 0;
  const raw = new CloudDatabase(), history = createSessionUndo(raw);
  history.enable(); return {raw, history, db: history.db};
}
const response = (value, status = 200) => Response.json(value, {status});
globalThis.fetch = async (url, options = {}) => {
  const parsed = new URL(url, 'http://memory.invalid'), path = parsed.pathname;
  if (path === '/api/crm/snapshot') return response({revision: server.revision, records: server.records, files: [...server.files.values()]});
  if (path === '/api/crm/files' && options.method === 'POST') {
    const blob = options.body, key = crypto.randomUUID(), metadata = {key, size: blob.size, type: blob.type, sha256: await blobDigest(blob)};
    server.blobs.set(key, blob); return response(metadata);
  }
  if (path.startsWith('/api/crm/files/')) {
    fileReads++; const file = server.files.get(decodeURIComponent(path.split('/').at(-1)));
    return file ? new Response(server.blobs.get(file.key)) : response({error: 'Bestand ontbreekt'}, 404);
  }
  if (path === '/api/crm/commit') {
    const body = JSON.parse(options.body);
    if (server.fail) return response({error: 'Tijdelijke opslagfout'}, 503);
    if (body.revision !== server.revision) return response({error: 'Nieuwere gegevens'}, 409);
    for (const op of body.operations) {
      if (op.store === 'files') {
        if (op.action === 'put') server.files.set(op.key, {...op.value, id: op.key});
        else if (op.action === 'delete') server.files.delete(op.key);
        else server.files.clear();
      } else {
        if (op.action === 'put') server.records[op.store][op.key] = op.value;
        else if (op.action === 'delete') delete server.records[op.store][op.key];
        else server.records[op.store] = {};
      }
    }
    return response({revision: ++server.revision});
  }
  throw Error('Unexpected request: ' + url);
};
async function write(db, value, files = []) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(files.length ? ['state', 'files'] : 'state', 'readwrite');
    for (const file of files) file.remove ? tx.objectStore('files').delete(file.id) : tx.objectStore('files').put(file);
    tx.objectStore('state').put(value, 'main');
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
}
async function read(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state'), request = tx.objectStore('state').get('main');
    tx.oncomplete = () => resolve(request.result); tx.onerror = () => reject(tx.error);
  });
}
const main = () => server.records.state.main;
function change(label) {
  const value = structuredClone(main()); value.activities.unshift({id: crypto.randomUUID(), message: label}); return value;
}

try {
  let {db, history, raw} = fixture();
  let value = change('Klant + order aangemaakt');
  value.customers.push({id: 'c', number: 'KL-0001'}); value.customerSequence = 1;
  value.orders.push({id: 'o', customerId: 'c', items: []});
  await write(db, value); assert.equal(history.status().count, 1);
  value = change('Document opgeslagen'); value.documentSequences = {'OB-2026': 3452};
  value.documents.push({id: 'pdf', ownerId: 'o'});
  await write(db, value, [{id: 'pdf', blob: new Blob(['Document'], {type: 'application/pdf'})}]);
  assert.equal(history.status().count, 2);
  await history.undo(); assert.equal(main().documents.length, 0); assert.equal(server.files.size, 0);
  assert.equal(main().documentSequences['OB-2026'], 3452);
  await history.undo(); assert.equal(main().orders.length, 0); assert.equal(main().customers.length, 0);
  assert.equal(main().customerSequence, 1); assert.equal(main().documentSequences['OB-2026'], 3452);
  assert.equal(history.status().count, 0);
  console.log('✓ Meerdere stappen, nieuwe klant/order, upload terugdraaien; nummers worden niet hergebruikt');

  ({db, history} = fixture());
  value = change('Order toegevoegd'); value.orders.push({id: 'o', paymentLinks: [{id: 'link', url: 'https://tikkie.me/test'}]});
  value.documents.push({id: 'f', ownerId: 'o'});
  await write(db, value, [{id: 'f', blob: new Blob(['Origineel bestand'])}]);
  value = change('Order verwijderd'); value.orders = []; value.documents = [];
  await write(db, value, [{id: 'f', remove: true}]);
  assert.equal(history.status().count, 1); // Imported external link starts a new history.
  assert.equal(server.files.size, 0);
  await history.undo(); assert.equal(main().orders.length, 1); assert.equal(main().documents.length, 1);
  const oldFile = server.files.get('f'); assert.equal(await server.blobs.get(oldFile.key).text(), 'Origineel bestand');
  assert.equal(main().orders[0].paymentLinks.length, 1);
  console.log('✓ Verwijderde order en bestand volledig terug; bestaande Tikkie blijft gekoppeld');

  ({db, history} = fixture());
  value = change('Eerste wijziging'); await write(db, value);
  server.fail = true;
  await assert.rejects(write(db, change('Mislukt')), /opslagfout/);
  assert.equal(history.status().count, 1); assert.equal(history.status().label, 'Eerste wijziging');
  await assert.rejects(history.undo(), /opslagfout/);
  assert.equal(history.status().count, 1); assert.equal(history.status().busy, false);
  server.fail = false; await history.undo(); assert.equal(history.status().count, 0);
  console.log('✓ Mislukte opslag maakt geen stap; mislukte undo behoudt de herstelmogelijkheid');

  ({db, history, raw} = fixture()); await read(raw);
  await write(db, change('Lokale wijziging'));
  const stale = structuredClone(main());
  main().customers.push({id: 'other', company: 'Andere laptop'}); server.revision++;
  await assert.rejects(write(db, stale), error => error.status === 409);
  await assert.rejects(history.undo(), /nieuwere gegevens/);
  assert.equal(main().customers[0].company, 'Andere laptop'); assert.equal(history.status().count, 0);
  console.log('✓ Interne historie-leesactie omzeilt geen conflictbeveiliging; andere laptop wordt nooit overschreven');

  ({raw} = fixture()); history = createSessionUndo(raw, {maxSteps: 3}); history.enable(); db = history.db;
  for (let n = 1; n <= 5; n++) {value = change('Stap ' + n); value.note = n; await write(db, value);}
  assert.equal(history.status().count, 3);
  for (let n = 0; n < 3; n++) await history.undo();
  assert.equal(main().note, 2); assert.equal(history.status().count, 0);
  console.log('✓ Oudste stappen verdwijnen automatisch bij de ingestelde limiet');

  ({db, raw} = fixture());
  value = change('Begin met groot bestand'); value.documents.push({id: 'large'});
  await write(db, value, [{id: 'large', blob: new Blob(['x'.repeat(6000)])}]);
  history = createSessionUndo(raw, {maxBytes: 5000}); history.enable(); db = history.db; fileReads = 0;
  value = change('Groot bestand verwijderd'); value.documents = [];
  await write(db, value, [{id: 'large', remove: true}]);
  assert.equal(server.files.size, 0); assert.equal(fileReads, 0); assert.equal(history.status().count, 0);
  assert.match(history.status().note, /te groot/);
  console.log('✓ Te grote bestanden worden niet voor historie gedownload; verwijderen blijft werken');

  ({db, history} = fixture()); await write(db, change('Kleine wijziging'));
  value = change('Betaallink gemaakt'); value.orders.push({id: 'o', paymentLinks: [{id: 'link'}]});
  await write(db, value); assert.equal(history.status().count, 0); assert.match(history.status().note, /Tikkie/);
  value = change('Notitie gewijzigd'); value.orders[0].note = 'Makkelijk te herstellen';
  await write(db, value); await history.undo(); assert.equal(main().orders[0].paymentLinks.length, 1);
  assert.equal(main().orders[0].note, undefined);
  console.log('✓ Tikkie-acties vormen een grens; latere gewone wijzigingen blijven terug te draaien');

  ({db, history} = fixture()); await write(db, change('Wijziging'));
  await new Promise((resolve, reject) => {
    const tx = db.transaction(['state', 'files'], 'readwrite'); tx.objectStore('files').clear();
    tx.objectStore('state').put(empty(), 'main'); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
  assert.equal(history.status().count, 0); assert.match(history.status().note, /back-up/);
  assert.equal(createSessionUndo(raw).status().count, 0);
  console.log('✓ Back-up terugzetten reset historie; een nieuwe sessie begint leeg');

  ({raw} = fixture()); delete server.records.state.main;
  // IndexedDB has get(), but no private peek(). Exercise that facade path too.
  const nativeShape = {transaction(...args) {
    const tx = raw.transaction(...args), store = tx.objectStore.bind(tx);
    tx.objectStore = name => {const {peek, ...methods} = store(name); return methods;}; return tx;
  }};
  history = createSessionUndo(nativeShape); history.enable(); db = history.db;
  value = empty(); value.customers.push({id: 'first'});
  await write(db, value); assert.equal(history.status().count, 1);
  await history.undo(); assert.deepEqual(main().customers, []);
  value = change('Bestand toegevoegd'); value.documents.push({id: 'replace'});
  await write(db, value, [{id: 'replace', blob: new Blob(['Eerste versie'])}]);
  value = change('Bestand vervangen');
  await write(db, value, [{id: 'replace', blob: new Blob(['Tweede versie'])}]);
  await history.undo();
  assert.equal(await server.blobs.get(server.files.get('replace').key).text(), 'Eerste versie');
  console.log('✓ get()-facade zonder peek, eerste invoer in een lege database en bestand vervangen');

  ({raw} = fixture()); history = createSessionUndo(raw, {maxBytes: 5000}); history.enable(); db = history.db;
  for (let n = 0; n < 8; n++) {
    value = change('Wijziging ' + n); value.note = 'x'.repeat(300);
    await write(db, value); assert.ok(history.status().bytes <= 5000);
  }
  assert.ok(history.status().count < 8);
  await history.undo(); assert.ok(history.status().bytes <= 5000);
  console.log('✓ Geheugenlimiet wordt ook over alle stappen samen bewaakt');
} finally {globalThis.fetch = originalFetch;}
