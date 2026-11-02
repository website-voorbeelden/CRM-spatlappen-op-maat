// Fictitious records only. Never opens a CRM database or account configuration.
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {integrationStore,sha256} from '../../cloudflare/integration-store.js';
import {supplierFulfilmentData,supplierFulfilmentBasis} from '../../shared/supplier-fulfilment.js';
import {packsPreparationSeed} from '../../shared/packs-preparation.js';

export function packsFixture(){
 const order={id:'fixture-order',number:123,date:'2099-01-01',customerId:'fixture-customer',supplier:'Kunststofbaas',supplierOrderReference:'FIXTURE-123',supplierOrderedDate:'2099-01-01',fulfilmentMethod:'shipping',vat:21,shippingKnown:true,shippingCharge:0,items:[{id:'fixture-item',description:'Fictief product',material:'Fictief materiaal',quantity:1,width:600,height:400,thickness:6,price:10000}]};
 const state={customers:[{id:'fixture-customer',company:'Fictieve klant',contact:'Fictieve ontvanger',shippingRecipient:'Fictieve ontvanger',shippingAddress:'Fictiestraat 12 A\n1234 AB Teststad',country:'NL',email:'ontvanger@example.invalid',phone:'0000000000'}],orders:[order],payments:[],documents:[],activities:[],purchases:[]};
 order.supplierFulfilment={supplierKey:'kunststofbaas',recipientEmail:'leverancier@example.invalid',recordedAt:'2099-01-01T12:00:00.000Z',orderedBasis:supplierFulfilmentBasis(state,order)};
 const preparation=packsPreparationSeed(supplierFulfilmentData(state,order),{basis:supplierFulfilmentBasis(state,order),reference:order.supplierOrderReference,revision:'fixture-revision',parcelId:'fixture-parcel',now:'2099-01-01T12:00:00.000Z'});
 return {state,order,preparation};
}
export function completePreparation(){
 const {preparation}=packsFixture();
 preparation.deliveryAddress={name:'Fictieve ontvanger',nameTo:'',street:'Fictiestraat',number:'12',numberExt:'A',zip:'1234 AB',place:'Teststad',country:'NL',phone:'',mail:''};
 preparation.loadAddress={...preparation.deliveryAddress,name:'Fictieve laadlocatie'};
 preparation.returnAddress={...preparation.deliveryAddress,name:'Fictieve retourlocatie'};
 preparation.packages[0]={id:'fixture-parcel',lengthCm:65,widthCm:45,heightCm:5,weightKg:2.5};
 Object.assign(preparation,{readyOn:'2099-02-01',loadDate:'2099-02-02',deliveryDate:'2099-02-03',packagesConfirmed:true,addressesConfirmed:true,readyConfirmed:true,sources:{}});
 return preparation;
}
export async function fixtureDatabase(filename=':memory:'){
 const sqlite=new DatabaseSync(filename);
 sqlite.exec(await readFile(new URL('../../migrations/0004_integrations.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){let args=[];const stmt={bind(...values){args=values;return stmt;},async first(){return sqlite.prepare(sql).get(...args)||null;},async run(){const result=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}};}};return stmt;}};
 const env={DB,CRM_COMPANY_ID:'maatwerkkunststof',CRM_INTEGRATIONS_KEY:'ab'.repeat(32)};
 return {sqlite,env,store:integrationStore(env)};
}
export async function allowFixtureRegistry(store,environment='test',generation='fixture-generation'){
 await store.write('packs-'+environment+'-guard',{schemaVersion:1,companyId:'maatwerkkunststof',environment,generation,state:'active'});
}
export async function fixtureClaim({environment='test',orderId='fixture-order',suffix='one',preparation=completePreparation(),configVersion='fixture-config'}={}){
 return {attemptId:'fixture-attempt-'+suffix,requestId:'fixture-request-'+suffix,configVersion,actorHash:'cd'.repeat(32),preparation,fingerprint:await sha256(JSON.stringify(['maatwerkkunststof',environment,orderId,configVersion,preparation]))};
}
