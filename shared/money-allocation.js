// Deterministic whole-cent allocation. Never changes the source amounts.
export function allocateCents(amount,rows){
 if(!Number.isSafeInteger(amount)||amount<0)throw Error('Ongeldig te verdelen bedrag.');
 if(!rows.length)return new Map();
 if(new Set(rows.map(r=>r.id)).size!==rows.length||rows.some(r=>!Number.isFinite(r.weight)||r.weight<0))throw Error('Ongeldige verdeelbasis.');
 const sum=rows.reduce((n,r)=>n+r.weight,0),denominator=sum||rows.length;
 const values=rows.map(r=>{const raw=amount*(sum?r.weight:1)/denominator;return {...r,value:Math.floor(raw),rest:raw-Math.floor(raw)};});
 const remainder=amount-values.reduce((n,r)=>n+r.value,0);
 if(!Number.isSafeInteger(remainder)||remainder<0||remainder>rows.length)throw Error('Deze verdeelbasis is te groot of onvoldoende nauwkeurig. Controleer de bedragen.');
 [...values].sort((a,b)=>b.rest-a.rest||String(a.id).localeCompare(String(b.id))).slice(0,remainder).forEach(r=>r.value++);
 return new Map(values.map(r=>[r.id,r.value]));
}
