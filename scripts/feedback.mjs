import {parseFeedbackMarkdown} from './feedback-markdown.mjs';
import {readFile} from 'node:fs/promises';
import {createFeedbackService,defaultFeedbackDirectory} from '../assistant/feedback-service.mjs';
const [command='list',company='spatlappen',argument,expectedVersion,...note]=process.argv.slice(2);
const service=createFeedbackService();
if(command==='list'){
 const reports=await service.list(company);console.log(JSON.stringify({directory:defaultFeedbackDirectory(),company,reports:reports.map(r=>({id:r.id,status:r.status,version:r.updatedAt||r.createdAt,message:r.message,resolution:r.resolution}))},null,2));
}else if(command==='import'){
 if(!argument)throw Error('Geef het lokale pad van een back-up of feedback.json op.');
 const raw=await readFile(argument,'utf8'),data=argument.toLowerCase().endsWith('.md')?{reports:parseFeedbackMarkdown(raw)}:JSON.parse(raw);const reports=Array.isArray(data)?data:data.feedback||data.reports;
 if(!reports)throw Error('Dit bestand bevat geen feedback.');
 if(data.companyId&&data.companyId!==company)throw Error('Deze back-up hoort bij een ander bedrijf.');
 console.log(await service.import(company,reports));
}else if(['resolve','reopen'].includes(command)){
 if(!argument||!expectedVersion)throw Error('Geef melding-ID en huidige versie op (zie list).');
 const resolution=note.join(' ');if(command==='resolve'&&!resolution)throw Error('Beschrijf de wijziging en validatie.');
 const result=await service.status(company,{id:argument,status:command==='resolve'?'resolved':'open',expectedVersion,resolution});console.log({id:result.id,status:result.status});
}else throw Error('Gebruik list, import, resolve of reopen.');
