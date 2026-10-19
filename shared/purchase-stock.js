import {inventoryOf,inventoryChange,orderStockCount,cancelledCount} from './inventory.js?v=workspace-search-20261017';
const signature=rows=>JSON.stringify(rows);
export function purchaseStockLines(state,purchaseId){
 if(!state.purchases?.some(p=>p.id===purchaseId))throw Error('Deze inkoopbestelling bestaat niet meer.');
 const v=inventoryOf(state);
 return state.orders.filter(o=>o.purchaseId===purchaseId&&!o.archived).flatMap(o=>o.items.filter(i=>i.productionSource!=='local').map(i=>{
 const specs={...(o.items.length===1?o.inquirySpecs:{}),...i};
 return {orderId:o.id,itemId:i.id,number:o.sourceNumber||o.number,description:i.description,quantity:i.quantity,needed:i.quantity-orderStockCount(v,o.id,i.id),width:i.width??null,height:i.height??null,diameter:specs.diameter??null,thickness:specs.thickness??null,material:specs.material||'',color:specs.color||''};
 }));
}
export function purchaseStockPreview(state,{purchaseId,lines,totalQuantity}){
 if(!Array.isArray(lines)||!lines.length)throw Error('Vink eerst de klantproducten aan die je samen bestelt.');
 const available=purchaseStockLines(state,purchaseId),selected=lines.map(ref=>available.find(r=>r.orderId===ref.orderId&&r.itemId===ref.itemId));
 if(selected.some(r=>!r)||new Set(selected.map(r=>r.orderId+':'+r.itemId)).size!==selected.length)throw Error('De geselecteerde orderregels zijn gewijzigd of dubbel gekozen.');
 if(selected.some(r=>!Number.isSafeInteger(r.needed)||r.needed<1))throw Error('Een geselecteerde orderregel is al uit voorraad geleverd of heeft geen geldig aantal.');
 const first=selected[0],keys=['width','height','diameter','thickness','material','color'];
 if(!((first.diameter>0)||(first.width>0&&first.height>0)))throw Error('Vul eerst de maten bij de klantorder in.');
 if(selected.some(r=>keys.some(k=>String(r[k]??'').toLowerCase()!==String(first[k]??'').toLowerCase())))throw Error('Deze regels verschillen in maat, materiaal, kleur of dikte. Maak hiervoor aparte inkoopverdelingen.');
 const customerQuantity=selected.reduce((n,r)=>n+r.needed,0);
 if(!Number.isSafeInteger(totalQuantity)||totalQuantity<=customerQuantity||totalQuantity>1e9)throw Error('Vul het totale bestelde aantal in, groter dan '+customerQuantity+' stuks voor klanten.');
 const v=inventoryOf(state);
 if(v.incoming.some(r=>r.purchaseId===purchaseId&&r.quantity>cancelledCount(v,r.id)&&r.purchaseSplit?.lines.some(old=>selected.some(row=>row.orderId===old.orderId&&row.itemId===old.itemId))))throw Error('Voor een van deze regels is al een inkoopverdeling opgeslagen. Bekijk de bestaande verdeling bij deze inkoopbestelling.');
 return {selected,customerQuantity,totalQuantity,surplus:totalQuantity-customerQuantity,basis:signature(selected),specs:Object.fromEntries(keys.map(k=>[k,first[k]]))};
}
export function planPurchaseSurplus(state,revision,action,options){
 const preview=purchaseStockPreview(state,action);
 if(preview.basis!==action.basis)throw Error('De klantorders zijn intussen gewijzigd. Controleer de verdeling opnieuw.');
 const next=structuredClone(state);let stockId=action.stockId;
 if(stockId){const stock=inventoryOf(next).items.find(i=>i.id===stockId);if(!stock)throw Error('Kies een bestaand voorraadartikel.');if(['width','height','diameter','thickness','material','color'].some(k=>String(stock[k]??'').toLowerCase()!==String(preview.specs[k]??'').toLowerCase()))throw Error('Het voorraadartikel wijkt af van de gekozen maten of specificaties. Maak een apart blanco artikel.');}
 else{const s=preview.specs;inventoryChange(next,revision,{type:'create',...s,name:action.name||('Blanco '+(s.diameter?'Ø '+s.diameter:s.width+' × '+s.height)+' mm'),notes:'Blanco / onbedrukt. Controleer overige uitvoeringsdetails voor gebruik.',location:action.location||'',isStandard:false},options);stockId=next.inventory.items.at(-1).id;revision=next.inventory.revision;}
 inventoryChange(next,revision,{type:'plan',stockId,quantity:preview.surplus,purchaseId:action.purchaseId,reference:action.reference||'',note:'Inkoopverdeling: '+preview.totalQuantity+' besteld, '+preview.customerQuantity+' voor klantorders, '+preview.surplus+' blanco voor voorraad.'},options);
 const incoming=next.inventory.incoming.at(-1);incoming.purchaseSplit={totalQuantity:preview.totalQuantity,customerQuantity:preview.customerQuantity,lines:preview.selected.map(r=>({orderId:r.orderId,itemId:r.itemId,quantity:r.needed})),basis:preview.basis};
 state.inventory=next.inventory;state.activities=next.activities;return incoming;
}
