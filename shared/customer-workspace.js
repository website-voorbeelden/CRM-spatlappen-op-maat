import {funnelPayment} from './sales-funnel.js?v=workspace-search-20261017';
import {workQueue} from './work-queue.js?v=workspace-search-20261017';

// Read-only views of the existing dossier. No second task list or stored totals.
export function customerFinancials(state,orders){
 const values=orders.map(o=>funnelPayment(state,o));
 return {
  paid:values.reduce((sum,t)=>sum+t.paid,0),
  balance:values.reduce((sum,t)=>sum+Math.max(0,t.total-t.paid),0),
  credit:values.reduce((sum,t)=>sum+Math.max(0,t.paid-t.total),0),
  unknownCount:values.filter(t=>!t.known).length,
  provisional:values.some(t=>!t.known)
 };
}

export function customerWorkspace(state,customerId,companyId,options={}){
 const orders=state.orders.filter(o=>o.customerId===customerId);
 const open=orders.filter(o=>!o.archived&&o.stage!=='Afgerond'&&!o.deliveredDate);
 const ids=new Set(open.map(o=>o.id)),queue=workQueue(state,companyId,options);
 const tasks=[...queue.tasks,...queue.waiting].filter(t=>ids.has(t.orderId));
 return {orders,open,tasks,...customerFinancials(state,orders)};
}
