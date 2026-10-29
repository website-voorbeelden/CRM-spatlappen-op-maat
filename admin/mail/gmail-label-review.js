import {gmailPhaseSuggestions} from '../../shared/gmail-labels.js';
import {funnelPhaseLabel,salesFunnel} from '../../shared/sales-funnel.js?v=feedback29-batch3-followup';
// Read only, on an explicit click. Phase changes use the existing reviewed form.
export function installGmailLabelReview(host,{thread,orderId,request,company,getState}){
 if(!thread?.mailbox||!thread?.threadId)return;
 const mailbox=thread.mailbox,threadId=thread.threadId;
 const button=document.createElement('button'),box=document.createElement('div');
 button.type='button';button.textContent='Huidige Gmail-labels bekijken';box.setAttribute('role','status');host.append(button,box);
 let busy=false;
 button.onclick=async()=>{
  if(busy)return;
  busy=true;button.disabled=true;box.textContent='Gmail-labels lezen…';
  const owner=getState?.().orders.find(order=>order.id===orderId),customerId=owner?.customerId;
  try{
   const catalog=await request('labels',{mailbox}),fresh=await request('thread',{mailbox,threadId});
   if(!host.isConnected)return;
   if(catalog.mailbox!==mailbox||fresh.mailbox!==mailbox||fresh.threadId!==threadId)throw Error('De mailbox of het gesprek is gewijzigd.');
   if(!Array.isArray(catalog.labels)||!Array.isArray(fresh.messages))throw Error('Gmail gaf geen bruikbare labels terug. Probeer opnieuw.');
   const ids=new Set(fresh.messages.flatMap(message=>message.labelIds||[])),labels=catalog.labels.filter(label=>ids.has(label.id));
   box.textContent=labels.length?'Gmail: '+labels.map(label=>label.name).join(' · '):'Geen eigen Gmail-labels bij deze berichten.';
   const state=getState?.(),current=state?.orders.find(order=>order.id===orderId);
   if(orderId&&(!owner||!current||current.customerId!==customerId)){box.append(document.createTextNode(' Het dossier is gewijzigd. Open het gesprek opnieuw voordat je een fase overneemt.'));return;}
   const phase=current?salesFunnel(state,current,company.id).displayPhase:null,phases=gmailPhaseSuggestions(labels,company.id).filter(candidate=>candidate!==phase);
   if(orderId&&phases.length){
    const note=document.createElement('p');note.className='form-help';
    note.textContent=phases.length>1?'Meerdere verkoopfases gevonden. Kies welke klopt; niets wordt automatisch overgenomen.':'Deze fase komt uit Gmail. Controleer vóór overnemen; een label is geen bewijs van betaling of verzending.';box.append(note);
    for(const phase of phases){const action=document.createElement('button');action.type='button';action.dataset.funnelAction='phase';action.dataset.id=orderId;action.dataset.funnelPhase=phase;action.textContent=funnelPhaseLabel(phase,company.id)+' controleren →';box.append(action);}
   }
  }catch(error){if(host.isConnected)box.textContent=error.message||'Gmail-labels lezen lukt niet. Probeer opnieuw.';}
  finally{busy=false;button.disabled=false;}
 };
}
