// Read-only guards for an automatically proposed request; no provider access.
export function paymentRequestDay(now=Date.now()){
 const parts=new Intl.DateTimeFormat('en',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
 const value=key=>parts.find(part=>part.type===key).value;return value('year')+'-'+value('month')+'-'+value('day');
}
export function safeTikkieUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='tikkie.me'&&!url.username&&!url.password?url.href:'#';}catch{return '#';}}
export function usableOrderPaymentLink(link,{today=paymentRequestDay(),total}={}){
 if(!link||!Number.isSafeInteger(link.amountInCents)||link.amountInCents<=0||safeTikkieUrl(link.url)==='#'||['CLOSED','EXPIRED','CANCELLED','CANCELED'].includes(String(link.status||'').trim().toUpperCase()))return false;
 if(link.expiryDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(link.expiryDate)||!Number.isFinite(Date.parse(link.expiryDate))||new Date(link.expiryDate).toISOString().slice(0,10)!==link.expiryDate||link.expiryDate<today))return false;
 if(total!==undefined&&link.basisTotal!=null&&link.basisTotal!==total)return false;
 return true;
}
