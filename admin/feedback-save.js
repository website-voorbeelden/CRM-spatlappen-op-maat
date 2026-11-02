import {sameFeedbackSubmission,feedbackSubmissionConflict} from '../shared/feedback-submission.js?v=feedback30-batch1';

// Also works with an older running local helper: read the stable ID before
// append, then recover a committed report after an uncertain response.
export async function saveLocalFeedback(report,request){
 const find=async()=>{
  const records=(await request('list')).reports;
  if(!Array.isArray(records))throw Error('De feedbacklijst kon niet worden bevestigd. Je tekst blijft staan.');
  const existing=records.find(row=>row.id===report.id);
  if(existing&&!sameFeedbackSubmission(existing,report))throw feedbackSubmissionConflict();
  return existing;
 };
 const existing=await find();if(existing)return existing;
 try{const saved=await request('create',report);if(!sameFeedbackSubmission(saved,report))throw Error('De bewaarde melding kon niet worden bevestigd. Probeer opnieuw met hetzelfde meldingsnummer.');return saved;}
 catch(error){
  try{const saved=await find();if(saved)return saved;}
  catch(recovery){if(recovery.code==='feedback-submission-conflict')throw recovery;}
  throw error;
 }
}
