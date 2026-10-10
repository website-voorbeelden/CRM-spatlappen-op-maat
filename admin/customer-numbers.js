// Allocate from the saved state inside the same transaction as the customer.
// Keep supplied numbers and never reuse a deleted customer's sequence number.
export function ensureCustomerNumbers(state){
 const used=new Set(state.customers.map(c=>String(c.number??'').trim()).filter(Boolean));
 let sequence=Number.isSafeInteger(state.customerSequence)?Math.max(0,state.customerSequence):0;
 for(const value of used){const match=/^KL-(\d+)$/.exec(value);if(match&&Number.isSafeInteger(Number(match[1])))sequence=Math.max(sequence,Number(match[1]));}
 let changed=false;
 for(const c of state.customers){
  if(String(c.number??'').trim())continue;
  let number;do{number='KL-'+String(++sequence).padStart(4,'0');}while(used.has(number));
  c.number=number;used.add(number);changed=true;
 }
 if(state.customerSequence!==sequence){state.customerSequence=sequence;changed=true;}
 return changed;
}
