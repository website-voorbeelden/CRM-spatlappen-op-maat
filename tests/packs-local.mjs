// Run only with explicit permission. No network, browser, account or CRM data.
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
let networkCalls=0;
const originalFetch=globalThis.fetch;
globalThis.fetch=()=>{networkCalls++;throw Error('Network forbidden in PACKS local verification');};
after(()=>{globalThis.fetch=originalFetch;assert.equal(networkCalls,0,'No outbound fetch permitted');});
const {packsFixture,completePreparation,fixtureDatabase,allowFixtureRegistry,fixtureClaim}=await import('./fixtures/packs-local.mjs');
const {validatePacksPreparation,packsPreparationReview,packsPreparationBasis,packsAddressProposal,packsPreparationSeed,packsLogisticsDay,packsTomorrow}=await import('../shared/packs-preparation.js');
const {supplierFulfilmentInfo,supplierFulfilmentData,recordSupplierOrder,recordPacksPreparation,validateSupplierFulfilment,assertSupplierMail,supplierLabelMetadata,supplierMailTag}=await import('../shared/supplier-fulfilment.js');
const {revisionSource,appendDocumentRevision}=await import('../shared/document-revisions.js');
const {supplierTrialSubject,supplierTrialNotice}=await import('../shared/supplier-trial-mail.js');
const {validateBusinessState}=await import('../shared/state-validation.js');
const {copyOrder}=await import('../shared/order-copy.js');
const {createPacksRegistry}=await import('../cloudflare/packs-registry.js');
const {integrationStore}=await import('../cloudflare/integration-store.js');
const {handlePacks}=await import('../cloudflare/packs.js');
const review=p=>packsPreparationReview(p,{basis:p.basis,reference:p.reference,today:'2099-01-01'});
const known={shipmentId:1001,items:[{shipmentItemId:2001,barcode:'FIXTURE-BARCODE'}]};

test('incomplete preparation remains editable, unknown weight is not zero and no booking is offered',()=>{
 const {preparation}=packsFixture();validatePacksPreparation(preparation);
 assert.deepEqual(preparation.packages[0],{id:'fixture-parcel',lengthCm:60,widthCm:40,heightCm:0.6,weightKg:null});
 const result=review(preparation);assert.equal(result.canBook,false);assert.equal(result.preparationComplete,false);
 assert.ok(result.issues.some(issue=>issue.field==='parcel_fixture-parcel_weightKg'));
 assert.equal(new Set(result.contractBlocks.map(block=>block.id)).size,11);
});
test('multiple pieces do not silently become one guessed package',()=>{
 const {state,order}=packsFixture();order.items[0].quantity=2;
 const p=packsPreparationSeed(supplierFulfilmentData(state,order),{basis:'fixture',reference:'FIXTURE',revision:'fixture',parcelId:'fixture'});
 assert.equal(p.packages[0].lengthCm,null);assert.equal(p.packages[0].weightKg,null);
});
test('address interpretation preserves suffix and does not truncate long names or invent foreign street fields',()=>{
 const {state,order}=packsFixture(),data=supplierFulfilmentData(state,order);
 const proposed=packsAddressProposal(data);assert.equal(proposed.address.street,'Fictiestraat');assert.equal(proposed.address.number,'12');assert.equal(proposed.address.numberExt,'A');assert.equal(proposed.sources['deliveryAddress.street'],'interpretation');
 assert.equal(packsAddressProposal({...data,recipient:'X'.repeat(51)}).address.name,'');
 const foreign=packsAddressProposal({...data,country:'BE'});assert.equal(foreign.address.country,'BE');assert.equal(foreign.address.street,'');
});
for(const [label,mutate] of [
 ['zero mass',p=>p.packages[0].weightKg=0],['negative size',p=>p.packages[0].lengthCm=-1],['oversized schema dimension',p=>p.packages[0].widthCm=1000],['NaN mass',p=>p.packages[0].weightKg=NaN],['duplicate parcels',p=>p.packages.push({...p.packages[0]})],['invalid day',p=>p.loadDate='2099-02-31'],['address control character',p=>p.deliveryAddress.name='Fixture\nother'],['unknown credentials field',p=>p.apiKey='never-store'],['unknown source field',p=>p.sources.secret='automatic']
])test('rejects '+label,()=>{const p=completePreparation();mutate(p);assert.throws(()=>validatePacksPreparation(p));});
test('complete physical input still cannot activate booking',()=>{const result=review(completePreparation());assert.equal(result.preparationComplete,true);assert.equal(result.canBook,false);});
test('dates follow Netherlands around midnight and pickup must follow readiness',()=>{
 assert.equal(packsLogisticsDay(new Date('2026-10-30T23:30:00Z')),'2026-10-31');
 const p=completePreparation();p.loadDate='2099-01-31';assert.ok(review(p).issues.some(issue=>issue.field==='loadDate'));
});
// Added for the user's next-day preference. These new cases have not been run;
// the earlier batch3 result applies to the previous source version only.
test('tomorrow proposal follows Dutch calendar dates through midnight, DST and year boundaries',()=>{
 for(const [now,expected] of [
  ['2026-10-30T22:30:00Z','2026-10-31'],
  ['2026-10-30T23:30:00Z','2026-11-01'],
  ['2026-03-28T23:30:00Z','2026-03-30'],
  ['2026-10-24T22:30:00Z','2026-10-26'],
  ['2026-12-31T23:30:00Z','2027-01-02'],
  ['2028-02-28T12:00:00Z','2028-02-29']
 ])assert.equal(packsTomorrow(new Date(now)),expected);
});
test('a next-day preference never invents readiness, delivery or return instructions',()=>{
 const {state,order}=packsFixture();
 const p=packsPreparationSeed(supplierFulfilmentData(state,order),{basis:'fixture',reference:'FIXTURE',revision:'fixture',parcelId:'fixture',now:'2026-10-30T12:00:00Z'});
 validatePacksPreparation(p);assert.equal(p.loadDate,'2026-10-31');assert.equal(p.sources.loadDate,'automatic');
 assert.equal(p.readyOn,'');assert.equal(p.deliveryDate,'');assert.equal(p.readyConfirmed,false);assert.equal(p.instructions,'');assert.ok(Object.values(p.returnAddress).every(value=>value===''));
 const result=packsPreparationReview(p,{basis:p.basis,reference:p.reference,today:'2026-10-30'});
 assert.ok(result.issues.some(issue=>issue.field==='readyConfirmed'));assert.equal(result.canBook,false);
});
test('optional dates do not replace readiness confirmation or allow pickup before readiness',()=>{
 const p=completePreparation();p.readyOn='';p.deliveryDate='';
 assert.equal(review(p).preparationComplete,true);assert.equal(review(p).canBook,false);
 p.readyOn='2098-12-31';assert.equal(review(p).preparationComplete,true);p.readyOn='';
 p.readyConfirmed=false;assert.ok(review(p).issues.some(issue=>issue.field==='readyConfirmed'));
 p.readyConfirmed=true;p.loadDate='';assert.ok(review(p).issues.some(issue=>issue.field==='loadDate'));
 p.loadDate='2099-02-02';p.readyOn='2099-02-03';assert.ok(review(p).issues.some(issue=>issue.field==='loadDate'));
 p.readyOn='';p.deliveryDate='2099-02-01';assert.ok(review(p).issues.some(issue=>issue.field==='deliveryDate'));
});
test('physical basis ignores save metadata and checkboxes but follows packaging/address/date edits',()=>{
 const p=completePreparation(),basis=packsPreparationBasis(p),same=structuredClone(p);same.revision='another-save';same.updatedAt='2099-01-02T12:00:00Z';same.packagesConfirmed=false;same.sources={'deliveryAddress.name':'automatic'};assert.equal(packsPreparationBasis(same),basis);
 for(const mutate of [v=>v.packages[0].weightKg=3,v=>v.deliveryAddress.number='14',v=>v.loadDate='2099-02-03']){const changed=structuredClone(p);mutate(changed);assert.notEqual(packsPreparationBasis(changed),basis);}
});
test('saving uses original order/customer signature and changes no financial/shipping facts',()=>{
 const {state,order,preparation}=packsFixture(),info=supplierFulfilmentInfo(state,order,'maatwerkkunststof'),before=structuredClone(state);
 recordPacksPreparation(state,order.id,preparation,info.signature,'maatwerkkunststof');validateBusinessState(state);
 assert.deepEqual(state.payments,before.payments);assert.deepEqual(state.documents,before.documents);assert.deepEqual(order.items,before.orders[0].items);assert.equal(order.shippedDate,undefined);
 const stale=info.signature;state.customers[0].company='Andere fictieve klant';assert.throws(()=>recordPacksPreparation(state,order.id,preparation,stale,'maatwerkkunststof'),/intussen gewijzigd/);
 assert.throws(()=>recordPacksPreparation(state,order.id,preparation,stale,'spatlappen'),/alleen/);
});
test('supplier order confirmation uses the canonical shipping method accepted by the whole CRM',()=>{
 const {state,order}=packsFixture();order.fulfilmentMethod='pickup';delete order.supplierFulfilment;
 const info=supplierFulfilmentInfo(state,order,'maatwerkkunststof');
 recordSupplierOrder(state,order.id,{confirmed:true,shipDirectly:true,reference:'FIXTURE-NEW',orderedOn:'2099-01-01',recipientEmail:'leverancier@example.invalid'},info.signature,'maatwerkkunststof',{today:'2099-01-01',now:'2099-01-01T12:00:00.000Z'});
 assert.equal(order.fulfilmentMethod,'shipping');validateBusinessState(state);
 assert.equal(supplierFulfilmentInfo(state,order,'maatwerkkunststof').current,true);
});
test('business backup roundtrip keeps preparation; copying never borrows its shipment association',()=>{
 const {state,order,preparation}=packsFixture();order.supplierFulfilment.packsPreparation=preparation;
 const restored=JSON.parse(JSON.stringify(state));validateBusinessState(restored);assert.deepEqual(restored.orders[0].supplierFulfilment.packsPreparation,preparation);
 let n=0;const copied=copyOrder(order,{number:124,date:'2099-01-02',stage:'Nieuw',newId:()=> 'fixture-copy-'+(++n)});assert.equal(copied.supplierFulfilment,undefined);assert.equal(copied.supplierOrderReference,'');
});
test('old chosen PDF stays stored but cannot enter a new mail after physical change',()=>{
 const {state,order}=packsFixture(),p=completePreparation();order.supplierFulfilment.packsPreparation=p;
 const info=supplierFulfilmentInfo(state,order,'maatwerkkunststof');
 state.documents.push({id:'fixture-label',ownerId:order.id,category:'other',type:'application/pdf',size:100,shippingLabel:{carrier:'packs',supplierKey:'kunststofbaas',reference:info.reference,basis:info.basis,preparationBasis:packsPreparationBasis(p)}});order.supplierFulfilment.labelDocumentId='fixture-label';
 validateSupplierFulfilment(state);assert.equal(supplierFulfilmentInfo(state,order,'maatwerkkunststof').label.id,'fixture-label');
 p.packages[0].weightKg=3;assert.ok(!supplierFulfilmentInfo(state,order,'maatwerkkunststof').label);assert.equal(state.documents.length,1);assert.equal(order.supplierFulfilment.labelDocumentId,'fixture-label');
 assert.throws(()=>assertSupplierMail(state,order.id,{supplierFulfilmentMail:{supplierKey:'kunststofbaas',reference:info.reference,basis:info.basis,labelDocumentId:'fixture-label',packingDocumentId:'fixture-packing'}},'maatwerkkunststof'),/gewijzigd/);
});
test('older records without preparation and label metadata remain valid',()=>{
 const {state,order}=packsFixture(),info=supplierFulfilmentInfo(state,order,'maatwerkkunststof');state.documents.push({id:'old-label',ownerId:order.id,category:'other',type:'application/pdf',size:100,shippingLabel:{carrier:'packs',supplierKey:'kunststofbaas',reference:info.reference,basis:info.basis}});order.supplierFulfilment.labelDocumentId='old-label';validateBusinessState(state);assert.equal(supplierFulfilmentInfo(state,order,'maatwerkkunststof').label.id,'old-label');
});
// Source-review regressions added later; not part of the historical 29 passes.
test('manual labels require a preparation for the current order/reference, without inventing one for legacy records',()=>{
 const {state,order}=packsFixture();
 let info=supplierFulfilmentInfo(state,order,'maatwerkkunststof');assert.equal(supplierLabelMetadata(info).preparationBasis,undefined);
 order.supplierFulfilment.packsPreparation=completePreparation();info=supplierFulfilmentInfo(state,order,'maatwerkkunststof');assert.equal(supplierLabelMetadata(info).preparationBasis,packsPreparationBasis(info.workflow.packsPreparation));
 for(const key of ['basis','reference']){const p=order.supplierFulfilment.packsPreparation,previous=p[key];p[key]='older-fixture';assert.throws(()=>supplierLabelMetadata(supplierFulfilmentInfo(state,order,'maatwerkkunststof')),/eerdere ordergegevens/);p[key]=previous;}
 // Also refuse labels already saved by an older client against a stale draft.
 const metadata=supplierLabelMetadata(supplierFulfilmentInfo(state,order,'maatwerkkunststof'));order.supplierFulfilment.packsPreparation.basis='older-fixture';metadata.preparationBasis=packsPreparationBasis(order.supplierFulfilment.packsPreparation);
 state.documents.push({id:'fixture-stale-label',ownerId:order.id,category:'other',type:'application/pdf',size:100,shippingLabel:metadata});order.supplierFulfilment.labelDocumentId='fixture-stale-label';
 const stale=supplierFulfilmentInfo(state,order,'maatwerkkunststof');assert.equal(stale.current,true);assert.equal(stale.label,null);assert.equal(state.documents.length,1);
});
function linkedPackingFixture(){
 const {state,order}=packsFixture(),info=supplierFulfilmentInfo(state,order,'maatwerkkunststof');
 state.documents.push({id:'fixture-label',ownerId:order.id,name:'Fictief label.pdf',category:'other',type:'application/pdf',size:100,shippingLabel:supplierLabelMetadata(info)});order.supplierFulfilment.labelDocumentId='fixture-label';
 const payload={kind:'packing',number:'PB-FIXTURE',fields:{document_date:'2099-02-01',order_number:'123',customer_reference:info.reference,shipping_company:info.data.recipient,shipping_attention:'',shipping_street:'Fictiestraat 12 A',shipping_postal_city:'1234 AB Teststad',shipping_country:'NL',delivery_notes:''},items:[{description:'Fictief product',quantity:1,deliveredQuantity:1,details:[]}]};
 for(const [id,type] of [['fixture-packing','application/pdf'],['fixture-packing-word','application/vnd.openxmlformats-officedocument.wordprocessingml.document']])state.documents.push({id,ownerId:order.id,name:id,category:'packing',type,size:100,date:'2099-02-01',createdAt:'2099-02-01T12:00:00Z',generated:{kind:'packing',number:payload.number,generationId:'fixture-generation',payload:structuredClone(payload),supplierFulfilment:{supplierKey:'kunststofbaas',reference:info.reference,basis:info.basis}}});
 return {state,order,payload};
}
const revisedPackingFiles=()=>[{id:'fixture-packing-v2',name:'Pakbon.pdf',type:'application/pdf',size:120},{id:'fixture-packing-word-v2',name:'Pakbon.docx',type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',size:80}];
test('a proof draft keeps current attachments but never counts as a supplier instruction',()=>{
 const {state,order}=linkedPackingFixture(),info=supplierFulfilmentInfo(state,order,'maatwerkkunststof'),to='controle@example.invalid';
 const draft={id:'fixture-proof',to,subject:supplierTrialSubject+info.reference,body:supplierTrialNotice,documentId:info.packing.id,attachmentIds:[info.label.id],paymentLinkId:'',status:'accepted',updatedAt:'2099-02-02T12:00:00Z',supplierFulfilmentMail:supplierMailTag(info,{trialRecipient:to})};
 assertSupplierMail(state,order.id,draft,'maatwerkkunststof');order.emailDrafts=[draft];validateSupplierFulfilment(state);assert.equal(supplierFulfilmentInfo(state,order,'maatwerkkunststof').mail,null);
 assert.throws(()=>assertSupplierMail(state,order.id,{...draft,to:'info@kunststofbaas.nl'},'maatwerkkunststof'));
});
test('packing revision from either PDF or Word keeps supplier linkage and replaces only the current mail attachment proposal',()=>{
 for(const id of ['fixture-packing','fixture-packing-word']){
  const {state,order,payload}=linkedPackingFixture(),original=structuredClone(state.documents),info=supplierFulfilmentInfo(state,order,'maatwerkkunststof');
  const oldMail={to:info.workflow.recipientEmail,subject:info.reference,body:'Fictief',documentId:info.packing.id,attachmentIds:[info.label.id],paymentLinkId:'',supplierFulfilmentMail:supplierMailTag(info)};
  const source=revisionSource(state,id,'maatwerkkunststof');payload.fields.delivery_notes='Fictieve nieuwe opmerking';
  appendDocumentRevision(state,id,source.signature,{companyId:'maatwerkkunststof',payload,date:'2099-02-02',files:revisedPackingFiles(),generationId:'fixture-generation-v2'});
  validateSupplierFulfilment(state);assert.deepEqual(state.documents.slice(0,original.length),original);
  const next=supplierFulfilmentInfo(state,order,'maatwerkkunststof');assert.equal(next.packing.id,'fixture-packing-v2');assert.equal(next.label.id,info.label.id);
  for(const d of state.documents.slice(original.length))assert.deepEqual(d.generated.supplierFulfilment,info.packing.generated.supplierFulfilment);
  assert.throws(()=>assertSupplierMail(state,order.id,oldMail,'maatwerkkunststof'),/gewijzigd/);
  assertSupplierMail(state,order.id,{...oldMail,documentId:next.packing.id,supplierFulfilmentMail:supplierMailTag(next)},'maatwerkkunststof');
 }
});
test('linked packing revisions cannot silently change destination/reference or remove the supplier reference from comments',()=>{
 for(const [key,value] of [['shipping_street','Andere fictieve straat 99'],['customer_reference','OTHER'],['order_number','999']]){
  const {state,payload}=linkedPackingFixture(),source=revisionSource(state,'fixture-packing','maatwerkkunststof');payload.fields[key]=value;const before=structuredClone(state);
  assert.throws(()=>appendDocumentRevision(state,'fixture-packing',source.signature,{companyId:'maatwerkkunststof',payload,date:'2099-02-02',files:revisedPackingFiles(),generationId:'fixture-generation-v2'}),/leveranciersbestelling/);assert.deepEqual(state,before);
 }
 const {state,order,payload}=linkedPackingFixture();for(const d of state.documents.filter(d=>d.generated)){d.generated.payload.fields.customer_reference='Echte klantreferentie';d.generated.payload.fields.delivery_notes='Bestelnummer Kunststofbaas: '+order.supplierOrderReference;}
 Object.assign(payload.fields,{customer_reference:'Echte klantreferentie',delivery_notes:'Nummer verwijderd'});const source=revisionSource(state,'fixture-packing','maatwerkkunststof');
 assert.throws(()=>appendDocumentRevision(state,'fixture-packing',source.signature,{companyId:'maatwerkkunststof',payload,date:'2099-02-02',files:revisedPackingFiles(),generationId:'fixture-generation-v2'}),/bestelnummer/);
});
test('missing register guard cannot create a clean booking history',async()=>{const db=await fixtureDatabase();try{await assert.rejects(createPacksRegistry(db.store,'test').claim('fixture-order',await fixtureClaim()),/niet vrijgegeven/);assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM crm_integrations').get().n,0);}finally{db.sqlite.close();}});
test('parallel encrypted CAS claims allow one intent only; another device/config never bypasses it',async()=>{
 const db=await fixtureDatabase();try{
  await allowFixtureRegistry(db.store);const a=await fixtureClaim(),b=await fixtureClaim({suffix:'two'}),service=()=>createPacksRegistry(db.store,'test');
  const results=await Promise.allSettled([service().claim('fixture-order',a),service().claim('fixture-order',b)]);assert.equal(results.filter(result=>result.status==='fulfilled'&&result.value.claimed).length,1);
  const winner=results[0].status==='fulfilled'?a:b;assert.equal((await service().claim('fixture-order',winner)).claimed,false);
  await assert.rejects(service().claim('fixture-order',await fixtureClaim({suffix:'new-device',configVersion:'new-config'})),/bestaat al/);
  assert.equal((await service().status('fixture-order')).attempts[0].status,'pending');
  const ciphertext=db.sqlite.prepare("SELECT ciphertext FROM crm_integrations WHERE name='packs-test-order-fixture-order'").get().ciphertext;assert.ok(!ciphertext.includes('Fictiestraat'));
  const publicView=JSON.stringify(await service().status('fixture-order'));assert.ok(!publicView.includes('Fictiestraat'));assert.ok(!publicView.includes('actorHash'));
 }finally{db.sqlite.close();}
});
test('lost write acknowledgement and later restart never free an uncertain intent',async()=>{
 const db=await fixtureDatabase();try{
  await allowFixtureRegistry(db.store);let lose=true;const lossy={...db.store,async write(name,value,version){const stored=await db.store.write(name,value,version);if(name.includes('-order-')&&lose){lose=false;throw Error('fixture lost acknowledgement');}return stored;}};
  const input=await fixtureClaim();await assert.rejects(createPacksRegistry(lossy,'test').claim('fixture-order',input),/lost acknowledgement/);
  const restarted=createPacksRegistry(integrationStore(db.env),'test');assert.equal((await restarted.claim('fixture-order',input)).claimed,false);
  await restarted.settle('fixture-order',input.attemptId,{status:'uncertain',provider:{shipmentId:null,items:[]}});
  await assert.rejects(restarted.claim('fixture-order',await fixtureClaim({suffix:'retry'})),/bestaat al/);
 }finally{db.sqlite.close();}
});
test('recovery guard closing during intent persistence retains evidence and never grants a dispatch claim',async()=>{
 const db=await fixtureDatabase();try{
  await allowFixtureRegistry(db.store);
  const changing={...db.store,async write(name,value,version){
   const result=await db.store.write(name,value,version);
   if(name==='packs-test-order-fixture-order'){const guard=await db.store.read('packs-test-guard');await db.store.write('packs-test-guard',{...guard.value,state:'reconcile'},guard.version);}
   return result;
  }};
  await assert.rejects(createPacksRegistry(changing,'test').claim('fixture-order',await fixtureClaim()),/poging blijft bewaard/);
  const status=await createPacksRegistry(db.store,'test').status('fixture-order');assert.equal(status.reconciliationRequired,true);assert.equal(status.attempts[0].status,'pending');assert.equal(status.canBook,false);
 }finally{db.sqlite.close();}
});
test('partial provider facts can be enriched, never dropped; known booking is immutable',async()=>{
 const db=await fixtureDatabase();try{
  await allowFixtureRegistry(db.store);const input=await fixtureClaim(),registry=createPacksRegistry(db.store,'test');await registry.claim('fixture-order',input);
  await registry.settle('fixture-order',input.attemptId,{status:'uncertain',provider:{shipmentId:1001,items:[{shipmentItemId:null,barcode:'FIXTURE-BARCODE'}]}});
  await assert.rejects(registry.settle('fixture-order',input.attemptId,{status:'uncertain',provider:{shipmentId:null,items:[]}}),/verliest/);
  await registry.settle('fixture-order',input.attemptId,{status:'booked',provider:known});
  await assert.rejects(registry.settle('fixture-order',input.attemptId,{status:'uncertain',provider:known}),/niet worden teruggezet/);
  assert.equal((await registry.settle('fixture-order',input.attemptId,{status:'booked',provider:known})).status,'booked');
 }finally{db.sqlite.close();}
});
test('test/live and company boundaries and changed recovery generation stay closed',async()=>{
 const db=await fixtureDatabase();try{
  assert.throws(()=>createPacksRegistry({...db.store,company:'spatlappen'},'test'),/alleen/);assert.throws(()=>createPacksRegistry(db.store,'other'),/alleen/);
  await allowFixtureRegistry(db.store);const registry=createPacksRegistry(db.store,'test');await registry.claim('fixture-order',await fixtureClaim());
  assert.equal((await createPacksRegistry(db.store,'live').status('fixture-order')).attempts.length,0);
  const guard=await db.store.read('packs-test-guard');await db.store.write('packs-test-guard',{...guard.value,generation:'restored-generation'},guard.version);assert.equal((await registry.status('fixture-order')).reconciliationRequired,true);await assert.rejects(registry.claim('fixture-order',await fixtureClaim()),/Herstelonderzoek/);
 }finally{db.sqlite.close();}
});
test('durable intent survives a real separate Node process exiting',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'crm-packs-fixture-')),filename=join(dir,'only-fixture.sqlite');
 try{
  const first=await fixtureDatabase(filename);await allowFixtureRegistry(first.store);first.sqlite.close();
  const input=await fixtureClaim();const child=spawnSync(process.execPath,[fileURLToPath(new URL('./fixtures/packs-registry-process.mjs',import.meta.url)),filename],{input:JSON.stringify(input),encoding:'utf8',timeout:15000});assert.equal(child.status,0,child.stderr);assert.equal(JSON.parse(child.stdout).claimed,true);
  const afterRestart=await fixtureDatabase(filename);try{const registry=createPacksRegistry(afterRestart.store,'test');assert.equal((await registry.status('fixture-order')).attempts[0].status,'pending');await assert.rejects(registry.claim('fixture-order',await fixtureClaim({suffix:'after-restart'})),/bestaat al/);}finally{afterRestart.sqlite.close();}
 }finally{await rm(dir,{recursive:true,force:true});}
});

const localEnv={CRM_COMPANY_ID:'maatwerkkunststof',CRM_LOCAL_DEV:'true'};
function request(action,{method='POST',body={orderId:'fixture-order',preparationRevision:'fixture-revision'},origin='http://localhost:3011',headers={}}={}){return new Request('http://localhost:3011/api/crm/packs/'+action,{method,...(method==='POST'?{headers:{Origin:origin,'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)}:{})});}
test('HTTP guards reject wrong company/session/origin, malformed and oversized payloads without a provider',async()=>{
 assert.equal((await handlePacks({request:request('status',{method:'GET'}),env:{...localEnv,CRM_COMPANY_ID:'spatlappen'}})).status,403);
 assert.equal((await handlePacks({request:request('status',{method:'GET'}),env:{CRM_COMPANY_ID:'maatwerkkunststof'}})).status,401);
 for(const [input,status] of [[request('review',{origin:'https://other.example.invalid'}),403],[request('review',{body:'{'}),400],[request('review',{body:'x'.repeat(4097)}),413],[request('unknown'),404]])assert.equal((await handlePacks({request:input,env:localEnv})).status,status);
});
test('book and label recovery cannot be activated by environment flags or a browser payload',async()=>{
 let snapshots=0;for(const action of ['book','recover-labels']){
  const response=await handlePacks({request:request(action),env:{...localEnv,CRM_PACKS_ENVIRONMENT:'live',CRM_PACKS_ENABLED:'true'},loadSnapshot:async()=>{snapshots++;throw Error('must not load');}});assert.equal(response.status,423);assert.equal((await response.json()).canBook,false);
 }assert.equal(snapshots,0);
});
test('server review uses stored order/revision, never trusts a browser supplied replacement',async()=>{
 const {state,order}=packsFixture();order.supplierFulfilment.packsPreparation=completePreparation();const snapshot=async()=>({state});
 const good=await handlePacks({request:request('review'),env:localEnv,loadSnapshot:snapshot});assert.equal(good.status,200);assert.equal((await good.json()).canBook,false);
 assert.equal((await handlePacks({request:request('review',{body:{orderId:order.id,preparationRevision:'other-revision'}}),env:localEnv,loadSnapshot:snapshot})).status,409);
 assert.equal((await handlePacks({request:request('review',{body:{orderId:order.id,preparationRevision:'fixture-revision',preparation:completePreparation()}}),env:localEnv,loadSnapshot:snapshot})).status,400);
});
