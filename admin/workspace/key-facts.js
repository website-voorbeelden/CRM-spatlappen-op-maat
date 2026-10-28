// Shared read-only presentation. Callers supply their existing projections;
// this component does not calculate money or maintain application state.
export function keyFactsMarkup(facts,{esc,label='In één oogopslag',inset=false}={}){
 const columns=Math.min(3,Math.max(1,facts.length));
 const content=facts.map(fact=>{
  const tone=['success','warning'].includes(fact.tone)?fact.tone:'neutral';
  const value=fact.href?`<a href="${esc(fact.href)}">${esc(fact.value)}</a>`:esc(fact.value);
  return `<div class="workspace-key-fact" data-tone="${tone}">
   <dt>${esc(fact.label)}</dt>
   <dd class="workspace-key-value">${value}</dd>
   ${fact.detail?`<dd class="workspace-key-detail">${esc(fact.detail)}</dd>`:''}
  </div>`;
 }).join('');
 return `<dl class="workspace-key-facts${inset?' is-inset':''}" data-columns="${columns}" aria-label="${esc(label)}">${content}</dl>`;
}
