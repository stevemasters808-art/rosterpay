/* Worked examples. Every rate is a figure printed in the FWO pay guides (published 24 June 2026).
   Run: node test.js   or open test.html. Fails loudly if any total is off by a cent. */
(function (root) {
  var CASES = [
    { name: '1 Retail L1 full-time, weekday day shift', award: 'MA000004', employment: 'ft', level: '1',
      shifts: [{ date: '2026-07-07', start: '09:00', end: '17:30', breakMin: 30 }], expect: 222.48, why: '8h x $27.81' },
    { name: '2 Retail L1 full-time, evening after 6pm', award: 'MA000004', employment: 'ft', level: '1',
      shifts: [{ date: '2026-07-09', start: '13:00', end: '21:00', breakMin: 60 }], expect: 215.52, why: '4h x $27.81 + 3h x $34.76' },
    { name: '3 Retail L1 casual, Saturday', award: 'MA000004', employment: 'casual', level: '1',
      shifts: [{ date: '2026-07-11', start: '10:00', end: '16:00', breakMin: 0 }], expect: 250.32, why: '6h x $41.72' },
    { name: '4 Hospitality L1 full-time, Sunday', award: 'MA000009', employment: 'ft', level: '1',
      shifts: [{ date: '2026-07-12', start: '10:00', end: '18:30', breakMin: 30 }], expect: 317.28, why: '8h x $39.66' },
    { name: '5 Retail L1 full-time, public holiday (NSW Labour Day)', award: 'MA000004', employment: 'ft', level: '1',
      shifts: [{ date: '2026-10-05', start: '09:00', end: '15:00', breakMin: 0 }], expect: 375.42, why: '6h x $62.57' },
    { name: '6 Hospitality L1 casual, Friday into Saturday across midnight', award: 'MA000009', employment: 'casual', level: '1',
      shifts: [{ date: '2026-07-10', start: '18:00', end: '02:00', breakMin: 0 }], expect: 292.37, why: '1h x $33.05 + 5h x $33.05 + 5 x $2.95 + 2h Sat x $39.66' },
    { name: '7 Retail L1 casual, loading plus evening (highest rate, no stacking)', award: 'MA000004', employment: 'casual', level: '1',
      shifts: [{ date: '2026-07-08', start: '15:00', end: '21:00', breakMin: 0 }], expect: 229.44, why: '3h x $34.76 + 3h x $41.72' },
    { name: '8 Retail L1 full-time, 11h shift: 2h daily overtime', award: 'MA000004', employment: 'ft', level: '1',
      shifts: [{ date: '2026-07-15', start: '08:00', end: '20:00', breakMin: 60 }], expect: 333.73, why: '9h x $27.81 + 2h OT x $41.72' },
    { name: '9 Hospitality L1 full-time, 40h week: 2h weekly overtime', award: 'MA000009', employment: 'ft', level: '1',
      shifts: ['13', '14', '15', '16', '17'].map(function (d) { return { date: '2026-07-' + d, start: '09:00', end: '17:30', breakMin: 30 }; }),
      expect: 1084.04, why: '38h x $26.44 + 2h OT x $39.66' },
    { name: '10 Retail L1 junior 18, Saturday (pay guide junior table)', award: 'MA000004', employment: 'ft', level: '1', age: '18',
      shifts: [{ date: '2026-07-11', start: '09:00', end: '14:00', breakMin: 0 }], expect: 121.70, why: '5h x $24.34' },
    { name: '11 Retail L1 junior 18, over 6 months, after 1 Dec 2026 phase-in (75%)', award: 'MA000004', employment: 'ft', level: '1', age: '18', over6m: true,
      shifts: [{ date: '2026-12-02', start: '09:00', end: '14:00', breakMin: 0 }], expect: 104.30, why: '5h x $20.86 (75% of $27.81)' },
    { name: '12 Hospitality L1 casual, weeknight 10pm to 3am (evening, then night)', award: 'MA000009', employment: 'casual', level: '1',
      shifts: [{ date: '2026-07-14', start: '22:00', end: '03:00', breakMin: 0 }], expect: 184.41, why: '5h x $33.05 + 2 x $2.95 + 3 x $4.42' }
  ];
  function run(engine, rates, holidays) {
    var out = [];
    CASES.forEach(function (c) {
      var input = { award: c.award, employment: c.employment, level: c.level, age: c.age || 'adult', over6m: !!c.over6m, state: 'NSW',
        periodStart: c.shifts[0].date, periodWeeks: 1, shifts: c.shifts };
      var res, got, err;
      try { res = engine.calculate(rates, holidays, input); got = res.totals.gross; } catch (e) { err = e.message; }
      out.push({ name: c.name, why: c.why, expect: c.expect, got: got, pass: got === c.expect, error: err, lines: res && res.shifts.map(function (s) { return s.lines; }) });
    });
    return out;
  }
  if (typeof module !== 'undefined' && module.exports) {
    var fs = require('fs'), path = require('path'), here = __dirname;
    var engine = require(path.join(here, 'engine.js'));
    var rates = JSON.parse(fs.readFileSync(path.join(here, 'rates.json'), 'utf8'));
    var holidays = JSON.parse(fs.readFileSync(path.join(here, 'holidays.json'), 'utf8'));
    var results = run(engine, rates, holidays), fails = 0;
    results.forEach(function (r) {
      if (!r.pass) fails++;
      console.log((r.pass ? 'PASS' : 'FAIL') + '  ' + r.name + '  expected ' + r.expect.toFixed(2) + ' got ' + (r.error || (r.got == null ? 'none' : r.got.toFixed(2))) + '   [' + r.why + ']');
      if (!r.pass && r.lines) r.lines.forEach(function (ls) { ls.forEach(function (l) { console.log('        ' + l.label + ' ' + l.hours.toFixed(2) + ' x ' + l.rate + ' = ' + l.amount); }); });
    });
    console.log(fails ? fails + ' FAILED' : 'all ' + results.length + ' passed');
    process.exit(fails ? 1 : 0);
  } else { root.RosterPayTests = { CASES: CASES, run: run }; }
})(typeof window !== 'undefined' ? window : this);
