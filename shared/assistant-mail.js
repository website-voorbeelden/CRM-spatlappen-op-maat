const id=v=>typeof v==='string'&&/^[-a-zA-Z0-9._]{1,160}$/.test(v);
function target(snapshot,entity,ownerId){if(!['customer','order'].includes(entity)||!id(ownerId))throw Error('Kies een bestaande klant of order voor deze mail.');const record=(entity==='order'?snapshot.orders:snapshot.customers).find(r=>r.id===ownerId),customer=entity==='order'?snapshot.customers.find(c=>c.id===record?.customerId):record;if(!record||!customer)throw Error('Dit dossier bestaat niet in dit bedrijf.');return {record,customer};}
const fingerprint=({record,customer})=>JSON.stringify([record,customer]);
export function prepareAssistantMail(snapshot,input,companyId,{now=Date.now(),uuid=()=>crypto.randomUUID()}={}){
 if(snapshot.companyId!==companyId||!input||Object.keys(input).some(k=>!['entity','ownerId','subject','body','kind'].includes(k)))throw Error('Ongeldig mailvoorstel of ander bedrijf.');
 const current=target(snapshot,input.entity,input.ownerId);if(!['general','invoice'].includes(input.kind)||input.kind==='invoice'&&input.entity!=='order')throw Error('Een factuurmail hoort bij een bestaande order.');
 if(typeof input.subject!=='string'||!input.subject.trim()||input.subject.length>200||/[\r\n\0]/.test(input.subject)||typeof input.body!=='string'||!input.body.trim()||input.body.length>30000||/[\0\x01-\x08\x0b\x0c\x0e-\x1f]/.test(input.body))throw Error('Vul een geldig onderwerp en een volledige, begrensde mailtekst in.');
 return {format:'crm-assistant-mail',id:uuid(),companyId,entity:input.entity,ownerId:input.ownerId,subject:input.subject.trim(),body:input.body.trim(),kind:input.kind,baseline:fingerprint(current),createdAt:now,expiresAt:now+30*60000};
}
export function reviewAssistantMail(snapshot,proposal,companyId,{now=Date.now()}={}){
 if(proposal?.format!=='crm-assistant-mail'||!id(proposal.id)||proposal.companyId!==companyId||!Number.isFinite(proposal.expiresAt)||proposal.expiresAt<now)throw Error('Dit mailvoorstel is verlopen of hoort bij een ander bedrijf.');
 const clean=prepareAssistantMail(snapshot,{entity:proposal.entity,ownerId:proposal.ownerId,subject:proposal.subject,body:proposal.body,kind:proposal.kind},companyId,{now,uuid:()=>proposal.id});if(clean.baseline!==proposal.baseline)throw Error('Dit dossier is intussen gewijzigd. Vraag een bijgewerkt mailvoorstel; de oude tekst is niet automatisch overgenomen.');
 const {record,customer}=target(snapshot,proposal.entity,proposal.ownerId);return {ownerId:record.id,kind:proposal.kind,to:proposal.kind==='invoice'?customer.invoiceEmail||customer.email||'':customer.email||'',subject:proposal.subject,body:proposal.body};
}
