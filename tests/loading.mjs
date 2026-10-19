import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createActivityTracker,createLoadingUI,loading} from '../admin/loading.js';
import {renderConfirmation} from '../admin/document-generation.js';
import {emailRequest} from '../admin/email-service.js';
function clock(){let time=0,next=0;const timers=new Map();return {now:()=>time,schedule:(fn,ms)=>{timers.set(++next,{fn,at:time+ms});return next;},cancel:id=>timers.delete(id),tick(ms){const target=time+ms;while(true){const entry=[...timers].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;const [id,t]=entry;timers.delete(id);time=t.at;t.fn();}time=target;}};}
const time=clock(),states=[],tracker=createActivityTracker({...time,onChange:s=>states.push(s)});
const fast=tracker.begin('Snel');time.tick(499);fast();time.tick(1000);assert.ok(states.every(s=>!s.visible));
states.length=0;const parent=tracker.begin('Opslaan',{key:'save'});assert.equal(tracker.isBusy('save'),true);time.tick(500);assert.equal(states.at(-1).visible,true);
const child=tracker.begin('PDF maken');assert.equal(states.at(-1).count,2);assert.equal(states.at(-1).label,'PDF maken');child();assert.equal(states.at(-1).label,'Opslaan');assert.equal(states.at(-1).active,true);parent();assert.equal(states.at(-1).active,false);assert.equal(tracker.isBusy('save'),false);parent();assert.equal(states.at(-1).count,0);
const error=Error('Original failure');await assert.rejects(tracker.run('Fout',async()=>{time.tick(500);throw error;},{key:'failed'}),e=>e===error);assert.equal(states.at(-1).failed,true);assert.equal(tracker.isBusy('failed'),false);
function element(){const attrs=new Map(),classes=new Set();return {hidden:false,disabled:false,textContent:'',children:[],parentElement:null,isConnected:false,classList:{add:c=>classes.add(c),remove:(...cs)=>cs.forEach(c=>classes.delete(c)),contains:c=>classes.has(c),toggle(c,yes){yes?classes.add(c):classes.delete(c);}},setAttribute:(k,v)=>attrs.set(k,v),getAttribute:k=>attrs.get(k)??null,removeAttribute:k=>attrs.delete(k),append(...nodes){for(const n of nodes){n.parentElement=this;n.isConnected=true;this.children.push(n);}},matches:()=>false};}
const button=element();button.disabled=true;button.setAttribute('aria-busy','existing');const endButton=tracker.begin('Actie',{button});assert.ok(button.classList.contains('is-loading'));endButton();assert.equal(button.disabled,true);assert.equal(button.getAttribute('aria-busy'),'existing');assert.ok(!button.classList.contains('is-loading'));
const document={body:element(),createElement:element,querySelector:()=>document.modal?.open?document.modal:null},ui=createLoadingUI({document,...time}),visual=createActivityTracker({...time,onChange:ui});
let done=visual.begin('Opslaan…');time.tick(499);assert.equal(document.body.children.length,0);time.tick(1);const box=document.body.children[0];assert.equal(box.hidden,false);assert.equal(box.children[0].textContent,'Opslaan…');assert.equal(box.children[2].getAttribute('aria-valuenow'),null);assert.equal(box.getAttribute('aria-busy'),'true');done();assert.ok(box.classList.contains('is-complete'));assert.equal(box.getAttribute('aria-busy'),'false');time.tick(349);assert.equal(box.hidden,false);time.tick(1);assert.equal(box.hidden,true);
done=visual.begin('Tweede');time.tick(500);done();const next=visual.begin('Derde');assert.equal(box.hidden,true);time.tick(500);assert.equal(box.hidden,false);assert.equal(box.children[0].textContent,'Derde');next({error:true});assert.ok(box.classList.contains('is-error'));time.tick(900);assert.equal(box.hidden,true);
document.modal=element();document.modal.open=true;done=visual.begin('In formulier');time.tick(500);assert.equal(box.parentElement,document.modal);done();time.tick(350);
// Real conversion helper tracks body decoding as well as the HTTP wait. The
// background SMTP status route does not create an activity.
const oldFetch=globalThis.fetch;let release;
try{
 globalThis.fetch=()=>new Promise(resolve=>release=resolve);
 const request=renderConfirmation({kind:'packing',preview:true});assert.equal(loading.isBusy(undefined),true);
 release({ok:true,json:async()=>({pdf:btoa('%PDF fake'),docx:btoa('PK fake'),pages:1})});await request;assert.equal(loading.isBusy(undefined),false);
 const status=emailRequest('status');assert.equal(loading.isBusy(undefined),false);release({ok:true,json:async()=>({configured:false})});await status;
 const send=emailRequest('send',{});assert.equal(loading.isBusy(undefined),true);release({ok:false,json:async()=>({error:'Rejected',mailStatus:'rejected'})});await assert.rejects(send,e=>e.mailStatus==='rejected');assert.equal(loading.isBusy(undefined),false);
 globalThis.fetch=async()=>{throw new DOMException('Stopped','AbortError');};
 await assert.rejects(renderConfirmation({kind:'packing'}),e=>e.name==='AbortError');assert.equal(loading.isBusy(undefined),false);
}finally{globalThis.fetch=oldFetch;}
// Actual modal submit path: busy guard prevents a second save; completion and
// failure always release the tracker and retain existing inline error feedback.
const source=await readFile(new URL('../admin/app.js',import.meta.url),'utf8'),start=source.indexOf('function openForm('),code=source.slice(start,source.indexOf('\nfunction customerForm',start));
let saves=0,resolveSave,active=0,failures=0;const nodes={'#form-status':element(),'#form-error':element(),'[type=submit]':element(),'#cancel':element()};nodes['[type=submit]'].textContent='Opslaan';
const form={dataset:{},querySelector:s=>nodes[s],querySelectorAll:()=>[],addEventListener(){},setAttribute(){},removeAttribute(){}},dialog={querySelector:()=>form,showModal(){},close(){this.closed=true;}};
const env={loading:{begin(){active++;return()=>active--; }},$:selector=>selector==='#dialog'?dialog:nodes['#cancel'],installFormGuidance(){},validateForm:()=>true,showFormProblem(){failures++;},toast(){},toastSequence:0,FormData:class{},confirm:()=>true};runInNewContext(code,env);
env.openForm('Test','',()=>{saves++;return new Promise(resolve=>resolveSave=resolve);});const saving=form.onsubmit({preventDefault(){}});await form.onsubmit({preventDefault(){}});assert.equal(saves,1);assert.equal(active,1);assert.equal(nodes['[type=submit]'].disabled,true);resolveSave();await saving;assert.equal(active,0);assert.equal(nodes['[type=submit]'].disabled,false);assert.equal(dialog.closed,true);
env.openForm('Failure','',async()=>{throw error;});await form.onsubmit({preventDefault(){}});assert.equal(active,0);assert.equal(failures,1);
console.log('✓ Loading: 500ms threshold/no quick flash, real promise lifetime, nested/concurrent tasks, no fake percent, modal visibility, errors/cleanup, button restoration, guarded save and quiet background status.');
