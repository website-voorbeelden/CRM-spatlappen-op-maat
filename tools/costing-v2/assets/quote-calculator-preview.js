(function () {
  'use strict';
  var colors = ['#237c57', '#c29319', '#487ec0', '#9664b7', '#c96e33', '#238d93'];
  function pieceColor(piece, number) {
    return window.QuoteCalculatorCore ? window.QuoteCalculatorCore.colorFor(piece, 'piece') : colors[(number - 1) % colors.length];
  }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rect(x, y, w, h, radius, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="' + radius + '" fill="' + fill + '"/>';
  }
  function circle(x, y, radius, fill) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + radius + '" fill="' + fill + '"/>';
  }
  function pieceSvg(placed, piece, number, maskId) {
    return '<g transform="translate(' + placed.x + ' ' + placed.y + ') rotate(' + (placed.rotation || 0) + ')">' + window.GasketV2Geometry.svgShape(piece, pieceColor(piece, number)) + '</g>';
  }

  function renderGroup(group, groupIndex, state, page, scenario) {
    if (!group.layout) return '<article class="qcalc__plateGroup"><h3>' + esc(group.material) + ' · ' + group.thickness +
      ' mm</h3><p>Geen passende plaatindeling voor deze maten.</p></article>';
    var layout = group.layout;
    var plates = layout.packing.plates;
    page = Math.max(0, Math.min(page || 0, plates.length - 1));
    var plate = plates[page];
    var W = layout.sheetWidth;
    var H = layout.sheetHeight;
    var rate = scenario.rates[group.key] || { price: 0, unit: 'm2' };
    var perM2 = rate.unit === 'sheet' ? Number(rate.price) / (scenario.sheetWidth * scenario.sheetHeight / 1000000) : Number(rate.price);
    perM2 *= window.QuoteCalculatorCore.exchangeFactor(scenario);
    if (scenario.costSource !== 'calculated') perM2 = 0;
    var extraCost = (layout.areaMm2 - layout.bestAreaMm2) / 1000000 * perM2;
    function money(value) { return value.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' }); }
    var pad = Math.max(W, H) * 0.055;
    var charged = window.QuoteCalculatorCore.chargedRect(plate, W, H, state.edge, state.materialMode);
    var modes = { full_plate: 'Volledige plaat', used_strip: 'Gebruikte plaatstrook', compact_box: 'Compact gebruikt vlak' };
    var svg = rect(0, 0, W, H, 0, '#f0f1f0') +
      '<rect x="' + charged.x + '" y="' + charged.y + '" width="' + charged.width + '" height="' + charged.height +
      '" fill="#ddeafe" stroke="#3b76c5" stroke-width="2" vector-effect="non-scaling-stroke" stroke-dasharray="7 5"/>';
    plate.placed.forEach(function (placed, index) {
      svg += pieceSvg(placed, group.pieces[placed.itemIndex], group.pieceNumbers[placed.itemIndex], 'q-mask-' + groupIndex + '-' + index);
    });
    svg += '<rect width="' + W + '" height="' + H + '" fill="none" stroke="#66756b" stroke-width="1.5" vector-effect="non-scaling-stroke"/>' +
      '<g fill="#52635a" font-family="sans-serif" font-size="' + pad * 0.38 + '"><text x="' + W / 2 + '" y="' + (-pad * 0.3) +
      '" text-anchor="middle">' + W + ' mm</text><text transform="translate(' + (-pad * 0.35) + ' ' + H / 2 + ') rotate(-90)" text-anchor="middle">' + H + ' mm</text></g>';
    var legend = group.pieces.map(function (piece, index) {
      var n = group.pieceNumbers[index];
      return '<span><i style="background:' + pieceColor(piece, n) + '"></i>' + esc(String(piece.name || '').trim() || 'Stuk ' + n) + ' · ' + piece.quantity + ' st.</span>';
    }).join('');
    return '<article class="qcalc__plateGroup"><header><h3>' + esc(group.material) + ' · ' + group.thickness + ' mm</h3>' +
      '<div class="qcalc__plateNav"><button type="button" class="qcalc__button" data-plate-group="' + groupIndex + '" data-plate-page="' + (page - 1) +
      '"' + (page === 0 ? ' disabled' : '') + ' aria-label="Vorige plaat">←</button><span>Plaat ' + (page + 1) + ' van ' + plates.length +
      '</span><button type="button" class="qcalc__button" data-plate-group="' + groupIndex + '" data-plate-page="' + (page + 1) +
      '"' + (page === plates.length - 1 ? ' disabled' : '') + ' aria-label="Volgende plaat">→</button></div></header>' +
      '<div class="qcalc__layoutControls"><button type="button" class="qcalc__button qcalc__button--secondary" data-layout-next="' + groupIndex + '"' +
      (layout.optionCount < 2 ? ' disabled' : '') + '>Opnieuw indelen</button>' +
      (layout.optionIndex > 0 ? '<button type="button" class="qcalc__textBtn" data-layout-best="' + groupIndex + '">Voordeligste indeling</button>' : '') +
      '<span>Indeling ' + (layout.optionIndex + 1) + ' van ' + layout.optionCount + ' · ' + group.plateCount + ' platen · ' +
      (layout.areaMm2 / 1000000).toLocaleString('nl-NL', { maximumFractionDigits: 3 }) + ' m²' +
      (perM2 > 0 ? ' · materiaal ' + money(layout.areaMm2 / 1000000 * perM2) : '') +
      (extraCost > .005 ? ' · ' + money(extraCost) + ' meer materiaal dan de voordeligste indeling' : '') + '</span></div>' +
      '<svg class="qcalc__plateSvg" role="img" aria-label="Plaatindeling ' + esc(group.material) + ' ' + group.thickness + ' mm, plaat ' + (page + 1) +
      '" viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (W + 2 * pad) + ' ' + (H + 2 * pad) + '">' + svg + '</svg>' +
      '<div class="qcalc__plateLegend">' + legend + '<span><i class="qcalc__chargedKey"></i>Blauw: ' + (scenario.costSource === 'calculated' ? 'meegerekend materiaal' : 'geselecteerd materiaalvlak') + '</span>' +
      '<span><i style="background:#f0f1f0"></i>Grijs: ' + (scenario.costSource === 'calculated' ? 'niet meegerekend' : 'resterend plaatvlak') + '</span></div>' +
      (scenario.costSource !== 'calculated' ? '<p class="qcalc__hint">Deze indeling is illustratief. De ingevoerde offerteprijs verandert niet door de plaatindeling.</p>' : '') +
      '<p>' + modes[state.materialMode] + ' · ' + (charged.width * charged.height / 1000000).toLocaleString('nl-NL', { maximumFractionDigits: 3 }) +
      ' m² op deze plaat · ' + plate.placed.length + ' stukken</p></article>';
  }
  window.QuoteCalculatorPreview = {
    renderPiece: function (piece, index) {
      var w = piece.shape === 'circle' ? piece.outerDiameter : piece.width;
      var h = piece.shape === 'circle' ? piece.outerDiameter : piece.height;
      if (!(w > 0 && h > 0)) return '<p>Vul de buitenmaten in voor een voorbeeld.</p>';
      var pad = Math.max(w, h) * .16;
      var holeCaption = 'Voorbeeld · maten in mm';
      return '<figure class="qcalc__pieceFigure"><svg role="img" aria-label="Vormvoorbeeld ' + esc(String(piece.name || '').trim() || 'stuk ' + (index + 1)) + '" viewBox="' +
        (-w / 2 - pad) + ' ' + (-h / 2 - pad) + ' ' + (w + 2 * pad) + ' ' + (h + 2 * pad) + '">' +
        pieceSvg({ x: 0, y: 0 }, piece, index + 1, 'piece-preview-' + index) +
        '<path class="v2-axis" d="M' + (-w/2-pad/2) + ',0H' + (w/2+pad/2) + 'M0,' + (-h/2-pad/2) + 'V' + (h/2+pad/2) + '"/>' +
        window.GasketV2Geometry.parseHoles(piece).holes.map(function(hole,i){return '<text class="v2-label" x="'+(hole.x+hole.r+pad*.1)+'" y="'+(-hole.y)+'" font-size="'+pad*.35+'">'+(i+1)+'</text>';}).join('') +
        '<text text-anchor="middle" x="0" y="' + (h / 2 + pad * .75) + '" font-size="' + pad * .4 + '" fill="#52635a">' +
        (piece.shape === 'circle' ? 'Ø ' + w : w + ' × ' + h) + ' mm</text></svg><figcaption>' + holeCaption + '</figcaption></figure>';
    },
    render: function (calculation, pages) {
      return '<div id="plaatpreview"><p class="qcalc__plateIntro">De gebruikte indeling en het meegerekende materiaalvlak. Coördinaatgaten volgen de tekening. L-vormen en vrije contouren worden veilig met hun omhullende rechthoek genest; uitsparingen worden niet hergebruikt.</p>' +
        calculation.groups.map(function (group, index) { return renderGroup(group, index, calculation.state, pages[index], calculation.state.scenarios[calculation.selectedScenario || 0]); }).join('') + '</div>';
    }
  };
})();
