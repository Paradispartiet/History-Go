#!/usr/bin/env node
// Civication — skille mellom privat døgnrytme og arbeidsdag.
//
// Feilen som rettes: CivicationDailyMailBuilder bygde HELE døgnet som en
// arbeidsdag, slik at jobbmailer (Arealplanlegger/Lillebekk/plankart/…) dukket
// opp i morgen, lunsj, middag, kveld og dagslutt. Riktig modell er to rytmer:
//   - Døgnrytme (privat): morgen, lunsj, ettermiddag, middag, kveld, dagslutt
//   - Arbeidsrytme (jobb): forenoon + workday hos arbeidsgiveren
// Jobbinnhold skal kun leve i arbeidsrytmen. Morgenen leder til «Gå til jobb».
// Arbeidsdag-telleren (workday_day_index) er frikoblet fra døgnfase-telleren.
//
// Se js/Civication/systems/civicationWorkdayRuntime.js,
// js/Civication/systems/civicationDayFlow.js og
// js/Civication/systems/civicationDailyMailBuilder.js.
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

const PRIVATE_PHASES = ['morning', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'];
const WORK_PHASES = ['forenoon', 'workday'];

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  // Ekte kalender-kjerne + dagsfase-bro, slik at døgnfase-telleren (dayIndex) er
  // reell og kan sammenlignes mot arbeidsdag-telleren.
  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationCalendar.js');
  loadScript('js/Civication/systems/day/dayCalendarBridge.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationMailEngine.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationWorkdayRuntime.js');
  loadScript('js/Civication/systems/civicationDayFlow.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');

  const builder = global.CivicationDailyMailBuilder;
  const workday = global.CivicationWorkdayRuntime;
  const dayFlow = global.CivicationDayFlow;
  const calendar = global.CivicationCalendar;

  const active = {
    career_id: 'by',
    title: 'Arealplanlegger',
    role_key: 'by_radgiver_plan',
    role_id: 'by_radgiver_plan',
    brand_id: 'plan_og_bygningsetaten'
  };
  global.CivicationState.setActivePosition(active);
  calendar.setPhase('morning');

  const runtime = await builder.buildQueue(active, { date: '2026-06-22' });
  const itemsIn = phases => runtime.items.filter(row => phases.includes(row.phase));

  // --- 1) Morgenfasen viser «Gå til jobb», ikke en Lillebekk-case-mail --------
  const morningRows = itemsIn(['morning']);
  const goToWork = morningRows.find(row => row.event?.go_to_work === true);
  assert(goToWork, 'morgenfasen skal inneholde en «Gå til jobb»-overgang');
  assert.strictEqual(goToWork.event.mail_type, 'day_transition', 'overgangen skal være en day_transition-mail');
  assert(/gå til jobb/i.test(JSON.stringify(goToWork.event)), 'overgangen skal si «Gå til jobb»');
  const morningText = JSON.stringify(morningRows.map(r => r.event || {})).toLowerCase();
  for (const jobTerm of ['lillebekk', 'plankart', 'utvalg', 'plansjef', 'utbygger', 'nabomail', 'varelevering']) {
    assert(!morningText.includes(jobTerm), `morgenfasen må ikke inneholde case-ordet «${jobTerm}»`);
  }

  // --- 2) Private faser: 0 mailer med role_scope=by_radgiver_plan ------------
  const privateRows = itemsIn(PRIVATE_PHASES);
  const leakedScope = privateRows.filter(row => row.event?.role_scope === 'by_radgiver_plan');
  assert.strictEqual(leakedScope.length, 0, `private faser må ha 0 mailer med role_scope=by_radgiver_plan (fant ${leakedScope.length})`);

  // --- 3) Private faser: 0 daily_workday-mailer ------------------------------
  const leakedClass = privateRows.filter(row => row.event?.mail_class === 'daily_workday');
  assert.strictEqual(leakedClass.length, 0, `private faser må ha 0 daily_workday-mailer (fant ${leakedClass.length})`);

  // --- 4) Arbeidsdagen inneholder Arealplanlegger-mailene --------------------
  const workRows = itemsIn(WORK_PHASES);
  const workRoleMails = workRows.filter(row => row.event?.role_scope === 'by_radgiver_plan');
  assert(workRoleMails.length >= 3, `arbeidsfasene skal bære Arealplanlegger-rollemailene (fant ${workRoleMails.length})`);
  const workText = JSON.stringify(workRows.map(r => r.event || {})).toLowerCase();
  assert(/plankart/.test(workText), 'arbeidsdagen skal inneholde plankart-arbeidet');
  // Den kanoniske nabomail/varelevering-casen ligger i arbeidsdagen, ikke privat.
  const nabomailRow = runtime.items.find(row => String(row.event?.thread_key || '').includes('.case.den_irriterende_nabomailen'));
  assert(nabomailRow, 'nabomail-casen skal finnes i dagskøen');
  assert(WORK_PHASES.includes(nabomailRow.phase), `nabomail-casen skal ligge i arbeidsdagen, ikke i «${nabomailRow.phase}»`);

  // --- 5) Etter fullført arbeidsdag: ingen jobbmailer i middag/kveld/dagslutt -
  for (const phase of ['dinner', 'evening', 'day_end']) {
    const rows = itemsIn([phase]);
    const jobbmails = rows.filter(row => builder.isWorkContentEvent(row.event));
    assert.strictEqual(jobbmails.length, 0, `${phase} må ikke inneholde jobbmailer (fant ${jobbmails.length})`);
  }

  // --- 5b) Å besvare «Gå til jobb» starter arbeidsdagen ende-til-ende --------
  global.CivicationState.setState({ [builder.DAY_RUNTIME_KEY]: runtime });
  assert.strictEqual(workday.isWorkdayActive(), false, 'arbeidsdagen er ikke aktiv før spilleren går til jobb');
  await builder.markAnswered(goToWork.event.id, 'go_to_work');
  assert.strictEqual(workday.isWorkdayActive(), true, 'å besvare overgangen skal starte arbeidsdagen');
  assert.strictEqual(calendar.getPhase(), 'forenoon', 'å gå til jobb skal flytte inn i arbeidsfasen');

  // Nullstill for de rene teller-testene under.
  workday.reset();
  calendar.setPhase('morning');

  // --- 6) Arbeidsdag-telleren økes KUN når arbeidsdagen fullføres ------------
  assert.strictEqual(workday.getWorkdayDayIndex(), 0, 'arbeidsdag-telleren starter på 0');
  workday.startWorkday(active, { date: '2026-06-22' });
  assert.strictEqual(workday.getWorkdayDayIndex(), 0, 'å starte arbeidsdagen skal ikke øke telleren');
  assert.strictEqual(workday.isWorkdayActive(), true, 'arbeidsdagen skal være aktiv etter start');

  const complete = workday.completeWorkday({ date: '2026-06-22' });
  assert.strictEqual(complete.changed, true, 'første fullføring skal registreres');
  assert.strictEqual(workday.getWorkdayDayIndex(), 1, 'fullført arbeidsdag skal øke telleren til 1');
  assert.strictEqual(workday.isWorkdayCompletedToday('2026-06-22'), true, 'dagen skal være markert fullført');
  assert.strictEqual(workday.isWorkdayActive(), false, 'arbeidsdagen skal ikke lenger være aktiv');

  // Idempotent: å fullføre samme arbeidsdag igjen skal ikke blåse opp telleren.
  const again = workday.completeWorkday({ date: '2026-06-22' });
  assert.strictEqual(again.changed, false, 'gjentatt fullføring av samme dag skal ikke telle');
  assert.strictEqual(workday.getWorkdayDayIndex(), 1, 'telleren skal fortsatt være 1 etter gjentatt fullføring');

  // --- 7) Døgnfase-teller og arbeidsdag-teller er separate -------------------
  const calDayBefore = Number(calendar.getClock().dayIndex || 1);
  const workdayBefore = workday.getWorkdayDayIndex();
  // Flytt gjennom flere private døgnfaser uten å fullføre en ny arbeidsdag.
  calendar.setPhase('lunch');
  calendar.setPhase('evening');
  calendar.setPhase('day_end');
  calendar.advancePhase(); // day_end -> ny dag (dayIndex + 1)
  const calDayAfter = Number(calendar.getClock().dayIndex || 1);
  assert.strictEqual(calDayAfter, calDayBefore + 1, 'døgnfase-telleren skal øke når døgnet rulles');
  assert.strictEqual(workday.getWorkdayDayIndex(), workdayBefore, 'arbeidsdag-telleren skal IKKE øke bare fordi døgnet ruller');
  assert.notStrictEqual(calDayAfter, workday.getWorkdayDayIndex(), 'de to tellerne skal være uavhengige');

  // --- 8) DayFlow: morgen med aktiv, ufullført jobb -> next_action=go_to_work -
  global.localStorage.clear();
  global.CivicationState.setActivePosition(active);
  calendar.setPhase('morning');
  const flow = dayFlow.getFlowState();
  assert.strictEqual(flow.current_day_phase, 'morning', 'flow-state skal rapportere morgenfase');
  assert.strictEqual(flow.has_active_job, true, 'flow-state skal se den aktive jobben');
  assert.strictEqual(flow.workday_completed_today, false, 'arbeidsdagen skal ikke være fullført ennå');
  assert.strictEqual(flow.next_action, 'go_to_work', 'neste handling i morgenfasen skal være «gå til jobb»');

  const went = dayFlow.goToWork({ active });
  assert.strictEqual(went.ok, true, 'goToWork skal starte arbeidsdagen');
  assert.strictEqual(dayFlow.getCurrentPhase(), 'forenoon', 'goToWork skal flytte inn i arbeidsfasen');
  assert.strictEqual(workday.isWorkdayActive(), true, 'arbeidsdagen skal være aktiv etter goToWork');

  console.log('civication-day-workday-split.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
