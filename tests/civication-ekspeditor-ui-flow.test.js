#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) {
      return { ok: false, status: 400, async json() { return null; }, async text() { return ''; } };
    }
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); }, async text() { return body; } };
    } catch {
      return { ok: false, status: 404, async json() { return null; }, async text() { return ''; } };
    }
  };
}

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  vm.runInThisContext(fs.readFileSync(fullPath, 'utf8'), { filename: relPath });
}

function setMailInbox(items) {
  global.localStorage.removeItem('hg_civi_mail_v1');
  global.localStorage.removeItem('hg_civi_inbox_v1');
  global.CivicationMailEngine.replaceInbox(items);
}

function getPending() {
  const inbox = global.CivicationState.getInbox();
  return Array.isArray(inbox) ? inbox.find(item => item && item.status === 'pending') || null : null;
}

function getFirstWeekJobIds() {
  const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/ekspeditor_job.json'), 'utf8'));
  const family = (catalog.families || []).find(row => row.id === 'first_week_praksisfortellinger_ekspeditor_job');
  assert(family, 'first-week ekspeditor job family should exist');
  return new Set((family.mails || []).map(mail => String(mail.id || '')).filter(Boolean));
}

function getFirstWeekPrivateMail() {
  const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/ekspeditor_people.json'), 'utf8'));
  const family = (catalog.families || []).find(row => row.id === 'first_week_praksisfortellinger_ekspeditor_private');
  assert(family && family.mails && family.mails[0], 'first-week ekspeditor private family should contain mail');
  return family.mails[0];
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = {
    readyState: 'complete',
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  global.CivicationCalendar = { getPhase: () => 'morning' };
  global.getNextDayCarryover = () => ({ visibilityBias: 0, processBias: 0 });
  global.applyMorningCarryoverEffects = () => {};
  global.getMorningModeFromCarryover = () => 'balanced';
  global.applyMorningModeToEvent = event => event;
  global.setNextDayCarryover = () => {};
  global.appendDayChoiceLog = () => {};
  global.applyPhaseChoiceEffects = () => {};
  global.maybeCreateContactFromChoice = () => {};
  global.HG_CapitalMaintenance = { maintain: () => null };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationMailEngine.js');
  loadScript('js/Civication/systems/civicationIncomingFlow.js');
  loadScript('js/Civication/systems/day/dayPatches.js');
  loadScript('js/Civication/mailPlanBridge.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/ui/CivicationUI.js');

  const incomingCalls = { applyConsequences: 0, enqueueFollowup: 0 };
  const originalApplyConsequences = global.CivicationIncomingFlow.applyConsequences;
  const originalEnqueueFollowup = global.CivicationIncomingFlow.enqueueFollowup;
  global.CivicationIncomingFlow.applyConsequences = function (...args) {
    incomingCalls.applyConsequences += 1;
    return originalApplyConsequences.apply(this, args);
  };
  global.CivicationIncomingFlow.enqueueFollowup = function (...args) {
    incomingCalls.enqueueFollowup += 1;
    return originalEnqueueFollowup.apply(this, args);
  };

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;
  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    title: 'Ekspeditør / butikkmedarbeider',
    role_key: 'ekspeditor',
    role_id: 'naer_ekspeditor',
    brand_name: 'Testbutikk'
  });

  const firstOpen = await engine.onAppOpen({ force: true });
  assert.strictEqual(firstOpen.enqueued, true, 'first app-open should enqueue planned ekspeditor mail');

  const pendingItem = getPending();
  assert(pendingItem, 'pending mail should exist after first app-open');
  const firstMail = pendingItem.event;
  const firstWeekJobIds = getFirstWeekJobIds();
  assert.strictEqual(firstMail.source_type, 'planned');
  assert.strictEqual(firstMail.role_scope, 'ekspeditor');
  assert.strictEqual(firstMail.career_id, 'naeringsliv');
  assert.strictEqual(firstMail.mail_plan_meta?.plan_id, 'ekspeditor_naeringsliv_v1');
  assert.strictEqual(firstMail.mail_family, 'first_week_praksisfortellinger_ekspeditor_job');
  assert.strictEqual(firstMail.mail_type, 'job');
  if (firstMail.channel || firstMail.messageChannel) {
    assert.strictEqual(firstMail.channel || firstMail.messageChannel, 'job');
  }
  assert(String(firstMail.id).startsWith('job_ekspeditor_') || firstWeekJobIds.has(firstMail.id));

  assert.strictEqual(global.CivicationEventChannels.getMessageChannel(firstMail), 'job', 'first planned job mail should be Jobbmail');
  assert.strictEqual(global.classifyCiviInboxItem(pendingItem), 'job', 'UI classifier should bucket first mail as Jobbmail');

  const privateMail = { ...getFirstWeekPrivateMail(), source_type: 'planned', mail_type: 'people', channel: 'private', role_scope: 'ekspeditor', career_id: 'naeringsliv' };
  assert.strictEqual(global.CivicationEventChannels.getMessageChannel(privateMail), 'private');
  assert.strictEqual(global.classifyCiviInboxItem({ status: 'pending', event: privateMail }), 'personal');
  assert.strictEqual(global.classifyCiviInboxItem({ status: 'pending', event: { id: 'debug', source_type: 'debug', mail_class: 'debug' } }), 'other');
  const unknownBuckets = global.CivicationEventChannels.splitInboxByMessageChannel([{ status: 'pending', event: { id: 'mystery' } }]);
  assert.strictEqual(unknownBuckets.private.length + unknownBuckets.unknown.length, 1, 'unknown events should remain bucketed, not dropped');

  setMailInbox([
    { status: 'pending', event: privateMail },
    { status: 'pending', event: { id: 'workday-job-task', channel: 'job', source_type: 'workday', task_id: 'task-1', task_domain: 'cash_desk' } }
  ]);
  assert.strictEqual(global.CivicationUI.getActiveWorkdayInboxItem().event.id, 'workday-job-task');
  setMailInbox([{ status: 'pending', event: privateMail }]);
  assert.strictEqual(global.CivicationUI.getActiveWorkdayInboxItem(), null, 'private ekspeditor mail must not become active workday');

  setMailInbox([pendingItem]);
  const firstChoice = firstMail.choices && firstMail.choices[0];
  assert(firstChoice && firstChoice.triggers_on_choice, 'first choice should define triggers_on_choice');
  const beforeStepIndex = Number(global.CivicationState.getState().mail_runtime_v1?.step_index || 0);
  const answerResult = await global.HG_CiviEngine.answer(firstMail.id, firstChoice.id);
  assert.notStrictEqual(answerResult?.ok, false, 'answer should return ok');
  const afterState = global.CivicationState.getState();
  assert(afterState.mail_runtime_v1.step_index > beforeStepIndex, 'planned answer should advance step_index');
  assert(afterState.mail_runtime_v1.consumed_ids.includes(firstMail.id), 'planned answer should update consumed_ids');
  assert.strictEqual(incomingCalls.applyConsequences, 0, 'UI/answer path must not call IncomingFlow.applyConsequences');
  assert.strictEqual(incomingCalls.enqueueFollowup, 0, 'UI/answer path must not call IncomingFlow.enqueueFollowup');

  const followup = getPending()?.event || null;
  assert(followup && followup.source_type === 'thread', 'choice trigger should enqueue a thread/followup through MailRuntime');
  assert.notStrictEqual(followup.subject, 'Oppfølging', 'thread/followup must not be generic fallback Oppfølging');

  await engine.onAppOpen({ force: true });
  const afterSecondOpenInbox = global.CivicationState.getInbox();
  assert(!afterSecondOpenInbox.some(item => item?.status === 'pending' && item?.event?.id === firstMail.id), 'answered mail should not return after next app-open');
  const current = getPending()?.event || null;
  assert(!current || current.source_type === 'thread' || current.source_type === 'planned', 'next pending item should be legitimate runtime item');
  assert(!current || current.subject !== 'Oppfølging', 'next pending item should not be fallback noise');

  console.log('civication-ekspeditor-ui-flow.test.js passed');
}

run().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
