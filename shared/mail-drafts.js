import {replyReferences,validMessageId} from './mail-reply.js';
import {validProvenance} from './provenance.js';
import {mailOwner,emailAddresses,assertMailStorage} from './mail-inbox.js?v=workspace-search-20261017';
import {checkMailText} from './mail-templates.js';
import {formProblem} from '../admin/form-guidance.js';
const validId=v=>typeof v==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(v);
export function prepareQuickReplyDraft(state,ownerId,input,{uid=()=>crypto.randomUUID(),now=new Date().toISOString()}={}){
 if(input.provenance!==undefined&&!validProvenance(input.provenance))throw Error('Ongeldige herkomstmarkering.');const owner=mailOwner(state,ownerId);if(!owner)throw Error('Dit dossier bestaat niet meer.');
 const previous=input.draftId?owner.record.emailDrafts?.find(d=>d.id===input.draftId):null;
 if(input.draftId&&(!previous||previous.status!=='draft'))throw Error('Dit concept is verwijderd of al aangeboden. Open het gesprek opnieuw.');
 if(previous&&input.draftBaseline!==JSON.stringify(previous))throw Error('Dit concept is ondertussen gewijzigd. Open het bewaarde concept opnieuw. Je getypte tekst blijft staan.');
 const to=String(input.to||'').trim(),subject=String(input.subject||'').trim(),body=String(input.body||'').trim();
 if(emailAddresses(to).length!==1||emailAddresses(to)[0]!==to.toLowerCase()||/[\s\r\n\0]/.test(to))throw formProblem('Vul één geldig klantadres in.',{field:'to'});
 checkMailText(subject,body);if((input.funnelPurpose??previous?.funnelPurpose)==='indication'&&body.includes('[Prijs en uitgangspunten invullen]'))throw formProblem('Vul eerst de prijs en uitgangspunten in.',{field:'body'});
 const documentId=input.documentId??previous?.documentId??'',paymentLinkId=input.paymentLinkId??previous?.paymentLinkId??'',gmailThreadId=input.gmailThreadId??previous?.gmailThreadId??'',gmailMailbox=input.gmailMailbox??previous?.gmailMailbox??'',replyMessageId=input.replyMessageId??previous?.replyMessageId??'';
 if(documentId&&!state.documents.some(d=>d.id===documentId&&d.ownerId===ownerId))throw Error('De eerdere bijlage ontbreekt. Open Uitgebreid bericht / bijlage om dit te herstellen.');
 if(paymentLinkId&&!owner.record.paymentLinks?.some(l=>l.id===paymentLinkId))throw Error('De eerdere betaallink ontbreekt. Open Uitgebreid bericht / bijlage om dit te herstellen.');
 if(replyMessageId&&!validMessageId(replyMessageId))throw Error('De antwoordheader is ongeldig. Open het gesprek opnieuw.');
 if(gmailThreadId&&(!/^[a-fA-F0-9]{1,100}$/.test(gmailThreadId)||emailAddresses(gmailMailbox)[0]!==gmailMailbox.toLowerCase()||/[\s\r\n\0]/.test(gmailMailbox)))throw Error('Ongeldige Gmail-gesprekskoppeling.');
 const linked=state.mailThreads?.find(t=>t.mailbox===gmailMailbox&&t.gmailThreadId===gmailThreadId);if(linked&&(linked.customerId!==owner.customer.id||linked.orderId!==(owner.order?ownerId:'')))throw Error('Dit gesprek hoort ondertussen bij een ander dossier. Koppel het eerst aan het juiste dossier.');
 const attachmentIds=input.attachmentIds??previous?.attachmentIds??[];if(!Array.isArray(attachmentIds)||attachmentIds.length>5||new Set(attachmentIds).size!==attachmentIds.length||attachmentIds.some(id=>!validId(id)||!state.documents.some(d=>d.id===id&&d.ownerId===ownerId)))throw Error('Een extra bijlage ontbreekt. Open het volledige bericht om dit te herstellen.');
 const id=previous?.id||uid(),mailRequestId=previous?.mailRequestId||uid();if(!validId(id)||!validId(mailRequestId))throw Error('Ongeldig concept-ID.');
 return {...previous,...(input.provenance?{provenance:structuredClone(input.provenance)}:{}),id,mailRequestId,to,subject,body,sender:input.sender||previous?.sender||'',documentId,paymentLinkId,templateId:input.templateId||previous?.templateId||'',funnelPurpose:input.funnelPurpose??previous?.funnelPurpose??'',replyMessageId,references:replyReferences(input.references??previous?.references,replyMessageId),attachmentIds,gmailThreadId,gmailMailbox,conversationId:gmailThreadId||(input.replyMessageId===''?id:previous?.conversationId||id),updatedAt:now,status:'draft'};
}
export function saveQuickReplyDraft(state,ownerId,input,options={}){const draft=prepareQuickReplyDraft(state,ownerId,input,options),next=structuredClone(state),record=mailOwner(next,ownerId).record;record.emailDrafts??=[];const i=record.emailDrafts.findIndex(d=>d.id===draft.id);if(i<0)record.emailDrafts.push(draft);else record.emailDrafts[i]=draft;assertMailStorage(next);Object.assign(state,next);return draft;}
