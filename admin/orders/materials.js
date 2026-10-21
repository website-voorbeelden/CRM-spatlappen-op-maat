import {costingBasisFields,sameCostingFields} from '../../shared/costing-product.js';
// Warn in the edited row. Financial values only change through the existing
// explicit order-save transaction; the original calculation remains stored.
export function installCostingBasisNotice(root,{getOriginal,getBasis}){
 for(const element of root.querySelectorAll('#items .item')){
  if(element.dataset.costingBasisNotice)continue;
  element.dataset.costingBasisNotice='true';
  const notice=element.querySelector('[data-costing-basis-notice]');if(!notice)continue;
  const update=()=>{
   const previous=getOriginal(element),current={};
   for(const key of costingBasisFields){const input=element.querySelector('[name="'+key+'"]');current[key]=key==='material'?input?.value.trim()||'':!input||input.disabled||input.value===''?null:Number(input.value);}
   const changed=previous?.costSource==='calculator'&&!sameCostingFields(current,previous)&&!sameCostingFields(current,getBasis(element));
   notice.hidden=!changed;
   notice.textContent=changed?'Productgegevens gewijzigd. De oude berekende kostprijs vervalt bij opslaan. Bereken opnieuw of vul bewust een nieuwe inkoopprijs in. Je eerdere berekening blijft bewaard.':'';
  };
  element.addEventListener('input',update);element.addEventListener('change',update);
 }
}
