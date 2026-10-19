import {compareMailAttention} from './mail-attention.js?v=mail-priority-20261016-2';

export const mailSortOptions=[['attention','Aandacht eerst'],['recent','Nieuwste eerst'],['oldest','Oudste eerst']];
const localDate=value=>{
 const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
};
export function mailListDateProblem({from='',until=''}={}){return from&&until&&from>until?'De begindatum ligt na de einddatum. Pas de datums aan.':'';}
// A view of loaded conversations only. Never marks mail read or changes Gmail.
export function mailListMatches(thread,{search='',folder='all',status='all',linked='all',attachments=false,from='',until=''}={}){
 if(mailListDateProblem({from,until}))return false;
 const entries=thread.entries;
 if(search&&!JSON.stringify([thread.subject,thread.correspondent,thread.customerName,entries.map(m=>[m.from,m.to,m.snippet,m.text,m.body])]).toLocaleLowerCase('nl').includes(search.trim().toLocaleLowerCase('nl')))return false;
 if(folder==='attention'&&!thread.attention.needsAttention||folder==='drafts'&&!entries.some(m=>!m.gmailId&&m.status==='draft')||folder==='inbox'&&!entries.some(m=>m.inInbox)||folder==='sent'&&!entries.some(m=>m.gmailId&&m.direction==='outgoing')||folder==='sent-crm'&&!entries.some(m=>!m.gmailId&&m.status==='accepted'))return false;
 if(status==='reply'&&!thread.attention.needsReply||status==='waiting'&&thread.attention.waitingFor!=='customer'||status==='check'&&thread.attention.waitingFor!=='check'||status==='unread'&&!thread.unread)return false;
 if(linked==='linked'&&!thread.saved||linked==='unlinked'&&thread.saved)return false;
 if(attachments&&!entries.some(m=>m.attachments?.length||m.attachmentIds?.length||m.documentId))return false;
 const date=localDate(thread.time);
 if((from||until)&&!date||from&&date<from||until&&date>until)return false;
 return true;
}
export function sortMailList(items,sort='attention'){
 return items.sort(sort==='attention'?compareMailAttention:(a,b)=>{
  // Missing dates stay at the bottom in either direction.
  if(!a.time||!b.time)return Number(!a.time)-Number(!b.time)||String(a.key).localeCompare(String(b.key));
  return (sort==='oldest'?a.time.localeCompare(b.time):b.time.localeCompare(a.time))||String(a.key).localeCompare(String(b.key));
 });
}
