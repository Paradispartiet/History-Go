#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const rel = (...parts) => path.join(...parts);
const abs = (...parts) => path.join(repoRoot, ...parts);

const ROLE_SCOPE = 'lager_og_driftsmedarbeider';
const ROLE_ID = 'naer_lager_og_driftsmedarbeider';
const paths = {
  roleModel: rel('data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json'),
  role: rel('data/Civication/roles/naer_lager_og_driftsmedarbeider.json'),
  plan: rel('data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json'),
  jobFamily: rel('data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json'),
  peopleFamily: rel('data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json'),
  jobLearningProfiles: rel('data/Civication/jobLearningProfiles.json'),
  registry: rel('data/Civication/praksisfortellinger_registry.json')
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(abs(relativePath), 'utf8'));
}

function assertFile(relativePath) {
  assert(fs.existsSync(abs(relativePath)), `Expected file to exist: ${relativePath}`);
}

function familyIds(catalog) {
  assert(Array.isArray(catalog.families), 'catalog.families must be an array');
  return new Set(catalog.families.map((family) => family.id));
}

function assertMailCatalog(catalog, expectedType, expectedScope) {
  const requiredMailFields = [
    'id',
    'mail_type',
    'mail_family',
    'role_scope',
    'subject',
    'summary',
    'purpose',
    'stakes',
    'situation',
    'task_domain',
    'competency',
    'pressure',
    'choice_axis',
    'consequence_axis',
    'narrative_arc',
    'learning_focus',
    'choices'
  ];
  const requiredChoiceFields = ['id', 'label', 'effect', 'tags', 'feedback'];

  assert.strictEqual(catalog.role_scope, expectedScope, 'catalog role_scope should match the new role');
  assert.strictEqual(catalog.mail_type, expectedType, 'catalog mail_type should match its directory/type');
  assert(Array.isArray(catalog.families) && catalog.families.length > 0, 'catalog must contain families');

  for (const family of catalog.families) {
    assert(family.id, 'family.id is required');
    assert(Array.isArray(family.mails) && family.mails.length > 0, `family ${family.id} must contain mails`);
    for (const mail of family.mails) {
      for (const field of requiredMailFields) {
        assert(mail[field] !== undefined && mail[field] !== '', `mail ${mail.id || '<missing id>'} missing ${field}`);
      }
      assert.strictEqual(mail.mail_type, expectedType, `${mail.id} mail_type mismatch`);
      assert.strictEqual(mail.role_scope, expectedScope, `${mail.id} role_scope mismatch`);
      assert.strictEqual(mail.mail_family, family.id, `${mail.id} mail_family must match parent family`);
      assert(Array.isArray(mail.situation) && mail.situation.length > 0, `${mail.id} situation must be non-empty array`);
      assert(Array.isArray(mail.learning_focus) && mail.learning_focus.length > 0, `${mail.id} learning_focus must be non-empty array`);
      assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} must have at least two choices`);
      for (const choice of mail.choices) {
        for (const field of requiredChoiceFields) {
          assert(choice[field] !== undefined && choice[field] !== '', `${mail.id} choice missing ${field}`);
        }
        assert(Array.isArray(choice.tags), `${mail.id} choice ${choice.id} tags must be an array`);
        assert(String(choice.feedback).trim().length > 0, `${mail.id} choice ${choice.id} feedback must be non-empty`);
      }
    }
  }
}

for (const p of Object.values(paths)) assertFile(p);

const roleModel = readJson(paths.roleModel);
const role = readJson(paths.role);
const plan = readJson(paths.plan);
const jobFamily = readJson(paths.jobFamily);
const peopleFamily = readJson(paths.peopleFamily);
const profiles = readJson(paths.jobLearningProfiles);

assert.strictEqual(roleModel.role_scope, ROLE_SCOPE, 'roleModel should retain lager role_scope');
assert.strictEqual(roleModel.role_id, ROLE_ID, 'roleModel should point to the new playable role id');
assert.deepStrictEqual(
  roleModel.mail_integration.recommended_mail_families,
  ['mottak_og_vareflyt', 'plukk_pakk_og_avvik', 'lager_team_og_belastning'],
  'roleModel should recommend the new base mail families'
);

assert.strictEqual(role.role_id, ROLE_ID, 'role file should use the expected role_id');
assert.strictEqual(role.role_name, 'Lager- og driftsmedarbeider', 'role title should match the requested title');
assert(role.scenario_families.some((family) => family.family_id === 'mottak_og_vareflyt'), 'role should include mottak_og_vareflyt scenario family');
assert(role.scenario_families.some((family) => family.family_id === 'plukk_pakk_og_avvik'), 'role should include plukk_pakk_og_avvik scenario family');

assert.strictEqual(plan.role_scope, ROLE_SCOPE, 'mailPlan role_scope should match the new role');
assert.strictEqual(plan.sequence.length, 10, 'mailPlan should have exactly 10 base steps');
plan.sequence.forEach((step, index) => {
  assert.strictEqual(step.step, index + 1, `plan step ${index + 1} should be one-based and ordered`);
  assert(['job', 'people'].includes(step.type), `plan step ${step.step} type should be job or people`);
  assert(Array.isArray(step.allowed_families) && step.allowed_families.length > 0, `plan step ${step.step} must point to families`);
  assert.deepStrictEqual(step.fallback_types, [], `plan step ${step.step} should not use fallbacks in the base package`);
});

assertMailCatalog(jobFamily, 'job', ROLE_SCOPE);
assertMailCatalog(peopleFamily, 'people', ROLE_SCOPE);

const jobIds = familyIds(jobFamily);
const peopleIds = familyIds(peopleFamily);
assert(jobIds.has('mottak_og_vareflyt'), 'job families must include mottak_og_vareflyt');
assert(jobIds.has('plukk_pakk_og_avvik'), 'job families must include plukk_pakk_og_avvik');
assert(peopleIds.has('lager_team_og_belastning'), 'people families must include lager_team_og_belastning');

for (const step of plan.sequence) {
  const allowedIds = step.type === 'people' ? peopleIds : jobIds;
  for (const family of step.allowed_families) {
    assert(allowedIds.has(family), `plan step ${step.step} points to missing ${step.type} family ${family}`);
  }
}

assert(profiles.profiles[ROLE_ID], 'jobLearningProfiles should include a profile for the new role');
assert.strictEqual(profiles.profiles[ROLE_ID].learning_value, 'high', 'new profile should have high learning value');
assert.strictEqual(profiles.profiles[ROLE_ID].usefulness, 'high', 'new profile should have high usefulness');
assert.strictEqual(profiles.profiles[ROLE_ID].dead_end_risk, 'medium', 'new profile should have medium dead-end risk');
assert(Number.isFinite(profiles.profiles[ROLE_ID].mastery_threshold), 'new profile should set a numeric mastery_threshold');

const existingRoleFiles = [
  'naer_arbeider.json',
  'naer_fagarbeider.json',
  'naer_formann.json',
  'naer_mellomleder.json',
  'naer_avdelingsleder.json',
  'naer_controller.json',
  'naer_administrasjonsmedarbeider.json',
  'naer_ekspeditor.json'
];
for (const file of existingRoleFiles) {
  assertFile(rel('data/Civication/roles', file));
}

const registryRaw = fs.readFileSync(abs(paths.registry), 'utf8');
assert(!registryRaw.includes(ROLE_SCOPE), 'Praksisfortellinger registry should not register the new role yet');
assert(!registryRaw.includes(ROLE_ID), 'Praksisfortellinger registry should not register the new role id yet');

// Resolver and bridge lookup smoke test: the new badge title should no longer resolve to arbeider.
global.window = global;
global.CivicationEventEngine = function CivicationEventEngine() {};
global.CivicationMailRuntime = { inspect: () => ({ patched: false }) };
global.CivicationState = {
  state: {},
  getState() { return this.state; },
  setState(patch) { this.state = { ...this.state, ...patch }; return patch; }
};
global.fetch = async (relativePath) => {
  const filePath = abs(relativePath);
  return {
    ok: fs.existsSync(filePath),
    async json() { return readJson(relativePath); }
  };
};

function loadScript(relativePath) {
  const code = fs.readFileSync(abs(relativePath), 'utf8');
  vm.runInThisContext(code, { filename: relativePath });
}

loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
loadScript('js/Civication/mailPlanBridge.js');

const activePosition = {
  career_id: 'naeringsliv',
  role_id: ROLE_ID,
  role_key: ROLE_SCOPE,
  title: 'Lager- og driftsmedarbeider'
};
assert.strictEqual(global.CivicationCareerRoleResolver.resolveCareerRoleScope(activePosition), ROLE_SCOPE, 'career resolver should resolve the new role scope');
assert.strictEqual(global.CivicationCareerRoleResolver.resolveCareerRoleId(activePosition), ROLE_ID, 'career resolver should resolve the new role id');
assert.strictEqual(global.CiviMailPlanBridge.resolveRoleScope(activePosition), ROLE_SCOPE, 'mailPlanBridge should resolve the new role scope');
assert.strictEqual(global.CiviMailPlanBridge.getPlanPath(activePosition), paths.plan, 'mailPlanBridge should find the new plan');
assert.deepStrictEqual(global.CiviMailPlanBridge.getFamilyPaths(activePosition, 'job'), [paths.jobFamily], 'mailPlanBridge should find the new job family catalog');
assert.deepStrictEqual(global.CiviMailPlanBridge.getFamilyPaths(activePosition, 'people'), [paths.peopleFamily], 'mailPlanBridge should find the new people family catalog');

(async () => {
  const candidates = await global.CiviMailPlanBridge.makeCandidateMailsForActiveRole(activePosition, {});
  assert(candidates.length > 0, 'mailPlanBridge should produce candidates for the new role');
  assert.strictEqual(candidates[0].role_id, ROLE_ID, 'candidate should retain the new role id');
  assert.strictEqual(candidates[0].mail_plan_meta.role_scope, ROLE_SCOPE, 'candidate mail plan metadata should retain the new role scope');
  console.log('civication lager-og-driftsmedarbeider role package ok');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
