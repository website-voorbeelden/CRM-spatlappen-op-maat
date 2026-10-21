export const holeFinishes=[['','Nog niet afgesproken'],['none','Geen gaten'],['holes','Met bevestigingsgaten']];
export const surfaceFinishes=[['','Nog niet afgesproken'],['smooth','Glad (niet anti-spray)'],['anti-spray','Anti-spray']];
// Only deliberately confirmed, public production choices. Never copy free-form internal notes.
export function productThickness(item){return typeof item?.thickness==='number'&&Number.isFinite(item.thickness)&&item.thickness>0&&item.thickness<=1000000?item.thickness:null;}
export function publicProductSpecifications(item,companyId){return companyId==='maatwerkkunststof'?{material:typeof item.material==='string'?item.material.trim().slice(0,200):'',thickness:productThickness(item)}:{};}
export const thicknessText=value=>new Intl.NumberFormat('nl-NL',{maximumSignificantDigits:15,useGrouping:false}).format(value);
export function customerExecutionDetails(item,companyId){if(companyId==='maatwerkkunststof'){const fields=publicProductSpecifications(item,companyId);return [fields.material?'Materiaal: '+fields.material:'',fields.thickness!=null?'Dikte: '+thicknessText(fields.thickness)+' mm':''].filter(Boolean);}if(companyId!=='spatlappen')return [];return [holeFinishes.find(([k])=>k===item.holeFinish&&k)?.[1],surfaceFinishes.find(([k])=>k===item.surfaceFinish&&k)?.[1]].filter(Boolean);}
export function missingProductThickness(items,companyId){return companyId==='maatwerkkunststof'?items.map((item,index)=>({item,index})).filter(({item})=>productThickness(item)==null):[];}
export function customerProductDetails(item,details,companyId,{requireThickness=false}={}){
 if(companyId!=='maatwerkkunststof')return details;
 if(requireThickness&&productThickness(item)==null)throw Error('De dikte ontbreekt bij '+(item.description||'dit product')+'. Vul de dikte in millimeters in bij de order.');
 const fields=publicProductSpecifications(item,companyId),extra=details.filter(line=>!(fields.thickness!=null&&/^\s*dikte\s*:/i.test(line))&&!(fields.material&&/^\s*materiaal\s*:/i.test(line)));
 return [...new Set([...extra.slice(0,1),...customerExecutionDetails(item,companyId),...extra.slice(1)].filter(Boolean))];
}
export function readExecutionFields(root,previous={}){const fields={};for(const [key,choices]of [['holeFinish',holeFinishes],['surfaceFinish',surfaceFinishes]]){const input=root.querySelector('[name='+key+']');if(!input)continue;const value=input.value;if(!choices.some(([id])=>id===value))throw Error('Controleer de uitvoering van dit product.');fields[key]=value;}return {...previous,...fields};}
