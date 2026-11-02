// Read-only chart projections. Missing daily fields or measurement coverage stay
// unknown; a send attempt is never renamed to a received application.
const number=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const count=value=>number(value)?value:null;
const nf=value=>new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(value);
const seconds=value=>{const rounded=Math.round(value);return Math.floor(rounded/60)+'m '+rounded%60+'s';};
export const websiteMetrics={
 visits:{label:'Paginabezoeken',columns:['visits'],help:'Gemeten paginaladingen met toestemming, geen unieke bezoekers.'},
 active:{label:'Actieve tijd gemiddeld',columns:['active_seconds','visits'],unit:'time',help:'Totale actieve tijd gedeeld door gemeten paginabezoeken. Geen gemiddelde van daggemiddelden.'},
 started:{label:'Formulier begonnen',columns:['started'],help:'Paginabezoeken waarin het formulier is begonnen.'},
 submitted:{label:'Verzenden geprobeerd',columns:['submitted'],help:'Paginabezoeken met een verzendpoging. Dit bewijst niet dat de aanvraag is ontvangen.'},
 converted:{label:'Formulier ontvangen',columns:['converted'],help:'Gemeten paginabezoeken met een exact gekoppelde, ontvangen aanvraag. Ook als de verzendmeting ontbreekt.'},
 conversion:{label:'Bezoek → aanvraag',columns:['converted','visits'],unit:'percent',help:'Gemeten paginabezoeken met een ontvangen aanvraag, gedeeld door alle gemeten paginabezoeken.'},
 scroll:{label:'75% van pagina bekeken',columns:['scroll_75'],help:'Gemeten paginabezoeken die minstens 75% van de pagina bekeken.'},
 leads:{label:'Websiteaanvragen',columns:['leads'],help:'Ontvangen aanvragen op ontvangstdatum, ook zonder bezoektoestemming. Bij paginafilter alleen exact gekoppelde aanvragen van die pagina.'}
};
export const websiteMetricValue=(key,value)=>value==null?'Onbekend':websiteMetrics[key]?.unit==='time'?seconds(value):nf(value)+(websiteMetrics[key]?.unit==='percent'?'%':'');
export function websiteMetricSummary(report,key){
 const s=report.summary||{};
 if(key==='leads')return count(report.leads?.count);
 if(key==='active')return number(s.active_seconds)&&s.visits>0?s.active_seconds/s.visits:null;
 if(key==='conversion')return number(s.converted_visits)&&s.visits>0?s.converted_visits/s.visits*100:null;
 return count(s[({visits:'visits',started:'form_started',submitted:'submitted',converted:'converted_visits',scroll:'scroll_75'})[key]]);
}
function dailyMetricRows(report,key){
 const definition=websiteMetrics[key],visits=report.daily?.visits,leads=report.daily?.leads;
 if(!definition||!Array.isArray(visits)||!Array.isArray(leads))return null;
 const required=definition.columns,declared=report.daily?.metrics;
 const visitColumns=required.filter(k=>k!=='leads');
 const supported=visitColumns.every(column=>Array.isArray(declared)?declared.includes(column):['visits','started','converted'].includes(column)||visits.length>0&&visits.every(r=>number(r[column])));
 if(!supported)return null;
 const from=Number(report.since),until=Number(report.until);if(!Number.isFinite(from)||!Number.isFinite(until)||until<from||until-from>91*86400000)return null;
 const byVisit=new Map(visits.map(r=>[r.date,r])),byLead=new Map(leads.map(r=>[r.date,r]));
 const rows=[];
 let at=new Date(from);at.setUTCHours(0,0,0,0);at=+at;
 for(;at<=until;at+=86400000){
  const date=new Date(at).toISOString().slice(0,10),v=byVisit.get(date),l=byLead.get(date);
  const value=column=>{
   if(column==='leads')return l?count(l.leads):v&&number(v.visits)?0:null;
   return v?count(v[column]):null;
  };
  let amount;
  if(key==='active'||key==='conversion'){
   const denominator=value('visits'),numerator=value(key==='active'?'active_seconds':'converted');
   amount=denominator>0&&numerator!=null?numerator/denominator*(key==='conversion'?100:1):null;
  }else amount=value(required[0]);
  rows.push({date,value:amount});
 }
 return rows;
}
export const websiteComparisonKeys=['visits','scroll','started','submitted','converted'];
export function websiteMetricChart(report,{esc,metric='visits',compare=false,series=websiteComparisonKeys}={}){
 const control=`<label class="check-row"><input type="checkbox" data-website-compare ${compare?'checked':''}> Bezoeken, scrollen en formulierstappen samen vergelijken</label>`;
 if(compare)return control+websiteComparisonChart(report,{esc,series});
 const key=Object.hasOwn(websiteMetrics,metric)?metric:'visits',definition=websiteMetrics[key],rows=dailyMetricRows(report,key);
 const heading=control+`<h3 tabindex="-1" data-website-chart-heading>${esc(definition.label)} per dag</h3><p class="form-help">${esc(definition.help)}</p>`;
 if(!rows)return heading+'<p class="notice">Deze dagreeks is nog niet beschikbaar in het meetrapport. Beschikbare periodetotalen blijven hierboven staan; ontbrekende dagmetingen worden niet als nul getoond.</p>';
 const known=rows.filter(r=>r.value!=null);
 if(!known.length)return heading+'<p class="form-help">Nog geen bruikbare dagmetingen voor deze meetwaarde in deze periode.</p>';
 const max=definition.unit==='percent'?Math.max(100,...known.map(r=>r.value)):Math.max(1,...known.map(r=>r.value)),left=64,right=876,top=16,base=158,step=(right-left)/Math.max(1,rows.length),bar=Math.max(2,step*.7);
 const ticks=[0,.5,1].map(f=>`<g><line x1="${left}" x2="${right}" y1="${base-f*(base-top)}" y2="${base-f*(base-top)}"/><text x="${left-8}" y="${base-f*(base-top)+4}" text-anchor="end">${esc(websiteMetricValue(key,max*f))}</text></g>`).join('');
 const bars=rows.map((r,i)=>r.value==null?'':`<rect class="analytics-trend-visits" x="${left+i*step+(step-bar)/2}" y="${base-r.value/max*(base-top)}" width="${bar}" height="${r.value/max*(base-top)}" rx="2"><title>${esc(r.date+': '+websiteMetricValue(key,r.value))}</title></rect>`).join('');
 const dates=rows.filter((_,i)=>i===0||i===rows.length-1||i%Math.max(1,Math.ceil(rows.length/6))===0).map(r=>`<text x="${left+(rows.indexOf(r)+.5)*step}" y="183" text-anchor="middle">${esc(r.date.slice(8)+'/'+r.date.slice(5,7))}</text>`).join('');
 return heading+`<p class="form-help">Per dag · UTC. ${esc(report.scope?.page||'Alle pagina’s')} · laatste ${esc(report.days)} dagen.</p><div class="analytics-trend-scroll"><svg class="analytics-trend" viewBox="0 0 900 200" role="img" aria-label="${esc(definition.label+' per dag')}"><title>${esc(definition.label+' per dag')}</title>${ticks}${bars}${dates}</svg></div><details class="website-details analytics-day-values"><summary>Dagcijfers bekijken</summary><div class="tablewrap"><table><thead><tr><th scope="col">Datum (UTC)</th><th scope="col">${esc(definition.label)}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(websiteMetricValue(key,r.value))}</td></tr>`).join('')}</tbody></table></div></details><p class="form-help">Eerste en laatste dag kunnen onvolledig zijn. Dagen zonder dagmetingen blijven onbekend, ook tussen gemeten dagen; een eerste meting bewijst geen doorlopende dekking. Geen actieve tijd of conversiepercentage zonder gemeten bezoeken. Ontvangen aanvragen kunnen op een andere dag vallen dan het begin van het bezoek.</p>`;
}
export function websiteMetricCard({esc,metric,label,value,sub='',selected=false}){
 return `<button type="button" class="card website-metric" data-website-metric="${metric}" aria-pressed="${selected}"><span class="muted">${esc(label)}</span><strong>${esc(String(value))}</strong><small>${esc(sub)}</small><span class="website-metric-action">Dagcijfers bekijken →</span></button>`;
}

function websiteComparisonChart(report,{esc,series:selected}){
 const keys=websiteComparisonKeys.filter(key=>selected.includes(key)),series=keys.map(key=>({key,rows:dailyMetricRows(report,key)})),available=series.filter(s=>s.rows?.some(r=>r.value!=null));
 const choices=`<fieldset class="website-series-options"><legend>Welke dagreeksen wil je vergelijken?</legend>${websiteComparisonKeys.map(key=>`<label class="check-row website-series-label website-series-${key}"><input type="checkbox" data-website-series="${key}" ${keys.includes(key)?'checked':''}>${esc(websiteMetrics[key].label)}</label>`).join('')}</fieldset>`;
 const header=choices+'<h3 tabindex="-1" data-website-chart-heading>Websitegebruik samen per dag</h3><p class="form-help">Eén schaal in aantallen paginabezoeken. Verzenden geprobeerd is geen bewijs van ontvangst. Houd een punt aan voor het dagcijfer; alle waarden staan ook in de tabel.</p>';
 if(!keys.length)return header+'<p class="form-help">Kies minstens één dagreeks hierboven.</p>';
 if(!available.length)return header+'<p class="notice">Nog geen bruikbare dagreeksen. Ontbrekende metingen blijven onbekend.</p>';
 const dates=available[0].rows.map(r=>r.date),max=Math.max(1,...available.flatMap(s=>s.rows.filter(r=>r.value!=null).map(r=>r.value))),left=64,right=876,top=16,base=158,step=(right-left)/Math.max(1,dates.length),x=i=>left+(i+.5)*step,y=value=>base-value/max*(base-top);
 const ticks=[0,.5,1].map(f=>`<g><line x1="${left}" x2="${right}" y1="${y(max*f)}" y2="${y(max*f)}"/><text x="${left-8}" y="${y(max*f)+4}" text-anchor="end">${esc(nf(max*f))}</text></g>`).join('');
 const lines=available.map(({key,rows})=>{let path='',continuing=false;for(let i=0;i<rows.length;i++){const r=rows[i];if(r.value==null){continuing=false;continue;}path+=(continuing?' L':' M')+x(i)+' '+y(r.value);continuing=true;}return `<g class="website-series website-series-${key}"><path d="${path}"/>${rows.map((r,i)=>r.value==null?'':`<circle cx="${x(i)}" cy="${y(r.value)}" r="3"><title>${esc(r.date+' · '+websiteMetrics[key].label+': '+websiteMetricValue(key,r.value))}</title></circle>`).join('')}</g>`;}).join('');
 const axis=dates.map((date,i)=>i===0||i===dates.length-1||i%Math.max(1,Math.ceil(dates.length/6))===0?`<text x="${x(i)}" y="183" text-anchor="middle">${esc(date.slice(8)+'/'+date.slice(5,7))}</text>`:'').join('');
 return header+`<div class="analytics-trend-legend">${series.map(({key,rows})=>`<span class="website-series-label website-series-${key}">${esc(websiteMetrics[key].label)}${!rows?' · nog niet beschikbaar':!rows.some(row=>row.value!=null)?' · nog geen dagmetingen':''}</span>`).join('')}</div><div class="analytics-trend-scroll"><svg class="analytics-trend" viewBox="0 0 900 200" role="img" aria-label="Bezoeken, scrollen en formulierstappen per dag"><title>Websitegebruik per dag · UTC</title>${ticks}${lines}${axis}</svg></div><details class="website-details"><summary>Alle dagcijfers bekijken</summary><div class="tablewrap"><table><thead><tr><th>Datum (UTC)</th>${keys.map(key=>`<th>${esc(websiteMetrics[key].label)}</th>`).join('')}</tr></thead><tbody>${dates.map((date,i)=>`<tr><td>${esc(date)}</td>${series.map(({key,rows})=>`<td>${esc(websiteMetricValue(key,rows?.[i]?.value??null))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details><p class="form-help">Eerste en laatste dag kunnen onvolledig zijn. Dagen zonder bezoekmetingen blijven onbekend, ook na de eerste meting; lijnen lopen niet door zulke dagen heen. Elke reeks telt bezoeken waarin die stap gebeurde, geen unieke personen. Een aanvraag kan later zijn ontvangen dan het begin van het bezoek.</p>`;
}
