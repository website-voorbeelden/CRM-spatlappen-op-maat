// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function encodeShareState(){
  const logos=state.logos.map(logo=>{
    const copy={...logo};
    if(copy.svgMarkup){
      delete copy.src;delete copy.originalRasterSrc;delete copy.vectorCrop;
      delete copy.originalVectorMarkup;delete copy.originalVectorFrame;delete copy.originalVectorPrintColors;
    }
    return copy;
  });
  const compact={f:state.flap,h:state.holes,l:logos,t:state.texts,u:state.ui};
  return btoa(unescape(encodeURIComponent(JSON.stringify(compact))))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function decodeShareState(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
  return JSON.parse(decodeURIComponent(escape(atob(s))));
}

function currentShareUrl(){
  const encoded=encodeShareState();
  return location.href.split(/[?#]/)[0]+'#design='+encoded;
}

async function storageModule(){return designStorageModule??=await import('../../cloud-storage.js?v=crm-code-review-20261027');}

function openLocalDb(){
  return localDbPromise??=(async()=>{const storage=await storageModule();return storage.openDesignDatabase();})();
}

async function usesCloudDesigns(){return (await (await storageModule()).storageRuntime()).mode==='cloud';}

async function writeLocalDesign(record){
  try{
    const db=await openLocalDb();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('designs','readwrite');
      tx.objectStore('designs').put(record);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
    });
  }catch(dbError){
    if(await usesCloudDesigns())throw dbError;
    try{localStorage.setItem(localStoragePrefix+record.id,JSON.stringify(record));}
    catch(storageError){throw new Error('Browseropslag niet beschikbaar of vol');}
  }
}

async function readLocalDesign(id){
  try{
    const db=await openLocalDb();
    const record=await new Promise((resolve,reject)=>{
      const tx=db.transaction('designs','readonly');
      const request=tx.objectStore('designs').get(id);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);tx.onerror=()=>reject(tx.error);
    });
    if(record)return record;
  }catch(e){if(await usesCloudDesigns())throw e;}
  if(await usesCloudDesigns())return null;
  try{return JSON.parse(localStorage.getItem(localStoragePrefix+id)||'null');}catch(e){return null;}
}

async function allLocalDesigns(){
  const records=new Map();
  try{
    const db=await openLocalDb();
    const list=await new Promise((resolve,reject)=>{
      const tx=db.transaction('designs','readonly');
      const request=tx.objectStore('designs').getAll();
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);tx.onerror=()=>reject(tx.error);
    });
    for(const record of list)records.set(record.id,record);
  }catch(e){if(await usesCloudDesigns())throw e;}
  if(await usesCloudDesigns())return [...records.values()].sort((a,b)=>b.updatedAt-a.updatedAt);
  try{
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key?.startsWith(localStoragePrefix))continue;
      const record=JSON.parse(localStorage.getItem(key));
      if(record?.id&&(!records.has(record.id)||record.updatedAt>records.get(record.id).updatedAt))records.set(record.id,record);
    }
  }catch(e){}
  return [...records.values()].sort((a,b)=>b.updatedAt-a.updatedAt);
}

function localDesignUrl(id){const url=new URL(location.href);url.hash='local='+encodeURIComponent(id);if(!crmBinding){const mode=url.searchParams.get('storage');url.search='';if(mode==='cloud')url.searchParams.set('storage','cloud');}return url.href;}

function showLocalLink(id,message){
  const status=$('shareStatus');status.replaceChildren();
  status.append(document.createTextNode(message+' '));
  const link=document.createElement('a');link.href=localDesignUrl(id);link.textContent='Korte link openen';
  status.append(link);
}

function setLocalDesignName(name){$('localDesignName').value=name;const variantName=$('productVariantName');if(variantName)variantName.value=name;}

function compactDesignState(){return {f:state.flap,h:state.holes,l:state.logos,t:state.texts,u:state.ui};}

async function productModule(){return productDesignModule??=await import('../../product-designs.js?v=feedback-followup-20261028');}

function normalizeIntegrationContext(value={}){
  const result={};
  for(const key of ['customerId','orderId','itemId','designId','variantId']){
    const id=value?.[key];
    result[key]=id==null||id===''?null:String(id);
  }
  return result;
}

function assertDurableLogoSources(logos){
  for(const logo of logos){
    for(const key of ['src','originalRasterSrc']){
      if(/^(blob:|file:)/i.test(logo?.[key]||'')){
        throw new Error(`Logo ${logo.name||''} gebruikt een tijdelijk bestand. Importeer het logo opnieuw voordat je centraal opslaat.`);
      }
    }
  }
}

function exportDesignDocument(){
  const snapshot=JSON.parse(JSON.stringify(compactDesignState()));
  assertDurableLogoSources(snapshot.l);
  return {
    format:designFormat,
    version:designFormatVersion,
    context:{...integrationContext},
    design:{flap:snapshot.f,holes:snapshot.h,logos:snapshot.l,texts:snapshot.t,ui:snapshot.u}
  };
}

function applyPortableDesignCopy(documentData){
  const query=new URLSearchParams(location.search);
  if(crmBinding||query.has('orderId')||query.has('itemId'))throw Error('Deze tab hoort bij een CRM-product. Open een losse ontwerptool via de link en plak daar de kopie. Dit product wordt niet gewijzigd.');
  const previous=cloneState(),previousHistory=history.slice(),d=documentData.design;
  if(!applyCompactState({f:d.flap,h:d.holes,l:d.logos,t:d.texts,u:d.ui}))throw Error('De ontwerpkopie kon niet worden geopend.');
  history=[...previousHistory,previous].slice(-50);redoHistory=[];updateHistoryButtons();
  integrationContext=normalizeIntegrationContext({});currentLocalDesignId=null;
  $('localDesignName').value=documentData.name?'Kopie van '+documentData.name:'Ontwerpkopie';
  const url=new URL(location.href),mode=url.searchParams.get('storage');url.search='';url.hash='';if(mode==='cloud')url.searchParams.set('storage','cloud');window.history.replaceState(null,'',url.href);
  $('shareStatus').textContent='Nieuwe losse ontwerpkopie geopend; nog niet opgeslagen of aan een klant gekoppeld.';
}

function importDesignDocument(documentData){
  if(documentData?.format!==designFormat||documentData.version!==designFormatVersion){
    throw new Error('Onbekende versie van het ontwerpformaat');
  }
  const design=documentData.design;
  if(!design?.flap||!design.holes||!Array.isArray(design.logos)||!Array.isArray(design.texts)){
    throw new Error('Het opgeslagen ontwerp is onvolledig');
  }
  const snapshot=JSON.parse(JSON.stringify(design));
  assertDurableLogoSources(snapshot.logos);
  if(!applyCompactState({f:snapshot.flap,h:snapshot.holes,l:snapshot.logos,t:snapshot.texts,u:snapshot.ui})){
    throw new Error('Het opgeslagen ontwerp kon niet worden geladen');
  }
  integrationContext=normalizeIntegrationContext(documentData.context);
  currentLocalDesignId=null;
  $('localDesignName').value='';
  return true;
}

async function loadFromDesignFileQuery(){
  const path=new URLSearchParams(location.search).get('ontwerp');
  if(!path)return false;
  const url=new URL(path,location.href);
  if(url.origin!==location.origin)throw new Error('Het ontwerpbestand moet op dezelfde server staan als de tool.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
    $('shareStatus').textContent='Ontwerpbestand laden...';
    const response=await fetch(url,{signal:controller.signal,cache:'no-store'});
    if(!response.ok)throw new Error('Het ontwerpbestand kon niet worden gevonden.');
    const documentData=await response.json();
    importDesignDocument(documentData);
    $('localDesignName').value=String(documentData.name||'');
    $('shareStatus').textContent='Ontwerpbestand geopend. Klik op Bewaar om je wijzigingen lokaal op te slaan.';
    return true;
  }finally{clearTimeout(timer);}
}

function setCentralStorageAdapter(adapter){
  if(!adapter||typeof adapter.save!=='function'||typeof adapter.load!=='function'){
    throw new TypeError('Opslagadapter moet save en load functies hebben');
  }
  centralStorageAdapter=adapter;
}

function saveCurrentLocally(){
  if(activeDesignSave)return activeDesignSave;
  const activity=beginPreviewActivity('Bezig met bewaren…',['headerSave','saveLocal']);
  activeDesignSave=performDesignSave().then(id=>{activity.success('Ontwerp bewaard.');return id;},error=>{activity.error(error);throw error;}).finally(()=>activeDesignSave=null);return activeDesignSave;
}

async function performDesignSave(){
  await previewReady;
  if(crmBindingError)throw crmBindingError;
  const workArea=document.querySelector('.app'),inert=workArea.inert;workArea.inert=true;
  $('shareStatus').textContent=crmBinding?'Ontwerp en voorbeeld bewaren bij het product…':'Ontwerp bewaren…';
  try{
    await previewPaintTick();
    if(crmBinding){
      const measurements=(await productModule()).designMeasurements(state.flap);
      state.flap.w=measurements.width/10;state.flap.h=measurements.height/10;state.flap.qty=measurements.quantity===null?'':String(measurements.quantity);syncUIFromState();render();
    }
    const id=crmBinding?.designId||currentLocalDesignId||(crypto.randomUUID?.()||('d'+Date.now().toString(36)+Math.random().toString(36).slice(2)));
    const name=$('localDesignName').value.trim()||(crmBinding?crmBinding.variantName:`Ontwerp ${new Date().toLocaleString('nl-NL')}`);
    assertDurableLogoSources(state.logos);
    const record={id,name,updatedAt:Date.now(),payload:JSON.parse(JSON.stringify(compactDesignState())),context:{...integrationContext},vectorSummary:designVectorSummary()};
    if(crmBinding)await (await productModule()).saveProductDesign(crmBinding,record,await createPreviewPngBlob());
    else await writeLocalDesign(record);
    rememberPlacementAfterSave(record.payload);
    currentLocalDesignId=id;setLocalDesignName(name);
    if(crmBinding){integrationContext=normalizeIntegrationContext(crmBinding);syncProductReturnLink();const url=new URL(location.href);url.searchParams.set('orderId',crmBinding.orderId);url.searchParams.set('itemId',crmBinding.itemId);url.searchParams.set('variant',crmBinding.variantId);url.searchParams.delete('copyVariant');url.searchParams.delete('revision');window.history.replaceState(null,'',url.href);}
    location.hash='local='+encodeURIComponent(id);
    if(!crmBinding)await renderSavedDesigns();
    return id;
  }finally{workArea.inert=inert;}
}

async function renderSavedDesigns(){
  const box=$('savedDesigns');box.replaceChildren();
  const designs=await allLocalDesigns();
  if(!designs.length){box.textContent='Nog geen lokaal bewaarde ontwerpen.';return;}
  const {savedDesignExportUrl}=await import('../download-links.js?v=four-parts-20261026'),mode=await usesCloudDesigns()?'cloud':'local';
  for(const record of designs){
    const row=document.createElement('div');row.className='list-item';
    const label=document.createElement('span');label.textContent=`${record.name} · ${new Date(record.updatedAt).toLocaleString('nl-NL')}`;
    const button=document.createElement('button');button.type='button';button.textContent='Openen';
    button.onclick=async()=>{try{await openSavedDesign(record.id);}catch(error){$('shareStatus').textContent=error.message||'Ontwerp openen mislukt.';}};
    const actions=document.createElement('div');actions.className='saved-design-actions';actions.append(button);
    for(const [kind,title] of [['png','Preview PNG'],['pdf','Vector-PDF']]){const link=document.createElement('a');link.href=savedDesignExportUrl(record.id,kind,mode);link.target='_blank';link.rel='noopener';link.textContent=title;link.setAttribute('aria-label',title+' van '+record.name+' downloaden');actions.append(link);}
    row.append(label,actions);box.append(row);
  }
}

async function openSavedDesign(id){
  const activity=beginPreviewActivity('Ontwerp openen…',['headerSave']);
  try{
  const record=await readLocalDesign(id);
  if(!record?.payload||!applyCompactState(record.payload)){
    $('shareStatus').textContent='Dit ontwerp is niet meer aanwezig in deze browser.';activity.error(new Error('Dit ontwerp is niet meer aanwezig in deze opslag.'));return false;
  }
  currentLocalDesignId=id;
  if(!crmBinding&&record.context?.orderId&&record.context?.itemId){
   integrationContext=normalizeIntegrationContext(record.context);syncProductReturnLink();
   try{crmBinding=await (await productModule()).loadProductDesign(record.context.orderId,record.context.itemId,{variantId:'new'});}catch(error){crmBindingError=error;throw error;}
   const url=new URL(location.href);url.searchParams.set('orderId',crmBinding.orderId);url.searchParams.set('itemId',crmBinding.itemId);url.searchParams.set('variant','new');window.history.replaceState(null,'',url.href);
  }
  integrationContext=normalizeIntegrationContext(crmBinding||record.context);syncProductReturnLink();
  if(crmBinding){state.flap.w=crmBinding.width?crmBinding.width/10:state.flap.w;state.flap.h=crmBinding.height?crmBinding.height/10:state.flap.h;if(!crmBinding.record||String(state.flap.qty??'').trim()!=='')state.flap.qty=String(crmBinding.quantity??'');if(state.flap.radiusAuto===true)state.flap.radius=SpatlapLayout.defaultRadius(state.flap.w,state.flap.h);syncUIFromState();render();}
  setLocalDesignName(record.name||'');
  location.hash='local='+encodeURIComponent(id);
  $('shareStatus').textContent=await usesCloudDesigns()?'Ontwerp uit centrale opslag geopend.':'Lokaal ontwerp geopend.';
  activity.success('Ontwerp geopend.');return true;
  }catch(error){activity.error(error);throw error;}
}

function boolParam(v){
  if(v==null)return null;
  return ['1','true','yes','ja','on'].includes(String(v).toLowerCase());
}

function loadFromQuery(){
  const q=new URLSearchParams(location.search);
  if(![...q.keys()].length)return false;

  const n=(k,def=null)=>{
    if(!q.has(k))return def;
    const v=Number(q.get(k));
    return Number.isFinite(v)?v:def;
  };
  const s=(k,def=null)=>q.has(k)?q.get(k):def;

  const units=q.get('unit')==='mm'?0.1:1;
  if(q.has('w'))state.flap.w=Math.max(10,n('w',state.flap.w)*units);
  if(q.has('h'))state.flap.h=Math.max(5,n('h',state.flap.h)*units);
  if(q.has('qty'))state.flap.qty=s('qty','');
  if(q.has('color')){
    const c=String(s('color')).toLowerCase();
    state.flap.color=(c==='white'||c==='wit'||c==='#ffffff'||c==='#f3f3f3')?'#f3f3f3':'#080808';
  }
  if(q.has('shape')){
    const map={square:'square',rect:'square',rectangle:'square',bottom:'bottom',roundedbottom:'bottom',all:'all',rounded:'all',shoulder:'shoulder',schouder:'shoulder'};
    state.flap.shape=map[String(s('shape')).toLowerCase()]||state.flap.shape;
  }
  if(q.has('radius')){state.flap.radius=Math.max(0,n('radius',state.flap.radius));state.flap.radiusAuto=false;}else if(state.flap.radiusAuto===true)state.flap.radius=SpatlapLayout.defaultRadius(state.flap.w,state.flap.h);
  if(q.has('shoulderInset')||q.has('shoulderTopH'))state.flap.shoulderAuto=false;
  if(q.has('shoulderInset'))state.flap.shoulderInset=Math.max(0,n('shoulderInset',state.flap.shoulderInset));
  if(q.has('shoulderTopH'))state.flap.shoulderTopH=Math.max(.5,n('shoulderTopH',state.flap.shoulderTopH));

  if(q.has('holes'))state.holes.on=boolParam(s('holes'));
  if(q.has('holeCount'))state.holes.count=Math.max(1,Math.min(20,n('holeCount',state.holes.count)));
  if(q.has('holeShape'))state.holes.shape=String(s('holeShape')).toLowerCase()==='pill'?'pill':'round';
  if(q.has('topGap'))state.holes.top=Math.max(0,n('topGap',state.holes.top));
  if(q.has('sideGap'))state.holes.side=Math.max(0,n('sideGap',state.holes.side));
  if(q.has('holeH'))state.holes.h=Math.max(.2,n('holeH',state.holes.h));
  if(q.has('holeW'))state.holes.w=Math.max(.2,n('holeW',state.holes.w));

  if(q.has('wideMode'))state.ui.wideMode=boolParam(s('wideMode'));
  if(q.has('zoneCenter'))state.ui.zoneCenter=Math.max(30,Math.min(90,n('zoneCenter',50)));
  else if(q.has('zoneSide'))state.ui.zoneCenter=100-(Math.max(5,Math.min(35,n('zoneSide',25)))*2);

  const txt=s('text',null);
  if(txt){
    state.texts.push({
      id:'tq'+Date.now(),
      text:txt,
      size:Math.max(.5,n('textSize',5)),
      color:normalizeHex(s('textColor','#FFFFFF')),
      font:s('textFont','Arimo, sans-serif'),
      tracking:textTracking(n('textTracking',0)),
      weight:textWeight(n('textWeight',700)),
      x:Math.max(0,Math.min(1,n('textX',.5))),
      y:Math.max(0,Math.min(1,n('textY',.55))),
      align:'center'
    });
  }

  syncUIFromState();
  render();
  return true;
}

function applyCompactState(x){
  if(!x||!x.f||!x.h||!Array.isArray(x.l||[])||!Array.isArray(x.t||[]))return false;
  clearArtworkFontPreview();clearVectorEditing();
  state.flap=x.f;
  if(state.flap.shape==='tapered')state.flap.shape='shoulder';
  if(state.flap.shoulderInset==null)state.flap.shoulderInset=5;
  if(state.flap.shoulderTopH==null)state.flap.shoulderTopH=5;
  state.holes=x.h;state.logos=x.l||[];
  state.logos.forEach(l=>{
    if(!l.ratio||!isFinite(l.ratio)||l.ratio<=0)l.ratio=(l.w/l.h)||1;
    if(l.svgMarkup&&!l.src)l.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(l.svgMarkup);
  });
  state.texts=x.t||[];state.ui=x.u||{wideMode:false,zones:true,zoneSide:15};
  if(state.ui.wideMode==null)state.ui.wideMode=false;
  if(state.ui.zoneSide==null)state.ui.zoneSide=15;
  state.selected=null;state.selectedType=null;clearMultiSelection();
  history=[];redoHistory=[];updateHistoryButtons();
  syncUIFromState();render();void restoreDesignFonts();return true;
}

function loadFromHash(){
  if(!location.hash.startsWith('#design='))return false;
  try{
    const x=decodeShareState(location.hash.slice(8));
    if(applyCompactState(x)){currentLocalDesignId=null;$('localDesignName').value='';return true;}
  }catch(e){}
  return false;
}

async function initDesign(){
  const activity=beginPreviewActivity('Ontwerp laden…',['headerSave']);let loadFailure=null;
  try{
  syncUIFromState();
  let loaded=false;
  const query=new URLSearchParams(location.search),hasProduct=query.has('orderId')||query.has('itemId');
  if(hasProduct){
    try{
      if(!query.get('orderId')||!query.get('itemId'))throw Error('De productkoppeling is onvolledig. Open de tool vanuit de productregel.');
      crmBinding=await (await productModule()).loadProductDesign(query.get('orderId'),query.get('itemId'),{variantId:query.get('variant')||'',copyVariantId:query.get('copyVariant')||'',revisionDocumentId:query.get('revision')||''});
      if(crmBinding.record){
        if(!applyCompactState(crmBinding.record.payload))throw Error('Het opgeslagen ontwerp kan niet worden geopend.');
        currentLocalDesignId=crmBinding.record.id;$('localDesignName').value=crmBinding.record.name;loaded=true;
      }else loadFromQuery();
      if(!$('localDesignName').value)$('localDesignName').value=crmBinding.variantName;
      integrationContext=normalizeIntegrationContext(crmBinding);syncProductReturnLink();
      if(crmBinding.width)state.flap.w=crmBinding.width/10;
      if(crmBinding.height)state.flap.h=crmBinding.height/10;
      if(!crmBinding.record||String(state.flap.qty??'').trim()!=='')state.flap.qty=String(crmBinding.quantity??'');if(state.flap.radiusAuto===true)state.flap.radius=SpatlapLayout.defaultRadius(state.flap.w,state.flap.h);syncUIFromState();render();loaded=true;
      $('saveLocal').textContent='Bewaren bij product';$('copyLocalUrl').textContent='Korte productlink';
      const variantLabel=document.createElement('label');variantLabel.className='variant-name-label';variantLabel.textContent='Naam ontwerpvariant';const variantName=document.createElement('input');variantName.id='productVariantName';variantName.type='text';variantName.maxLength=100;variantName.value=$('localDesignName').value;variantName.oninput=()=>{$('localDesignName').value=variantName.value;};$('localDesignName').addEventListener('input',()=>{variantName.value=$('localDesignName').value;});variantLabel.append(variantName);document.querySelector('.sidebar').prepend(variantLabel);

      const info=document.createElement('div');info.className='field-help';info.style.marginBottom='12px';
      info.textContent=`Order #${crmBinding.number} · ${crmBinding.company} · ${crmBinding.description}. Variant: ${crmBinding.variantName}. Bewaren bewaart deze variant; andere ontwerpen en eerdere versies blijven behouden. Varianten delen de productmaat en het aantal.`;
      $('saveLocal').closest('.share-bar').before(info);
      $('shareStatus').textContent=crmBinding.sourceNeedsReview?'De productmaat of het aantal is gewijzigd. De huidige ordermaat staat klaar; controleer de plaatsing en bewaar eerst een nieuwe versie.':crmBinding.record?'Opgeslagen productontwerp geopend.':'Nieuw ontwerp gekoppeld aan dit product.';
    }catch(error){loadFailure=error;crmBindingError=error;$('shareStatus').textContent=error.message;}
  }
  if(!hasProduct&&location.hash.startsWith('#local=')){
    try{loaded=await openSavedDesign(decodeURIComponent(location.hash.slice(7)));}
    catch(e){loadFailure=e;$('shareStatus').textContent='Lokaal ontwerp openen lukte niet.';}
  }else if(!hasProduct&&location.hash.startsWith('#design='))loaded=loadFromHash();
  else if(!hasProduct){
    try{loaded=await loadFromDesignFileQuery();}
    catch(error){loadFailure=error;$('shareStatus').textContent=error.name==='AbortError'?'Ontwerp laden duurde te lang. Open de link opnieuw.':error.message||'Ontwerpbestand openen lukte niet.';}
  }
  if(!hasProduct&&!loaded&&!loadFromQuery())render();
  try {
    await renderSavedDesigns();
    if(!crmBinding&&await usesCloudDesigns()){
      $('saveLocal').textContent='Bewaren in CRM';
      $('copyLocalUrl').textContent='Korte CRM-link';
      const savedSection=$('savedDesigns').closest('details');savedSection.querySelector('summary').textContent='Ontwerpen in CRM-opslag';
      const help=savedSection.querySelector('.field-help');
      if(help)help.textContent='Dit ontwerp wordt in de centrale CRM-opslag bewaard. De korte link opent het opgeslagen ontwerp; voor online toegang is straks je CRM-login nodig.';
    }
    if(crmBinding){const section=$('savedDesigns').closest('details');section.querySelector('summary').textContent='Een bestaand ontwerp als basis gebruiken';section.querySelector('.field-help').textContent='Je kunt een eerder los bewaard ontwerp openen. Bewaren koppelt de aangepaste kopie aan dit product; maten en aantal volgen de order.';}
  } catch(error){loadFailure=error;$('shareStatus').textContent=error.message;}
  await customFontReady;
  updateHistoryButtons();
  if(loadFailure)activity.error(loadFailure);else activity.success('Ontwerptool klaar.');
  }catch(error){activity.error(error);throw error;}
}

function designVectorSummary(){
 const entries=[...state.logos.map(isVectorLogo),...state.texts.filter(t=>String(t.text||'').trim()).map(()=>true),...(contourPath()?[true]:[])];
 const vectors=entries.filter(Boolean).length;return {version:1,total:entries.length,vectors,level:!entries.length?'empty':vectors===entries.length?'vector':vectors?'mixed':'raster'};
}
function syncProductReturnLink(){
 const context=crmBinding||integrationContext,link=$('returnToProduct'),copy=$('saveNewProductVariant');
 if(!link||!copy)return;const bound=!!context?.orderId&&!!context?.itemId;
 link.hidden=copy.hidden=!bound;if(bound){link.href='/admin/#orders/'+encodeURIComponent(context.orderId)+'/overview';link.textContent='← Naar order'+(crmBinding?.number?' #'+crmBinding.number:'');link.target='_blank';link.rel='noopener';}
}
async function saveAsNewProductVariant(){
 if(activeDesignSave||previewActivities.size)return;
 const context=crmBinding||integrationContext;if(!context?.orderId||!context?.itemId)return;
 const activity=beginPreviewActivity('Nieuwe variant bewaren…',['saveNewProductVariant','headerSave']),workArea=document.querySelector('.app'),wasInert=workArea.inert;workArea.inert=true;
 try{
  const fresh=await (await productModule()).loadProductDesign(context.orderId,context.itemId,{variantId:'new'});
  // Existing artwork remains untouched until the new binding is validated.
  const measures=(await productModule()).designMeasurements(state.flap);
  if(measures.width!==fresh.width||measures.height!==fresh.height||measures.quantity!==null&&measures.quantity!==fresh.quantity)throw Error('De ordermaat of het aantal is gewijzigd. Je artwork blijft staan. Controleer die eerst; er wordt niets overschreven.');
  const record={id:fresh.designId,name:fresh.variantName,updatedAt:Date.now(),payload:JSON.parse(JSON.stringify(compactDesignState())),context:normalizeIntegrationContext(fresh),vectorSummary:designVectorSummary()};assertDurableLogoSources(state.logos);
  await (await productModule()).saveProductDesign(fresh,record,await createPreviewPngBlob());crmBinding=fresh;crmBindingError=null;integrationContext=normalizeIntegrationContext(fresh);currentLocalDesignId=fresh.designId;setLocalDesignName(fresh.variantName);
  const url=new URL(location.href);url.searchParams.set('orderId',fresh.orderId);url.searchParams.set('itemId',fresh.itemId);url.searchParams.set('variant',fresh.variantId);url.searchParams.delete('copyVariant');url.searchParams.delete('revision');url.hash='local='+encodeURIComponent(fresh.designId);window.history.replaceState(null,'',url.href);syncProductReturnLink();activity.success('Als nieuwe ontwerpvariant bij dezelfde order bewaard.');
 }catch(error){activity.error(error);}finally{workArea.inert=wasInert;}
}
