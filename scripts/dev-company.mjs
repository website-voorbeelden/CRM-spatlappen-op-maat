import {spawn} from 'node:child_process';
import {companyFor} from '../shared/companies.js';
const company=companyFor(process.argv[2]||'spatlappen');
const port=process.env.CRM_PORT||(company.id==='spatlappen'?'3010':'3011');
const child=spawn('python3',['dev-server.py'],{stdio:'inherit',env:{...process.env,CRM_COMPANY_ID:company.id,CRM_PORT:port}});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code||0));
