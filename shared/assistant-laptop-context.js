import {assistantTransportState,assistantContext,assistantSnapshot} from './assistant-domain.js?v=ui-batch234-20261027';
// The default is one explicitly selected dossier. Company-wide access is an explicit choice.
export function laptopContext(state,companyId,context,{companyAccess=false}={}){
 const clean=assistantTransportState(state);if(companyAccess)return {state:clean,context};
 const selected=context?.kind==='page'?context.selected:context;
 const empty={customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]};
 if(!selected?.entity||!selected.id)return {state:empty,context:context?.kind==='page'?{...context,visible:undefined,selected:undefined}:null};
 assistantContext(assistantSnapshot(state,companyId),selected);
 const orders=clean.orders.filter(o=>selected.entity==='order'?o.id===selected.id:o.customerId===selected.id),customerId=selected.entity==='customer'?selected.id:orders[0]?.customerId,ids=new Set(orders.map(o=>o.id));
 return {state:{...empty,customers:clean.customers.filter(c=>c.id===customerId),orders,payments:clean.payments.filter(p=>ids.has(p.orderId))},context:context?.kind==='page'?{...context,visible:undefined}:context};
}
