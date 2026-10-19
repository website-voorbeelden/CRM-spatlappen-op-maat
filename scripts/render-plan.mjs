import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {updated,stages,items} from '../shared/planning/roadmap.js';

export function renderPlan(){
 const companyNames={spatlappen:'Spatlappen',maatwerkkunststof:'Maatwerkkunststof'};
 return `# Ontwikkelplan — beide CRM’s\n\nBijgewerkt: ${updated}. Automatisch gemaakt uit \`shared/planning/roadmap.js\` met \`npm run plan\`. Bewerk de bron, niet dit bestand.\n\nDit is een geordende planning, geen opdracht om alles tegelijk uit te voeren. De volgorde binnen Eerstvolgend is het vertrekpunt; de gebruiker kan die bijstellen. Dezelfde taakcatalogus staat in beide CRM’s onder **Beheer → Bouwtaken**, gefilterd op bedrijf. Actuele afvinkstatus, publicatie en opmerkingen staan in de aparte CRM-planningopslag; deze gegenereerde catalogus is daarvan geen live export.\n\n`+stages.map(stage=>`## ${stage.label}\n\n${stage.description}\n\n`+items.filter(item=>item.stage===stage.id).map(item=>`### ${item.title}\n\n- **ID:** \`${item.id}\`\n- **Voor:** ${item.companies.map(id=>companyNames[id]).join(' en ')}\n- **Doel:** ${item.goal}\n${item.effort?'- **Omvang / status:** '+item.effort+'\n':''}- **Volgende stap:** ${item.next}\n- **Klaar wanneer:** ${item.acceptance}\n- **Eerst nodig:** ${item.dependsOn.map(id=>items.find(i=>i.id===id)?.title||id).join('; ')||'Geen aparte stap in dit plan.'}\n- **Vindplaatsen:** ${item.areas.map(path=>'`'+path+'`').join(', ')}\n`).join('\n')).join('\n')+`\n## Zo houden we samenhang\n\nZie [architectuur en mappen](ARCHITECTUUR.md), [automationontwerp](AUTOMATISERINGEN.md), [besluiten](BESLUITEN.md) en [UX-afspraken](../UX-WERKPLEK.md). Werk na oplevering de bronstatus, klaarcriteria en nieuwste overdracht bij. Bestaande functies staan bij Al aanwezig; geplande integraties worden daardoor niet als actief gepresenteerd.\n`;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const target=new URL('../docs/plan/ROADMAP.md',import.meta.url),content=renderPlan();
 if(process.argv.includes('--check')){
  if(await readFile(target,'utf8')!==content)throw Error('Ontwikkelplan is verouderd. Voer npm run plan uit.');
  console.log('Ontwikkelplan en bron zijn gelijk.');
 }else{await writeFile(target,content);console.log('docs/plan/ROADMAP.md bijgewerkt.');}
}
