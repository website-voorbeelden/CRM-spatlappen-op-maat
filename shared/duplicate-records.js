// Suggestions only: shared wording and evidence across manual/AI/intake paths.
export const duplicateText=value=>String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/\bzwarte\b/g,'zwart').replace(/[^\p{L}\p{N}@]+/gu,' ').trim().replace(/\s+/g,' ');
const tokens=value=>new Set(duplicateText(value).split(' ').filter(Boolean));
export function duplicateCustomers(state,draft){
 const name=duplicateText(draft.company),email=String(draft.email||'').trim().toLowerCase(),phone=String(draft.phone||'').replace(/\D/g,'');
 return state.customers.filter(c=>c.id!==draft.id&&(name&&duplicateText(c.company)===name||email&&String(c.email||'').trim().toLowerCase()===email||phone.length>=8&&String(c.phone||'').replace(/\D/g,'')===phone));
}
function similarProduct(a,b){
 const x=tokens(a.description),y=tokens(b.description);if(!x.size||!y.size)return false;
 const intersection=[...x].filter(t=>y.has(t)).length;
 if(intersection/Math.max(x.size,y.size)<.75)return false;
 const dimensions=[a.width,a.height,b.width,b.height],known=dimensions.every(v=>v!=null&&v!==''),sameSize=!known||a.width===b.width&&a.height===b.height||a.width===b.height&&a.height===b.width;
 if(!sameSize)return false;
 return ['thickness','material','shape','printColors'].every(k=>a[k]==null||a[k]===''||b[k]==null||b[k]===''||duplicateText(a[k])===duplicateText(b[k]));
}
export function duplicateOrders(state,draft){
 const customer=state.customers.find(c=>c.id===draft.customerId),ids=new Set([draft.customerId,...(customer?duplicateCustomers(state,customer).map(c=>c.id):[])]);
 return state.orders.filter(o=>o.id!==draft.id&&ids.has(o.customerId)).flatMap(order=>{
  const reasons=[],aliases=(state.orderMerges||[]).filter(m=>canonicalOrderId(state,m.targetOrderId)===order.id).flatMap(m=>[m.beforeSource?.sourceNumber,String(m.beforeSource?.number||'')]);
  if(draft.sourceNumber&&[order.sourceNumber,String(order.number),...aliases].some(n=>duplicateText(n)===duplicateText(draft.sourceNumber)))reasons.push('hetzelfde ordernummer');
  if((draft.items?.length?draft.items:draft.inquiryProduct?[{description:draft.inquiryProduct}]:[]).some(a=>(order.items?.length?order.items:order.inquiryProduct?[{description:order.inquiryProduct}]:[]).some(b=>similarProduct(a,b))))reasons.push('dezelfde klant en een vergelijkbaar product');
  const names=(state.documents||[]).filter(d=>d.ownerId===order.id).map(d=>duplicateText(d.name));
  if(draft.sourceNumber&&names.some(n=>n.includes(duplicateText(draft.sourceNumber))))reasons.push('dit ordernummer staat al bij een document');
  return reasons.length?[{order,reasons}]:[];
 });
}
export function duplicatePayments(state,receipt){
 const order=state.orders.find(o=>o.id===receipt.orderId);if(!order)return [];
 const customer=state.customers.find(c=>c.id===order.customerId),ids=new Set([order.customerId,...(customer?duplicateCustomers(state,customer).map(c=>c.id):[])]);
 return state.payments.filter(p=>p.id!==receipt.id&&p.amount===receipt.amount&&p.date===receipt.date&&state.orders.some(o=>o.id===p.orderId&&ids.has(o.customerId)));
}
// Removed order numbers remain reserved, including older high-number duplicates.
export function nextOrderNumber(state){return Math.max(3000,...state.orders.map(o=>Number(o.number)||0),...(state.orderMerges||[]).flatMap(m=>[Number(m.beforeSource?.number)||0,Number(m.beforeTarget?.number)||0]))+1;}

export function canonicalOrderId(state,id){const seen=new Set();while(!state.orders.some(o=>o.id===id)&&!seen.has(id)){seen.add(id);const m=state.orderMerges?.find(m=>m.sourceOrderId===id);if(!m)break;id=m.targetOrderId;}return id;}
