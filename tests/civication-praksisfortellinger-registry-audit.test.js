#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const registryPath = path.join(repoRoot, 'data/Civication/praksisfortellinger_registry.json');

function readJson(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  assert(fs.existsSync(fullPath), `${relPath} should exist`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function assertUnique(value, seen, label) {
  assert(value, `${label} should be present`);
  assert(!seen.has(value), `${label} should be unique: ${value}`);
  seen.add(value);
}

function findFamily(catalog, familyId, catalogPath) {
  assert(Array.isArray(catalog.families), `${catalogPath} should expose families[]`);
  const family = catalog.families.find(item => item && item.id === familyId);
  assert(family, `${familyId} should exist in ${catalogPath}`);
  return family;
}

function collectChoiceSignals(choice) {
  const signals = new Set();
  function visit(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    for (const [key, nested] of Object.entries(value)) {
      if (typeof nested === 'number') signals.add(key);
      else if (nested && typeof nested === 'object') visit(nested);
    }
  }
  if (choice && choice.effects && typeof choice.effects === 'object') visit(choice.effects);
  for (const flag of choice?.next_bias?.set_flags || []) signals.add(flag);

  // Existing packages use a mix of stat keys and branch flags. Keep the audit
  // generic, but normalize common branch-flag wording into registry signals.
  for (const signal of [...signals]) {
    if (signal.includes('quality')) signals.add('quality');
    if (signal.includes('clarity')) signals.add('clarity');
    if (signal.includes('manager_trust')) signals.add('trust_manager');
    if (signal.includes('colleague_trust')) signals.add('trust_colleague');
    if (signal.includes('autonomy')) signals.add('autonomy');
    if (signal.includes('stagnation')) signals.add('stagnation');
    if (signal.includes('future_risk')) signals.add('future_risk');
    if (signal.includes('promotion_path')) signals.add('promotion_path');
    if (signal.includes('overload_risk')) signals.add('overload_risk');
    if (signal.includes('body_strain')) signals.add('body_strain');
    if (signal.startsWith('energy')) signals.add('energy');
    if (signal.includes('learning_progress')) signals.add('learning_progress');
  }
  if (signals.has('trust')) {
    signals.add('trust_manager');
    signals.add('trust_colleague');
  }
  return signals;
}

function assertChannelShape(mail, expected, label) {
  assert.strictEqual(mail.mail_type, expected.mailType, `${label} should use ${expected.mailType} mail_type`);
  assert.strictEqual(mail.channel, expected.channel, `${label} should use ${expected.channel} channel`);
  assert.strictEqual(mail.messageChannel, expected.channel, `${label} should use ${expected.channel} messageChannel`);
  assert.strictEqual(mail.mail_class, expected.mailClass, `${label} should use ${expected.mailClass}`);
}

function assertChoiceIdsAreLocal(mail) {
  const choiceIds = new Set();
  for (const choice of mail.choices || []) {
    assert(choice.id, `${mail.id} choice should have id`);
    assert(!choiceIds.has(choice.id), `${mail.id} should not duplicate local choice id ${choice.id}`);
    choiceIds.add(choice.id);
  }
}

function assertMainMail(mail, expected, consequenceIds) {
  assert.strictEqual(mail.mail_family, expected.familyId, `${mail.id} should stay in ${expected.familyId}`);
  if (mail.role_scope) assert.strictEqual(mail.role_scope, expected.roleId, `${mail.id} should stay scoped to ${expected.roleId}`);
  assertChannelShape(mail, expected, mail.id);
  assert(Array.isArray(mail.situation), `${mail.id} should expose a situation array`);
  assert(mail.situation.length >= expected.minSituation, `${mail.id} should have a long multi-message situation array`);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should expose choices`);
  assertChoiceIdsAreLocal(mail);

  for (const choice of mail.choices) {
    assert.strictEqual(typeof choice.reply, 'string', `${mail.id} choice ${choice.id} should have reply`);
    assert(choice.reply.trim().length > 0, `${mail.id} choice ${choice.id} reply should not be empty`);
    assert(choice.effects && typeof choice.effects === 'object', `${mail.id} choice ${choice.id} should have effects`);
    if (choice.triggers_on_choice) {
      assert(consequenceIds.has(choice.triggers_on_choice), `${mail.id} choice ${choice.id} should point to an existing consequence thread: ${choice.triggers_on_choice}`);
    }
  }
}

function assertConsequenceThread(thread, expected) {
  assert.strictEqual(thread.mail_family, expected.familyId, `${thread.id} should stay in ${expected.familyId}`);
  if (thread.role_scope) assert.strictEqual(thread.role_scope, expected.roleId, `${thread.id} should stay scoped to ${expected.roleId}`);
  assertChannelShape(thread, expected, thread.id);
}

function packageStepCount(pkg) {
  return pkg.step_end - pkg.step_start + 1;
}

assert(fs.existsSync(registryPath), 'data/Civication/praksisfortellinger_registry.json should exist');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
assert(registry.version, 'registry should declare version');
assert(Array.isArray(registry.roles), 'registry should expose roles[]');
assert(registry.roles.length > 0, 'registry should register at least one role');

const roleIds = new Set();
const packageIds = new Set();
const familyOwners = new Map();
const mainThreadOwners = new Map();
const consequenceThreadOwners = new Map();

for (const role of registry.roles) {
  assertUnique(role.role_id, roleIds, 'role_id');
  assert(role.domain, `${role.role_id} should declare domain`);
  assert(role.plan_path, `${role.role_id} should declare plan_path`);
  assert(role.job_family_path, `${role.role_id} should declare job_family_path`);
  assert(role.private_family_path, `${role.role_id} should declare private_family_path`);
  assert(Array.isArray(role.packages) && role.packages.length > 0, `${role.role_id} should declare packages[]`);
  assert(Array.isArray(role.flow_tests), `${role.role_id} should declare flow_tests[]`);

  const plan = readJson(role.plan_path);
  assert(Array.isArray(plan.sequence), `${role.plan_path} should expose sequence[]`);
  const jobCatalog = readJson(role.job_family_path);
  const privateCatalog = readJson(role.private_family_path);
  const roleSignals = new Set();

  for (const flowTest of role.flow_tests) {
    assert(fs.existsSync(path.join(repoRoot, flowTest)), `${role.role_id} flow test should exist: ${flowTest}`);
  }

  for (const pkg of role.packages) {
    assertUnique(pkg.package_id, packageIds, 'package_id');
    assert(Number.isInteger(pkg.week), `${pkg.package_id} should declare integer week`);
    assert(Number.isInteger(pkg.step_start), `${pkg.package_id} should declare integer step_start`);
    assert(Number.isInteger(pkg.step_end), `${pkg.package_id} should declare integer step_end`);
    assert(pkg.step_end >= pkg.step_start, `${pkg.package_id} should have a valid step range`);
    assert(pkg.job_family, `${pkg.package_id} should declare job_family`);
    assert(pkg.private_family, `${pkg.package_id} should declare private_family`);
    assert(fs.existsSync(path.join(repoRoot, pkg.test_file)), `${pkg.package_id} test file should exist: ${pkg.test_file}`);

    for (const familyId of [pkg.job_family, pkg.private_family]) {
      const previous = familyOwners.get(familyId);
      assert(!previous || previous === role.role_id, `${familyId} should not point to multiple roles (${previous}, ${role.role_id})`);
      familyOwners.set(familyId, role.role_id);
    }

    const steps = plan.sequence.slice(pkg.step_start - 1, pkg.step_end);
    assert.strictEqual(steps.length, packageStepCount(pkg), `${pkg.package_id} step count should match step_start-step_end`);
    assert.strictEqual(steps.length, 10, `${pkg.package_id} should contain ten package steps`);

    steps.forEach((step, index) => {
      const oneBasedStep = pkg.step_start + index;
      const expectedType = index % 2 === 0 ? 'job' : 'people';
      const expectedFamily = expectedType === 'job' ? pkg.job_family : pkg.private_family;
      if (Number.isInteger(step.step)) assert.strictEqual(step.step, oneBasedStep, `${pkg.package_id} step ${oneBasedStep} should keep one-based plan ordering`);
      assert.strictEqual(step.type, expectedType, `${pkg.package_id} step ${oneBasedStep} should alternate job/people`);
      assert(Array.isArray(step.allowed_families), `${pkg.package_id} step ${oneBasedStep} should declare allowed_families[]`);
      assert.deepStrictEqual(step.allowed_families, [expectedFamily], `${pkg.package_id} step ${oneBasedStep} should point at ${expectedFamily}`);
      assert(Array.isArray(step.fallback_types), `${pkg.package_id} step ${oneBasedStep} should declare fallback_types[]`);
      assert.deepStrictEqual(step.fallback_types, [], `${pkg.package_id} step ${oneBasedStep} should not use fallback as normal progression`);
    });

    const jobFamily = findFamily(jobCatalog, pkg.job_family, role.job_family_path);
    const privateFamily = findFamily(privateCatalog, pkg.private_family, role.private_family_path);
    assert.strictEqual((jobFamily.mails || []).length, pkg.expected_job_threads, `${pkg.package_id} should expose expected job main threads`);
    assert.strictEqual((privateFamily.mails || []).length, pkg.expected_private_threads, `${pkg.package_id} should expose expected private main threads`);

    const packageChoices = [];
    for (const [family, expected] of [
      [jobFamily, { roleId: role.role_id, familyId: pkg.job_family, mailType: 'job', channel: 'job', mailClass: 'job_message', minSituation: 3 }],
      [privateFamily, { roleId: role.role_id, familyId: pkg.private_family, mailType: 'people', channel: 'private', mailClass: 'private_message', minSituation: 2 }]
    ]) {
      const consequenceIds = new Set((family.threads || []).map(thread => thread.id));
      for (const mail of family.mails || []) {
        const previous = mainThreadOwners.get(mail.id);
        assert(!previous, `${mail.id} should not collide as a main mail/thread across registered roles (already in ${previous})`);
        mainThreadOwners.set(mail.id, `${role.role_id}/${pkg.package_id}`);
        assertMainMail(mail, expected, consequenceIds);
        packageChoices.push(...mail.choices);
        for (const choice of mail.choices) collectChoiceSignals(choice).forEach(key => roleSignals.add(key));
      }
      for (const thread of family.threads || []) {
        const previous = consequenceThreadOwners.get(thread.id);
        assert(!previous, `${thread.id} should not collide as a consequence thread across registered roles (already in ${previous})`);
        consequenceThreadOwners.set(thread.id, `${role.role_id}/${pkg.package_id}`);
        assertConsequenceThread(thread, expected);
      }
    }

    assert(packageChoices.some(choice => choice.triggers_on_choice), `${pkg.package_id} should have at least one choice with triggers_on_choice`);
    assert(packageChoices.some(choice => choice.next_bias), `${pkg.package_id} should have at least one choice with next_bias`);
  }

  assert(Array.isArray(role.expected_signals) && role.expected_signals.length > 0, `${role.role_id} should declare expected_signals[]`);
  for (const signal of role.expected_signals) {
    assert(roleSignals.has(signal), `${role.role_id} Praksisfortellinger choices should include expected effect signal: ${signal}`);
  }
}

assert(Array.isArray(registry.cross_role_tests), 'registry should expose cross_role_tests[]');
for (const testFile of registry.cross_role_tests) {
  assert(fs.existsSync(path.join(repoRoot, testFile)), `cross-role test should exist: ${testFile}`);
}

console.log('Civication Praksisfortellinger registry audit OK');
