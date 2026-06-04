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
  return item ? item.event : null;
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
  global.CivicationCalendar = { getPhase: () => 'morning', advanceByMinutes: () => {} };
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = {
    getAutonomy: () => 50,
    updateIntegrity: () => null,
    updateVisibility: () => null,
    updateEconomicRoom: () => null,
    updateTrust: () => null
  };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');

  const active = {
    career_id: 'naeringsliv',
    title: 'Saksstøtte / mottak / fellesinnboks',
    role_key: 'arbeider',
    role_id: 'naer_arbeider'
  };
  global.CivicationState.setActivePosition(active);
  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  const candidates = await global.CivicationMailRuntime.debugCandidates();
  assert(candidates.length > 0, 'arbeider should have runtime candidates');
  assert.strictEqual(candidates[0].id, 'job_first_week_unowned_task', 'first week package should start with Monday jobmail');
  assert.strictEqual(global.CivicationEventChannels.getMessageChannel(candidates[0]), 'job', 'job thread must classify as jobmail');
  assert(candidates[0].situation.length >= 4, 'jobmail thread should carry multiple correspondence messages');

  let opened = await engine.onAppOpen({ force: true });
  assert.strictEqual(opened.enqueued, true, 'first app open should enqueue first-week jobmail');
  let pending = pendingEvent();
  assert.strictEqual(pending.id, 'job_first_week_unowned_task');

  let result = await engine.answer(pending.id, 'A');
  assert.notStrictEqual(result?.ok, false, 'answering first job choice should succeed');
  pending = pendingEvent();
  assert.strictEqual(pending.id, 'job_first_week_unowned_task_fast', 'choice should enqueue consequence thread');
  assert.strictEqual(pending.source_type, 'thread', 'consequence must use existing thread mechanism');

  result = await engine.answer(pending.id, 'A');
  assert.notStrictEqual(result?.ok, false, 'answering consequence thread should succeed');

  const afterThreadCandidates = await global.CivicationMailRuntime.debugCandidates();
  assert.strictEqual(afterThreadCandidates[0].id, 'personal_one_small_thing', 'next plan step should be Monday private message');
  assert.strictEqual(global.CivicationEventChannels.getMessageChannel(afterThreadCandidates[0]), 'private', 'people/private thread must remain private');
  assert(afterThreadCandidates[0].situation.length >= 2, 'private thread should carry multiple personal messages');

  const branch = global.CivicationState.getMailBranchState();
  assert(branch.flags.includes('future_risk'), 'choice.next_bias flags should be written to mail_branch_state');

  const jobCatalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json'), 'utf8'));
  const peopleCatalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json'), 'utf8'));
  const firstWeekJobs = jobCatalog.families.find(f => f.id === 'first_week_praksisfortellinger_job');
  const firstWeekPeople = peopleCatalog.families.find(f => f.id === 'first_week_praksisfortellinger_private');
  assert.strictEqual(firstWeekJobs.mails.length, 5, 'package must include five jobmail threads');
  assert.strictEqual(firstWeekPeople.mails.length, 5, 'package must include five private threads');

  console.log('civication first week praksisfortellinger ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
