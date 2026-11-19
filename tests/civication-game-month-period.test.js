'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/Civication/core/civicationCalendar.js', 'utf8');
let raw = null;
let writes = 0;
function boot() {
  const window = {};
  vm.runInNewContext(source, { window, Date, localStorage: {
    getItem: () => raw,
    setItem: (_, value) => { raw = value; writes++; }
  }});
  return window.CivicationCalendar;
}
let calendar = boot();
assert.equal(calendar.getGameDate(), '2026-01-01');
assert.equal(writes, 0, 'reading dates does not migrate or mutate saves');
calendar.advanceByMinutes(31 * 1440);
assert.equal(calendar.getMonthPeriod().id, '2026-02');
assert.equal(calendar.getMonthPeriod().daysInMonth, 28);
calendar.advanceByMinutes(28 * 1440);
assert.equal(calendar.getGameDate(), '2026-03-01');
calendar.advanceByMinutes(31 * 1440);
assert.equal(calendar.getGameDate(), '2026-04-01');
const before = raw;
calendar = boot();
assert.equal(calendar.getGameDate(), '2026-04-01');
assert.equal(raw, before, 'reload neither advances nor changes the calendar');
calendar.setClock({ startDateISO: '2024-02-01', dayIndex: 29 });
assert.equal(calendar.getGameDate(), '2024-02-29');
assert.equal(calendar.getMonthPeriod().daysInMonth, 29);
calendar.advanceByMinutes(1440);
assert.equal(calendar.getGameDate(), '2024-03-01');
calendar.setClock({ startDateISO: '2026-02-30' });
assert.equal(calendar.getGameDate(), null, 'invalid dates fail closed');
calendar.setClock({ startDateISO: '2026-01-01', dayIndex: -1 });
assert.equal(calendar.getMonthPeriod(), null);
console.log('PASS: played calendar months, three-month boundaries, leap year, reload and invalid anchors');
