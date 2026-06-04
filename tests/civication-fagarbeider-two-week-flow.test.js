#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json';
const JOB_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json';
const PEOPLE_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json';

const FIRST_WEEK_JOB = 'first_week_praksisfortellinger_fagarbeider_job';
const FIRST_WEEK_PRIVATE = 'first_week_praksisfortellinger_fagarbeider_private';
const SECOND_WEEK_JOB = 'second_week_praksisfortellinger_fagarbeider_job';
const SECOND_WEEK_PRIVATE = 'second_week_praksisfortellinger_fagarbeider_private';

const EXPECTED_FLOW = [
  { id: 'job_fagarbeider_week1_first_inspection', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_fagarbeider_week1_body_after_first_day', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_fagarbeider_week1_shortcut_everyone_uses', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_fagarbeider_week1_unanswered_message', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_fagarbeider_week1_customer_wants_fast', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_fagarbeider_week1_bill_and_work_shoes', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_fagarbeider_week1_loyalty_and_safety', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_fagarbeider_week1_dinner_slips', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_fagarbeider_week1_craft_pride_or_just_done', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_fagarbeider_week1_weekend_recovery', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_fagarbeider_week2_training_hour', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_fagarbeider_week2_monday_body', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_fagarbeider_week2_returning_deviation', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_fagarbeider_week2_shoes_not_enough', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_fagarbeider_week2_missing_material', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_fagarbeider_week2_family_handy', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_fagarbeider_week2_safety_stops_speed', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_fagarbeider_week2_sleep_not_coming', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_fagarbeider_week2_second_week_review', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_fagarbeider_week2_weekend_maintenance', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 4 }
];

const CRAFT_SAFE_CHOICES = {
  job_fagarbeider_week1_first_inspection: 'B',
  personal_fagarbeider_week1_body_after_first_day: 'B',
  job_fagarbeider_week1_shortcut_everyone_uses: 'B',
  personal_fagarbeider_week1_unanswered_message: 'A',
  job_fagarbeider_week1_customer_wants_fast: 'B',
  personal_fagarbeider_week1_bill_and_work_shoes: 'A',
  job_fagarbeider_week1_loyalty_and_safety: 'B',
  personal_fagarbeider_week1_dinner_slips: 'B',
  job_fagarbeider_week1_craft_pride_or_just_done: 'A',
  personal_fagarbeider_week1_weekend_recovery: 'C',
  job_fagarbeider_week2_training_hour: 'A',
  personal_fagarbeider_week2_monday_body: 'A',
  job_fagarbeider_week2_returning_deviation: 'A',
  personal_fagarbeider_week2_shoes_not_enough: 'B',
  job_fagarbeider_week2_missing_material: 'B',
  personal_fagarbeider_week2_family_handy: 'B',
  job_fagarbeider_week2_safety_stops_speed: 'B',
  personal_fagarbeider_week2_sleep_not_coming: 'A',
  job_fagarbeider_week2_second_week_review: 'A',
  personal_fagarbeider_week2_weekend_maintenance: 'A'
};

const FAST_CLOSER_CHOICES = {
  job_fagarbeider_week1_first_inspection: 'A',
  personal_fagarbeider_week1_body_after_first_day: 'C',
  job_fagarbeider_week1_shortcut_everyone_uses: 'A',
  personal_fagarbeider_week1_unanswered_message: 'B',
  job_fagarbeider_week1_customer_wants_fast: 'A',
  personal_fagarbeider_week1_bill_and_work_shoes: 'B',
  job_fagarbeider_week1_loyalty_and_safety: 'A',
  personal_fagarbeider_week1_dinner_slips: 'C',
  job_fagarbeider_week1_craft_pride_or_just_done: 'B',
  personal_fagarbeider_week1_weekend_recovery: 'D',
  job_fagarbeider_week2_training_hour: 'B',
  personal_fagarbeider_week2_monday_body: 'C',
  job_fagarbeider_week2_returning_deviation: 'C',
  personal_fagarbeider_week2_shoes_not_enough: 'C',
  job_fagarbeider_week2_missing_material: 'A',
  personal_fagarbeider_week2_family_handy: 'A',
  job_fagarbeider_week2_safety_stops_speed: 'A',
  personal_fagarbeider_week2_sleep_not_coming: 'B',
  job_fagarbeider_week2_second_week_review: 'B',
  personal_fagarbeider_week2_weekend_maintenance: 'D'
};

const SAFE_LEARNER_CHOICES = {
  job_fagarbeider_week1_first_inspection: 'C',
  personal_fagarbeider_week1_body_after_first_day: 'B',
  job_fagarbeider_week1_shortcut_everyone_uses: 'C',
  personal_fagarbeider_week1_unanswered_message: 'A',
  job_fagarbeider_week1_customer_wants_fast: 'B',
  personal_fagarbeider_week1_bill_and_work_shoes: 'C',
  job_fagarbeider_week1_loyalty_and_safety: 'C',
  personal_fagarbeider_week1_dinner_slips: 'B',
  job_fagarbeider_week1_craft_pride_or_just_done: 'C',
  personal_fagarbeider_week1_weekend_recovery: 'C',
  job_fagarbeider_week2_training_hour: 'A',
  personal_fagarbeider_week2_monday_body: 'A',
  job_fagarbeider_week2_returning_deviation: 'B',
  personal_fagarbeider_week2_shoes_not_enough: 'B',
  job_fagarbeider_week2_missing_material: 'C',
  personal_fagarbeider_week2_family_handy: 'C',
  job_fagarbeider_week2_safety_stops_speed: 'C',
  personal_fagarbeider_week2_sleep_not_coming: 'C',
  job_fagarbeider_week2_second_week_review: 'C',
  personal_fagarbeider_week2_weekend_maintenance: 'B'
};

const OVERUSED_BODY_CHOICES = {
  job_fagarbeider_week1_first_inspection: 'A',
  personal_fagarbeider_week1_body_after_first_day: 'A',
  job_fagarbeider_week1_shortcut_everyone_uses: 'A',
  personal_fagarbeider_week1_unanswered_message: 'A',
  job_fagarbeider_week1_customer_wants_fast: 'A',
  personal_fagarbeider_week1_bill_and_work_shoes: 'B',
  job_fagarbeider_week1_loyalty_and_safety: 'A',
  personal_fagarbeider_week1_dinner_slips: 'A',
  job_fagarbeider_week1_craft_pride_or_just_done: 'B',
  personal_fagarbeider_week1_weekend_recovery: 'A',
  job_fagarbeider_week2_training_hour: 'B',
  personal_fagarbeider_week2_monday_body: 'C',
  job_fagarbeider_week2_returning_deviation: 'C',
  personal_fagarbeider_week2_shoes_not_enough: 'C',
  job_fagarbeider_week2_missing_material: 'A',
  personal_fagarbeider_week2_family_handy: 'A',
  job_fagarbeider_week2_safety_stops_speed: 'A',
  personal_fagarbeider_week2_sleep_not_coming: 'B',
  job_fagarbeider_week2_second_week_review: 'B',
  personal_fagarbeider_week2_weekend_maintenance: 'D'
};

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'));
}

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

function allFamilies() {
  return [...readJson(JOB_FAMILY_PATH).families, ...readJson(PEOPLE_FAMILY_PATH).families];
}

function packageFamilies() {
  const families = allFamilies().filter(family => [FIRST_WEEK_JOB, FIRST_WEEK_PRIVATE, SECOND_WEEK_JOB, SECOND_WEEK_PRIVATE].includes(family.id));
  return Object.fromEntries(families.map(family => [family.id, family]));
}

function allPackageMails(familiesById = packageFamilies()) {
  return Object.values(familiesById).flatMap(family => (family.mails || []).map(mail => ({ ...mail, __familyId: family.id })));
}

function allPackageThreads(familiesById = packageFamilies()) {
  return Object.values(familiesById).flatMap(family => (family.threads || []).map(thread => ({ ...thread, __familyId: family.id })));
}

function choicesFor(mails) {
  return mails.flatMap(mail => (mail.choices || []).map(choice => ({ ...choice, __mail: mail })));
}

function flagsFor(choice) {
  return Array.isArray(choice?.next_bias?.set_flags) ? choice.next_bias.set_flags : [];
}

function assertChoiceShape(mail) {
  assert(Array.isArray(mail.choices) && mail.choices.length > 0, `${mail.id} should have choices`);
  for (const choice of mail.choices) {
    assert.strictEqual(typeof choice.reply, 'string', `${mail.id}/${choice.id} should have choices.reply`);
    assert(choice.reply.length > 0, `${mail.id}/${choice.id} choices.reply should not be empty`);
    assert(choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects), `${mail.id}/${choice.id} should have choices.effects object`);
  }
}

function assertLongCorrespondence(mail, minSituation) {
  assert(Array.isArray(mail.situation), `${mail.id} should use situation array`);
  assert(mail.situation.length >= minSituation, `${mail.id} should render as multi-message correspondence`);
}

function assertRawChannel(mail, expectedChannel) {
  if (expectedChannel === 'job') {
    assert.strictEqual(mail.mail_type, 'job', `${mail.id} should keep mail_type=job`);
    assert.strictEqual(mail.channel, 'job', `${mail.id} should keep channel=job`);
    assert.strictEqual(mail.messageChannel, 'job', `${mail.id} should keep messageChannel=job`);
    assert.notStrictEqual(mail.mail_class, 'private_message', `${mail.id} should not be private_message`);
    return;
  }
  assert.strictEqual(mail.mail_type, 'people', `${mail.id} should keep mail_type=people`);
  assert.strictEqual(mail.channel, 'private', `${mail.id} should keep channel=private`);
  assert.strictEqual(mail.messageChannel, 'private', `${mail.id} should keep messageChannel=private`);
  assert.strictEqual(mail.mail_class, 'private_message', `${mail.id} should keep mail_class=private_message`);
}

function makeHarness() {
  global.window = global;
  global.localStorage = makeStorage();
  global.localStorage.setItem('hg_job_history_v1', '[]');
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

  if (!global.CivicationEventEngine || !global.CivicationMailRuntime) {
    loadScript('js/Civication/core/civicationState.js');
    loadScript('js/Civication/core/civicationEventEngine.js');
    loadScript('js/Civication/systems/civicationEventChannels.js');
    loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
    loadScript('js/Civication/systems/day/dayChoiceDirector.js');
    loadScript('js/Civication/systems/day/dayConsequences.js');
    loadScript('js/Civication/systems/civicationMailRuntime.js');
  }

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    title: 'Fagarbeider',
    role_key: 'fagarbeider',
    role_id: 'naer_fagarbeider'
  });
  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  return { engine, psycheCalls, capitalCalls };
}

async function playStyle(name, choiceMap) {
  const { engine, psycheCalls, capitalCalls } = makeHarness();
  const plannedSeen = [];
  const threadSeen = [];
  const selectedChoices = [];
  const selectedFlags = new Set();
  let totalEffect = 0;
  const statTotals = {};

  for (const expected of EXPECTED_FLOW) {
    if (!pendingEvent()) {
      const opened = await engine.onAppOpen({ force: true });
      assert.strictEqual(opened.enqueued, true, `${name}: opening app should enqueue ${expected.id}: ${JSON.stringify(opened)}`);
    }

    let pending = pendingEvent();
    assert(pending, `${name}: pending planned mail missing before ${expected.id}`);
    assert.strictEqual(pending.id, expected.id, `${name}: runtime should present ${expected.id} in the two-week order`);
    assert.strictEqual(pending.mail_type, expected.type, `${name}: ${expected.id} should keep mail_type`);
    assert.strictEqual(global.CivicationEventChannels.getMessageChannel(pending), expected.channel, `${name}: ${expected.id} should classify to ${expected.channel}`);
    assertLongCorrespondence(pending, expected.minSituation);
    assert.deepStrictEqual(pending.mail_plan_meta.fallback_types, [], `${name}: ${expected.id} should not rely on fallback progression`);

    const split = global.CivicationEventChannels.splitInboxByMessageChannel(global.CivicationState.getInbox());
    assert.strictEqual(split[expected.channel].some(row => row?.event?.id === expected.id), true, `${name}: ${expected.id} should be in the ${expected.channel} inbox bucket`);
    assert.strictEqual(split[expected.channel === 'job' ? 'private' : 'job'].some(row => row?.event?.id === expected.id), false, `${name}: ${expected.id} should not leak to the wrong inbox bucket`);

    const choiceId = choiceMap[pending.id];
    const choice = pending.choices.find(row => row.id === choiceId);
    assert(choice, `${name}: configured choice ${choiceId} should exist for ${pending.id}`);
    assert(choice.reply && choice.effects, `${name}: selected choice ${pending.id}/${choice.id} should carry reply/effects`);
    assert(choice.triggers_on_choice, `${name}: selected choice ${pending.id}/${choice.id} should trigger a consequence thread`);

    plannedSeen.push(pending.id);
    selectedChoices.push({ mail: pending.id, choice: choice.id, label: choice.label, flags: flagsFor(choice), effect: Number(choice.effect || 0), channel: expected.channel });
    flagsFor(choice).forEach(flag => selectedFlags.add(flag));
    totalEffect += Number(choice.effect || 0);
    const stats = choice.effects?.stats || choice.effects || {};
    for (const [key, value] of Object.entries(stats)) {
      statTotals[key] = (statTotals[key] || 0) + Number(value || 0);
    }

    let result = await engine.answer(pending.id, choice.id);
    assert.notStrictEqual(result?.ok, false, `${name}: answering ${pending.id} should succeed`);
    assert(result.choice_director?.handler_results?.some(row => row.name === 'dayConsequences' && row.ok), `${name}: ${pending.id} should run dayConsequences`);

    const thread = pendingEvent();
    assert(thread, `${name}: thread consequence missing after ${pending.id}`);
    assert.strictEqual(thread.id, choice.triggers_on_choice, `${name}: ${pending.id} should enqueue selected consequence thread`);
    assert.strictEqual(thread.source_type, 'thread', `${name}: ${thread.id} must use existing thread runtime`);
    assert.strictEqual(global.CivicationEventChannels.getMessageChannel(thread), expected.channel, `${name}: ${thread.id} should inherit ${expected.channel} channel`);
    assert.strictEqual(thread.mail_type, expected.type, `${name}: ${thread.id} should inherit ${expected.type} mail_type`);
    assert(Array.isArray(thread.situation) && thread.situation.length >= 1, `${name}: ${thread.id} should be playable as thread situation array`);
    threadSeen.push(thread.id);

    result = await engine.answer(thread.id, 'A');
    assert.notStrictEqual(result?.ok, false, `${name}: answering ${thread.id} should succeed`);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  assert.deepStrictEqual(plannedSeen, EXPECTED_FLOW.map(row => row.id), `${name}: planned mails should remain steps 1-20`);
  assert.strictEqual(threadSeen.length, 20, `${name}: every two-week planned choice should enqueue a consequence thread`);
  assert.notStrictEqual((await global.CivicationMailRuntime.debugCandidates())[0]?.id, EXPECTED_FLOW[0].id, `${name}: consumed first mail should not repeat through fallback`);

  return { selectedChoices, selectedFlags, statTotals, totalEffect, psycheCalls, capitalCalls };
}

function sumCalls(calls, key) {
  return calls.filter(call => call.key === key).reduce((sum, call) => sum + Number(call.amount || 0), 0);
}

function hasAny(set, patterns) {
  return patterns.some(pattern => [...set].some(flag => pattern.test(flag)));
}

async function run() {
  const plan = readJson(PLAN_PATH);
  const firstTwentySteps = plan.sequence.slice(0, 20);
  assert.strictEqual(firstTwentySteps.length, 20, 'fagarbeider_plan should have at least 20 relevant package steps');

  firstTwentySteps.forEach((step, index) => {
    const number = index + 1;
    const expected = EXPECTED_FLOW[index];
    assert.strictEqual(step.step, number, `step ${number} should be numbered consecutively`);
    assert.strictEqual(step.type, expected.type, `step ${number} should alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expected.family], `step ${number} should point at the expected week package family`);
    assert.deepStrictEqual(step.fallback_types, [], `step ${number} should not use fallback as normal package progression`);
    assert.strictEqual(step.allowed_families[0].startsWith(number <= 10 ? 'first_week_praksisfortellinger_fagarbeider_' : 'second_week_praksisfortellinger_fagarbeider_'), true, `step ${number} should stay in its week package`);
  });

  const families = packageFamilies();
  assert.strictEqual(families[FIRST_WEEK_JOB].mails.length, 5, 'first week should have five job threads');
  assert.strictEqual(families[FIRST_WEEK_PRIVATE].mails.length, 5, 'first week should have five private threads');
  assert.strictEqual(families[SECOND_WEEK_JOB].mails.length, 5, 'second week should have five job threads');
  assert.strictEqual(families[SECOND_WEEK_PRIVATE].mails.length, 5, 'second week should have five private threads');

  const mails = allPackageMails(families);
  const mailById = new Map(mails.map(mail => [mail.id, mail]));
  const threads = allPackageThreads(families);
  const threadsById = new Map(threads.map(thread => [thread.id, thread]));

  for (const expected of EXPECTED_FLOW) {
    const mail = mailById.get(expected.id);
    assert(mail, `${expected.id} should exist in package family data`);
    assert.strictEqual(mail.__familyId, expected.family, `${expected.id} should live in the expected family`);
    assertLongCorrespondence(mail, expected.minSituation);
    assertChoiceShape(mail);
    assertRawChannel(mail, expected.channel);
  }

  const allChoices = choicesFor(mails);
  assert(allChoices.length >= 60, 'two-week flow should expose a broad choice surface');
  assert(allChoices.every(choice => typeof choice.reply === 'string' && choice.reply.length > 0), 'all choices should expose reply');
  assert(allChoices.every(choice => choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects)), 'all choices should expose effects object');
  assert(choicesFor([...families[FIRST_WEEK_JOB].mails, ...families[FIRST_WEEK_PRIVATE].mails]).some(choice => choice.triggers_on_choice), 'week one should include triggers_on_choice');
  assert(choicesFor([...families[SECOND_WEEK_JOB].mails, ...families[SECOND_WEEK_PRIVATE].mails]).some(choice => choice.triggers_on_choice), 'week two should include triggers_on_choice');
  assert(choicesFor([...families[FIRST_WEEK_JOB].mails, ...families[FIRST_WEEK_PRIVATE].mails]).some(choice => choice.next_bias?.set_flags?.length), 'week one should include next_bias');
  assert(choicesFor([...families[SECOND_WEEK_JOB].mails, ...families[SECOND_WEEK_PRIVATE].mails]).some(choice => choice.next_bias?.set_flags?.length), 'week two should include next_bias');

  for (const choice of allChoices.filter(choice => choice.triggers_on_choice)) {
    const thread = threadsById.get(choice.triggers_on_choice);
    assert(thread, `${choice.__mail.id}/${choice.id} should reference an existing consequence thread`);
    assert([FIRST_WEEK_JOB, FIRST_WEEK_PRIVATE, SECOND_WEEK_JOB, SECOND_WEEK_PRIVATE].includes(thread.__familyId), `${thread.id} should live in a fagarbeider package consequence family`);
    assertRawChannel(thread, thread.__familyId === FIRST_WEEK_JOB || thread.__familyId === SECOND_WEEK_JOB ? 'job' : 'private');
    assert(Array.isArray(thread.situation) && thread.situation.length >= 1, `${thread.id} should have playable thread situation`);
    assert(Array.isArray(thread.choices) && thread.choices.length > 0, `${thread.id} should have an acknowledgement choice`);
  }

  const channelHarness = makeHarness();
  for (const expected of EXPECTED_FLOW) {
    const mail = mailById.get(expected.id);
    assert.strictEqual(global.CivicationEventChannels.getMessageChannel({ ...mail, source_type: 'planned' }), expected.channel, `${expected.id} should classify through runtime channel bridge`);
    assert.strictEqual(global.CivicationEventChannels.getMessageChannel(mail), expected.channel, `${expected.id} raw data should classify through channel bridge`);
  }
  assert(channelHarness.engine, 'channel harness should load runtime bridge');

  const allTextByWeek = week => JSON.stringify(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === week));
  assert(/midlertidig|kropp|snarvei|logg|avvik|sikker/i.test(allTextByWeek(1)), 'week one should establish temporary securing, body, shortcuts, logging/deviation and safety');
  assert(/opplæring|avvik|materiell|sperr|sikker|restitusjon|kropp/i.test(allTextByWeek(2)), 'week two should continue with training, returning deviations, material shortage, safety stops and recovery');

  const weekOneFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 1)).flatMap(flagsFor));
  const weekTwoFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 2)).flatMap(flagsFor));
  assert([...weekOneFlags].some(flag => /future_risk|body_strain|quick_fix|craft|social_gain/.test(flag)), 'week one branch labels should expose craft, body, shortcut or risk themes');
  assert([...weekTwoFlags].some(flag => /week2|safe_learner|material|safety|body|recovery|approval|craft_identity|fast_closer/.test(flag)), 'week two branch labels should be readable as continuations of week one themes');

  const signalKeys = new Set();
  for (const choice of allChoices) {
    const stats = choice.effects?.stats || choice.effects || {};
    for (const key of Object.keys(stats)) signalKeys.add(key);
    for (const flag of flagsFor(choice)) signalKeys.add(flag);
  }
  for (const signal of ['quality', 'safety', 'speed', 'body_strain', 'energy', 'future_risk', 'learning_progress', 'trust_colleague', 'trust_manager', 'stagnation', 'overload_risk']) {
    assert([...signalKeys].some(key => key === signal || key.includes(signal)), `fagarbeider flow should carry ${signal} as effect or branch signal`);
  }
  assert([...signalKeys].some(key => key === 'autonomy' || key === 'clarity' || key.includes('autonomy') || key.includes('clarity')), 'fagarbeider flow should carry autonomy or clarity as effect or branch signal');

  const senders = new Set(mails.map(mail => String(mail.from || '')));
  assert([...senders].some(sender => /rune|arbeid|leder/i.test(sender)), 'flow should include work/leader mail');
  assert(/Amir|Rune|Sara|Jonas|familie/i.test(allTextByWeek(1) + allTextByWeek(2)), 'flow should include colleague and private context');
  assert(mails.some(mail => mail.channel === 'private'), 'flow should include private messages');
  assert(threads.length >= 20, 'flow should include consequence messages');

  const craftSafe = await playStyle('craft-safe-professional', CRAFT_SAFE_CHOICES);
  assert(craftSafe.statTotals.quality > 0, 'craft-safe player should increase quality');
  assert(craftSafe.statTotals.safety > 0, 'craft-safe player should increase safety');
  assert(craftSafe.statTotals.learning_progress > 0, 'craft-safe player should increase learning progress');
  assert((craftSafe.statTotals.trust_colleague || 0) + (craftSafe.statTotals.trust_manager || 0) >= 0, 'craft-safe player should keep colleague/manager trust non-negative');
  assert(craftSafe.statTotals.promotion_path > 0, 'craft-safe player should gain craft progression/promotion path');
  assert((craftSafe.statTotals.stress || 0) >= 0, 'craft-safe player may carry stress while doing careful work');
  assert(hasAny(craftSafe.selectedFlags, [/safe_learner/, /safety_first/, /craft_identity/, /body_maintenance/]), 'craft-safe player should process week-two branch flags');

  const fastCloser = await playStyle('fast-closer', FAST_CLOSER_CHOICES);
  assert((fastCloser.statTotals.speed || 0) > (craftSafe.statTotals.speed || 0), 'fast closer should gain more speed than craft-safe player');
  assert((fastCloser.statTotals.future_risk || 0) > (craftSafe.statTotals.future_risk || 0), 'fast closer should increase future risk');
  assert((fastCloser.statTotals.quality || 0) < (craftSafe.statTotals.quality || 0), 'fast closer should have weaker quality than craft-safe player');
  assert((fastCloser.statTotals.safety || 0) < (craftSafe.statTotals.safety || 0), 'fast closer should have weaker safety than craft-safe player');
  assert((fastCloser.statTotals.stagnation || 0) > 0, 'fast closer can build stagnation');
  assert(hasAny(fastCloser.selectedFlags, [/quick_close_risk/, /fast_closer/, /improvised_material/, /unsafe_speed/]), 'fast closer should process speed/risk branch flags');

  const safeLearner = await playStyle('safe-learner', SAFE_LEARNER_CHOICES);
  assert(safeLearner.statTotals.clarity > 0, 'safe learner should increase clarity');
  assert(safeLearner.statTotals.learning_progress > 0, 'safe learner should increase learning progress');
  assert(safeLearner.statTotals.safety > 0, 'safe learner should increase safety');
  assert((safeLearner.statTotals.autonomy || 0) + (safeLearner.statTotals.autonomy_private || 0) > 0, 'safe learner should increase autonomy or bounded autonomy');
  assert((safeLearner.statTotals.future_risk || 0) < (fastCloser.statTotals.future_risk || 0), 'safe learner should handle risk better than fast closer');
  assert(hasAny(safeLearner.selectedFlags, [/safe_learner/, /temporary_with_clear_limit/, /practical_safety/, /bounded/]), 'safe learner should process learning and bounded-solution branch flags');

  const overusedBody = await playStyle('overused-body', OVERUSED_BODY_CHOICES);
  assert((overusedBody.statTotals.relationship_family || 0) + (overusedBody.statTotals.relationship_jonas || 0) + (overusedBody.statTotals.relationship_sara || 0) > 0, 'overused-body player can gain private relationship effects');
  assert(overusedBody.statTotals.body_strain > craftSafe.statTotals.body_strain, 'overused-body player should increase body strain more than craft-safe player');
  assert((overusedBody.statTotals.energy || 0) + (overusedBody.statTotals.energy_weekend || 0) < 0, 'overused-body player should lose energy');
  assert((overusedBody.statTotals.overload_risk || 0) > 0, 'overused-body player should increase overload risk');
  assert(Object.prototype.hasOwnProperty.call(overusedBody.statTotals, 'stress') || Object.prototype.hasOwnProperty.call(overusedBody.statTotals, 'guilt'), 'overused-body player should surface stress or guilt effects');
  assert(hasAny(overusedBody.selectedFlags, [/body_ignored/, /family_help/, /approval_over_recovery/, /body_strain/]), 'overused-body player should process body and availability branch flags');

  console.log('civication fagarbeider two-week praksisfortellinger flow ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
