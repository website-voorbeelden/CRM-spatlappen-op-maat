// Volatile UI evidence only. No field values, network bodies, console dumps,
// screenshots or browser storage. Saved only with an explicit feedback report.
export function installFeedbackDiagnostics({picking,selectorFor,labelFor}){
 const errors=[],actions=[];
 const route=()=>location.hash.startsWith('#calc=')?'#calc=[berekening niet meegestuurd]':location.hash.slice(0,500);
 const safe=value=>String(value||'').replace(/\/Users\/[^\s:]+/g,'[lokaal pad]').replace(/(?:Bearer\s+|(?:token|password|secret|api[_-]?key)\s*[:=]\s*)\S+/gi,'[afgeschermd]').slice(0,500);
 const attributes=target=>Object.fromEntries([...target.attributes].filter(a=>/^data-(?:action|id|order|order-id|item-id|index|field|stock-id|payment-shipping|stock-action|feedback-action|funnel-action|supplier-fulfilment)$/.test(a.name)).map(a=>[a.name,safe(a.value)]));
 function recordError(message,file='',line=0){errors.push({at:new Date().toISOString(),message:safe(message),file:String(file).split('?')[0].split('/').pop().slice(0,120),line:Number(line)||0});if(errors.length>3)errors.shift();}
 window.addEventListener('error',e=>{if(e.message)recordError(e.message,e.filename,e.lineno);});
 window.addEventListener('crm-feedback-action-error',event=>{const detail=event.detail;if(detail&&typeof detail.message==='string')recordError(detail.message,detail.source);});
 window.addEventListener('unhandledrejection',e=>recordError(e.reason instanceof Error?e.reason.message:'Een achtergrondactie is mislukt.'));
 document.addEventListener('click',event=>{
  if(picking()||!(event.target instanceof Element)||event.target.closest('[data-feedback-ui],[data-feedback-dialog],#feedback-dialog,[data-feedback-action]'))return;
  const target=event.target.closest('button,a,summary,[role="button"]');if(!target)return;
  const row={at:new Date().toISOString(),label:labelFor(target),selector:selectorFor(target),attributes:attributes(target),routeBefore:route(),disabled:target.matches(':disabled,[aria-disabled="true"]'),busy:!!target.closest('[aria-busy="true"],[inert]')};actions.push(row);if(actions.length>3)actions.shift();queueMicrotask(()=>{row.routeAfter=route();});
 },true);
 return target=>({selected:target?{tag:target.tagName.toLowerCase(),attributes:attributes(target),href:target.getAttribute('href')?.startsWith('#calc=')?'#calc=[berekening niet meegestuurd]':target.getAttribute('href')?.startsWith('#')?target.getAttribute('href').slice(0,500):'',disabled:target.matches(':disabled,[aria-disabled="true"]'),busy:!!target.closest('[aria-busy="true"],[inert]')}:null,errors:errors.filter(e=>Date.now()-Date.parse(e.at)<120000),actions:actions.filter(e=>Date.now()-Date.parse(e.at)<120000)});
}

// Call only for caught failures, never for success toasts or field values.
export function recordFeedbackActionError(error,source){
 window.dispatchEvent(new CustomEvent('crm-feedback-action-error',{detail:{message:error instanceof Error?error.message:'De actie is mislukt.',source}}));
}
