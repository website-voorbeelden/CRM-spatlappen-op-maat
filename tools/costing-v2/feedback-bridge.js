import {storageRuntime,openFeedbackDatabase} from '../../admin/cloud-storage.js?v=crm-code-review-20261027';
import {appendFeedbackReport,addOfflineFeedback} from '../../admin/offline/feedback-outbox.js';
export async function saveCalculatorFeedback(report){
 const runtime=await storageRuntime();
 if(runtime.companyId!=='maatwerkkunststof')throw Error('Deze calculator hoort bij Maatwerkkunststof.');
 if(runtime.offlineReview){await addOfflineFeedback(report,runtime);return;}
 if(runtime.mode==='cloud'){const db=await openFeedbackDatabase();await appendFeedbackReport(db,report);return;}
 const response=await fetch('/__local/assistant/feedback-create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)}),result=await response.json().catch(()=>({error:'De feedbackdienst reageert niet. Je tekst blijft staan.'}));
 if(!response.ok)throw Error(result.error||'Feedback bewaren lukt niet.');
}
