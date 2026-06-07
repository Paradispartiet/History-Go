const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

const files = {
  role: 'data/Civication/roles/naer_renholder.json',
  roleModel: 'data/Civication/roleModels/naeringsliv/renholder.json',
  plan: 'data/Civication/mailPlans/naeringsliv/renholder_plan.json',
  job: 'data/Civication/mailFamilies/naeringsliv/job/renholder_job.json',
  people: 'data/Civication/mailFamilies/naeringsliv/people/renholder_people.json'
};

for (const file of Object.values(files)) assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);

const role = readJson(files.role);
const roleModel = readJson(files.roleModel);
const plan = readJson(files.plan);
const job = readJson(files.job);
const people = readJson(files.people);
const profiles = readJson('data/Civication/jobLearningProfiles.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const registry = readJson('data/Civication/praksisfortellinger_registry.json');

assert.equal(role.schema, 'civication_role_content_v1');
assert.equal(role.category, 'naeringsliv');
assert.equal(role.role_id, 'naer_renholder');
assert.equal(role.role_name, 'Renholder');
assert.equal(role.role_level, 1);
for (const field of ['primary_conflict','secondary_conflict','background_conflict','tone','role_summary','actual_work','key_skills','knowledge_domains','social_dynamics','risk_points','good_practice','bad_practice','narrative_potential','scenario_families','starter_storylet']) {
  assert.ok(role[field] !== undefined && role[field] !== '', `role missing ${field}`);
}

assert.equal(roleModel.schema, 'civication_role_model_v1');
assert.equal(roleModel.role_scope, 'renholder');
assert.equal(roleModel.role_id, 'naer_renholder');
assert.equal(roleModel.title, 'Renholder');
assert.equal(roleModel.category, 'naeringsliv');
assert.ok(roleModel.short_description);
assert.deepEqual(roleModel.recommended_mail_families, ['soner_hygiene_og_prioritering', 'utstyr_kjemi_og_hms', 'renhold_status_og_belastning']);
assert.deepEqual(roleModel.mail_integration.recommended_mail_families, ['soner_hygiene_og_prioritering', 'utstyr_kjemi_og_hms', 'renhold_status_og_belastning']);

assert.ok(profiles.profiles.naer_renholder, 'jobLearningProfiles missing naer_renholder');
for (const topic of ['hygiene', 'renholdssoner', 'smittevern', 'berøringspunkter', 'HMS', 'kjemikalier og utstyr', 'prioritering under tidspress', 'usynlig arbeid og verdighet']) {
  assert.ok(profiles.profiles.naer_renholder.teaches.includes(topic), `profile missing teaches ${topic}`);
}
assert.equal(profiles.profiles.naer_renholder.dead_end_risk, 'medium');
assert.equal(profiles.profiles.naer_renholder.usefulness, 'high');
assert.equal(profiles.profiles.naer_renholder.mastery_threshold, 7);
assert.ok(profiles.profiles.naer_lager_og_driftsmedarbeider, 'existing lager profile must be preserved');

assert.equal(mappings.careers.naeringsliv.roles.renholder.role_id, 'naer_renholder');
assert.equal(mappings.careers.naeringsliv.title_to_role_scope.Renholder, 'renholder');
for (const existing of ['arbeider','fagarbeider','formann','mellomleder','avdelingsleder','controller','administrasjonsmedarbeider','ekspeditor','lager_og_driftsmedarbeider']) {
  assert.ok(mappings.careers.naeringsliv.roles[existing], `existing role mapping removed: ${existing}`);
}
assert.ok(JSON.stringify(registry).includes('renholder_week_1'), 'Renholder first-week package should be registered in praksisfortellinger registry');
assert.ok(JSON.stringify(registry).includes('renholder_week_2'), 'Renholder second-week package should be registered in praksisfortellinger registry');

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.role_scope, 'renholder');
assert.ok(plan.sequence.length >= 20);
assert.deepEqual(plan.sequence.slice(0, 20).map(step => step.step), [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

const jobFamilyIds = job.families.map(family => family.id);
const peopleFamilyIds = people.families.map(family => family.id);
assert.ok(jobFamilyIds.includes('soner_hygiene_og_prioritering'));
assert.ok(jobFamilyIds.includes('utstyr_kjemi_og_hms'));
assert.ok(peopleFamilyIds.includes('renhold_status_og_belastning'));
const allFamilyIds = new Set([...jobFamilyIds, ...peopleFamilyIds]);
for (const step of plan.sequence) {
  assert.ok(Array.isArray(step.allowed_families) && step.allowed_families.length > 0, `step ${step.step} missing allowed_families`);
  for (const familyId of step.allowed_families) assert.ok(allFamilyIds.has(familyId), `plan points to missing family ${familyId}`);
}

const requiredMailFields = ['id','mail_type','mail_family','role_scope','subject','summary','purpose','stakes','situation','task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc','learning_focus','choices'];
const allMails = [...job.families, ...people.families].flatMap(family => family.mails.map(mail => ({ family, mail })));
assert.ok(allMails.length >= 3);
for (const { family, mail } of allMails) {
  for (const field of requiredMailFields) assert.ok(mail[field] !== undefined && mail[field] !== '', `${mail.id} missing ${field}`);
  assert.equal(mail.mail_family, family.id);
  assert.equal(mail.role_scope, 'renholder');
  assert.ok(Array.isArray(mail.situation) && mail.situation.length > 0, `${mail.id} missing situation`);
  assert.ok(Array.isArray(mail.learning_focus) && mail.learning_focus.length > 0, `${mail.id} missing learning_focus`);
  assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} missing choices`);
  for (const choice of mail.choices) {
    for (const field of ['id','label','effect','tags','feedback']) assert.ok(choice[field] !== undefined && choice[field] !== '', `${mail.id}/${choice.id} missing ${field}`);
    assert.ok(Array.isArray(choice.tags) && choice.tags.length > 0, `${mail.id}/${choice.id} missing tags`);
  }
}

const resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
assert.equal(resolver.resolveCareerRoleScope({career_id:'naeringsliv', role_id:'naer_renholder'}), 'renholder');
assert.equal(resolver.resolveCareerRoleScope({career_id:'naeringsliv', title:'Renholder'}), 'renholder');
assert.equal(resolver.resolveCareerRoleId({career_id:'naeringsliv', title:'Renholder'}), 'naer_renholder');

const bridgeCode = fs.readFileSync(path.join(root, 'js/Civication/mailPlanBridge.js'), 'utf8');
const sandbox = { window: {}, console, fetch: async () => ({ok:false}) };
vm.runInNewContext(bridgeCode, sandbox);
const bridge = sandbox.window.CiviMailPlanBridge;
const active = {career_id:'naeringsliv', role_id:'naer_renholder', title:'Renholder'};
assert.equal(bridge.resolveRoleScope(active), 'renholder');
assert.equal(bridge.getPlanPath(active), files.plan);
assert.deepEqual(Array.from(bridge.getFamilyPaths(active, 'job')), [files.job]);
assert.deepEqual(Array.from(bridge.getFamilyPaths(active, 'people')), [files.people]);

console.log('civication renholder role package tests passed');
