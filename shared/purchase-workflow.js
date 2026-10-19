export const latePurchase=p=>Boolean(p&&(p.shippedDate||p.arrivedDate||['Onderweg','Binnen in Nederland'].includes(p.status)));
export function guardPurchaseLink(state,o,targetId,{acknowledged=false}={}){
 if((o.purchaseId||'')===(targetId||''))return;
 const old=(state.purchases||[]).find(p=>p.id===o.purchaseId);
 if(old?.invoices?.some(i=>(i.lines||[]).some(l=>l.orderId===o.id||(o.items||[]).some(it=>it.id===l.itemId))))throw Error('Deze order heeft leveranciersregels in de huidige batch. Controleer die koppelingen voordat je de order verplaatst.');
 if(!targetId)return;
 const target=(state.purchases||[]).find(p=>p.id===targetId);if(!target)throw Error('De gekozen batch bestaat niet meer.');
 if(target.archived)throw Error('Deze batch is gearchiveerd. Heropen de batch voordat je een order toevoegt.');
 if(latePurchase(target)&&!acknowledged)throw Error('Deze batch is al onderweg of aangekomen. Bevestig de afwijkende koppeling bewust.');
}
export function purchaseArchiveInfo(state,id){
 const p=(state.purchases||[]).find(p=>p.id===id);if(!p)throw Error('De batch bestaat niet meer.');
 const orders=state.orders.filter(o=>o.purchaseId===id),pending=orders.filter(o=>!o.deliveredDate&&o.stage!=='Afgerond');
 return {purchase:p,orders,pending,signature:JSON.stringify([p,orders.map(o=>[o.id,o.stage,o.deliveredDate,o.purchaseId])])};
}
export function archivePurchase(state,id,expected,archived=true,{now=new Date().toISOString()}={}){
 const info=purchaseArchiveInfo(state,id);if(info.signature!==expected)throw Error('De batch of gekoppelde leveringen zijn gewijzigd. Open de archiefcontrole opnieuw.');
 if(archived&&info.pending.length)throw Error('Rond eerst de gekoppelde klantleveringen af. Een gearchiveerde klantorder is op zichzelf geen leverbewijs.');
 info.purchase.archived=archived;if(archived){info.purchase.archivedAt=now;info.purchase.defaultForNewOrders=false;}else delete info.purchase.archivedAt;
}
export const batchDocumentKinds=[['transport','Transportbevestiging'],['supplier','Leveranciersdocument'],['payment','Betaalbewijs leverancier'],['customs','Douane / invoer']];
