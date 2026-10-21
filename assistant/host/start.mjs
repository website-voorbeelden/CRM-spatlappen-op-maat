import {startHostedAgent} from './server.mjs';
const service=await startHostedAgent({directory:process.env.CRM_AGENT_DATA_DIRECTORY,keys:{spatlappen:process.env.CRM_AGENT_SPATLAPPEN_TOKEN,maatwerkkunststof:process.env.CRM_AGENT_MAATWERKKUNSTSTOF_TOKEN},port:Number(process.env.PORT||3040),host:process.env.CRM_AGENT_BIND||'127.0.0.1'});
console.log('Persoonlijke CRM-AI-dienst gestart op poort '+service.port+'.');
let closing=false;for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(closing)return;closing=true;await service.close();process.exit(0);});
