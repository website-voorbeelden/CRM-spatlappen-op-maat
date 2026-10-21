// Conservative shared quantity recognition. Multiple narrative quantities are
// separate products until reviewed, even when the numbers happen to match.
const words={een:1,'één':1,twee:2,drie:3,vier:4,vijf:5,zes:6,zeven:7,acht:8,negen:9,tien:10,elf:11,twaalf:12,dertien:13,veertien:14,vijftien:15,zestien:16,zeventien:17,achttien:18,negentien:19,twintig:20};
const count='(?:\\d+|'+Object.keys(words).join('|')+')';
const adjective='(?:wit|witte|zwart|zwarte|transparant|transparante|rood|rode|blauw|blauwe|groen|groene|grijs|grijze|kunststof|rubberen?|vlakke?|ronde?|vierkante?|rechthoekige?|PVC|HDPE|PE1000|PE500|POM|PTFE|PMMA|EPDM|SBR|NBR|ABS|HPL|PETG|PP)';
const noun='(?:stuks?|st\\.?|platen|schijven|spatlappen|ringen|pakkingen|panelen|blokken|blokjes)';
const value=token=>words[token.toLowerCase()]??Number(token);
export function inquiryQuantity(text){
 const source=String(text||'').slice(0,30000),labels=[...source.matchAll(new RegExp('(?:^|\\n)[ \\t]*aantal(?:[ \\t]+stuks)?[ \\t]*:?[ \\t]*('+count+')(?![\\p{L}\\d.,])','giu'))];
 const mentions=[...source.matchAll(new RegExp('(?<![\\d.,])\\b('+count+')\\s+(?:'+adjective+'\\s+){0,5}'+noun+'\\b','giu'))].filter(match=>!labels.some(label=>match.index>=label.index&&match.index<label.index+label[0].length));
 const all=[...labels,...mentions],values=new Set(all.map(match=>value(match[1])));
 const range=new RegExp('\\b'+count+'[ \\t]*(?:of|tot|[-–+])[ \\t]*'+count+'[ \\t]+(?:'+adjective+'[ \\t]+){0,5}'+noun+'\\b','iu').test(source);
 const negated=all.some(match=>/(?:geen|niet|-)\s*$/i.test(source.slice(Math.max(0,match.index-15),match.index)));
 const invalid=all.some(match=>!Number.isInteger(value(match[1]))||value(match[1])<1||value(match[1])>1000000);
 const fieldRange=new RegExp('(?:^|\\n)[ \\t]*aantal(?:[ \\t]+stuks)?[ \\t]*:?[ \\t]*'+count+'[ \\t]*(?:of|tot|[-–+])[ \\t]*'+count+'\\b','iu').test(source);
 const ambiguous=range||fieldRange||negated||invalid||labels.length>1||mentions.length>1||values.size>1;
 const quantity=!ambiguous&&values.size===1?[...values][0]:null;
 return {quantity,ambiguous,mentions:all.map(match=>({value:value(match[1]),text:match[0].trim()}))};
}
export function inquiryColor(value){return ({witte:'wit',zwarte:'zwart',transparante:'transparant',rode:'rood',blauwe:'blauw',groene:'groen',grijze:'grijs'})[String(value).toLowerCase()]||String(value).toLowerCase();}
