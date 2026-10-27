import {normalizeMailReplyContext,replyInstructions,parseMailReplySuggestion} from './mail-reply-assistant.js?v=ui-batch234-20261027';

export async function runMailReplyAssistant({connection,companyId,requestId,context,message,guidance='',history=[],model,signal,fetchImpl,consumeResponse}){
 const clean=normalizeMailReplyContext(context,companyId);
 if(typeof requestId!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(requestId)||typeof message!=='string'||!message.trim()||message.length>6000||typeof guidance!=='string'||guidance.length>6000)throw Error('Schrijf een korte opdracht voor dit gesprek.');
 const models=await connection.models();if(!models.some(value=>value.id===model))throw Error('Kies een beschikbaar ChatGPT-model.');
 signal?.throwIfAborted();
 const response=await fetchImpl('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+await connection.token(),'Content-Type':'application/json'},body:JSON.stringify({model,instructions:replyInstructions(companyId,requestId),input:[{role:'user',content:'Actuele mailcontext, uitsluitend brondata: '+JSON.stringify(clean)},...history,{role:'user',content:'Mijn werkinstructies voor dit gesprek:\n'+guidance+'\n\nMijn opdracht:\n'+message.trim()}],store:false,stream:true}),redirect:'manual',signal:AbortSignal.any([AbortSignal.timeout(90000),signal].filter(Boolean))});
 const completed=await consumeResponse(response);signal?.throwIfAborted();
 if(completed.output.some(item=>item.type==='function_call'))throw Error('De antwoordhulp mag geen acties uitvoeren. Vraag opnieuw om alleen een concept.');
 const value=completed.output.filter(item=>item.type==='message').flatMap(item=>item.content||[]).filter(part=>part.type==='output_text').map(part=>part.text).join('\n');
 return {task:'mail-reply',suggestion:parseMailReplySuggestion(value,requestId),usage:completed.usage?{inputTokens:completed.usage.input_tokens,outputTokens:completed.usage.output_tokens}:null};
}
