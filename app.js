/* RosterPay page script: form, result rendering, payslip comparison, analytics events. Needs engine.js. */
(function () {
  'use strict';
  /* ---- Configuration. Fill these in once the services exist. ---- */
  var GOATCOUNTER = 'https://rosterpay.goatcounter.com/count';            /* e.g. 'https://rosterpay.goatcounter.com/count'. Empty = no analytics. */
  var WAITLIST_URL = '';           /* Google Form or Formspree URL for the Android waitlist. Empty = "coming soon" note. */

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  var hrs = function (h) { return (Math.round(h * 100) / 100).toString(); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---- Cookie-free analytics (GoatCounter events). No-op until GOATCOUNTER is set. ---- */
  function track(name) {
    if (!GOATCOUNTER) return;
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, event: true });
  }
  if (GOATCOUNTER) {
    var s = document.createElement('script');
    s.async = true; s.src = '//gc.zgo.at/count.js'; s.setAttribute('data-goatcounter', GOATCOUNTER);
    document.head.appendChild(s);
  }
  try { /* return visit within 30 days, counted once per visit */
    var last = +localStorage.getItem('rp_last') || 0, now = Date.now();
    if (last && now - last < 30 * 86400000 && now - last > 30 * 60000) setTimeout(function () { track('return-visit'); }, 1500);
    localStorage.setItem('rp_last', String(now));
  } catch (e) { /* storage blocked, fine */ }

  var rates, holidays;
  var form = $('#calc');
  if (!form) return;
  var submitBtn = $('#calc button[type=submit]'), submitLabel = submitBtn.textContent;
  submitBtn.disabled = true; submitBtn.textContent = 'Loading rates…';

  var AGES = { MA000004: [['adult', 'Adult (21 or over)'], ['u16', 'Under 16'], ['16', '16'], ['17', '17'], ['18', '18'], ['19', '19'], ['20', '20']],
               MA000009: [['adult', 'Adult (21 or over)'], ['u17', 'Under 17'], ['17', '17'], ['18', '18'], ['19', '19'], ['20', '20']] };
  var WORKPLACE = {
    MA000004: [['ok', 'Shop, supermarket, department store, retail chain, newsagent, bottle shop'],
               ['other', 'Fast food, cafe, restaurant, pharmacy, hair or beauty salon']],
    MA000009: [['ok', 'Hotel, pub, club, motel, resort, caterer, casino, function centre'],
               ['other', 'Cafe, restaurant, fast food outlet']]
  };

  function fillLevels() {
    var a = rates.awards[form.award.value], sel = $('#level'), keep = sel.value;
    sel.innerHTML = Object.keys(a.levels).map(function (k) { return '<option value="' + k + '">' + esc(a.levels[k]) + '</option>'; }).join('');
    if (a.levels[keep]) sel.value = keep;
    var age = $('#age'), keepAge = age.value;
    age.innerHTML = AGES[form.award.value].map(function (p) { return '<option value="' + p[0] + '">' + p[1] + '</option>'; }).join('');
    if (AGES[form.award.value].some(function (p) { return p[0] === keepAge; })) age.value = keepAge;
    $$('#workplace label').forEach(function (l, i) { l.lastChild.textContent = ' ' + WORKPLACE[form.award.value][i][1]; });
    toggles();
  }
  function toggles() {
    var retail = form.award.value === 'MA000004', junior = $('#age').value !== 'adult';
    $('#retailOpts').hidden = !retail;
    $('#over6mWrap').hidden = !(junior && (retail || false));
    $('#liquorWrap').hidden = !(junior && !retail);
    $('#juniorLevelNote').hidden = !(junior && retail && ['1', '2', '3'].indexOf($('#level').value) < 0);
    $('#ptHours').hidden = form.employment.value !== 'pt';
  }

  /* ---- Shift rows ---- */
  var tbody = $('#shifts tbody');
  function addRow(s) {
    s = s || {};
    var tr = document.createElement('tr');
    tr.innerHTML = '<td class="date" data-l="Date"><input type="date" name="date" required value="' + esc(s.date || '') + '"></td>' +
      '<td data-l="Start"><input type="time" name="start" required value="' + esc(s.start || '') + '"></td>' +
      '<td data-l="Finish"><input type="time" name="end" required value="' + esc(s.end || '') + '"></td>' +
      '<td data-l="Unpaid break (min)"><input type="number" name="breakMin" min="0" max="600" step="5" value="' + (s.breakMin != null ? s.breakMin : 0) + '"></td>' +
      '<td class="act"><button type="button" class="rm" aria-label="Remove shift">&times;</button></td>';
    $('.rm', tr).onclick = function () { if (tbody.children.length > 1) tr.remove(); else $$('input', tr).forEach(function (i) { i.value = i.type === 'number' ? 0 : ''; }); };
    tbody.appendChild(tr);
    return tr;
  }
  $('#addShift').onclick = function () { var prev = tbody.lastElementChild, r = addRow(prev ? { start: prev.querySelector('[name=start]').value, end: prev.querySelector('[name=end]').value, breakMin: prev.querySelector('[name=breakMin]').value } : null); $('[name=date]', r).focus(); };

  function readInput() {
    var shifts = $$('tr', tbody).map(function (tr) {
      var g = function (n) { return $('[name=' + n + ']', tr).value; };
      return { date: g('date'), start: g('start'), end: g('end'), breakMin: +g('breakMin') || 0 };
    }).filter(function (s) { return s.date && s.start && s.end; });
    return {
      award: form.award.value, employment: form.employment.value, level: $('#level').value, age: $('#age').value,
      over6m: $('#over6m').checked, liquor: $('#liquor').checked, state: $('#state').value, includeRegional: $('#regional').checked,
      agreedWeeklyHours: +$('#agreedWeeklyHours').value || 0, lateTrading: $('#lateTrading').checked, elevenHourDay: $('#elevenHourDay').checked,
      periodStart: $('#periodStart').value || (shifts[0] && shifts[0].date), periodWeeks: +form.periodWeeks.value, shifts: shifts
    };
  }

  /* ---- Remember inputs on this device only ---- */
  function save() { try { var inp = readInput(); inp.ea = form.ea.value; inp.workplace = form.workplace.value; localStorage.setItem('rp_form', JSON.stringify(inp)); } catch (e) {} }
  function restore() {
    var d = null; try { d = JSON.parse(localStorage.getItem('rp_form')); } catch (e) {}
    if (!d) { addRow(); return; }
    if (d.award) form.award.value = d.award; fillLevels();
    if (d.employment) form.employment.value = d.employment;
    if (d.level) $('#level').value = d.level; if (d.age) $('#age').value = d.age;
    $('#over6m').checked = !!d.over6m; $('#liquor').checked = !!d.liquor; $('#regional').checked = !!d.includeRegional;
    if (d.state && !document.body.dataset.state) $('#state').value = d.state;
    $('#agreedWeeklyHours').value = d.agreedWeeklyHours || ''; $('#lateTrading').checked = !!d.lateTrading; $('#elevenHourDay').checked = !!d.elevenHourDay;
    if (d.periodStart) $('#periodStart').value = d.periodStart; if (d.periodWeeks) form.periodWeeks.value = d.periodWeeks;
    if (d.ea) form.ea.value = d.ea; if (d.workplace) form.workplace.value = d.workplace;
    (d.shifts && d.shifts.length ? d.shifts : [null]).forEach(addRow);
    toggles();
  }

  /* ---- Result ---- */
  var lastResult = null;
  function render(res, input) {
    var award = rates.awards[input.award];
    var h = '<h2 id="resultHead">Award minimum for these shifts</h2>';
    h += '<table class="ledger"><thead><tr><th>Pay type</th><th class="num">Hours</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>';
    res.totals.lines.forEach(function (l) {
      h += '<tr><td>' + esc(l.label) + '</td><td class="num">' + hrs(l.hours) + (l.unit ? ' <small>' + l.unit + '</small>' : '') + '</td><td class="num rate">' + (l.rate == null ? '<small>varies</small>' : money(l.rate)) + '</td><td class="num">' + money(l.amount) + '</td></tr>';
    });
    h += '</tbody><tfoot><tr><td>Gross before tax</td><td class="num">' + hrs(res.totals.hours) + '</td><td></td><td class="num"><span class="gross">' + money(res.totals.gross) + '</span></td></tr></tfoot></table>';
    if (input.employment === 'casual') h += '<p class="hint">Casual rates above already include the 25% casual loading. The award pays the single highest rate for each hour, not a stack of penalties.</p>';
    if (form.ea.value === 'unsure') h += '<div class="notice"><p><strong>Check whether an enterprise agreement covers you.</strong> Many large employers (supermarkets, department stores, hotel groups, big pubs) pay under an agreement, not this award. Look for an agreement name on your payslip or contract, or ask HR. If one applies, these figures are not yours.</p></div>';
    h += '<h3>Shift by shift</h3>';
    res.shifts.forEach(function (s) {
      h += '<details><summary>' + esc(s.date) + ' &nbsp; ' + esc(s.start) + ' to ' + esc(s.end) + (s.breakMin ? ', ' + s.breakMin + ' min break' : '') + ' &nbsp; ' + hrs(s.hours) + ' h &nbsp; ' + money(s.total) + '</summary><div class="shift-block"><table class="ledger"><tbody>';
      s.lines.forEach(function (l) { h += '<tr><td>' + esc(l.label) + '</td><td class="num">' + hrs(l.hours) + (l.unit ? ' <small>' + l.unit + '</small>' : '') + '</td><td class="num">' + money(l.rate) + '</td><td class="num">' + money(l.amount) + '</td></tr>'; });
      h += '</tbody></table>' + s.warnings.map(function (w) { return '<p class="hint">' + esc(w) + '</p>'; }).join('') + '</div></details>';
    });
    res.warnings.forEach(function (w) { h += '<div class="notice"><p>' + esc(w) + '</p></div>'; });
    h += '<h3>What this estimate assumes</h3><ul class="assume">' + res.assumptions.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>';
    h += '<p class="hint">Rates from the ' + esc(award.name) + ' as at ' + esc(rates.version) + ', checked ' + esc(rates.checked) + '. Change the level, age or options above and recalculate if any assumption is wrong.</p>';
    h += '<h3>Compare with your payslip</h3><p>Enter the gross (before tax) amount your payslip shows for the same shifts.</p>' +
      '<div class="compare"><label for="payslip">Gross on your payslip<input type="number" id="payslip" min="0" step="0.01" inputmode="decimal"></label><output for="payslip" id="compareOut"></output></div>';
    h += '<div class="notice stop"><p><strong>Before you raise anything with your employer:</strong> this is an estimate of the award minimum from the details you entered, not a finding that you were underpaid. Common legitimate reasons for a difference: an enterprise agreement, a different classification level, allowances or deductions, a roster agreement, or a pay period that does not line up with these shifts. Confirm with the <a href="https://calculate.fairwork.gov.au/" rel="noopener" target="_blank">Fair Work Ombudsman Pay and Conditions Tool</a> or call the Fair Work Infoline on 13 13 94.</p></div>';
    h += '<div class="app-cta"><p><strong>Want this on your phone?</strong> An Android app that logs shifts and checks each payslip is in the works.</p><button type="button" class="btn btn-ghost" id="appBtn">Get the Android app</button><p id="appNote" class="hint" hidden>Not released yet. The waitlist opens soon; check back here.</p></div>';
    var out = $('#result'); out.innerHTML = h; out.hidden = false;
    $('#payslip').oninput = function () {
      var v = parseFloat(this.value); var o = $('#compareOut');
      if (isNaN(v)) { o.textContent = ''; return; }
      var d = Math.round((res.totals.gross - v) * 100) / 100;
      if (Math.abs(d) < 0.005) o.innerHTML = 'Your payslip matches the award minimum for these shifts.';
      else if (d > 0) o.innerHTML = 'Your payslip is <span class="diff">' + money(d) + ' below</span> the award minimum estimate for these shifts. Read the note below before acting on this.';
      else o.innerHTML = 'Your payslip is <span class="diff">' + money(-d) + ' above</span> the award minimum estimate. Above-award pay, an agreement or allowances could explain it.';
      if (!this.dataset.tracked) { this.dataset.tracked = '1'; track('payslip-compare'); }
    };
    $('#appBtn').onclick = function () { track('app-waitlist'); if (WAITLIST_URL) window.open(WAITLIST_URL, '_blank', 'noopener'); else $('#appNote').hidden = false; };
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#resultHead').focus && $('#resultHead').setAttribute('tabindex', '-1');
    $('#resultHead').focus();
  }

  function showStop(html) { var out = $('#result'); out.innerHTML = '<div class="notice"><p>' + html + '</p></div>'; out.hidden = false; out.scrollIntoView({ behavior: 'smooth' }); }

  form.onsubmit = function (e) {
    e.preventDefault();
    var input = readInput();
    if (!input.shifts.length) { showStop('Add at least one shift with a date, start and finish time.'); return; }
    if (form.ea.value === 'yes') { showStop('<strong>This calculator does not apply to you.</strong> An enterprise agreement sets your pay, and its rates and penalties differ from the award. Find the agreement on the <a href="https://www.fwc.gov.au/agreements-awards/enterprise-agreements/find-enterprise-agreement" target="_blank" rel="noopener">Fair Work Commission site</a> or ask your employer for a copy.'); return; }
    if (form.workplace.value === 'other') { showStop('<strong>A different award covers that workplace</strong> (for example the Fast Food, Restaurant, Pharmacy or Hair and Beauty award), with different rates. This calculator only does Retail and Hospitality. Use <a href="https://www.fairwork.gov.au/employment-conditions/awards/find-my-award" target="_blank" rel="noopener">Find my award</a> to identify yours.'); return; }
    if (!form.ea.value || !form.workplace.value) { showStop('Answer the two questions under "Before you calculate" first.'); return; }
    try { lastResult = RosterPay.calculate(rates, holidays, input); }
    catch (err) { showStop('Could not calculate: ' + esc(err.message)); return; }
    render(lastResult, input); save(); track('calc');
  };
  form.addEventListener('change', function (e) { if (e.target.name === 'award') fillLevels(); else toggles(); });

  /* ---- Load data, then wire up ---- */
  Promise.all([fetch('rates.json'), fetch('holidays.json')]).then(function (rs) { return Promise.all(rs.map(function (r) { return r.json(); })); })
    .then(function (d) {
      rates = d[0]; holidays = d[1];
      if (document.body.dataset.state) $('#state').value = document.body.dataset.state;
      fillLevels(); restore();
      $('#ratesVersion').textContent = rates.version; $('#ratesChecked').textContent = rates.checked;
      submitBtn.disabled = false; submitBtn.textContent = submitLabel;
    })
    .catch(function () { submitBtn.textContent = 'Rates did not load'; showStop('Could not load the rate tables. Check your connection and reload the page. If you opened this file directly, open it through a web server instead.'); });
})();
