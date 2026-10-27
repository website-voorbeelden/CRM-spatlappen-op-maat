export const sources={gmailPhase:'Gmail / automatische fasesynchronisatie',mailRecognition:'E-mail / veldherkenning',formMatch:'Bewaarde formuliermail (historische invoerwijze onbekend)',form:'Formuliermail / veldherkenning',ai:'AI-voorstel',template:'Standaardtekst / mailtemplate',default:'Standaard ingevulde waarde',calculator:'Kostprijsberekening',automaticMail:'Automatische mailactie'};
export function fieldValue(record,path){return path.split('.').reduce((v,k)=>v?.[k],record);}
export function valueSignature(value){const text=JSON.stringify(value??null);let a=2166136261,b=5381;for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619);b=Math.imul(b,33)^text.charCodeAt(i);}return text.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);}
export function markProvenance(record,paths,source,{mode='assisted',at=new Date().toISOString()}={}){if(!Object.hasOwn(sources,source)||!['assisted','automatic'].includes(mode))throw Error('Onbekende herkomst.');for(const path of paths){const value=fieldValue(record,path);if(value==null||value==='')continue;record.provenance??={};record.provenance[path]={source,mode,at,signature:valueSignature(value)};}return record;}
export function provenanceFor(record,path,value=fieldValue(record,path)){const p=record?.provenance?.[path];return p&&Object.hasOwn(sources,p.source)&&p.signature===valueSignature(value)?p:null;}
// Colour expresses how the value was obtained, not whether somebody approved
// or executed the action. Keep the existing stored mode and metadata contract.
export function provenanceKind(p){
 if(!p||!Object.hasOwn(sources,p.source))return '';
 if(p.source==='ai')return 'ai';
 if(['mailRecognition','formMatch'].includes(p.source))return 'interpretation';
 return 'automatic';
}
export function provenanceTip(p){
 const kind=provenanceKind(p);
 if(!kind)return '';
 const explanation=p.source==='formMatch'?'Bronvergelijking / interpretatie; historische invoerwijze onbekend':kind==='ai'?'AI-invoer / voorstel':kind==='interpretation'?'Uit tekst afgeleid / geïnterpreteerd':'Automatisch ingevuld / overgenomen';
 return explanation+' · '+sources[p.source]+(p.mode==='automatic'?' · automatisch uitgevoerd':'');
}
export function validProvenance(value){return value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length<=100&&Object.entries(value).every(([path,p])=>/^[a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)*$/.test(path)&&path.length<=100&&!path.split('.').some(k=>['__proto__','constructor','prototype'].includes(k))&&p&&Object.keys(p).every(k=>['source','mode','at','signature'].includes(k))&&Object.hasOwn(sources,p.source)&&['assisted','automatic'].includes(p.mode)&&Number.isFinite(Date.parse(p.at))&&typeof p.signature==='string'&&/^\d+:[a-f0-9]+:[a-f0-9]+$/.test(p.signature));}
