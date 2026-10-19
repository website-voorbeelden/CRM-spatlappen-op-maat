// Applicant identity stays separate from the company dossier. No inference from email alone.
const text=value=>String(value??'').trim();
const normal=value=>text(value).normalize('NFKC').toLocaleLowerCase('nl').replace(/\s+/g,' ');
export const inquiryIdentity=input=>Object.fromEntries(['company','contact','email','phone'].map(key=>[key,text(input?.[key]).slice(0,key==='phone'?100:200)]));
export function customerEmailMatches(customer,email){
 const wanted=normal(email);
 return !!wanted&&[customer.email,customer.invoiceEmail,...(customer.contacts||[]).map(c=>c.email)].some(value=>normal(value)===wanted);
}
export function inquiryCustomerReview(state,order,fallback=null){
 const customer=state.customers.find(c=>c.id===order.customerId);
 if(!customer)return null;
 const applicant=order.inquiryCustomer||fallback||(order.inquiryName?{company:order.inquiryName}:null);
 if(!applicant)return null;
 const source=inquiryIdentity(applicant),names=[customer.company,customer.contact,...(customer.contacts||[]).map(c=>c.name)].map(normal).filter(Boolean);
 const differences=[];
 if(source.company&&!names.includes(normal(source.company)))differences.push('naam');
 if(source.contact&&!names.includes(normal(source.contact))&&!differences.includes('naam'))differences.push('contactpersoon');
 const phones=[customer.phone,...(customer.contacts||[]).map(c=>c.phone)].map(v=>text(v).replace(/[^\d+]/g,''));
 if(source.phone&&!phones.includes(source.phone.replace(/[^\d+]/g,'')))differences.push('telefoon');
 if(source.email&&!customerEmailMatches(customer,source.email))differences.push('e-mailadres');
 const sourceBasis=JSON.stringify(source),decision=order.inquiryCustomerDecision;
 const resolved=decision?.customerId===customer.id&&decision.sourceBasis===sourceBasis;
 return {customer,source,sourceBasis,differences,resolved,decision,pending:differences.length>0&&!resolved};
}
export function inquiryCustomerBasis(state,order,source){
 const customer=state.customers.find(c=>c.id===order.customerId);
 return JSON.stringify([order,customer,source,state.customers.map(c=>[c.id,c.company,c.email,c.invoiceEmail,c.contacts]),(state.mailThreads||[]).filter(t=>t.orderId===order.id),(state.incomingEmails||[]).filter(m=>m.orderId===order.id)]);
}
export function resolveInquiryCustomer(state,orderId,source,input,{expected,uid=()=>crypto.randomUUID(),now=new Date().toISOString()}={}){
 const order=state.orders.find(o=>o.id===orderId),customer=state.customers.find(c=>c.id===order?.customerId);
 if(!order||!customer||inquiryCustomerBasis(state,order,source)!==expected)throw Error('De aanvraag of klantkoppeling is intussen gewijzigd. Open de controle opnieuw.');
 if(!['keep','new','contact'].includes(input.choice))throw Error('Kies bij welke klant deze aanvraag hoort.');
 const identity=inquiryIdentity(source),name=text(input.name),email=text(input.email).toLowerCase(),phone=text(input.phone);
 if(input.choice!=='keep'&&(!name||name.length>200||email.length>200||email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||phone.length>100))throw Error('Vul een naam en geldige contactgegevens in.');
 const previousCustomerId=customer.id;
 if(input.choice==='new'){
  // A conversation belongs to one dossier. Never split a conversation invisibly.
  const links=(state.mailThreads||[]).filter(t=>t.orderId===order.id);
  if((state.incomingEmails||[]).some(m=>links.some(t=>t.mailbox===m.mailbox&&t.gmailThreadId===m.threadId)&&m.orderId!==order.id))throw Error('Een mailgesprek hoort ook bij een ander dossier. Controleer eerst de koppeling bij E-mail.');
  if((state.incomingEmails||[]).some(m=>m.orderId===order.id&&(state.mailThreads||[]).some(t=>t.mailbox===m.mailbox&&t.gmailThreadId===m.threadId&&t.orderId!==order.id)))throw Error('De mailkoppeling wijkt af van de order. Controleer eerst het gesprek bij E-mail.');
  const created={id:uid(),company:name,contact:text(input.contact||identity.contact||name).slice(0,200),email,phone,country:'',notes:'',archived:false};
  state.customers.push(created);order.customerId=created.id;
  for(const message of state.incomingEmails||[])if(message.orderId===order.id)message.customerId=created.id;
  for(const link of links)link.customerId=created.id;
  delete order.contactId;
 }
 if(input.choice==='contact'){
  customer.contacts??=[];
  let contact=customer.contacts.find(c=>normal(c.name)===normal(name)&&normal(c.email)===normal(email)&&text(c.phone)===phone);
  if(!contact){if(customer.contacts.length>=100)throw Error('Dit bedrijf heeft al 100 extra contactpersonen.');contact={id:uid(),name,email,phone,createdAt:now};customer.contacts.push(contact);}
  order.contactId=contact.id;
 }
 order.inquiryCustomer=identity;
 const decision={choice:input.choice,customerId:order.customerId,previousCustomerId,sourceBasis:JSON.stringify(identity),at:now};
 if(order.inquiryCustomerDecision){order.inquiryCustomerHistory??=[];order.inquiryCustomerHistory.push(order.inquiryCustomerDecision);}
 order.inquiryCustomerDecision=decision;
 state.activities.unshift({id:uid(),time:now,message:'Klantkoppeling order #'+order.number+' gecontroleerd: '+({keep:'bestaande klant behouden',new:'aparte klant aangemaakt',contact:'contactpersoon bij bedrijf gekoppeld'}[input.choice])});
 return decision;
}
