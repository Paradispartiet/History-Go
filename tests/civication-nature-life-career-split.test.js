#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const rawBadge = readJson('data/badges/natur.json');
const overlayIndex = readJson('data/Civication/badgeCareerContracts/index.json');
const overlay = readJson('data/Civication/badgeCareerContracts/natur.json');
const evidence = readJson('data/Civication/naturCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const natureCareer = careers.find((career) => career.career_id === 'natur');

const expectedTiers = [
  ['Naturinteressert',5],['Feltobservatør',10],['Artsobservatør',15],['Feltassistent',25],
  ['Naturveileder',40],['Naturforvalter',60],['Rådgiver (miljø/natur)',85],['Seniorrådgiver (miljø/natur)',115],
  ['Biolog',150],['Økolog',190],['Forsker (miljø/natur)',240],['Seniorforsker (miljø/natur)',300],
  ['Naturvernleder',380],['Miljøsjef',500],['Miljødirektør',650],['Statsråd (klima og miljø)',800]
];
const pureLife = ['Naturinteressert','Feltobservatør','Artsobservatør'];
const jobs = [
  ['Feltassistent',1,'direct',[],'natur_felt_og_formidling'],
  ['Naturveileder',1,'qualification_required',['relevant_education_or_employer_qualification'],'natur_felt_og_formidling'],
  ['Naturforvalter',2,'qualification_required',['relevant_education_or_employer_qualification'],'natur_forvaltning_og_radgivning'],
  ['Rådgiver (miljø/natur)',2,'qualification_required',['relevant_education_or_employer_qualification'],'natur_forvaltning_og_radgivning'],
  ['Seniorrådgiver (miljø/natur)',2,'qualification_required',['relevant_education_or_employer_qualification'],'natur_forvaltning_og_radgivning'],
  ['Biolog',2,'qualification_required',['relevant_education_or_employer_qualification'],'natur_biologi_og_forskning'],
  ['Økolog',2,'qualification_required',['relevant_education_or_employer_qualification'],'natur_biologi_og_forskning'],
  ['Forsker (miljø/natur)',2,'qualification_required',['academic_qualification_and_employment'],'natur_biologi_og_forskning'],
  ['Seniorforsker (miljø/natur)',3,'qualification_required',['academic_qualification_and_employment'],'natur_biologi_og_forskning'],
  ['Naturvernleder',3,'appointment_required',['employer_appointment'],'natur_miljoledelse'],
  ['Miljøsjef',3,'appointment_required',['employer_appointment'],'natur_miljoledelse'],
  ['Miljødirektør',3,'appointment_required',['employer_appointment'],'natur_miljoledelse'],
  ['Statsråd (klima og miljø)',3,'appointment_required',['public_office_appointment'],'natur_politisk_myndighet']
];

assert.strictEqual(rawBadge.id, 'natur');
assert.deepStrictEqual(rawBadge.tiers.map((tier) => [tier.label, tier.threshold]), expectedTiers,
  'Natur career-opprydding skal aldri endre canonical tiernavn eller poenggrenser');
assert.ok(Array.isArray(rawBadge.groups) && rawBadge.groups.length >= 4,
  'den store Natur-fagstrukturen skal bevares urørt');
assert.ok(rawBadge.tiers.every((tier) => !tier.life_position && !tier.career_offer && !tier.career_unlock),
  'career metadata skal ligge i Civication-overlayen');

assert.ok(overlayIndex.files.includes('data/Civication/badgeCareerContracts/natur.json'));
assert.strictEqual(overlay.badge_id, 'natur');
assert.strictEqual(overlay.evidence_ref, 'data/Civication/naturCareerLifeEvidence.json');
assert.deepStrictEqual(overlay.allowed_tier_patch_fields, ['life_position','career_offer','career_unlock']);
assert.deepStrictEqual(overlay.tiers.map((row) => row.label), expectedTiers.map(([label]) => label));
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, pureLife);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_natur_bands_pc_per_week, {'1':4,'2':7,'3':11});
assert.ok(evidence.sources.length >= 6);

const natureAudit = audit.badges.natur;
assert.strictEqual(natureAudit.length, 16);
assert.strictEqual(natureAudit.filter((row) => row[3] === 'review').length, 0);
assert.deepStrictEqual(natureAudit.find((row) => row[0] === 'Naturveileder'),
  ['Naturveileder','qualified_job','qualification_required','keep_with_gate',['relevant_education_or_employer_qualification']]);
assert.deepStrictEqual(natureAudit.find((row) => row[0] === 'Forsker (miljø/natur)'),
  ['Forsker (miljø/natur)','academic_position','qualification_required','keep_with_gate',['academic_qualification_and_employment']]);
assert.deepStrictEqual(natureAudit.find((row) => row[0] === 'Statsråd (klima og miljø)'),
  ['Statsråd (klima og miljø)','appointed_public_office','appointment_required','keep_with_gate',['public_office_appointment']]);

// Stale metadata from already completed splits must not return.
assert.deepStrictEqual(audit.badges.religion.find((row) => row[0] === 'Feltarbeider'), ['Feltarbeider','fieldwork_practice','not_job','replace',[]]);
assert.deepStrictEqual(audit.badges.media.find((row) => row[0] === 'Frilansjournalist'), ['Frilansjournalist','freelance_professional_practice','not_job','replace',[]]);
assert.deepStrictEqual(audit.badges.sport.find((row) => row[0] === 'Eliteseriespiller'), ['Eliteseriespiller','competition_status','not_job','replace',[]]);

assert.ok(natureCareer);
assert.deepStrictEqual(natureCareer.economy.salary_by_tier, {'1':4,'2':7,'3':11});

const meritsSource = fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');
const shellBootSource = fs.readFileSync(path.join(ROOT, 'js/Civication/CivicationShellBoot.js'), 'utf8');
const matrixSource = fs.readFileSync(path.join(ROOT, 'scripts/civication-badge-career-matrix.mjs'), 'utf8');

// The required-overlay set is intentionally extensible: adding a later Badge
// must never make Nature's regression depend on the exact array literal.
assert.ok(/REQUIRED_BADGE_CAREER_CONTRACT_OVERLAYS\s*=\s*new Set\([^\n]*"natur"/.test(meritsSource),
  'Natur-overlay skal fortsatt være obligatorisk fail-closed');
assert.ok(meritsSource.includes('failClosedRequiredBadgeCareerContracts'));
assert.ok(shellBootSource.includes('await window.ensureBadgeCareerContractsApplied();'));
assert.ok(matrixSource.includes('data/Civication/badgeCareerContracts/index.json'));

const materializedBadge = JSON.parse(JSON.stringify(rawBadge));
const pushed = [];
let qualifications = new Set();
const sandbox = {
  console,
  setTimeout: () => 0,
  clearTimeout: () => {},
  fetch: async () => ({ ok: true, json: async () => ({ files: [] }) }),
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  Event: function Event(type) { this.type = type; },
  showToast: () => {},
  pulseBadge: () => {},
  catIdFromDisplay: (value) => value,
  deriveTierFromPoints: () => ({ tierIndex: 0 }),
  module: { exports: {} },
  exports: {},
  window: {
    BADGES: [materializedBadge],
    HG_CAREERS: [natureCareer],
    CivicationJobs: {
      pushOffer(offer) { pushed.push(offer); return { ok: true, offer }; },
      canReceiveNewOffers: () => true,
      getOffers: () => []
    },
    CivicationQualifications: { hasAll(ids) { return ids.every((id) => qualifications.has(id)); } },
    CivicationState: { getActivePosition: () => null },
    dispatchEvent: () => {}
  }
};
sandbox.window.window = sandbox.window;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(meritsSource, sandbox, { filename: 'merits-and-jobs.js' });
sandbox.window.applyBadgeCareerContractOverlay(sandbox.window.BADGES, overlay);
vm.runInContext(guardSource, sandbox, { filename: 'civicationCareerRealityGuard.js' });

for (const label of pureLife) {
  const tier = materializedBadge.tiers.find((item) => item.label === label);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  const result = sandbox.window.CivicationJobs.pushOffer({ career_id: 'natur', title: label, threshold: tier.threshold });
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0);

for (const [title, salaryTier, policy, qualificationIds, scope] of jobs) {
  const tier = materializedBadge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.career_offer.title, title);
  assert.strictEqual(tier.career_offer.salary_tier, salaryTier);
  assert.strictEqual(tier.career_offer.policy, policy);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier.career_offer.role_scope, scope);
  assert.strictEqual(Resolver.resolveCareerRoleScope({ career_id: 'natur', title }), scope);
}

let result = sandbox.window.CivicationJobs.pushOffer({ career_id: 'natur', title: 'Feltassistent', threshold: 25 });
assert.strictEqual(result.ok, true);
result = sandbox.window.CivicationJobs.pushOffer({ career_id: 'natur', title: 'Biolog', threshold: 150 });
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
assert.strictEqual(sandbox.window.CivicationJobs.pushOffer({ career_id: 'natur', title: 'Biolog', threshold: 150 }).ok, true);
qualifications = new Set(['employer_appointment']);
assert.strictEqual(sandbox.window.CivicationJobs.pushOffer({ career_id: 'natur', title: 'Miljødirektør', threshold: 650 }).ok, true);
assert.strictEqual(sandbox.window.CivicationJobs.pushOffer({ career_id: 'natur', title: 'Statsråd (klima og miljø)', threshold: 800 }).ok, false);
qualifications = new Set(['public_office_appointment']);
assert.strictEqual(sandbox.window.CivicationJobs.pushOffer({ career_id: 'natur', title: 'Statsråd (klima og miljø)', threshold: 800 }).ok, true);

for (const [scope, titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/natur/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/natur/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'natur');
  assert.strictEqual(model.role_scope, scope);
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok((model.competence_axes || []).length >= 6);
  assert.ok((model.ideal_type_problems || []).length >= 5);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 4);
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding.badge_titles, titles);
  assert.ok((grammar.task_families || []).length >= 5);
  assert.ok((grammar.work_loops || []).length >= 2);
  assert.ok((grammar.practice_stories || []).length >= 5);
  assert.ok((grammar.quality_axes || []).length >= 6);
  assert.ok((grammar.authority_boundary?.may_not || []).length >= 3);
}

console.log('civication nature life-career split ok: extensible required-overlay contract preserved');
