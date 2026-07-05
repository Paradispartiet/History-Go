#!/usr/bin/env node
// Tråd-dedupe for Civication-mailer: varianter av samme case (samme threadKey)
// skal aldri være aktive samtidig i innboks/dagskø, og besvarelse av én
// instans skal undertrykke de andre. Se civicationMailEngine.js og
// civicationDailyMailBuilder.js.
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

function caseEvent(id, taskDomain) {
  return {
    id,
    mail_type: 'micro',
    role_scope: 'by_radgiver_plan',
    narrative_arc: 'Den irriterende nabomailen har ett sant punkt',
    task_domain: taskDomain,
    subject: `Den irriterende nabomailen har ett sant punkt: ${taskDomain} i Lillebekk`,
    summary: 'test',
    choices: [
      { id: 'A', label: 'Krev vareleveringen flyttet bort fra gangveien nå' },
      { id: 'B', label: 'La vareleveringen stå og noter den som et driftspunkt' }
    ]
  };
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
  global.CivicationCalendar = { getPhase: () => 'morning', setPhase: () => {}, advanceByMinutes: () => {} };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationMailEngine.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');

  const engine = global.CivicationMailEngine;
  const builder = global.CivicationDailyMailBuilder;

  // --- threadKey-derivasjon -------------------------------------------------
  const keyA = engine.deriveThreadKey(caseEvent('by_areal_micro_009', 'varelevering'));
  const keyB = engine.deriveThreadKey(caseEvent('by_areal_micro_003', 'kollektivdekning'));
  assert.strictEqual(keyA, 'by_radgiver_plan.case.den_irriterende_nabomailen_har_ett_sant_punkt', 'case mails should share arc thread key');
  assert.strictEqual(keyA, keyB, 'variants of the same case should share thread key');
  assert.strictEqual(
    builder.threadKeyForMail(caseEvent('by_areal_micro_009', 'varelevering')),
    keyA,
    'builder and mail engine should derive the same thread key'
  );

  const jobKey = engine.deriveThreadKey({ id: 'by_areal_job_plankart_001', mail_type: 'job', role_scope: 'by_radgiver_plan', narrative_arc: 'Et område skal utvikles' });
  assert(jobKey.includes('.mail.by_areal_job_plankart_001'), 'non-case mails should get a per-mail thread key');
  assert.strictEqual(
    engine.deriveThreadKey({ id: 'x', thread_key: 'custom.thread', mail_type: 'micro', narrative_arc: 'Noe' }),
    'custom.thread',
    'explicit thread_key in data should win'
  );

  // --- sendMail-vakt: to aktive instanser av samme tråd avvises -------------
  const first = engine.sendMail({ status: 'pending', event: caseEvent('by_areal_micro_009', 'varelevering') });
  assert.strictEqual(first.ok, true, 'first case mail should deliver');
  const duplicate = engine.sendMail({ status: 'pending', event: caseEvent('by_areal_micro_003', 'kollektivdekning') });
  assert.strictEqual(duplicate.ok, false, 'second active mail with same thread key should be rejected');
  assert.strictEqual(duplicate.reason, 'duplicate_thread', 'rejection should carry duplicate_thread reason');
  const resend = engine.sendMail({ status: 'pending', event: caseEvent('by_areal_micro_009', 'varelevering') });
  assert.strictEqual(resend.reason, 'duplicate_key', 're-send of the same id should hit the id guard, not the thread guard');
  assert.strictEqual(engine.getInbox().filter(m => !m.resolved).length, 1, 'inbox should hold exactly one active case mail');

  // --- markResolved undertrykker andre aktive instanser av samme tråd -------
  // Simuler et gammelt save der duplikatet allerede ligger i lageret.
  const rawStore = JSON.parse(global.localStorage.getItem('hg_civi_mail_v1'));
  rawStore.items.push({
    id: 'by_areal_micro_003',
    key: 'by_areal_micro_003',
    type: 'micro',
    from: 'oddvar_vei_vann',
    subject: 'duplikat',
    body: '',
    createdAt: new Date(Date.now() + 1000).toISOString(),
    read: false,
    archived: false,
    deleted: false,
    resolved: false,
    status: 'pending',
    event: caseEvent('by_areal_micro_003', 'kollektivdekning')
  });
  global.localStorage.setItem('hg_civi_mail_v1', JSON.stringify(rawStore));

  engine.markResolved('by_areal_micro_009', 'by_areal_micro_009', 'A');
  const afterResolve = JSON.parse(global.localStorage.getItem('hg_civi_mail_v1')).items;
  const resolvedMail = afterResolve.find(m => m.id === 'by_areal_micro_009');
  const suppressedMail = afterResolve.find(m => m.id === 'by_areal_micro_003');
  assert.strictEqual(resolvedMail.resolved, true, 'answered mail should be resolved (history kept)');
  assert.strictEqual(suppressedMail.suppressed_duplicate, true, 'other active instance of the thread should be suppressed');
  assert.strictEqual(suppressedMail.archived, true, 'suppressed duplicate should be archived away from active views');
  assert.strictEqual(engine.getInbox().filter(m => !m.resolved).length, 0, 'no active case mail should remain after answering');

  // --- migrering av gamle saves: aktive duplikater ryddes, eldste beholdes --
  const legacyDupA = { ...caseEvent('by_areal_micro_015', 'arealformål') };
  const legacyDupB = { ...caseEvent('by_areal_micro_016_like', 'arealformål_2'), narrative_arc: 'Den irriterende nabomailen har ett sant punkt' };
  const oldStore = {
    version: 1,
    items: [
      { id: legacyDupA.id, key: legacyDupA.id, type: 'micro', from: 'x', subject: 'a', body: '', createdAt: '2026-07-01T08:00:00.000Z', read: false, archived: false, deleted: false, resolved: false, status: 'pending', event: legacyDupA },
      { id: legacyDupB.id, key: legacyDupB.id, type: 'micro', from: 'x', subject: 'b', body: '', createdAt: '2026-07-01T09:00:00.000Z', read: false, archived: false, deleted: false, resolved: false, status: 'pending', event: legacyDupB },
      { id: 'answered_old', key: 'answered_old', type: 'micro', from: 'x', subject: 'c', body: '', createdAt: '2026-06-30T08:00:00.000Z', read: true, archived: false, deleted: false, resolved: true, status: 'resolved', event: caseEvent('answered_old', 'støy') }
    ]
  };
  global.localStorage.setItem('hg_civi_mail_v1', JSON.stringify(oldStore));
  // Ny "økt": last mail-motoren på nytt slik at engangsoppryddingen kjører igjen.
  loadScript('js/Civication/systems/civicationMailEngine.js');
  const migratedInbox = global.CivicationMailEngine.getInbox();
  const activeMigrated = migratedInbox.filter(m => !m.resolved);
  assert.strictEqual(activeMigrated.length, 1, 'migration should keep exactly one active mail per thread');
  assert.strictEqual(activeMigrated[0].event.id, legacyDupA.id, 'migration should keep the oldest active instance');
  const migratedStore = JSON.parse(global.localStorage.getItem('hg_civi_mail_v1')).items;
  assert.strictEqual(migratedStore.find(m => m.id === legacyDupB.id).suppressed_duplicate, true, 'newer duplicate should be suppressed');
  assert.strictEqual(migratedStore.find(m => m.id === 'answered_old').resolved, true, 'answered history should be preserved untouched');

  // --- dagskø: besvarelse undertrykker samme tråd i senere faser ------------
  global.localStorage.clear();
  const active = { career_id: 'by', title: 'Arealplanlegger', role_key: 'by_radgiver_plan', role_id: 'by_radgiver_plan' };
  global.CivicationState.setActivePosition(active);
  const runtime = await builder.buildQueue(active, { date: '2026-06-22' });

  const caseIndex = runtime.items.findIndex(row => String(row.event?.thread_key || '').includes('.case.den_irriterende_nabomailen'));
  assert(caseIndex >= 0, 'built day should contain the canonical nabomail case');
  // Injiser et duplikat i en senere fase, som om en eldre generator hadde laget det.
  const duplicateRow = {
    status: 'queued',
    phase: 'evening',
    slot: 'rest_or_social',
    event: { ...caseEvent('by_areal_micro_003', 'kollektivdekning'), thread_key: runtime.items[caseIndex].event.thread_key, phase_tag: 'evening' }
  };
  runtime.items.push(duplicateRow);
  global.CivicationState.setState({ [builder.DAY_RUNTIME_KEY]: runtime });

  const answered = await builder.markAnswered(runtime.items[caseIndex].event.id, 'A');
  const suppressedRow = answered.items.find(row => row.event?.id === 'by_areal_micro_003');
  assert.strictEqual(suppressedRow.suppressed_duplicate, true, 'answering the case should suppress the later duplicate row');
  assert.strictEqual(suppressedRow.status, 'answered', 'suppressed duplicate should not block phase progression');
  const answeredRow = answered.items.find(row => row.event?.id === runtime.items[caseIndex].event.id);
  assert.strictEqual(answeredRow.status, 'answered', 'the answered case row should be answered');
  assert.strictEqual(answeredRow.suppressed_duplicate, undefined, 'the answered row itself is not a suppressed duplicate');

  // --- gjenbrukt dagskø fra gammelt save: sweep fjerner aktive duplikater ---
  const staleRuntime = await builder.buildQueue(active, { date: '2026-06-23' });
  const staleCaseIndex = staleRuntime.items.findIndex(row => String(row.event?.thread_key || '').includes('.case.'));
  assert(staleCaseIndex >= 0, 'stale runtime should contain a case row');
  staleRuntime.items.push({
    status: 'queued',
    phase: 'evening',
    slot: 'rest_or_social',
    event: { ...staleRuntime.items[staleCaseIndex].event, id: 'stale_duplicate_row' }
  });
  staleRuntime.date = new Date().toISOString().slice(0, 10);
  global.CivicationState.setState({ [builder.DAY_RUNTIME_KEY]: staleRuntime });
  const swept = await builder.startToday({ enqueue: false, active });
  const sweptDuplicate = swept.runtime.items.find(row => row.event?.id === 'stale_duplicate_row');
  assert.strictEqual(sweptDuplicate.suppressed_duplicate, true, 'reusing an old runtime should suppress duplicate active thread rows');
  const sweptOriginal = swept.runtime.items[staleCaseIndex];
  assert.notStrictEqual(sweptOriginal.suppressed_duplicate, true, 'the first (oldest) row of the thread should stay active');

  console.log('civication-mail-thread-dedupe.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
