#!/usr/bin/env node
// Civication — private fase-mailer vs. arbeidslivsmail.
//
// To adskilte innholdssystemer (se js/Civication/README.md «To rytmer»):
//   1) Private fase-mailer  — CivicationPrivatePhaseMailBuilder, faser
//      morning/lunch/afternoon/dinner/evening/day_end. Handler om mat, hvile,
//      økonomi, familie, venner, fritid, helse, søvn, læring, personlig
//      kalender, sosialt liv, energi og psyke. ALDRI jobb.
//   2) Arbeidslivsmail       — CivicationWorkdayMailBuilder, kun forenoon/workday,
//      knyttet til arbeidsgiver/rolle/workday_day_index.
//
// Dekker kravene:
//   - Morgen/lunsj/ettermiddag/middag/kveld/dagslutt har 0 daily_workday.
//   - Private faser har 0 role_scope / career_id / role_id / employer_id.
//   - Private faser inneholder ikke Lillebekk/plankart/utvalg/plansjef/utbygger/varelevering.
//   - NextAction i private faser returnerer aldri jobbmail.
//   - DayProgression lar ikke jobbmail blokkere private faser.
//   - Workday-fasen inneholder arbeidslivsmail.
//   - Etter fullført arbeidsdag vises ingen aktiv jobbmail i private faser.
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
const FORBIDDEN_TERMS = ['lillebekk', 'plankart', 'utvalg', 'plansjef', 'utbygger', 'varelevering', 'rolleprogresjon', 'arbeidsleveranse'];

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationCalendar.js');
  loadScript('js/Civication/systems/day/dayCalendarBridge.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationMailEngine.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationWorkdayRuntime.js');
  loadScript('js/Civication/systems/civicationDayFlow.js');
  loadScript('js/Civication/systems/civicationPrivatePhaseMailBuilder.js');
  loadScript('js/Civication/systems/civicationWorkdayMailBuilder.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
  loadScript('js/Civication/systems/day/dayProgressionController.js');
  loadScript('js/Civication/systems/civicationNextActionSelector.js');

  const builder = global.CivicationDailyMailBuilder;
  const privateBuilder = global.CivicationPrivatePhaseMailBuilder;
  const workdayBuilder = global.CivicationWorkdayMailBuilder;
  const workday = global.CivicationWorkdayRuntime;
  const dayFlow = global.CivicationDayFlow;
  const calendar = global.CivicationCalendar;
  const channels = global.CivicationEventChannels;

  const active = {
    career_id: 'by',
    title: 'Arealplanlegger',
    role_key: 'by_radgiver_plan',
    role_id: 'by_radgiver_plan',
    brand_id: 'plan_og_bygningsetaten'
  };
  global.CivicationState.setActivePosition(active);
  calendar.setPhase('morning');

  // ============================================================
  // A) CivicationPrivatePhaseMailBuilder — standalone kontrakt
  // ============================================================
  assert(privateBuilder, 'CivicationPrivatePhaseMailBuilder skal finnes');

  const privateItems = await privateBuilder.buildPrivatePhaseItems(active, { date: '2026-06-22' });
  // Maks 1 aktiv mail per private fase.
  for (const phase of PRIVATE_PHASES) {
    const rows = privateItems.filter(row => row.phase === phase);
    assert(rows.length <= 1, `private fase «${phase}» skal ha maks 1 aktiv mail (fant ${rows.length})`);
  }
  assert(privateItems.length >= 5, `private builder skal produsere mailer for de private fasene (fant ${privateItems.length})`);

  for (const row of privateItems) {
    const ev = row.event;
    assert.strictEqual(ev.source_type, 'daily_private_phase', `${ev.id} skal ha source_type daily_private_phase`);
    assert.strictEqual(ev.channel, 'private', `${ev.id} skal ha channel private`);
    assert.strictEqual(ev.messageChannel, 'private', `${ev.id} skal ha messageChannel private`);
    assert.strictEqual(ev.mail_class, 'daily_private', `${ev.id} skal ha mail_class daily_private`);
    assert.strictEqual(ev.role_scope, '', `${ev.id} skal ha tom role_scope`);
    assert.strictEqual(ev.career_id, '', `${ev.id} skal ha tom career_id`);
    assert.strictEqual(ev.role_id, '', `${ev.id} skal ha tom role_id`);
    assert.strictEqual(ev.employer_id, '', `${ev.id} skal ha tom employer_id`);
    assert.strictEqual(ev.workday_related, false, `${ev.id} skal ha workday_related=false`);
    assert.strictEqual(channels.getMessageChannel(ev), 'private', `${ev.id} skal klassifiseres som private`);
    assert.strictEqual(channels.isJobMail(ev), false, `${ev.id} skal aldri være jobbmail`);

    const text = JSON.stringify(ev).toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      assert(!text.includes(term), `private mail ${ev.id} må ikke inneholde jobbordet «${term}»`);
    }
  }

  // ============================================================
  // B) CivicationWorkdayMailBuilder — kun forenoon/workday
  // ============================================================
  assert(workdayBuilder, 'CivicationWorkdayMailBuilder skal finnes');
  const workdayItems = await workdayBuilder.buildWorkdayItems(active, { date: '2026-06-22' });
  assert(workdayItems.length >= 1, 'workday builder skal produsere arbeidslivsmail');
  for (const row of workdayItems) {
    const ev = row.event;
    assert(WORK_PHASES.includes(ev.phase_tag), `arbeidslivsmail ${ev.id} skal kun ha phase_tag forenoon/workday (fant «${ev.phase_tag}»)`);
    assert.strictEqual(ev.mail_class, 'daily_workday', `${ev.id} skal ha mail_class daily_workday`);
    assert.strictEqual(ev.workday_related, true, `${ev.id} skal ha workday_related=true`);
    assert(ev.role_scope, `${ev.id} skal ha en role_scope`);
    assert.strictEqual(channels.getMessageChannel(ev), 'job', `${ev.id} skal klassifiseres som jobbmail`);
  }

  // ============================================================
  // C) DailyMailBuilder som adaptor: privat + arbeid i én kø
  // ============================================================
  const runtime = await builder.buildQueue(active, { date: '2026-06-22' });
  const itemsIn = phases => runtime.items.filter(row => phases.includes(row.phase));

  // Ingen daily_workday i private faser.
  for (const phase of PRIVATE_PHASES) {
    const rows = itemsIn([phase]);
    const workClass = rows.filter(row => row.event?.mail_class === 'daily_workday');
    assert.strictEqual(workClass.length, 0, `${phase} skal ha 0 daily_workday-mailer (fant ${workClass.length})`);
  }

  // Private faser: 0 role_scope/career_id/role_id/employer_id + ingen jobbord.
  const privateRows = itemsIn(PRIVATE_PHASES);
  for (const row of privateRows) {
    const ev = row.event || {};
    assert(!ev.role_scope, `${ev.id} i privat fase skal ha tom role_scope (fant «${ev.role_scope}»)`);
    assert(!ev.career_id, `${ev.id} i privat fase skal ha tom career_id (fant «${ev.career_id}»)`);
    assert(!ev.role_id, `${ev.id} i privat fase skal ha tom role_id (fant «${ev.role_id}»)`);
    assert(!ev.employer_id, `${ev.id} i privat fase skal ha tom employer_id (fant «${ev.employer_id}»)`);
    assert.notStrictEqual(channels.getMessageChannel(ev), 'job', `${ev.id} i privat fase skal aldri være jobbmail`);
  }
  const privateText = JSON.stringify(privateRows.map(r => r.event || {})).toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    assert(!privateText.includes(term), `private faser må ikke inneholde jobbordet «${term}»`);
  }

  // Arbeidsfasen bærer arbeidslivsmailene.
  const workRows = itemsIn(WORK_PHASES);
  const workRoleMails = workRows.filter(row => channels.getMessageChannel(row.event) === 'job');
  assert(workRoleMails.length >= 1, `arbeidsfasene skal bære arbeidslivsmail (fant ${workRoleMails.length})`);

  // ============================================================
  // D) DayProgression: åpen jobbmail blokkerer ikke private faser
  // ============================================================
  global.CivicationState.setState({ [builder.DAY_RUNTIME_KEY]: runtime });
  const openJobMail = {
    id: 'lekk_jobbmail_1',
    status: 'pending',
    event: {
      id: 'lekk_jobbmail_1',
      subject: 'Åpen arbeidsleveranse',
      mail_class: 'daily_workday',
      source_type: 'daily_workday',
      channel: 'job',
      messageChannel: 'job',
      role_scope: 'by_radgiver_plan',
      choices: [{ id: 'A', label: 'Svar' }]
    }
  };
  global.CivicationMailEngine.getInbox = () => [openJobMail];

  for (const phase of ['lunch', 'dinner', 'evening', 'day_end']) {
    calendar.setPhase(phase);
    const inspection = global.CivicationDayProgression.inspect();
    assert.strictEqual(inspection.openInboxItems, 0, `åpen jobbmail skal ikke telle som blokkerende i «${phase}» (fant ${inspection.openInboxItems})`);
  }

  // Arbeidsdagsfasen: jobbmail i inbox SKAL kunne blokkere.
  calendar.setPhase('workday');
  const workInspection = global.CivicationDayProgression.inspect();
  assert.strictEqual(workInspection.openInboxItems, 1, 'åpen jobbmail skal blokkere arbeidsdagsfasen');

  // ============================================================
  // E) NextAction i private faser returnerer aldri jobbmail
  // ============================================================
  for (const phase of ['lunch', 'dinner', 'evening', 'day_end']) {
    calendar.setPhase(phase);
    const current = global.CivicationNextActionSelector.getCurrent();
    if (current) {
      assert.notStrictEqual(current.id, 'lekk_jobbmail_1', `NextAction i «${phase}» skal aldri returnere den åpne jobbmailen`);
    }
  }
  // I arbeidsdagsfasen KAN NextAction returnere den åpne jobbmailen.
  calendar.setPhase('workday');
  const workAction = global.CivicationNextActionSelector.getCurrent();
  assert(workAction && workAction.id === 'lekk_jobbmail_1', 'NextAction i arbeidsdagsfasen skal kunne returnere jobbmailen');

  // ============================================================
  // F) Etter fullført arbeidsdag: ingen aktiv jobbmail i private faser
  // ============================================================
  workday.reset();
  calendar.setPhase('morning');
  workday.startWorkday(active, { date: '2026-06-22' });
  workday.completeWorkday({ date: '2026-06-22' });
  assert.strictEqual(workday.isWorkdayCompletedToday('2026-06-22'), true, 'arbeidsdagen skal være markert fullført');

  dayFlow.finishWorkday();
  assert.strictEqual(dayFlow.getCurrentPhase(), 'lunch', 'etter arbeidsdagen skal spilleren tilbake til privat rytme (lunsj)');

  for (const phase of ['lunch', 'dinner', 'evening', 'day_end']) {
    calendar.setPhase(phase);
    const current = global.CivicationNextActionSelector.getCurrent();
    if (current) {
      assert.notStrictEqual(current.id, 'lekk_jobbmail_1', `etter arbeidsdagen skal «${phase}» ikke ha aktiv jobbmail`);
    }
  }

  console.log('civication-private-phase-mailers.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
