// A catalogue is not an OAuth grant. The login still requests READONLY only.
const base='https://www.googleapis.com/auth/';
export const gmailScopes=Object.freeze({read:base+'gmail.readonly',send:base+'gmail.send',compose:base+'gmail.compose',modify:base+'gmail.modify',labels:base+'gmail.labels',settings:base+'gmail.settings.basic'});
const entries=[
 ['messages.send','Mail versturen','send','sensitive'],['messages.reply','Mail beantwoorden','send','sensitive'],
 ['drafts.create','Concept maken','compose','normal'],['drafts.update','Concept wijzigen','compose','normal'],['drafts.delete','Concept verwijderen','compose','sensitive'],['drafts.send','Concept versturen','compose','sensitive'],
 ['messages.modify','Maillabels wijzigen','modify','normal'],['messages.trash','Mail naar prullenbak','modify','sensitive'],['messages.untrash','Mail herstellen','modify','normal'],
 ['threads.modify','Gesprekslabels wijzigen','modify','sensitive'],['threads.trash','Gesprek naar prullenbak','modify','sensitive'],['threads.untrash','Gesprek herstellen','modify','normal'],
 ['labels.create','Label maken','labels','normal'],['labels.update','Label wijzigen','labels','normal'],['labels.delete','Label verwijderen','labels','sensitive'],
 ['filters.create','Mailfilter maken','settings','critical'],['filters.delete','Mailfilter verwijderen','settings','critical'],
 ['settings.vacation','Vakantieantwoord aanpassen','settings','critical'],['settings.imap','IMAP aanpassen','settings','critical'],['settings.pop','POP aanpassen','settings','critical']
];
export const gmailCapabilities=Object.freeze(entries.map(([operation,label,permission,risk])=>Object.freeze({operation,label,scope:gmailScopes[permission],risk})));
export const gmailBlockedCapabilities=Object.freeze([
 {operation:'messages.delete',reason:'Permanent verwijderen blijft geblokkeerd. Hiervoor is volledige mail.google.com-toegang nodig.'},
 {operation:'messages.batchDelete',reason:'Massaal permanent verwijderen blijft geblokkeerd.'},
 {operation:'settings.forwarding',reason:'Doorsturen blijft geblokkeerd. Gevoelige instellingen vereisen een aparte inrichting en extra identiteitscontrole.'},
 {operation:'settings.delegates',reason:'Mailboxdelegatie via de API vereist Google Workspace en domain-wide delegation; dit werkt niet met deze persoonlijke Gmail-koppeling.'},
 {operation:'settings.sendAs',reason:'Afzenders en aliassen wijzigen blijft geblokkeerd. SMTP2GO en bestaande afzenders blijven behouden.'}
]);
export function gmailCapability(operation){const result=gmailCapabilities.find(c=>c.operation===operation);if(!result)throw Error(gmailBlockedCapabilities.find(c=>c.operation===operation)?.reason||'Deze Gmail-actie is niet toegestaan.');return result;}
export function hasGmailScope(scopes,required){return Array.isArray(scopes)&&(scopes.includes(required)||required===gmailScopes.send&&scopes.includes(gmailScopes.compose)||[gmailScopes.read,gmailScopes.send,gmailScopes.compose,gmailScopes.labels].includes(required)&&scopes.includes(gmailScopes.modify));}
