#!/usr/bin/env node
// PR C: fase-/dagslutt-slot i DailyMailBuilder fylles av dayEvents-generatorene
// (makeLunchEvent / makeEveningEvent / makeDayEndEvent), inkl. controller-Dag-1-tekstene.
// Generatorene kalles LAZY ved levering (ikke ved bygging), og resultatet pakkes inn i daily-
// konvolutten slik at PR A/PR B fortsatt kjenner det igjen som et daily-event.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    // Slå av narrativ-strømmer i denne testen, slik at fase-slottene faller til generatoren.
    if (clean.includes('narratives/')) return { ok: false, status: 404, async json() { return null; } };
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) return { ok: false, status: 400, async json() { return null; } };
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

function pendingEvent() {
  const inbox = global.CivicationState.getInbox();
  const item = Array.isArray(inbox) ? inbox.find(row => row && row.status === 'pending') : null;
  return item ? (item.event || item) : null;
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);

  let phase = 'morning';
  let dailySummary = null;
  // dayIndex 1 → isControllerDayOne(active) er sann for controller, slik at vi treffer
  // controller-Dag-1-grenene i generatorene.
  global.CivicationCalendar = {
    DAY_PHASES: ['morning', 'lunch', 'afternoon', 'evening', 'day_end'],
    getPhase: () => phase,
    setPhase: (next) => { phase = next; },
    getPhaseLabel: (p) => String(p || ''),
    getClock: () => ({ dayIndex: 1 }),
    getPhaseModel: () => ({ dayIndex: 1, phase, phaseLabel: phase, dailyFlags: {}, dailySummary }),
    setDailySummary: (s) => { dailySummary = s || null; },
    getDailySummary: () => dailySummary,
    advanceByMinutes: () => {}
  };
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = {
    getAutonomy: () => 50, updateIntegrity: () => null, updateVisibility: () => null,
    updateEconomicRoom: () => null, updateTrust: () => null, checkBurnout: () => null, processCollapse: () => null
  };
  // makeDayEndEvent kaller denne før controller-grenen.
  global.buildCarryoverFromChoiceLog = () => ({ visibilityBias: 0, processBias: 0, fatigue: 0 });

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/day/dayEvents.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');

  // Tell kall til generatorene for å bevise at de kalles ved LEVERING, ikke ved bygging.
  const calls = { lunch: 0, evening: 0, day_end: 0 };
  const realLunch = global.makeLunchEvent;
  const realEvening = global.makeEveningEvent;
  const realDayEnd = global.makeDayEndEvent;
  global.makeLunchEvent = async (active) => { calls.lunch += 1; return realLunch(active); };
  global.makeEveningEvent = async (active) => { calls.evening += 1; return realEvening(active); };
  global.makeDayEndEvent = () => { calls.day_end += 1; return realDayEnd(); };

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    title: 'Controller',
    role_key: 'controller',
    role_id: 'naer_controller'
  });

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  const today = new Date().toISOString().slice(0, 10);
  const built = await global.CivicationDailyMailBuilder.buildQueue(
    global.CivicationState.getActivePosition(),
    { date: today }
  );
  global.CivicationState.setState({ mail_day_runtime_v1: built });

  // Lazy: generatorene skal IKKE være kalt under byggingen (særlig day_end skal ikke skrive en
  // tom dagsoppsummering allerede om morgenen).
  assert.deepStrictEqual(calls, { lunch: 0, evening: 0, day_end: 0 }, 'phase generators must not run at build time');

  // Fase-slottene skal være markert for lazy regenerering.
  const lunchIdx = built.items.findIndex(r => r.phase === 'lunch' && r.phase_generator === 'lunch');
  const eveningIdx = built.items.findIndex(r => r.phase === 'evening' && r.phase_generator === 'evening');
  const dayEndIdx = built.items.findIndex(r => r.phase === 'day_end' && r.phase_generator === 'day_end');
  assert(lunchIdx >= 0, 'lunch phase slot should be marked phase_generator=lunch');
  assert(eveningIdx >= 0, 'evening phase slot should be marked phase_generator=evening');
  assert(dayEndIdx >= 0, 'day_end slot should be marked phase_generator=day_end');

  async function deliverAt(idx) {
    const runtime = global.CivicationState.getState().mail_day_runtime_v1;
    const items = runtime.items.map((row, i) => (i < idx ? { ...row, status: 'answered' } : { ...row, status: 'queued' }));
    global.CivicationState.setState({ mail_day_runtime_v1: { ...runtime, items, current_index: idx } });
    global.CivicationState.setInbox([]);
    const res = await global.CivicationDailyMailBuilder.enqueueNext(engine, {
      active: global.CivicationState.getActivePosition(),
      ignorePending: true
    });
    assert.strictEqual(res?.enqueued, true, `enqueueNext should deliver item ${idx}: ${JSON.stringify(res?.reason)}`);
    return pendingEvent();
  }

  function assertDailyEnvelope(ev, phaseId) {
    assert.strictEqual(ev.mail_class, 'daily_workday', `${phaseId} event should keep mail_class=daily_workday`);
    assert.strictEqual(ev.source_type, 'daily_generated', `${phaseId} event should be tagged source_type=daily_generated`);
    assert.strictEqual(ev.phase_tag, phaseId, `${phaseId} event should keep phase_tag=${phaseId}`);
    assert(ev.daily_mail_meta && ev.daily_mail_meta.phase === phaseId, `${phaseId} event should carry daily_mail_meta`);
    assert.strictEqual(ev.daily_mail_meta.advances_role_plan, false, `${phaseId} generated event must not advance rolePlan`);
    assert.strictEqual(global.CivicationDailyMailBuilder.isDailyEvent(ev), true, `${phaseId} event must be recognised as a daily-event (PR A/B contract)`);
  }

  // Lunsj: controller-Dag-1 lunsjtekst, levert lazy og pakket inn.
  const lunch = await deliverAt(lunchIdx);
  assert.strictEqual(calls.lunch, 1, 'makeLunchEvent should run exactly once at delivery');
  assert.strictEqual(lunch.subject, 'Lunsj – du tar avviket med deg til bordet', 'lunch should carry controller day-1 generator text verbatim');
  assert(Array.isArray(lunch.choices) && lunch.choices.length === 3, 'lunch generator choices should be preserved');
  assertDailyEnvelope(lunch, 'lunch');

  // Kveld: controller-Dag-1 kveldstekst.
  const evening = await deliverAt(eveningIdx);
  assert.strictEqual(calls.evening, 1, 'makeEveningEvent should run exactly once at delivery');
  assert.strictEqual(evening.subject, 'Kveld – tallene slipper ikke helt taket', 'evening should carry controller day-1 generator text verbatim');
  assertDailyEnvelope(evening, 'evening');

  // Dagslutt: controller-Dag-1 dagslutt-tekst (uten valg, slik generatoren leverer den).
  const dayEnd = await deliverAt(dayEndIdx);
  assert.strictEqual(calls.day_end, 1, 'makeDayEndEvent should run exactly once at delivery');
  assert.strictEqual(dayEnd.subject, 'Dag 1 er over – avviket fikk en forklaring, men ikke fred', 'day_end should carry controller day-1 generator text verbatim');
  assertDailyEnvelope(dayEnd, 'day_end');

  // Generatorene skal fortsatt ikke ha kjørt for andre faser enn de leverte.
  assert.deepStrictEqual(calls, { lunch: 1, evening: 1, day_end: 1 }, 'each phase generator should run exactly once, only on delivery');

  console.log('civication-dailymailbuilder-phase-generators.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
