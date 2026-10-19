export const holeFinishes=[['','Nog niet afgesproken'],['none','Geen gaten'],['holes','Met bevestigingsgaten']];
export const surfaceFinishes=[['','Nog niet afgesproken'],['smooth','Glad (niet anti-spray)'],['anti-spray','Anti-spray']];
// Only deliberately confirmed, public production choices. Never copy free-form internal notes.
export function customerExecutionDetails(item,companyId){if(companyId!=='spatlappen')return [];return [holeFinishes.find(([k])=>k===item.holeFinish&&k)?.[1],surfaceFinishes.find(([k])=>k===item.surfaceFinish&&k)?.[1]].filter(Boolean);}
export function readExecutionFields(root,previous={}){const fields={};for(const [key,choices]of [['holeFinish',holeFinishes],['surfaceFinish',surfaceFinishes]]){const input=root.querySelector('[name='+key+']');if(!input)continue;const value=input.value;if(!choices.some(([id])=>id===value))throw Error('Controleer de uitvoering van dit product.');fields[key]=value;}return {...previous,...fields};}
