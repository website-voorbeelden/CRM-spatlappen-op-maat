import {mailHtmlText} from './mail-content.js';
const single=v=>String(v||'').replace(/[\r\n\0]/g,' ').slice(0,2000);
const decode=value=>new TextDecoder().decode(Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
export function gmailMessage(data,mailbox,{full=false}={}){
 const headers=data.payload?.headers||[],header=name=>single(headers.find(h=>h.name?.toLowerCase()===name)?.value),attachments=[];let text='',html='';
 function walk(part,depth=0){if(!part||depth>20)return;if(part.filename){attachments.push({name:single(part.filename),size:Number(part.body?.size)||0,mimeType:part.mimeType||'application/octet-stream',partId:part.partId||'root'});return;}if(part.mimeType==='text/plain'&&part.body?.data)text+=(text?'\n':'')+decode(part.body.data);if(part.mimeType==='text/html'&&part.body?.data)html+=(html?'\n':'')+decode(part.body.data);for(const child of part.parts||[])walk(child,depth+1);}
 if(full)walk(data.payload);
 if(full&&!text.trim()&&html)text=mailHtmlText(html);
 const truncated=text.length>30000;text=text.slice(0,30000);if(full&&!text)text=String(data.snippet||'').slice(0,1000);
 const stamp=Number(data.internalDate),receivedAt=Number.isFinite(stamp)&&stamp>0?new Date(stamp).toISOString():'';
 const auth=header('authentication-results'),from=header('from'),sender=from.match(/([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/),domain=sender?.[2]?.toLowerCase();const signed=!!domain&&/^mx\.google\.com\s*;/i.test(auth)&&new RegExp('dkim=pass\\b[^;]*header\\.(?:d=|i=[^@;\\s]*@?)'+domain.replaceAll('.','\\.')+'(?:[;\\s]|$)','i').test(auth);
 return {labelIds:Array.isArray(data.labelIds)?data.labelIds.filter(id=>typeof id==='string'&&/^[-a-zA-Z0-9_]{1,200}$/.test(id)).slice(0,100):[],unread:!!data.labelIds?.includes('UNREAD'),inInbox:!!data.labelIds?.includes('INBOX'),formSenderVerified:signed,gmailId:data.id,threadId:data.threadId||'',mailbox,from:header('from'),to:header('to'),replyTo:header('reply-to'),subject:header('subject')||'(Geen onderwerp)',messageHeader:header('message-id'),references:header('references'),inReplyTo:header('in-reply-to'),receivedAt,direction:data.labelIds?.includes('SENT')?'outgoing':'incoming',snippet:String(data.snippet||'').slice(0,1000),...(full?{text,truncated,attachments:attachments.slice(0,50)}:{})};
}
