#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/controller_plan.json';
const JOB_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/job/controller_job.json';
const PEOPLE_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/people/controller_people.json';
const REGISTRY_PATH = 'data/Civication/praksisfortellinger_registry.json';

const FIRST_WEEK_JOB = 'first_week_praksisfortellinger_controller_job';
const FIRST_WEEK_PRIVATE = 'first_week_praksisfortellinger_controller_private';
const SECOND_WEEK_JOB = 'second_week_praksisfortellinger_controller_job';
const SECOND_WEEK_PRIVATE = 'second_week_praksisfortellinger_controller_private';
const TWO_WEEK_TEST = 'tests/civication-controller-two-week-flow.test.js';

const EXPECTED_FLOW = [
  { id: 'job_controller_week1_month_report_before_explanation', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_controller_week1_counting_at_home', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_controller_week1_reconciliation_almost_matches', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_controller_week1_friend_not_controlled', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_controller_week1_operations_explains_variance', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_controller_week1_pattern_in_conversation', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_controller_week1_forecast_everyone_wants_certain', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_controller_week1_dinner_as_spreadsheet', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_controller_week1_numbers_as_responsibility', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_controller_week1_weekend_without_variance', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 3 },
  { id: 'job_controller_week2_variance_did_not_disappear', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_controller_week2_documenting_a_feeling', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_controller_week2_operations_stop_explaining', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_controller_week2_friend_says_you_do_not_believe_me', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_controller_week2_periodization_or_polishing', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_controller_week2_auditing_own_words', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_controller_week2_audit_trail', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_controller_week2_conversation_without_evidence', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_controller_week2_numbers_as_governance', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 3 },
  { id: 'personal_controller_week2_weekend_without_audit_trail', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 3 }
];

const PRECISE_TRANSLATOR_CHOICES = {
  job_controller_week1_month_report_before_explanation: 'A',
  personal_controller_week1_counting_at_home: 'C',
  job_controller_week1_reconciliation_almost_matches: 'A',
  personal_controller_week1_friend_not_controlled: 'C',
  job_controller_week1_operations_explains_variance: 'A',
  personal_controller_week1_pattern_in_conversation: 'C',
  job_controller_week1_forecast_everyone_wants_certain: 'A',
  personal_controller_week1_dinner_as_spreadsheet: 'C',
  job_controller_week1_numbers_as_responsibility: 'A',
  personal_controller_week1_weekend_without_variance: 'C',
  job_controller_week2_variance_did_not_disappear: 'A',
  personal_controller_week2_documenting_a_feeling: 'C',
  job_controller_week2_operations_stop_explaining: 'A',
  personal_controller_week2_friend_says_you_do_not_believe_me: 'C',
  job_controller_week2_periodization_or_polishing: 'A',
  personal_controller_week2_auditing_own_words: 'A',
  job_controller_week2_audit_trail: 'A',
  personal_controller_week2_conversation_without_evidence: 'A',
  job_controller_week2_numbers_as_governance: 'A',
  personal_controller_week2_weekend_without_audit_trail: 'B'
};

const FAST_REPORT_CHOICES = {
  job_controller_week1_month_report_before_explanation: 'B',
  personal_controller_week1_counting_at_home: 'B',
  job_controller_week1_reconciliation_almost_matches: 'C',
  personal_controller_week1_friend_not_controlled: 'B',
  job_controller_week1_operations_explains_variance: 'B',
  personal_controller_week1_pattern_in_conversation: 'B',
  job_controller_week1_forecast_everyone_wants_certain: 'B',
  personal_controller_week1_dinner_as_spreadsheet: 'B',
  job_controller_week1_numbers_as_responsibility: 'B',
  personal_controller_week1_weekend_without_variance: 'B',
  job_controller_week2_variance_did_not_disappear: 'C',
  personal_controller_week2_documenting_a_feeling: 'B',
  job_controller_week2_operations_stop_explaining: 'B',
  personal_controller_week2_friend_says_you_do_not_believe_me: 'B',
  job_controller_week2_periodization_or_polishing: 'B',
  personal_controller_week2_auditing_own_words: 'B',
  job_controller_week2_audit_trail: 'B',
  personal_controller_week2_conversation_without_evidence: 'B',
  job_controller_week2_numbers_as_governance: 'B',
  personal_controller_week2_weekend_without_audit_trail: 'C'
};

const HARD_CONTROL_CHOICES = {
  job_controller_week1_month_report_before_explanation: 'A',
  personal_controller_week1_counting_at_home: 'B',
  job_controller_week1_reconciliation_almost_matches: 'A',
  personal_controller_week1_friend_not_controlled: 'B',
  job_controller_week1_operations_explains_variance: 'C',
  personal_controller_week1_pattern_in_conversation: 'B',
  job_controller_week1_forecast_everyone_wants_certain: 'C',
  personal_controller_week1_dinner_as_spreadsheet: 'B',
  job_controller_week1_numbers_as_responsibility: 'C',
  personal_controller_week1_weekend_without_variance: 'B',
  job_controller_week2_variance_did_not_disappear: 'B',
  personal_controller_week2_documenting_a_feeling: 'B',
  job_controller_week2_operations_stop_explaining: 'B',
  personal_controller_week2_friend_says_you_do_not_believe_me: 'B',
  job_controller_week2_periodization_or_polishing: 'A',
  personal_controller_week2_auditing_own_words: 'B',
  job_controller_week2_audit_trail: 'C',
  personal_controller_week2_conversation_without_evidence: 'B',
  job_controller_week2_numbers_as_governance: 'C',
  personal_controller_week2_weekend_without_audit_trail: 'C'
};

const DRIFT_TRUST_CHOICES = {
  job_controller_week1_month_report_before_explanation: 'A',
  personal_controller_week1_counting_at_home: 'A',
  job_controller_week1_reconciliation_almost_matches: 'A',
  personal_controller_week1_friend_not_controlled: 'A',
  job_controller_week1_operations_explains_variance: 'A',
  personal_controller_week1_pattern_in_conversation: 'A',
  job_controller_week1_forecast_everyone_wants_certain: 'A',
  personal_controller_week1_dinner_as_spreadsheet: 'A',
  job_controller_week1_numbers_as_responsibility: 'A',
  personal_controller_week1_weekend_without_variance: 'A',
  job_controller_week2_variance_did_not_disappear: 'A',
  personal_controller_week2_documenting_a_feeling: 'A',
  job_controller_week2_operations_stop_explaining: 'A',
  personal_controller_week2_friend_says_you_do_not_believe_me: 'A',
  job_controller_week2_periodization_or_polishing: 'A',
  personal_controller_week2_auditing_own_words: 'A',
  job_controller_week2_audit_trail: 'A',
  personal_controller_week2_conversation_without_evidence: 'A',
  job_controller_week2_numbers_as_governance: 'A',
  personal_controller_week2_weekend_without_audit_trail: 'A'
};

const CAVEAT_COLLECTOR_CHOICES = {
  job_controller_week1_month_report_before_explanation: 'C',
  personal_controller_week1_counting_at_home: 'C',
  job_controller_week1_reconciliation_almost_matches: 'A',
  personal_controller_week1_friend_not_controlled: 'C',
  job_controller_week1_operations_explains_variance: 'C',
  personal_controller_week1_pattern_in_conversation: 'C',
  job_controller_week1_forecast_everyone_wants_certain: 'B',
  personal_controller_week1_dinner_as_spreadsheet: 'C',
  job_controller_week1_numbers_as_responsibility: 'D',
  personal_controller_week1_weekend_without_variance: 'C',
  job_controller_week2_variance_did_not_disappear: 'B',
  personal_controller_week2_documenting_a_feeling: 'C',
  job_controller_week2_operations_stop_explaining: 'C',
  personal_controller_week2_friend_says_you_do_not_believe_me: 'C',
  job_controller_week2_periodization_or_polishing: 'C',
  personal_controller_week2_auditing_own_words: 'C',
  job_controller_week2_audit_trail: 'C',
  personal_controller_week2_conversation_without_evidence: 'C',
  job_controller_week2_numbers_as_governance: 'D',
  personal_controller_week2_weekend_without_audit_trail: 'D'
};

const PRIVATE_BOUNDARY_CHOICES = {
  job_controller_week1_month_report_before_explanation: 'C',
  personal_controller_week1_counting_at_home: 'A',
  job_controller_week1_reconciliation_almost_matches: 'B',
  personal_controller_week1_friend_not_controlled: 'A',
  job_controller_week1_operations_explains_variance: 'B',
  personal_controller_week1_pattern_in_conversation: 'A',
  job_controller_week1_forecast_everyone_wants_certain: 'B',
  personal_controller_week1_dinner_as_spreadsheet: 'A',
  job_controller_week1_numbers_as_responsibility: 'B',
  personal_controller_week1_weekend_without_variance: 'A',
  job_controller_week2_variance_did_not_disappear: 'C',
  personal_controller_week2_documenting_a_feeling: 'A',
  job_controller_week2_operations_stop_explaining: 'C',
  personal_controller_week2_friend_says_you_do_not_believe_me: 'A',
  job_controller_week2_periodization_or_polishing: 'C',
  personal_controller_week2_auditing_own_words: 'A',
  job_controller_week2_audit_trail: 'B',
  personal_controller_week2_conversation_without_evidence: 'A',
  job_controller_week2_numbers_as_governance: 'B',
  personal_controller_week2_weekend_without_audit_trail: 'A'
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
  if (key === 'relationship_private') return (totals.relationship_private || 0) + (totals.relationship_sara || 0) + (totals.relationship_jonas || 0);
  if (key === 'stagnation') return (totals.stagnation || 0) + (totals.stagnation_private || 0);
  if (key === 'energy_weekend') return (totals.energy_weekend || 0) + (totals.energy || 0);
  return totals[key] || 0;
}

function assertChoiceShape(mail) {
  assert(Array.isArray(mail.choices) && mail.choices.length > 0, `${mail.id} should have choices`);
  for (const choice of mail.choices) {
    assert.strictEqual(typeof choice.reply, 'string', `${mail.id}/${choice.id} should have choices.reply`);
    assert(choice.reply.length > 0, `${mail.id}/${choice.id} choices.reply should not be empty`);
    assert(choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects), `${mail.id}/${choice.id} should have choices.effects object, even when empty`);
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

function assertControllerRuntimeEvent(event, context) {
  assert.strictEqual(event.role_scope, 'controller', `${context}: runtime event should stay scoped to controller`);
  assert(!/arbeider|fagarbeider|formann|mellomleder|avdelingsleder|ekspeditør|ekspeditor/i.test(event.id), `${context}: runtime event should not mix in another role id`);
  if (event.mail_family) {
    assert(/controller/i.test(event.mail_family), `${context}: runtime event should stay in a controller family`);
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
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  let autonomy = 50;
  global.CivicationPsyche = {
    getAutonomy: () => autonomy,
    setAutonomyOverride: (next) => { autonomy = Number(next); return autonomy; },
    updateIntegrity: () => null,
    updateVisibility: () => null,
    updateEconomicRoom: () => null,
    updateTrust: () => null,
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
    title: 'Controller',
    role_key: 'controller',
    role_id: 'naer_controller'
  });
  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;
  return { engine };
}

async function playStyle(name, choiceMap) {
  const { engine } = makeHarness();
  const plannedSeen = [];
  const threadSeen = [];
  const selectedFlags = new Set();
  const statTotals = {};

  const initialCandidates = await global.CivicationMailRuntime.debugCandidates();
  assert.strictEqual(initialCandidates[0]?.id, EXPECTED_FLOW[0].id, `${name}: controller week 1 candidates should start at step 1`);

  for (const expected of EXPECTED_FLOW) {
    if (!pendingEvent()) {
      const opened = await engine.onAppOpen({ force: true });
      assert.strictEqual(opened.enqueued, true, `${name}: opening app should enqueue ${expected.id}: ${JSON.stringify(opened)}`);
    }

    const pending = pendingEvent();
    assert(pending, `${name}: pending planned mail missing before ${expected.id}`);
    assert.strictEqual(pending.id, expected.id, `${name}: runtime should present ${expected.id} in the two-week order`);
    assert.strictEqual(pending.mail_type, expected.type, `${name}: ${expected.id} should keep mail_type`);
    assertControllerRuntimeEvent(pending, `${name}: ${expected.id}`);
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
    flagsFor(choice).forEach(flag => selectedFlags.add(flag));
    for (const [key, value] of Object.entries(statsFor(choice))) {
      statTotals[key] = (statTotals[key] || 0) + Number(value || 0);
    }

    let result = await engine.answer(pending.id, choice.id);
    assert.notStrictEqual(result?.ok, false, `${name}: answering ${pending.id} should succeed`);
    assert(result.choice_director?.handler_results?.some(row => row.name === 'dayConsequences' && row.ok), `${name}: ${pending.id} should run dayConsequences`);

    const branchState = global.CivicationState.getMailBranchState();
    assert(flagsFor(choice).every(flag => branchState.flags.includes(flag)), `${name}: next_bias flags from ${pending.id}/${choice.id} should be written to branch state`);

    const thread = pendingEvent();
    assert(thread, `${name}: thread consequence missing after ${pending.id}`);
    assert.strictEqual(thread.id, choice.triggers_on_choice, `${name}: ${pending.id} should enqueue selected consequence thread`);
    assert.strictEqual(thread.source_type, 'thread', `${name}: ${thread.id} must use existing thread runtime`);
    assertControllerRuntimeEvent(thread, `${name}: ${thread.id}`);
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

  return { selectedFlags, statTotals };
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
    .map(mail => [mail.id, mail.title, mail.subject, ...(mail.situation || []), ...(mail.choices || []).flatMap(choice => [choice.label, choice.reply, ...flagsFor(choice)])].join(' '))
    .join(' ');
}

async function run() {
  const plan = readJson(PLAN_PATH);
  const firstTwentySteps = plan.sequence.slice(0, 20);
  assert.strictEqual(firstTwentySteps.length, 20, 'controller_plan should expose twenty package steps for week 1 + week 2');
  firstTwentySteps.forEach((step, index) => {
    const expected = EXPECTED_FLOW[index];
    assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep package ordering`);
    assert.strictEqual(step.type, expected.type, `step ${index + 1} should alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expected.family], `step ${index + 1} should point at the expected controller family`);
    assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should keep fallback out of package progression`);
  });
  assert(plan.sequence.length > 20, 'existing controller progression should still continue after the two package weeks');

  const registry = readJson(REGISTRY_PATH);
  const role = registry.roles.find(row => row.role_id === 'controller');
  assert(role, 'registry should include controller role');
  assert.strictEqual(role.plan_path, PLAN_PATH, 'controller registry should point at controller_plan');
  assert.strictEqual(role.job_family_path, JOB_FAMILY_PATH, 'controller registry should point at controller job family');
  assert.strictEqual(role.private_family_path, PEOPLE_FAMILY_PATH, 'controller registry should point at controller people family');
  assert.deepStrictEqual(role.flow_tests, [TWO_WEEK_TEST], 'controller.flow_tests should point at the two-week flow test');
  const weekOnePackage = packageById(role, 'controller_week_1');
  const weekTwoPackage = packageById(role, 'controller_week_2');
  assert.deepStrictEqual({ start: weekOnePackage.step_start, end: weekOnePackage.step_end, job: weekOnePackage.job_family, private: weekOnePackage.private_family }, { start: 1, end: 10, job: FIRST_WEEK_JOB, private: FIRST_WEEK_PRIVATE }, 'controller_week_1 should stay registered as steps 1-10');
  assert.deepStrictEqual({ start: weekTwoPackage.step_start, end: weekTwoPackage.step_end, job: weekTwoPackage.job_family, private: weekTwoPackage.private_family }, { start: 11, end: 20, job: SECOND_WEEK_JOB, private: SECOND_WEEK_PRIVATE }, 'controller_week_2 should stay registered as steps 11-20');

  const jobCatalog = readJson(JOB_FAMILY_PATH);
  for (const legacyFamilyId of ['avstemming_og_rapport', 'prognose_og_budsjett']) {
    const legacy = jobCatalog.families.find(family => family.id === legacyFamilyId);
    assert(legacy, `${legacyFamilyId} should remain in controller_job.json`);
    assert(Array.isArray(legacy.mails) && legacy.mails.length > 0, `${legacyFamilyId} should not have empty mails`);
    assert(legacy.mails.some(mail => mail && (mail.subject || mail.title || Array.isArray(mail.situation))), `${legacyFamilyId} should still have mail content`);
  }

  const familiesById = packageFamilies();
  for (const familyId of [FIRST_WEEK_JOB, FIRST_WEEK_PRIVATE, SECOND_WEEK_JOB, SECOND_WEEK_PRIVATE]) {
    assert(familiesById[familyId], `${familyId} should exist beside legacy controller families`);
    assert.strictEqual(familiesById[familyId].mails.length, 5, `${familyId} should include five planned mails`);
  }

  const mails = allPackageMails(familiesById);
  const threads = allPackageThreads(familiesById);
  const mailsById = new Map(mails.map(mail => [mail.id, mail]));
  const threadIds = new Set(threads.map(thread => thread.id));
  assert.deepStrictEqual(EXPECTED_FLOW.map(row => row.id), EXPECTED_FLOW.map(row => mailsById.get(row.id)?.id), 'expected controller flow ids should exist in package families');

  for (const expected of EXPECTED_FLOW) {
    const mail = mailsById.get(expected.id);
    assert(mail, `${expected.id} should exist`);
    assert.strictEqual(mail.__familyId, expected.family, `${expected.id} should stay in ${expected.family}`);
    assert.strictEqual(mail.role_scope, 'controller', `${expected.id} should stay scoped to controller`);
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
  for (const signal of ['accuracy', 'trust_drift', 'trust_manager', 'deadline_met', 'deadline_pressure', 'traceability', 'process_quality', 'forecast_quality', 'decision_quality', 'report_quality', 'future_risk', 'conflict', 'stagnation', 'stress', 'control', 'manager_pressure', 'integrity', 'audit_readiness', 'report_smoothness', 'relationship_private', 'self_awareness', 'energy_weekend', 'autonomy_private']) {
    assert([...signalKeys].some(key => key === signal || key.includes(signal)), `controller flow should carry ${signal} as effect or branch signal`);
  }

  const week1Text = allTextForWeek(mails, 1).toLowerCase();
  const week2Text = allTextForWeek(mails, 2).toLowerCase();
  for (const pattern of [/varekost|variance|avvik/, /avstemming|reconciliation/, /drift|operations/, /prognose|forecast/, /tall.*ansvar|numbers.*responsibility/]) {
    assert(pattern.test(week1Text), `week one should establish ${pattern}`);
  }
  for (const pattern of [/avviket|variance/, /drift|operations/, /periodisering|periodization|resultatpynt|polishing/, /revisjonsspor|audit_trail|audit trail/, /tall.*styring|numbers.*governance/]) {
    assert(pattern.test(week2Text), `week two should continue ${pattern}`);
  }
  for (const pattern of [/telle|counting/, /kontrollert|controlled/, /mønster|pattern/, /regneark|spreadsheet/, /helgen uten avvik|weekend_without_variance/]) {
    assert(pattern.test(week1Text), `private week one should establish ${pattern}`);
  }
  for (const pattern of [/dokumentasjon|documenting/, /tror meg jo ikke|believe_me/, /kontrollere egne ord|auditing_own_words/, /bevisførsel|evidence/, /kontrollspor|audit_trail/]) {
    assert(pattern.test(week2Text), `private week two should continue ${pattern}`);
  }

  const precise = await playStyle('presis-talloversetter', PRECISE_TRANSLATOR_CHOICES);
  assert(statTotal(precise.statTotals, 'accuracy') > 0, 'precise translator should increase accuracy');
  assert(statTotal(precise.statTotals, 'trust_manager') > 0, 'precise translator should increase manager trust');
  assert(statTotal(precise.statTotals, 'trust_drift') > 0, 'precise translator should increase drift trust');
  assert(statTotal(precise.statTotals, 'decision_quality') > 0, 'precise translator should increase decision quality');
  assert(statTotal(precise.statTotals, 'report_quality') > 0, 'precise translator should increase report quality');
  assert(statTotal(precise.statTotals, 'audit_readiness') > 0, 'precise translator should increase audit readiness');
  assert(statTotal(precise.statTotals, 'stress') >= 0, 'precise translator can carry stress');
  assert(hasAny(precise.selectedFlags, [/explanation_before_report/, /trace_before_close/, /graded_explanation/, /scenario_forecast/, /targeted_followup/, /clean_audit_trail/, /precise_governance/]), 'precise translator should process precision branch flags');

  const fast = await playStyle('rask-rapport-controller', FAST_REPORT_CHOICES);
  assert(statTotal(fast.statTotals, 'deadline_met') > 0, 'fast report controller should increase deadline_met');
  assert(statTotal(fast.statTotals, 'manager_pressure') < 0, 'fast report controller should reduce short-term manager pressure');
  assert(statTotal(fast.statTotals, 'stagnation') > 0, 'fast report controller should increase stagnation');
  assert(statTotal(fast.statTotals, 'future_risk') > 0, 'fast report controller should increase future risk');
  assert(statTotal(fast.statTotals, 'report_quality') < 0, 'fast report controller should reduce report quality');
  assert(statTotal(fast.statTotals, 'trust_drift') < 0, 'fast report controller should reduce drift trust');
  assert(hasAny(fast.selectedFlags, [/fast_unexplained_report/, /materiality_shortcut/, /single_number_forecast/, /smooth_summary/, /variance_minimized/, /result_polishing/, /smooth_control/]), 'fast report controller should process shortcut/smoothing branch flags');

  const hard = await playStyle('hard-kontroll-controller', HARD_CONTROL_CHOICES);
  assert(statTotal(hard.statTotals, 'control') > 0, 'hard control controller should increase control');
  assert(statTotal(hard.statTotals, 'accuracy') > 0, 'hard control controller can increase accuracy');
  assert(statTotal(hard.statTotals, 'conflict') > 0, 'hard control controller should increase conflict');
  assert(statTotal(hard.statTotals, 'trust_drift') < 0, 'hard control controller should reduce drift trust');
  assert(statTotal(hard.statTotals, 'stress') > 0, 'hard control controller should increase stress');
  assert(statTotal(hard.statTotals, 'audit_readiness') > 0, 'hard control controller can increase audit readiness');
  assert(statTotal(hard.statTotals, 'decision_quality') < statTotal(precise.statTotals, 'decision_quality'), 'hard control controller can weaken decision quality when people stop explaining');
  assert(hasAny(hard.selectedFlags, [/hard_documentation/, /hard_control_summary/, /broad_control_request/, /documentation_gate/, /hard_control_line/]), 'hard control controller should process hard-control branch flags');

  const driftTrust = await playStyle('driftstillitsbygger', DRIFT_TRUST_CHOICES);
  assert(statTotal(driftTrust.statTotals, 'trust_drift') > 0, 'drift trust builder should increase drift trust');
  assert(statTotal(driftTrust.statTotals, 'accuracy') > 0, 'drift trust builder should increase accuracy');
  assert(statTotal(driftTrust.statTotals, 'process_quality') > 0, 'drift trust builder should increase process quality');
  assert(statTotal(driftTrust.statTotals, 'report_quality') > 0, 'drift trust builder should increase report quality');
  assert(statTotal(driftTrust.statTotals, 'conflict') < statTotal(hard.statTotals, 'conflict'), 'drift trust builder should keep conflict below hard control');
  assert(statTotal(driftTrust.statTotals, 'decision_quality') > 0, 'drift trust builder should increase decision quality');
  assert(hasAny(driftTrust.selectedFlags, [/explanation_before_report/, /graded_explanation/, /explanation_levels/, /targeted_followup/]), 'drift trust builder should process explanation/trust branch flags');

  const caveat = await playStyle('forbeholdssamler', CAVEAT_COLLECTOR_CHOICES);
  assert(statTotal(caveat.statTotals, 'accuracy') > 0, 'caveat collector can increase accuracy somewhat');
  assert(statTotal(caveat.statTotals, 'manager_pressure') > 0, 'caveat collector should increase manager pressure');
  assert(statTotal(caveat.statTotals, 'decision_quality') < 0, 'caveat collector should reduce decision quality');
  assert(statTotal(caveat.statTotals, 'stagnation') > 0, 'caveat collector should increase stagnation');
  assert(statTotal(caveat.statTotals, 'stress') > 0, 'caveat collector should increase stress');
  assert(hasAny(caveat.selectedFlags, [/report_with_caveat/, /needs_more_evidence/, /avoids_periodization_recommendation/, /overdocumented/, /caveat_collector/]), 'caveat collector should process caveat/open-recommendation branch flags');

  const privateBoundary = await playStyle('privat-grensesetter', PRIVATE_BOUNDARY_CHOICES);
  assert(statTotal(privateBoundary.statTotals, 'relationship_private') > 0, 'private boundary setter should increase private relationships');
  assert(statTotal(privateBoundary.statTotals, 'self_awareness') > 0, 'private boundary setter should increase self awareness');
  assert(statTotal(privateBoundary.statTotals, 'energy_weekend') > 0, 'private boundary setter should increase weekend energy');
  assert(statTotal(privateBoundary.statTotals, 'stress') < 0, 'private boundary setter should reduce stress');
  assert(statTotal(privateBoundary.statTotals, 'autonomy_private') > 0, 'private boundary setter should increase private autonomy');
  assert(statTotal(privateBoundary.statTotals, 'control') < 0, 'private boundary setter should lower private control');
  assert(hasAny(privateBoundary.selectedFlags, [/private_week1_counting_A/, /private_week1_friend_A/, /private_week1_pattern_A/, /private_week1_weekend_A/, /private_feeling_A/, /private_conversation_A/, /private_weekend_A/]), 'private boundary setter should process private boundary branch flags');

  console.log('civication controller two-week praksisfortellinger flow ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
