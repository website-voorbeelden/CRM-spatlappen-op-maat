import assert from 'node:assert/strict';
import {mailAttention,waitingDuration,compareMailAttention} from '../shared/mail-attention.js';
import {workQueue} from '../shared/work-queue.js';
import {taskListMarkup} from '../admin/workspace/task-list.js';
import {mailAttentionMarkup} from '../admin/mail-workspace.js';

const now=Date.parse('2026-10-16T12:00:00Z');
const incoming=(id,receivedAt)=>({gmailId:id,mailbox:'office@example.invalid',threadId:'bb01',direction:'incoming',receivedAt,customerId:'c1',orderId:'o1'});
const sent=(id,sentAt)=>({id,status:'accepted',sentAt,gmailMailbox:'office@example.invalid',gmailThreadId:'bb01'});
const original=incoming('aa01','2026-10-10T12:00:00Z');
let entries=[original,incoming('aa02','2026-10-15T12:00:00Z'),{id:'d1',status:'draft',updatedAt:'2026-10-16T11:00:00Z'}];
const before=structuredClone(entries);
let result=mailAttention(entries,{now});
assert.equal(result.days,6,'Een extra bericht of concept zet een onbeantwoorde reeks niet op nul.');assert.equal(result.priority,'hoog');assert.equal(result.needsReply,true);assert.equal(result.hasDraft,true);assert.deepEqual(entries,before);assert.equal(mailAttention(entries.map(m=>({...m,unread:false})),{now}).days,6,'Lezen is geen antwoord.');
entries.push(sent('s1','2026-10-12T12:00:00Z'));result=mailAttention(entries,{now});assert.equal(result.days,1);assert.equal(result.priority,'normaal');assert.equal(result.since,'2026-10-15T12:00:00.000Z');
entries.push({...sent('s2','2026-10-16T10:00:00Z'),updatedAt:'2026-10-16T11:30:00Z'});result=mailAttention(entries,{now});assert.equal(result.needsReply,false);assert.match(result.label,/Wacht op reactie · 2 uur/);assert.equal(result.needsAttention,false);
assert.equal(mailAttention([original,{id:'bad',status:'rejected',updatedAt:'2026-10-15T00:00:00Z'}],{now}).waitingFor,'check');
assert.equal(mailAttention([original,{id:'bad',status:'rejected',updatedAt:'2026-10-15T00:00:00Z'},sent('later','2026-10-16T10:00:00Z')],{now}).waitingFor,'customer');
assert.equal(mailAttention([original,{id:'bad',status:'uncertain',updatedAt:'2026-10-15T00:00:00Z'},sent('later','2026-10-16T10:00:00Z')],{now}).waitingFor,'check','Onzeker resultaat blijft controle vragen.');
assert.equal(mailAttention([{gmailId:'aa03',direction:'outgoing',receivedAt:'2026-10-16T11:00:00Z'}],{now}).waitingFor,'customer');
assert.equal(mailAttention([sent('s','2026-10-01T12:00:00Z')],{now}).needsAttention,true);
assert.equal(mailAttention([sent('s','2026-10-01T12:00:00Z')],{now,followupDays:30}).needsAttention,false);
assert.equal(mailAttention([{id:'draft',status:'draft',updatedAt:'2026-10-16T12:00:00Z'}],{now}).waitingFor,'none');
for(const mail of [{...original,receivedAt:'nonsense',savedAt:'2026-10-16T00:00:00Z'},{...original,receivedAt:'2026-10-17T12:00:00Z'},{...sent('s',''),updatedAt:'2026-10-16T11:00:00Z'}]){
 const a=mailAttention([mail],{now});assert.equal(a.waitingFor,'unknown');assert.equal(a.days,null);assert.equal(a.needsAttention,false);
}
assert.equal(waitingDuration('2026-10-16T11:45:00Z',now),'minder dan 1 uur');assert.equal(waitingDuration('2026-10-15T12:00:00Z',now),'1 dag');assert.equal(waitingDuration('',now),'wachttijd onbekend');
const row=(key,items)=>({key,time:'2026-10-16T12:00:00Z',attention:mailAttention(items,{now})});
assert.deepEqual([row('recent',[incoming('aa11','2026-10-16T11:00:00Z')]),row('old',[original]),row('problem',[{status:'uncertain'}]),row('answered',[sent('s','2026-10-16T11:30:00Z')])].sort(compareMailAttention).map(t=>t.key),['problem','old','recent','answered']);

for(const companyId of ['spatlappen','maatwerkkunststof']){
 const o={id:'o1',customerId:'c1',number:3001,date:'2026-10-01',stage:'Offerte verstuurd',items:[],shippingKnown:false,emailDrafts:[{...sent('quote','2026-10-02T12:00:00Z'),funnelPurpose:'quote'}]};
 const state={customers:[{id:'c1',company:'Voorbeeld BV'},{id:'c2',company:'Andere klant'}],orders:[o],documents:[],payments:[],activities:[],incomingEmails:[{...original,receivedAt:'2026-10-10T12:00:00Z'}]};
 let q=workQueue(state,companyId,{now});assert.equal(q.tasks[0].kind,'reply');assert.equal(q.tasks[0].action,'mail');assert.match(q.tasks[0].waitLabel,/6 dagen/);assert.equal(q.tasks[0].priority,'hoog');
 o.emailDrafts.push(sent('reply','2026-10-16T10:00:00Z'));q=workQueue(state,companyId,{now});assert.equal(q.tasks.length,0,'Een echt antwoord stopt de antwoordtaak en een oude fase veroorzaakt geen onterechte opvolgtaak.');assert.match(q.waiting[0].waitLabel,/Wacht op reactie · 2 uur/);
 o.emailDrafts.push({id:'issue',status:'uncertain',updatedAt:'2026-10-16T11:00:00Z',gmailMailbox:'office@example.invalid',gmailThreadId:'bb01'});q=workQueue(state,companyId,{now});assert.equal(q.tasks[0].kind,'mail-check');assert.equal(q.tasks[0].action,'mail');
 const isolated=structuredClone(state);isolated.orders[0].emailDrafts=[];isolated.incomingEmails=[{...original,customerId:'c2',orderId:'other'}];assert.equal(workQueue(isolated,companyId,{now}).tasks.some(t=>t.kind==='reply'),false,'Mail van een andere klant veroorzaakt geen antwoordtaak.');
 state.orders[0].archived=true;assert.equal(workQueue(state,companyId,{now}).tasks.length,0);
}
const task={orderId:'o1',number:3001,customer:'<script>bad()</script>',phase:'Offerte',title:'Reactie controleren',reason:'Nog beantwoorden',priority:'hoog',priorityReason:'Wacht 3 dagen',waitLabel:'Antwoord nodig · 3 dagen',action:'mail',label:'Gesprek openen'};
const markup=taskListMarkup({tasks:Array.from({length:8},()=>task),waiting:[],high:8});assert.match(markup,/Meer taken \(2\)/);assert.match(markup,/task-priority-high/);assert.match(markup,/Antwoord nodig · 3 dagen/);assert.ok(markup.includes('&lt;script&gt;')&&!markup.includes('<script>'));
assert.match(mailAttentionMarkup(mailAttention([original],{now})),/>Hoog</);assert.ok(!mailAttentionMarkup({label:'<img src=x>',reason:'"bad',priority:'hoog'}).includes('<img'));
console.log('✓ Mail en taken: oudste onbeantwoorde bericht, echte antwoorden, concepten/leesstatus, onzeker/afgewezen resultaat, onbekende/toekomstige datums, opvolgtermijn, prioriteitsvolgorde, dossierafscheiding, archief en veilige compacte weergave.');
