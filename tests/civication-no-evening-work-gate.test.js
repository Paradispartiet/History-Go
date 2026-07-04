#!/usr/bin/env node
// tests/civication-no-evening-work-gate.test.js
//
// Produktregel: man skal IKKE få en arbeidsgiver-/leveransesak (task_gate) om
// kvelden. Kvelden er fritid (hvile, læring, sosialt) per dagsprogrammet.
//
// Tidligere injiserte defaultGates() en `analysis_delivery`-gate med phase
// "evening". Når spilleren ikke fullførte den, blokkerte den levering av
// kveldens fritidssak (getOpenTaskGateBlock), slik at dagen ikke kunne avsluttes.
//
// Pinner at insertGates aldri legger en task_gate i dinner/evening/day_end, at
// arbeidsgcategne bare ligger i arbeidstidsfasene (morning/forenoon/workday/
// afternoon), og at ingen gate er tagget "evening".

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

const stateStore = {};
global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.Event = function (t) { this.type = t; };
global.document = { readyState: 'complete', addEventListener() {} };
global.localStorage = {
  getItem: (k) => (k in stateStore ? stateStore[k] : null),
  setItem: (k, v) => { stateStore[k] = String(v); },
  removeItem: (k) => { delete stateStore[k]; },
  clear: () => { for (const k of Object.keys(stateStore)) delete stateStore[k]; }
};

const active = { career_id: 'by', title: 'Arealplanlegger', role_key: 'by_radgiver_plan', role_id: 'by_arealplanlegger' };
global.window.CivicationState = {
  getActivePosition: () => active,
  getState: () => ({}),
  setState: () => {},
  getInbox: () => []
};
global.window.CivicationTaskEngine = { listOpenTasks: () => [], getTaskByMailId: () => null };

vm.runInThisContext(fs.readFileSync(path.join(repoRoot, 'js/Civication/systems/civicationDailyTaskGates.js'), 'utf8'), { filename: 'civicationDailyTaskGates.js' });
const gates = global.window.CivicationDailyTaskGates;
assert(gates && typeof gates.insertGates === 'function', 'CivicationDailyTaskGates.insertGates mangler');

// Bygg en syntetisk dagsruntime med items i alle faser (nok til at alle
// afterAnsweredCount-terskler passeres).
const phases = ['morning', 'morning', 'morning', 'morning', 'forenoon', 'forenoon', 'forenoon', 'forenoon',
  'workday', 'workday', 'workday', 'workday', 'workday', 'lunch', 'lunch', 'lunch', 'lunch',
  'afternoon', 'afternoon', 'afternoon', 'afternoon', 'afternoon', 'dinner', 'dinner', 'dinner',
  'evening', 'evening', 'evening', 'evening', 'evening', 'evening', 'day_end', 'day_end', 'day_end'];
const runtime = {
  role_scope: 'by_radgiver_plan',
  current_index: 0,
  delivered_ids: [], answered_ids: [],
  items: phases.map((ph, i) => ({ status: 'queued', phase: ph, slot: 'slot_' + i, event: { id: 'm' + i, mail_type: 'people', phase_tag: ph } }))
};

const withGates = gates.insertGates(runtime, active);
const gateRows = (withGates.items || []).filter((row) => String(row?.event?.mail_type || '').trim() === 'task_gate');

assert(gateRows.length >= 1, 'det skal fortsatt finnes minst én arbeidsleveranse-gate (morgen/ettermiddag)');

const LEISURE_PHASES = new Set(['dinner', 'evening', 'day_end']);
for (const row of gateRows) {
  const gatePhase = String(row?.phase || row?.event?.phase_tag || '').trim();
  assert(!LEISURE_PHASES.has(gatePhase), `task_gate havnet i fritidsfase "${gatePhase}" (id ${row?.event?.id}) — kvelden skal være arbeidsfri`);
}

// Ingen gate-metadata skal deklarere phase "evening".
const declaredEvening = (withGates.task_gates || []).filter((g) => String(g.phase || '').trim() === 'evening');
assert.strictEqual(declaredEvening.length, 0, 'ingen task_gate skal deklareres for kvelden');

// De gjenværende gatene skal ligge i arbeidstidsfaser.
const WORK_PHASES = new Set(['morning', 'forenoon', 'workday', 'lunch', 'afternoon']);
for (const g of (withGates.task_gates || [])) {
  assert(WORK_PHASES.has(String(g.phase || '').trim()), `gate ${g.id} skal ligge i en arbeidstidsfase, ikke "${g.phase}"`);
}

console.log('civication-no-evening-work-gate.test.js passed');
