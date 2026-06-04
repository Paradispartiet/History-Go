#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

const ROLES = {
  arbeider: {
    active: {
      career_id: 'naeringsliv',
      title: 'Saksstøtte / mottak / fellesinnboks',
      role_key: 'arbeider',
      role_id: 'naer_arbeider'
    },
    planPath: 'data/Civication/mailPlans/naeringsliv/arbeider_plan.json',
    jobPath: 'data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json',
    peoplePath: 'data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json',
    packageSteps: 20,
    packageFamilies: [
      'first_week_praksisfortellinger_job',
      'first_week_praksisfortellinger_private',
      'second_week_praksisfortellinger_job',
      'second_week_praksisfortellinger_private'
    ],
    expectedStepFamilies: index => {
      const weekPrefix = index < 10 ? 'first_week' : 'second_week';
      return index % 2 === 0
        ? `${weekPrefix}_praksisfortellinger_job`
        : `${weekPrefix}_praksisfortellinger_private`;
    },
    expectedSignals: [
      'quality',
      'clarity',
      'trust_manager',
      'trust_colleague',
      'autonomy',
      'stagnation',
      'future_risk',
      'promotion_path',
      'overload_risk'
    ],
    forbiddenFamilyNeedles: ['fagarbeider']
  },
  fagarbeider: {
    active: {
      career_id: 'naeringsliv',
      title: 'Fagarbeider / drift / kvalitet',
      role_key: 'fagarbeider',
      role_id: 'naer_fagarbeider'
    },
    planPath: 'data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json',
    jobPath: 'data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json',
    peoplePath: 'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json',
    packageSteps: 10,
    packageFamilies: [
      'first_week_praksisfortellinger_fagarbeider_job',
      'first_week_praksisfortellinger_fagarbeider_private'
    ],
    expectedStepFamilies: index => index % 2 === 0
      ? 'first_week_praksisfortellinger_fagarbeider_job'
      : 'first_week_praksisfortellinger_fagarbeider_private',
    expectedSignals: [
      'quality',
      'safety',
      'speed',
      'body_strain',
      'energy',
      'future_risk',
      'trust_colleague',
      'trust_manager',
      'stagnation'
    ],
    forbiddenFamilyNeedles: ['arbeider']
  
  },
  formann: {
    active: {
      career_id: 'naeringsliv',
      title: 'Formann / praktisk arbeidsleder / gulvansvarlig',
      role_key: 'formann',
      role_id: 'naer_formann'
    },
    planPath: 'data/Civication/mailPlans/naeringsliv/formann_plan.json',
    jobPath: 'data/Civication/mailFamilies/naeringsliv/job/formann_job.json',
    peoplePath: 'data/Civication/mailFamilies/naeringsliv/people/formann_people.json',
    packageSteps: 10,
    packageFamilies: [
      'first_week_praksisfortellinger_formann_job',
      'first_week_praksisfortellinger_formann_private'
    ],
    expectedStepFamilies: index => index % 2 === 0
      ? 'first_week_praksisfortellinger_formann_job'
      : 'first_week_praksisfortellinger_formann_private',
    expectedSignals: [
      'team_trust',
      'authority',
      'safety',
      'flow',
      'speed',
      'manager_pressure',
      'future_risk',
      'body_strain_team',
      'conflict',
      'clarity',
      'stagnation'
    ],
    forbiddenFamilyNeedles: ['arbeider', 'fagarbeider']

  }
};

function readJson(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  assert(fs.existsSync(fullPath), `${relPath} should exist`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
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

function familiesFor(role) {
  const config = ROLES[role];
  const jobCatalog = readJson(config.jobPath);
  const peopleCatalog = readJson(config.peoplePath);
  const all = [...jobCatalog.families, ...peopleCatalog.families];
  return Object.fromEntries(all.filter(family => config.packageFamilies.includes(family.id)).map(family => [family.id, family]));
}

function allPackageMails(role) {
  return Object.values(familiesFor(role)).flatMap(family => (family.mails || []).map(mail => ({ ...mail, __familyId: family.id })));
}

function allPackageThreads(role) {
  return Object.values(familiesFor(role)).flatMap(family => (family.threads || []).map(thread => ({ ...thread, __familyId: family.id })));
}

function allPackageChoices(role) {
  return allPackageMails(role).flatMap(mail => (mail.choices || []).map(choice => ({ ...choice, __mail: mail })));
}

function channelExpectation(familyId) {
  return familyId.includes('_job') ? {
    mailType: 'job',
    channel: 'job',
    mailClass: 'job_message',
    minSituation: 3
  } : {
    mailType: 'people',
    channel: 'private',
    mailClass: 'private_message',
    minSituation: 2
  };
}

function assertChannelShape(item, context) {
  const expected = channelExpectation(item.__familyId || item.mail_family || '');
  assert.strictEqual(item.mail_type, expected.mailType, `${context} ${item.id} should keep mail_type=${expected.mailType}`);
  assert.strictEqual(item.channel, expected.channel, `${context} ${item.id} should keep channel=${expected.channel}`);
  assert.strictEqual(item.messageChannel, expected.channel, `${context} ${item.id} should keep messageChannel=${expected.channel}`);
  assert.strictEqual(item.mail_class, expected.mailClass, `${context} ${item.id} should keep mail_class=${expected.mailClass}`);
}

function assertMailStructure(role) {
  const mails = allPackageMails(role);
  const threads = allPackageThreads(role);
  const threadsById = new Map(threads.map(thread => [thread.id, thread]));
  const choices = allPackageChoices(role);

  for (const mail of mails) {
    const expected = channelExpectation(mail.__familyId);
    assert.strictEqual(mail.role_scope, role, `${role}/${mail.id} should stay role-scoped`);
    assert.strictEqual(mail.mail_family, mail.__familyId, `${role}/${mail.id} should stay in its package family`);
    assertChannelShape(mail, role);
    assert(Array.isArray(mail.situation) && mail.situation.length >= expected.minSituation, `${role}/${mail.id} should use long multi-message situation`);
    assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${role}/${mail.id} should have choices`);

    // Existing Civication package schema uses local A/B/C choice ids per mail,
    // so the collision guard is scoped to each thread instead of rewriting all choices globally.
    const choiceIdsInMail = new Set();
    for (const choice of mail.choices) {
      assert(choice.id && !choiceIdsInMail.has(choice.id), `${role}/${mail.id} should not duplicate choice id ${choice.id} within the same mail`);
      choiceIdsInMail.add(choice.id);
      assert.strictEqual(typeof choice.reply, 'string', `${role}/${mail.id}/${choice.id} should have reply`);
      assert(choice.reply.trim().length > 0, `${role}/${mail.id}/${choice.id} reply should not be empty`);
      assert(choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects), `${role}/${mail.id}/${choice.id} should have effects object`);
    }
  }

  assert(choices.some(choice => choice.triggers_on_choice), `${role} should include at least one triggers_on_choice`);
  assert(choices.some(choice => choice.next_bias), `${role} should include at least one next_bias`);

  for (const choice of choices.filter(choice => choice.triggers_on_choice)) {
    const thread = threadsById.get(choice.triggers_on_choice);
    assert(thread, `${role}/${choice.__mail.id}/${choice.id} should point at existing consequence thread ${choice.triggers_on_choice}`);
    assertChannelShape(thread, `${role} consequence`);
  }
}

function collectSignalKeys(role) {
  const keys = new Set();
  for (const choice of allPackageChoices(role)) {
    const stats = choice.effects?.stats || choice.effects || {};
    for (const key of Object.keys(stats)) keys.add(key);
    for (const flag of choice.next_bias?.set_flags || []) keys.add(flag);
    for (const family of choice.next_bias?.prefer_families || []) keys.add(family);
    for (const type of choice.next_bias?.prefer_mail_types || []) keys.add(type);
  }
  return keys;
}

function assertSignal(role, signal, keys) {
  const signalParts = signal.split('_').filter(Boolean);
  const found = Array.from(keys).some(key => {
    const value = String(key);
    return value === signal || value.includes(signal) || signal.includes(value) || signalParts.every(part => value.includes(part));
  });
  assert(found, `${role} should carry representative signal ${signal}`);
}

function assertPlansAndIsolation() {
  for (const [role, config] of Object.entries(ROLES)) {
    const plan = readJson(config.planPath);
    readJson(config.jobPath);
    readJson(config.peoplePath);

    const packageSteps = plan.sequence.slice(0, config.packageSteps);
    assert.strictEqual(packageSteps.length, config.packageSteps, `${role} should have expected Praksisfortellinger package steps`);

    packageSteps.forEach((step, index) => {
      const expectedType = index % 2 === 0 ? 'job' : 'people';
      assert.strictEqual(step.step, index + 1, `${role} package step ${index + 1} should keep package ordering`);
      assert.strictEqual(step.type, expectedType, `${role} package step ${index + 1} should alternate job/people`);
      assert.deepStrictEqual(step.allowed_families, [config.expectedStepFamilies(index)], `${role} package step ${index + 1} should point at its role family`);
      assert.deepStrictEqual(step.fallback_types, [], `${role} package step ${index + 1} should not use fallback as package progression`);
    });

    assert(plan.sequence.length > config.packageSteps, `${role} should keep non-package intro/progression steps after the package`);
    assert(plan.sequence.slice(config.packageSteps).some(step => (step.allowed_families || []).length > 0), `${role} should retain later progression families after the package`);

    const allAllowed = plan.sequence.flatMap(step => step.allowed_families || []);
    const packageAllowed = allAllowed.slice(0, config.packageSteps);
    assert(packageAllowed.some(family => String(family).includes('praksisfortellinger')), `${role} plan should have Praksisfortellinger steps`);
    for (const family of allAllowed) {
      for (const needle of config.forbiddenFamilyNeedles) {
        const familyId = String(family);
        const forbidden = needle === 'arbeider'
          ? (/^arbeider(?:_|$)/.test(familyId) || familyId === 'first_week_praksisfortellinger_job' || familyId === 'first_week_praksisfortellinger_private' || familyId === 'second_week_praksisfortellinger_job' || familyId === 'second_week_praksisfortellinger_private')
          : familyId.includes(needle);
        assert(!forbidden, `${role} plan should not point at ${needle} family ${family}`);
      }
    }
  }

  const seenFamilies = new Map();
  const seenMailIds = new Map();
  const seenThreadIds = new Map();
  for (const role of Object.keys(ROLES)) {
    for (const familyId of ROLES[role].packageFamilies) {
      assert(!seenFamilies.has(familyId), `${familyId} should not collide with ${seenFamilies.get(familyId)} package family ids`);
      seenFamilies.set(familyId, role);
    }
    for (const mail of allPackageMails(role)) {
      assert(!seenMailIds.has(mail.id), `mail id ${mail.id} should not collide across roles (${seenMailIds.get(mail.id)}, ${role})`);
      seenMailIds.set(mail.id, role);
    }
    for (const thread of allPackageThreads(role)) {
      assert(!seenThreadIds.has(thread.id), `consequence thread id ${thread.id} should not collide across roles (${seenThreadIds.get(thread.id)}, ${role})`);
      seenThreadIds.set(thread.id, role);
    }
  }
}


function includesOtherRoleFamily(mailFamily, otherRole) {
  const family = String(mailFamily || '');
  if (otherRole === 'arbeider') {
    return /^arbeider(?:_|$)/.test(family)
      || family === 'first_week_praksisfortellinger_job'
      || family === 'first_week_praksisfortellinger_private'
      || family === 'second_week_praksisfortellinger_job'
      || family === 'second_week_praksisfortellinger_private';
  }
  return family.includes(otherRole);
}

function makeHarness(active) {
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
  global.CivicationMailEngine = null;
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

  if (!global.CivicationEventEngine || !global.CivicationMailRuntime) {
    loadScript('js/Civication/core/civicationState.js');
    loadScript('js/Civication/core/civicationEventEngine.js');
    loadScript('js/Civication/systems/civicationEventChannels.js');
    loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
    loadScript('js/Civication/systems/day/dayChoiceDirector.js');
    loadScript('js/Civication/systems/day/dayConsequences.js');
    loadScript('js/Civication/systems/civicationMailRuntime.js');
  }

  global.CivicationState.setInbox([]);
  global.CivicationState.clearMailBranchState?.();
  global.CivicationState.setActivePosition(active);
  const engine = new global.CivicationEventEngine();
  global.CivicationState.setInbox([]);
  global.HG_CiviEngine = engine;
  return engine;
}

async function assertRuntimeRole(role) {
  const config = ROLES[role];
  const otherRoles = Object.keys(ROLES).filter(item => item !== role);
  const engine = makeHarness(config.active);
  const candidates = await global.CivicationMailRuntime.debugCandidates();
  assert(candidates.length > 0, `${role} candidates should be available through runtime`);
  assert(candidates.every(mail => mail.role_scope === role), `${role} candidates should stay scoped to ${role}`);
  for (const otherRole of otherRoles) {
    assert(candidates.every(mail => !includesOtherRoleFamily(mail.mail_family, otherRole)), `${role} candidates should not include ${otherRole} families`);
  }

  assert.strictEqual(pendingEvent(), null, `${role} harness should start without pending inbox items`);
  const opened = await engine.onAppOpen({ force: true });
  assert.strictEqual(opened.enqueued, true, `${role} onAppOpen should enqueue a planned candidate: ${JSON.stringify(opened)}`);
  const planned = pendingEvent();
  assert(planned, `${role} should have pending planned mail`);
  assert.strictEqual(planned.role_scope, role, `${role} planned mail should stay role-scoped`);
  assert(config.packageFamilies.includes(planned.mail_family), `${role} planned mail should come from its package family`);
  assert.strictEqual(global.CivicationEventChannels.getMessageChannel(planned), planned.channel, `${role} planned mail should classify into its explicit channel`);

  const choice = planned.choices.find(row => row.triggers_on_choice && row.next_bias?.set_flags?.length);
  assert(choice, `${role} planned mail should expose a choice with triggers_on_choice and next_bias`);
  const result = await engine.answer(planned.id, choice.id);
  assert.notStrictEqual(result?.ok, false, `${role} planned mail answer should process`);
  assert(result.choice_director?.handler_results?.some(row => row.name === 'dayConsequences' && row.ok), `${role} answer should process dayConsequences/next_bias`);

  const branchState = global.CivicationState.getMailBranchState();
  for (const flag of choice.next_bias.set_flags) {
    assert((branchState.flags || []).includes(flag), `${role} next_bias flag ${flag} should be stored`);
  }

  const thread = pendingEvent();
  assert(thread, `${role} should enqueue consequence thread`);
  assert.strictEqual(thread.id, choice.triggers_on_choice, `${role} should enqueue the selected consequence thread`);
  assert.strictEqual(thread.role_scope, role, `${role} consequence thread should stay role-scoped`);
  assert.strictEqual(thread.mail_family, planned.mail_family, `${role} consequence thread should stay in the selected role family`);
  assert.strictEqual(global.CivicationEventChannels.getMessageChannel(thread), planned.channel, `${role} consequence thread should stay in same inbox channel`);

  const threadResult = await engine.answer(thread.id, 'A');
  assert.notStrictEqual(threadResult?.ok, false, `${role} consequence thread answer should process`);
}

async function run() {
  const runtimeRoleArg = process.argv[2] === '--runtime-role' ? process.argv[3] : null;
  if (runtimeRoleArg) {
    await assertRuntimeRole(runtimeRoleArg);
    console.log(`${runtimeRoleArg} runtime compatibility OK`);
    return;
  }

  assertPlansAndIsolation();

  for (const role of Object.keys(ROLES)) {
    const families = familiesFor(role);
    for (const familyId of ROLES[role].packageFamilies) {
      assert(families[familyId], `${role} package family ${familyId} should exist`);
    }
    assertMailStructure(role);
    const signalKeys = collectSignalKeys(role);
    for (const signal of ROLES[role].expectedSignals) assertSignal(role, signal, signalKeys);
  }

  for (const role of Object.keys(ROLES)) {
    execFileSync(process.execPath, [__filename, '--runtime-role', role], { stdio: 'inherit' });
  }

  console.log('Civication Praksisfortellinger cross-role kontroll OK');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
