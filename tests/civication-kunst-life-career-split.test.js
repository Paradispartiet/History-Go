#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/kunst.json');
const evidence = readJson('data/Civication/kunstCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const artCareer = careers.find((career) => career.career_id === 'kunst');

const expectedTiers = [
  ['Vertskap (museum/galleri)',5],['Gallerimedarbeider',10],['Formidler',15],['Produksjonsassistent',25],
  ['Utstillingskoordinator',40],['Kuratorassistent',60],['Kurator',85],['Senior kurator',115],
  ['Konservator',150],['Senior konservator',190],['Gallerist',240],['Utstillingsprodusent',300],
  ['Kunstnerisk leder',380],['Museumsdirektør',500]
];
const pureLife = ['Gallerist'];
const jobs = [
  ['Vertskap (museum/galleri)',1,'direct',[],'kunst_publikum_og_formidling'],
  ['Gallerimedarbeider',1,'direct',[],'kunst_publikum_og_formidling'],
  ['Formidler',1,'qualification_required',['relevant_education_or_employer_qualification'],'kunst_publikum_og_formidling'],
  ['Produksjonsassistent',1,'direct',[],'kunst_utstillingsproduksjon'],
  ['Utstillingskoordinator',2,'direct',[],'kunst_utstillingsproduksjon'],
  ['Kuratorassistent',2,'qualification_required',['relevant_education_or_employer_qualification'],'kunst_kuratering_og_program'],
  ['Senior kurator',2,'appointment_required',['employer_appointment'],'kunst_kuratering_og_program'],
  ['Konservator',2,'qualification_required',['relevant_education_or_employer_qualification'],'kunst_konservering_og_samling'],
  ['Senior konservator',3,'appointment_required',['relevant_education_or_employer_qualification','employer_appointment'],'kunst_konservering_og_samling'],
  ['Utstillingsprodusent',3,'direct',[],'kunst_utstillingsproduksjon'],
  ['Kunstnerisk leder',3,'appointment_required',['employer_appointment'],'kunst_kunstnerisk_ledelse'],
  ['Museumsdirektør',3,'appointment_required',['employer_appointment'],'kunst_museumsledelse']
];

assert.strictEqual(badge.id, 'kunst');
assert.deepStrictEqual(badge.tiers.map((tier) => [tier.label,tier.threshold]), expectedTiers,
  'Kunst-oppryddingen skal aldri endre canonical tiernavn eller poenggrenser');
assert.strictEqual(badge.career_life_evidence, 'data/Civication/kunstCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, pureLife);
assert.deepStrictEqual(evidence.canonical_decision.life_with_separate_career_unlock, ['Kurator']);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_kunst_bands_pc_per_week, {'1':4,'2':7,'3':13});
assert.ok(evidence.sources.length >= 6, 'Kunst-evidensen skal være bred og inspiserbar');

const artAudit = audit.badges.kunst;
assert.strictEqual(artAudit.length, 14);
assert.strictEqual(artAudit.filter((row) => row[3] === 'review').length, 0, 'Kunst skal ikke ha review-gjeld');
assert.deepStrictEqual(artAudit.find((row) => row[0] === 'Kurator'), ['Kurator','curatorial_practice_or_employment','not_job','replace',[]]);
assert.deepStrictEqual(artAudit.find((row) => row[0] === 'Gallerist'), ['Gallerist','gallery_operator_practice_or_business_role','not_job','replace',[]]);
assert.deepStrictEqual(artAudit.find((row) => row[0] === 'Senior konservator'), ['Senior konservator','senior_qualified_profession','appointment_required','keep_with_gate',['relevant_education_or_employer_qualification','employer_appointment']]);
assert.deepStrictEqual(artAudit.find((row) => row[0] === 'Museumsdirektør'), ['Museumsdirektør','leadership_position','appointment_required','keep_with_gate',['employer_appointment']]);

const galleristTier = badge.tiers.find((tier) => tier.label === 'Gallerist');
assert.strictEqual(galleristTier.life_position.employment_independent, true);
assert.strictEqual(galleristTier.career_offer, undefined);
assert.strictEqual(galleristTier.career_unlock, undefined);
assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'kunst',title:'Gallerist'}), 'unknown');

const curatorTier = badge.tiers.find((tier) => tier.label === 'Kurator');
assert.strictEqual(curatorTier.life_position.employment_independent, true);
assert.strictEqual(curatorTier.career_offer, undefined);
assert.deepStrictEqual(curatorTier.career_unlock, {
  title:'Kurator', policy:'appointment_required', qualification_ids:['employer_appointment'], salary_tier:2, role_scope:'kunst_kuratering_og_program'
});
assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'kunst',title:'Kurator'}), 'kunst_kuratering_og_program');

assert.ok(artCareer, 'Kunst mangler i hg_careers.json');
assert.deepStrictEqual(artCareer.economy.salary_by_tier, {'1':4,'2':7,'3':13});

for (const [title,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.career_offer.title, title);
  assert.strictEqual(tier.career_offer.salary_tier, salaryTier);
  assert.strictEqual(tier.career_offer.policy, policy);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier.career_offer.role_scope, scope);
  assert.strictEqual(tier.life_position, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'kunst',title}), scope, `${title}: feil role_scope`);
}

for (const [scope,titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/kunst/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/kunst/${scope}.json`);
  assert.strictEqual(model.schema, 'civication_role_model_v2');
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'kunst');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.role_id, scope);
  assert.strictEqual(model.source?.evidence, 'data/Civication/kunstCareerLifeEvidence.json');
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok((model.competence_axes || []).length >= 6, `${scope}: kompetanseakser mangler`);
  assert.ok((model.ideal_type_problems || []).length >= 5, `${scope}: idealtypiske problemer mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 4, `${scope}: myndighetsgrenser mangler`);
  assert.strictEqual(grammar.schema, 'civication_work_grammar_v2');
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.category, 'kunst');
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.task_families || []).length >= 5, `${scope}: arbeidsgrammatikk er for tynn`);
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
    BADGES: [badge],
    HG_CAREERS: [artCareer],
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

let result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Gallerist',threshold:240,points_at_offer:240});
assert.strictEqual(result.ok, false, 'Gallerist skal stoppes før jobb-lageret');
assert.strictEqual(result.reason, 'life_position_not_job');
assert.strictEqual(pushed.length, 0);

result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Kurator',threshold:85,points_at_offer:85});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Kurator',threshold:85,points_at_offer:85});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Formidler',threshold:15,points_at_offer:15});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Formidler',threshold:15,points_at_offer:15});
assert.strictEqual(result.ok, true);

qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Senior konservator',threshold:190,points_at_offer:190});
assert.strictEqual(result.ok, false, 'Senior konservator skal også kreve konkret utnevnelse');
qualifications.add('employer_appointment');
result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Senior konservator',threshold:190,points_at_offer:190});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Museumsdirektør',threshold:500,points_at_offer:500});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'kunst',title:'Museumsdirektør',threshold:500,points_at_offer:500});
assert.strictEqual(result.ok, true);

activePosition = {career_id:'kunst',title:'Vertskap (museum/galleri)',threshold:5};
assert.strictEqual(sandbox.window.calculateWeeklySalary(artCareer, 13), 4);
activePosition = {career_id:'kunst',title:'Kurator',threshold:85};
assert.strictEqual(sandbox.window.calculateWeeklySalary(artCareer, 13), 7);
activePosition = {career_id:'kunst',title:'Museumsdirektør',threshold:500};
assert.strictEqual(sandbox.window.calculateWeeklySalary(artCareer, 13), 13);

console.log('civication Kunst life-career split ok: 1 pure practice tier + 1 gated curator unlock / 12 badge job tiers / 6 work worlds');
