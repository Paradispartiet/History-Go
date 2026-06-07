const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

const files = {
  role: 'data/Civication/roles/naer_lager_og_driftsmedarbeider.json',
  roleModel: 'data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json',
  plan: 'data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json',
  job: 'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json',
  people: 'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json'
};

for (const file of Object.values(files)) assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);

const role = readJson(files.role);
const roleModel = readJson(files.roleModel);
const plan = readJson(files.plan);
const job = readJson(files.job);
const people = readJson(files.people);
const profiles = readJson('data/Civication/jobLearningProfiles.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');

assert.equal(role.role_id, 'naer_lager_og_driftsmedarbeider');
assert.equal(roleModel.role_id, 'naer_lager_og_driftsmedarbeider');
assert.equal(roleModel.role_scope, 'lager_og_driftsmedarbeider');
assert.deepEqual(roleModel.mail_integration.recommended_mail_families, ['mottak_og_vareflyt', 'plukk_pakk_og_avvik', 'lager_team_og_belastning']);
assert.ok(profiles.profiles.naer_lager_og_driftsmedarbeider);
assert.ok(profiles.profiles.sport_legende, 'sport_legende must be preserved');
assert.equal(mappings.careers.naeringsliv.roles.lager_og_driftsmedarbeider.role_id, 'naer_lager_og_driftsmedarbeider');
assert.equal(mappings.careers.naeringsliv.title_to_role_scope['Lager- og driftsmedarbeider'], 'lager_og_driftsmedarbeider');
assert.ok(!mappings.careers.naeringsliv.roles.arbeider.badge_titles.includes('Lager- og driftsmedarbeider'));

assert.equal(plan.role_scope, 'lager_og_driftsmedarbeider');
assert.equal(plan.sequence.length, 10);
assert.deepEqual(plan.sequence.map(step => step.step), [1,2,3,4,5,6,7,8,9,10]);
assert.deepEqual(job.families.map(family => family.id), ['mottak_og_vareflyt', 'plukk_pakk_og_avvik']);
assert.deepEqual(people.families.map(family => family.id), ['lager_team_og_belastning']);

const allMails = [...job.families, ...people.families].flatMap(family => family.mails);
assert.equal(allMails.length, 6);
for (const mail of allMails) {
  for (const field of ['id','mail_type','mail_family','role_scope','phase','priority','from','subject','summary','purpose','stakes','task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc']) {
    assert.ok(mail[field] !== undefined && mail[field] !== '', `${mail.id} missing ${field}`);
  }
  assert.equal(mail.role_scope, 'lager_og_driftsmedarbeider');
  assert.ok(Array.isArray(mail.situation) && mail.situation.length > 0, `${mail.id} missing situation`);
  assert.ok(Array.isArray(mail.learning_focus) && mail.learning_focus.length > 0, `${mail.id} missing learning_focus`);
  assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} missing choices`);
  for (const choice of mail.choices) {
    for (const field of ['id','label','reply','effect','feedback']) assert.ok(choice[field] !== undefined && choice[field] !== '', `${mail.id}/${choice.id} missing ${field}`);
    assert.ok(Array.isArray(choice.tags) && choice.tags.length > 0, `${mail.id}/${choice.id} missing tags`);
  }
}

const resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
assert.equal(resolver.resolveCareerRoleScope({career_id:'naeringsliv', role_id:'naer_lager_og_driftsmedarbeider'}), 'lager_og_driftsmedarbeider');
assert.equal(resolver.resolveCareerRoleScope({career_id:'naeringsliv', title:'Lager- og driftsmedarbeider'}), 'lager_og_driftsmedarbeider');
assert.equal(resolver.resolveCareerRoleId({career_id:'naeringsliv', title:'Lager- og driftsmedarbeider'}), 'naer_lager_og_driftsmedarbeider');

const bridgeCode = fs.readFileSync(path.join(root, 'js/Civication/mailPlanBridge.js'), 'utf8');
const sandbox = { window: {}, console, fetch: async () => ({ok:false}) };
vm.runInNewContext(bridgeCode, sandbox);
const bridge = sandbox.window.CiviMailPlanBridge;
const active = {career_id:'naeringsliv', role_id:'naer_lager_og_driftsmedarbeider', title:'Lager- og driftsmedarbeider'};
assert.equal(bridge.resolveRoleScope(active), 'lager_og_driftsmedarbeider');
assert.equal(bridge.getPlanPath(active), files.plan);
assert.deepEqual(Array.from(bridge.getFamilyPaths(active, 'job')), [files.job]);
assert.deepEqual(Array.from(bridge.getFamilyPaths(active, 'people')), [files.people]);

console.log('civication lager-og-driftsmedarbeider role package tests passed');
