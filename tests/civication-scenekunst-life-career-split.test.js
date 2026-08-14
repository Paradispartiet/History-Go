#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const badge = readJson('data/badges/scenekunst.json');
const evidence = readJson('data/Civication/scenekunstCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const scenekunstCareer = careers.find((career) => career.career_id === 'scenekunst');

const expectedTiers = [
  ['Publikum',5],['Scenevert',10],['Produksjonsassistent',15],['Scenetekniker',25],
  ['Inspisientassistent',40],['Utøver',60],['Skuespiller / danser',85],['Dramaturg',115],
  ['Regissør',150],['Koreograf',190],['Produsent',240],['Kunstnerisk leder',300],
  ['Teatersjef',380],['Scenekunstkurator',500]
];
const purePractice = ['Publikum','Utøver'];
const practiceUnlocks = [
  ['Skuespiller / danser',2,'scenekunst_utoving_og_ensemble'],
  ['Dramaturg',2,'scenekunst_dramaturgi_og_utvikling'],
  ['Regissør',2,'scenekunst_regi_og_koreografi'],
  ['Koreograf',2,'scenekunst_regi_og_koreografi'],
  ['Scenekunstkurator',3,'scenekunst_program_og_kuratering']
];
const jobs = [
  ['Scenevert',1,'direct',[],'scenekunst_scene_og_produksjon'],
  ['Produksjonsassistent',1,'direct',[],'scenekunst_scene_og_produksjon'],
  ['Scenetekniker',1,'qualification_required',['relevant_education_or_employer_qualification'],'scenekunst_scene_og_produksjon'],
  ['Inspisientassistent',1,'direct',[],'scenekunst_scene_og_produksjon'],
  ['Produsent',3,'direct',[],'scenekunst_scene_og_produksjon'],
  ['Kunstnerisk leder',3,'appointment_required',['employer_appointment'],'scenekunst_institusjonsledelse'],
  ['Teatersjef',3,'appointment_required',['employer_appointment'],'scenekunst_institusjonsledelse']
];

assert.strictEqual(badge.id, 'scenekunst');
assert.deepStrictEqual(
  badge.tiers.map((tier) => [tier.label,tier.threshold]),
  expectedTiers,
  'Scenekunst-oppryddingen skal aldri endre canonical tiernavn eller poenggrenser'
);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/scenekunstCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, purePractice);
assert.deepStrictEqual(evidence.canonical_decision.practice_tiers_with_formal_career_unlock, practiceUnlocks.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.strictEqual(evidence.canonical_decision.formal_job_opportunities.length, 12);
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_scenekunst_bands_pc_per_week, {'1':4,'2':8,'3':15});
assert.ok(evidence.sources.length >= 8, 'Scenekunst-evidensen skal være bred og inspiserbar');

assert.ok(scenekunstCareer, 'Canonical Scenekunst mangler i hg_careers.json');
assert.strictEqual(careers.some((career) => career.career_id === 'teater'), false,
  'Legacy teater career_id skal ikke fortsette som parallell økonomi');
assert.deepStrictEqual(scenekunstCareer.economy.salary_by_tier, {'1':4,'2':8,'3':15});
assert.strictEqual(scenekunstCareer.cross_requirements, undefined,
  'Gammelt litteraturkrav på tredje Badge-tier skal ikke aktiveres ved canonical migrasjon');

const scenekunstAudit = audit.badges.scenekunst;
assert.strictEqual(scenekunstAudit.length, 14);
assert.strictEqual(scenekunstAudit.filter((row) => row[3] === 'review').length, 0);
assert.deepStrictEqual(scenekunstAudit.find((row) => row[0] === 'Publikum'),
  ['Publikum','audience_status','not_job','replace',[]]);
assert.deepStrictEqual(scenekunstAudit.find((row) => row[0] === 'Utøver'),
  ['Utøver','artistic_practice','not_job','replace',[]]);
assert.deepStrictEqual(scenekunstAudit.find((row) => row[0] === 'Regissør'),
  ['Regissør','directing_practice_or_employment','not_job','replace',[]]);
assert.deepStrictEqual(scenekunstAudit.find((row) => row[0] === 'Scenetekniker'),
  ['Scenetekniker','qualified_technical_job','qualification_required','keep_with_gate',['relevant_education_or_employer_qualification']]);
assert.deepStrictEqual(scenekunstAudit.find((row) => row[0] === 'Teatersjef'),
  ['Teatersjef','leadership_position','appointment_required','keep_with_gate',['employer_appointment']]);

for (const label of purePractice) {
  const tier = badge.tiers.find((item) => item.label === label);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'scenekunst',title:label}), 'unknown');
}

for (const [title,salaryTier,scope] of practiceUnlocks) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.deepStrictEqual(tier.career_unlock, {
    title,
    policy:'appointment_required',
    qualification_ids:['employer_appointment'],
    salary_tier:salaryTier,
    role_scope:scope
  });
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'scenekunst',title}), 'unknown',
    `${title}: title-only praksis skal ikke se ut som jobb`);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'scenekunst',title,role_scope:scope}), scope,
    `${title}: eksplisitt formell posisjon skal bruke work-world scope`);
}

for (const [title,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.career_offer.title, title);
  assert.strictEqual(tier.career_offer.salary_tier, salaryTier);
  assert.strictEqual(tier.career_offer.policy, policy);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier.career_offer.role_scope, scope);
  assert.strictEqual(tier.life_position, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'scenekunst',title}), scope);
}

assert.strictEqual(
  Resolver.resolveCareerRoleScope({career_id:'teater',role_key:'regissor_teater',title:'Regissør'}),
  'scenekunst_regi_og_koreografi',
  'Legacy aktiv teaterposisjon skal kunne migreres til ny shared work world'
);
assert.strictEqual(
  Resolver.resolveCareerRoleScope({career_id:'teater',title:'Publikum'}),
  'unknown',
  'Legacy publikum må aldri bli jobb'
);

for (const [scope,titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/scenekunst/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/scenekunst/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'scenekunst');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.role_id, scope);
  assert.strictEqual(model.source?.evidence, 'data/Civication/scenekunstCareerLifeEvidence.json');
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok((model.competence_axes || []).length >= 6, `${scope}: kompetanseakser mangler`);
  assert.ok((model.ideal_type_problems || []).length >= 5, `${scope}: idealtypiske problemer mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 4, `${scope}: myndighetsgrenser mangler`);
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.category, 'scenekunst');
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
    HG_CAREERS: [scenekunstCareer],
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

for (const label of purePractice) {
  const tier = badge.tiers.find((item) => item.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({
    career_id:'scenekunst',title:label,threshold:tier.threshold,points_at_offer:9999
  });
  assert.strictEqual(result.ok, false, `${label}: praksis/status må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0);

let result = sandbox.window.CivicationJobs.pushOffer({
  career_id:'scenekunst',title:'Regissør',threshold:150,points_at_offer:150
});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({
  career_id:'scenekunst',title:'Regissør',threshold:150,points_at_offer:150
});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({
  career_id:'scenekunst',title:'Scenetekniker',threshold:25,points_at_offer:25
});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({
  career_id:'scenekunst',title:'Scenetekniker',threshold:25,points_at_offer:25
});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({
  career_id:'scenekunst',title:'Teatersjef',threshold:380,points_at_offer:380
});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({
  career_id:'scenekunst',title:'Teatersjef',threshold:380,points_at_offer:380
});
assert.strictEqual(result.ok, true);

activePosition = {career_id:'scenekunst',title:'Scenevert',threshold:10};
assert.strictEqual(sandbox.window.calculateWeeklySalary(scenekunstCareer, 13), 4);
activePosition = {career_id:'scenekunst',title:'Regissør',threshold:150,role_scope:'scenekunst_regi_og_koreografi'};
assert.strictEqual(sandbox.window.calculateWeeklySalary(scenekunstCareer, 13), 8);
activePosition = {career_id:'scenekunst',title:'Teatersjef',threshold:380};
assert.strictEqual(sandbox.window.calculateWeeklySalary(scenekunstCareer, 13), 15);

console.log('civication Scenekunst life-career split ok: 2 pure practice/status + 5 gated practice unlocks / 7 badge jobs / 6 work worlds / canonical economy');
