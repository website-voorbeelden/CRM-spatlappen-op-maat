import {gmailPhaseSuggestions} from '../../shared/gmail-labels.js';
import {funnelPhaseLabel,salesFunnel} from '../../shared/sales-funnel.js?v=maat-cleanup-20261021';
// Read only, on an explicit click. Phase changes use the existing reviewed form.
export function installGmailLabelReview(host,{thread,orderId,request,company,getState}){
 if(!thread?.mailbox||!thread?.threadId)return;
 const button=document.createElement('button'),box=document.createElement('div');
 button.type='button';button.textContent='Huidige Gmail-labels bekijken';box.setAttribute('role','status');host.append(button,box);
 button.onclick=async()=>{
  button.disabled=true;box.textContent='Gmail-labels lezen...';
  try{
   const catalog=await request('labels',{mailbox:thread.mailbox}),fresh=await request('thread',{mailbox:thread.mailbox,threadId:thread.threadId});
   if(catalog.mailbox!==thread.mailbox||fresh.mailbox!==thread.mailbox||fresh.threadId!==thread.threadId)throw Error('De mailbox of het gesprek is gewijzigd.');
   const ids=new Set((fresh.messages||[]).flatMap(message=>message.labelIds||[])),labels=catalog.labels.filter(label=>ids.has(label.id));
   box.textContent=labels.length?'Gmail: '+labels.map(label=>label.name).join(' · '):'Geen eigen Gmail-labels bij deze berichten.';
   const current=getState?.().orders.find(o=>o.id===orderId),phase=current?salesFunnel(getState(),current,company.id).displayPhase:null,phases=gmailPhaseSuggestions(labels,company.id).filter(candidate=>candidate!==phase);
   if(orderId&&phases.length){
    const note=document.createElement('p');note.className='form-help';
    note.textContent=phases.length>1?'Meerdere verkoopfases gevonden. Kies welke klopt; niets wordt automatisch overgenomen.':'Deze fase komt uit Gmail. Controleer vóór overnemen; een label is geen bewijs van betaling of verzending.';box.append(note);
    for(const phase of phases){const action=document.createElement('button');action.type='button';action.dataset.funnelAction='phase';action.dataset.id=orderId;action.dataset.funnelPhase=phase;action.textContent=funnelPhaseLabel(phase,company.id)+' controleren →';box.append(action);}
   }
  }catch(error){box.textContent=error.message;}
  finally{button.disabled=false;}
 };
}
