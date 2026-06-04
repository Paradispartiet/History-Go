#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/arbeider_plan.json';
const JOB_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json';
const PEOPLE_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json';

const FIRST_WEEK_JOB = 'first_week_praksisfortellinger_job';
const FIRST_WEEK_PRIVATE = 'first_week_praksisfortellinger_private';
const SECOND_WEEK_JOB = 'second_week_praksisfortellinger_job';
const SECOND_WEEK_PRIVATE = 'second_week_praksisfortellinger_private';

const EXPECTED_FLOW = [
  { id: 'job_first_week_unowned_task', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_one_small_thing', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_status_meeting', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_dinner_no_energy', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_error_no_owner', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_bill_due', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_praise_becomes_more_work', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_friend_replies_late', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_week_summary', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_family_expectation', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_week2_monday_note_used', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_week2_weekend_not_restful', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_week2_user_waited', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_week2_fee_arrived', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_week2_colleague_cover', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_week2_jonas_interview', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_week2_routine_becomes_politics', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_week2_dinner_concrete', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_week2_second_week_review', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_week2_weekend_test', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 3 }
];

const RESPONSIBLE_CHOICES = {
  job_first_week_unowned_task: 'B',
  personal_one_small_thing: 'A',
  job_status_meeting: 'A',
  personal_dinner_no_energy: 'B',
  job_error_no_owner: 'B',
  personal_bill_due: 'A',
  job_praise_becomes_more_work: 'A',
  personal_friend_replies_late: 'B',
  job_week_summary: 'A',
  personal_family_expectation: 'B',
  job_week2_monday_note_used: 'A',
  personal_week2_weekend_not_restful: 'A',
  job_week2_user_waited: 'A',
  personal_week2_fee_arrived: 'A',
  job_week2_colleague_cover: 'B',
  personal_week2_jonas_interview: 'A',
  job_week2_routine_becomes_politics: 'C',
  personal_week2_dinner_concrete: 'A',
  job_week2_second_week_review: 'A',
  personal_week2_weekend_test: 'C'
};

const MINIMUM_CHOICES = {
  job_first_week_unowned_task: 'A',
  personal_one_small_thing: 'B',
  job_status_meeting: 'C',
  personal_dinner_no_energy: 'B',
  job_error_no_owner: 'A',
  personal_bill_due: 'C',
  job_praise_becomes_more_work: 'B',
  personal_friend_replies_late: 'B',
  job_week_summary: 'B',
  personal_family_expectation: 'B',
  job_week2_monday_note_used: 'B',
  personal_week2_weekend_not_restful: 'B',
  job_week2_user_waited: 'C',
  personal_week2_fee_arrived: 'B',
  job_week2_colleague_cover: 'A',
  personal_week2_jonas_interview: 'C',
  job_week2_routine_becomes_politics: 'B',
  personal_week2_dinner_concrete: 'C',
  job_week2_second_week_review: 'C',
  personal_week2_weekend_test: 'D'
};

const BOUNDARY_CHOICES = {
  job_first_week_unowned_task: 'C',
  personal_one_small_thing: 'B',
  job_status_meeting: 'B',
  personal_dinner_no_energy: 'B',
  job_error_no_owner: 'C',
  personal_bill_due: 'C',
  job_praise_becomes_more_work: 'C',
  personal_friend_replies_late: 'B',
  job_week_summary: 'B',
  personal_family_expectation: 'B',
  job_week2_monday_note_used: 'C',
  personal_week2_weekend_not_restful: 'A',
  job_week2_user_waited: 'B',
  personal_week2_fee_arrived: 'C',
  job_week2_colleague_cover: 'C',
  personal_week2_jonas_interview: 'B',
  job_week2_routine_becomes_politics: 'C',
  personal_week2_dinner_concrete: 'B',
  job_week2_second_week_review: 'B',
  personal_week2_weekend_test: 'A'
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
    title: 'Saksstøtte / mottak / fellesinnboks',
    role_key: 'arbeider',
    role_id: 'naer_arbeider'
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
    assert(choice.reply && choice.effects && choice.next_bias, `${name}: selected choice ${pending.id}/${choice.id} should carry reply/effects/next_bias`);
    assert(choice.triggers_on_choice, `${name}: selected choice ${pending.id}/${choice.id} should trigger a consequence thread`);

    plannedSeen.push(pending.id);
    selectedChoices.push({ mail: pending.id, choice: choice.id, label: choice.label, flags: flagsFor(choice), effect: Number(choice.effect || 0), channel: expected.channel });
    flagsFor(choice).forEach(flag => selectedFlags.add(flag));
    totalEffect += Number(choice.effect || 0);

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

  return { selectedChoices, selectedFlags, totalEffect, psycheCalls, capitalCalls };
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
  assert.strictEqual(firstTwentySteps.length, 20, 'arbeider_plan should have at least 20 first package steps');

  firstTwentySteps.forEach((step, index) => {
    const number = index + 1;
    const expected = EXPECTED_FLOW[index];
    assert.strictEqual(step.step, number, `step ${number} should be numbered consecutively`);
    assert.strictEqual(step.type, expected.type, `step ${number} should alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expected.family], `step ${number} should point at the expected week package family`);
    assert.deepStrictEqual(step.fallback_types, [], `step ${number} should not use fallback as normal package progression`);
    assert.strictEqual(step.allowed_families[0].startsWith(number <= 10 ? 'first_week_praksisfortellinger_' : 'second_week_praksisfortellinger_'), true, `step ${number} should stay in its week package`);
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
    assert.strictEqual(thread.__familyId, choice.__mail.__familyId, `${thread.id} should live in the same family as ${choice.__mail.id}`);
    assertRawChannel(thread, choice.__mail.channel === 'job' ? 'job' : 'private');
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
  for (const actor of ['Marianne', 'Eirik', 'Nora', 'Jonas', 'Sara']) {
    assert(new RegExp(actor, 'i').test(allTextByWeek(1)), `week one should establish ${actor}`);
  }
  assert(/fellesinnboks|mottak|arbeidsplassen|avdelingsleder/i.test(allTextByWeek(1)), 'week one should establish workplace and shared inbox context');
  assert(/synlig|ansvar|rutine|lojal|belast|grense|helgen|etterklang|hvile/i.test(allTextByWeek(2)), 'week two should build on visibility, responsibility, routines, loyalty, load, boundaries and private aftereffects');

  const weekOneFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 1)).flatMap(flagsFor));
  const weekTwoFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 2)).flatMap(flagsFor));
  assert([...weekTwoFlags].some(flag => /week2|routine|visible|shared|healthy|overload|stagnation|relationship/.test(flag)), 'week two branch labels should be readable as continuations of week one themes');
  assert([...weekOneFlags].some(flag => weekTwoFlags.has(flag) || /boundary|stagnation|overload|relationship|promotion/.test(flag)), 'branch labels should carry themes across both weeks');

  const senders = new Set(mails.map(mail => String(mail.from || '')));
  assert([...senders].some(sender => /marianne|leder/i.test(sender)), 'flow should include leader mail');
  assert([...senders].some(sender => /eirik|nora/i.test(sender)) || /Eirik|Nora/.test(allTextByWeek(1) + allTextByWeek(2)), 'flow should include colleague mail/context');
  assert([...senders].some(sender => /system/i.test(sender)), 'flow should include system mail');
  assert(mails.some(mail => mail.channel === 'private'), 'flow should include private messages');
  assert(threads.length >= 20, 'flow should include consequence messages');

  const responsible = await playStyle('responsible-professional', RESPONSIBLE_CHOICES);
  assert(hasAny(responsible.selectedFlags, [/quality/, /clarity/, /manager_trust/, /promotion_path/, /visible_responsibility/]), 'responsible player should gain quality/clarity/trust/promotion flags');
  assert(hasAny(responsible.selectedFlags, [/stress_up/, /overload_risk/, /time_pressure/, /future_risk/]), 'responsible player should also carry stress/overload/risk where the content demands it');
  assert(sumCalls(responsible.psycheCalls, 'trust') > 0, 'responsible player should gain trust through effects');

  const minimum = await playStyle('avoidant-minimum', MINIMUM_CHOICES);
  assert(hasAny(minimum.selectedFlags, [/stagnation/, /low_visibility/, /future_risk/, /guilt/, /avoidance/]), 'minimum player should get stagnation/low visibility/future risk/guilt flags');
  assert(minimum.totalEffect <= responsible.totalEffect, 'minimum player should not receive cleaner positive progression than responsible player');
  assert(sumCalls(minimum.psycheCalls, 'integrity') < sumCalls(responsible.psycheCalls, 'integrity'), 'minimum player should not get the responsible integrity progression');

  const boundary = await playStyle('boundary-setting', BOUNDARY_CHOICES);
  assert(hasAny(boundary.selectedFlags, [/boundary/, /healthy_boundaries/, /clarity/, /control/, /stress_down/, /partial_control/]), 'boundary player should gain boundary/clarity/control/energy flags');
  assert(hasAny(boundary.selectedFlags, [/conflict_pressure/, /relationship_.*minus/, /relationship_eirik/, /friction/, /honest_no/]), 'boundary player should also expose relationship/manager friction where the content demands it');
  assert(sumCalls(boundary.psycheCalls, 'integrity') > sumCalls(minimum.psycheCalls, 'integrity'), 'boundary player should retain more integrity than avoidant minimum play');

  console.log('civication two-week praksisfortellinger flow ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
