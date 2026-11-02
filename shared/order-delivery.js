// One delivery source for the order, customer synchronisation and PACKS proposal.
export const deliveryEditBasis=(state,order)=>JSON.stringify([order,state.customers.find(c=>c.id===order.customerId),state.orders.filter(o=>o.customerId===order.customerId).map(o=>o.id).sort()]);
export const deliveryCountryCode=value=>{const s=String(value||'').trim();return /^[a-z]{2}$/i.test(s)?s.toUpperCase():({nederland:'NL',netherlands:'NL','the netherlands':'NL',belgië:'BE',belgie:'BE',belgium:'BE',duitsland:'DE',germany:'DE'})[s.toLowerCase()]||'';};
export const deliveryFieldLimits={street:50,number:50,numberExt:50,zip:10,place:50,country:2};
export const deliveryAddressText=fields=>[[fields.street,fields.number,fields.numberExt].filter(Boolean).join(' '),[fields.zip,fields.place].filter(Boolean).join(' ')].filter(Boolean).join('\n');
const normal=value=>String(value||'').trim().replace(/\s+/g,' ').toLowerCase();
export function validateStructuredDelivery(delivery){
 const fields=delivery.structuredAddress;if(fields===undefined)return;
 if(!fields||typeof fields!=='object'||Array.isArray(fields)||Object.keys(fields).length!==Object.keys(deliveryFieldLimits).length||Object.keys(fields).some(k=>!Object.hasOwn(deliveryFieldLimits,k)))throw Error('Controleer de losse afleveradresvelden.');
 for(const [key,max] of Object.entries(deliveryFieldLimits))if(typeof fields[key]!=='string'||fields[key].length>max||/[\x00-\x1f\x7f]/.test(fields[key])||(key!=='numberExt'&&!fields[key].trim()))throw Error('Controleer het adresveld '+key+'.');
 if(fields.country==='NL'&&!/^[1-9]\d{3}\s?[A-Z]{2}$/i.test(fields.zip))throw Object.assign(Error('Controleer de Nederlandse postcode.'),{field:'address_zip'});
 if(!/^[A-Z]{2}$/.test(fields.country)||deliveryCountryCode(delivery.country)!==fields.country||normal(deliveryAddressText(fields))!==normal(delivery.address))throw Error('Het afleveradres en de losse adresvelden verschillen. Controleer het adres opnieuw.');
}
export function deliveryAddressProposal(data){
 const country=deliveryCountryCode(data.country),empty={street:'',number:'',numberExt:'',zip:'',place:'',country};
 if(data.structuredAddress){try{validateStructuredDelivery(data);return {fields:{...data.structuredAddress},source:'automatic',complete:true};}catch{/* Never reuse an old split after the free address changed. */}}
 let raw=String(data.address||'').trim(),code=country;const rows=raw.split(/\r?\n|\s*,\s*/).map(s=>s.trim()).filter(Boolean);
 const lastCode=deliveryCountryCode(rows.at(-1));if(lastCode&&rows.length>1){if(code&&code!==lastCode)return {fields:empty,source:'interpretation',complete:false};code=lastCode;rows.pop();}
 if(rows.length>2)return {fields:{...empty,country:code},source:'interpretation',complete:false};
 raw=rows.join(' ');const suffix=raw.match(/\s+(Nederland|Netherlands|België|Belgie|Belgium|Duitsland|Germany|NL|BE|DE)$/i);if(suffix){const explicit=deliveryCountryCode(suffix[1]);if(!code||code===explicit){code=explicit;raw=raw.slice(0,suffix.index).trim();}}const postal=code==='NL'?raw.match(/^(.+?)\s+([1-9]\d{3})\s?([A-Za-z]{2})\s+(.+)$/):code==='BE'?raw.match(/^(.+?)\s+(\d{4})\s+(.+)$/):code==='DE'?raw.match(/^(.+?)\s+(\d{5})\s+(.+)$/):null;
 if(!postal)return {fields:{...empty,country:code},source:'interpretation',complete:false};
 const street=postal[1].trim().match(/^(.+?)\s+(\d+)(?:\s*(.+))?$/);if(!street)return {fields:{...empty,country:code},source:'interpretation',complete:false};
 const fields={street:street[1].trim(),number:street[2],numberExt:street[3]?.trim()||'',zip:code==='NL'?postal[2]+' '+postal[3].toUpperCase():postal[2],place:(code==='NL'?postal[4]:postal[3]).trim(),country:code};
 try{validateStructuredDelivery({address:deliveryAddressText(fields),country:code,structuredAddress:fields});}catch{return {fields:{...empty,country:code},source:'interpretation',complete:false};}
 return {fields,source:'interpretation',complete:true};
}
export function applyOrderDelivery(state,id,input,expected){
 const order=state.orders.find(o=>o.id===id);if(!order||!expected||deliveryEditBasis(state,order)!==expected)throw Error('Deze order, klant of adreskoppeling is intussen gewijzigd. Je invoer blijft staan; open het actuele adres opnieuw.');
 const delivery={source:'custom',...Object.fromEntries(['recipient','country','address','instructions'].map(key=>[key,String(input[key]||'').trim()])),...(input.structuredAddress?{structuredAddress:{...input.structuredAddress}}:{})};
 validateStructuredDelivery(delivery);order.delivery=delivery;
 const customer=state.customers.find(c=>c.id===order.customerId);
 if(customer&&state.orders.filter(o=>o.customerId===customer.id).length===1)Object.assign(customer,{shippingAddress:delivery.address,shippingRecipient:delivery.recipient,shippingCountry:delivery.country,shippingAddressOrderId:order.id});
 return delivery;
}
export function validateOrderDeliveries(state){for(const order of state.orders)if(order.delivery?.structuredAddress!==undefined)validateStructuredDelivery(order.delivery);}
