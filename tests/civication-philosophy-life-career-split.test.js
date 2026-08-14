#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/filosofi.json');
const evidence = readJson('data/Civication/filosofiCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const filosofiCareer = careers.find((career) => career.career_id === 'filosofi');

const expectedTiers = [
  ['Nysgjerrig',5],['Spørrer',10],['Samtalepartner',15],['Argumentbygger',25],['Filosofistudent',40],
  ['Idéhistoriker',60],['Etiker',85],['Logiker',115],['Filosof',150],['Fagfilosof',190],
  ['Foreleser',240],['Professor',300],['Filosofisk veileder',380]
];
const life = ['Nysgjerrig','Spørrer','Samtalepartner','Argumentbygger','Filosofistudent','Etiker','Logiker','Fagfilosof','Filosofisk veileder'];
const jobs = [
  ['Idéhistoriker',2,'qualification_required',['relevant_education_or_employer_qualification'],'filosofi_forskning_og_formidling'],
  ['Filosof',2,'qualification_required',['relevant_education_or_employer_qualification'],'filosofi_forskning_og_formidling'],
  ['Foreleser',2,'appointment_required',['employer_appointment'],'filosofi_undervisning_og_akademia'],
  ['Professor',3,'qualification_required',['academic_qualification_and_employment'],'filosofi_undervisning_og_akademia']
];
const expectedAudit = [
  ['Nysgjerrig','game_rank_or_interest_status','not_job','replace',[]],
  ['Spørrer','inquiry_practice','not_job','replace',[]],
  ['Samtalepartner','dialogue_practice','not_job','replace',[]],
  ['Argumentbygger','argumentation_practice','not_job','replace',[]],
  ['Filosofistudent','learning_stage','not_job','replace',[]],
  ['Idéhistoriker','qualified_profession','qualification_required','keep_with_gate',['relevant_education_or_employer_qualification']],
  ['Etiker','specialization_identity','not_job','replace',[]],
  ['Logiker','specialization_identity','not_job','replace',[]],
  ['Filosof','qualified_profession','qualification_required','keep_with_gate',['relevant_education_or_employer_qualification']],
  ['Fagfilosof','professional_field_identity','not_job','replace',[]],
  ['Foreleser','teaching_position','appointment_required','keep_with_gate',['employer_appointment']],
  ['Professor','academic_position','qualification_required','keep_with_gate',['academic_qualification_and_employment']],
  ['Filosofisk veileder','professional_practice','not_job','replace',[]]
];

assert.strictEqual(badge.id, 'filosofi');
assert.strictEqual(badge.tiers.length, 13);
assert.deepStrictEqual(badge.tiers.map((tier) => [tier.label,tier.threshold]), expectedTiers);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/filosofiCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, life);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_filosofi_bands_pc_per_week, {'1':5,'2':8,'3':14});
assert.ok(Array.isArray(evidence.sources) && evidence.sources.length >= 4);
assert.deepStrictEqual(audit.badges.filosofi, expectedAudit);
assert.ok(!audit.badges.filosofi.some((row) => row[2] === 'review_required' || row[3] === 'review'), 'Filosofi skal ikke ha åpne review-rader');

for (const label of life) {
  const tier = badge.tiers.find((item) => item.label === label);
  assert.ok(tier?.life_position, `${label}: life_position mangler`);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
  assert.ok(evidence.salary_mapping.not_salary_jobs.includes(label), `${label}: må være uten fast Badge-lønn`);
}
assert.strictEqual(badge.tiers.find((tier) => tier.label === 'Filosofistudent').life_position.kind, 'learning_stage');
assert.strictEqual(badge.tiers.find((tier) => tier.label === 'Etiker').life_position.kind, 'ethics_specialization');
assert.strictEqual(badge.tiers.find((tier) => tier.label === 'Logiker').life_position.kind, 'logic_specialization');
assert.strictEqual(badge.tiers.find((tier) => tier.label === 'Filosofisk veileder').life_position.kind, 'philosophical_practice');

assert.ok(filosofiCareer, 'Filosofi mangler i hg_careers.json');
assert.deepStrictEqual(filosofiCareer.economy.salary_by_tier, {'1':5,'2':8,'3':14});

for (const [title, salaryTier, policy, qualificationIds, scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier?.career_offer?.title, title);
  assert.strictEqual(tier?.career_offer?.salary_tier, salaryTier);
  assert.strictEqual(tier?.career_offer?.policy, policy);
  assert.deepStrictEqual(tier?.career_offer?.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier?.career_offer?.role_scope, scope);
  assert.strictEqual(tier?.life_position, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'filosofi', title}), scope, `${title}: feil role_scope`);
}

for (const [scope,titles,thresholds] of [
  ['filosofi_forskning_og_formidling',['Idéhistoriker','Filosof'],[60,150]],
  ['filosofi_undervisning_og_akademia',['Foreleser','Professor'],[240,300]]
]) {
  const model = readJson(`data/Civication/roleModels/filosofi/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'filosofi');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.source?.badge_file, 'data/badges/filosofi.json');
  assert.strictEqual(model.source?.evidence, 'data/Civication/filosofiCareerLifeEvidence.json');
  assert.ok((model.competence_axes || []).length >= 5, `${scope}: kompetanseakser mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 3, `${scope}: myndighetsgrenser mangler`);
  assert.ok((model.ideal_type_problems || []).length >= 3, `${scope}: idealtypeproblemer mangler`);

  const grammar = readJson(`data/Civication/workGrammars/filosofi/${scope}.json`);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.deepStrictEqual(grammar.badge_binding?.tier_thresholds, thresholds);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: minst fem praksisfortellinger kreves`);
  assert.ok((grammar.quality_axes || []).length >= 6, `${scope}: kvalitetsakser mangler`);
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
    HG_CAREERS: [filosofiCareer],
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
  const result = sandbox.window.CivicationJobs.pushOffer({career_id:'filosofi', title:label, threshold:tier.threshold, points_at_offer:9999});
  assert.strictEqual(result.ok, false, `${label}: life_position må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0, 'ingen Filosofi-life_position skal bli jobb');

function expectGate(title, threshold, qualificationId) {
  qualifications = new Set();
  let result = sandbox.window.CivicationJobs.pushOffer({career_id:'filosofi', title, threshold, points_at_offer:threshold});
  assert.strictEqual(result.ok, false, `${title}: skal feile lukket uten kvalifikasjon/utnevnelse`);
  assert.strictEqual(result.reason, 'career_qualification_required');
  qualifications = new Set([qualificationId]);
  result = sandbox.window.CivicationJobs.pushOffer({career_id:'filosofi', title, threshold, points_at_offer:threshold});
  assert.strictEqual(result.ok, true, `${title}: skal åpne med riktig gate`);
}
expectGate('Idéhistoriker',60,'relevant_education_or_employer_qualification');
expectGate('Filosof',150,'relevant_education_or_employer_qualification');
expectGate('Foreleser',240,'employer_appointment');
expectGate('Professor',300,'academic_qualification_and_employment');

activePosition = {career_id:'filosofi', title:'Idéhistoriker', threshold:60};
assert.strictEqual(sandbox.window.calculateWeeklySalary(filosofiCareer, 12), 8);
activePosition = {career_id:'filosofi', title:'Filosof', threshold:150};
assert.strictEqual(sandbox.window.calculateWeeklySalary(filosofiCareer, 12), 8);
activePosition = {career_id:'filosofi', title:'Foreleser', threshold:240};
assert.strictEqual(sandbox.window.calculateWeeklySalary(filosofiCareer, 12), 8);
activePosition = {career_id:'filosofi', title:'Professor', threshold:300};
assert.strictEqual(sandbox.window.calculateWeeklySalary(filosofiCareer, 12), 14);

console.log('civication philosophy life-career split ok: 9 life/practice positions / 4 formal jobs / 2 work worlds');
