// A proof email is a real email with existing files, never a carrier dry-run.
export const supplierTrialKind='supplier-trial';
export const supplierTrialSubject='[PROEF - NIET UITVOEREN] ';
export const supplierTrialNotice='PROEFCONTROLE - GEEN UITVOEROPDRACHT. Deze mail is alleen bedoeld om de twee bijlagen te controleren. Niet gebruiken als opdracht om een pakket te verzenden.';
export function supplierTrialRecipient(value){
 if(typeof value!=='string'||value!==value.trim()||value.length>254||!/^[-A-Za-z0-9.!#$%&'*+/=?^_`{|}~]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(value))throw Object.assign(Error('Vul een geldig proefmailadres in.'),{field:'testTo'});
 const domain=value.split('@')[1].toLowerCase();
 if(domain==='kunststofbaas.nl'||domain.endsWith('.kunststofbaas.nl'))throw Object.assign(Error('Gebruik voor de proefmail je eigen controleadres, niet het adres van Kunststofbaas.'),{field:'testTo'});
 return value;
}
export function assertSupplierTrialEnvelope(company,input,config){
 if(company!=='maatwerkkunststof')throw Error('Deze leveranciersproefmail is alleen voor Maatwerkkunststof.');
 const to=supplierTrialRecipient(input.to),allowed=supplierTrialRecipient(config.testTo);
 if(to.toLowerCase()!==allowed.toLowerCase()||input.expectedTestTo!==config.testTo)throw Object.assign(Error('Het proefadres is gewijzigd. Open het proefvoorbeeld opnieuw en controleer de ontvanger.'),{field:'to'});
 if(typeof input.subject!=='string'||!input.subject.startsWith(supplierTrialSubject)||typeof input.text!=='string'||!input.text.startsWith(supplierTrialNotice)||input.replyMessageId||input.references?.length)throw Error('De proefmail moet herkenbaar zijn als proef en losstaan van bestaande gesprekken.');
 if(!Array.isArray(input.attachments)||input.attachments.length!==1)throw Error('De proefmail moet precies de pakbon-PDF en het PACKS-label bevatten.');
}
