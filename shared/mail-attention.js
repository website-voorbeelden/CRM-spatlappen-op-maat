const hour=3600000,day=24*hour;
const time=value=>{const n=Date.parse(value);return Number.isFinite(n)&&n>0?n:0;};
export const messageTime=m=>time(m.receivedAt||m.sentAt||m.time||m.updatedAt||m.savedAt);

export function waitingDuration(since,now=Date.now()){
 const start=typeof since==='number'?since:time(since);
 if(!start||start>now)return 'wachttijd onbekend';
 const hours=Math.floor((now-start)/hour),days=Math.floor(hours/24);
 return days?days+' '+(days===1?'dag':'dagen'):hours?hours+' uur':'minder dan 1 uur';
}

// A draft is not an answer. Only a Gmail send or an accepted CRM send can stop
// the wait. This is a projection of loaded messages, never a mailbox operation.
export function mailAttention(entries,{now=Date.now(),replyDays=3,followupDays=7}={}){
 const incoming=entries.filter(m=>m.direction!=='outgoing'&&(m.gmailId||m.direction==='incoming'));
 const outgoing=entries.filter(m=>m.gmailId&&m.direction==='outgoing'||!m.gmailId&&m.status==='accepted');
 const sentTime=m=>m.gmailId?time(m.receivedAt||m.sentAt):time(m.sentAt);
 const valid=m=>messageTime(m)>0&&messageTime(m)<=now;
 const lastOut=outgoing.reduce((n,m)=>Math.max(n,sentTime(m)<=now?sentTime(m):0),0);
 const hasDraft=entries.some(m=>!m.gmailId&&m.status==='draft');
 const uncertain=entries.some(m=>!m.gmailId&&m.status==='uncertain');
 const rejected=entries.some(m=>!m.gmailId&&m.status==='rejected'&&(!valid(m)||messageTime(m)>=lastOut));
 const base={needsReply:false,needsAttention:false,priority:'normaal',hasDraft,days:null,since:'',waitingFor:'none',rank:4};
 if(uncertain||rejected)return {...base,needsAttention:true,priority:'hoog',waitingFor:'check',rank:0,label:'Verzending controleren',reason:uncertain?'Het verzendresultaat is onzeker. Controleer dit vóór je opnieuw verstuurt.':'De laatste verzending is afgewezen. Controleer het bericht.'};
 const unknown=incoming.some(m=>!time(m.receivedAt)||time(m.receivedAt)>now)||outgoing.some(m=>!sentTime(m)||sentTime(m)>now);
 if(unknown)return {...base,waitingFor:'unknown',label:'Wachttijd onbekend',reason:'Niet alle berichtdatums zijn bekend of geldig.'};
 const unanswered=incoming.filter(m=>time(m.receivedAt)>lastOut);
 if(unanswered.length){
  const since=Math.min(...unanswered.map(m=>time(m.receivedAt))),days=Math.floor((now-since)/day),high=days>=replyDays;
  return {...base,needsReply:true,needsAttention:true,priority:high?'hoog':'normaal',waitingFor:'us',rank:high?1:2,days,since:new Date(since).toISOString(),label:'Antwoord nodig · '+waitingDuration(since,now),reason:high?'Al '+days+' dagen zonder geregistreerd antwoord.':'Er is nog geen antwoord na dit ontvangen bericht geregistreerd.'};
 }
 if(lastOut){
  const days=Math.floor((now-lastOut)/day),due=days>=followupDays;
  return {...base,needsAttention:due,waitingFor:'customer',rank:due?3:4,days,since:new Date(lastOut).toISOString(),label:'Wacht op reactie · '+waitingDuration(lastOut,now),reason:due?'Opvolgtermijn bereikt. Controleer het gesprek vóór je opvolgt.':'Een verzending is geregistreerd; een nieuwer ontvangen antwoord ontbreekt.'};
 }
 return {...base,label:hasDraft?'Concept · niet verstuurd':'Geen wachttijd bekend',reason:''};
}

export function compareMailAttention(a,b){
 const aa=a.attention,bb=b.attention;
 return aa.rank-bb.rank||(['us','customer'].includes(aa.waitingFor)&&aa.waitingFor===bb.waitingFor&&aa.needsAttention?Date.parse(aa.since)-Date.parse(bb.since):0)||messageTime({time:b.time})-messageTime({time:a.time})||String(a.key).localeCompare(String(b.key));
}
