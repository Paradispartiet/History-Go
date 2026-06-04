#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/formann_plan.json';
const JOB_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/job/formann_job.json';
const PEOPLE_FAMILY_PATH = 'data/Civication/mailFamilies/naeringsliv/people/formann_people.json';
const REGISTRY_PATH = 'data/Civication/praksisfortellinger_registry.json';

const FIRST_WEEK_JOB = 'first_week_praksisfortellinger_formann_job';
const FIRST_WEEK_PRIVATE = 'first_week_praksisfortellinger_formann_private';
const SECOND_WEEK_JOB = 'second_week_praksisfortellinger_formann_job';
const SECOND_WEEK_PRIVATE = 'second_week_praksisfortellinger_formann_private';

const EXPECTED_FLOW = [
  { id: 'job_formann_week1_first_shift_board', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_formann_week1_role_home', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_formann_week1_strong_gets_more', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_formann_week1_friend_power', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_formann_week1_speed_vs_safety', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_formann_week1_dinner_as_shift', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_formann_week1_team_conflict', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 4 },
  { id: 'personal_formann_week1_answering_like_formann', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_formann_week1_first_week_responsibility', type: 'job', channel: 'job', family: FIRST_WEEK_JOB, week: 1, minSituation: 3 },
  { id: 'personal_formann_week1_weekend_without_board', type: 'people', channel: 'private', family: FIRST_WEEK_PRIVATE, week: 1, minSituation: 3 },
  { id: 'job_formann_week2_mandate_tested', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_formann_week2_monday_responsibility_body', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_formann_week2_constant_protester', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_formann_week2_friend_wants_decision', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_formann_week2_management_wants_speed', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_formann_week2_answers_like_team', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_formann_week2_near_miss', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_formann_week2_sleep_after_near_miss', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_formann_week2_who_follows_when_costly', type: 'job', channel: 'job', family: SECOND_WEEK_JOB, week: 2, minSituation: 4 },
  { id: 'personal_formann_week2_weekend_not_responsible', type: 'people', channel: 'private', family: SECOND_WEEK_PRIVATE, week: 2, minSituation: 3 }
];

const FAIR_FLOOR_LEADER_CHOICES = {
  job_formann_week1_first_shift_board: 'A',
  personal_formann_week1_role_home: 'B',
  job_formann_week1_strong_gets_more: 'C',
  personal_formann_week1_friend_power: 'A',
  job_formann_week1_speed_vs_safety: 'A',
  personal_formann_week1_dinner_as_shift: 'A',
  job_formann_week1_team_conflict: 'B',
  personal_formann_week1_answering_like_formann: 'A',
  job_formann_week1_first_week_responsibility: 'A',
  personal_formann_week1_weekend_without_board: 'B',
  job_formann_week2_mandate_tested: 'A',
  personal_formann_week2_monday_responsibility_body: 'A',
  job_formann_week2_constant_protester: 'A',
  personal_formann_week2_friend_wants_decision: 'A',
  job_formann_week2_management_wants_speed: 'A',
  personal_formann_week2_answers_like_team: 'A',
  job_formann_week2_near_miss: 'A',
  personal_formann_week2_sleep_after_near_miss: 'A',
  job_formann_week2_who_follows_when_costly: 'A',
  personal_formann_week2_weekend_not_responsible: 'B'
};

const TEMPO_FIRST_CHOICES = {
  job_formann_week1_first_shift_board: 'B',
  personal_formann_week1_role_home: 'A',
  job_formann_week1_strong_gets_more: 'B',
  personal_formann_week1_friend_power: 'B',
  job_formann_week1_speed_vs_safety: 'B',
  personal_formann_week1_dinner_as_shift: 'B',
  job_formann_week1_team_conflict: 'C',
  personal_formann_week1_answering_like_formann: 'B',
  job_formann_week1_first_week_responsibility: 'B',
  personal_formann_week1_weekend_without_board: 'C',
  job_formann_week2_mandate_tested: 'C',
  personal_formann_week2_monday_responsibility_body: 'B',
  job_formann_week2_constant_protester: 'B',
  personal_formann_week2_friend_wants_decision: 'A',
  job_formann_week2_management_wants_speed: 'B',
  personal_formann_week2_answers_like_team: 'B',
  job_formann_week2_near_miss: 'B',
  personal_formann_week2_sleep_after_near_miss: 'B',
  job_formann_week2_who_follows_when_costly: 'B',
  personal_formann_week2_weekend_not_responsible: 'C'
};

const SOFT_MANDATE_CHOICES = {
  job_formann_week1_first_shift_board: 'C',
  personal_formann_week1_role_home: 'C',
  job_formann_week1_strong_gets_more: 'C',
  personal_formann_week1_friend_power: 'C',
  job_formann_week1_speed_vs_safety: 'C',
  personal_formann_week1_dinner_as_shift: 'C',
  job_formann_week1_team_conflict: 'A',
  personal_formann_week1_answering_like_formann: 'C',
  job_formann_week1_first_week_responsibility: 'B',
  personal_formann_week1_weekend_without_board: 'D',
  job_formann_week2_mandate_tested: 'B',
  personal_formann_week2_monday_responsibility_body: 'C',
  job_formann_week2_constant_protester: 'C',
  personal_formann_week2_friend_wants_decision: 'C',
  job_formann_week2_management_wants_speed: 'A',
  personal_formann_week2_answers_like_team: 'C',
  job_formann_week2_near_miss: 'B',
  personal_formann_week2_sleep_after_near_miss: 'B',
  job_formann_week2_who_follows_when_costly: 'C',
  personal_formann_week2_weekend_not_responsible: 'D'
};

const HARD_AUTHORITY_CHOICES = {
  job_formann_week1_first_shift_board: 'B',
  personal_formann_week1_role_home: 'A',
  job_formann_week1_strong_gets_more: 'B',
  personal_formann_week1_friend_power: 'B',
  job_formann_week1_speed_vs_safety: 'B',
  personal_formann_week1_dinner_as_shift: 'B',
  job_formann_week1_team_conflict: 'C',
  personal_formann_week1_answering_like_formann: 'B',
  job_formann_week1_first_week_responsibility: 'D',
  personal_formann_week1_weekend_without_board: 'C',
  job_formann_week2_mandate_tested: 'C',
  personal_formann_week2_monday_responsibility_body: 'B',
  job_formann_week2_constant_protester: 'B',
  personal_formann_week2_friend_wants_decision: 'A',
  job_formann_week2_management_wants_speed: 'B',
  personal_formann_week2_answers_like_team: 'B',
  job_formann_week2_near_miss: 'C',
  personal_formann_week2_sleep_after_near_miss: 'B',
  job_formann_week2_who_follows_when_costly: 'B',
  personal_formann_week2_weekend_not_responsible: 'C'
};

const MANDATE_BUILDER_CHOICES = {
  job_formann_week1_first_shift_board: 'A',
  personal_formann_week1_role_home: 'B',
  job_formann_week1_strong_gets_more: 'A',
  personal_formann_week1_friend_power: 'A',
  job_formann_week1_speed_vs_safety: 'A',
  personal_formann_week1_dinner_as_shift: 'A',
  job_formann_week1_team_conflict: 'B',
  personal_formann_week1_answering_like_formann: 'A',
  job_formann_week1_first_week_responsibility: 'C',
  personal_formann_week1_weekend_without_board: 'C',
  job_formann_week2_mandate_tested: 'A',
  personal_formann_week2_monday_responsibility_body: 'A',
  job_formann_week2_constant_protester: 'A',
  personal_formann_week2_friend_wants_decision: 'B',
  job_formann_week2_management_wants_speed: 'C',
  personal_formann_week2_answers_like_team: 'A',
  job_formann_week2_near_miss: 'A',
  personal_formann_week2_sleep_after_near_miss: 'B',
  job_formann_week2_who_follows_when_costly: 'D',
  personal_formann_week2_weekend_not_responsible: 'C'
};

function readJson(relPath) {
  const filePath = path.join(repoRoot, relPath);
  assert(fs.existsSync(filePath), `${relPath} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
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
    assert.strictEqual(mail.mail_class, 'job_message', `${mail.id} should keep mail_class=job_message`);
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
    title: 'Formann',
    role_key: 'formann',
    role_id: 'naer_formann'
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
  assert.strictEqual(firstTwentySteps.length, 20, 'formann_plan should expose twenty package steps for week 1 + week 2');
  firstTwentySteps.forEach((step, index) => {
    const expected = EXPECTED_FLOW[index];
    assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep package ordering`);
    assert.strictEqual(step.type, expected.type, `step ${index + 1} should alternate job/people`);
    assert.deepStrictEqual(step.allowed_families, [expected.family], `step ${index + 1} should point at the expected formann family`);
    assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should keep fallback out of package progression`);
  });
  assert(plan.sequence.length > 20, 'existing formann progression should still continue after the two package weeks');

  const registry = readJson(REGISTRY_PATH);
  const formannRole = registry.roles.find(role => role.role_id === 'formann');
  assert(formannRole, 'registry should include formann role');
  assert.strictEqual(formannRole.plan_path, PLAN_PATH, 'formann registry should point at formann_plan');
  assert.strictEqual(formannRole.job_family_path, JOB_FAMILY_PATH, 'formann registry should point at formann job family');
  assert.strictEqual(formannRole.private_family_path, PEOPLE_FAMILY_PATH, 'formann registry should point at formann people family');
  const weekOnePackage = packageById(formannRole, 'formann_week_1');
  const weekTwoPackage = packageById(formannRole, 'formann_week_2');
  assert.deepStrictEqual({ start: weekOnePackage.step_start, end: weekOnePackage.step_end, job: weekOnePackage.job_family, private: weekOnePackage.private_family }, { start: 1, end: 10, job: FIRST_WEEK_JOB, private: FIRST_WEEK_PRIVATE }, 'formann_week_1 should stay registered as steps 1-10');
  assert.deepStrictEqual({ start: weekTwoPackage.step_start, end: weekTwoPackage.step_end, job: weekTwoPackage.job_family, private: weekTwoPackage.private_family }, { start: 11, end: 20, job: SECOND_WEEK_JOB, private: SECOND_WEEK_PRIVATE }, 'formann_week_2 should stay registered as steps 11-20');

  const familiesById = packageFamilies();
  for (const familyId of [FIRST_WEEK_JOB, FIRST_WEEK_PRIVATE, SECOND_WEEK_JOB, SECOND_WEEK_PRIVATE]) {
    assert(familiesById[familyId], `${familyId} should exist`);
    assert.strictEqual(familiesById[familyId].mails.length, 5, `${familyId} should include five planned mails`);
  }

  const mails = allPackageMails(familiesById);
  const threads = allPackageThreads(familiesById);
  const mailsById = new Map(mails.map(mail => [mail.id, mail]));
  const threadIds = new Set(threads.map(thread => thread.id));
  assert.deepStrictEqual(EXPECTED_FLOW.map(row => row.id), EXPECTED_FLOW.map(row => mailsById.get(row.id)?.id), 'expected formann flow ids should exist in package families');

  for (const expected of EXPECTED_FLOW) {
    const mail = mailsById.get(expected.id);
    assert(mail, `${expected.id} should exist`);
    assert.strictEqual(mail.__familyId, expected.family, `${expected.id} should stay in ${expected.family}`);
    assert.strictEqual(mail.role_scope, 'formann', `${expected.id} should stay scoped to formann`);
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
  for (const signal of ['team_trust', 'authority', 'safety', 'flow', 'speed', 'manager_pressure', 'future_risk', 'body_strain_team', 'conflict', 'clarity', 'fairness', 'stagnation', 'stress']) {
    assert([...signalKeys].some(key => key === signal || key.includes(signal)), `formann flow should carry ${signal} as effect or branch signal`);
  }
  assert([...signalKeys].some(key => key === 'relationship_private' || key === 'relationship_sara' || key === 'relationship_jonas' || key === 'energy' || key.includes('relationship_private')), 'formann flow should carry private relation or energy signals');

  const weekOneFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 1)).flatMap(flagsFor));
  const weekTwoFlags = new Set(choicesFor(mails.filter(mail => EXPECTED_FLOW.find(row => row.id === mail.id)?.week === 2)).flatMap(flagsFor));
  assert([...weekOneFlags].some(flag => /fair_distribution|speed_distribution|safety|conflict|authority|responsibility|body_strain_team/.test(flag)), 'week one branch labels should expose distribution, load, safety, conflict and first authority themes');
  assert([...weekTwoFlags].some(flag => /week2|mandate|protester|speed|near_miss|authority|manager_pressure|responsibility/.test(flag)), 'week two branch labels should expose mandate, resistance, management speed pressure, near-miss and costly authority themes');
  assert(/fordel|belast|sikker|konflikt|ansvar|autoritet/i.test(allTextForWeek(mails, 1)), 'week one text/id/title signals should establish distribution, load, safety, conflict or authority');
  assert(/mandat|motstand|tempo|nestenulykke|følger|ansvar/i.test(allTextForWeek(mails, 2)), 'week two text/id/title signals should continue mandate, resistance, pressure, near-miss or authority-cost themes');

  const senders = new Set(mails.map(mail => String(mail.from || '')));
  assert([...senders].some(sender => /formann|leder|drift|produksjon|simen|noor|arvid/i.test(sender)), 'flow should include work floor/leadership senders');
  assert(mails.some(mail => mail.channel === 'private'), 'flow should include private messages');
  assert(threads.length >= 20, 'flow should include consequence messages');

  const fairFloorLeader = await playStyle('rettferdig-gulvleder', FAIR_FLOOR_LEADER_CHOICES);
  assert(fairFloorLeader.statTotals.team_trust > 0, 'fair floor leader should increase team trust');
  assert(fairFloorLeader.statTotals.authority > 0, 'fair floor leader should increase authority');
  assert(fairFloorLeader.statTotals.fairness > 0, 'fair floor leader should increase fairness');
  assert(fairFloorLeader.statTotals.safety > 0, 'fair floor leader should increase safety');
  assert(fairFloorLeader.statTotals.clarity > 0, 'fair floor leader should increase clarity');
  assert((fairFloorLeader.statTotals.stress || 0) + (fairFloorLeader.statTotals.manager_pressure || 0) >= 0, 'fair floor leader may carry stress or management pressure');
  assert(hasAny(fairFloorLeader.selectedFlags, [/fair_distribution/, /private_check/, /listens_and_adjusts/, /balanced_authority/]), 'fair floor leader should process fair/listening/reporting branch flags');

  const tempoFirst = await playStyle('tempo-forst', TEMPO_FIRST_CHOICES);
  assert(tempoFirst.statTotals.speed > 0, 'tempo-first player should increase speed');
  assert(tempoFirst.statTotals.flow > 0, 'tempo-first player should increase flow');
  assert(tempoFirst.statTotals.future_risk > 0, 'tempo-first player should increase future risk');
  assert(tempoFirst.statTotals.body_strain_team > 0, 'tempo-first player should increase team body strain');
  assert((tempoFirst.statTotals.safety || 0) < (fairFloorLeader.statTotals.safety || 0), 'tempo-first player should weaken safety compared with fair floor leader');
  assert((tempoFirst.statTotals.team_trust || 0) < 0, 'tempo-first player should reduce team trust');
  assert(hasAny(tempoFirst.selectedFlags, [/speed_distribution/, /uses_strong/, /speed_over_team/, /near_miss_minimized/, /delivery_first/]), 'tempo-first player should process speed/delivery/risk branch flags');

  const softMandate = await playStyle('konfliktsky-mykt-mandat', SOFT_MANDATE_CHOICES);
  assert(softMandate.statTotals.stagnation > 0, 'soft mandate player should increase stagnation');
  assert(softMandate.statTotals.authority < 0, 'soft mandate player should reduce authority');
  assert(softMandate.statTotals.future_risk > 0, 'soft mandate player should increase future risk');
  assert((softMandate.statTotals.conflict || 0) <= 0, 'soft mandate player can keep visible conflict lower short-term');
  assert((softMandate.statTotals.team_trust || 0) < 5, 'soft mandate player should not incorrectly gain strong team trust');
  assert(hasAny(softMandate.selectedFlags, [/avoided_authority/, /soft_mandate/, /peace_over_fairness/, /smooth_surface/, /drift/]), 'soft mandate player should process avoidance/stagnation branch flags');

  const hardAuthority = await playStyle('hard-autoritet', HARD_AUTHORITY_CHOICES);
  assert(hardAuthority.statTotals.authority > 0, 'hard authority player can increase short-term authority');
  assert(hardAuthority.statTotals.conflict > 0, 'hard authority player should increase conflict');
  assert(hardAuthority.statTotals.team_trust < 0, 'hard authority player should reduce team trust');
  assert(hardAuthority.statTotals.future_risk > 0, 'hard authority player should increase future risk');
  assert(hardAuthority.statTotals.flow > 0, 'hard authority player can increase short-term flow');
  assert(hasAny(hardAuthority.selectedFlags, [/hard_authority/, /hard_mandate/, /rejects_complaint/, /blames_worker/, /blames_team/]), 'hard authority player should process hard-control branch flags');

  const mandateBuilder = await playStyle('mandatbygger', MANDATE_BUILDER_CHOICES);
  assert(mandateBuilder.statTotals.clarity > 0, 'mandate builder should increase clarity');
  assert(mandateBuilder.statTotals.authority > 0, 'mandate builder should increase authority');
  assert(mandateBuilder.statTotals.safety > 0, 'mandate builder should increase safety');
  assert(mandateBuilder.statTotals.manager_pressure > 0, 'mandate builder should increase management pressure');
  assert((mandateBuilder.statTotals.team_trust || 0) >= 0, 'mandate builder should keep team trust non-negative');
  assert((mandateBuilder.statTotals.stress || 0) >= 0, 'mandate builder can carry stress');
  assert(hasAny(mandateBuilder.selectedFlags, [/needs_mandate/, /defends_team/, /near_miss_handled/, /pushes_upward/, /private_processing/]), 'mandate builder should process mandate, structural and risk-reporting branch flags');

  console.log('civication formann two-week praksisfortellinger flow ok');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
