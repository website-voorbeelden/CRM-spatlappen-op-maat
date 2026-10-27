// Display which criteria are hidden in a closed filter section. No filtering,
// preferences, business-state writes or new copies of dossier data.
const filled=value=>value!=null&&String(value).trim()!=='';
export function orderExtraFilterLabels(filters,companyId){
 const labels=[];
 if(filters.visibility&&filters.visibility!=='active')labels.push('Archief');
 for(const [key,label] of [['customerId','Klant'],['width','Breedte'],['height','Hoogte'],['quantity','Aantal'],...(companyId==='maatwerkkunststof'?[['material','Materiaal'],['thickness','Dikte']]:[['printColors','Drukkleuren']]),['outcome','Offerte / akkoord'],['from','Vanaf'],['to','Tot en met']])if(filled(filters[key]))labels.push(label);
 if(Number(filters.tolerance)>0&&['width','height','quantity'].some(key=>filled(filters[key])))labels.push('Speling maat / aantal');
 return labels;
}
export function customerExtraFilterLabels(filters){
 return [...(filters.visibility&&filters.visibility!=='active'?['Archief']:[]),...(filled(filters.country)?['Land']:[])];
}
export function extraFilterSummary(labels,fallback){
 return labels.length?'Meer filters · '+labels.length+' actief':fallback;
}
