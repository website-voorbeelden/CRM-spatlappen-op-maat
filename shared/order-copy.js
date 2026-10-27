// A new order keeps product specifications, never another dossier's files or
// approval. Copying artwork between orders requires its own explicit workflow.
export function copyOrder(original,{number,date,stage,newId}){
 const copy=structuredClone(original);
 Object.assign(copy,{id:newId(),number,date,stage,archived:false,sourceNumber:'',purchaseId:'',quoteDraft:null,quoteOutcome:'',paymentLinks:[],emailDrafts:[],statusHistory:[],supplierPaidAmount:null});
 for(const key of ['quoteAcceptedDate','productionReleasedDate','expectedDateFrom','expectedDateTo','leadTimeStartDate','approvedDate','supplierOrderedDate','arrivedDate','shippedDate','deliveredDate','supplierPaidDate','expectedDate','supplierOrderReference','confirmationSentDate','invoiceSentDate','designSentDate','quoteSentDate','paymentRequestedDate','productionDate','transitDate'])copy[key]='';
 for(const key of ['websiteLeadId','websiteContacts','websiteLeadLinkedAt','websiteAttribution','analyticsInternal','inquirySourcePage','salesFunnel','gmailSalesPhase'])delete copy[key];
 for(const item of copy.items){
  item.id=newId();
  for(const key of ['costSource','primaryImageId','designId','designDocumentId','designPreviewId','designUpdatedAt','designVariants','designFinalVariantId','designFinalUpdatedAt','designFinalBasis','designFinalChosenAt','costCalculation','calculatedCostTotal','purchaseCostTotal','purchaseCostQuantity','costQuoteLink'])delete item[key];
 }
 return copy;
}
