// Only real workflow facts invalidate an adopted Gmail phase. Editing notes,
// contact details, prices or opening a page must not restore an older phase.
export function salesPhaseSignal(state,order,basePhase,events){
 const latest=events.filter(e=>e.phase!=='followup'&&!['pending','dismissed'].includes(e.review)).at(-1);
 const payments=(state.payments||[]).filter(p=>p.orderId===order.id).map(p=>[p.id,p.amount,p.date||'']).sort((a,b)=>a[0].localeCompare(b[0]));
 const stages=['Offerte verstuurd','Wachten op betaling','Productie vrijgegeven','Besteld bij leverancier','In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden','Afgerond'];
 return {phase:basePhase,basis:JSON.stringify({event:latest?[latest.id||'',latest.phase,latest.at,latest.recordedAt||'']:null,payments,stage:stages.includes(order.stage)?order.stage:'',archived:!!order.archived,dates:['quoteSentDate','confirmationSentDate','invoiceSentDate','productionReleasedDate','supplierOrderedDate','productionDate','transitDate','arrivedDate','shippedDate','deliveredDate'].map(k=>order[k]||'')})};
}
export function validGmailSalesPhase(value){
 return value&&typeof value==='object'&&!Array.isArray(value)&&['new','welcome','specs','pricing','indication','quote','confirmation','received','paid','released','production','delivered'].includes(value.phase)&&typeof value.basis==='string'&&value.basis.length<=64000&&typeof value.mailbox==='string'&&value.mailbox.length<=254&&Array.isArray(value.threads)&&value.threads.length>0&&value.threads.length<=10&&new Set(value.threads).size===value.threads.length&&value.threads.every(id=>typeof id==='string'&&/^[a-fA-F0-9]{1,100}$/.test(id))&&Number.isFinite(Date.parse(value.at))&&typeof value.source==='string'&&['gmail','crm'].includes(value.source)&&Object.keys(value).every(k=>['phase','basis','mailbox','threads','at','source'].includes(k));
}
export function adoptedGmailPhase(state,order,signal){
 const saved=order.gmailSalesPhase;
 if(!validGmailSalesPhase(saved)||saved.basis!==signal.basis)return null;
 const threads=(state.mailThreads||[]).filter(t=>t.orderId===order.id&&t.mailbox===saved.mailbox).map(t=>t.gmailThreadId);
 return saved.threads.length===threads.length&&saved.threads.every(id=>threads.includes(id))?saved:null;
}
