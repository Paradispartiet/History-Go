#!/usr/bin/env node
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
  global.CivicationCalendar = { getPhase: () => phase, setPhase: (next) => { phase = next; }, advanceByMinutes: () => {} };
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = { getAutonomy: () => 50, updateIntegrity: () => null, updateVisibility: () => null, updateEconomicRoom: () => null, updateTrust: () => null, checkBurnout: () => null, processCollapse: () => null };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    title: 'Controller',
    role_key: 'controller',
    role_id: 'naer_controller'
  });

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;
  // Bygg dagen for DAGENS dato og legg den i state, slik at den senere onAppOpen-en gjenbruker
  // nøyaktig samme runtime (ensureRuntime gjenbruker kun når runtime.date === todayKey()).
  // Tidligere bygde testen med en fast dato og kalte resetToday(), som tvang en ny, ikke-
  // deterministisk gjenbygging (annen seed + narrativ-state) — derav den datostyrte flakingen.
  const today = new Date().toISOString().slice(0, 10);
  const runtime = await global.CivicationDailyMailBuilder.buildQueue(global.CivicationState.getActivePosition(), { date: today });
  global.CivicationState.setState({ mail_day_runtime_v1: runtime });

  assert(runtime, 'mail_day_runtime_v1 should be built for Controller day 1');
  assert.strictEqual(runtime.date, today, 'runtime should keep requested (today) date');
  assert.strictEqual(runtime.career_id, 'naeringsliv', 'runtime should keep controller career_id');
  assert.strictEqual(runtime.role_scope, 'controller', 'runtime should resolve controller role_scope');
  assert.strictEqual(runtime.role_id, 'naer_controller', 'runtime should keep active role_id');
  assert.strictEqual(runtime.current_index, 0, 'runtime should start at current_index 0');
  assert(Array.isArray(runtime.delivered_ids), 'runtime should expose delivered_ids');
  assert(Array.isArray(runtime.answered_ids), 'runtime should expose answered_ids');
  assert(Array.isArray(runtime.items) && runtime.items.length >= 18, 'runtime should build a full day of queued items');

  const phases = runtime.items.map(row => row.phase);
  assert.deepStrictEqual([...new Set(phases)], ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'], 'runtime should preserve full day phase order');
  for (const row of runtime.items) {
    assert(row.slot, `${row.event?.id} should have a daily slot`);
    assert(row.event?.id, 'each runtime item should carry an event id');
    assert.strictEqual(row.event.phase_tag, row.phase, `${row.event.id} should mirror row phase in event.phase_tag`);
  }

  const plannedItems = runtime.items.filter(row => row.event?.source_type === 'planned');
  assert.strictEqual(plannedItems.length, 1, 'only the primary plan mail should use source_type=planned');
  assert.strictEqual(
    plannedItems[0].event.id,
    'job_controller_week1_month_report_before_explanation',
    'Controller day 1 should keep the first week month-report mail as primary_work_mail'
  );
  assert.strictEqual(plannedItems[0].event.daily_mail_meta?.advances_role_plan, true, 'the primary planned mail should be the only role-plan advancing item');
  for (const row of runtime.items.filter(row => row.event?.source_type !== 'planned')) {
    assert.notStrictEqual(row.event?.daily_mail_meta?.advances_role_plan, true, `${row.event?.id} must not advance rolePlan`);
  }

  const lateProgressionItems = runtime.items.filter(row => {
    const id = `${row.event?.id || ''} ${row.event?.source_mail_id || ''}`;
    return /week2|second_week/i.test(id);
  });
  assert.deepStrictEqual(
    lateProgressionItems.map(row => row.event?.source_mail_id || row.event?.id),
    [],
    'Controller day 1 daily_extra selection must not include week2/second_week mails'
  );

  const morningBrief = runtime.items.find(row => row.phase === 'morning' && row.slot === 'morning_brief');
  assert(morningBrief, 'runtime should include a morning_brief slot');
  assert.notStrictEqual(
    morningBrief.event?.source_mail_id || morningBrief.event?.id,
    'job_controller_week2_periodization_or_polishing',
    'morning_brief must not use the week 2 periodization job mail on day 1'
  );

  const privateItem = runtime.items.find(row => global.CivicationEventChannels.getMessageChannel(row.event) === 'private');
  assert(privateItem, 'Controller day should include private/personal signal mail');
  assert.strictEqual(privateItem.event.channel, 'private', 'private signal should keep channel=private');

  // Ikke resetToday(): runtime ligger i state for dagens dato, så onAppOpen gjenbruker den og
  // leverer det første item-et i den samme bunken (deterministisk).
  const first = await engine.onAppOpen({ force: true });
  assert.strictEqual(first.enqueued, true, 'opening the app should deliver the first daily item');
  assert.strictEqual(pendingEvent().id, runtime.items[0].event.id, 'pending mail should be first daily runtime event');
  await engine.answer(pendingEvent().id, pendingEvent().choices[0].id);
  const afterAnswer = global.CivicationState.getState().mail_day_runtime_v1;
  assert(afterAnswer.answered_ids.includes(runtime.items[0].event.id), 'answer should mark daily item answered in runtime');
  assert.strictEqual(afterAnswer.items[0].status, 'answered', 'answer should resolve the daily runtime item');

  console.log('civication-controller-day1-daily-builder.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
