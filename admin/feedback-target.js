// Shared control identity for CRM and calculator feedback. Never reads values.
const plain=value=>String(value||'').replace(/\s+/g,' ').trim().slice(0,250);
const attributes=['data-action','data-id','data-order','data-order-id','data-item-id','data-index','data-field','data-stock-id','data-payment-shipping','data-stock-action','data-feedback-action','data-funnel-action','name','role'];
export function feedbackTarget(node){
 const direct=node.closest('button,a,input,select,textarea,label,[role="button"],[role="tab"],summary');if(direct)return direct;
 const controls=node.querySelectorAll('button,a,[role="button"]');if(controls.length===1)return controls[0];
 return node.closest('p,h1,h2,h3,td,.cost-detail-row,.payment-entry,.card')||node;
}
export function feedbackLabel(element){
 const label=element.labels?.[0]||element.closest('label'),text=label?[...label.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join(' '):'';
 return plain(element.getAttribute('aria-label')||text||element.getAttribute('title')||(['INPUT','TEXTAREA','SELECT'].includes(element.tagName)?element.getAttribute('name')||element.getAttribute('placeholder'):element.textContent));
}
export function feedbackSelector(element){
 const parts=[];
 for(let node=element;node&&parts.length<8;node=node.parentElement){
  if(node.id){parts.unshift('#'+CSS.escape(node.id));break;}
  let part=node.tagName.toLowerCase();for(const key of attributes)if(node.hasAttribute(key))part+='['+key+'="'+CSS.escape(node.getAttribute(key))+'"]';
  const siblings=node.parentElement?[...node.parentElement.children].filter(other=>other.tagName===node.tagName):[];
  if(siblings.length>1)part+=':nth-of-type('+(siblings.indexOf(node)+1)+')';
  parts.unshift(part);
 }
 return parts.join(' > ');
}
