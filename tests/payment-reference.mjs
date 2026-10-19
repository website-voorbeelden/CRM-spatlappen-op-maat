import assert from 'node:assert/strict';
import {applyTikkiePayments} from '../admin/payment-workflow.js';
import {validateBusinessState} from '../shared/state-validation.js';

const order={id:'o1',customerId:'c1',number:3001,items:[]};
const state={customers:[{id:'c1',company:'Fictieve klant'}],orders:[order],payments:[],documents:[],activities:[]};
const link={id:'link-1',description:'Fictief betaalverzoek',payments:[{paymentToken:'00000000-1111-2222-3333-444444444444',amountInCents:1250,createdAt:'2026-10-10T12:00:00Z'}]};
const options={uid:()=> 'payment-1',timeZone:'Europe/Amsterdam'};
assert.equal(applyTikkiePayments(state,order,[link],options),1);
const before=structuredClone(state);
assert.equal(state.payments[0].externalId,'tikkie:00000000-1111-2222-3333-444444444444');
validateBusinessState(state);assert.deepEqual(state,before,'Validatie behoudt de bestaande providerreferentie exact.');
assert.equal(applyTikkiePayments(state,order,[link],options),0);assert.equal(state.payments.length,1,'De providerreferentie blijft deduplicatie bewaken.');
for(const [field,value] of [['id','tikkie:wrong-record-id'],['orderId','tikkie:wrong-order-id'],['paymentLinkId','tikkie:wrong-link-id'],['externalId','tikkie:<script>'],['externalId','tikkie:'],['externalId','tikkie:'+'x'.repeat(161)]]){
 const invalid=structuredClone(state);invalid.payments[0][field]=value;assert.throws(()=>validateBusinessState(invalid),/Ongeldige ID/);
}
const plain=structuredClone(state);plain.payments[0].externalId='legacy-payment-1';validateBusinessState(plain);
console.log('✓ Bestaande Tikkie-referenties blijven geldig en exact behouden; herhaalde import telt niet dubbel. Interne IDs en ongeldige providerreferenties blijven geblokkeerd.');
