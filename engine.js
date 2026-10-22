/* RosterPay award engine. Pure functions, no DOM. Works in browser (window.RosterPay) and Node (module.exports).
   Rules come from rates.json and holidays.json; this file only knows how to apply them. */
(function (root) {
  'use strict';

  var r2 = function (x) { return Math.round(x * 100 + 1e-7) / 100; };
  var hm = function (s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };
  var utc = function (dateStr, minutes) {
    var p = dateStr.split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2]) + (minutes || 0) * 60000;
  };
  var dayDiff = function (a, b) { return Math.round((utc(b) - utc(a)) / 86400000); };

  var LABELS = {
    ordinary: 'Ordinary hours', evening: 'Evening', night: 'Night', sat: 'Saturday', sun: 'Sunday', ph: 'Public holiday',
    ot1: 'Overtime', ot2: 'Overtime (later hours)', otSat: 'Overtime Saturday', otSun: 'Overtime Sunday', otPh: 'Overtime public holiday',
    eveningLoad: 'Evening loading', nightLoad: 'Night loading'
  };
  var PEN_RANK = ['ordinary', 'evening', 'night', 'sat', 'sun', 'ph'];
  var ORDER = ['ordinary', 'evening', 'eveningLoad', 'night', 'nightLoad', 'sat', 'sun', 'ph', 'ot1', 'ot2', 'otSat', 'otSun', 'otPh'];

  function latest(list, dateStr) {
    var hit = null;
    list.forEach(function (b) { if (b.effectiveFrom <= dateStr) hit = b; });
    return hit;
  }

  /* Hourly minimum for this worker on this date (junior percentage applied, rounded to the cent). */
  function baseRate(award, input, dateStr) {
    var table = latest(award.rates, dateStr);
    if (!table) throw new Error('No rates in force on ' + dateStr);
    var adult = table.hourly[input.level];
    if (adult == null) throw new Error('Unknown level ' + input.level);
    var pct = 100;
    var juniorApplies = input.age && input.age !== 'adult' &&
      !(award.junior.liquorServiceAdult && input.liquor) &&
      (!award.junior.levels || award.junior.levels.indexOf(input.level) >= 0);
    if (juniorApplies) {
      var p = null;
      award.junior.bands.forEach(function (b) {
        if (b.effectiveFrom > dateStr) return;
        if (b.pct && b.pct[input.age] != null) p = b.pct[input.age];
        if (input.over6m && b.pctOver6m && b.pctOver6m[input.age] != null) p = b.pctOver6m[input.age];
      });
      if (p == null) throw new Error('No junior rate for age ' + input.age);
      pct = p;
    }
    return { adult: adult, pct: pct, hourly: r2(adult * pct / 100), effectiveFrom: table.effectiveFrom };
  }

  function holidayAt(holidays, state, includeRegional, dateStr, minuteOfDay) {
    var list = (holidays.states[state] || []);
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      if (h.date !== dateStr) continue;
      if (h.regional && !includeRegional) continue;
      if (h.from && (minuteOfDay < hm(h.from) || minuteOfDay >= hm(h.to))) continue;
      return h;
    }
    return null;
  }

  /* One minute of a shift, classified. */
  function classify(award, input, holidays, ts) {
    var d = new Date(ts), dateStr = d.toISOString().slice(0, 10), dow = d.getUTCDay(), mod = d.getUTCHours() * 60 + d.getUTCMinutes();
    var ph = holidayAt(holidays, input.state, input.includeRegional, dateStr, mod);
    var cat;
    if (ph) cat = 'ph';
    else if (dow === 0) cat = 'sun';
    else if (dow === 6) cat = 'sat';
    else {
      cat = 'ordinary';
      var ev = award.penalties.evening, ni = award.penalties.night;
      if (ev && mod >= hm(ev.from) && (!ev.to || mod < hm(ev.to))) cat = 'evening';
      if (ni && mod >= hm(ni.from) && mod < hm(ni.to)) cat = 'night';
    }
    var inSpan = true;
    if (award.span) {
      var sp = dow === 0 ? award.span.sun : dow === 6 ? award.span.sat : award.span.monfri;
      var end = input.lateTrading ? hm(award.spanLateTradingEnd) : hm(sp[1]);
      inSpan = mod >= hm(sp[0]) && mod < end;
    }
    return { ts: ts, dateStr: dateStr, dow: dow, cat: cat, ph: ph, ot: !inSpan, gone: false };
  }

  function shiftMinutes(award, input, holidays, shift) {
    var start = utc(shift.date, hm(shift.start)), end = utc(shift.date, hm(shift.end));
    if (end <= start) end += 86400000; /* crosses midnight */
    var mins = [];
    for (var t = start; t < end; t += 60000) mins.push(classify(award, input, holidays, t));
    /* Unpaid break: taken out of the cheapest minutes. Assumption, stated to the user. */
    var left = Math.round(shift.breakMin || 0);
    while (left > 0) {
      var best = null, bestRank = 99;
      for (var i = mins.length - 1; i >= 0; i--) {
        var m = mins[i]; if (m.gone) continue;
        var rank = (m.ot ? 10 : 0) + PEN_RANK.indexOf(m.cat);
        if (rank < bestRank) { bestRank = rank; best = m; }
      }
      if (!best) break;
      best.gone = true; left--;
    }
    /* Daily cap on ordinary hours: anything past it, in time order, is overtime. */
    var cap = award.dailyOrdinaryMax;
    if (input.employment === 'casual' && award.dailyOrdinaryMaxCasual) cap = award.dailyOrdinaryMaxCasual;
    if (award.dailyOrdinaryMaxOnce && input.elevenHourDay) cap = award.dailyOrdinaryMaxOnce;
    var count = 0;
    mins.forEach(function (m) { if (m.gone || m.ot) return; count++; if (count > cap * 60) m.ot = true; });
    return mins;
  }

  function pct(tbl, input) { return input.employment === 'casual' ? tbl.casual : tbl.ft; }

  function otTier(tiers, n) { /* n = 1-based overtime minute within the shift */
    var acc = 0;
    for (var i = 0; i < tiers.length; i++) {
      if (tiers[i].hours == null) return { tier: tiers[i], idx: i };
      acc += tiers[i].hours * 60;
      if (n <= acc) return { tier: tiers[i], idx: i };
    }
    return { tier: tiers[tiers.length - 1], idx: tiers.length - 1 };
  }

  function priceShift(award, input, shift, mins, base) {
    var lines = {}, otN = 0, warnings = [];
    function add(code, rate) {
      var l = lines[code] || (lines[code] = { code: code, label: LABELS[code], minutes: 0, rate: rate, amount: 0 });
      l.minutes += 1;
    }
    mins.forEach(function (m) {
      if (m.gone) return;
      if (m.ot) {
        otN++;
        var ot = award.overtime, code, rate;
        if (m.cat === 'ph' && !ot.ph) { code = 'ph'; rate = r2(base.hourly * pct(award.penalties.ph, input) / 100); }
        else {
          var tiers = m.cat === 'ph' ? ot.ph : m.dow === 0 ? ot.sun : m.dow === 6 ? ot.sat : ot.weekday;
          var t = otTier(tiers, otN);
          if (m.cat === 'ph') code = 'otPh';
          else if (m.dow === 0) code = 'otSun';
          else if (m.dow === 6 && tiers.length === 1) code = 'otSat';
          else code = t.idx ? 'ot2' : 'ot1';
          rate = r2(base.hourly * pct(t.tier, input) / 100);
        }
        add(code, rate);
      } else {
        add(m.cat, r2(base.hourly * pct(award.penalties[m.cat], input) / 100));
      }
    });
    Object.keys(lines).forEach(function (k) {
      var l = lines[k]; l.hours = l.minutes / 60; l.amount = r2(l.hours * l.rate);
    });
    /* Flat per-hour-or-part additions (Hospitality evening and night). Not paid on overtime minutes. */
    ['evening', 'night'].forEach(function (c) {
      var p = award.penalties[c];
      if (p && p.addPerHour && lines[c]) {
        var units = Math.ceil(lines[c].minutes / 60 - 1e-9);
        lines[c + 'Load'] = { code: c + 'Load', label: LABELS[c + 'Load'], minutes: 0, hours: units, rate: p.addPerHour, amount: r2(units * p.addPerHour), unit: 'hr or part' };
      }
    });
    var worked = mins.filter(function (m) { return !m.gone; }).length;
    if (worked > 12 * 60) warnings.push('Shift longer than 12 hours.');
    var total = 0;
    var out = ORDER.filter(function (c) { return lines[c]; }).map(function (c) { total = r2(total + lines[c].amount); return lines[c]; });
    return { date: shift.date, start: shift.start, end: shift.end, breakMin: shift.breakMin || 0, hours: worked / 60, lines: out, total: total, warnings: warnings };
  }

  function calculate(data, holidays, input) {
    var award = data.awards[input.award];
    if (!award) throw new Error('Unknown award ' + input.award);
    var shifts = input.shifts.slice().sort(function (a, b) { return (a.date + a.start) < (b.date + b.start) ? -1 : 1; });
    var weeklyCap = award.weeklyOrdinaryMax * 60;
    if (input.employment === 'pt' && input.agreedWeeklyHours > 0) weeklyCap = input.agreedWeeklyHours * 60;
    var weekly = {}, results = [], warnings = [], assumptions = [];
    var periodDays = (input.periodWeeks || 1) * 7;
    var baseAny = null;
    shifts.forEach(function (s) {
      var base = baseRate(award, input, s.date); baseAny = baseAny || base;
      var mins = shiftMinutes(award, input, holidays, s);
      var offset = dayDiff(input.periodStart, s.date), wk = Math.floor(offset / 7);
      if (offset < 0 || offset >= periodDays) warnings.push('Shift on ' + s.date + ' is outside the pay period starting ' + input.periodStart + '. Its weekly overtime was counted in its own week.');
      weekly[wk] = weekly[wk] || 0;
      var ord = mins.filter(function (m) { return !m.gone && !m.ot; }).length;
      var over = weekly[wk] + ord - weeklyCap;
      for (var i = mins.length - 1; i >= 0 && over > 0; i--) { var m = mins[i]; if (!m.gone && !m.ot) { m.ot = true; over--; ord--; } }
      weekly[wk] += ord;
      results.push(priceShift(award, input, s, mins, base));
    });
    var byCode = {}, gross = 0, hours = 0;
    results.forEach(function (r) {
      hours += r.hours;
      r.lines.forEach(function (l) {
        var b = byCode[l.code] || (byCode[l.code] = { code: l.code, label: l.label, hours: 0, amount: 0, rate: l.rate, unit: l.unit });
        b.hours += l.hours; b.amount = r2(b.amount + l.amount); if (b.rate !== l.rate) b.rate = null;
      });
      gross = r2(gross + r.total);
    });
    var totals = ORDER.filter(function (c) { return byCode[c]; }).map(function (c) { return byCode[c]; });
    if (baseAny) {
      assumptions.push(award.name + ', ' + (award.levels[input.level] || 'level ' + input.level) + ', ' + ({ ft: 'full-time', pt: 'part-time', casual: 'casual' })[input.employment] + '.');
      assumptions.push(baseAny.pct === 100 ? 'Adult minimum hourly rate $' + baseAny.hourly.toFixed(2) + ' (rates from ' + baseAny.effectiveFrom + ').'
        : 'Junior rate ' + baseAny.pct + '% of adult $' + baseAny.adult.toFixed(2) + ' = $' + baseAny.hourly.toFixed(2) + ' per hour' + (input.over6m ? ', more than 6 months with this employer' : '') + '.');
    }
    if (award.span) assumptions.push(input.lateTrading ? 'Store trades late: ordinary hours allowed until 11pm.' : 'Ordinary hours 7am to 9pm Monday to Friday, 7am to 6pm Saturday, 9am to 6pm Sunday. Work outside that is overtime.');
    if (award.dailyOrdinaryMaxOnce) assumptions.push(input.elevenHourDay ? 'Roster allows one 11 hour ordinary day.' : 'More than 9 ordinary hours in a shift is overtime.');
    else assumptions.push('More than ' + (input.employment === 'casual' && award.dailyOrdinaryMaxCasual ? award.dailyOrdinaryMaxCasual : award.dailyOrdinaryMax) + ' ordinary hours in a shift is overtime.');
    assumptions.push('More than ' + (weeklyCap / 60) + ' ordinary hours in a week (weeks start on the pay period start day) is overtime.');
    assumptions.push('Unpaid breaks come off the lowest-paid part of the shift.');
    assumptions.push('Public holidays for ' + input.state + (input.includeRegional ? ', including regional days.' : ', state-wide days only.'));
    assumptions.push('No allowances, shiftwork, higher duties, leave, tax or super.');
    return { shifts: results, totals: { lines: totals, gross: gross, hours: hours }, assumptions: assumptions, warnings: warnings };
  }

  var api = { calculate: calculate, baseRate: baseRate, LABELS: LABELS, r2: r2 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.RosterPay = api;
})(typeof window !== 'undefined' ? window : this);
