// Append-only physical stock ledger. Financial invoices/payments remain separate.
const fail=m=>{throw Error(m);};
const positive=n=>Number.isSafeInteger(n)&&n>0&&n<=1e9;
const ident=s=>typeof s==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(s);
const text=(s,max=240)=>typeof s==='string'&&s.length<=max&&!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s);
export const inventoryOf=state=>state.inventory||{version:1,revision:0,items:[],incoming:[],movements:[]};
export const stockCount=(v,id)=>v.movements.filter(m=>m.stockId===id).reduce((n,m)=>n+m.delta,0);
export const receivedCount=(v,id)=>v.movements.filter(m=>m.incomingId===id&&m.kind==='receive').reduce((n,m)=>n+m.delta,0);
export const cancelledCount=(v,id)=>(v.incoming.find(r=>r.id===id)?.cancellations||[]).reduce((n,c)=>n+c.quantity,0);
export const pendingCount=(v,id)=>{const r=v.incoming.find(x=>x.id===id);return r?r.quantity-receivedCount(v,id)-cancelledCount(v,id):0;};
export const returnedCount=(v,id)=>v.movements.filter(m=>m.issueId===id&&m.kind==='return').reduce((n,m)=>n+m.delta,0);
export const orderStockCount=(v,orderId,itemId)=>v.movements.filter(m=>m.orderId===orderId&&m.itemId===itemId&&['issue','return'].includes(m.kind)).reduce((n,m)=>n-m.delta,0);
// Only explicit standard articles with known matching specifications merit an order hint.
export function relevantStandardStock(state,order){
 const v=inventoryOf(state),same=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
 return v.items.filter(stock=>stock.isStandard===true&&stockCount(v,stock.id)>0&&order.items.some(item=>{
  const product={...(order.items.length===1?order.inquirySpecs:{}),...item};
  if(stock.diameter){if(product.diameter!==stock.diameter)return false;}
  else if(!(stock.width>0&&stock.height>0&&product.width===stock.width&&product.height===stock.height))return false;
  return ['material','color','thickness'].every(key=>!stock[key]||product[key]!=null&&same(stock[key],product[key]));
 }));
}
export function validateInventory(state){
 const v=state.inventory;if(v===undefined)return;
 if(!v||v.version!==1||!Number.isSafeInteger(v.revision)||v.revision<0||!['items','incoming','movements'].every(k=>Array.isArray(v[k])))fail('Ongeldige voorraadgegevens.');
 for(const key of ['items','incoming','movements'])if(v[key].some(x=>!x||!ident(x.id))||new Set(v[key].map(x=>x.id)).size!==v[key].length)fail('Ongeldige of dubbele voorraad-ID.');
 for(const i of v.items){if(i.isStandard!==undefined&&typeof i.isStandard!=='boolean')fail('Ongeldige keuze voor standaardartikel.');if(!text(i.name)||!i.name.trim()||!['material','color','location','notes'].every(k=>text(i[k],k==='notes'?2000:240)))fail('Vul een geldige voorraadnaam en specificaties in.');for(const k of ['width','height','diameter','thickness'])if(i[k]!==null&&(!Number.isFinite(i[k])||i[k]<=0||i[k]>1e7))fail('Ongeldige voorraadmaat.');}
 const balances=new Map(v.items.map(i=>[i.id,0])),received=new Map(),returns=new Map(),seen=new Map();
 for(const m of v.movements){
  if(!balances.has(m.stockId)||!Number.isSafeInteger(m.delta)||m.delta===0||Math.abs(m.delta)>1e9||!['receive','issue','return','adjust'].includes(m.kind)||!text(m.note,2000)||!/^\d{4}-\d{2}-\d{2}T/.test(m.time))fail('Ongeldige voorraadmutatie.');
  if(['receive','return'].includes(m.kind)&&m.delta<0||m.kind==='issue'&&m.delta>0)fail('Ongeldige richting van voorraadmutatie.');
  if(m.kind==='issue'&&(!ident(m.orderId)||!ident(m.itemId)))fail('Kies een order en product voor de voorraaduitgifte.');
  if(m.incomingId){const incoming=v.incoming.find(x=>x.id===m.incomingId);if(m.kind!=='receive'||!incoming||incoming.stockId!==m.stockId)fail('Ongeldige voorraadontvangst.');received.set(incoming.id,(received.get(incoming.id)||0)+m.delta);}
  if(m.kind==='return'){const issue=seen.get(m.issueId);if(!issue||issue.kind!=='issue'||issue.stockId!==m.stockId||issue.orderId!==m.orderId||issue.itemId!==m.itemId)fail('Ongeldige voorraadretour.');returns.set(issue.id,(returns.get(issue.id)||0)+m.delta);if(returns.get(issue.id)>-issue.delta)fail('Er worden meer stuks teruggelegd dan uitgegeven.');}
  balances.set(m.stockId,balances.get(m.stockId)+m.delta);if(balances.get(m.stockId)<0||!Number.isSafeInteger(balances.get(m.stockId)))fail('Onvoldoende voorraad. Negatieve voorraad is niet toegestaan.');seen.set(m.id,m);
 }
 for(const r of v.incoming){if(r.purchaseSplit){const b=r.purchaseSplit;if(!positive(b.totalQuantity)||!positive(b.customerQuantity)||b.totalQuantity-b.customerQuantity!==r.quantity||!Array.isArray(b.lines)||!b.lines.length||b.lines.some(l=>!ident(l.orderId)||!ident(l.itemId)||!positive(l.quantity))||new Set(b.lines.map(l=>l.orderId+':'+l.itemId)).size!==b.lines.length||!ident(r.purchaseId)||b.lines.reduce((n,l)=>n+l.quantity,0)!==b.customerQuantity)fail('Ongeldige verdeling tussen klantorders en voorraad.');}if(!balances.has(r.stockId)||!positive(r.quantity)||!text(r.reference)||!text(r.note,2000)||(r.purchaseId&&!ident(r.purchaseId))||!Array.isArray(r.cancellations||[])||(r.cancellations||[]).some(c=>!positive(c.quantity)||!text(c.note,2000))||(received.get(r.id)||0)+cancelledCount(v,r.id)>r.quantity)fail('Ongeldige bestelde voorraad of te veel ontvangen.');}
}
export function inventoryChange(state,revision,action,{uuid=()=>crypto.randomUUID(),now=new Date().toISOString()}={}){
 validateInventory(state);const current=inventoryOf(state);if(current.revision!==revision)fail('De voorraad is intussen gewijzigd. Sluit dit venster en open de actie opnieuw. Je invoer is nog niet opgeslagen.');
 const v=structuredClone(current),a=action;
 if(a.type==='create'||a.type==='edit'){
  const item={id:uuid(),isStandard:a.isStandard===true,name:String(a.name||'').trim(),material:String(a.material||'').trim(),color:String(a.color||'').trim(),location:String(a.location||'').trim(),notes:String(a.notes||'').trim(),width:a.width??null,height:a.height??null,diameter:a.diameter??null,thickness:a.thickness??null};if(a.type==='edit'){const index=v.items.findIndex(i=>i.id===a.stockId);if(index<0)fail('Dit voorraadartikel bestaat niet meer.');item.id=a.stockId;v.items[index]=item;}else v.items.push(item);
 }else{
 const item=v.items.find(i=>i.id===a.stockId);if(!item)fail('Dit voorraadartikel bestaat niet meer.');
 if(!positive(a.quantity))fail('Vul een positief geheel aantal stuks in.');
 if(a.type==='cancel'){const r=v.incoming.find(x=>x.id===a.incomingId&&x.stockId===item.id);if(!r||a.quantity>pendingCount(v,r.id))fail('Je kunt alleen het nog niet ontvangen restant annuleren.');r.cancellations??=[];r.cancellations.push({quantity:a.quantity,note:String(a.note||'').trim(),time:now});}
 else if(a.type==='plan'){
  if(a.purchaseId&&!state.purchases?.some(p=>p.id===a.purchaseId))fail('Deze inkoopbestelling bestaat niet meer.');
  v.incoming.push({id:uuid(),stockId:item.id,quantity:a.quantity,purchaseId:a.purchaseId||'',reference:String(a.reference||'').trim(),note:String(a.note||'').trim(),time:now});
 }else{
  const movement={id:uuid(),stockId:item.id,kind:a.type,delta:a.quantity,note:String(a.note||'').trim(),time:now};
  if(a.type==='receive'&&a.incomingId)movement.incomingId=a.incomingId;
  if(a.type==='issue'){
   const order=state.orders.find(o=>o.id===a.orderId),product=order?.items.find(i=>i.id===a.itemId);if(!product||order.archived)fail('Kies een bestaande, niet-gearchiveerde order en product.');
   if(a.quantity+orderStockCount(v,order.id,product.id)>product.quantity)fail('Je geeft meer voorraad uit dan deze orderregel nodig heeft.');
   Object.assign(movement,{delta:-a.quantity,orderId:order.id,itemId:product.id});
  }
  if(a.type==='return'){const issue=v.movements.find(m=>m.id===a.issueId&&m.kind==='issue');if(!issue)fail('De oorspronkelijke uitgifte ontbreekt.');Object.assign(movement,{issueId:issue.id,orderId:issue.orderId,itemId:issue.itemId});}
  if(a.type==='adjust'){if(!movement.note)fail('Vul bij een correctie de reden in.');if(a.direction==='out')movement.delta=-a.quantity;else if(a.direction!=='in')fail('Kies bijboeken of afboeken.');}
  v.movements.push(movement);
 }
 }
 v.revision++;validateInventory({...state,inventory:v});state.inventory=v;
 state.activities.unshift({id:uuid(),message:({create:'Voorraadartikel aangemaakt',edit:'Voorraadartikel bijgewerkt',cancel:'Restant voorraadbestelling geannuleerd',plan:'Extra voorraad besteld',receive:'Voorraad ontvangen',issue:'Voorraad gebruikt voor order',return:'Voorraad teruggelegd',adjust:'Voorraad gecorrigeerd'})[a.type]||'Voorraad bijgewerkt',time:now});
 return v;
}
