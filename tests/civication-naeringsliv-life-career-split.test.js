#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const rawBadge = readJson('data/badges/naeringsliv.json');
const overlayIndex = readJson('data/Civication/badgeCareerContracts/index.json');
const overlay = readJson('data/Civication/badgeCareerContracts/naeringsliv.json');
const evidence = readJson('data/Civication/naeringslivCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const businessCareer = careers.find((career) => career.career_id === 'naeringsliv');

const expectedTiers = [
  ['Ekspeditør / butikkmedarbeider',5],['Renholder',8],['Lager- og driftsmedarbeider',10],['Økonomi- og administrasjonsmedarbeider',15],
  ['Fagarbeider',25],['Skiftleder',40],['Formann / arbeidsleder',60],['Controller',85],['Avdelingsleder',115],['Driftsleder',150],
  ['Finansanalytiker',190],['Produksjonsleder',240],['Butikksjef / enhetsleder',300],['Økonomi- og finanssjef',380],['Daglig leder',500],
  ['Finansdirektør',650],['Gründer',800],['Bedriftseier',1000],['Konserndirektør',1250],['Konsernsjef',1550],['Investor',1900],
  ['Kapitalforvalter',2300],['Industribygger',2750],['Industrieier',3250]
];

const pureLife = ['Gründer','Bedriftseier','Investor','Industribygger','Industrieier'];

const jobs = [
  ['Ekspeditør / butikkmedarbeider',1,'direct',[],'naeringsliv_handel_og_kundeservice','ekspeditor'],
  ['Renholder',1,'direct',[],'naeringsliv_renhold_og_hygiene','renholder'],
  ['Lager- og driftsmedarbeider',1,'direct',[],'naeringsliv_logistikk_og_drift','lager_og_driftsmedarbeider'],
  ['Økonomi- og administrasjonsmedarbeider',1,'direct',[],'naeringsliv_administrasjon_og_okonomistyring','administrasjonsmedarbeider'],
  ['Fagarbeider',1,'qualification_required',['relevant_education_or_employer_qualification'],'naeringsliv_fag_og_produksjon','fagarbeider'],
  ['Skiftleder',1,'appointment_required',['employer_appointment'],'naeringsliv_operativ_ledelse','formann'],
  ['Formann / arbeidsleder',2,'appointment_required',['employer_appointment'],'naeringsliv_operativ_ledelse','formann'],
  ['Controller',2,'qualification_required',['relevant_education_or_employer_qualification'],'naeringsliv_administrasjon_og_okonomistyring','controller'],
  ['Avdelingsleder',2,'appointment_required',['employer_appointment'],'naeringsliv_operativ_ledelse','avdelingsleder'],
  ['Driftsleder',2,'appointment_required',['employer_appointment'],'naeringsliv_operativ_ledelse','avdelingsleder'],
  ['Finansanalytiker',2,'qualification_required',['relevant_education_or_employer_qualification'],'naeringsliv_finans_og_kapitalforvaltning','controller'],
  ['Produksjonsleder',2,'appointment_required',['employer_appointment'],'naeringsliv_operativ_ledelse','avdelingsleder'],
  ['Butikksjef / enhetsleder',2,'appointment_required',['employer_appointment'],'naeringsliv_operativ_ledelse','avdelingsleder'],
  ['Økonomi- og finanssjef',3,'appointment_required',['employer_appointment'],'naeringsliv_finansiell_ledelse','controller'],
  ['Daglig leder',3,'appointment_required',['employer_appointment'],'naeringsliv_virksomhetsledelse','avdelingsleder'],
  ['Finansdirektør',3,'appointment_required',['employer_appointment'],'naeringsliv_finansiell_ledelse','controller'],
  ['Konserndirektør',3,'appointment_required',['employer_appointment'],'naeringsliv_virksomhetsledelse','mellomleder'],
  ['Konsernsjef',3,'appointment_required',['employer_appointment'],'naeringsliv_virksomhetsledelse','mellomleder'],
  ['Kapitalforvalter',3,'qualification_required',['relevant_education_or_employer_qualification'],'naeringsliv_finans_og_kapitalforvaltning','mellomleder']
];

assert.strictEqual(rawBadge.id, 'naeringsliv');
assert.deepStrictEqual(rawBadge.tiers.map((tier) => [tier.label, tier.threshold]), expectedTiers,
  'Næringsliv-oppryddingen skal aldri endre canonical tiernavn eller poenggrenser');
assert.ok(rawBadge.tiers.every((tier) => !tier.life_position && !tier.career_offer && !tier.career_unlock),
  'career metadata skal ligge i Civication-overlayen, ikke i rå Badge-progresjon');

assert.ok(overlayIndex.files.includes('data/Civication/badgeCareerContracts/naeringsliv.json'));
assert.strictEqual(overlay.badge_id, 'naeringsliv');
assert.strictEqual(overlay.evidence_ref, 'data/Civication/naeringslivCareerLifeEvidence.json');
assert.deepStrictEqual(overlay.allowed_tier_patch_fields, ['life_position','career_offer','career_unlock']);
assert.deepStrictEqual(overlay.tiers.map((row) => row.label), expectedTiers.map(([label]) => label));

assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, pureLife);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_naeringsliv_bands_pc_per_week, {'1':7,'2':11,'3':16});
assert.ok(evidence.sources.length >= 10, 'Næringsliv-evidensen skal ha bredt, inspiserbart kildegrunnlag');
assert.strictEqual(Object.keys(evidence.canonical_decision.work_worlds).length, 9,
  'Næringsliv skal ha ni canonicale arbeidverdener');

const businessAudit = audit.badges.naeringsliv;
assert.strictEqual(businessAudit.length, 24);
assert.strictEqual(businessAudit.filter((row) => row[3] === 'review').length, 0, 'Næringsliv skal ikke ha review-gjeld');
assert.deepStrictEqual(businessAudit.find((row) => row[0] === 'Gründer'), ['Gründer','entrepreneurial_practice_and_self_employment','not_job','replace',[]]);
assert.deepStrictEqual(businessAudit.find((row) => row[0] === 'Investor'), ['Investor','capital_ownership_and_investment','not_job','replace',[]]);
assert.deepStrictEqual(businessAudit.find((row) => row[0] === 'Industribygger'), ['Industribygger','industrial_entrepreneurship_and_reputation','not_job','replace',[]]);
assert.deepStrictEqual(businessAudit.find((row) => row[0] === 'Industrieier'), ['Industrieier','industrial_ownership','not_job','replace',[]]);
assert.deepStrictEqual(businessAudit.find((row) => row[0] === 'Daglig leder'), ['Daglig leder','leadership_position','appointment_required','keep_with_gate',['employer_appointment']]);

assert.ok(businessCareer, 'Næringsliv mangler i hg_careers.json');
assert.deepStrictEqual(businessCareer.economy.salary_by_tier, {'1':7,'2':11,'3':16});

const materializedBadge = JSON.parse(JSON.stringify(rawBadge));
const meritsSource = fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');
assert.ok(/REQUIRED_BADGE_CAREER_CONTRACT_OVERLAYS\s*=\s*new Set\([^\n]*"naeringsliv"/.test(meritsSource),
  'Næringsliv-overlay skal være obligatorisk fail-closed');

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
    HG_CAREERS: [businessCareer],
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

assert.strictEqual(materializedBadge.career_life_evidence, 'data/Civication/naeringslivCareerLifeEvidence.json');

for (const label of pureLife) {
  const tier = materializedBadge.tiers.find((item) => item.label === label);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  const result = sandbox.window.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: label, threshold: tier.threshold });
  assert.strictEqual(result.ok, false, `${label}: eierskap/praksis må aldri bli fast jobb`);
  assert.strictEqual(result.reason, 'life_position_not_job');
  assert.strictEqual(Resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', title: label }), 'unknown',
    `${label}: skal ikke ha title-basert jobbscope`);
}
assert.strictEqual(pushed.length, 0);

for (const [title, salaryTier, policy, qualificationIds, contractScope, runtimeScope] of jobs) {
  const tier = materializedBadge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.career_offer.title, title);
  assert.strictEqual(tier.career_offer.salary_tier, salaryTier);
  assert.strictEqual(tier.career_offer.policy, policy);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier.career_offer.role_scope, contractScope, `${title}: feil canonical arbeidverden`);
  assert.strictEqual(Resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', title }), runtimeScope,
    `${title}: moden runtime-scope skal bevares til mail/Life Story-pakken migreres eksplisitt`);
}

let result = sandbox.window.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Ekspeditør / butikkmedarbeider', threshold: 5 });
assert.strictEqual(result.ok, true, 'butikkmedarbeider skal være direkte inngangsjobb');

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Fagarbeider', threshold: 25 });
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['relevant_education_or_employer_qualification']);
result = sandbox.window.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Fagarbeider', threshold: 25 });
assert.strictEqual(result.ok, true);

qualifications = new Set();
for (const title of ['Skiftleder','Daglig leder','Konsernsjef']) {
  const gate = sandbox.window.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title });
  assert.strictEqual(gate.ok, false, `${title}: arbeidsgiverutnevnelse må kreves`);
  assert.strictEqual(gate.reason, 'career_qualification_required');
}
qualifications = new Set(['employer_appointment']);
for (const title of ['Skiftleder','Daglig leder','Konsernsjef']) {
  assert.strictEqual(sandbox.window.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title }).ok, true,
    `${title}: eksplisitt arbeidsgiverutnevnelse skal åpne rollen`);
}

assert.throws(() => sandbox.window.applyBadgeCareerContractOverlay([JSON.parse(JSON.stringify(rawBadge))], {
  badge_id: 'naeringsliv',
  allowed_tier_patch_fields: ['life_position'],
  tiers: [{ label: 'Ikke en tier', life_position: { kind: 'x' } }]
}), /unknown_tier/);
assert.throws(() => sandbox.window.applyBadgeCareerContractOverlay([JSON.parse(JSON.stringify(rawBadge))], {
  badge_id: 'naeringsliv',
  allowed_tier_patch_fields: ['life_position'],
  tiers: [{ label: 'Gründer', threshold: 999 }]
}), /illegal_patch/);

for (const [scope, titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/naeringsliv/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/naeringsliv/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'naeringsliv');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.role_id, scope);
  assert.strictEqual(model.source?.evidence, 'data/Civication/naeringslivCareerLifeEvidence.json');
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok((model.competence_axes || []).length >= 6, `${scope}: kompetanseakser mangler`);
  assert.ok((model.ideal_type_problems || []).length >= 5, `${scope}: idealtypiske problemer mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 4, `${scope}: myndighetsgrenser mangler`);
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.category, 'naeringsliv');
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.task_families || []).length >= 5, `${scope}: arbeidsgrammatikk er for tynn`);
  assert.ok((grammar.work_loops || []).length >= 2, `${scope}: arbeidsløkker mangler`);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: minst fem praksiscase kreves`);
  assert.ok((grammar.quality_axes || []).length >= 6, `${scope}: kvalitetsakser mangler`);
  assert.ok((grammar.authority_boundary?.may_not || []).length >= 4, `${scope}: FWG-myndighetsgrense mangler`);
}

console.log('civication Næringsliv life-career split ok: 5 ownership/economic positions / 19 formal jobs / 9 contract work worlds / mature runtime scopes preserved');
