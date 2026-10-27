import {installAssistant} from '../../admin/assistant.js?v=ui-batch234-20261027';
import {installFeedback} from '../../admin/feedback.js?v=crm-code-review-20261027';
import {storageRuntime} from '../../admin/cloud-storage.js?v=crm-code-review-20261027';
import {companyFor} from '../../shared/companies.js';
import {assistantPageContext} from '../../shared/assistant-page-context.js?v=payments-overview-20261027';
const toast=text=>{const box=document.getElementById('toast');box.textContent=text;box.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>box.hidden=true,7000);};
const downloadBlob=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return true;};
try{
 const runtime=await storageRuntime(),company=companyFor(runtime.companyId);
 installFeedback({downloadBlob,today:()=>new Date().toISOString().slice(0,10),toast});
 const empty=()=>({customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]});
 const assistant=installAssistant({company,runtime,toast,loadState:async()=>empty(),savePlan:async()=>{throw Error('Wijzig een order via het CRM. Berekeningen zet je terug met Uitkomst controleren & overnemen.');},getContext:()=>{
 const p=window.CrmCostCalculator?.exportState()?.pieces?.[0];if(!p)return null;
 return assistantPageContext({companyId:company.id,page:'designs',facts:{calculatorMaterial:p.material,calculatorQuantity:p.quantity,calculatorWidth:p.shape==='circle'?p.outerDiameter:p.width,calculatorHeight:p.shape==='circle'?p.outerDiameter:p.height,calculatorDiameter:p.shape==='circle'?p.outerDiameter:0,calculatorThickness:p.thickness}});
 }});
 assistant.mount(document.getElementById('crm-companion'),'designs');
}catch(e){toast('Feedback / assistent laden niet gelukt: '+e.message);}
