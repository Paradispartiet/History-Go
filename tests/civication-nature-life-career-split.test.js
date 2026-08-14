#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const rawBadge = readJson('data/badges/natur.json');
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
assert.deepStrictEqual(rawBadge.tiers.map((tier) => [tier.label,tier.threshold]), expectedTiers,
  'Natur career-opprydding skal aldri endre canonical tiernavn eller poenggrenser');
assert.ok(Array.isArray(rawBadge.groups) && rawBadge.groups.length >= 4,
  'den store Natur-fagstrukturen skal bevares urørt');
assert.ok(rawBadge.tiers.every((tier) => !tier.life_position && !tier.career_offer && !tier.career_unlock),
  'career metadata skal ligge i den validerte Civication-overlayen, ikke blåse opp Natur-fagfilen');

assert.strictEqual(overlay.badge_id, 'natur');
assert.strictEqual(overlay.evidence_ref, 'data/Civication/naturCareerLifeEvidence.json');
assert.deepStrictEqual(overlay.tiers.map((row) => row.label), expectedTiers.map(([label]) => label));
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, pureLife);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_natur_bands_pc_per_week, {'1':4,'2':7,'3':11});
assert.ok(evidence.sources.length >= 6, 'Natur-evidensen skal ha et bredt, inspiserbart kildegrunnlag');

const natureAudit = audit.badges.natur;
assert.strictEqual(natureAudit.length, 16);
assert.strictEqual(natureAudit.filter((row) => row[3] === 'review').length, 0, 'Natur skal ikke ha review-gjeld');
assert.deepStrictEqual(natureAudit.find((row) => row[0] === 'Naturveileder'),
  ['Naturveileder','qualified_job','qualification_required','keep_with_gate',['relevant_education_or_employer_qualification']]);
assert.deepStrictEqual(natureAudit.find((row) => row[0] === 'Forsker (miljø/natur)'),
  ['Forsker (miljø/natur)','academic_position','qualification_required','keep_with_gate',['academic_qualification_and_employment']]);
assert.deepStrictEqual(natureAudit.find((row) => row[0] === 'Statsråd (klima og miljø)'),
  ['Statsråd (klima og miljø)','appointed_public_office','appointment_required','keep_with_gate',['public_office_appointment']]);

// Stale metadata fra allerede ferdige splitt skal ikke komme tilbake.
assert.deepStrictEqual(audit.badges.religion.find((row) => row[0] === 'Feltarbeider'), ['Feltarbeider','fieldwork_practice','not_job','replace',[]]);
assert.deepStrictEqual(audit.badges.media.find((row) => row[0] === 'Frilansjournalist'), ['Frilansjournalist','freelance_professional_practice','not_job','replace',[]]);
assert.deepStrictEqual(audit.badges.media.find((row) => row[0] === 'Redaktør'), ['Redaktør','leadership_position','appointment_required','keep_with_gate',['employer_appointment']]);
assert.deepStrictEqual(audit.badges.sport.find((row) => row[0] === 'Eliteseriespiller'), ['Eliteseriespiller','competition_status','not_job','replace',[]]);
assert.deepStrictEqual(audit.badges.sport.find((row) => row[0] === 'Profesjonell utøver'), ['Profesjonell utøver','professional_practice','not_job','replace',[]]);

assert.ok(natureCareer, 'Natur mangler i hg_careers.json');
assert.deepStrictEqual(natureCareer.economy.salary_by_tier, {'1':4,'2':7,'3':11});

const meritsSource = fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');
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
  showToast: () => {}, pulseBadge: () => {}, catIdFromDisplay: (value) => value,
  deriveTierFromPoints: () => ({ tierIndex: 0 }),
  module: { exports: {} }, exports: {},
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

assert.strictEqual(materializedBadge.career_life_evidence, 'data/Civication/naturCareerLifeEvidence.json');
for (const label of pureLife) {
  const tier = materializedBadge.tiers.find((item) => item.label === label);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  const result = sandbox.window.CivicationJobs.pushOffer({career_id:'natur', title:label, threshold:tier.threshold});
  assert.strictEqual(result.ok, false, `${label}: life position må aldri bli jobb`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0);

for (const [title,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = materializedBadge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.career_offer.title, title);
  assert.strictEqual(tier.career_offer.salary_tier, salaryTier);
  assert.strictEqual(tier.career_offer.policy, policy);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier.career_offer.role_scope, scope);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'natur', title}), scope, `${title}: feil role_scope`);
}

let result = sandbox.window.CivicationJobs.pushOffer({career_id:'natur', title:'Feltassistent', threshold:25});
assert.strictEqual(result.ok, true, 'Feltassistent er den direkte Natur-inngangsjobben');
result = sandbox.window.CivicationJobs.pushOffer({career_id:'natur', title:'Biolog', threshold:150});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'natur', title:'Biolog', threshold:150});
assert.strictEqual(result.ok, true);
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'natur', title:'Miljødirektør', threshold:650});
assert.strictEqual(result.ok, true);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'natur', title:'Statsråd (klima og miljø)', threshold:800});
assert.strictEqual(result.ok, false, 'arbeidsgiverutnevnelse er ikke nok for statsråd');
qualifications = new Set(['public_office_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'natur', title:'Statsråd (klima og miljø)', threshold:800});
assert.strictEqual(result.ok, true);

assert.throws(() => sandbox.window.applyBadgeCareerContractOverlay([JSON.parse(JSON.stringify(rawBadge))], {
  badge_id:'natur', allowed_tier_patch_fields:['life_position'], tiers:[{label:'Ikke en tier', life_position:{kind:'x'}}]
}), /unknown_tier/, 'overlay skal fail-closed på ukjent tittel');
assert.throws(() => sandbox.window.applyBadgeCareerContractOverlay([JSON.parse(JSON.stringify(rawBadge))], {
  badge_id:'natur', allowed_tier_patch_fields:['life_position'], tiers:[{label:'Naturinteressert', threshold:999}]
}), /illegal_patch/, 'overlay skal aldri kunne endre threshold');

for (const [scope,titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/natur/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/natur/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'natur');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.role_id, scope);
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok((model.authority_boundary?.may_not || []).length >= 2, `${scope}: myndighetsgrense mangler`);
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding.badge_titles, titles);
  assert.ok((grammar.task_families || []).length >= 4, `${scope}: arbeidsgrammatikk er for tynn`);
  assert.ok((grammar.authority_boundary?.may_not || []).length >= 2, `${scope}: FWG-myndighetsgrense mangler`);
}

console.log('civication nature life-career split ok: 3 life/practice tiers / 13 formal jobs / 5 work worlds / overlay fail-closed');
