import {customerEmailMatches} from './inquiry-customer.js';
import {formProblem} from '../admin/form-guidance.js?v=crm-code-review-20261027';
export const MAX_MAIL_BYTES=10_000_000;
export function mailStorageUsage(state){const incoming=state.incomingEmails||[],drafts=[...state.customers,...state.orders].flatMap(r=>r.emailDrafts||[]),bytes=new TextEncoder().encode(JSON.stringify([incoming,drafts,state.mailThreads||[]])).length;return {bytes,limit:MAX_MAIL_BYTES,received:incoming.length,outgoing:drafts.length,percent:Math.min(100,bytes/MAX_MAIL_BYTES*100)};}
export function assertMailStorage(state){const usage=mailStorageUsage(state);if(usage.bytes>usage.limit)throw Error('Het compacte CRM-mailarchief is vol (10 MB). Verwijder een oude CRM-kopie van een Gmail-gesprek; het origineel blijft in Gmail.');}
export function emailAddresses(value){return [...new Set((String(value||'').match(/[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g)||[]).map(s=>s.toLowerCase()))];}
export function matchingMailCustomers(state,message){const addresses=new Set(emailAddresses(message.direction==='outgoing'?message.to:message.from));return state.customers.filter(c=>[...addresses].some(address=>customerEmailMatches(c,address)));}
export function saveInboxMessage(state,message,{customerId,orderId='',id}){
 if(!state.customers.some(c=>c.id===customerId))throw formProblem('Kies een bestaande klant.',{field:'customerId'});if(orderId&&!state.orders.some(o=>o.id===orderId&&o.customerId===customerId))throw formProblem('Kies een order van deze klant.',{field:'orderId'});
 if(!message||!message.gmailId||!message.mailbox||typeof message.text!=='string'||message.text.length>30000)throw Error('Ongeldige Gmail-mail.');
 const incoming=state.incomingEmails||[],previous=incoming.find(m=>m.gmailId===message.gmailId&&m.mailbox===message.mailbox);if(previous)return {message:previous,reused:true};
 const link=(state.mailThreads||[]).find(t=>t.mailbox===message.mailbox&&t.gmailThreadId===message.threadId);if(link&&(link.customerId!==customerId||link.orderId!==orderId))throw Error('Dit gesprek is al aan een ander dossier gekoppeld. Open het hele gesprek om de koppeling bewust te wijzigen.');
 if(incoming.length>=5000)throw Error('De CRM-mailopslag bevat 5.000 berichten. Bewaar oudere mail in Gmail.');
 const entry={...message,id,customerId,orderId,savedAt:new Date().toISOString()},next=[...incoming,entry];assertMailStorage({...state,incomingEmails:next});state.incomingEmails=next;return {message:entry,reused:false};
}
export function mailOwner(state,id){const order=state.orders.find(o=>o.id===id),customer=state.customers.find(c=>c.id===(order?.customerId||id));if(!customer)return null;return {record:order||customer,order,customer,kind:order?'order':'customer'};}
export function mailOwnerSignature(state,id){const owner=mailOwner(state,id);return owner?JSON.stringify([owner.kind,owner.record,owner.customer,owner.order?state.payments.filter(p=>p.orderId===id):[]]):'';}
export function customerMailEntries(state,id){const entries=[];for(const record of [state.customers.find(c=>c.id===id),...state.orders.filter(o=>o.customerId===id)].filter(Boolean))for(const draft of record.emailDrafts||[])entries.push({...draft,ownerId:record.id,direction:'outgoing',time:draft.sentAt||draft.updatedAt});for(const message of state.incomingEmails||[])if(message.customerId===id)entries.push({...message,ownerId:message.orderId||id,time:message.receivedAt||message.savedAt});return entries.sort((a,b)=>String(b.time||'').localeCompare(String(a.time||'')));}
export const gmailConversationKey=(mailbox,threadId)=>JSON.stringify([mailbox,threadId]);
export function savedConversation(state,mailbox,threadId){return (state.incomingEmails||[]).filter(m=>m.mailbox===mailbox&&m.threadId===threadId);}
export function conversationSignature(state,mailbox,threadId){return JSON.stringify([savedConversation(state,mailbox,threadId),(state.mailThreads||[]).find(t=>t.mailbox===mailbox&&t.gmailThreadId===threadId)||null]);}
export function saveInboxThread(state,thread,{customerId,orderId='',uid,expected,allowMove=false,now=new Date().toISOString()}){
 if(!state.customers.some(c=>c.id===customerId))throw formProblem('Kies een bestaande klant.',{field:'customerId'});
 if(orderId&&!state.orders.some(o=>o.id===orderId&&o.customerId===customerId))throw formProblem('Kies een order van deze klant.',{field:'orderId'});
 if(!thread||!thread.mailbox||!/^[a-fA-F0-9]{1,100}$/.test(thread.threadId)||!Array.isArray(thread.messages)||!thread.messages.length||thread.messages.length>100||new Set(thread.messages.map(m=>m.gmailId)).size!==thread.messages.length||thread.messages.some(m=>m.mailbox!==thread.mailbox||m.threadId!==thread.threadId||!/^[a-fA-F0-9]{1,100}$/.test(m.gmailId)||typeof m.text!=='string'||m.text.length>30000))throw Error('Dit gesprek bevat geen geldige, volledige berichtlijst.');
 if(expected!==conversationSignature(state,thread.mailbox,thread.threadId))throw Error('Dit gesprek is ondertussen in een ander tabblad gewijzigd. Open het opnieuw.');
 const current=savedConversation(state,thread.mailbox,thread.threadId),link=(state.mailThreads||[]).find(t=>t.mailbox===thread.mailbox&&t.gmailThreadId===thread.threadId);
 if((current.some(m=>m.customerId!==customerId||m.orderId!==orderId)||link&&(link.customerId!==customerId||link.orderId!==orderId))&&!allowMove)throw formProblem('Bevestig dat je het gesprek naar dit dossier wilt verplaatsen.',{field:'allowMove'});
 const ids=new Set(current.map(m=>m.gmailId)),added=thread.messages.filter(m=>!ids.has(m.gmailId));
 const incoming=(state.incomingEmails||[]).map(m=>m.mailbox===thread.mailbox&&m.threadId===thread.threadId?{...m,customerId,orderId}:m);
 incoming.push(...added.map(m=>({...m,id:uid(),customerId,orderId,savedAt:now})));
 if(incoming.length>5000)throw Error('De CRM-mailopslag bevat maximaal 5.000 berichten. Het gesprek is niet opgeslagen.');
 const record={id:link?.id||uid(),mailbox:thread.mailbox,gmailThreadId:thread.threadId,customerId,orderId,checkedAt:now},links=[...(state.mailThreads||[]).filter(t=>t!==link),record];
 assertMailStorage({...state,incomingEmails:incoming,mailThreads:links});state.incomingEmails=incoming;state.mailThreads=links;return {added:added.length,total:savedConversation(state,thread.mailbox,thread.threadId).length};
}
export function removeInboxThread(state,mailbox,threadId,expected){if(expected!==conversationSignature(state,mailbox,threadId))throw Error('Dit gesprek is ondertussen gewijzigd. Open het opnieuw.');const count=savedConversation(state,mailbox,threadId).length;state.incomingEmails=(state.incomingEmails||[]).filter(m=>m.mailbox!==mailbox||m.threadId!==threadId);state.mailThreads=(state.mailThreads||[]).filter(t=>t.mailbox!==mailbox||t.gmailThreadId!==threadId);return count;}
export function orderMailThreads(state,id){
 const order=state.orders.find(o=>o.id===id);if(!order)return [];
 const incoming=(state.incomingEmails||[]).filter(m=>m.customerId===order.customerId),links=state.mailThreads||[],groups=new Map();
 const group=(key,metadata={})=>{if(!groups.has(key))groups.set(key,{key,entries:[],...metadata});return groups.get(key);};
 for(const m of incoming){const link=links.find(t=>t.mailbox===m.mailbox&&t.gmailThreadId===m.threadId);if((link?.orderId??m.orderId)!==id)continue;const key=m.threadId?gmailConversationKey(m.mailbox,m.threadId):'message:'+m.id;group(key,{mailbox:m.mailbox,gmailThreadId:m.threadId,checkedAt:link?.checkedAt||''}).entries.push({...m,ownerId:id,time:m.receivedAt||m.savedAt});}
 for(const record of [state.customers.find(c=>c.id===order.customerId),...state.orders.filter(o=>o.customerId===order.customerId)].filter(Boolean))for(const d of record.emailDrafts||[]){
  const originals=incoming.filter(m=>d.replyMessageId&&m.messageHeader===d.replyMessageId),original=originals.length===1?originals[0]:null,mailbox=d.gmailMailbox||original?.mailbox,threadId=d.gmailThreadId||original?.threadId,key=threadId&&mailbox?gmailConversationKey(mailbox,threadId):'draft:'+(d.conversationId||d.id);
  if(record.id!==id&&!groups.has(key))continue;group(key,{...(threadId&&mailbox?{mailbox,gmailThreadId:threadId}: {})}).entries.push({...d,ownerId:record.id,direction:'outgoing',time:d.sentAt||d.updatedAt});
 }
 return [...groups.values()].map(t=>{t.entries.sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));const last=t.entries.at(-1);return {...t,subject:last.subject,time:last.time};}).sort((a,b)=>String(b.time||'').localeCompare(String(a.time||'')));
}
