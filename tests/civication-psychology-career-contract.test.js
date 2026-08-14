#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const badge = readJson('data/badges/psykologi.json');
const evidence = readJson('data/Civication/psykologiCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const manifest = readJson('data/Civication/lifestory/manifest.json');
const rawCareers = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(rawCareers) ? rawCareers : rawCareers.careers;
const career = careers.find((item) => item.career_id === 'psykologi');

const jobs = [
  ['Miljøassistent',5,1,'direct',[],'psykologi_miljoarbeid'],
  ['Sosialassistent',10,2,'direct',[],'psykologi_miljoarbeid'],
  ['Aktivitetsleder (omsorgsarbeid)',15,3,'direct',[],'psykologi_miljoarbeid'],
  ['Miljøarbeider',25,4,'direct',[],'psykologi_miljoarbeid'],
  ['Veileder',40,5,'direct',[],'psykologi_arbeids_og_karriereveiledning'],
  ['Rådgiver',60,6,'direct',[],'psykologi_arbeids_og_karriereveiledning'],
  ['Seniorrådgiver',85,7,'direct',[],'psykologi_arbeids_og_karriereveiledning'],
  ['Psykolog',115,8,'authorization_required',['no_psychologist_authorization_or_license'],'psykolog'],
  ['Spesialistpsykolog',150,9,'authorization_required',['no_psychologist_authorization_or_license','no_psychologist_specialist_approval'],'spesialistpsykolog'],
  ['Fagansvarlig',190,10,'appointment_required',['employer_appointment'],'fagansvarlig'],
  ['Klinikkleder',240,11,'appointment_required',['employer_appointment'],'klinikkleder'],
  ['Forsker (psykologi)',300,12,'qualification_required',['academic_qualification_and_employment'],'forsker_psykologi'],
  ['Professor (psykologi)',380,13,'qualification_required',['academic_qualification_and_employment'],'professor_psykologi']
];
const salary = {'1':5,'2':9,'3':16,'4':18,'5':20,'6':23,'7':26,'8':30,'9':34,'10':38,'11':42,'12':46,'13':50};

assert.strictEqual(badge.id, 'psykologi');
assert.deepStrictEqual(badge.tiers.map((tier) => [tier.label,tier.threshold]), jobs.map(([title,threshold]) => [title,threshold]),
  'Psykologi-opprydding skal aldri endre canonical tiernavn eller terskler');
assert.strictEqual(badge.career_life_evidence, 'data/Civication/psykologiCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, []);
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_psykologi_bands_pc_per_week, salary);
assert.ok(Object.keys(evidence.sources).length >= 6, 'samlet Psykologi-evidens skal være bred og inspiserbar');
for (const rel of evidence.supporting_evidence_files) {
  assert.ok(fs.existsSync(path.join(ROOT, rel)), `mangler underliggende evidensfil ${rel}`);
}

assert.ok(career, 'Psykologi mangler i hg_careers.json');
assert.deepStrictEqual(career.economy.salary_by_tier, salary, 'eksisterende 13-nivå Psykologi-økonomi skal bevares eksakt');
const auditRows = audit.badges.psykologi;
assert.strictEqual(auditRows.length, 13);
assert.strictEqual(auditRows.filter((row) => row[3] === 'review').length, 0, 'Psykologi skal ikke ha åpen career review-gjeld');

const psychMapping = mappings.careers.psykologi;
assert.strictEqual(psychMapping.implementation_status, 'complete_canonical_ladder_implemented');
assert.deepStrictEqual(psychMapping.future_split_candidates, [], 'Psykologi skal ikke ha gjenværende role-scope debt');
assert.strictEqual(Object.keys(psychMapping.title_to_role_scope).length, 13);

for (const [title,threshold,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  const expected = {title,policy};
  if (qualificationIds.length) expected.qualification_ids = qualificationIds;
  expected.salary_tier = salaryTier;
  expected.role_scope = scope;
  assert.deepStrictEqual(tier.career_offer, expected, `${title}: komplett career_offer`);
  assert.strictEqual(tier.life_position, undefined, `${title}: faktisk jobb skal ikke materialiseres som life_position`);
  assert.strictEqual(tier.career_unlock, undefined, `${title}: samme Badge-tier er allerede den formelle jobben`);
  assert.strictEqual(career.economy.salary_by_tier[String(salaryTier)], salary[String(salaryTier)], `${title}: salary tier`);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'psykologi',title}), scope, `${title}: resolver scope`);
  assert.strictEqual(psychMapping.title_to_role_scope[title], scope, `${title}: mapping scope`);
  assert.ok(evidence.tier_evidence[title]?.length, `${title}: mangler evidensproveniens`);

  const modelPath = `data/Civication/roleModels/psykologi/${scope}.json`;
  const grammarPath = `data/Civication/workGrammars/psykologi/${scope}.json`;
  assert.ok(fs.existsSync(path.join(ROOT, modelPath)), `${title}: mangler canonical roleModel ${scope}`);
  assert.ok(fs.existsSync(path.join(ROOT, grammarPath)), `${title}: mangler canonical FWG ${scope}`);
  const model = readJson(modelPath);
  const grammar = readJson(grammarPath);
  assert.strictEqual(model.role_scope, scope, `${title}: roleModel scope`);
  assert.strictEqual(grammar.role_scope, scope, `${title}: FWG scope`);
  assert.ok(Array.isArray(grammar.practice_stories) && grammar.practice_stories.length >= 4, `${title}: FWG trenger minst fire praksiscase`);
  assert.ok(manifest.roles[scope], `${title}: canonical Life Story-scope mangler`);
}

for (const title of ['Psykolog','Spesialistpsykolog']) {
  const row = auditRows.find((item) => item[0] === title);
  assert.ok(row && row[2] === 'authorization_required', `${title}: autorisasjonsport må bestå`);
}
for (const title of ['Fagansvarlig','Klinikkleder']) {
  const row = auditRows.find((item) => item[0] === title);
  assert.ok(row && row[2] === 'appointment_required', `${title}: arbeidsgiverutnevnelse må bestå`);
}
for (const title of ['Forsker (psykologi)','Professor (psykologi)']) {
  const row = auditRows.find((item) => item[0] === title);
  assert.ok(row && row[2] === 'qualification_required', `${title}: akademisk kvalifikasjonsport må bestå`);
}

console.log('civication Psychology career contract ok: 13 formal jobs / 8 canonical work worlds / explicit 13-band salary / zero review debt');
