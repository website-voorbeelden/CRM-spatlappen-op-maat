export function changeCustomerNumber(state,id,number,expected){
 const c=state.customers.find(c=>c.id===id);if(!c)throw Error('Deze klant bestaat niet meer.');
 if((c.number||'')!==expected)throw Error('Het klantnummer is intussen gewijzigd. Open de keuze opnieuw.');
 number=String(number||'').trim();if(!/^[a-z0-9][a-z0-9._/-]{0,39}$/i.test(number))throw Error('Gebruik een klantnummer van 1–40 letters/cijfers, met eventueel punt, streep of schuine streep.');
 if(state.customers.some(other=>other.id!==id&&String(other.number||'').trim().toLowerCase()===number.toLowerCase()))throw Error('Dit klantnummer is al in gebruik.');
 c.number=number;
}
export function setCustomerNumberPreferences(state,{start,padding},expected){
 if(JSON.stringify([state.customerNumberStart??1,state.customerNumberPadding??4])!==expected)throw Error('De nummerinstellingen zijn gewijzigd. Open de keuze opnieuw.');
 if(!Number.isSafeInteger(start)||start<1||start>999999999||!Number.isInteger(padding)||padding<0||padding>8)throw Error('Kies een startnummer van 1–999999999 en 0–8 posities.');
 state.customerNumberStart=start;state.customerNumberPadding=padding;
}
