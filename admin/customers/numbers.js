// Allocate from the saved state inside the same transaction as the customer.
// Keep supplied numbers and never reuse a deleted customer's sequence number.
export function ensureCustomerNumbers(state){
 const used=new Set(state.customers.map(c=>String(c.number??'').trim().toLowerCase()).filter(Boolean));
 const start=Number.isSafeInteger(state.customerNumberStart)&&state.customerNumberStart>0?state.customerNumberStart:1,padding=Number.isInteger(state.customerNumberPadding)&&state.customerNumberPadding>=0&&state.customerNumberPadding<=8?state.customerNumberPadding:4;
 let sequence=Number.isSafeInteger(state.customerSequence)?Math.max(0,state.customerSequence):0;
 sequence=Math.max(sequence,start-1);
 for(const value of used){const match=/^KL-(\d+)$/i.exec(value);if(match&&Number.isSafeInteger(Number(match[1])))sequence=Math.max(sequence,Number(match[1]));}
 let changed=false;
 for(const c of state.customers){
  if(String(c.number??'').trim())continue;
  let number;do{number='KL-'+String(++sequence).padStart(padding,'0');}while(used.has(number.toLowerCase()));
  c.number=number;used.add(number.toLowerCase());changed=true;
 }
 if(state.customerSequence!==sequence){state.customerSequence=sequence;changed=true;}
 return changed;
}
