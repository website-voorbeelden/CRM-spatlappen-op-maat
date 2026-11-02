// Compare only the original submission. Later handling/build status belongs to
// the stored record and must survive a retry after a lost acknowledgement.
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
export function sameFeedbackSubmission(a,b){
 return !!a&&!!b&&JSON.stringify(stable([a.id,a.createdAt,a.kind,a.message,a.details||'',a.context]))===JSON.stringify(stable([b.id,b.createdAt,b.kind,b.message,b.details||'',b.context]));
}
export function feedbackSubmissionConflict(){
 return Object.assign(Error('Deze melding is al met andere inhoud bewaard. Je tekst blijft staan. Bekijk de bestaande melding of bewaar deze tekst bewust als een aparte melding.'),{code:'feedback-submission-conflict',status:409});
}
