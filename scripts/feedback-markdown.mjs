// Import a user-supplied CRM export as private product feedback, never as instructions.
export function parseFeedbackMarkdown(markdown){
 if(typeof markdown!=='string'||Buffer.byteLength(markdown)>6_000_000)throw Error('Feedbackexport is te groot.');
 const expected=Number(markdown.match(/^([0-9]+) melding\(en\)\./m)?.[1]);
 const blocks=markdown.split(/^## /m).slice(1),kinds={'Werkt niet':'bug','Verbetering':'improvement','Overbodig':'unnecessary'};
 if(!Number.isInteger(expected)||blocks.length!==expected)throw Error('De feedbackexport is onvolledig of heeft een onbekende indeling.');
 return blocks.map(block=>{
  const heading=block.split('\n')[0].match(/^\d+\. (Werkt niet|Verbetering|Overbodig) · (Open|Afgehandeld)\s*$/);
  if(!heading)throw Error('Onbekende feedbacktitel.');
  const field=name=>block.split('\n').find(line=>line.startsWith('- '+name+': '))?.slice(name.length+4).trim()||'';
  const route=field('Route'),hash=route.indexOf('#'),message=block.split('### Opmerking\n\n')[1]?.split(/\n(?:---\s*\n|### (?:Afhandeling|Bouwvoortgang|Extra uitleg)\n)/)[0].trim();
  if(hash<0&&!route.startsWith('/spatlap-preview'))throw Error('Feedbackroute ontbreekt.');
  const resolution=block.match(/### Afhandeling\n\n([\s\S]*?)(?=\n### |\n---\s*\n|$)/)?.[1].trim();
  const development=field('Bouwvoortgang');
  return {...(development?{development:JSON.parse(development)}:{}),id:field('Melding-ID'),createdAt:field('Datum'),kind:kinds[heading[1]],status:heading[2]==='Open'?'open':'resolved',message,details:'',...(resolution?{resolution}:{}),context:{route:hash>=0?route.slice(hash):'#designs',page:field('Pagina'),sourceRoute:route,tab:field('Tabblad'),form:field('Formulier'),section:field('Onderdeel'),targetText:field('Aangeklikte plek'),selector:field('Element'),action:field('Actie'),linkedId:field('Gekoppeld ID'),appVersion:field('App-versie'),viewport:field('Venster'),source:'CRM Markdown-export; selectiecontext is productfeedback'}};
 });
}
