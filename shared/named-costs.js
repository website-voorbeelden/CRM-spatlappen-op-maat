export function namedCostSummary(owner){const rows=owner.namedCosts||[];return {total:rows.reduce((sum,c)=>sum+(c.amount??0),0),known:rows.every(c=>c.amount!=null),rows};}
export function validateNamedCosts(owner){
 const rows=owner.namedCosts;if(rows===undefined)return;
 if(!Array.isArray(rows)||rows.length>50||new Set(rows.map(c=>c?.id)).size!==rows.length||rows.some(c=>!c||typeof c.id!=='string'||!/^[-a-z0-9._]{1,160}$/i.test(c.id)||typeof c.label!=='string'||!c.label.trim()||c.label.length>100||c.amount!==null&&(!Number.isSafeInteger(c.amount)||c.amount<0)||c.itemId&&(!Array.isArray(owner.items)||!owner.items.some(i=>i.id===c.itemId))))throw Error('Controleer benoemde kosten: naam, bedrag en productkoppeling moeten geldig zijn.');
 if(!Number.isSafeInteger(rows.reduce((sum,c)=>sum+(c.amount??0),0)))throw Error('De som van benoemde kosten is te groot.');
}
export function setNamedCosts(state,kind,id,expected,rows){
 const owner=(kind==='order'?state.orders:kind==='purchase'?state.purchases:[]).find(o=>o.id===id);if(!owner)throw Error('Dit dossier bestaat niet meer.');
 if(JSON.stringify(owner.namedCosts||[])!==expected)throw Error('De benoemde kosten zijn gewijzigd. Open het overzicht opnieuw.');
 const candidate={...owner,namedCosts:rows};validateNamedCosts(candidate);owner.namedCosts=structuredClone(rows);
}
