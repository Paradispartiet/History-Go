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

function allChoices(mails) {
  return mails.flatMap(mail => Array.isArray(mail.choices) ? mail.choices : []);
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
    setAutonomyOverride: () => 50,
    updateIntegrity: () => null,
    updateVisibility: () => null,
    updateEconomicRoom: () => null,
    updateTrust: () => null,
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
  const firstWeek = plan.sequence.slice(0, 10);
  const secondWeek = plan.sequence.slice(10, 20);
  assert.strictEqual(firstWeek.length, 10, 'first week should remain the first ten relevant steps');
  assert.strictEqual(secondWeek.length, 10, 'second week should be the next ten relevant steps');

  firstWeek.forEach((step, index) => {
    const expectedType = index % 2 === 0 ? 'job' : 'people';
    const expectedFamily = expectedType === 'job' ? 'first_week_praksisfortellinger_job' : 'first_week_praksisfortellinger_private';
    assert.strictEqual(step.type, expectedType, `first-week step ${index + 1} should still alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expectedFamily], `first-week step ${index + 1} should still point at first-week family`);
    assert.deepStrictEqual(step.fallback_types, [], `first-week step ${index + 1} should still keep fallback out`);
  });

  secondWeek.forEach((step, index) => {
    const expectedType = index % 2 === 0 ? 'job' : 'people';
    const expectedFamily = expectedType === 'job' ? 'second_week_praksisfortellinger_job' : 'second_week_praksisfortellinger_private';
    assert.strictEqual(step.step, index + 11, `second-week step ${index + 11} should follow directly after week one`);
    assert.strictEqual(step.type, expectedType, `second-week step ${index + 11} should alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expectedFamily], `second-week step ${index + 11} should point at the package family`);
    assert.deepStrictEqual(step.fallback_types, [], `second-week step ${index + 11} should not use fallback as normal progression`);
  });

  const jobCatalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json'), 'utf8'));
  const peopleCatalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json'), 'utf8'));
  const secondWeekJobs = jobCatalog.families.find(f => f.id === 'second_week_praksisfortellinger_job');
  const secondWeekPeople = peopleCatalog.families.find(f => f.id === 'second_week_praksisfortellinger_private');
  assert(secondWeekJobs, 'job package family should exist');
  assert(secondWeekPeople, 'private package family should exist');
  assert.strictEqual(secondWeekJobs.mails.length, 5, 'package must include five jobmail threads');
  assert.strictEqual(secondWeekPeople.mails.length, 5, 'package must include five private threads');

  for (const mail of secondWeekJobs.mails) {
    assert(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} should use a multi-message situation array`);
    assert.strictEqual(mail.mail_type, 'job', `${mail.id} should stay job scoped`);
    assert.strictEqual(mail.channel, 'job', `${mail.id} should classify to job channel`);
    assert.strictEqual(mail.messageChannel, 'job', `${mail.id} should classify to job inbox`);
  }
  for (const mail of secondWeekPeople.mails) {
    assert(Array.isArray(mail.situation) && mail.situation.length >= 2, `${mail.id} should use a multi-message situation array`);
    assert.strictEqual(mail.mail_type, 'people', `${mail.id} should stay people scoped`);
    assert.strictEqual(mail.channel, 'private', `${mail.id} should classify to private channel`);
    assert.strictEqual(mail.messageChannel, 'private', `${mail.id} should classify to private inbox`);
  }

  const choices = allChoices([...secondWeekJobs.mails, ...secondWeekPeople.mails]);
  assert(choices.length >= 30, 'second week should expose choices across all threads');
  assert(choices.every(choice => typeof choice.reply === 'string' && choice.reply.length > 0), 'choices.reply should exist on all package choices');
  assert(choices.every(choice => choice.effects && typeof choice.effects === 'object'), 'choices.effects should exist on all package choices');
  assert(choices.some(choice => choice.triggers_on_choice), 'at least one choice should trigger a consequence thread');
  assert(choices.some(choice => choice.next_bias?.set_flags?.length), 'at least one choice should set next_bias branch flags');
  assert(choices.some(choice => Number(choice.effect || 0) > 0), 'at least one choice should give positive development');
  assert(choices.some(choice => (choice.next_bias?.set_flags || []).some(flag => /stress|overload|risk/.test(flag))), 'at least one choice should give stress/overload/risk');
  assert(choices.some(choice => (choice.next_bias?.set_flags || []).some(flag => /stagnation|low_visibility/.test(flag))), 'at least one choice should give stagnation or low visibility');

  const expectedFirstWeek = [
    { id: 'job_first_week_unowned_task' },
    { id: 'personal_one_small_thing' },
    { id: 'job_status_meeting' },
    { id: 'personal_dinner_no_energy' },
    { id: 'job_error_no_owner' },
    { id: 'personal_bill_due' },
    { id: 'job_praise_becomes_more_work' },
    { id: 'personal_friend_replies_late' },
    { id: 'job_week_summary' },
    { id: 'personal_family_expectation' }
  ];

  const expectedSecondWeek = [
    { id: 'job_week2_monday_note_used', type: 'job', channel: 'job', minSituation: 4, choice: 'A' },
    { id: 'personal_week2_weekend_not_restful', type: 'people', channel: 'private', minSituation: 2, choice: 'B' },
    { id: 'job_week2_user_waited', type: 'job', channel: 'job', minSituation: 4, choice: 'C' },
    { id: 'personal_week2_fee_arrived', type: 'people', channel: 'private', minSituation: 2, choice: 'A' },
    { id: 'job_week2_colleague_cover', type: 'job', channel: 'job', minSituation: 3, choice: 'B' },
    { id: 'personal_week2_jonas_interview', type: 'people', channel: 'private', minSituation: 2, choice: 'A' },
    { id: 'job_week2_routine_becomes_politics', type: 'job', channel: 'job', minSituation: 4, choice: 'B' },
    { id: 'personal_week2_dinner_concrete', type: 'people', channel: 'private', minSituation: 2, choice: 'C' },
    { id: 'job_week2_second_week_review', type: 'job', channel: 'job', minSituation: 3, choice: 'C' },
    { id: 'personal_week2_weekend_test', type: 'people', channel: 'private', minSituation: 3, choice: 'B' }
  ];

  for (const expected of expectedFirstWeek) {
    if (!pendingEvent()) {
      const opened = await engine.onAppOpen({ force: true });
      assert.strictEqual(opened.enqueued, true, `opening app should enqueue ${expected.id}`);
    }
    let pending = pendingEvent();
    assert.strictEqual(pending.id, expected.id, `runtime should consume first-week mail before week two: ${expected.id}`);
    const choice = pending.choices.find(row => row.id === 'A') || pending.choices[0];
    assert(choice.triggers_on_choice, `${expected.id} should trigger a first-week consequence thread`);
    let result = await engine.answer(pending.id, choice.id);
    assert.notStrictEqual(result?.ok, false, `answering ${expected.id} should succeed`);
    pending = pendingEvent();
    assert(pending && pending.id === choice.triggers_on_choice, `${expected.id} should enqueue first-week consequence thread`);
    result = await engine.answer(pending.id, 'A');
    assert.notStrictEqual(result?.ok, false, `answering ${pending.id} should succeed`);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  const plannedSeen = [];
  const threadSeen = [];
  const seenBranchFlags = new Set();
  for (const expected of expectedSecondWeek) {
    if (!pendingEvent()) {
      const opened = await engine.onAppOpen({ force: true });
      assert.strictEqual(opened.enqueued, true, `opening app should enqueue ${expected.id}: ${JSON.stringify(opened)}`);
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

    const choice = pending.choices.find(row => row.id === expected.choice) || pending.choices[0];
    assert(choice.reply && choice.reply.length > 0, `${expected.id} selected choice should expose choices.reply`);
    assert(choice.triggers_on_choice && choice.triggers_on_choice.length > 0, `${expected.id} selected choice should expose triggers_on_choice`);
    assert(choice.next_bias && Array.isArray(choice.next_bias.set_flags), `${expected.id} selected choice should expose next_bias`);
    assert(choice.effects && typeof choice.effects === 'object', `${expected.id} selected choice should expose choices.effects`);
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

  assert.deepStrictEqual(plannedSeen, expectedSecondWeek.map(row => row.id), 'runtime should present all second-week mails in order');
  assert.strictEqual(threadSeen.length, 10, 'each selected second-week choice should enqueue a consequence thread');
  assert(seenBranchFlags.has('week2_visible_responsibility'), 'second week should write visible-responsibility branch flag');
  assert(seenBranchFlags.has('healthy_boundaries'), 'second week should write healthy-boundaries branch flag');
  assert(seenBranchFlags.has('stagnation') || seenBranchFlags.has('stagnation_private') || seenBranchFlags.has('week2_low_visibility'), 'second week should write stagnation/low-visibility branch flag');
  assert(seenBranchFlags.has('overload_risk') || seenBranchFlags.has('future_risk') || seenBranchFlags.has('stress_up'), 'second week should write stress/overload/risk branch flag');

  console.log('civication second week praksisfortellinger ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
