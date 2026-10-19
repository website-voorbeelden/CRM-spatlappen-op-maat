import {replyReferences,validMessageId,replySubject} from './mail-reply.js';
import {emailAddresses} from './mail-inbox.js?v=workspace-search-20261017';
// Reuse only one unambiguous saved conversation for this order and recipient.
// No provider call, new Gmail permission or customer match by subject alone.
export function documentReplyChoices(state,orderId,recipient){
 const order=state.orders.find(o=>o.id===orderId),customerId=order?.customerId||state.customers.find(c=>c.id===orderId)?.id;if(!customerId||order?.archived)return [];
 const addresses=emailAddresses(recipient);if(addresses.length!==1)return [];
 const candidates=[];
 for(const thread of state.mailThreads||[]){
  if((thread.orderId||thread.customerId)!==orderId||thread.customerId!==customerId||!thread.mailbox||!thread.gmailThreadId)continue;
  const last=(state.incomingEmails||[]).filter(m=>(m.orderId||m.customerId)===orderId&&m.customerId===customerId&&m.mailbox===thread.mailbox&&m.threadId===thread.gmailThreadId&&m.direction!=='outgoing').sort((a,b)=>String(a.receivedAt||'').localeCompare(String(b.receivedAt||''))).at(-1);
  const from=emailAddresses(last?.replyTo||last?.from);
  if(!last||from.length!==1||from[0]!==addresses[0]||!validMessageId(last.messageHeader)||!last.subject?.trim()||/[\r\n]/.test(last.subject))continue;
  const sent=(order?.emailDrafts||state.customers.find(c=>c.id===customerId)?.emailDrafts||[]).filter(d=>d.status==='accepted'&&d.gmailThreadId===thread.gmailThreadId&&d.gmailMailbox===thread.mailbox&&validMessageId(d.messageId)&&String(d.to||'').toLowerCase()===addresses[0]&&String(d.sentAt||'')>String(last.receivedAt||'')).sort((a,b)=>String(a.sentAt).localeCompare(String(b.sentAt))).at(-1),parent=sent?.messageId||last.messageHeader;
  candidates.push({replyMessageId:parent,references:replyReferences(sent?.references||last.references,parent),gmailThreadId:thread.gmailThreadId,gmailMailbox:thread.mailbox,conversationId:thread.gmailThreadId,subject:replySubject(last.subject)});
 }
 return candidates;
}

export function documentReplyContext(state,orderId,recipient){const candidates=documentReplyChoices(state,orderId,recipient);return candidates.length===1?candidates[0]:null;}
