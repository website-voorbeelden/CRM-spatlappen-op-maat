(function () {
  'use strict';

  var Core = window.QuoteCalculatorCore;
  var Nesting = window.GasketConfiguratorNesting;
  var root = document.querySelector('[data-quote-calculator]');
  if (!root || !Core || !Nesting) return;

  var state = loadInitialState();
  // Seed previously empty foreign-currency quotes once, without resetting a field while typing.
  state.scenarios.forEach(function (scenario) {
    if (scenario.currency !== 'EUR' && !(scenario.exchangeRate > 0) && Core.referenceExchangeRates[scenario.currency]) {
      scenario.exchangeRate = Core.referenceExchangeRates[scenario.currency];
    }
  });
  var messageTimer = null;
  var previewPages = {};
  var lastCalculation = null;
  var selectedScenario = Math.max(0, state.scenarios.findIndex(function (scenario) { return scenario.id === state.selectedScenarioId; }));
  var openDetails = new Set();
  var chartWorker = null;
  var chartTimer = null;
  var chartRequest = 0;
  var chartKey = '';
  var chartHtml = '';
  var chartPending = false;
  var scriptUrl = new URL(document.currentScript ? document.currentScript.src : window.location.href);
  var chartWorkerUrl = new URL('./quote-calculator-chart-worker.js' + scriptUrl.search, scriptUrl).href;

  function refresh(container, html) {
    window.QuoteCalculatorView.update(container, html, openDetails, root);
  }
  function expandDetail(key) {
    openDetails.add(key);
    var detail = root.querySelector('[data-detail="' + key + '"]');
    if (detail) detail.open = true;
  }
  root.addEventListener('toggle', function (event) {
    var el = event.target;
    if (el.isConnected && el.dataset.detail) {
      if (el.open) openDetails.add(el.dataset.detail); else openDetails.delete(el.dataset.detail);
      if(el.open&&el.dataset.detail.startsWith('holes-'))render();
    }
  }, true);

  // Let the browser scroll normally instead of changing a focused number field.
  root.addEventListener('wheel', function (event) {
    var active = document.activeElement;
    if (!event.ctrlKey && active === event.target && active.tagName === 'INPUT' && active.type === 'number') active.blur();
  }, { capture: true, passive: true });

  function loadInitialState() {
    var hash = window.location.hash || '';
    if (hash.indexOf('#calc=') === 0) {
      try {
        return Core.decodeState(hash.slice(6));
      } catch (error) {
        console.warn('Opgeslagen berekening kon niet worden geopend.', error);
      }
    }
    try {
      return Core.parseReadableUrl(window.location.search) || Core.defaultState();
    } catch (error) {
      console.warn('URL-invoer kon niet worden gelezen.', error);
      return Core.defaultState();
    }
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function money(value) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0);
  }

  function num(value, decimals) {
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals == null ? 2 : decimals
    }).format(Number(value) || 0);
  }

  function identity(label, record, kind) {
    return '<span class="qcalc__identity" style="--identity-color:' + Core.colorFor(record, kind) + '"><i aria-hidden="true"></i>' + esc(label) + '</span>';
  }

  function input(label, path, value, options) {
    options = options || {};
    return '<label class="qcalc__field' + (options.wide ? ' qcalc__field--wide' : '') + '">' +
      '<span>' + esc(label) + '</span>' +
      '<input data-path="' + esc(path) + '" data-kind="' + (options.kind || 'number') + '"' +
      ' type="' + (options.type || (options.kind === 'text' ? 'text' : 'number')) + '"' +
      (options.min != null ? ' min="' + options.min + '"' : '') +
      (options.step != null ? ' step="' + options.step + '"' : '') +
      (options.max != null ? ' max="' + options.max + '"' : '') +
      (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') +
      ' value="' + esc(value) + '">' +
      (options.help ? '<small>' + esc(options.help) + '</small>' : '') +
      '</label>';
  }

  function select(label, path, value, options, wide) {
    return '<label class="qcalc__field' + (wide ? ' qcalc__field--wide' : '') + '">' +
      '<span>' + esc(label) + '</span>' +
      '<select data-path="' + esc(path) + '">' + options.map(function (option) {
        return '<option value="' + esc(option[0]) + '"' + (option[0] === value ? ' selected' : '') + '>' + esc(option[1]) + '</option>';
      }).join('') + '</select></label>';
  }

  function setPath(object, path, value) {
    var parts = path.split('.');
    var target = object;
    for (var i = 0; i < parts.length - 1; i++) target = target[parts[i]];
    target[parts[parts.length - 1]] = value;
  }

  function pieceName(piece, index) {
    return String(piece.name || '').trim() || 'Stuk ' + (index + 1);
  }

  function pieceTitle(piece, index) {
    var shape = piece.process === 'saw'
      ? 'Zaagdeel'
      : ({ circle: 'Cirkel / ring', rect: 'Rechthoek', manhole: 'Mangatvorm', lshape: 'L-vorm', polygon: 'Vrije contour', cad: 'Bestandcontour' }[piece.shape] || 'Freesdeel');
    return pieceName(piece, index) + ' · ' + shape;
  }

  function geometryDetails(piece) {
    var normalized = Core.normalizeState({pieces:[piece],scenarios:[{id:'geometry-check'}]}).pieces[0];
    var errors = window.GasketV2Geometry.validate(normalized), holes = window.GasketV2Geometry.parseHoles(normalized).holes;
    return (errors.length ? '<div class="v2-errors qcalc__field--full" role="status">'+errors.map(esc).join('<br>')+'</div>' : '<p class="v2-note qcalc__field--full">Snijlengte per stuk: '+num(window.GasketV2Geometry.cutLength(normalized),2)+' mm'+'</p>') +
      (holes.length ? '<table class="v2-hole-table qcalc__field--full"><caption>Exacte gatposities · mm</caption><thead><tr><th>Gat</th><th>X</th><th>Y</th><th>Ø</th></tr></thead><tbody>'+holes.map(function(h,i){return '<tr><td>'+(i+1)+'</td><td>'+num(h.x,2)+'</td><td>'+num(h.y,2)+'</td><td>'+num(2*h.r,2)+'</td></tr>';}).join('')+'</tbody></table>' : '');
  }
  function rubberSettings(s,index) {
    var path='scenarios.'+index+'.';
    return '<section class="v2-rubber"><h4>Rekenwijze</h4><div class="qcalc__fields">'+
      select('Bewerking berekenen',path+'rubberAuto',s.rubberAuto?'yes':'no',[['no','Eenvoudig · eigen bedragen of tijden'],['yes','Snijlengte · eigen snelheid en uurtarief']],true)+
      (s.rubberAuto?input('Uurtarief €',path+'rubberHourRate',s.rubberHourRate??'',{min:0,step:.1})+input('Snijsnelheid mm/min',path+'rubberCutSpeed',s.rubberCutSpeed??'',{min:.01,step:10})+input('Insteltijd per aanvraag min',path+'rubberSetupMinutes',s.rubberSetupMinutes??0,{min:0,step:.1})+input('Aanzettijd per contour sec',path+'rubberPierceSeconds',s.rubberPierceSeconds??0,{min:0,step:.1}):'')+
      '</div><p class="v2-note">Vul de tarieven van deze leverancier in. Bij rekenen op snijlengte tellen ook de gaten mee; insteltijd geldt eenmaal per aanvraag.</p></section>';
  }
  function renderPiece(piece,index) {
    var path='pieces.'+index+'.',normalized=Core.normalizeState(state).pieces[index],shapeFields='';
    if(piece.shape==='cad') {var cad=window.CadV2.read(piece.cadGeometry);shapeFields='<p class="v2-note qcalc__field--full">Uit '+esc(cad.format)+' · '+num(piece.width,2)+' × '+num(piece.height,2)+' mm. De bestandcontour blijft behouden.</p>';}
    else if(piece.shape==='polygon'||piece.shape==='lshape')shapeFields='<p class="v2-note qcalc__field--full">Je bestaande contour blijft behouden.</p>';
    else if(piece.shape==='circle')shapeFields=input('Buitendiameter (mm)',path+'outerDiameter',piece.outerDiameter,{min:1,step:1})+(piece.opening==='circle'?input('Diameter middengat (mm)',path+'innerDiameter',piece.innerDiameter,{min:0,step:1}):'');
    else shapeFields=input(piece.shape==='manhole'?'Lengte totaal (mm)':'Lengte (mm)',path+'width',piece.width,{min:1,step:1})+input(piece.shape==='manhole'?'Hoogte / diameter (mm)':'Breedte (mm)',path+'height',piece.height,{min:1,step:1})+(piece.opening==='circle'?input('Diameter middengat (mm)',path+'innerDiameter',piece.innerDiameter,{min:1,step:1}):'')+(piece.opening==='rect'?input('Binnenlengte (mm)',path+'innerWidth',piece.innerWidth,{min:1,step:1})+input('Binnenbreedte (mm)',path+'innerHeight',piece.innerHeight,{min:1,step:1}):'');
    var more='<details data-detail="piece-more-'+piece.id+'" id="v2-piece-more-'+index+'" class="v2-piece-more"><summary>Andere vorm, gaten &amp; extra opties'+(normalized.holes?' · '+normalized.holes+' gaten':'')+'</summary><div class="v2-piece-options">'+window.PackingV2.shapes(piece,index)+window.PackingV2.variants(normalized,index)+window.PackingV2.controls(normalized,index)+(piece.shape==='rect'&&piece.opening!=='none'?select('Vorm open midden',path+'opening',piece.opening,[['rect','Vierkant'],['circle','Rond']]):'')+(piece.shape==='circle'&&piece.opening==='rect'?input('Binnenlengte (mm)',path+'innerWidth',piece.innerWidth,{min:1,step:1})+input('Binnenbreedte (mm)',path+'innerHeight',piece.innerHeight,{min:1,step:1}):'')+window.PackingV2.extraHoles(normalized,index,openDetails.has('holes-'+piece.id))+(piece.shape==='circle'?'<button type="button" class="qcalc__textBtn" data-action="bolt-circle" data-index="'+index+'">Uitgebreide boutcirkelinstellingen</button>':'')+select('Bewerking',path+'process',piece.process,[['saw','Zagen'],['mill','Frezen / snijden']])+(piece.shape==='rect'?input('Hoeken afronden (mm)',path+'cornerRadius',piece.cornerRadius,{min:0,step:1}):'')+'<button class="qcalc__textBtn" type="button" data-action="piece-file" data-index="'+index+'">Vorm uit DXF / STEP importeren</button>'+(state.pieces.length>1?'<button type="button" class="qcalc__textBtn" data-action="remove-piece" data-index="'+index+'">Stuk verwijderen</button>':'')+'<details data-detail="drawing-'+piece.id+'"><summary>Tekeninggegevens</summary>'+geometryDetails(piece)+'</details></div></details>';
    return '<article class="qcalc__piece v2-friendly-piece" aria-label="'+esc(pieceTitle(piece,index))+'"><div class="qcalc__pieceLayout"><div class="v2-piece-inputs">'+pieceBasics(piece,index)+'<div class="qcalc__fields qcalc__pieceGeometry">'+shapeFields+'</div></div><div class="qcalc__piecePreview" data-piece-preview="'+index+'">'+window.QuoteCalculatorPreview.renderPiece(normalized,index)+'<div class="v2-preview-downloads"><button class="qcalc__textBtn" type="button" data-action="dxf" data-index="'+index+'">DXF downloaden</button><button type="button" class="qcalc__textBtn" data-action="svg" data-index="'+index+'">SVG downloaden</button></div></div></div>'+more+'</article>';
  }

  function currencyUnit(scenario) {
    return scenario.currency === 'TRY' ? 'TRY' : scenario.currency === 'CNY' ? 'CNY' : '€';
  }

  function currencyFields(scenario, index) {
    var references = Core.referenceExchangeRates;
    var date = references.date.split('-').reverse().join('-');
    var help = scenario.exchangeRate > 0
      ? '1 ' + scenario.currency + ' ≈ ' + new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(1 / scenario.exchangeRate) + ' · '
      : '';
    help += scenario.exchangeRate === references[scenario.currency] ? 'ECB-richtkoers ' + date + ' · aanpasbaar' : 'Eigen / opgeslagen koers';
    return select('Invoervaluta', 'scenarios.' + index + '.currency', scenario.currency, [
      ['EUR', 'EUR · Euro'], ['TRY', 'TRY · Turkse lira'], ['CNY', 'CNY · Chinese yuan']
    ]) + (scenario.currency !== 'EUR' ? input('1 EUR = … ' + scenario.currency, 'scenarios.' + index + '.exchangeRate', scenario.exchangeRate || '', {
      min: 0.000001, step: 0.0001, help: help
    }) : '');
  }

  function materialPriceField(scenario, scenarioIndex, group) {
    var rate = scenario.rates[group.key];
    var label = 'Materiaalprijs ' + currencyUnit(scenario) + '/' + (rate.unit === 'sheet' ? 'plaat' : 'm²');
    return '<label class="qcalc__field"><span>' + esc(label) + '</span><input type="number" min="0" step="0.01" value="' + esc(rate.price>0?rate.price:'') + '" data-rate-scenario="' + scenarioIndex + '" data-rate-key="' + encodeURIComponent(group.key) + '" data-rate-field="price"></label>';
  }

  function renderRateFields(scenario, scenarioIndex, groups) {
    return groups.map(function (group) {
      var rate = scenario.rates[group.key];
      var encodedKey = encodeURIComponent(group.key);
      return '<div class="qcalc__rateRow"><div><strong>' + esc(group.material) + '</strong><small>' + num(group.thickness, 1) + ' mm</small></div>' +
        '<label><span>Prijsbasis</span><select data-rate-scenario="' + scenarioIndex + '" data-rate-key="' + encodedKey + '" data-rate-field="unit">' +
        '<option value="m2"' + (rate.unit === 'm2' ? ' selected' : '') + '>Per m²</option>' +
        '<option value="sheet"' + (rate.unit === 'sheet' ? ' selected' : '') + '>Per plaat</option></select></label>' +
        materialPriceField(scenario, scenarioIndex, group) + '</div>';
    }).join('');
  }

  function quoteFields(scenario, index) {
    var path = 'scenarios.' + index + '.';
    if (scenario.costSource === 'quote_total') return input('Offerte totaal ' + currencyUnit(scenario), path + 'quotedTotal', scenario.quotedTotal, { min: 0, step: 1 });
    if (scenario.costSource === 'quote_per_piece') return state.pieces.map(function (piece, pieceIndex) {
      return input(pieceName(piece, pieceIndex) + ' · offerte ' + currencyUnit(scenario) + '/st.', path + 'quotedUnitPrices.' + piece.id, scenario.quotedUnitPrices[piece.id], { min: 0, step: 1 });
    }).join('');
    return '';
  }

  function costSourceField(scenario, index) {
    return select('Kostprijs op basis van', 'scenarios.' + index + '.costSource', scenario.costSource, [
      ['calculated', 'Materiaal + bewerkingen'], ['quote_per_piece', 'Offerte per stuk'], ['quote_total', 'Offerte totaal']
    ]);
  }

  function quoteStatusField(label, path, value, inherit) {
    var options = inherit ? [['', 'Leveranciersinstelling'], ['included', 'Inbegrepen in offerte'], ['extra', 'Apart berekend']]
      : [['included', 'Inbegrepen in offerte'], ['extra', 'Apart berekend']];
    return select(label, path, value, options);
  }

  function pieceCostFields(scenario, index) {
    var quoted = scenario.costSource !== 'calculated';
    if (!quoted && !state.pieces.some(function (piece) { return piece.holes > 0; })) return '';
    return '<details class="qcalc__subsection" data-detail="piece-costs-' + scenario.id + '"><summary>' +
      (quoted ? 'Offerte-uitzonderingen per stukregel' : 'Tarieven per stukregel') +
      '</summary><p class="qcalc__hint">' +
      (quoted ? 'Weggelaten offerte-uitzonderingen volgen de instelling van de leverancier. Een afwijkend tarief vervangt het standaardtarief voor deze stukregel.' : 'Een afwijkend tarief vervangt het standaardtarief voor deze stukregel.') +
      '</p>' + state.pieces.map(function (piece, pieceIndex) {
      var record = scenario.pieceCosts[piece.id];
      var quoteControls = quoted
        ? quoteStatusField('Zagen/frezen in offerte', 'scenarios.' + index + '.pieceCosts.' + piece.id + '.quoteProcessOverride', record.quoteProcessOverride, true) +
          (piece.holes > 0 ? quoteStatusField('Gaten in offerte', 'scenarios.' + index + '.pieceCosts.' + piece.id + '.quoteHolesOverride', record.quoteHolesOverride, true) : '')
        : '';
      var processExtra = quoted && (record.quoteProcessOverride || scenario.quoteProcess) === 'extra';
      var holesExtra = quoted && (record.quoteHolesOverride || scenario.quoteHoles) === 'extra';
      var lineCostOptions = quoted
        ? select('Tarieven voor dit stuk', 'scenarios.' + index + '.pieceCosts.' + piece.id + '.mode', record.mode, [['default', 'Standaardtarieven'], ['custom', 'Afwijkende tarieven']])
        : '';
      var customFields = record.mode === 'custom'
        ? (scenario.costSource === 'calculated' || processExtra ? costFields(scenario, index, piece.process, pieceIndex) : '') +
          (piece.holes > 0 && (scenario.costSource === 'calculated' || holesExtra || Core.pieceCostSettings(scenario, piece).holeCost.performedBy === 'own')
            ? costFields(scenario, index, 'holeCost', pieceIndex) : '')
        : '';
      return '<div class="qcalc__subsection"><h4>' + identity(pieceName(piece, pieceIndex), piece, 'piece') + '</h4>' +
        quoteControls + lineCostOptions + customFields + '</div>';
    }).join('') + '</details>';
  }

  function costFields(scenario, index, kind, pieceIndex) {
    var isHole = kind === 'holeCost';
    var settings = pieceIndex == null ? null : Core.pieceCostSettings(scenario, state.pieces[pieceIndex]);
    var setting = settings ? (isHole ? settings.holeCost : settings.processCost) : (isHole ? scenario.holeCost : scenario.processCosts[kind]);
    var unit = isHole && setting.performedBy === 'own' ? '€' : currencyUnit(scenario);
    var path = 'scenarios.' + index + '.' + (settings ? 'pieceCosts.' + state.pieces[pieceIndex].id + '.' + (isHole ? 'holeCost' : 'processCost') : (isHole ? kind : 'processCosts.' + kind)) + '.';
    var who = isHole ? select('Uitgevoerd door', path + 'performedBy', setting.performedBy || 'supplier', [['supplier', 'Leverancier'], ['own', 'Eigen werkplaats']]) : '';
    var quoteHolesIncluded = isHole && scenario.costSource !== 'calculated' && scenario.quoteHoles !== 'extra';
    if (isHole && scenario.costSource !== 'calculated' && pieceIndex != null) {
      var override = scenario.pieceCosts[state.pieces[pieceIndex].id] || {};
      quoteHolesIncluded = !((override.quoteHolesOverride || scenario.quoteHoles) === 'extra');
    } else if (isHole && scenario.costSource !== 'calculated') {
      quoteHolesIncluded = !state.pieces.some(function (piece) {
        var override = scenario.pieceCosts[piece.id] || {};
        return piece.holes > 0 && (override.quoteHolesOverride || scenario.quoteHoles) === 'extra';
      });
    }
    if (isHole && scenario.costSource !== 'calculated' && setting.performedBy !== 'own' && quoteHolesIncluded) {
      return '<div class="qcalc__costLine"><div><strong>Gaten</strong><small>Leveranciersgaten zijn inbegrepen in de offerte.</small></div>' + who + '</div>';
    }
    return '<div class="qcalc__costLine">' +
      '<div><strong>' + (isHole ? 'Gaten' : (kind === 'saw' ? 'Zagen' : 'Frezen')) + '</strong>' +
      '<small>' + (settings ? 'Alleen voor deze stukregel' : 'Standaardtarief; afwijkingen per stuk staan hieronder') + '</small></div>' + who +
      select('Rekenmethode', path + 'mode', setting.mode, isHole
        ? [['per_hole', unit + ' per gat'], ['minutes', 'Minuten per gat']]
        : [['per_piece', unit + ' per stuk'], ['minutes', 'Minuten per stuk']]) +
      input(setting.mode === 'minutes' ? 'Tijd in minuten' : 'Bedrag ' + unit, path + 'value', setting.value, { min: 0, step: 1 }) +
      (setting.mode === 'minutes' ? input('Uurtarief ' + unit, path + 'hourlyRate', setting.hourlyRate, { min: 0, step: 1 }) : '') +
      '</div>';
  }

  function renderScenario(scenario, index, groups) {
    var hasHoles = state.pieces.some(function (piece) { return piece.holes > 0; });
    var hasExtraQuotedProcess = scenario.quoteProcess === 'extra' || state.pieces.some(function (piece) {
      var override = scenario.pieceCosts[piece.id] || {};
      return (override.quoteProcessOverride || scenario.quoteProcess) === 'extra';
    });
    return '<article class="qcalc__scenario" aria-label="' + esc(scenario.name) + '">' +
      (state.scenarios.length > 1 ? '<header class="qcalc__editorActions"><button type="button" class="qcalc__textBtn qcalc__textBtn--danger" data-action="remove-scenario" data-index="' + index + '">Leverancier verwijderen</button></header>' : '') +
      '<div class="qcalc__fields qcalc__fields--scenario">' + input('Naam leverancier', 'scenarios.' + index + '.name', scenario.name, { kind: 'text', type: 'text', wide: true }) + costSourceField(scenario, index) + (scenario.currency!=='EUR'?currencyFields(scenario,index):'') + quoteFields(scenario, index) +
      (scenario.costSource !== 'calculated' ? quoteStatusField('Zagen/frezen in offerte', 'scenarios.' + index + '.quoteProcess', scenario.quoteProcess) +
        (hasHoles ? quoteStatusField('Gaten in offerte', 'scenarios.' + index + '.quoteHoles', scenario.quoteHoles) : '') : '') + '</div>' +
      (scenario.costSource !== 'calculated' ? '<p class="qcalc__notice">De offerte vervangt de berekende materiaalkosten. Leveranciersbewerkingen zijn alleen inbegrepen wanneer dit zo is ingesteld; apart berekende bewerkingen komen erbij. Transport, invoerrechten, overige kosten en eigen gatenwerk worden apart bijgehouden. ' + (scenario.costSource === 'quote_total' ? 'Het offertetotaal blijft vast bij een ander aantal: controleer dan de offerte opnieuw. Bij meerdere stukregels wordt het bedrag naar aantal verdeeld.' : 'Iedere regel heeft een offerteprijs per stuk, die wordt vermenigvuldigd met het aantal.') + '</p>' : '') +
      '<div class="qcalc__subsection"><h4>' + (scenario.costSource === 'calculated' ? 'Materiaal' : 'Plaatmaten · alleen voor de tekening') + '</h4><div class="qcalc__fields qcalc__sheetFields">' +
      input('Plaatlengte mm', 'scenarios.' + index + '.sheetWidth', scenario.sheetWidth, { min: 1, step: 1 }) +
      input('Plaatbreedte mm', 'scenarios.' + index + '.sheetHeight', scenario.sheetHeight, { min: 1, step: 1 }) + '</div>' +
      (scenario.costSource === 'calculated' ? renderRateFields(scenario, index, groups) : '') + '</div>' +
      (scenario.rubberAuto && scenario.costSource === 'calculated' ? '<p class="v2-note">Bewerkingskosten volgen de ingevoerde snelheid en het uurtarief. Extra gaten zijn in de snijlengte inbegrepen.</p>' : '<div class="qcalc__subsection"><h4>Bewerkingskosten</h4>' + (scenario.costSource === 'calculated' || hasExtraQuotedProcess ? ['saw', 'mill'].filter(function (process) {
        return state.pieces.some(function (piece) { return piece.process === process; });
      }).map(function (process) { return costFields(scenario, index, process); }).join('') : '') + (hasHoles ? costFields(scenario, index, 'holeCost') : '') + pieceCostFields(scenario, index) + '</div>') +
      '<details class="qcalc__subsection v2-supplier-options" data-detail="supplier-more-' + scenario.id + '"><summary>Extra opties · snijtijd, valuta &amp; bijkomende kosten</summary>' + rubberSettings(scenario,index) +
      (scenario.currency==='EUR'?'<div class="qcalc__fields">'+currencyFields(scenario,index)+'</div>':'') +
      '<p class="qcalc__hint">Leverancierstarieven in '+esc(scenario.currency)+', uitkomsten in EUR. Controleer je tarieven na een valutawijziging.</p><div class="qcalc__fields qcalc__logisticsFields">' +
      input('Transport totaal ' + currencyUnit(scenario), 'scenarios.' + index + '.transport', scenario.transport, { min: 0, step: 1 }) +
      input('Invoerrechten %', 'scenarios.' + index + '.dutyPct', scenario.dutyPct, { min: 0, step: 1, help: 'Over goederen plus transport' }) +
      input('Overige kosten ' + currencyUnit(scenario), 'scenarios.' + index + '.other', scenario.other, { min: 0, step: 1 }) +
      '</div></details></article>';
  }

  function pricingField(label, mode, value, index, min, max, pieceIndex) {
    var scenario = state.scenarios[index];
    var intent = pieceIndex == null ? (scenario.pricing || { mode: 'marginPct' }) : (scenario.linePricing || {})[state.pieces[pieceIndex].id];
    var active = intent && intent.mode === mode && (pieceIndex != null || !Object.keys(scenario.linePricing || {}).length);
    return '<label class="qcalc__field' + (active ? ' qcalc__field--activePrice' : '') + '"><span>' + label + '</span><input type="number" step="1" data-pricing="' + mode +
      '" data-scenario="' + index + '" value="' + (value === '' ? '' : Math.round(value * 100) / 100) + '"' +
      (min == null ? '' : ' min="' + min + '"') + (max == null ? '' : ' max="' + max + '"') + '></label>';
  }

  function editor(key, title, summary, content) {
    return '<section class="qcalc__panel v2-entry-card" data-detail="' + esc(key) + '" data-edit-scope="' + esc(key) + '"><header class="v2-entry-heading"><strong>' + title +
      '</strong><span>' + esc(summary) + '</span></header>' + content + '</section>';
  }

  function lineField(label, mode, value, scenarioIndex, pieceIndex, min, max) {
    return pricingField(label, mode, value, scenarioIndex, min, max, pieceIndex)
      .replace('data-pricing=', 'data-line="' + pieceIndex + '" data-pricing=');
  }

  function renderDashboard(calculation) {
    selectedScenario = Math.min(selectedScenario, state.scenarios.length - 1);
    var result = calculation.scenarios[selectedScenario];
    var scenario = state.scenarios[selectedScenario];
    var single = state.pieces.length === 1;
    var qty = calculation.quantity;
    var intent = scenario.pricing || { mode: 'marginPct', value: state.marginPct };
    var lineOverrides = Object.keys(scenario.linePricing || {}).length > 0;
    var margin = intent.mode === 'marginPct' && !lineOverrides ? intent.value : result.marginPct;
    var complete = result.priceComplete && !result.errors.length;
    var pieceCosts = result.materialCost + result.processCost + result.holeCost + result.quoteCost;
    var hasAdditionalCosts = result.transport + result.duty + result.other > 0;
    function priceValue(mode, value) { return complete ? value : intent.mode === mode ? intent.value : ''; }
    function resultMoney(value) { return complete ? money(value) : '—'; }
    var costRows = [
      ['Materiaal', result.materialCost], ['Bewerking', result.processCost + result.holeCost], ['Transport', result.transport]
    ];
    if (scenario.costSource !== 'calculated') costRows = [
      ['Offerte leverancier', result.quoteCost],
      ['Leveranciersbewerkingen apart', result.processCost + result.holeCost - result.ownHoleCost],
      ['Eigen gatenwerk', result.ownHoleCost],
      ['Transport', result.transport]
    ];
    if (result.duty > 0) costRows.push(['Invoerrechten', result.duty]);
    if (result.other > 0) costRows.push(['Overig', result.other]);
    var costSummary = '<table class="qcalc__costSummary"><caption>Uitsplitsing kostprijs</caption><thead><tr><th scope="col">Kostenpost</th><th scope="col">Aanvraag</th>' +
      (single ? '<th scope="col">Per stuk</th>' : '') + '</tr></thead><tbody>' + costRows.map(function (row) {
        return '<tr><th scope="row">' + row[0] + '</th><td>' + resultMoney(row[1]) + '</td>' +
          (single ? '<td>' + resultMoney(row[1] / qty) + '</td>' : '') + '</tr>';
      }).join('') + '</tbody></table>' +
      '<small>Transport is één bedrag voor de hele aanvraag. Het bedrag per stuk is een verdeling van die kosten.</small>';
    var selector = state.scenarios.length > 1
      ? '<label class="qcalc__field"><span>Leverancier / uitvoering</span><select data-selected-scenario>' +
        state.scenarios.map(function (s, i) { return '<option value="' + i + '"' + (i === selectedScenario ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select></label>'
      : '';
    selector = '<div class="qcalc__supplierControl" style="--identity-color:' + Core.colorFor(scenario, 'supplier') + '">' + (selector || '<div class="v2-selected-supplier"><span>Leverancier</span><strong>' + esc(scenario.name) + '</strong></div>') + '</div>';
    var missingSpecs = state.pieces.map(function(p,i){var fields=[];if(!p.material.trim())fields.push('materiaal');if(!(p.thickness>0))fields.push('dikte');var size=window.GasketV2Geometry.dimensions(p);if(!(size.w>0&&size.h>0))fields.push('buitenmaat');return fields.length?{index:i,fields:fields}:null;}).filter(Boolean);
    var specNotice = missingSpecs.length ? '<div class="qcalc__notice v2-spec-notice"><strong>Nog nodig om de aanvraag compleet te maken</strong>' + missingSpecs.map(function(m){return '<div>Stuk '+(m.index+1)+': '+m.fields.join(', ')+'. <button type="button" class="qcalc__textBtn" data-action="edit-piece" data-index="'+m.index+'" data-focus="'+(m.fields[0]==='materiaal'?'material':m.fields[0]==='dikte'?'thickness':state.pieces[m.index].shape==='circle'?'outerDiameter':'width')+'">Gegevens invullen ↓</button></div>';}).join('')+'</div>' : '';
    var displayErrors = Array.from(new Map(result.errors.filter(function(e){return !missingSpecs.length||!/positieve buitenmaten en dikte/i.test(e);}).map(function(e){return [e.toLowerCase().replace(/\s+/g,' '),e];})).values());
    var cards = '<div class="qcalc__dashboardGrid"><article class="qcalc__metric"><h3>Kostprijs aanvraag</h3><span>Hele aanvraag · inclusief alle kosten</span><strong class="qcalc__bigPrice">' + (complete ? money(result.landedCost) : '—') +
      '</strong>' + (single ? '<div class="qcalc__unitCost"><span>Stukkosten / st.<br>' + (scenario.costSource === 'calculated' ? 'Materiaal + bewerking' : 'Offerte + eigen gatenwerk') + '</span><strong>' + resultMoney(pieceCosts / qty) + '</strong></div>' +
      input('Aantal stuks', 'pieces.0.quantity', state.pieces[0].quantity, { min: 1, step: 1 }) : '<p>' + qty + ' stuks · uitgesplitst hieronder</p>') +
      '<details class="v2-cost-details" id="v2-cost-breakdown"><summary>Kostprijs uitsplitsen</summary>' + costSummary + '</details></article>' +
      '<article class="qcalc__metric v2-sale-card"><h3>Verkoopprijs</h3>' +
      pricingField('Totaal €', 'salePrice', priceValue('salePrice', result.salePrice), selectedScenario, 0) +
      (single ? pricingField('Per stuk €', 'salePerPiece', priceValue('salePerPiece', result.salePrice / qty), selectedScenario, 0) : '') +
      '</article><article class="qcalc__metric v2-margin-card"><h3>Marge</h3>' +
      pricingField('Brutomarge %', 'marginPct', priceValue('marginPct', margin), selectedScenario, null, 99.9) +
      (complete ? '<small>Werkelijke marge na afronding: ' + num(result.marginPct, 2) + '%</small>' : '') +
      '<div class="v2-margin-result"><span>Marge op de hele aanvraag</span><strong>' + resultMoney(result.marginEuro) + '</strong></div><details id="v2-margin-options"' + (intent.mode==='marginEuro'||intent.mode==='marginPerPiece'?' open':'') + '><summary>Marge als bedrag instellen</summary><div class="qcalc__marginAmounts">' + pricingField('Totaal €', 'marginEuro', priceValue('marginEuro', result.marginEuro), selectedScenario) +
      (single ? pricingField('Per stuk €', 'marginPerPiece', priceValue('marginPerPiece', result.marginEuro / qty), selectedScenario) : '') + '</div></details></article></div>';
    var note = lineOverrides ? 'Verkoopprijzen per stukregel ingesteld. Een wijziging van de totale verkoopprijs of marge vervangt die instellingen.'
      : { marginPct: 'Ingesteld margepercentage is het doel; de verkoopprijs volgt de kosten.', salePrice: 'Het ingestelde verkooptotaal is het doel; prijzen per stuk worden op centen afgerond.',
        salePerPiece: 'Verkoopprijs per stuk staat vast; totaal en marge volgen aantal en kosten.',
        marginEuro: 'Het ingestelde margebedrag is het doel; de verkoopprijs volgt de kosten.',
        marginPerPiece: 'De ingestelde marge per stuk is het doel; totaal en verkoopprijs volgen aantal en kosten.' }[intent.mode];
    note += ' Verkoopprijzen per stuk worden op hele centen afgerond. Totaal en werkelijke marge rekenen met die afgeronde prijzen.';
    if (complete && !lineOverrides && Math.abs(result.roundingDifference) >= .005) note += ' Verschil met het ongeronde verkoopdoel: ' + money(result.roundingDifference) + '.';
    var lines = '';
    if (!single) {
      var costColumns = hasAdditionalCosts
        ? '<col style="width:22%"><col style="width:7%"><col span="4" style="width:11%"><col style="width:10%"><col style="width:7%"><col style="width:10%">'
        : '<col style="width:24%"><col style="width:8%"><col span="2" style="width:12%"><col span="2" style="width:12%"><col style="width:8%"><col style="width:12%">';
      lines = '<div class="qcalc__tableWrap"><table class="qcalc__sheetTable qcalc__pieceTable' + (hasAdditionalCosts ? ' qcalc__pieceTable--extraCosts' : '') + '"><caption>Prijs en marge per stukregel · ' + (scenario.costSource === 'calculated' ? 'materiaal + bewerking' : 'offerte + eigen gatenwerk') + '</caption><colgroup>' + costColumns + '</colgroup><thead><tr><th scope="col">Stuk</th><th scope="col">Aantal</th><th scope="col">Stukkosten / st.</th><th scope="col">Stukkosten totaal</th>' +
        (hasAdditionalCosts ? '<th scope="col">Bijkomend / st.</th>' : '') + '<th scope="col">Verkoop / st. €</th><th scope="col">Marge / st. €</th><th scope="col">Marge %</th><th scope="col">Marge totaal</th></tr></thead><tbody>' +
        result.lines.map(function (line, i) {
          var directCost = line.materialCost + line.workCost + line.quoteCost;
          var additionalCost = Math.max(0, line.cost - directCost);
          return '<tr><th scope="row" class="qcalc__nameCell" style="--identity-color:' + Core.colorFor(state.pieces[i], 'piece') + '">' + input('Naam stuk ' + line.index, 'pieces.' + i + '.name', state.pieces[i].name, { kind: 'text', placeholder: 'Stuk ' + line.index }) + '<small class="qcalc__pieceDescription">' + esc(pieceSummary(state.pieces[i], i)) + '</small></th><td>' + input('Aantal stuk ' + line.index, 'pieces.' + i + '.quantity', state.pieces[i].quantity, { min: 1, step: 1 }) + '</td><td>' + resultMoney(directCost / line.quantity) +
            '</td><td>' + resultMoney(directCost) + '</td>' + (hasAdditionalCosts ? '<td>' + resultMoney(additionalCost / line.quantity) + '</td>' : '') + '<td>' + lineField('Verkoop stuk ' + line.index, 'salePerPiece', complete ? line.salePrice / line.quantity : '', selectedScenario, i, 0) +
            '</td><td>' + lineField('Marge stuk ' + line.index, 'marginPerPiece', complete ? line.marginEuro / line.quantity : '', selectedScenario, i) +
            '</td><td>' + lineField('Margepercentage stuk ' + line.index, 'marginPct', complete ? line.marginPct : '', selectedScenario, i, null, 99.9) +
            '</td><td>' + resultMoney(line.marginEuro) + '</td></tr>';
        }).join('') + '</tbody></table><p class="qcalc__allocationNote">Stukkosten zijn ' + (scenario.costSource === 'calculated' ? 'materiaal + bewerking' : 'de offerte + eigen gatenwerk') + ', zonder transport, invoerrechten en overige kosten. ' +
        (hasAdditionalCosts ? 'Die staan apart onder Bijkomend. Marge = verkoop − stukkosten − bijkomende kosten. De bijkomende kosten voor de hele aanvraag bedragen ' + resultMoney(result.transport + result.duty + result.other) + '.' : 'Marge = verkoop − stukkosten.') +
        '</p><p class="qcalc__allocationNote">Witte cellen zijn aanpasbaar; grijze cellen worden berekend. ' + (scenario.costSource === 'quote_total' ? 'Het offertetotaal is naar aantallen verdeeld; dit is een toerekening, geen afzonderlijke offerteprijs per stukregel.' : scenario.costSource === 'quote_per_piece' ? 'Elke stukregel gebruikt de eigen offerteprijs.' : 'Gedeeld materiaalverlies wordt verdeeld naar buitenmaat × aantal.') + ' Transport en overige kosten worden naar stukkosten verdeeld.</p></div>';
    }
    return '<section class="qcalc__results qcalc__dashboard" id="resultaten" data-edit-scope="dashboard">' +
      '<div class="qcalc__aiActions"><button type="button" class="qcalc__button qcalc__button--primary" data-action="copy-ai-prompt"><span aria-hidden="true">✦ </span>Start met AI · kopieer prompt</button><p><strong>Je aanvraag automatisch laten invullen?</strong><br>Kopieer de prompt, bespreek je aanvraag in ChatGPT en plak het antwoord terug.</p><span data-ai-message role="status"></span></div>' +
      '<header class="qcalc__sectionHead"><div><h1>Prijs en marge</h1><p>Stel je verkoopprijs of marge in. De andere bedragen rekenen direct mee. Alle bedragen in euro’s, excl. btw.</p></div>' + '<div class="v2-supplier-head">' + selector + '<button type="button" class="qcalc__textBtn" data-action="edit-supplier" data-index="' + selectedScenario + '">Tarieven bewerken ↓</button></div></header>' +
      (single ? '<div class="qcalc__requestIdentity"><strong>'+esc(pieceName(state.pieces[0],0))+'</strong><span>'+esc(pieceSummary(state.pieces[0],0))+'</span></div>' : '') +
      specNotice + (displayErrors.length ? '<div class="qcalc__alert">' + displayErrors.map(esc).join('<br>') + '</div>' :
      (!result.priceComplete && !missingSpecs.length ? '<div class="qcalc__notice">Vul een prijs in voor ' + result.missingPrices.map(esc).join(', ') + '. Daarna zie je de volledige kostprijs en marge. <button type="button" class="qcalc__textBtn" data-action="edit-supplier" data-index="' + selectedScenario + '">Tarieven invullen ↓</button></div>' : '')) + cards + (complete && result.marginEuro < 0 ? '<p class="qcalc__loss" role="alert">Verkoopprijs ligt onder de kostprijs.</p>' : '') + lines + '<p class="v2-pricing-basis">' + (lineOverrides?'Verkoopprijzen staan per stukregel ingesteld.':{marginPct:'Margepercentage stuurt de verkoopprijs.',salePrice:'Verkooptotaal staat vast; de marge rekent mee.',salePerPiece:'Verkoopprijs per stuk staat vast; de marge rekent mee.',marginEuro:'Margebedrag stuurt de verkoopprijs.',marginPerPiece:'Marge per stuk stuurt de verkoopprijs.'}[intent.mode]) + '</p>' +
      '<footer class="qcalc__dashboardActions v2-result-actions"><button type="button" class="qcalc__button qcalc__button--primary" data-customer-save>Deze berekening bij klant bewaren</button><button type="button" class="qcalc__button qcalc__button--secondary" data-action="copy-link">Berekeningslink kopiëren</button>' +
      '<div class="qcalc__message" data-message role="status" hidden></div></footer>' + '<details class="v2-calculation-notes" id="v2-calculation-notes"><summary>Rekenwijze &amp; kostenopbouw</summary><p class="qcalc__intent">' + note + '</p>' + renderCostComposition(calculation) + '</details></section>';
  }

  function renderCostComposition(calculation) {
    var results = calculation.scenarios.filter(function (result) { return !result.errors.length && result.priceComplete; });
    if (!results.length) return '';
    var scaleMaximum = Math.max.apply(null, results.map(function (result) { return result.landedCost; })) || 1;
    var categories = [
      { label: 'Offerte leverancier', color: '#546b98', value: function (r) { return r.quoteCost; } },
      { label: 'Materiaal', color: '#3767b6', value: function (r) { return r.materialCost; } },
      { label: 'Bewerking leverancier', color: '#168477', value: function (r) { return r.processCost + r.holeCost - r.ownHoleCost; } },
      { label: 'Eigen gatenwerk', color: '#7956a8', value: function (r) { return r.ownHoleCost; } },
      { label: 'Transport', color: '#ae650d', value: function (r) { return r.transport; } },
      { label: 'Invoerrechten', color: '#ae405c', value: function (r) { return r.duty; } },
      { label: 'Overig', color: '#667085', value: function (r) { return r.other; } }
    ];
    return '<section class="qcalc__costComposition" aria-label="Kostenverdeling"><h2>Opbouw kostprijs</h2><p class="qcalc__hint">Alle balken gebruiken dezelfde euroschaal: een hogere kostprijs geeft een langere balk. De percentages tonen het aandeel in de kostprijs van die leverancier.</p>' +
      results.map(function (r) {
        var scenario = state.scenarios[calculation.scenarios.indexOf(r)];
        var parts = categories.map(function (category) {
          var value = category.value(r);
          return { label: category.label, color: category.color, value: value, percent: r.landedCost > 0 ? value / r.landedCost * 100 : 0 };
        }).filter(function (part) { return part.value > 0; });
        return '<article class="qcalc__costBreakdown"><header>' + identity(r.name, scenario, 'supplier') + '<strong>' + money(r.landedCost) + '</strong></header>' +
          '<div class="qcalc__costBar" aria-hidden="true">' + parts.map(function (part) {
            return '<span style="width:' + (part.value / scaleMaximum * 100).toFixed(6) + '%;background:' + part.color + '"></span>';
          }).join('') + '</div><ul class="qcalc__costParts">' + parts.map(function (part) {
            return '<li><span><i style="background:' + part.color + '" aria-hidden="true"></i>' + part.label + '</span><strong>' + money(part.value) + ' · ' + num(part.percent, 1) + '%</strong></li>';
          }).join('') + '</ul></article>';
      }).join('') + '<div class="qcalc__costScale" aria-label="Gedeelde euroschaal"><span>' + money(0) + '</span><span>' + money(scaleMaximum) + '</span></div></section>';
  }

  function cancelChart() {
    if (chartTimer) window.clearTimeout(chartTimer);
    if (chartWorker) chartWorker.terminate();
    chartWorker = null; chartTimer = null; chartKey = ''; chartHtml = ''; chartPending = false; chartRequest += 1;
  }

  function chartContent() {
    return '<div class="qcalc__chartContent" aria-busy="' + chartPending + '">' + chartHtml + '</div>' +
      '<p class="qcalc__chartStatus qcalc__hint" role="status">' + (chartPending ? (chartHtml ? 'Grafiek wordt bijgewerkt. De lijnen tonen nog de vorige invoer.' : 'Kostprijs bij andere aantallen wordt berekend…') : '') + '</p>';
  }

  function comparisonChart() {
    var chartState = JSON.parse(JSON.stringify(state));
    // Price and margin edits do not change the cost-vs-quantity graph.
    delete chartState.comparisonSalePrice; delete chartState.marginPct; delete chartState.selectedScenarioId;
    chartState.scenarios.forEach(function (s) { delete s.pricing; delete s.linePricing; });
    var key = JSON.stringify(chartState);
    if (key !== chartKey) {
      var previousChart = chartHtml;
      cancelChart(); chartKey = key;
      chartHtml = previousChart;
      chartPending = true;
      var request = chartRequest;
      chartTimer = window.setTimeout(function () {
        function display(html) {
          if (request !== chartRequest) return;
          chartHtml = html;
          chartPending = false;
          var container = root.querySelector('[data-comparison-chart]');
          if (container) refresh(container, chartContent());
        }
        try {
          chartWorker = new Worker(chartWorkerUrl);
          chartWorker.onmessage = function (event) {
            if (event.data.id !== chartRequest) return;
            display(event.data.error ? '<p class="qcalc__hint">De grafiek kon niet worden berekend. De actuele kosten staan in de vergelijking.</p>' : window.QuoteCalculatorChart.render(event.data.model));
            chartWorker.terminate(); chartWorker = null;
          };
          chartWorker.onerror = function () {
            if (request !== chartRequest) return;
            display('<p class="qcalc__hint">De grafiek is niet beschikbaar. De actuele kosten staan in de vergelijking.</p>');
            if (chartWorker) chartWorker.terminate(); chartWorker = null;
          };
          chartWorker.postMessage({ id: request, state: chartState });
        } catch (error) { display('<p class="qcalc__hint">De grafiek is niet beschikbaar in deze browser.</p>'); }
      }, 350);
    }
    return '<div class="qcalc__quantityChart"><h3>Kostprijs bij andere aantallen</h3><div data-comparison-chart>' + chartContent() + '</div></div>';
  }

  function renderComparison(calculation) {
    if (state.scenarios.length < 2 || calculation.errors.length) { cancelChart(); return ''; }
    var results = calculation.scenarios.filter(function (s) { return !s.errors.length && s.priceComplete; });
    var invalid = calculation.scenarios.filter(function (s) { return s.errors.length || !s.priceComplete; });
    var warnings = invalid.length ? '<div class="qcalc__notice">Nog niet vergelijkbaar: ' + invalid.map(function (s) { return esc(s.name) + ' (' + (s.errors.length ? s.errors.map(esc).join(' ') : 'prijs invullen: ' + s.missingPrices.map(esc).join(', ')) + ')'; }).join('<br>') + '</div>' : '';
    if (!results.length) { cancelChart(); return warnings; }
    var reference = state.comparisonSalePrice == null ? (calculation.scenarios[selectedScenario].errors.length || !calculation.scenarios[selectedScenario].priceComplete ? results[0].salePrice : calculation.scenarios[selectedScenario].salePrice) : Number(state.comparisonSalePrice);
    var minCost = Math.min.apply(null, results.map(function (r) { return r.landedCost; }));
    var chart = '';
    if (results.length > 1) chart = comparisonChart(); else cancelChart();
    return fold('comparison', 'Leveranciers vergelijken', results.length + ' ingevulde opties · laagste kostprijs ' + money(minCost),
      warnings +
      '<div class="qcalc__comparePrice">' + input('Vergelijk bij dezelfde totale verkoopprijs €', 'comparisonSalePrice', reference, { min: 0, step: 1 }) +
      '<p>Deze prijs is alleen voor de vergelijking. Je ingestelde verkoopprijzen blijven behouden.</p></div>' +
      '<div class="qcalc__tableWrap"><table class="qcalc__sheetTable qcalc__supplierTable"><colgroup><col style="width:30%"><col span="3" style="width:16%"><col style="width:10%"><col style="width:12%"></colgroup><thead><tr><th scope="col">Leverancier / uitvoering</th><th scope="col">Kostprijs totaal</th><th scope="col">Meerprijs</th><th scope="col">Marge totaal</th><th scope="col">Marge %</th><th scope="col">Bekijken</th></tr></thead><tbody>' +
      results.map(function (r) {
        var profit = reference - r.landedCost;
        var index = calculation.scenarios.indexOf(r);
        return '<tr><th scope="row" class="qcalc__nameCell" style="--identity-color:' + Core.colorFor(state.scenarios[index], 'supplier') + '">' + input('Naam leverancier', 'scenarios.' + index + '.name', state.scenarios[index].name, { kind: 'text' }) + (r.landedCost === minCost && results.length > 1 ? '<small>Laagste kostprijs</small>' : '') +
          '</th><td>' + money(r.landedCost) + '</td><td>' + money(r.landedCost - minCost) + '</td><td class="' + (profit < 0 ? 'qcalc__loss' : '') + '">' + money(profit) + '</td><td>' + (reference > 0 ? num(profit / reference * 100, 1) + '%' : '—') +
          '</td><td><button type="button" class="qcalc__textBtn" data-action="choose-supplier" data-index="' + index + '">' + (index === selectedScenario ? 'In beeld' : 'Bekijk kosten') + '</button></td></tr>';
      }).join('') + '</tbody></table><p class="qcalc__hint">Witte cellen zijn aanpasbaar; grijze cellen worden berekend. Marge bij de verkoopprijs hierboven.</p></div>' + chart);
  }

  function pieceSummary(piece, index) {
    var dims = piece.process === 'mill' && piece.shape === 'circle' ? 'Ø ' + piece.outerDiameter : piece.width + ' × ' + piece.height;
    return ({rect:'Rechthoek',circle:piece.opening==='circle'?'Ring / pakking':'Rond',manhole:'Mangat',cad:'Tekening',polygon:'Vrije contour',lshape:'L-vorm'}[piece.shape]||'Stuk') + ' · ' + (piece.material || 'Materiaal nog invullen') + (piece.thickness>0?' '+piece.thickness+' mm':' · dikte nog invullen') + ' · ' + dims + ' mm · ' + piece.quantity + ' stuks' + (piece.holes?' · '+piece.holes+' gaten/stuk':'');
  }

  function pieceOverview(piece,index){return pieceSummary(piece,index);}
  function pieceBasics(piece,index){
    var path='pieces.'+index+'.';
    return '<div class="qcalc__fields qcalc__pieceBasics v2-piece-basics">'+
      input('Naam stuk',path+'name',piece.name,{kind:'text',placeholder:'Bijvoorbeeld montageplaat of pakking'})+
      input('Aantal stuks',path+'quantity',piece.quantity,{min:1,step:1})+
      input('Materiaal',path+'material',piece.material,{kind:'text',placeholder:'Bijvoorbeeld EPDM of PE'})+
      (window.RubberV2.rubber(piece)?select('Dikte (mm)',path+'thickness',String(piece.thickness),Object.keys(window.RubberV2.catalog).map(function(t){return [t,t+' mm'];}).concat(window.RubberV2.catalog[piece.thickness]?[]:[[String(piece.thickness),piece.thickness+' mm · eigen dikte']])):input('Dikte (mm)',path+'thickness',piece.thickness>0?piece.thickness:'',{min:.1,step:1}))+
      '</div>';
  }

  function render() {
    state.pieces.forEach(function (piece) { if (!piece.process) piece.process = state.process || 'saw'; });
    // Migrate old links without replacing editable piece geometry on each render.
    var normalized = Core.normalizeState(state);
    state.scenarios = normalized.scenarios;
    state.pieces.forEach(function (piece, index) { piece.colorIndex = normalized.pieces[index].colorIndex; if (piece.holeMode === 'coordinates') piece.holes = normalized.pieces[index].holes; if(piece.shape==='polygon'||piece.shape==='cad'){piece.width=normalized.pieces[index].width;piece.height=normalized.pieces[index].height;} });
    var groups = Core.ensureRates(state);
    var calculation = Core.calculate(state, Nesting);
    selectedScenario = Math.min(selectedScenario, state.scenarios.length - 1);
    var selected = calculation.scenarios[selectedScenario];
    state.selectedScenarioId = state.scenarios[selectedScenario].id;
    lastCalculation = Object.assign({}, calculation, { groups: selected.groups, selectedScenario: selectedScenario });
    var suppliers = state.scenarios.map(function (s,index){
      var result=calculation.scenarios[index];
      return editor('supplier-'+s.id,identity('Leverancier '+(index+1),s,'supplier'),result.errors.length?'Controleer invoer':!result.priceComplete?'Tarieven invullen':'Kostprijs '+money(result.landedCost),renderScenario(s,index,groups)+(calculation.holes&&s.costSource==='calculated'&&!s.rubberAuto?'<button type="button" class="qcalc__button qcalc__button--secondary" data-action="compare-own" data-index="'+index+'">Vergelijk gatenbewerking</button>':''));
    }).join('');
    var material = '<div class="qcalc__materialControl">' +
      select('Meegerekend materiaal', 'materialMode', state.materialMode, [['full_plate', 'Volledige plaat'], ['used_strip', 'Gebruikte plaatstrook'], ['compact_box', 'Compact gebruikt vlak']]) +
      '<p>' + { full_plate: 'De hele plaat telt mee.', used_strip: 'Een volledige strook, horizontaal of verticaal: de voordeligste richting wordt gekozen.',
        compact_box: 'Het rechthoekige vlak rond de stukken telt mee, inclusief de middenuitsparingen.' }[state.materialMode] + '</p></div>';
    var nestingMarkup='<details id="v2-nesting" data-detail="nesting" class="qcalc__panel qcalc__nestingBottom v2-nesting-fold"><summary>Plaatindeling &amp; nesting <span>'+esc(selected.name)+'</span></summary><div>' +
      (state.scenarios.length > 1 ? '<label class="qcalc__field"><span>Plaat van leverancier bekijken</span><select data-selected-scenario data-preview-scenario>' + state.scenarios.map(function (s, i) {
        return '<option value="' + i + '"' + (i === selectedScenario ? ' selected' : '') + '>' + esc(s.name) + '</option>';
      }).join('') + '</select></label>' : '') + material +
      '<div class="qcalc__nestingSettings">' + input('Ruimte tussen stukken mm', 'gap', state.gap, { min: 0, step: 1 }) + '</div>' +
      window.QuoteCalculatorPreview.render(lastCalculation, previewPages) + '</div></details>';
    refresh(root, '<div class="qcalc__shell">' + renderDashboard(calculation) + renderComparison(calculation) +
      '<section id="v2-stukken" class="qcalc__data" aria-labelledby="stukken-heading"><div class="v2-section-heading"><h2 id="stukken-heading">Stukken</h2><button type="button" id="v2-cad-import" class="qcalc__textBtn">DXF / STEP importeren</button></div>' +
      state.pieces.map(function (piece, index) { return editor('piece-' + piece.id, identity(pieceName(piece,index), piece, 'piece'), '', renderPiece(piece, index)); }).join('') +
      '<div class="qcalc__addRow"><button type="button" class="qcalc__button qcalc__button--secondary" data-action="add-piece">+ Stuk toevoegen</button></div></section>' +
      '<section class="qcalc__data" aria-labelledby="leveranciers-heading"><h2 id="leveranciers-heading">Leveranciers</h2>' +
      suppliers + '<div class="qcalc__addRow"><button type="button" class="qcalc__button qcalc__button--secondary" data-action="add-scenario">+ Leverancier toevoegen</button></div></section>' +
      nestingMarkup + '</div>');
    if (typeof window.dispatchEvent === 'function') window.dispatchEvent(new Event('crm-costing-change'));
  }

  function showMessage(text, isError) {
    var element = root.querySelector('[data-message]');
    if (!element) return;
    element.textContent = text;
    element.hidden = false;
    element.classList.toggle('is-error', !!isError);
    if (messageTimer) window.clearTimeout(messageTimer);
    messageTimer = window.setTimeout(function () {
      window.QuoteCalculatorView.keepPosition(root, function () { element.hidden = true; });
    }, 4000);
  }

  function copyShareLink() {
    var url = window.location.origin + window.location.pathname + '#calc=' + Core.encodeState(state);
    var done = function () { showMessage('Link naar deze berekening is gekopieerd.'); };
    copyText(url, done, 'link');
  }

  function copyAiPrompt() {
    var prompt = window.QuoteCalculatorAI.buildPrompt(window.location.origin + window.location.pathname);
    copyText(prompt, function () {
      root.querySelector('[data-ai-message]').textContent = 'Gekopieerd. Plak in ChatGPT en zet je aanvraag eronder.';
    }, 'prompt');
  }

  function copyText(text, done, kind) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done, kind); });
    } else fallbackCopy(text, done, kind);
  }

  function fallbackCopy(text, done, kind) {
    var area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    function manualCopy() {
      var isPrompt = kind === 'prompt';
      if (isPrompt) root.querySelector('[data-ai-message]').textContent = 'Automatisch kopiëren is niet gelukt. Kopieer de instructie hieronder.';
      else showMessage('Automatisch kopiëren is niet gelukt. Kopieer de link hieronder.', true);
      var actions = root.querySelector(isPrompt ? '.qcalc__aiActions' : '.qcalc__dashboardActions');
      var previous = actions.querySelector('.qcalc__manualLink');
      if (previous) previous.remove();
      var label = document.createElement('label');
      label.className = 'qcalc__field qcalc__manualLink';
      var caption = document.createElement('span'); caption.textContent = isPrompt ? 'AI-instructie' : 'Berekeningslink';
      var field = document.createElement(isPrompt ? 'textarea' : 'input');
      if (isPrompt) field.rows = 8; else field.type = 'text';
      field.value = text; field.readOnly = true;
      label.append(caption, field); actions.appendChild(label); field.focus(); field.select();
    }
    try { if (document.execCommand('copy')) done(); else manualCopy(); } catch (error) { manualCopy(); }
    area.remove();
  }

  root.addEventListener('focusout',function(event){window.PackingV2.restore(event,state);});
  root.addEventListener('input', function (event) {
    if(window.PackingV2.onInput(event,state,Core,render))return;
    var target = event.target;
    if (target.hasAttribute('data-selected-scenario')) {
      selectedScenario = Number(target.value);
      render();
      return;
    }
    if (target.dataset.pricing) {
      // A step of 1 controls the arrows; typed decimal prices remain valid input.
      if (target.value === '' || target.validity.badInput || target.validity.rangeUnderflow || target.validity.rangeOverflow) return;
      var pricedScenario = state.scenarios[Number(target.dataset.scenario)];
      var pricing = { mode: target.dataset.pricing, value: Number(target.value) };
      if (pricing.mode === 'salePrice' || pricing.mode === 'salePerPiece') pricing.value = Core.roundMoney(pricing.value);
      if (target.hasAttribute('data-line')) {
        pricedScenario.linePricing = pricedScenario.linePricing || {};
        pricedScenario.linePricing[state.pieces[Number(target.dataset.line)].id] = pricing;
      } else {
        pricedScenario.pricing = pricing;
        pricedScenario.linePricing = {};
      }
      renderResultsOnly();
      return;
    }
    if (target.hasAttribute('data-rate-field')) {
      var scenarioIndex = Number(target.getAttribute('data-rate-scenario'));
      var key = decodeURIComponent(target.getAttribute('data-rate-key'));
      var field = target.getAttribute('data-rate-field');
      state.scenarios[scenarioIndex].rates[key][field] = field === 'price' ? Number(target.value) : target.value;
      renderResultsOnly();
      return;
    }
    var path = target.getAttribute('data-path');
    if (!path) return;
    if (path.endsWith('.holeCoordinates') && target.value.length > 16000) { showMessage('Maximaal 16.000 tekens voor coördinaten.',true); return; }
    var value = target.getAttribute('data-kind') === 'text' || target.tagName === 'SELECT'
      ? target.value
      : Number(target.value);
    if (/^scenarios\.\d+\.currency$/.test(path)) {
      var currencyScenario = state.scenarios[Number(path.split('.')[1])];
      if (currencyScenario.currency !== 'EUR') currencyScenario.exchangeRates[currencyScenario.currency] = currencyScenario.exchangeRate;
      currencyScenario.currency = value;
      currencyScenario.exchangeRate = value === 'EUR' ? 1 : currencyScenario.exchangeRates[value] || Core.referenceExchangeRates[value] || 0;
    } else if (/\.holeCost\.performedBy$/.test(path)) {
      var pathParts = path.split('.');
      var scenario = state.scenarios[Number(pathParts[1])];
      var costHolder = pathParts[2] === 'pieceCosts' ? scenario.pieceCosts[pathParts[3]] : scenario;
      costHolder.holeAlternatives = costHolder.holeAlternatives || {};
      costHolder.holeAlternatives[costHolder.holeCost.performedBy] = Object.assign({}, costHolder.holeCost);
      costHolder.holeCost = Object.assign({}, costHolder.holeAlternatives[value] || { mode: 'per_hole', value: 0, hourlyRate: 0 }, { performedBy: value });
    } else {
      var materialEdit = /^pieces\.\d+\.(material|thickness)$/.test(path);
      var editedPiece = materialEdit ? state.pieces[Number(path.split('.')[1])] : null;
      var previousKey = editedPiece && Core.groupKey(editedPiece);
      setPath(state, path, value);
      if (editedPiece) {
        var newKey = Core.groupKey(editedPiece);
        state.scenarios.forEach(function (s) {
          if (!s.rubberAuto && !s.rates[newKey] && s.rates[previousKey]) s.rates[newKey] = Object.assign({}, s.rates[previousKey]);
        });
      }
    }
    if (path.endsWith('.opening')) {
      var piece = state.pieces[Number(path.split('.')[1])];
      if (value === 'circle' && !piece.innerDiameter) piece.innerDiameter = Math.round((piece.shape === 'circle' ? piece.outerDiameter : Math.min(piece.width, piece.height)) / 2);
      if (value === 'rect' && !piece.innerWidth) { piece.innerWidth = piece.width / 2; piece.innerHeight = piece.height / 2; }
    }
    if (path.endsWith('.shape')) {
      var shapedPiece = state.pieces[Number(path.split('.')[1])];
      if (value === 'circle' && shapedPiece.opening === 'rect') shapedPiece.opening = 'none';
      if (value === 'manhole' && shapedPiece.opening === 'circle') shapedPiece.opening = 'none';
      if (value === 'polygon') {shapedPiece.opening='none';if(!shapedPiece.outlineCoordinates)shapedPiece.outlineCoordinates='-100; -60\n100; -60\n100; 0\n30; 0\n30; 60\n-100; 60';}
      if (value === 'lshape') { shapedPiece.opening = 'none'; shapedPiece.notchWidth = shapedPiece.notchWidth || shapedPiece.width/2; shapedPiece.notchHeight = shapedPiece.notchHeight || shapedPiece.height/2; }
    }
    if (/^scenarios\.\d+\.(rubberHourRate|rubberCutSpeed)$/.test(path) && target.value === '') state.scenarios[Number(path.split('.')[1])][path.split('.')[2]] = null;
    if (/^scenarios\.\d+\.rubberAuto$/.test(path)) state.scenarios[Number(path.split('.')[1])].rubberAuto = value === 'yes';
    if (/^pieces\.\d+\.thickness$/.test(path)) state.pieces[Number(path.split('.')[1])].thickness = Number(value);
    if (target.tagName === 'SELECT' && path.startsWith('pieces.')) render();
    else renderResultsOnly();
  });

  function renderResultsOnly() {
    render();
  }

  root.addEventListener('focusout', function (event) {
    var field = event.target;
    if ((field.dataset.pricing === 'salePrice' || field.dataset.pricing === 'salePerPiece') && field.value !== '' && Number.isFinite(Number(field.value))) {
      field.value = Core.roundMoney(Number(field.value)).toFixed(2);
    }
  });

  function addRecordAtButton(button, createRecord, notice) {
    var key;
    window.QuoteCalculatorView.keepPosition(root, function () {
      key = createRecord();
      expandDetail(key);
      render();
      if (notice) showMessage(notice);
    }, button, function () {
      return root.querySelector('[data-detail="' + key + '"] .v2-entry-heading');
    });
    var detail = root.querySelector('[data-detail="' + key + '"]');
    var name = detail && detail.querySelector('input[data-kind="text"]');
    if (name) name.focus({ preventScroll: true });
  }

  root.addEventListener('click', function (event) {
    var friendly=event.target.closest('[data-action]');
    if(friendly&&['piece-preset','piece-variant','piece-file','hole-pattern','hole-add','hole-remove','hole-step'].includes(friendly.dataset.action)) {
      var pi=Number(friendly.dataset.index),p=state.pieces[pi],action=friendly.dataset.action,normalized=Core.normalizeState(state).pieces[pi],result;
      if(action==='piece-file'){window.dispatchEvent(new window.CustomEvent('v2-cad-open',{detail:{pieceIndex:pi}}));return;}
      if(action==='piece-variant'){
        var currentVariant=normalized.holeMode!=='coordinates'&&normalized.holes>0?'legacy':window.PackingV2.circular(normalized)?'bolt':normalized.opening==='none'?'solid':'center';
        if(currentVariant===friendly.dataset.value)return;
        if(normalized.holes>0&&!confirm('Deze uitvoering vervangt de bestaande gaten. Doorgaan?'))return;
        var changed=window.PackingV2.variant(normalized,friendly.dataset.value);
        if(changed.error){friendly.closest('.v2-variant-picker').querySelector('[data-variant-error]').textContent=changed.error;return;}
        Object.assign(p,changed.piece);render();return;
      }
      if(action==='piece-preset') {
        var value=friendly.dataset.value,trial=Core.clone(normalized);if(value===p.shape)return;
        if((p.shape==='cad'||p.shape==='polygon'||p.shape==='lshape'||p.opening==='rect')&&!confirm('Deze vormkeuze vervangt de huidige contour. Doorgaan?'))return;
        trial.process='mill';trial.shape=value==='circle'||value==='ring'?'circle':value==='manhole'?'manhole':'rect';trial.opening=value==='ring'?'circle':'none';trial.innerDiameter=value==='ring'?Math.min(trial.innerDiameter||trial.outerDiameter/2,trial.outerDiameter*.7):0;trial.innerWidth=0;trial.innerHeight=0;trial.cornerRadius=value==='rounded'?Math.min(trial.cornerRadius||10,trial.width/4,trial.height/4):0;
        var oldHoles=window.PackingV2.holes(normalized);if(oldHoles.length&&window.GasketV2Geometry.validate(trial).length){friendly.closest('.v2-shape-picker').querySelector('[data-shape-error]').textContent='Deze vorm past niet rond de huidige gaten. Verplaats of verwijder die gaten eerst.';return;}
        Object.assign(p,trial);render();return;
      }
      if(action==='hole-step')result=window.PackingV2.proposed(normalized,Number(friendly.dataset.hole),friendly.dataset.field,Number(friendly.closest('.v2-stepper').querySelector('input').value)+Number(friendly.dataset.step));
      if(action==='hole-add')result=window.PackingV2.add(normalized);
      if(action==='hole-pattern')result=window.PackingV2.pattern(normalized,Number(friendly.dataset.value));
      if(action==='hole-remove'){var list=window.PackingV2.holes(normalized);list.splice(Number(friendly.dataset.hole),1);result={text:window.PackingV2.serialize(list)};}
      if(result.error){var notice=friendly.closest('.v2-loose-holes')?.querySelector('[data-hole-group-error]');if(notice)notice.textContent=result.error;else showMessage(result.error,true);return;}
      p.holeMode='coordinates';p.holeCoordinates=result.text;if(action==='hole-add')expandDetail('holes-'+p.id);render();return;
    }
    var extra=event.target.closest('[data-action]');
    if(extra && ['dxf','svg','four-holes','rubber-piece'].includes(extra.dataset.action)) {
      var idx=Number(extra.dataset.index),action=extra.dataset.action,piece=state.pieces[idx];
      if(action==='dxf'||action==='svg') {
        var p=Core.normalizeState(state).pieces[idx],errors=window.GasketV2Geometry.validate(p);
        if(errors.length){showMessage(errors.join(' '),true);return;}
        window.GasketV2Download(action==='dxf'?window.GasketV2Geometry.dxf(p):window.GasketV2Geometry.svg(p),(piece.name||'pakking-'+(idx+1))+'.'+action,action==='dxf'?'application/dxf':'image/svg+xml');return;
      }
      if(action==='four-holes') { window.GasketV2CornerDialog(piece,function(text){piece.holeCoordinates=text;piece.holeMode='coordinates';render();});return; }
      if(action==='rubber-piece') {piece.material='Rubber EPDM';piece.process='mill';piece.holeMode='coordinates';if(!window.RubberV2.catalog[piece.thickness])piece.thickness=3;render();return;}
    }
    var layoutButton = event.target.closest('[data-layout-next], [data-layout-best]');
    if (layoutButton && lastCalculation) {
      var best = layoutButton.hasAttribute('data-layout-best');
      var groupIndex = Number(layoutButton.getAttribute(best ? 'data-layout-best' : 'data-layout-next'));
      var group = lastCalculation.groups[groupIndex];
      if (!group || !group.layout) return;
      state.scenarios[selectedScenario].layoutChoices[group.key] = {
        key: group.layout.selectionKey,
        index: best ? 0 : (group.layout.optionIndex + 1) % group.layout.optionCount
      };
      previewPages[groupIndex] = 0;
      render();
      return;
    }
    var plateButton = event.target.closest('[data-plate-group]');
    if (plateButton && lastCalculation) {
      previewPages[Number(plateButton.dataset.plateGroup)] = Number(plateButton.dataset.platePage);
      root.querySelector('#plaatpreview').outerHTML = window.QuoteCalculatorPreview.render(lastCalculation, previewPages);
      return;
    }
    var button = event.target.closest('[data-action]');
    if (!button) return;
    var action = button.getAttribute('data-action');
    var index = Number(button.getAttribute('data-index'));
    if (action === 'copy-link') return copyShareLink();
    if (action === 'copy-ai-prompt') return copyAiPrompt();
    if (action === 'add-scenario') {
      return addRecordAtButton(button, function () {
        state.scenarios.push(Core.newScenario('Leverancier ' + (state.scenarios.length + 1), state.process));
        selectedScenario = state.scenarios.length - 1;
        return 'supplier-' + state.scenarios[selectedScenario].id;
      });
    }
    if (action === 'add-piece') {
      return addRecordAtButton(button, function () {
        var piece = Core.newPiece(state.pieces.length ? state.pieces[state.pieces.length - 1].process : 'saw');
        var previous=state.pieces[state.pieces.length-1];Object.assign(piece,{shape:'rect',process:'mill',material:previous?.material||'Rubber EPDM',thickness:previous?.thickness||3,holeMode:'coordinates',holeCoordinates:'',width:200,height:120});
        state.pieces.push(piece);
        return 'piece-' + piece.id;
      });
    }
    if (action === 'choose-supplier') { selectedScenario = index; render(); root.querySelector('#resultaten').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if(action==='edit-piece'){if(!state.pieces[index])return;expandDetail('piece-'+state.pieces[index].id);render();var pieceDetail=root.querySelector('[data-detail="piece-'+state.pieces[index].id+'"]');pieceDetail.scrollIntoView({behavior:'smooth',block:'start'});var wanted=root.querySelector('[data-path="pieces.'+index+'.'+button.dataset.focus+'"]');if(wanted)wanted.focus({preventScroll:true});return;}
    if (action === 'edit-supplier') {
      if(state.scenarios[index].rubberAuto)expandDetail('supplier-more-' + state.scenarios[index].id);
      render();
      root.querySelector('[data-detail="supplier-' + state.scenarios[index].id + '"]').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (action === 'compare-own') {
      var original = state.scenarios[index];
      var copy = JSON.parse(JSON.stringify(original));
      copy.id = Core.newScenario().id;
      delete copy.colorIndex;
      var destination = original.holeCost.performedBy === 'own' ? 'supplier' : 'own';
      copy.name = original.name + (destination === 'own' ? ' · eigen gatenwerk' : ' · gaten leverancier');
      function setHoleDestination(holder) {
        if (holder.holeCost.performedBy === destination) return;
        holder.holeAlternatives = holder.holeAlternatives || {};
        holder.holeAlternatives[holder.holeCost.performedBy] = Object.assign({}, holder.holeCost);
        var savedAlternative = holder.holeAlternatives[destination];
        holder.holeCost = Object.assign({}, savedAlternative || holder.holeCost, { performedBy: destination });
        if (!savedAlternative && original.currency !== 'EUR') {
          var tariffFactor = destination === 'own' ? Core.exchangeFactor(original) : original.exchangeRate;
          if (holder.holeCost.mode === 'minutes') holder.holeCost.hourlyRate *= tariffFactor;
          else holder.holeCost.value *= tariffFactor;
        }
      }
      setHoleDestination(copy);
      Object.keys(copy.pieceCosts).forEach(function (pieceId) {
        if (copy.pieceCosts[pieceId].mode === 'custom') setHoleDestination(copy.pieceCosts[pieceId]);
      });
      return addRecordAtButton(button, function () {
        state.scenarios.push(copy);
        selectedScenario = state.scenarios.length - 1;
        return 'supplier-' + copy.id;
      }, 'Controleer het tarief voor ' + (destination === 'own' ? 'eigen gatenwerk' : 'gaten door de leverancier') + '. Zonder eerder ingesteld tarief is het oorspronkelijke tarief overgenomen, indien nodig omgerekend met de ingevulde koers.');
    }
    if (action === 'shape') {
      var piece = state.pieces[index];
      piece.shape = button.dataset.value;
      if (piece.shape === 'circle' && piece.opening === 'rect') piece.opening = 'circle';
      if (piece.shape === 'manhole' && piece.opening === 'circle') piece.opening = 'rect';
      render();
      return;
    }
    if (action === 'set-process') {
      state.process = button.getAttribute('data-value') === 'mill' ? 'mill' : 'saw';
    } else if (action === 'remove-piece') {
      var removedId = state.pieces[index].id;
      state.scenarios.forEach(function (scenario) {
        if (scenario.linePricing) delete scenario.linePricing[removedId];
        delete scenario.quotedUnitPrices[removedId];
        delete scenario.pieceCosts[removedId];
      });
      state.pieces.splice(index, 1);
    } else if (action === 'remove-scenario') {
      var viewedId = state.scenarios[selectedScenario].id;
      state.scenarios.splice(index, 1);
      selectedScenario = Math.max(0, state.scenarios.findIndex(function (scenario) { return scenario.id === viewedId; }));
    }
    render();
  });

  window.CrmCostCalculator = {
    exportState: function () { return Core.clone(Core.normalizeState(state)); },
    importState: function (value) { state = Core.normalizeState(Core.clone(value)); selectedScenario = Math.max(0, state.scenarios.findIndex(function (s) { return s.id === state.selectedScenarioId; })); previewPages = {}; render(); },
    calculate: function () { var calculation = Core.calculate(state, Nesting); return {calculation: calculation, selectedScenarioId: state.scenarios[selectedScenario].id}; }
  };
  render();
})();
