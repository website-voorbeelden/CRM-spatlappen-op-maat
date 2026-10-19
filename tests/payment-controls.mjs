import {decimalNumber} from '../shared/decimal-input.js';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createActivityTracker} from '../admin/loading.js';
import {applyTikkiePayments} from '../admin/payment-workflow.js';
const source=await readFile(new URL('../admin/app.js',import.meta.url),'utf8');
// Execute the real click handler with the real busy lock: it disables the button
// before the Tikkie adapter starts. That must not silently cancel the request.
const control=source.slice(source.indexOf('async function checkTikkiePayments('),source.indexOf('// Read the latest stored order inside the transaction'));
const listener=source.slice(source.indexOf("document.addEventListener('click',async event=>{\n const b=event.target.closest('[data-action]');"),source.indexOf('\nfunction deleteOrderForm'));
let click,fetches=0,release,messages=[],activity=[];
const button={dataset:{action:'check-tikkie-payments',id:'o'},disabled:false,textContent:'Betalingen controleren',getAttribute:()=>null,setAttribute(){},removeAttribute(){},classList:{contains:()=>false,add(){},toggle(){}}};
const data={orders:[{id:'o',paymentLinks:[{id:'link',paymentRequestToken:'request-token',amountInCents:10000}]}],payments:[]};
const env={document:{addEventListener(type,fn){click=fn;}},loading:createActivityTracker(),fetch:async()=>{fetches++;return await new Promise(resolve=>release=resolve);},beginLocalStateChange(){},updateCommunication:async(id,mutate,message)=>{mutate(data.orders[0],data);activity.push(message);},applyTikkiePayments,uid:()=> 'payment',CRM_TIME_ZONE:'Europe/Amsterdam',toast:m=>messages.push(m)};
runInNewContext(control+'\n'+listener,env);
const event={target:{closest:()=>button}},pending=click(event);assert.equal(fetches,1);assert.equal(button.disabled,true);await click(event);assert.equal(fetches,1,'second click must not duplicate check');
release({ok:true,json:async()=>({links:[]})});await pending;assert.equal(button.disabled,false);assert.equal(button.textContent,'Betalingen controleren');assert.ok(messages.includes('Tikkie gecontroleerd · geen nieuwe betalingen'));assert.equal(activity.length,1);
const failure=click(event);release({ok:false,json:async()=>({error:'Fictieve dienstfout'})});await failure;assert.equal(button.disabled,false);assert.ok(messages.includes('Fictieve dienstfout'));assert.equal(data.payments.length,0);
// The percentage helper only prepares input. It never records a payment or
// releases production until the ordinary registration form is submitted.
const paymentCode=source.slice(source.indexOf('function paymentForm('),source.indexOf('\nlet documentUploadQueue=',source.indexOf('function paymentForm(')));
const input=()=>({value:'',handlers:[],addEventListener(type,fn){this.handlers.push(fn);},dispatchEvent(){for(const fn of this.handlers)fn();}});
let markup,submit,marked=0,saves=0;const amount=input(),percentage=input(),form={elements:{amount,paymentPercentage:percentage}};
const state={payments:[]},order={id:'o',number:3001,shippingKnown:true,stage:'Wachten op betaling'};
const paymentEnv={decimalNumber,state,totals:()=>({priceKnown:true,total:12345,balance:12345}),order:()=>order,euro:String,field:(name)=>'<input name="'+name+'">',today:()=> '2026-10-16',openForm:(title,html,fn)=>{markup=html;submit=fn;},$:()=>form,Event:class{},markFormSources(){marked++;},markProvenance:r=>r,cents:x=>Math.round(Number(x)*100),formProblem:Error,uid:()=> 'p',save:async()=>saves++};
runInNewContext(paymentCode+'\npaymentForm("o");',paymentEnv);assert.ok(markup.includes('paymentPercentage'));percentage.value='70';for(const fn of percentage.handlers)fn();assert.equal(amount.value,'86.42');assert.equal(percentage.value,'70');assert.equal(marked,1);assert.equal(state.payments.length,0);assert.equal(order.stage,'Wachten op betaling');amount.value='20';amount.dispatchEvent();assert.equal(percentage.value,'');
await submit(new Map([['amount','20'],['date','2026-10-16'],['reference','Fictief']]));assert.equal(saves,1);assert.equal(state.payments[0].amount,2000);assert.equal(order.stage,'Wachten op betaling');
paymentEnv.totals=()=>({priceKnown:false,total:0,balance:0});runInNewContext(paymentCode+'\npaymentForm("o");',paymentEnv);assert.ok(!markup.includes('name="paymentPercentage"'));assert.ok(markup.includes('Nog te bepalen'));
console.log('Echte Tikkie-klikroute, busy/dubbelklik/fout en percentage-invoer gecontroleerd met fictieve diensten.');
const viewStart=source.indexOf('function orderPaymentsView('),viewCode=source.slice(viewStart,source.indexOf('\n}',viewStart)+2);
let html;const viewEnv={totals:()=>({priceKnown:false,total:0,paid:2500,balance:-2500}),productRevenue:()=>0,euro:n=>'EUR '+n,percent:n=>n+'%',esc:String,button:()=>'',orderSummaryRows:rows=>rows.map(r=>r.join(': ')).join(' · '),paymentLinksPanel:()=>'',paidDate:()=> '2026-10-17',date:String};
runInNewContext(viewCode+'\nhtml=orderPaymentsView({id:"o",number:3001,shippingKnown:false,shippingCharge:0,vat:21},[]);',Object.assign(viewEnv,{html:''}));html=viewEnv.html;assert.ok(html.includes('Nog te bepalen'));assert.ok(html.includes('EUR 2500'));assert.ok(!html.includes('EUR 0'),'Unknown products and VAT are not displayed as zero');assert.ok(!html.includes('role="progressbar"'));assert.ok(!html.includes('Er is EUR 2500 meer ontvangen'));assert.ok(!html.includes('Orderbedrag voldaan op'));
console.log('Onbekende orderbedragen: echte ontvangsten zichtbaar, geen onterecht teveel betaald, voldaan-datum of betalingspercentage.');
