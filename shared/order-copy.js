// A new order keeps product specifications, never another dossier's files or
// approval. Copying artwork between orders requires its own explicit workflow.
export function copyOrder(original,{number,date,stage,newId,expenses=[]}){
 const copy=structuredClone(original);
 // Actual expenses and their evidence/payments belong to the original order.
 copy.namedCosts=(copy.namedCosts||[]).filter(row=>!row.businessExpenseId&&!row.supplierInvoiceImportId);
 for(const e of expenses)if(e.target.kind==='order'&&e.target.ownerId===original.id&&e.target.slot!=='named')copy[e.target.slot]=null;
 Object.assign(copy,{id:newId(),number,date,stage,archived:false,sourceNumber:'',purchaseId:'',quoteDraft:null,quoteOutcome:'',paymentLinks:[],emailDrafts:[],statusHistory:[],supplierPaidAmount:null});
 for(const key of ['quoteAcceptedDate','productionReleasedDate','expectedDateFrom','expectedDateTo','leadTimeStartDate','approvedDate','supplierOrderedDate','arrivedDate','shippedDate','deliveredDate','supplierPaidDate','expectedDate','supplierOrderReference','confirmationSentDate','invoiceSentDate','designSentDate','quoteSentDate','paymentRequestedDate','productionDate','transitDate'])copy[key]='';
 for(const key of ['websiteLeadId','websiteContacts','websiteLeadLinkedAt','websiteAttribution','analyticsInternal','inquirySourcePage','salesFunnel','gmailSalesPhase','supplierFulfilment','supplierOrderText','packsTracking'])delete copy[key];
 if(original.supplierFulfilment&&copy.documentDrafts?.packing)delete copy.documentDrafts.packing;
 const itemIds=new Map();
 for(const item of copy.items){
  const originalItemId=item.id;if(item.costSource==='supplierInvoiceImport')item.cost=null;delete item.supplierInvoiceImportIds;
  item.id=newId();
  itemIds.set(originalItemId,item.id);
  for(const key of ['costSource','primaryImageId','designId','designDocumentId','designPreviewId','designUpdatedAt','designVariants','designFinalVariantId','designFinalUpdatedAt','designFinalBasis','designFinalChosenAt','costCalculation','calculatedCostTotal','purchaseCostTotal','purchaseCostQuantity','costQuoteLink'])delete item[key];
 }
 for(const row of copy.namedCosts)if(row.itemId)row.itemId=itemIds.get(row.itemId)||'';
 return copy;
}
