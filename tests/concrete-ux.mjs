import {installDecimalFields,refreshDecimalFields} from '../admin/decimal-fields.js';
import {validSampleDate} from '../shared/sample-order.js';
import {preferredOpenPurchase} from '../shared/purchase-default.js';
import assert from 'node:assert/strict';
import {decimalNumber,decimalText} from '../shared/decimal-input.js';
import {customerExecutionDetails} from '../shared/product-specifications.js';
import {validateBusinessState} from '../shared/state-validation.js';
import {workQueue} from '../shared/work-queue.js';
import {readSampleFields} from '../admin/products/sample-order.js';
for(const [input,value]of [['1,50',1.5],['1.50',1.5],['0',0],[' 12,3 ',12.3],['-1,2',-1.2]])assert.equal(decimalNumber(input),value);
for(const input of ['','1,234','1.234,56','1,234.56','1e3','1.2.3','abc'])assert.ok(Number.isNaN(decimalNumber(input)),input);
assert.equal(decimalText('1.5'),'1,50');assert.equal(decimalText('0'),'0,00');
assert.deepEqual(customerExecutionDetails({holeFinish:'none',surfaceFinish:'smooth',notes:'PRIVATE'},'spatlappen'),['Geen gaten','Glad (niet anti-spray)']);
assert.deepEqual(customerExecutionDetails({},'spatlappen'),[]);assert.deepEqual(customerExecutionDetails({holeFinish:'none'},'maatwerkkunststof'),[]);
const state={customers:[{id:'c1',company:'Test'}],orders:[{id:'o1',number:3001,customerId:'c1',stage:'Afgerond',date:'2026-10-15',isSample:true,sampleFollowupDate:'2026-10-17',items:[{id:'i1',quantity:1,cost:0,price:null,holeFinish:'none',surfaceFinish:'smooth'}]}],payments:[],documents:[],activities:[],purchases:[]};
validateBusinessState(state);const original=structuredClone(state);const queue=workQueue(state,'spatlappen',{now:Date.parse('2026-10-17T12:00:00Z')});assert.equal(queue.tasks[0].kind,'sample');assert.deepEqual(state,original);assert.equal(state.orders[0].items[0].cost,0);assert.equal(state.orders[0].items[0].price,null);
state.orders[0].sampleFollowupDone=true;assert.equal(workQueue(state,'spatlappen').tasks.length,0);
state.orders[0].isSample=false;assert.equal(workQueue(state,'spatlappen').tasks.length,0);
state.orders[0].items[0].holeFinish='assumed';assert.throws(()=>validateBusinessState(state),/bevestigingsgaten/);
const fd=new FormData();fd.set('isSample','on');fd.set('sampleFollowupDate','2026-10-20');assert.equal(readSampleFields(fd).sampleFollowupDate,'2026-10-20');fd.delete('isSample');assert.deepEqual(readSampleFields(fd),{isSample:false,sampleFollowupDate:'',sampleFollowupDone:false});
console.log('✓ Decimalen: komma/punt, expliciet0, geen exponent/groepering/afronden; bevestigde publieke uitvoering zonder privétekst/bedrijflek; teststukopvolging zonder status-/prijsverandering.');

const batches=[{id:'old',status:'Onderweg',defaultForNewOrders:true},{id:'open',status:'Verzamelen'}],batchSnapshot=structuredClone(batches);assert.equal(preferredOpenPurchase(batches,'spatlappen').id,'open');assert.deepEqual(batches,batchSnapshot);assert.equal(preferredOpenPurchase(batches,'maatwerkkunststof'),null);batches.push({id:'second',status:'Verzamelen'});assert.equal(preferredOpenPurchase(batches,'spatlappen'),null);batches[2].defaultForNewOrders=true;assert.equal(preferredOpenPurchase(batches,'spatlappen').id,'second');batches[2].shippedDate='2026-10-17';assert.equal(preferredOpenPurchase(batches,'spatlappen').id,'open');

for(const day of ['2026-02-30','2026-13-01','not-a-date',0])assert.equal(validSampleDate(day),false);assert.equal(validSampleDate('2028-02-29'),true);
const controls=['1.50','2.75'].map(value=>({type:'number',step:'0.01',min:'0',max:'',name:'price',value,dataset:{},validity:{valid:true},matches(){return this.type==='number';},setCustomValidity(error){this.error=error;this.validity={valid:!error};}})),handlers={};
const fakeForm={querySelectorAll:selector=>controls.filter(i=>selector.includes('data-decimal')?i.dataset.decimalPlaces:i.type==='number'),addEventListener:(key,fn)=>handlers[key]=fn};
installDecimalFields(fakeForm);assert.deepEqual(controls.map(i=>i.value),['1,50','2,75']);const multiple=new FormData();for(const i of controls)multiple.append(i.name,i.value);handlers.formdata({formData:multiple});assert.deepEqual(multiple.getAll('price'),['1.5','2.75']);assert.equal(controls[0].value,'1,50');controls[0].value='-1,00';handlers.input({target:controls[0]});assert.match(controls[0].error,/minimaal/);controls[0].value='0';refreshDecimalFields(fakeForm);assert.equal(controls[0].error,'','programmatic changes get revalidated before submit');

for(const invalid of [{...original,orders:[null]},{...original,purchases:[null]},{...original,orders:[{...original.orders[0],items:[null]}]}])assert.throws(()=>validateBusinessState(invalid),e=>e.status===400);
