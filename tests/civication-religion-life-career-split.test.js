#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/religion.json');
const evidence = readJson('data/Civication/religionCareerLifeEvidence.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const religionCareer = careers.find((career) => career.career_id === 'religion');

const life = ['Besøkende','Nysgjerrig','Tradisjonskjenner','Ritualkjenner','Symboltolker','Troslivskjenner','Feltarbeider'];
const jobs = [
  ['Religionsformidler',1,'direct',[],'religion_formidling_og_kulturarv'],
  ['Religionshistoriker',2,'qualification_required',['relevant_education_or_employer_qualification'],'religion_forskning'],
  ['Religionsviter',2,'qualification_required',['relevant_education_or_employer_qualification'],'religion_forskning'],
  ['Fagkonsulent',1,'direct',[],'religion_utredning_og_radgivning'],
  ['Kurator',2,'direct',[],'religion_formidling_og_kulturarv'],
  ['Seniorrådgiver',2,'direct',[],'religion_utredning_og_radgivning'],
  ['Fagansvarlig',2,'appointment_required',['employer_appointment'],'religion_fagledelse'],
  ['Forsker',2,'qualification_required',['academic_qualification_and_employment'],'religion_forskning'],
  ['Seniorforsker',3,'qualification_required',['academic_qualification_and_employment'],'religion_forskning'],
  ['Seksjonsleder',2,'appointment_required',['employer_appointment'],'religion_fagledelse'],
  ['Avdelingsleder',3,'appointment_required',['employer_appointment'],'religion_fagledelse'],
  ['Avdelingsdirektør',3,'appointment_required',['employer_appointment'],'religion_fagledelse'],
  ['Direktør',3,'appointment_required',['employer_appointment'],'religion_fagledelse']
];

assert.strictEqual(badge.id, 'religion');
assert.strictEqual(badge.tiers.length, 20);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/religionCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, life);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_religion_bands_pc_per_week, {'1':5,'2':8,'3':14});
assert.ok(Array.isArray(evidence.sources) && evidence.sources.length >= 5);

for (const label of life) {
  const tier = badge.tiers.find((item) => item.label === label);
  assert.ok(tier?.life_position, `${label}: life_position mangler`);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
}
assert.strictEqual(badge.tiers.find((tier) => tier.label === 'Feltarbeider').life_position.kind, 'fieldwork_practice');
assert.ok(evidence.salary_mapping.not_salary_jobs.includes('Feltarbeider'));

assert.ok(religionCareer, 'Religion mangler i hg_careers.json');
assert.deepStrictEqual(religionCareer.economy.salary_by_tier, {'1':5,'2':8,'3':14});

for (const [title, salaryTier, policy, qualificationIds, scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier?.career_offer?.title, title);
  assert.strictEqual(tier?.career_offer?.salary_tier, salaryTier);
  assert.strictEqual(tier?.career_offer?.policy, policy);
  assert.deepStrictEqual(tier?.career_offer?.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier?.career_offer?.role_scope, scope);
  assert.strictEqual(tier?.life_position, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'religion', title}), scope, `${title}: feil role_scope`);
}

for (const [scope,titles] of [
  ['religion_formidling_og_kulturarv',['Religionsformidler','Kurator']],
  ['religion_utredning_og_radgivning',['Fagkonsulent','Seniorrådgiver']],
  ['religion_forskning',['Religionshistoriker','Religionsviter','Forsker','Seniorforsker']],
  ['religion_fagledelse',['Fagansvarlig','Seksjonsleder','Avdelingsleder','Avdelingsdirektør','Direktør']]
]) {
  const model = readJson(`data/Civication/roleModels/religion/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'religion');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.source?.badge_file, 'data/badges/religion.json');
  assert.strictEqual(model.source?.evidence, 'data/Civication/religionCareerLifeEvidence.json');
  assert.ok((model.competence_axes || []).length >= 4, `${scope}: kompetanseakser mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 3, `${scope}: myndighetsgrenser mangler`);

  const grammar = readJson(`data/Civication/workGrammars/religion/${scope}.json`);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: minst fem praksisfortellinger kreves`);
  assert.ok((grammar.quality_axes || []).length >= 5, `${scope}: kvalitetsakser mangler`);
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
  fetch: async () => ({ json: async () => ({}) }),
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  Event: function Event(type) { this.type = type; },
  showToast: () => {}, pulseBadge: () => {}, catIdFromDisplay: (value) => value,
  deriveTierFromPoints: () => ({ tierIndex: 0 }),
  module: { exports: {} }, exports: {},
  window: {
    BADGES: [badge],
    HG_CAREERS: [religionCareer],
    CivicationJobs: {
      pushOffer(offer) { pushed.push(offer); return { ok: true, offer }; },
      canReceiveNewOffers: () => true,
      getOffers: () => []
    },
    CivicationQualifications: { hasAll(ids) { return ids.every((id) => qualifications.has(id)); } },
    CivicationState: { getActivePosition() { return activePosition; } },
    calculateWeeklySalary(career, zeroBasedTierIndex) {
      return Number(career?.economy?.salary_by_tier?.[String(Number(zeroBasedTierIndex) + 1)] || 0);
    },
    dispatchEvent: () => {}
  }
};
sandbox.window.window = sandbox.window;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(meritsSource, sandbox, { filename: 'merits-and-jobs.js' });
vm.runInContext(guardSource, sandbox, { filename: 'civicationCareerRealityGuard.js' });

for (const label of life) {
  const tier = badge.tiers.find((item) => item.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({career_id:'religion', title:label, threshold:tier.threshold, points_at_offer:9999});
  assert.strictEqual(result.ok, false, `${label}: life_position må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0, 'ingen Religion-life_position skal bli jobb');

let result = sandbox.window.CivicationJobs.pushOffer({career_id:'religion', title:'Religionshistoriker', threshold:115, points_at_offer:115});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'religion', title:'Religionshistoriker', threshold:115, points_at_offer:115});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'religion', title:'Fagansvarlig', threshold:500, points_at_offer:500});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'religion', title:'Fagansvarlig', threshold:500, points_at_offer:500});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'religion', title:'Forsker', threshold:650, points_at_offer:650});
assert.strictEqual(result.ok, false);
qualifications = new Set(['academic_qualification_and_employment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'religion', title:'Forsker', threshold:650, points_at_offer:650});
assert.strictEqual(result.ok, true);

activePosition = {career_id:'religion', title:'Religionsformidler', threshold:85};
assert.strictEqual(sandbox.window.calculateWeeklySalary(religionCareer, 19), 5);
activePosition = {career_id:'religion', title:'Religionshistoriker', threshold:115};
assert.strictEqual(sandbox.window.calculateWeeklySalary(religionCareer, 19), 8);
activePosition = {career_id:'religion', title:'Seniorforsker', threshold:800};
assert.strictEqual(sandbox.window.calculateWeeklySalary(religionCareer, 19), 14);
activePosition = {career_id:'religion', title:'Direktør', threshold:1900};
assert.strictEqual(sandbox.window.calculateWeeklySalary(religionCareer, 19), 14);

console.log('civication religion life-career split ok: 7 life/practice positions / 13 formal jobs / 4 work worlds');
