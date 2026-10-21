export function gmailLabels(data){
 if(!Array.isArray(data?.labels)||data.labels.length>10000)throw Error('Gmail gaf geen geldige labellijst.');
 return data.labels.filter(label=>label?.type==='user'&&typeof label.id==='string'&&/^[-a-zA-Z0-9_]{1,200}$/.test(label.id)&&typeof label.name==='string'&&label.name.length<=500).map(label=>({id:label.id,name:label.name}));
}
// No guessing from subject/body, no "highest stage wins" when labels conflict.
export function gmailPhaseSuggestions(labels,companyId){
 if(companyId!=='maatwerkkunststof')return [];
 const phases=['new','welcome','specs','pricing','indication','quote','received','production','delivered'];
 return [...new Set(labels.flatMap(label=>{const match=label.name?.match(/^Verkoopfase\/0([0-8])(?:\s|$)/i);return match?[phases[Number(match[1])]]:[];}))];
}
