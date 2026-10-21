import {salesFunnel} from './sales-funnel.js?v=maat-cleanup-20261021';
export function gmailPhaseContext(state,orderId,companyId){
 const order=state.orders.find(o=>o.id===orderId);if(!order)throw Error('Dit dossier bestaat niet meer.');
 const links=(state.mailThreads||[]).filter(t=>t.orderId===orderId&&t.mailbox&&t.gmailThreadId).map(t=>({mailbox:t.mailbox,threadId:t.gmailThreadId})).sort((a,b)=>(a.mailbox+'|'+a.threadId).localeCompare(b.mailbox+'|'+b.threadId));
 if(links.some(link=>state.mailThreads.some(t=>t.mailbox===link.mailbox&&t.gmailThreadId===link.threadId&&t.orderId!==orderId)))throw Error('Een mailgesprek is aan verschillende dossiers gekoppeld. Los de koppeling eerst op.');
 return {orderId,signal:salesFunnel(state,order,companyId).signal,links};
}
