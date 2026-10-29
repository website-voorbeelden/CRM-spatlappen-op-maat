import {installCustomDesignShortcuts} from '../custom-shortcuts.js?v=batch2-editor-20261026';
import {installFeedback} from '../../feedback.js?v=feedback29-restpunten';
import {installDesignShortcuts} from '../shortcuts.js?v=20261018-activity-1';
import {installDesignUsage} from '../usage.js';
import {installDesignTransfer} from '../transfer.js?v=feedback-followup-20261028';
import {installSelectionColors} from '../selection-color.js?v=20261018-color-palette-8';
import {runSavedDesignDownload} from './saved-download.js?v=four-parts-20261026';
if(savedDesignExportMode){void runSavedDesignDownload();}else{
installCustomDesignShortcuts();installDesignShortcuts();
installDesignUsage();
designTransferTools=installDesignTransfer({exportDocument:exportDesignDocument,applyDocument:applyPortableDesignCopy,exportSelection:()=>{const items=cloneSelectedForClipboard();if(items.length)internalClipboard=items;return items;},pasteSelection:items=>{internalClipboard=items;pasteInternalClipboard(.8);},cutSelection:()=>deleteSelectedObject(),sanitizeSVG:safeSvgMarkup,getName:()=>$('localDesignName').value,busy:()=>!!activeDesignSave||!!document.querySelector('.app')?.inert||previewActivities.size>0,activity:beginPreviewActivity,notify:message=>toast(message)});
selectionColorTools=installSelectionColors({readSelection:selectionColorInfo,readDesignColors:()=>[...state.texts.map(t=>t.color),...state.logos.flatMap(logo=>logoSelectionColors(logo)||logo.printColors||[])],applyColor:applySelectionColor,applyWholeColor:(hex,signature,channel)=>{if(selectionColorInfo(channel).signature!==signature)throw Error('Selectie gewijzigd. Kies opnieuw een kleur.');$('wholeLogoColor').value=hex;$('wholeLogoColorHex').value=hex;$('applyWholeLogoColor').click();},sampleCanvas:()=>buildArtworkCanvas(Math.min(16,2048/Math.max(state.flap.w,state.flap.h)),state.flap.color),notify:message=>toast(message)});
installFeedback({launcherHost:document.getElementById('previewToolbar'),contextOverride:{route:'#designs',url:'/spatlap-preview.html',page:'Spatlappen-ontwerptool'},today:()=>new Date().toLocaleDateString('sv-SE'),toast:message=>toast(message),downloadBlob:async(blob,name)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;}});
const previewFeedbackButton=document.querySelector('#previewToolbar .feedback-launcher');if(previewFeedbackButton){previewFeedbackButton.textContent='Feedback';previewFeedbackButton.title='Feedback over de ontwerptool doorgeven';}
Promise.all([previewReady,document.fonts.ready]).then(()=>{render();requestAnimationFrame(()=>window.finishPreviewBoot());}).catch(()=>window.finishPreviewBoot());
}
