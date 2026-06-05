#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/mellomleder_plan.json';
const JOB_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json';
const PEOPLE_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json';
const REGISTRY_PATH = 'data/Civication/praksisfortellinger_registry.json';

const FIRST_WEEK_JOB = 'first_week_praksisfortellinger_mellomleder_job';
const FIRST_WEEK_PRIVATE = 'first_week_praksisfortellinger_mellomleder_private';
const SECOND_WEEK_JOB = 'second_week_praksisfortellinger_mellomleder_job';
const SECOND_WEEK_PRIVATE = 'second_week_praksisfortellinger_mellomleder_private';
const TWO_WEEK_TEST = 'tests/civication-mellomleder-two-week-flow.test.js';

const EXPECTED_FLOW = [
  { id: 'job_mellomleder_week1_first_monday_report', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_mellomleder_week1_role_hard_to_explain', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_mellomleder_week1_capacity_not_in_sheet', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_mellomleder_week1_friend_needs_clear_answer', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_mellomleder_week1_peace_below_speed_above', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_mellomleder_week1_dinner_as_status_meeting', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_mellomleder_week1_difficult_feedback', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_mellomleder_week1_too_polished_message', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_mellomleder_week1_first_week_in_the_middle', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_mellomleder_week1_weekend_without_report', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 3 },
  { id: 'job_mellomleder_week2_action_plan_sounds_simple', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_mellomleder_week2_after_promising_action', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_mellomleder_week2_team_asks_what_changes', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_mellomleder_week2_friend_not_a_followup_case', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_mellomleder_week2_numbers_become_politics', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_mellomleder_week2_meeting_words_at_home', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_mellomleder_week2_thomas_followup_aftershock', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_mellomleder_week2_private_talk_delayed', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_mellomleder_week2_second_week_in_the_middle', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_mellomleder_week2_weekend_without_buffering', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 3 }
];

const HONEST_TRANSLATOR_CHOICES = {
  job_mellomleder_week1_first_monday_report: 'A',
  personal_mellomleder_week1_role_hard_to_explain: 'A',
  job_mellomleder_week1_capacity_not_in_sheet: 'A',
  personal_mellomleder_week1_friend_needs_clear_answer: 'B',
  job_mellomleder_week1_peace_below_speed_above: 'A',
  personal_mellomleder_week1_dinner_as_status_meeting: 'A',
  job_mellomleder_week1_difficult_feedback: 'A',
  personal_mellomleder_week1_too_polished_message: 'A',
  job_mellomleder_week1_first_week_in_the_middle: 'A',
  personal_mellomleder_week1_weekend_without_report: 'A',
  job_mellomleder_week2_action_plan_sounds_simple: 'A',
  personal_mellomleder_week2_after_promising_action: 'A',
  job_mellomleder_week2_team_asks_what_changes: 'A',
  personal_mellomleder_week2_friend_not_a_followup_case: 'A',
  job_mellomleder_week2_numbers_become_politics: 'A',
  personal_mellomleder_week2_meeting_words_at_home: 'A',
  job_mellomleder_week2_thomas_followup_aftershock: 'A',
  personal_mellomleder_week2_private_talk_delayed: 'A',
  job_mellomleder_week2_second_week_in_the_middle: 'A',
  personal_mellomleder_week2_weekend_without_buffering: 'A'
};

const SMOOTH_BUFFER_CHOICES = {
  job_mellomleder_week1_first_monday_report: 'B',
  personal_mellomleder_week1_role_hard_to_explain: 'B',
  job_mellomleder_week1_capacity_not_in_sheet: 'B',
  personal_mellomleder_week1_friend_needs_clear_answer: 'C',
  job_mellomleder_week1_peace_below_speed_above: 'B',
  personal_mellomleder_week1_dinner_as_status_meeting: 'B',
  job_mellomleder_week1_difficult_feedback: 'B',
  personal_mellomleder_week1_too_polished_message: 'B',
  job_mellomleder_week1_first_week_in_the_middle: 'B',
  personal_mellomleder_week1_weekend_without_report: 'C',
  job_mellomleder_week2_action_plan_sounds_simple: 'B',
  personal_mellomleder_week2_after_promising_action: 'B',
  job_mellomleder_week2_team_asks_what_changes: 'B',
  personal_mellomleder_week2_friend_not_a_followup_case: 'B',
  job_mellomleder_week2_numbers_become_politics: 'B',
  personal_mellomleder_week2_meeting_words_at_home: 'B',
  job_mellomleder_week2_thomas_followup_aftershock: 'B',
  personal_mellomleder_week2_private_talk_delayed: 'C',
  job_mellomleder_week2_second_week_in_the_middle: 'B',
  personal_mellomleder_week2_weekend_without_buffering: 'C'
};

const PRESSURE_TRANSMITTER_CHOICES = {
  job_mellomleder_week1_first_monday_report: 'B',
  personal_mellomleder_week1_role_hard_to_explain: 'C',
  job_mellomleder_week1_capacity_not_in_sheet: 'B',
  personal_mellomleder_week1_friend_needs_clear_answer: 'A',
  job_mellomleder_week1_peace_below_speed_above: 'B',
  personal_mellomleder_week1_dinner_as_status_meeting: 'B',
  job_mellomleder_week1_difficult_feedback: 'C',
  personal_mellomleder_week1_too_polished_message: 'B',
  job_mellomleder_week1_first_week_in_the_middle: 'D',
  personal_mellomleder_week1_weekend_without_report: 'C',
  job_mellomleder_week2_action_plan_sounds_simple: 'C',
  personal_mellomleder_week2_after_promising_action: 'C',
  job_mellomleder_week2_team_asks_what_changes: 'C',
  personal_mellomleder_week2_friend_not_a_followup_case: 'B',
  job_mellomleder_week2_numbers_become_politics: 'B',
  personal_mellomleder_week2_meeting_words_at_home: 'B',
  job_mellomleder_week2_thomas_followup_aftershock: 'C',
  personal_mellomleder_week2_private_talk_delayed: 'C',
  job_mellomleder_week2_second_week_in_the_middle: 'D',
  personal_mellomleder_week2_weekend_without_buffering: 'C'
};

const TEAM_DEFENDER_CHOICES = {
  job_mellomleder_week1_first_monday_report: 'C',
  personal_mellomleder_week1_role_hard_to_explain: 'A',
  job_mellomleder_week1_capacity_not_in_sheet: 'C',
  personal_mellomleder_week1_friend_needs_clear_answer: 'B',
  job_mellomleder_week1_peace_below_speed_above: 'C',
  personal_mellomleder_week1_dinner_as_status_meeting: 'A',
  job_mellomleder_week1_difficult_feedback: 'A',
  personal_mellomleder_week1_too_polished_message: 'A',
  job_mellomleder_week1_first_week_in_the_middle: 'C',
  personal_mellomleder_week1_weekend_without_report: 'A',
  job_mellomleder_week2_action_plan_sounds_simple: 'A',
  personal_mellomleder_week2_after_promising_action: 'A',
  job_mellomleder_week2_team_asks_what_changes: 'A',
  personal_mellomleder_week2_friend_not_a_followup_case: 'A',
  job_mellomleder_week2_numbers_become_politics: 'C',
  personal_mellomleder_week2_meeting_words_at_home: 'A',
  job_mellomleder_week2_thomas_followup_aftershock: 'A',
  personal_mellomleder_week2_private_talk_delayed: 'B',
  job_mellomleder_week2_second_week_in_the_middle: 'C',
  personal_mellomleder_week2_weekend_without_buffering: 'B'
};

const UNCLEAR_MIDDLE_CHOICES = {
  job_mellomleder_week1_first_monday_report: 'B',
  personal_mellomleder_week1_role_hard_to_explain: 'C',
  job_mellomleder_week1_capacity_not_in_sheet: 'B',
  personal_mellomleder_week1_friend_needs_clear_answer: 'C',
  job_mellomleder_week1_peace_below_speed_above: 'B',
  personal_mellomleder_week1_dinner_as_status_meeting: 'C',
  job_mellomleder_week1_difficult_feedback: 'B',
  personal_mellomleder_week1_too_polished_message: 'C',
  job_mellomleder_week1_first_week_in_the_middle: 'B',
  personal_mellomleder_week1_weekend_without_report: 'D',
  job_mellomleder_week2_action_plan_sounds_simple: 'B',
  personal_mellomleder_week2_after_promising_action: 'C',
  job_mellomleder_week2_team_asks_what_changes: 'B',
  personal_mellomleder_week2_friend_not_a_followup_case: 'C',
  job_mellomleder_week2_numbers_become_politics: 'B',
  personal_mellomleder_week2_meeting_words_at_home: 'C',
  job_mellomleder_week2_thomas_followup_aftershock: 'B',
  personal_mellomleder_week2_private_talk_delayed: 'C',
  job_mellomleder_week2_second_week_in_the_middle: 'B',
  personal_mellomleder_week2_weekend_without_buffering: 'D'
};

const PRIVATE_BOUNDARY_CHOICES = {
  job_mellomleder_week1_first_monday_report: 'B',
  personal_mellomleder_week1_role_hard_to_explain: 'A',
  job_mellomleder_week1_capacity_not_in_sheet: 'B',
  personal_mellomleder_week1_friend_needs_clear_answer: 'B',
  job_mellomleder_week1_peace_below_speed_above: 'B',
  personal_mellomleder_week1_dinner_as_status_meeting: 'A',
  job_mellomleder_week1_difficult_feedback: 'B',
  personal_mellomleder_week1_too_polished_message: 'A',
  job_mellomleder_week1_first_week_in_the_middle: 'B',
  personal_mellomleder_week1_weekend_without_report: 'A',
  job_mellomleder_week2_action_plan_sounds_simple: 'B',
  personal_mellomleder_week2_after_promising_action: 'A',
  job_mellomleder_week2_team_asks_what_changes: 'B',
  personal_mellomleder_week2_friend_not_a_followup_case: 'A',
  job_mellomleder_week2_numbers_become_politics: 'B',
  personal_mellomleder_week2_meeting_words_at_home: 'A',
  job_mellomleder_week2_thomas_followup_aftershock: 'B',
  personal_mellomleder_week2_private_talk_delayed: 'B',
  job_mellomleder_week2_second_week_in_the_middle: 'B',
  personal_mellomleder_week2_weekend_without_buffering: 'B'
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

function packageFamilies() {
  const families = [...readJson(JOB_FAMILY_PATH).families, ...readJson(PEOPLE_FAMILY_PATH).families]
    .filter(family => [FIRST_WEEK_JOB, FIRST_WEEK_PRIVATE, SECOND_WEEK_JOB, SECOND_WEEK_PRIVATE].includes(family.id));
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

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function flagsFor(choice) {
  return Array.isArray(choice?.next_bias?.set_flags) ? choice.next_bias.set_flags : [];
}

function statTotal(totals, key) {
  if (key === 'trust_team') return (totals.trust_team || 0) + (totals.team_trust || 0);
  if (key === 'relationship_private') return (totals.relationship_private || 0) + (totals.relationship_sara || 0) + (totals.relationship_jonas || 0);
  return totals[key] || 0;
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
    assert.strictEqual(mail.mail_class, 'job_message', `${mail.id} should keep mail_class=job_message`);
    return;
  }
  assert.strictEqual(mail.mail_type, 'people', `${mail.id} should keep mail_type=people`);
  assert.strictEqual(mail.channel, 'private', `${mail.id} should keep channel=private`);
  assert.strictEqual(mail.messageChannel, 'private', `${mail.id} should keep messageChannel=private`);
  assert.strictEqual(mail.mail_class, 'private_message', `${mail.id} should keep mail_class=private_message`);
}


function assertMellomlederRuntimeEvent(event, context) {
  assert.strictEqual(event.role_scope, 'mellomleder', `${context}: runtime event should stay scoped to mellomleder`);
  assert(!/arbeider|fagarbeider|formann|ekspeditør|ekspeditor/i.test(event.id), `${context}: runtime event should not mix in another role id`);
  if (event.mail_family) {
    assert(/mellomleder/i.test(event.mail_family), `${context}: runtime event should stay in a mellomleder family`);
  }
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
    title: 'Mellomleder',
    role_key: 'mellomleder',
    role_id: 'naer_mellomleder'
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
    assertMellomlederRuntimeEvent(pending, `${name}: ${expected.id}`);
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
    selectedChoices.push({ mail: pending.id, choice: choice.id, label: choice.label, flags: flagsFor(choice), channel: expected.channel });
    flagsFor(choice).forEach(flag => selectedFlags.add(flag));
    for (const [key, value] of Object.entries(statsFor(choice))) {
      statTotals[key] = (statTotals[key] || 0) + Number(value || 0);
    }

    let result = await engine.answer(pending.id, choice.id);
    assert.notStrictEqual(result?.ok, false, `${name}: answering ${pending.id} should succeed`);
    assert(result.choice_director?.handler_results?.some(row => row.name === 'dayConsequences' && row.ok), `${name}: ${pending.id} should run dayConsequences`);

    const thread = pendingEvent();
    assert(thread, `${name}: thread consequence missing after ${pending.id}`);
    assert.strictEqual(thread.id, choice.triggers_on_choice, `${name}: ${pending.id} should enqueue selected consequence thread`);
    assert.strictEqual(thread.source_type, 'thread', `${name}: ${thread.id} must use existing thread runtime`);
    assertMellomlederRuntimeEvent(thread, `${name}: ${thread.id}`);
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

  return { selectedChoices, selectedFlags, statTotals, psycheCalls, capitalCalls };
}

function hasAny(set, patterns) {
  return patterns.some(pattern => [...set].some(flag => pattern.test(flag)));
}

function packageById(registryRole, packageId) {
  const pkg = registryRole.packages.find(row => row.package_id === packageId);
  assert(pkg, `registry should include ${packageId}`);
  return pkg;
}

function allTextForWeek(mails, week) {
  const ids = new Set(EXPECTED_FLOW.filter(row => row.week === week).map(row => row.id));
  return mails
    .filter(mail => ids.has(mail.id))
    .map(mail => [mail.id, mail.title, mail.subject, ...(mail.situation || []), ...(mail.choices || []).flatMap(choice => [choice.label, choice.reply, ...(flagsFor(choice) || [])])].join(' '))
    .join(' ');
}

async function run() {
  const plan = readJson(PLAN_PATH);
  const firstTwentySteps = plan.sequence.slice(0, 20);
  assert.strictEqual(firstTwentySteps.length, 20, 'mellomleder_plan should expose twenty package steps for week 1 + week 2');
  firstTwentySteps.forEach((step, index) => {
    const expected = EXPECTED_FLOW[index];
    assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep package ordering`);
    assert.strictEqual(step.type, expected.type, `step ${index + 1} should alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expected.family], `step ${index + 1} should point at the expected mellomleder family`);
    assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should keep fallback out of package progression`);
  });
  assert(plan.sequence.length > 20, 'existing mellomleder progression should still continue after the two package weeks');

  const registry = readJson(REGISTRY_PATH);
  const role = registry.roles.find(row => row.role_id === 'mellomleder');
  assert(role, 'registry should include mellomleder role');
  assert.strictEqual(role.plan_path, PLAN_PATH, 'mellomleder registry should point at mellomleder_plan');
  assert.strictEqual(role.job_family_path, JOB_FAMILY_PATH, 'mellomleder registry should point at mellomleder job family');
  assert.strictEqual(role.private_family_path, PEOPLE_FAMILY_PATH, 'mellomleder registry should point at mellomleder people family');
  assert.deepStrictEqual(role.flow_tests, [TWO_WEEK_TEST], 'mellomleder.flow_tests should point at the two-week flow test');
  const weekOnePackage = packageById(role, 'mellomleder_week_1');
  const weekTwoPackage = packageById(role, 'mellomleder_week_2');
  assert.deepStrictEqual({ start: weekOnePackage.step_start, end: weekOnePackage.step_end, job: weekOnePackage.job_family, private: weekOnePackage.private_family }, { start: 1, end: 10, job: FIRST_WEEK_JOB, private: FIRST_WEEK_PRIVATE }, 'mellomleder_week_1 should stay registered as steps 1-10');
  assert.deepStrictEqual({ start: weekTwoPackage.step_start, end: weekTwoPackage.step_end, job: weekTwoPackage.job_family, private: weekTwoPackage.private_family }, { start: 11, end: 20, job: SECOND_WEEK_JOB, private: SECOND_WEEK_PRIVATE }, 'mellomleder_week_2 should stay registered as steps 11-20');

  const familiesById = packageFamilies();
  for (const familyId of [FIRST_WEEK_JOB, FIRST_WEEK_PRIVATE, SECOND_WEEK_JOB, SECOND_WEEK_PRIVATE]) {
    assert(familiesById[familyId], `${familyId} should exist`);
    assert.strictEqual(familiesById[familyId].mails.length, 5, `${familyId} should include five planned mails`);
  }

  const mails = allPackageMails(familiesById);
  const threads = allPackageThreads(familiesById);
  const mailsById = new Map(mails.map(mail => [mail.id, mail]));
  const threadIds = new Set(threads.map(thread => thread.id));
  assert.deepStrictEqual(EXPECTED_FLOW.map(row => row.id), EXPECTED_FLOW.map(row => mailsById.get(row.id)?.id), 'expected mellomleder flow ids should exist in package families');

  for (const expected of EXPECTED_FLOW) {
    const mail = mailsById.get(expected.id);
    assert(mail, `${expected.id} should exist`);
    assert.strictEqual(mail.__familyId, expected.family, `${expected.id} should stay in ${expected.family}`);
    assert.strictEqual(mail.role_scope, 'mellomleder', `${expected.id} should stay scoped to mellomleder`);
    assertLongCorrespondence(mail, expected.minSituation);
    assertChoiceShape(mail);
    assertRawChannel(mail, expected.channel);
  }

  const allChoices = choicesFor(mails);
  assert(allChoices.some(choice => choice.triggers_on_choice && EXPECTED_FLOW.find(row => row.id === choice.__mail.id)?.week === 1), 'week one should include choice-triggered consequence threads');
  assert(allChoices.some(choice => choice.triggers_on_choice && EXPECTED_FLOW.find(row => row.id === choice.__mail.id)?.week === 2), 'week two should include choice-triggered consequence threads');
  assert(allChoices.some(choice => choice.next_bias && EXPECTED_FLOW.find(row => row.id === choice.__mail.id)?.week === 1), 'week one should include next_bias branch flags');
  assert(allChoices.some(choice => choice.next_bias && EXPECTED_FLOW.find(row => row.id === choice.__mail.id)?.week === 2), 'week two should include next_bias branch flags');

  for (const choice of allChoices.filter(choice => choice.triggers_on_choice)) {
    assert(threadIds.has(choice.triggers_on_choice), `${choice.__mail.id}/${choice.id} should point to an existing consequence thread`);
  }
  for (const thread of threads) {
    const expectedChannel = thread.__familyId.includes('_job') ? 'job' : 'private';
    assertRawChannel(thread, expectedChannel);
  }

  const signalKeys = new Set();
  for (const choice of allChoices) {
    for (const key of Object.keys(statsFor(choice))) signalKeys.add(key);
    for (const flag of flagsFor(choice)) signalKeys.add(flag);
  }
  for (const signal of ['clarity', 'trust_team', 'trust_manager', 'manager_pressure', 'stress', 'quality', 'flow', 'speed', 'future_risk', 'conflict', 'decision_fatigue', 'stagnation', 'authority', 'autonomy']) {
    assert([...signalKeys].some(key => key === signal || key.includes(signal)), `mellomleder flow should carry ${signal} as effect or branch signal`);
  }
  assert([...signalKeys].some(key => key === 'relationship_private' || key === 'relationship_sara' || key === 'relationship_jonas' || key === 'energy' || key.includes('relationship_private')), 'mellomleder flow should carry private relation or energy signals');

  const weekOneFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 1)).flatMap(flagsFor));
  const weekTwoFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 2)).flatMap(flagsFor));
  assert([...weekOneFlags].some(flag => /week1|honest_reporting|capacity|trust_team|balanced_feedback|decision_fatigue|smooth_report/.test(flag)), 'week one branch labels should expose reporting, capacity, team trust, feedback and private decision fatigue themes');
  assert([...weekTwoFlags].some(flag => /week2|action_plan|team_communication|political_precision|thomas|buffering|meeting_words/.test(flag)), 'week two branch labels should expose action, real change, political numbers, Thomas follow-up and private boundary themes');
  assert(/rapport|kapasitet|tillit|tilbakemelding|beslutning|oversett|klem/i.test(allTextForWeek(mails, 1)), 'week one text/id/title signals should establish reporting, capacity, team trust, feedback, decision fatigue or translator pressure');
  assert(/tiltak|endres|politikk|Thomas|møteord|buffer/i.test(allTextForWeek(mails, 2)), 'week two text/id/title signals should continue action plans, real change, political numbers, Thomas follow-up and private language boundaries');

  const senders = new Set(mails.map(mail => String(mail.from || '')));
  assert([...senders].some(sender => /Ingrid|Thomas|Sara|Jonas|team|leder/i.test(sender)), 'flow should include middle-management, team and private senders');
  assert(mails.some(mail => mail.channel === 'private'), 'flow should include private messages');
  assert(threads.length >= 20, 'flow should include consequence messages');

  const honestTranslator = await playStyle('aerlig-oversetter', HONEST_TRANSLATOR_CHOICES);
  assert(statTotal(honestTranslator.statTotals, 'clarity') > 0, 'honest translator should increase clarity');
  assert(statTotal(honestTranslator.statTotals, 'trust_team') > 0, 'honest translator should increase team trust');
  assert(statTotal(honestTranslator.statTotals, 'trust_manager') > 0, 'honest translator should increase manager trust');
  assert(statTotal(honestTranslator.statTotals, 'quality') > 0, 'honest translator should increase quality');
  assert(statTotal(honestTranslator.statTotals, 'manager_pressure') > 0, 'honest translator can increase manager pressure');
  assert(statTotal(honestTranslator.statTotals, 'stress') >= 0, 'honest translator can carry stress');
  assert(hasAny(honestTranslator.selectedFlags, [/honest_reporting/, /real_capacity/, /balanced_feedback/, /honest_translator/]), 'honest translator should process honest/reporting/action branch flags');

  const smoothBuffer = await playStyle('glatt-buffer', SMOOTH_BUFFER_CHOICES);
  assert(statTotal(smoothBuffer.statTotals, 'manager_pressure') < 0, 'smooth buffer should reduce short-term manager pressure');
  assert(statTotal(smoothBuffer.statTotals, 'stress') <= 0, 'smooth buffer should reduce short-term stress');
  assert(statTotal(smoothBuffer.statTotals, 'stagnation') > 0, 'smooth buffer should increase stagnation');
  assert(statTotal(smoothBuffer.statTotals, 'trust_team') < 0, 'smooth buffer should reduce team trust');
  assert(statTotal(smoothBuffer.statTotals, 'future_risk') > 0, 'smooth buffer should increase future risk');
  assert(hasAny(smoothBuffer.selectedFlags, [/smooth_report/, /symbolic_action_plan/, /polished_upward/, /smooth_buffer/]), 'smooth buffer should process smoothing/symbolic branch flags');

  const pressureTransmitter = await playStyle('pressformidler', PRESSURE_TRANSMITTER_CHOICES);
  assert(statTotal(pressureTransmitter.statTotals, 'speed') > 0, 'pressure transmitter should increase speed');
  assert(statTotal(pressureTransmitter.statTotals, 'flow') > 0, 'pressure transmitter can increase short-term flow');
  assert(statTotal(pressureTransmitter.statTotals, 'trust_team') < 0, 'pressure transmitter should reduce team trust');
  assert(statTotal(pressureTransmitter.statTotals, 'conflict') > 0, 'pressure transmitter should increase conflict');
  assert(statTotal(pressureTransmitter.statTotals, 'future_risk') > 0, 'pressure transmitter should increase future risk');
  assert(statTotal(pressureTransmitter.statTotals, 'quality') < statTotal(honestTranslator.statTotals, 'quality'), 'pressure transmitter should weaken quality compared with honest translation');
  assert(hasAny(pressureTransmitter.selectedFlags, [/broad_pressure/, /hard_feedback/, /blames_team/, /pressure_transmitter/]), 'pressure transmitter should process downward pressure branch flags');

  const teamDefender = await playStyle('teamforsvarer', TEAM_DEFENDER_CHOICES);
  assert(statTotal(teamDefender.statTotals, 'trust_team') > 0, 'team defender should increase team trust');
  assert(statTotal(teamDefender.statTotals, 'clarity') > 0, 'team defender should increase clarity');
  assert(statTotal(teamDefender.statTotals, 'manager_pressure') > 0, 'team defender should increase manager pressure');
  assert(statTotal(teamDefender.statTotals, 'conflict') >= 0, 'team defender can increase conflict');
  assert(statTotal(teamDefender.statTotals, 'stress') > 0, 'team defender should increase stress');
  assert(statTotal(teamDefender.statTotals, 'quality') > 0, 'team defender can increase quality');
  assert(hasAny(teamDefender.selectedFlags, [/capacity_warning/, /defends_team/, /capacity_escalation/, /pushes_structural_issue/]), 'team defender should process capacity/structural branch flags');

  const unclearMiddle = await playStyle('utydelig-mellomrom', UNCLEAR_MIDDLE_CHOICES);
  assert(statTotal(unclearMiddle.statTotals, 'stagnation') > 0, 'unclear middle should increase stagnation');
  assert(statTotal(unclearMiddle.statTotals, 'authority') < statTotal(honestTranslator.statTotals, 'authority'), 'unclear middle should leave authority below a clear translator style');
  assert(statTotal(unclearMiddle.statTotals, 'decision_fatigue') > 0, 'unclear middle should increase decision fatigue');
  assert(statTotal(unclearMiddle.statTotals, 'future_risk') > 0, 'unclear middle should increase future risk');
  assert(statTotal(unclearMiddle.statTotals, 'trust_team') < 0, 'unclear middle should reduce team trust');
  assert(statTotal(unclearMiddle.statTotals, 'trust_manager') <= statTotal(honestTranslator.statTotals, 'trust_manager'), 'unclear middle should not build manager trust like clear translation');
  assert(hasAny(unclearMiddle.selectedFlags, [/vague_team_message/, /ambiguous_followup/, /stagnation_private/, /decision_fatigue/]), 'unclear middle should process vague/avoidant branch flags');

  const privateBoundary = await playStyle('privat-grensesetter', PRIVATE_BOUNDARY_CHOICES);
  assert(statTotal(privateBoundary.statTotals, 'relationship_private') > 0, 'private boundary setter should increase private relationships');
  assert(statTotal(privateBoundary.statTotals, 'energy_weekend') > 0, 'private boundary setter should increase weekend energy');
  assert(statTotal(privateBoundary.statTotals, 'stress') < 0, 'private boundary setter should reduce stress');
  assert(statTotal(privateBoundary.statTotals, 'self_awareness') > 0, 'private boundary setter should increase self awareness');
  assert(statTotal(privateBoundary.statTotals, 'autonomy_private') > 0, 'private boundary setter should increase private autonomy');
  assert(hasAny(privateBoundary.selectedFlags, [/relationship_private/, /weekend_without_buffering_free_day/, /meeting_words_at_home_human/, /autonomy_private/]), 'private boundary setter should process relational/boundary branch flags');

  console.log('civication mellomleder two-week praksisfortellinger flow ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
