import {packsWorkerV3} from '../shared/packs-worker-v3.js?v=packs-worker-v3-20261102';
export const packsCrmPreview=env=>env.CRM_PACKS_SERVICE_CONTRACT===packsWorkerV3.contract&&env.CRM_RELEASE_ENV==='preview';
// Prevent the ordinary migration/backup controls from filling this empty
// dedicated preview with a production CRM snapshot. Manual fictitious orders
// use normal commits and the same canonical schema as the real CRM.
export function assertPacksPreviewCommit(env,body){
 if(packsCrmPreview(env)&&(body.migration||body.tikkieJournal!==undefined||Array.isArray(body.operations)&&body.operations.some(op=>op?.action==='clear')))throw Object.assign(Error('Deze afzonderlijke PACKS-preview neemt geen browser-/back-upadministratie over. Maak hier uitsluitend fictieve proeforders; je originele gegevens blijven behouden.'),{status:403});
}
