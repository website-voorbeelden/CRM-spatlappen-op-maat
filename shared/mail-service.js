import {validateSignatureProfiles,validateSignatureBindings,signatureForSender,renderSenderSignature} from './mail-signature-profiles.js';
import {validateMailAttachments} from './mail-attachments.js?v=ui-batch4-followup-20261027';
import {replyReferences,validMessageId} from './mail-reply.js';
import {sanitizeSignature,htmlSignatureMessage} from './mail-signature.js';
import {companyFor} from './companies.js';
import {checkMailText} from './mail-templates.js?v=mail-texts-20261027';
const fail=(message,field)=>{throw Object.assign(Error(message),{field});};
const address=value=>typeof value==='string'&&value.length<=254&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(value);
const id=value=>typeof value==='string'&&/^[-a-zA-Z0-9._]{1,160}$/.test(value);
const line=(value,max)=>typeof value==='string'&&value.trim()&&value.length<=max&&!/[\r\n\x00<>]/.test(value);
export function createMailEngine({read,write,exclusive,fetchImpl,digest}){
 const publicConfig=config=>({configured:!!config?.apiKey,sender:config?.sender||'',senderName:config?.senderName||'',senders:config?.sender?[config.sender,...(config.aliases||[])]:[],invoiceSender:config?.invoiceSender||config?.sender||'',senderByKind:config?.senderByKind||{},signature:config?.signature||'',signatureHtml:config?.signatureHtml||'',signatureProfiles:config?.signatureProfiles||[],signatureBySender:config?.signatureBySender||{},signatureSettingsVersion:config?.signatureSettingsVersion||'',replyTo:config?.replyTo||'',testTo:config?.testTo||'',allowCustomers:config?.allowCustomers===true});
 return {
  async status(company){return publicConfig(await read(company,'config'));},
  async configure(company,input){return exclusive(company,async()=>{
   const old=await read(company,'config');if(!line(input.senderName,100))fail('Controleer de afzendernaam.','senderName');for(const key of ['sender','testTo'])if(!address(input[key]))fail('Vul een geldig e-mailadres in.',key);if(input.replyTo&&!address(input.replyTo))fail('Vul een geldig antwoordadres in.','replyTo');
   const apiKey=input.apiKey||old?.apiKey;if(typeof apiKey!=='string'||!/^api-[a-zA-Z0-9]{32}$/.test(apiKey))fail('Vul een geldige SMTP2GO API-sleutel in (api-…).','apiKey');
   const aliases=input.aliases===undefined?old?.aliases||[]:input.aliases;if(!Array.isArray(aliases)||aliases.length>7||aliases.some(value=>!address(value)||value.split('@')[1].toLowerCase()!==input.sender.split('@')[1].toLowerCase()))fail('Voeg maximaal zeven extra afzenderadressen van hetzelfde domein toe.','aliases');
   const senders=[input.sender,...aliases],invoiceSender=input.invoiceSender===undefined?old?.invoiceSender||input.sender:input.invoiceSender||input.sender;if(!senders.includes(invoiceSender))fail('Het facturenadres moet bij je toegestane afzenders staan.','invoiceSender');
   const senderByKind=input.senderByKind===undefined?old?.senderByKind||{}:input.senderByKind;if(!senderByKind||typeof senderByKind!=='object'||Array.isArray(senderByKind)||Object.entries(senderByKind).some(([kind,value])=>!['question','quote','confirmation','proforma','packing'].includes(kind)||typeof value!=='string'||value&&!senders.includes(value)))fail('Kies per mailsoort een adres uit je toegestane afzenders.','sender');
   const signature=input.signature===undefined?old?.signature||'':input.signature;if(typeof signature!=='string'||signature.length>2000||signature.includes('\0'))fail('Gebruik een handtekening van maximaal 2.000 tekens.','signature');
   let signatureHtml;try{signatureHtml=sanitizeSignature(input.signatureHtml===undefined?old?.signatureHtml||'':input.signatureHtml);}catch(error){fail(error.message,'signatureHtml');}
   if(/data-sp-signature-slot="missing"/.test(signatureHtml))fail('Je HTML-handtekening mist nog een afbeeldingsbestand. Kies de JPG/PNG bij Afbeelding kiezen / vervangen.','signatureHtml');
   const editingSignatures=input.signatureProfiles!==undefined||input.signatureBySender!==undefined;
   if(editingSignatures&&input.expectedSignatureSettingsVersion!==(old?.signatureSettingsVersion||''))fail('De handtekeningen zijn intussen gewijzigd. Herlaad de instellingen voordat je ze opnieuw opslaat.','signatureHtml');
   const signatureProfiles=validateSignatureProfiles(input.signatureProfiles===undefined?old?.signatureProfiles||[]:input.signatureProfiles,{signature,signatureHtml}),signatureBySender=validateSignatureBindings(input.signatureBySender===undefined?old?.signatureBySender||{}:input.signatureBySender,senders,signatureProfiles);
   try{htmlSignatureMessage('',{signature,signatureHtml});}catch(error){fail(error.message,'signatureHtml');}
   const signatureSettingsVersion=crypto.randomUUID();
   const config={signatureProfiles,signatureBySender,signatureSettingsVersion,senderByKind,signatureHtml,sender:input.sender,senderName:input.senderName.trim(),aliases:[...new Set(aliases)].filter(value=>value!==input.sender),invoiceSender,signature,replyTo:input.replyTo||input.sender,testTo:input.testTo,allowCustomers:input.allowCustomers===true,apiKey};await write(company,'config',config);return publicConfig(config);
  });},
  async journal(company){return {messages:Object.values(await read(company,'journal')||{}).map(({fingerprint,...entry})=>entry).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,50)};},
  async send(company,input){return exclusive(company,async()=>{
   if(input.companyId!==company||input.confirmed!==true||!id(input.requestId)||!['test','document','message'].includes(input.kind))fail('Controleer en bevestig deze e-mail eerst in het CRM.');
   const config=await read(company,'config');if(!config?.apiKey)fail('Stel SMTP2GO eerst in bij Instellingen & back-up.');
   let payload,documentId='',orderId='';
   const testSender=input.testSender||config.sender;if(input.kind==='test'&&![config.sender,...(config.aliases||[])].includes(testSender))fail('Kies een ingestelde afzender voor de testmail.');
   const from=input.kind==='test'?testSender:input.expectedSender;
   const selectedSignature=signatureForSender(config,from,input.signatureChoice||'');
   if(input.kind==='test')payload={sender:config.senderName+' <'+from+'>',to:[config.testTo],subject:'CRM-testmail · '+companyFor(company).name,text_body:'Dit is een test van de SMTP2GO-koppeling voor '+companyFor(company).name+'. Er zijn geen klantgegevens of facturen meegestuurd.'};
   else{
    if(!config.allowCustomers)fail('Klantverzending staat uit. Verstuur eerst een testmail en schakel daarna klantverzending in bij de e-mailinstellingen.');
    if(![config.sender,...(config.aliases||[])].includes(input.expectedSender)||input.expectedSenderName!==config.senderName||input.expectedReplyTo!==config.replyTo)fail('De afzenderinstellingen zijn gewijzigd. Open het e-mailvoorbeeld opnieuw.');
    if(!address(input.to)||!line(input.subject,200)||typeof input.text!=='string'||!input.text.trim()||input.text.length>30000||input.text.includes('\0')||!(id(input.orderId)||input.kind==='message'&&id(input.customerId))||input.customerId&&!id(input.customerId)||input.kind==='document'&&!id(input.orderId)||input.kind==='document'&&!id(input.documentId)||input.kind==='message'&&(input.pdf||input.documentId))fail('Controleer ontvanger, onderwerp, bericht en PDF-bijlage.');
    checkMailText(input.subject,input.text);
    if(input.replyMessageId&&!validMessageId(input.replyMessageId))fail('Deze mail bevat geen bruikbare verwijzing voor een antwoord. Open een nieuw bericht.');
    orderId=input.orderId||'';payload={sender:config.senderName+' <'+input.expectedSender+'>',to:[input.to],subject:input.subject.trim(),text_body:input.text};
    if(input.kind==='document'){
    const pdf=input.pdf;if(!pdf||!line(pdf.filename,180)||!pdf.filename.toLowerCase().endsWith('.pdf')||/[\\/]/.test(pdf.filename)||typeof pdf.fileblob!=='string'||pdf.fileblob.length>2800000)fail('Kies één PDF-bijlage van maximaal 2 MB.');
    let bytes;try{bytes=atob(pdf.fileblob);}catch{fail('De PDF-bijlage is ongeldig of te groot.');}if(btoa(bytes)!==pdf.fileblob||bytes.length>2000000||bytes.slice(0,5)!=='%PDF-')fail('De PDF-bijlage is ongeldig of te groot.');
    documentId=input.documentId;payload.attachments=[{filename:pdf.filename,mimetype:'application/pdf',fileblob:pdf.fileblob}];}
   }
   if(input.kind!=='test'&&input.expectedSignatureText!==undefined&&input.expectedSignatureText!==(selectedSignature.signature||''))fail('De handtekening is gewijzigd. Open het e-mailvoorbeeld opnieuw.');
   if((input.expectedSignatureHtml||'')!==(selectedSignature.signatureHtml||'')&&input.kind!=='test')fail('De HTML-handtekening is gewijzigd. Open het e-mailvoorbeeld opnieuw.');
   if(input.kind!=='test'&&input.expectedSignatureId!==undefined&&input.expectedSignatureId!==selectedSignature.id)fail('De gekozen handtekening of adreskoppeling is gewijzigd. Open het voorbeeld opnieuw.');
   {const message=renderSenderSignature(payload.text_body,config,from,input.signatureChoice||'');payload.text_body=message.text;if(message.html)payload.html_body=message.html;if(message.inlines?.length)payload.inlines=message.inlines;
    const extra=input.kind==='test'?[]:validateMailAttachments(input.attachments);if(extra.length)payload.attachments=[...(payload.attachments||[]),...extra];
   }
   payload.fastaccept=false;payload.custom_headers=[{header:'Reply-To',value:config.replyTo},{header:'X-CRM-Request',value:company+'-'+input.requestId},{header:'Message-ID',value:'<crm-'+company+'-'+input.requestId+'@'+from.split('@')[1]+'>'}];
   if(input.kind!=='test'&&input.replyMessageId)payload.custom_headers.push({header:'In-Reply-To',value:input.replyMessageId},{header:'References',value:replyReferences(input.references,input.replyMessageId)});
   const fingerprint=await digest(JSON.stringify(payload)),journal=await read(company,'journal')||{},previous=journal[input.requestId];
   if(previous){if(previous.fingerprint!==fingerprint)fail('Dit verzendverzoek bestaat al met andere inhoud. Open een nieuw concept.');if(previous.status==='accepted'){const {fingerprint:_,...safe}=previous;return {...safe,reused:true};}fail(previous.status==='rejected'?'SMTP2GO heeft dit verzoek geweigerd. Controleer de activiteit en instellingen voordat je een nieuw concept maakt.':'Dit verzoek heeft geen zeker resultaat. Controleer Reports → Activity in SMTP2GO voordat je opnieuw verstuurt.');}
   if(input.kind==='document'&&Object.values(journal).some(entry=>entry.status==='accepted'&&entry.orderId===orderId&&entry.documentId===documentId&&entry.to.toLowerCase()===input.to.toLowerCase())&&input.acknowledgeResend!==true)fail('Deze PDF is al aangeboden aan deze ontvanger. Bevestig bewust opnieuw versturen in het voorbeeld.');
   if(input.kind==='document'&&Object.values(journal).some(entry=>['pending','uncertain'].includes(entry.status)&&entry.orderId===orderId&&entry.documentId===documentId&&entry.to.toLowerCase()===input.to.toLowerCase()))fail('Een eerdere verzending van deze PDF is nog onzeker. Controleer SMTP2GO Activity voordat je opnieuw verstuurt.');
   const entry={requestId:input.requestId,kind:input.kind,from,signatureId:selectedSignature.id,to:payload.to[0],subject:payload.subject,orderId,customerId:input.customerId||'',documentId,messageId:payload.custom_headers.find(h=>h.header==='Message-ID').value,replyMessageId:input.replyMessageId||'',createdAt:new Date().toISOString(),status:'pending',fingerprint};journal[input.requestId]=entry;await write(company,'journal',journal);
   try{
    const response=await fetchImpl('https://api.smtp2go.com/v3/email/send',{method:'POST',headers:{'Content-Type':'application/json','X-Smtp2go-Api-Key':config.apiKey},body:JSON.stringify(payload),redirect:'manual',signal:AbortSignal.timeout(30000)});
    const raw=await response.text();if(raw.length>64000)throw Error('Uncertain response');let result;try{result=JSON.parse(raw);}catch{throw Error('Uncertain response');}
    if(response.ok&&result.data?.succeeded===1&&result.data?.failed===0&&typeof result.data.email_id==='string'&&result.data.email_id.length<=160){entry.status='accepted';entry.providerId=result.data.email_id;entry.acceptedAt=new Date().toISOString();}
    else if(!response.ok&&response.status>=400&&response.status<500||result.data?.succeeded===0&&(result.data?.failed>0||result.data?.error_code)){entry.status='rejected';}
    else throw Error('Uncertain response');
    await write(company,'journal',journal);if(entry.status==='rejected')fail('SMTP2GO heeft de mail geweigerd. Controleer de API-rechten, afzenderverificatie, limiet en Reports → Activity.');
    const {fingerprint:_,...safe}=entry;return {...safe,reused:false};
   }catch(error){if(entry.status==='pending'){entry.status='uncertain';await write(company,'journal',journal);}throw Object.assign(Error(entry.status==='rejected'?'SMTP2GO heeft de mail geweigerd. Controleer de API-rechten, afzenderverificatie, limiet en Reports → Activity.':'Het verzendresultaat is onzeker. Controleer SMTP2GO Reports → Activity; dit verzoek wordt niet automatisch opnieuw verstuurd.'),{mailStatus:entry.status==='rejected'?'rejected':'uncertain'});}
  });}
 };
}
