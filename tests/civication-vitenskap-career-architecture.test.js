#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const badge = readJson('data/badges/vitenskap.json');
const evidence = readJson('data/Civication/vitenskapCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const career = careers.find((item) => item.career_id === 'vitenskap');

const expectedTiers = [
  ['Studentassistent',5],['Vitenskapelig assistent',10],['Forskningsassistent',15],['Laboratorieassistent',25],
  ['Stipendiat (PhD)',40],['Postdoktor',60],['Forsker',85],['Seniorforsker',115],
  ['Førsteamanuensis',150],['Professor',190],['Forskningsleder',240],['Instituttleder',300],['Dekan',380]
];
const jobs = [
  ['Studentassistent',1,'qualification_required',['relevant_education_or_employer_qualification'],'vitenskap_assistent_og_laboratorium'],
  ['Vitenskapelig assistent',1,'qualification_required',['relevant_education_or_employer_qualification'],'vitenskap_assistent_og_laboratorium'],
  ['Forskningsassistent',1,'qualification_required',['relevant_education_or_employer_qualification'],'vitenskap_assistent_og_laboratorium'],
  ['Laboratorieassistent',1,'qualification_required',['relevant_education_or_employer_qualification'],'vitenskap_assistent_og_laboratorium'],
  ['Stipendiat (PhD)',1,'qualification_required',['academic_qualification_and_employment'],'vitenskap_doktorlop_og_postdoktor'],
  ['Postdoktor',2,'qualification_required',['academic_qualification_and_employment'],'vitenskap_doktorlop_og_postdoktor'],
  ['Forsker',2,'qualification_required',['academic_qualification_and_employment'],'vitenskap_forskning'],
  ['Seniorforsker',2,'qualification_required',['academic_qualification_and_employment'],'vitenskap_forskning'],
  ['Førsteamanuensis',2,'qualification_required',['academic_qualification_and_employment'],'vitenskap_undervisning_og_forskning'],
  ['Professor',3,'qualification_required',['academic_qualification_and_employment'],'vitenskap_undervisning_og_forskning'],
  ['Forskningsleder',3,'appointment_required',['academic_qualification_and_employment','employer_appointment'],'vitenskap_forskningsledelse'],
  ['Instituttleder',3,'appointment_required',['academic_qualification_and_employment','employer_appointment'],'vitenskap_institusjonsledelse'],
  ['Dekan',3,'appointment_required',['academic_qualification_and_employment','employer_appointment'],'vitenskap_institusjonsledelse']
];

assert.strictEqual(badge.id, 'vitenskap');
assert.deepStrictEqual(badge.tiers.map((tier) => [tier.label,tier.threshold]), expectedTiers,
  'Vitenskap-opprydding skal aldri endre canonical tiernavn eller terskler');
assert.strictEqual(badge.career_life_evidence, 'data/Civication/vitenskapCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, []);
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_vitenskap_bands_pc_per_week, {'1':6,'2':10,'3':17});
assert.ok(evidence.sources.length >= 6, 'Vitenskap-evidensen skal være bred og inspiserbar');

assert.ok(career, 'Vitenskap mangler i hg_careers.json');
assert.deepStrictEqual(career.economy.salary_by_tier, {'1':6,'2':10,'3':17});
const auditRows = audit.badges.vitenskap;
assert.strictEqual(auditRows.length, 13);
assert.strictEqual(auditRows.filter((row) => row[3] === 'review').length, 0);
assert.deepStrictEqual(auditRows.find((row) => row[0] === 'Vitenskapelig assistent'),
  ['Vitenskapelig assistent','qualified_entry_job','qualification_required','keep_with_gate',['relevant_education_or_employer_qualification']]);
assert.deepStrictEqual(auditRows.find((row) => row[0] === 'Professor'),
  ['Professor','academic_position','qualification_required','keep_with_gate',['academic_qualification_and_employment']]);
assert.deepStrictEqual(auditRows.find((row) => row[0] === 'Dekan'),
  ['Dekan','academic_leadership_position','appointment_required','keep_with_gate',['academic_qualification_and_employment','employer_appointment']]);

for (const [title,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.deepStrictEqual(tier.career_offer, {title,policy,qualification_ids:qualificationIds,salary_tier:salaryTier,role_scope:scope});
  assert.strictEqual(tier.life_position, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'vitenskap',title}), scope, `${title}: resolver scope`);
}

const legacyRoleIds = {
  vitenskap_studentassistent:'vitenskap_assistent_og_laboratorium',
  vitenskap_vitenskapelig_assistent:'vitenskap_assistent_og_laboratorium',
  vitenskap_forskningsassistent:'vitenskap_assistent_og_laboratorium',
  vitenskap_laboratorieassistent:'vitenskap_assistent_og_laboratorium',
  vitenskap_stipendiat_phd:'vitenskap_doktorlop_og_postdoktor',
  vitenskap_postdoktor:'vitenskap_doktorlop_og_postdoktor',
  vitenskap_forsker:'vitenskap_forskning',
  vitenskap_seniorforsker:'vitenskap_forskning',
  vitenskap_forsteamanuensis:'vitenskap_undervisning_og_forskning',
  vitenskap_professor:'vitenskap_undervisning_og_forskning',
  vitenskap_forskningsleder:'vitenskap_forskningsledelse',
  vitenskap_instituttleder:'vitenskap_institusjonsledelse',
  vitenskap_dekan:'vitenskap_institusjonsledelse'
};
for (const [role_id,scope] of Object.entries(legacyRoleIds)) {
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'vitenskap',role_id}), scope, `${role_id}: legacy resolver`);
}

for (const [scope,titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/vitenskap/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/vitenskap/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'vitenskap');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.role_id, scope);
  assert.strictEqual(model.source?.evidence, 'data/Civication/vitenskapCareerLifeEvidence.json');
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok((model.competence_axes || []).length >= 6, `${scope}: kompetanseakser mangler`);
  assert.ok((model.ideal_type_problems || []).length >= 5, `${scope}: idealtypiske problemer mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 4, `${scope}: myndighetsgrenser mangler`);
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.category, 'vitenskap');
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.task_families || []).length >= 5, `${scope}: arbeidsgrammatikk for tynn`);
  assert.ok((grammar.work_loops || []).length >= 2, `${scope}: arbeidsløkker mangler`);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: minst fem praksiscase kreves`);
  assert.ok((grammar.quality_axes || []).length >= 6, `${scope}: kvalitetsakser mangler`);
  assert.ok((grammar.authority_boundary?.may_not || []).length >= 4, `${scope}: FWG-myndighetsgrense mangler`);
}

const meritsSource = fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');
const pushed = [];
let activePosition = null;
let qualifications = new Set();
const sandbox = {
  console,
  setTimeout: () => 0,
  clearTimeout: () => {},
  fetch: async () => ({ ok: true, json: async () => ({}) }),
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  Event: function Event(type) { this.type = type; },
  showToast: () => {}, pulseBadge: () => {}, catIdFromDisplay: (value) => value,
  deriveTierFromPoints: () => ({ tierIndex: 0 }),
  module: { exports: {} }, exports: {},
  window: {
    BADGES: [badge], HG_CAREERS: [career],
    CivicationJobs: { pushOffer(offer) { pushed.push(offer); return {ok:true,offer}; }, canReceiveNewOffers:()=>true, getOffers:()=>[] },
    CivicationQualifications: { hasAll(ids) { return ids.every((id) => qualifications.has(id)); } },
    CivicationState: { getActivePosition() { return activePosition; } },
    calculateWeeklySalary(careerRule, zeroBasedTierIndex) { return Number(careerRule?.economy?.salary_by_tier?.[String(Number(zeroBasedTierIndex)+1)] || 0); },
    dispatchEvent: () => {}
  }
};
sandbox.window.window = sandbox.window;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(meritsSource, sandbox, {filename:'merits-and-jobs.js'});
vm.runInContext(guardSource, sandbox, {filename:'civicationCareerRealityGuard.js'});

let result = sandbox.window.CivicationJobs.pushOffer({career_id:'vitenskap',title:'Studentassistent',threshold:5,points_at_offer:5});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'vitenskap',title:'Studentassistent',threshold:5,points_at_offer:5});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'vitenskap',title:'Professor',threshold:190,points_at_offer:190});
assert.strictEqual(result.ok, false);
qualifications = new Set(['academic_qualification_and_employment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'vitenskap',title:'Professor',threshold:190,points_at_offer:190});
assert.strictEqual(result.ok, true);

qualifications = new Set(['academic_qualification_and_employment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'vitenskap',title:'Dekan',threshold:380,points_at_offer:380});
assert.strictEqual(result.ok, false);
qualifications.add('employer_appointment');
result = sandbox.window.CivicationJobs.pushOffer({career_id:'vitenskap',title:'Dekan',threshold:380,points_at_offer:380});
assert.strictEqual(result.ok, true);

activePosition = {career_id:'vitenskap',title:'Studentassistent',threshold:5};
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 12), 6);
activePosition = {career_id:'vitenskap',title:'Forsker',threshold:85};
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 12), 10);
activePosition = {career_id:'vitenskap',title:'Dekan',threshold:380};
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 12), 17);

console.log('civication Vitenskap career architecture ok: 13 formal jobs / 6 work worlds / qualification gates / economy 6-10-17');
