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
  if (!item) return null;
  return item.event || item;
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
  const capitalCalls = [];
  global.HG_CapitalMaintenance = {
    maintain: (type, amount, meta) => {
      capitalCalls.push({ type, amount, meta });
      return null;
    }
  };
  global.HG_Lifestyle = { addTags: () => null };
  const psycheCalls = [];
  let autonomy = 50;
  global.CivicationPsyche = {
    getAutonomy: () => autonomy,
    setAutonomyOverride: (next) => { autonomy = Number(next); return autonomy; },
    updateIntegrity: (amount) => psycheCalls.push({ key: 'integrity', amount }),
    updateVisibility: (amount) => psycheCalls.push({ key: 'visibility', amount }),
    updateEconomicRoom: (amount) => psycheCalls.push({ key: 'economicRoom', amount }),
    updateTrust: (careerId, amount) => psycheCalls.push({ key: 'trust', careerId, amount }),
    checkBurnout: () => null,
    processCollapse: () => null
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

  const plan = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/arbeider_plan.json'), 'utf8'));
  const firstTenSteps = plan.sequence.slice(0, 10);
  assert.strictEqual(firstTenSteps.length, 10, 'arbeider plan should expose ten first-week steps');
  firstTenSteps.forEach((step, index) => {
    const expectedType = index % 2 === 0 ? 'job' : 'people';
    const expectedFamily = expectedType === 'job'
      ? 'first_week_praksisfortellinger_job'
      : 'first_week_praksisfortellinger_private';
    assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 1} should stay in first-week family`);
    assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallback as normal progression`);
  });

  const jobCatalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json'), 'utf8'));
  const peopleCatalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json'), 'utf8'));
  const firstWeekJobs = jobCatalog.families.find(f => f.id === 'first_week_praksisfortellinger_job');
  const firstWeekPeople = peopleCatalog.families.find(f => f.id === 'first_week_praksisfortellinger_private');
  assert.strictEqual(firstWeekJobs.mails.length, 5, 'package must include five jobmail threads');
  assert.strictEqual(firstWeekPeople.mails.length, 5, 'package must include five private threads');

  const selectedChoiceByMail = {
    job_status_meeting: 'C'
  };

  const expectedFirstWeek = [
    { id: 'job_first_week_unowned_task', type: 'job', channel: 'job', minSituation: 4 },
    { id: 'personal_one_small_thing', type: 'people', channel: 'private', minSituation: 2 },
    { id: 'job_status_meeting', type: 'job', channel: 'job', minSituation: 4 },
    { id: 'personal_dinner_no_energy', type: 'people', channel: 'private', minSituation: 2 },
    { id: 'job_error_no_owner', type: 'job', channel: 'job', minSituation: 3 },
    { id: 'personal_bill_due', type: 'people', channel: 'private', minSituation: 2 },
    { id: 'job_praise_becomes_more_work', type: 'job', channel: 'job', minSituation: 3 },
    { id: 'personal_friend_replies_late', type: 'people', channel: 'private', minSituation: 2 },
    { id: 'job_week_summary', type: 'job', channel: 'job', minSituation: 3 },
    { id: 'personal_family_expectation', type: 'people', channel: 'private', minSituation: 2 }
  ];

  let candidates = await global.CivicationMailRuntime.debugCandidates();
  assert(candidates.length > 0, 'arbeider should have runtime candidates');
  assert.strictEqual(candidates[0].id, expectedFirstWeek[0].id, 'first week package should start with Monday jobmail');
  assert.strictEqual(global.CivicationEventChannels.getMessageChannel(candidates[0]), 'job', 'job thread must classify as jobmail');
  assert(candidates[0].situation.length >= expectedFirstWeek[0].minSituation, 'jobmail thread should carry multiple correspondence messages');

  const opened = await engine.onAppOpen({ force: true });
  assert.strictEqual(opened.enqueued, true, 'first app open should enqueue first-week jobmail');

  const plannedSeen = [];
  const threadSeen = [];
  const seenBranchFlags = new Set();

  for (let index = 0; index < expectedFirstWeek.length; index += 1) {
    const expected = expectedFirstWeek[index];
    if (index > 0 && !pendingEvent()) {
      const openedNext = await engine.onAppOpen({ force: true });
      assert.strictEqual(openedNext.enqueued, true, `opening app should enqueue ${expected.id}: ${JSON.stringify(openedNext)}`);
    }
    let pending = pendingEvent();
    assert(pending, `pending planned mail missing before ${expected.id}`);
    assert.strictEqual(pending.id, expected.id, `runtime should progress to ${expected.id}`);
    assert.strictEqual(pending.mail_type, expected.type, `${expected.id} should keep its mail_type`);
    assert.strictEqual(global.CivicationEventChannels.getMessageChannel(pending), expected.channel, `${expected.id} should classify to the right channel`);
    assert(pending.situation.length >= expected.minSituation, `${expected.id} should render as a long correspondence array`);
    assert.deepStrictEqual(pending.mail_plan_meta.fallback_types, [], `${expected.id} must not rely on fallback progression`);

    const split = global.CivicationEventChannels.splitInboxByMessageChannel(global.CivicationState.getInbox());
    assert.strictEqual(split[expected.channel].some(row => row?.event?.id === expected.id), true, `${expected.id} should appear in the expected inbox channel`);

    const wantedChoice = selectedChoiceByMail[pending.id] || 'A';
    const choice = pending.choices.find(row => row.id === wantedChoice) || pending.choices[0];
    assert(choice.reply && choice.reply.length > 0, `${expected.id} selected choice should expose choices.reply`);
    assert(choice.triggers_on_choice && choice.triggers_on_choice.length > 0, `${expected.id} selected choice should expose triggers_on_choice`);
    assert(choice.next_bias && Array.isArray(choice.next_bias.set_flags), `${expected.id} selected choice should expose next_bias`);
    plannedSeen.push(pending.id);

    let result = await engine.answer(pending.id, choice.id);
    assert.notStrictEqual(result?.ok, false, `answering ${expected.id} should succeed`);
    assert(result.choice_director?.handler_results?.some(row => row.name === 'dayConsequences' && row.ok), `${expected.id} should run dayConsequences through the choice director`);
    (global.CivicationState.getMailBranchState().flags || []).forEach(flag => seenBranchFlags.add(flag));

    const thread = pendingEvent();
    assert(thread, `thread consequence missing after ${expected.id}`);
    assert.strictEqual(thread.id, choice.triggers_on_choice, `${expected.id} should enqueue its selected consequence thread`);
    assert.strictEqual(thread.source_type, 'thread', `${thread.id} must use existing thread mechanism`);
    assert.strictEqual(global.CivicationEventChannels.getMessageChannel(thread), expected.channel, `${thread.id} should inherit the planned mail channel`);
    assert(Array.isArray(thread.situation) && thread.situation.length >= 1, `${thread.id} should render thread text as an array`);
    threadSeen.push(thread.id);

    result = await engine.answer(thread.id, 'A');
    assert.notStrictEqual(result?.ok, false, `answering ${thread.id} should succeed`);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  assert.deepStrictEqual(plannedSeen, expectedFirstWeek.map(row => row.id), 'runtime should present all first-week mails in order');
  assert.strictEqual(threadSeen.length, 10, 'each first-week choice should enqueue a consequence thread');

  const branch = global.CivicationState.getMailBranchState();
  assert(seenBranchFlags.has('future_risk'), 'choice.next_bias flags should be written to mail_branch_state');
  assert(seenBranchFlags.has('relationship_jonas'), 'private choice.next_bias flags should be written to mail_branch_state');
  assert(seenBranchFlags.has('stagnation'), 'stagnation branch flag should be written when selected');
  assert(seenBranchFlags.has('stress_private') || seenBranchFlags.has('stress_down'), 'stress branch flags should be written when selected');
  assert(branch.flags.length <= 16, 'branch flags should stay bounded by runtime branch-state limit');

  assert(psycheCalls.some(call => call.key === 'trust' && call.careerId === 'naeringsliv'), 'choices.effects.psyche.trust should update career trust');
  assert(psycheCalls.some(call => call.key === 'integrity'), 'choices.effects.psyche.integrity should update psyche');
  const capitalState = JSON.parse(global.localStorage.getItem('hg_capital_v1') || '{}');
  assert(Number(capitalState.economic || 0) < 0 || capitalCalls.some(call => call.type === 'economic' && call.amount < 0), 'choices.effects.capital should update economic capital');

  candidates = await global.CivicationMailRuntime.debugCandidates();
  assert.notStrictEqual(candidates[0]?.id, expectedFirstWeek[0].id, 'consumed first-week mails should not repeat via fallback');

  console.log('civication first week praksisfortellinger ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
