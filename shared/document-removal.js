import {formProblem} from '../admin/form-guidance.js?v=crm-code-review-20261027';
export function documentRemovalInfo(state,id){
 const document=state.documents.find(d=>d.id===id);if(!document)throw Error('Dit document is al verwijderd.');
 const vatRecords=[...(state.vatLedger?.entries||[]).filter(e=>e.status!=='void'),...(state.vatLedger?.preparations||[]).flatMap(p=>p.entries||[])];if(vatRecords.some(e=>e.documentIds?.includes(id)||e.sourceKey==='file:'+id))throw Error('Dit bestand hoort bij een btw-boeking of bewaarde voorbereiding. Bewaar het bronbewijs; verwijder het niet uit de administratie.');
 if(state.orders.some(o=>o.items.some(i=>(i.designVariants||[]).some(v=>[v,...(v.revisions||[])].some(r=>r.documentId===id||r.previewId===id)))))throw Error('Dit bestand hoort bij een bewaarde ontwerpvariant. Beheer het ontwerp bij het product; eerdere versies blijven behouden.');
 if(document.internalDesign)throw Error('Dit is een intern ontwerpbestand. Beheer het ontwerp vanuit de productregel.');
 const emails=[...state.customers,...state.orders].flatMap(owner=>(owner.emailDrafts||[]).filter(d=>(d.documentId===id||d.attachmentIds?.includes(id))).map(d=>({ownerId:owner.id,id:d.id,documentId:d.documentId,attachmentIds:d.attachmentIds||[],status:d.status,mailRequestId:d.mailRequestId,sentAt:d.sentAt||''}))),links=state.orders.flatMap(o=>(o.paymentLinks||[]).filter(l=>l.documentId===id).map(l=>({orderId:o.id,id:l.id,documentId:l.documentId}))),items=state.orders.flatMap(o=>o.items.filter(i=>i.designPreviewId===id||i.designDocumentId===id||i.primaryImageId===id).map(i=>({orderId:o.id,id:i.id,primaryImageId:i.primaryImageId||'',designPreviewId:i.designPreviewId||'',designDocumentId:i.designDocumentId||''})));
 const order=state.orders.find(o=>o.id===document.ownerId),customer=state.customers.find(c=>c.id===document.ownerId),purchase=(state.purchases||[]).find(p=>p.id===document.ownerId),owner=order?{id:order.id,customerId:order.customerId,number:order.sourceNumber||order.number}:customer?{id:customer.id,company:customer.company}:purchase?{id:purchase.id,name:purchase.name}:null,sharedOrders=customer?state.orders.filter(o=>o.customerId===customer.id).map(o=>o.id):[];
 return {document,emails,links,items,signature:JSON.stringify([document,emails,links,items,owner,sharedOrders])};
}
export function removeDocument(state,id,expected,{confirmed=false,now=new Date().toISOString()}={}){
 if(!confirmed)throw formProblem('Bevestig dat je dit bestand wilt verwijderen.',{field:'confirmDeleteDocument'});
 const info=documentRemovalInfo(state,id);if(info.signature!==expected)throw Error('Dit document of een koppeling is ondertussen gewijzigd. Open Verwijderen opnieuw.');
 const match=String(info.document.generated?.number||'').match(/^([A-Z]+-\d{4})-(\d{1,10})$/);
 if(match){const sequence=Number(match[2]);if(Number.isSafeInteger(sequence)){state.documentSequences??={};state.documentSequences[match[1]]=Math.max(state.documentSequences[match[1]]||0,sequence);}}
 state.documents=state.documents.filter(d=>d.id!==id);
 for(const o of state.orders)for(const i of o.items)for(const key of ['primaryImageId','designPreviewId','designDocumentId'])if(i[key]===id)delete i[key];
 // Keep original document IDs and external statuses as history, not as live attachments.
 for(const owner of [...state.customers,...state.orders])for(const draft of owner.emailDrafts||[])if(draft.documentId===id)draft.missingAttachment={id,name:info.document.name,removedAt:now};
 return info.document;
}
