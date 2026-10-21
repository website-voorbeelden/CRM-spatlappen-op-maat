// The physical product basis of a cost calculation, separate from sale prices.
// Empty optional values compare equally across legacy records and new forms.
export const costingBasisFields=['quantity','width','height','material','thickness'];
export const costingLinkedFields=['description',...costingBasisFields,'price','cost'];
export function sameCostingFields(a,b,keys=costingBasisFields){
 if(!a||!b)return false;
 return keys.every(key=>{
  const normalize=value=>key==='material'?String(value??'').trim().toLowerCase():value===''||value==null?null:value;
  return normalize(a[key])===normalize(b[key]);
 });
}
export function storedCalculationDiffers(item){
 const piece=item.costCalculation?.inputs?.pieces?.[0];if(!piece)return false;
 const basis={...piece,width:piece.shape==='circle'?piece.outerDiameter:piece.width,height:piece.shape==='circle'?piece.outerDiameter:piece.height};
 return !sameCostingFields(item,basis);
}
