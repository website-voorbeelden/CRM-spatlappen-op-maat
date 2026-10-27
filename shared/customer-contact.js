// Primary customer contact only. Extra contacts and the order contact choice stay intact.
export const customerContactKeys=['company','contact','email','phone','invoiceEmail'];
export const customerContactSignature=customer=>JSON.stringify(customerContactKeys.map(key=>customer[key]||''));
export function customerContactValues(input){
 const values=Object.fromEntries(customerContactKeys.map(key=>[key,String(input[key]||'').trim()]));
 for(const key of customerContactKeys)if(values[key].length>(key==='phone'?100:200))throw Object.assign(Error('Dit contactveld is te lang.'),{field:key});
 if(!values.company)throw Object.assign(Error('Vul een klantnaam in.'),{field:'company'});
 for(const key of ['email','invoiceEmail'])if(values[key]&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values[key]))throw Object.assign(Error('Vul een geldig e-mailadres in.'),{field:key});
 return values;
}
export function updateCustomerContact(state,customerId,expected,input,{orderId=''}={}){
 const customer=state.customers.find(c=>c.id===customerId);
 if(!customer||orderId&&state.orders.find(o=>o.id===orderId)?.customerId!==customerId)throw Error('De klantkoppeling is intussen gewijzigd. Open de actuele gegevens opnieuw.');
 const values=customerContactValues(input);let original;try{original=JSON.parse(expected);}catch{throw Error('De oorspronkelijke contactgegevens ontbreken. Open opnieuw.');}
 if(!Array.isArray(original)||original.length!==customerContactKeys.length||original.some(value=>typeof value!=='string'))throw Error('De oorspronkelijke contactgegevens ontbreken. Open opnieuw.');
 const changes=customerContactKeys.filter((key,index)=>values[key]!==original[index]);
 for(const key of changes)if((customer[key]||'')!==original[customerContactKeys.indexOf(key)])throw Error('Een contactveld dat je wilt wijzigen is intussen door iemand anders aangepast. Ga terug en open de actuele gegevens opnieuw. Je mail blijft behouden.');
 for(const key of changes)customer[key]=values[key];
 return {...Object.fromEntries(customerContactKeys.map(key=>[key,customer[key]||''])),changed:changes.length>0};
}
