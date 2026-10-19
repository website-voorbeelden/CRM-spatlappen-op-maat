import assert from 'node:assert/strict';
import {guidanceMarkup,runGuidedAction,installGuidedActions} from '../admin/guided-actions.js';
import {inlineTaskClient} from '../tools/costing/inline-task-client.js';
const markup=guidanceMarkup({title:'Geen <img onerror=bad> gevonden',message:'Maak X & keer terug',actions:[{id:'create',label:'X aanmaken',primary:true}]});assert.ok(!markup.includes('<img'));assert.ok(markup.includes('&lt;img'));assert.ok(markup.includes('data-guided-action="create"'));assert.ok(markup.includes('type="button"'));assert.throws(()=>guidanceMarkup({actions:[{id:'x" onclick=bad',label:'bad'}]}));
const button={dataset:{guidedAction:'create'},disabled:false,textContent:'Aanmaken',attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}};let actions=0,resolve,errors=[];
const pending=new Promise(r=>resolve=r);installGuidedActions({querySelectorAll:()=>[button]},{create:async()=>{actions++;await pending;return 'created';}},{onError:e=>errors.push(e.message)});
assert.equal(actions,0);const first=button.onclick(),second=button.onclick();assert.equal(actions,1);assert.equal(button.disabled,true);assert.equal(button.attrs['aria-busy'],'true');resolve();await Promise.all([first,second]);assert.equal(button.disabled,false);assert.equal(button.textContent,'Aanmaken');assert.equal(button.attrs['aria-busy'],undefined);
await runGuidedAction(button,()=>{throw Error('Fictieve fout');},{onError:e=>errors.push(e.message)});assert.deepEqual(errors,['Fictieve fout']);assert.equal(button.disabled,false);await runGuidedAction(button,()=>actions++,{isBusy:()=>true});assert.equal(actions,1);
const old={window:globalThis.window,document:globalThis.document,location:globalThis.location};const parent={},events=new Map(),out=[],contexts=[];
try{
 globalThis.location={search:'?taskId=test-task',origin:'http://localhost:3011'};globalThis.document={body:{classList:{add(){}}}};parent.postMessage=(data,origin)=>out.push({data,origin});globalThis.window={parent,addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:(type,fn)=>{assert.equal(events.get(type),fn);events.delete(type);}};
 const client=inlineTaskClient({onContext:v=>contexts.push(v)});assert.equal(out[0].data.type,'ready');assert.equal(contexts.length,0);
 const data={format:'crm-inline-task',taskId:'test-task',type:'context',product:{quantity:3,width:500,height:200,customerName:'NEVER_SENT',email:'NEVER_EMAIL',token:'NEVER_TOKEN'}};
 events.get('message')({source:{},origin:location.origin,data});events.get('message')({source:parent,origin:'https://evil.invalid',data});events.get('message')({source:parent,origin:location.origin,data:{...data,taskId:'wrong'}});assert.equal(contexts.length,0);
 events.get('message')({source:parent,origin:location.origin,data});assert.deepEqual(contexts,[{quantity:3,width:500,height:200}]);assert.ok(!JSON.stringify(contexts).includes('NEVER_'));events.get('message')({source:parent,origin:location.origin,data});assert.equal(contexts.length,1);
 assert.equal(client.url('index.html',{quoteId:'q1'}),'index.html?quoteId=q1&taskId=test-task');client.state({dirty:true,busy:true});assert.equal(out.at(-1).data.busy,true);client.complete({quoteId:'q1',pieceId:'p1'});assert.equal(out.at(-1).data.type,'complete');client.cancel();assert.equal(out.at(-1).data.type,'cancel');assert.ok(out.every(o=>o.origin===location.origin));client.dispose();assert.equal(events.size,0);
 globalThis.window.parent=globalThis.window;assert.equal(inlineTaskClient(),null);
}finally{Object.assign(globalThis,old);}
console.log('✓ Reusable guidance: escaped actions, explicit clicks, double-click/busy/error guards; inline tool return protocol, exact origin/source/nonce, numeric-only context, no customer fields, no standalone changes.');
