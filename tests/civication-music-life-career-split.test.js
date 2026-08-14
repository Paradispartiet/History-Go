#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/musikk.json');
const evidence = readJson('data/Civication/musikkCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const musicCareer = careers.find((career) => career.career_id === 'musikk');

const pureLife = ['Publikum / deltaker','Frilansmusiker','Solist','Artist','Etablert artist','Plateartist','Headliner','Stjerneartist','Popstjerne'];
const jobs = [
  ['Sceneassistent',1,'direct',[],'musikk_scene_og_produksjon'],
  ['Produksjonsassistent',1,'direct',[],'musikk_scene_og_produksjon'],
  ['Tekniker (lys/lyd)',2,'direct',[],'musikk_scene_og_produksjon'],
  ['Produksjonskoordinator',2,'direct',[],'musikk_scene_og_produksjon'],
  ['Fast musiker (band/ensemble)',2,'appointment_required',['employer_appointment'],'musikk_utoving_og_ensemble']
];

assert.strictEqual(badge.id, 'musikk');
assert.strictEqual(badge.tiers.length, 15);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/musikkCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, pureLife);
assert.deepStrictEqual(evidence.canonical_decision.life_with_separate_career_unlock, ['Utøvende musiker']);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_musikk_bands_pc_per_week, {'1':4,'2':8,'3':20});
assert.strictEqual(evidence.salary_mapping.tier_3_reserved_for_future_formal_high_responsibility_role, true);
assert.ok(Array.isArray(evidence.sources) && evidence.sources.length >= 4);

const musicAudit = audit.badges.musikk;
assert.ok(Array.isArray(musicAudit) && musicAudit.length === 15);
assert.strictEqual(musicAudit.filter((row) => row[3] === 'review').length, 0, 'Musikk skal ikke ha review-gjeld');
assert.deepStrictEqual(musicAudit.find((row) => row[0] === 'Plateartist'), ['Plateartist','recording_artist_status','not_job','replace',[]]);
assert.deepStrictEqual(musicAudit.find((row) => row[0] === 'Frilansmusiker'), ['Frilansmusiker','freelance_livelihood','not_job','replace',[]]);

for (const label of pureLife) {
  const tier = badge.tiers.find((item) => item.label === label);
  assert.ok(tier?.life_position, `${label}: life_position mangler`);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
}

const performerTier = badge.tiers.find((tier) => tier.label === 'Utøvende musiker');
assert.strictEqual(performerTier.life_position.employment_independent, true);
assert.strictEqual(performerTier.career_offer, undefined);
assert.deepStrictEqual(performerTier.career_unlock, {
  title:'Utøvende musiker', policy:'appointment_required', qualification_ids:['employer_appointment'], salary_tier:2, role_scope:'musikk_utoving_og_ensemble'
});
assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'musikk', title:'Utøvende musiker'}), 'musikk_utoving_og_ensemble');

assert.ok(musicCareer, 'Musikk mangler i hg_careers.json');
assert.deepStrictEqual(musicCareer.economy.salary_by_tier, {'1':4,'2':8,'3':20});

for (const [title, salaryTier, policy, qualificationIds, scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier?.career_offer?.title, title);
  assert.strictEqual(tier?.career_offer?.salary_tier, salaryTier);
  assert.strictEqual(tier?.career_offer?.policy, policy);
  assert.deepStrictEqual(tier?.career_offer?.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier?.career_offer?.role_scope, scope);
  assert.strictEqual(tier?.life_position, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'musikk', title}), scope, `${title}: feil role_scope`);
}

for (const [scope,titles] of [
  ['musikk_scene_og_produksjon',['Sceneassistent','Produksjonsassistent','Tekniker (lys/lyd)','Produksjonskoordinator']],
  ['musikk_utoving_og_ensemble',['Utøvende musiker','Fast musiker (band/ensemble)']]
]) {
  const sharedModel = readJson(`data/Civication/roleModels/musikk/${scope}.json`);
  assert.strictEqual(sharedModel.version, 2);
  assert.strictEqual(sharedModel.category, 'musikk');
  assert.strictEqual(sharedModel.role_scope, scope);
  assert.strictEqual(sharedModel.source?.evidence, 'data/Civication/musikkCareerLifeEvidence.json');
  assert.ok((sharedModel.competence_axes || []).length >= 5, `${scope}: kompetanseakser mangler`);
  assert.ok((sharedModel.authority_boundaries?.cannot || []).length >= 3, `${scope}: myndighetsgrenser mangler`);

  const grammar = readJson(`data/Civication/workGrammars/musikk/${scope}.json`);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: minst fem praksisfortellinger kreves`);
  assert.ok((grammar.quality_axes || []).length >= 6, `${scope}: kvalitetsakser mangler`);
}

for (const [file, scope] of [
  ['sceneassistent','musikk_scene_og_produksjon'],
  ['produksjonsassistent','musikk_scene_og_produksjon'],
  ['tekniker_lys_lyd','musikk_scene_og_produksjon'],
  ['produksjonskoordinator','musikk_scene_og_produksjon'],
  ['utovende_musiker','musikk_utoving_og_ensemble'],
  ['fast_musiker_band_ensemble','musikk_utoving_og_ensemble']
]) {
  const model = readJson(`data/Civication/roleModels/musikk/${file}.json`);
  assert.strictEqual(model.version, 2, `${file}: role model må være v2`);
  assert.strictEqual(model.role_scope, scope);
  assert.ok((model.competence_axes || []).length >= 5);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 3);
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
    HG_CAREERS: [musicCareer],
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

for (const label of pureLife) {
  const tier = badge.tiers.find((item) => item.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({career_id:'musikk', title:label, threshold:tier.threshold, points_at_offer:9999});
  assert.strictEqual(result.ok, false, `${label}: life_position må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0, 'ingen rene Musikk-life positions skal bli jobb');

let result = sandbox.window.CivicationJobs.pushOffer({career_id:'musikk', title:'Utøvende musiker', threshold:60, points_at_offer:60});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'musikk', title:'Utøvende musiker', threshold:60, points_at_offer:60});
assert.strictEqual(result.ok, true);

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({career_id:'musikk', title:'Fast musiker (band/ensemble)', threshold:115, points_at_offer:115});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'musikk', title:'Fast musiker (band/ensemble)', threshold:115, points_at_offer:115});
assert.strictEqual(result.ok, true);

activePosition = {career_id:'musikk', title:'Sceneassistent', threshold:10};
assert.strictEqual(sandbox.window.calculateWeeklySalary(musicCareer, 14), 4);
activePosition = {career_id:'musikk', title:'Tekniker (lys/lyd)', threshold:25};
assert.strictEqual(sandbox.window.calculateWeeklySalary(musicCareer, 14), 8);
activePosition = {career_id:'musikk', title:'Utøvende musiker', threshold:60};
assert.strictEqual(sandbox.window.calculateWeeklySalary(musicCareer, 14), 8);
activePosition = {career_id:'musikk', title:'Fast musiker (band/ensemble)', threshold:115};
assert.strictEqual(sandbox.window.calculateWeeklySalary(musicCareer, 14), 8);

console.log('civication music life-career split ok: 10 life/practice/status tiers / 5 badge job tiers + 1 gated performer unlock / 2 work worlds');
