import {inquiryProductKeys,specLabels} from './inquiries.js?v=feedback-followup-20261028';

// Keep the inquiry and its customer binding stable across the product editor.
// Product-only edits are intentionally allowed when that editor returns.
export function inquiryEditDataBasis(order){
 return JSON.stringify([order.customerId,order.inquirySpecs||{},order.inquiryNotRequired||[]]);
}

// Only fields used by the inquiry projection; unrelated prices/designs/notes
// need not invalidate an otherwise current inquiry form.
export function inquiryEditProductBasis(order,companyId){
 const keys=[...new Set([...inquiryProductKeys(companyId).map(key=>key==='printing'?'printColors':key),'material','printColors'])];
 return JSON.stringify((order.items||[]).map(item=>[item.id,...keys.map(key=>item[key]??null)]));
}

// A blank field can be a deliberate edit. Untouched derived values must be
// obtained again from the saved products instead of replaying an old snapshot.
export function changedInquiryValues(values,initial){
 return Object.fromEntries(Object.keys(specLabels).filter(key=>Object.hasOwn(values,key)&&String(values[key]??'')!==String(initial[key]??'')).map(key=>[key,values[key]]));
}
