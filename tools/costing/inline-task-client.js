// Only messages from the actual same-origin parent and a matching task nonce.
// This channel accepts bounded product numbers, never full CRM/customer data.
export function inlineTaskClient({onContext=()=>{}}={}){
 const taskId=new URLSearchParams(location.search).get('taskId');if(window.parent===window||!/^[-a-zA-Z0-9_]{1,100}$/.test(taskId||''))return null;
 let initialized=false;const post=value=>window.parent.postMessage({format:'crm-inline-task',taskId,...value},location.origin);
 const receive=event=>{if(initialized||event.source!==window.parent||event.origin!==location.origin||event.data?.format!=='crm-inline-task'||event.data.taskId!==taskId||event.data.type!=='context')return;initialized=true;const data=event.data.product;const product=data&&typeof data==='object'?Object.fromEntries(['quantity','width','height'].map(k=>[k,Number.isSafeInteger(data[k])&&data[k]>=0&&data[k]<=1000000?data[k]:0])):null;onContext(product);};
 window.addEventListener('message',receive);post({type:'ready'});document.body.classList.add('inline-task-page');
 return {state:({dirty=false,busy=false}={})=>post({type:'state',dirty:!!dirty,busy:!!busy}),cancel:()=>post({type:'cancel'}),complete:({quoteId,pieceId=''})=>post({type:'complete',quoteId,pieceId}),url:(path,params={})=>path+'?'+new URLSearchParams({...params,taskId}),dispose:()=>window.removeEventListener('message',receive)};
}
