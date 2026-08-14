#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/historie.json');
const evidence = readJson('data/Civication/historieCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const historyCareer = careers.find((career) => career.career_id === 'historie');

const expectedTiers = [
  ['Student',5],['Masterstuden',10],['Doktorgradsstudent',15],['Arkivmedarbeider',25],['Saksbehandler',40],
  ['Førstekonsulent',60],['Rådgiver',85],['Seniorrådgiver',115],['Arkivar',150],['Spesialrådgiver',190],
  ['Konservator',240],['Kurator',300],['Senior konservator',380],['Senior kurator',500],['Forsker',650],
  ['Seniorforsker',800],['Seksjonsleder',1000],['Avdelingsleder',1250],['Avdelingsdirektør',1550],['Direktør',1900]
];
const pureLearning = ['Student','Masterstuden'];
const jobs = [
  ['Arkivmedarbeider',1,'direct',[],'historie_arkiv_og_dokumentasjon'],
  ['Saksbehandler',1,'direct',[],'historie_forvaltning_og_radgivning'],
  ['Førstekonsulent',1,'direct',[],'historie_forvaltning_og_radgivning'],
  ['Rådgiver',2,'direct',[],'historie_forvaltning_og_radgivning'],
  ['Seniorrådgiver',2,'direct',[],'historie_forvaltning_og_radgivning'],
  ['Arkivar',2,'qualification_required',['relevant_education_or_employer_qualification'],'historie_arkiv_og_dokumentasjon'],
  ['Spesialrådgiver',2,'direct',[],'historie_forvaltning_og_radgivning'],
  ['Konservator',2,'qualification_required',['relevant_education_or_employer_qualification'],'historie_museum_og_samling'],
  ['Kurator',2,'direct',[],'historie_museum_og_samling'],
  ['Senior konservator',3,'qualification_required',['relevant_education_or_employer_qualification'],'historie_museum_og_samling'],
  ['Senior kurator',3,'direct',[],'historie_museum_og_samling'],
  ['Forsker',2,'qualification_required',['relevant_education_or_employer_qualification'],'historie_forskning_og_akademia'],
  ['Seniorforsker',3,'qualification_required',['relevant_education_or_employer_qualification'],'historie_forskning_og_akademia'],
  ['Seksjonsleder',3,'appointment_required',['employer_appointment'],'historie_fagledelse'],
  ['Avdelingsleder',3,'appointment_required',['employer_appointment'],'historie_fagledelse'],
  ['Avdelingsdirektør',3,'appointment_required',['employer_appointment'],'historie_institusjonsledelse'],
  ['Direktør',3,'appointment_required',['employer_appointment'],'historie_institusjonsledelse']
];

assert.strictEqual(badge.id, 'historie');
assert.deepStrictEqual(badge.tiers.map((tier) => [tier.label,tier.threshold]), expectedTiers,
  'Historie-oppryddingen skal aldri endre canonical tiernavn eller poenggrenser');
assert.strictEqual(badge.career_life_evidence, 'data/Civication/historieCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_learning_tiers, pureLearning);
assert.deepStrictEqual(evidence.canonical_decision.learning_tiers_with_formal_career_unlock, ['Doktorgradsstudent']);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.strictEqual(evidence.canonical_decision.formal_job_opportunities.length, 18);
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_historie_bands_pc_per_week, {'1':5,'2':8,'3':14});
assert.ok(evidence.sources.length >= 6, 'Historie-evidensen skal være bred og inspiserbar');

const historyAudit = audit.badges.historie;
assert.strictEqual(historyAudit.length, 20);
assert.strictEqual(historyAudit.filter((row) => row[3] === 'review').length, 0, 'Historie skal ikke ha review-gjeld');
assert.deepStrictEqual(historyAudit.find((row) => row[0] === 'Student'), ['Student','education_stage','not_job','replace',[]]);
assert.deepStrictEqual(historyAudit.find((row) => row[0] === 'Masterstuden'), ['Masterstuden','education_stage','not_job','replace',[]]);
assert.deepStrictEqual(historyAudit.find((row) => row[0] === 'Doktorgradsstudent'), ['Doktorgradsstudent','education_employment','qualification_required','keep_with_gate',['academic_phd_admission_or_employment']]);
assert.deepStrictEqual(historyAudit.find((row) => row[0] === 'Direktør'), ['Direktør','leadership_position','appointment_required','keep_with_gate',['employer_appointment']]);

for (const label of pureLearning) {
  const tier = badge.tiers.find((item) => item.label === label);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'historie',title:label}), 'unknown');
}

const phdTier = badge.tiers.find((item) => item.label === 'Doktorgradsstudent');
assert.strictEqual(phdTier.life_position.employment_independent, true);
assert.strictEqual(phdTier.career_offer, undefined);
assert.deepStrictEqual(phdTier.career_unlock, {
  title:'Doktorgradsstudent',
  policy:'qualification_required',
  qualification_ids:['academic_phd_admission_or_employment'],
  salary_tier:1,
  role_scope:'historie_forskning_og_akademia'
});
assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'historie',title:'Doktorgradsstudent'}), 'historie_forskning_og_akademia');

assert.ok(historyCareer, 'Historie mangler i hg_careers.json');
assert.deepStrictEqual(historyCareer.economy.salary_by_tier, {'1':5,'2':8,'3':14});

for (const [title,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.career_offer.title, title);
  assert.strictEqual(tier.career_offer.salary_tier, salaryTier);
  assert.strictEqual(tier.career_offer.policy, policy);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier.career_offer.role_scope, scope);
  assert.strictEqual(tier.life_position, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'historie',title}), scope, `${title}: feil role_scope`);
}

for (const [scope,titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/historie/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/historie/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'historie');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.role_id, scope);
  assert.strictEqual(model.source?.evidence, 'data/Civication/historieCareerLifeEvidence.json');
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok((model.competence_axes || []).length >= 6, `${scope}: kompetanseakser mangler`);
  assert.ok((model.ideal_type_problems || []).length >= 5, `${scope}: idealtypiske problemer mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 4, `${scope}: myndighetsgrenser mangler`);
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.category, 'historie');
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.task_families || []).length >= 5, `${scope}: arbeidsgrammatikk er for tynn`);
  assert.ok((grammar.work_loops || []).length >= 2, `${scope}: arbeidsløkker mangler`);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: minst fem praksiscase kreves`);
  assert.ok((grammar.quality_axes || []).length >= 6, `${scope}: kvalitetsakser mangler`);
  assert.ok((grammar.authority_boundary?.may_not || []).length >= 3, `${scope}: FWG-myndighetsgrense mangler`);
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
    BADGES: [badge],
    HG_CAREERS: [historyCareer],
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

for (const label of pureLearning) {
  const tier = badge.tiers.find((item) => item.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({career_id:'historie',title:label,threshold:tier.threshold,points_at_offer:9999});
  assert.strictEqual(result.ok, false, `${label}: utdanningsposisjon må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0);

let result = sandbox.window.CivicationJobs.pushOffer({career_id:'historie',title:'Doktorgradsstudent',threshold:15,points_at_offer:15});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['academic_phd_admission_or_employment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'historie',title:'Doktorgradsstudent',threshold:15,points_at_offer:15});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'historie',title:'Arkivar',threshold:150,points_at_offer:150});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'historie',title:'Arkivar',threshold:150,points_at_offer:150});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'historie',title:'Direktør',threshold:1900,points_at_offer:1900});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'historie',title:'Direktør',threshold:1900,points_at_offer:1900});
assert.strictEqual(result.ok, true);

activePosition = {career_id:'historie',title:'Arkivmedarbeider',threshold:25};
assert.strictEqual(sandbox.window.calculateWeeklySalary(historyCareer, 19), 5);
activePosition = {career_id:'historie',title:'Arkivar',threshold:150};
assert.strictEqual(sandbox.window.calculateWeeklySalary(historyCareer, 19), 8);
activePosition = {career_id:'historie',title:'Direktør',threshold:1900};
assert.strictEqual(sandbox.window.calculateWeeklySalary(historyCareer, 19), 14);

console.log('civication History life-career split ok: 2 pure learning tiers + 1 gated doctoral unlock / 17 badge job tiers / 6 work worlds');
